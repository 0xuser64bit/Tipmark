import {
  parseTipReceivedEvent,
  TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
  type TipReceivedEvent,
} from "@/clients/tipmark-protocol/src";
import {
  Connection,
  PublicKey,
  SystemProgram,
  type ParsedInstruction,
} from "@solana/web3.js";
import { getProtocolConfig } from "./config";
import { readWithRpcFailover } from "@/lib/solana/rpc";

export class TipReceiptVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TipReceiptVerificationError";
  }
}

export interface VerifiedTipReceipt {
  signature: string;
  event: TipReceivedEvent;
  blockTime: Date | null;
  status: "processed" | "confirmed" | "finalized";
}

function parseKey(value: string, label: string): PublicKey {
  try {
    return new PublicKey(value);
  } catch {
    throw new TipReceiptVerificationError(`Invalid ${label} address.`);
  }
}

function isTransfer(
  instruction: ParsedInstruction,
): instruction is ParsedInstruction & {
  parsed: {
    type: "transfer";
    info: { source: string; destination: string; lamports: number };
  };
} {
  return (
    instruction.programId.equals(SystemProgram.programId) &&
    instruction.program === "system" &&
    typeof instruction.parsed === "object" &&
    instruction.parsed !== null &&
    instruction.parsed.type === "transfer" &&
    typeof instruction.parsed.info?.source === "string" &&
    typeof instruction.parsed.info?.destination === "string" &&
    Number.isSafeInteger(instruction.parsed.info?.lamports) &&
    instruction.parsed.info.lamports > 0
  );
}

function decodeEventLogs(logs: readonly string[]): TipReceivedEvent[] {
  const events: TipReceivedEvent[] = [];
  for (const log of logs) {
    if (!log.startsWith("Program data: ")) continue;
    try {
      events.push(parseTipReceivedEvent(Buffer.from(log.slice(14), "base64")));
    } catch {
      // Other protocol events and user program logs are irrelevant here.
    }
  }
  return events;
}

export async function readTipReceipt(
  signature: string,
  connection?: Connection,
): Promise<VerifiedTipReceipt> {
  return readWithRpcFailover(
    (activeConnection) =>
      readTipReceiptFromConnection(signature, activeConnection),
    connection,
  );
}

async function readTipReceiptFromConnection(
  signature: string,
  connection: Connection,
): Promise<VerifiedTipReceipt> {
  if (!/^[1-9A-HJ-NP-Za-km-z]{80,90}$/.test(signature)) {
    throw new TipReceiptVerificationError("Invalid Solana signature.");
  }

  const transaction = await connection.getParsedTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  if (!transaction || !transaction.meta || transaction.meta.err) {
    throw new TipReceiptVerificationError("The Solana tip did not settle.");
  }
  if (!transaction.transaction.signatures.includes(signature)) {
    throw new TipReceiptVerificationError("The requested signature is absent.");
  }

  const programId = parseKey(
    getProtocolConfig().programAddress || TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
    "protocol program",
  );
  const events = decodeEventLogs(transaction.meta.logMessages || []);
  if (events.length !== 1) {
    throw new TipReceiptVerificationError(
      "The transaction does not contain exactly one TipReceived event.",
    );
  }
  const event = events[0];
  if (!event.profileOwner || !event.profile) {
    throw new TipReceiptVerificationError("The tip event is incomplete.");
  }

  const transfers = (transaction.meta.innerInstructions || [])
    .flatMap((group) => group.instructions)
    .filter(
      (instruction): instruction is ParsedInstruction =>
        "parsed" in instruction && isTransfer(instruction),
    );
  if (transfers.length !== 1) {
    throw new TipReceiptVerificationError(
      "The transaction does not contain exactly one payout transfer.",
    );
  }
  const transfer = transfers[0];
  const source = parseKey(transfer.parsed.info.source, "tip supporter");
  const destination = parseKey(
    transfer.parsed.info.destination,
    "payout wallet",
  );
  const signer = transaction.transaction.message.accountKeys.find((account) =>
    account.pubkey.equals(source),
  );
  if (!signer?.signer) {
    throw new TipReceiptVerificationError("The tip supporter did not sign.");
  }

  if (
    String(event.supporter) !== source.toBase58() ||
    String(event.payoutWallet) !== destination.toBase58() ||
    BigInt(transfer.parsed.info.lamports) !== event.amount ||
    !transaction.transaction.message.accountKeys.some((account) =>
      account.pubkey.equals(programId),
    )
  ) {
    throw new TipReceiptVerificationError(
      "The payout transfer does not match the TipReceived event.",
    );
  }

  const status = (await connection.getSignatureStatuses([signature])).value[0];
  if (status?.err) {
    throw new TipReceiptVerificationError("The Solana tip failed.");
  }

  return {
    signature,
    event,
    blockTime:
      transaction.blockTime == null
        ? null
        : new Date(transaction.blockTime * 1000),
    status: status?.confirmationStatus || "confirmed",
  };
}
