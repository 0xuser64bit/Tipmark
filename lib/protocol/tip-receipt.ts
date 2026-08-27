import {
  parseTipReceivedEvent,
  TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
  TIP_DISCRIMINATOR,
  getTipInstructionDataDecoder,
  type TipReceivedEvent,
} from "@/clients/tipmark-protocol/src";
import { getBase58Encoder } from "@solana/kit";
import {
  Connection,
  PublicKey,
  SystemProgram,
  type PartiallyDecodedInstruction,
  type ParsedInstruction,
  type ParsedTransactionWithMeta,
  type SignatureStatus,
} from "@solana/web3.js";
import { getProtocolConfig } from "./config";
import {
  NonRetryableRpcReadError,
  readWithRpcFailover,
} from "@/lib/solana/rpc";

export class TipReceiptVerificationError extends NonRetryableRpcReadError {
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

function copyBytes(value: {
  readonly [index: number]: number;
  readonly length?: number;
}): Uint8Array {
  const bytes = new Uint8Array(value.length ?? 0);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = value[index];
  }
  return bytes;
}

function bytesEqual(
  left: { readonly [index: number]: number; readonly length?: number },
  right: { readonly [index: number]: number; readonly length?: number },
): boolean {
  return Buffer.from(copyBytes(left)).equals(Buffer.from(copyBytes(right)));
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

function decodeProtocolEventLogs(
  logs: readonly string[],
  programId: PublicKey,
): TipReceivedEvent[] {
  const events: TipReceivedEvent[] = [];
  const stack: PublicKey[] = [];
  for (const log of logs) {
    const invoke = log.match(
      /^Program ([1-9A-HJ-NP-Za-km-z]{32,44}) invoke \[/,
    );
    if (invoke) {
      try {
        stack.push(new PublicKey(invoke[1]));
      } catch {
        stack.length = 0;
      }
      continue;
    }
    if (
      log.startsWith("Program ") &&
      (log.endsWith(" success") || log.includes(" failed:"))
    ) {
      stack.pop();
      continue;
    }
    if (!log.startsWith("Program data: ") || !stack.at(-1)?.equals(programId)) {
      continue;
    }
    try {
      events.push(parseTipReceivedEvent(Buffer.from(log.slice(14), "base64")));
    } catch {
      // Other protocol events and user program logs are irrelevant here.
    }
  }
  return events;
}

function isPartiallyDecodedInstruction(
  instruction: ParsedInstruction | PartiallyDecodedInstruction,
): instruction is PartiallyDecodedInstruction {
  return "accounts" in instruction && "data" in instruction;
}

function readTopLevelTip(
  transaction: NonNullable<
    Awaited<ReturnType<Connection["getParsedTransaction"]>>
  >,
  programId: PublicKey,
): {
  index: number;
  supporter: PublicKey;
  profile: PublicKey;
  payoutWallet: PublicKey;
  amount: bigint;
  reference: Uint8Array;
} {
  const candidates = transaction.transaction.message.instructions.flatMap(
    (instruction, index) => {
      if (
        !isPartiallyDecodedInstruction(instruction) ||
        !instruction.programId.equals(programId) ||
        instruction.accounts.length < 4
      ) {
        return [];
      }
      try {
        const data = getTipInstructionDataDecoder().decode(
          getBase58Encoder().encode(instruction.data),
        );
        if (
          !bytesEqual(data.discriminator, TIP_DISCRIMINATOR) ||
          !instruction.accounts[3].equals(SystemProgram.programId)
        ) {
          return [];
        }
        return [
          {
            index,
            supporter: instruction.accounts[0],
            profile: instruction.accounts[1],
            payoutWallet: instruction.accounts[2],
            amount: data.amount,
            reference: copyBytes(data.reference),
          },
        ];
      } catch {
        return [];
      }
    },
  );

  if (candidates.length !== 1) {
    throw new TipReceiptVerificationError(
      "The transaction does not contain exactly one protocol tip instruction.",
    );
  }
  return candidates[0];
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

/**
 * Verify many signatures in as few round trips as possible.
 *
 * Verification itself is unchanged and still per-transaction; only the fetching
 * is batched. Signatures that are not protocol tips are omitted rather than
 * raising: an address's history legitimately contains unrelated instructions,
 * and the caller wants the tips it can prove.
 */
export async function readTipReceipts(
  signatures: readonly string[],
  connection?: Connection,
): Promise<VerifiedTipReceipt[]> {
  if (!signatures.length) return [];
  return readWithRpcFailover(
    (activeConnection) =>
      readTipReceiptsFromConnection(signatures, activeConnection),
    connection,
  );
}

/** `getSignatureStatuses` accepts at most 256 signatures per request. */
const STATUS_BATCH_SIZE = 256;
/** Keep parsed-transaction batches small enough for providers to accept. */
const TRANSACTION_BATCH_SIZE = 100;

function chunk<T>(items: readonly T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}

async function readTipReceiptsFromConnection(
  signatures: readonly string[],
  connection: Connection,
): Promise<VerifiedTipReceipt[]> {
  const valid = signatures.filter((signature) =>
    /^[1-9A-HJ-NP-Za-km-z]{80,90}$/.test(signature),
  );
  if (!valid.length) return [];

  const transactions = new Map<
    string,
    Awaited<ReturnType<Connection["getParsedTransaction"]>>
  >();
  for (const batch of chunk(valid, TRANSACTION_BATCH_SIZE)) {
    const parsed = await connection.getParsedTransactions(batch, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    batch.forEach((signature, index) =>
      transactions.set(signature, parsed[index]),
    );
  }

  const statuses = new Map<string, SignatureStatus | null>();
  for (const batch of chunk(valid, STATUS_BATCH_SIZE)) {
    const result = await connection.getSignatureStatuses(batch);
    batch.forEach((signature, index) =>
      statuses.set(signature, result.value[index]),
    );
  }

  const receipts: VerifiedTipReceipt[] = [];
  for (const signature of valid) {
    try {
      receipts.push(
        verifyParsedTipReceipt(
          signature,
          transactions.get(signature) ?? null,
          statuses.get(signature) ?? null,
        ),
      );
    } catch (error) {
      /* A non-tip or unverifiable signature is not an error for a scan, but a
         transport failure is: it must not be silently read as "no tips". */
      if (!(error instanceof TipReceiptVerificationError)) throw error;
    }
  }
  return receipts;
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
  const status = (await connection.getSignatureStatuses([signature])).value[0];

  return verifyParsedTipReceipt(signature, transaction, status);
}

/**
 * Bind a signature to a protocol tip using only the confirmed transaction.
 *
 * The instruction, the emitted event, and the inner System transfer must agree
 * on supporter, payout wallet, amount, and reference, the supporter must have
 * signed, and the profile must re-derive from the event's owner. Nothing the
 * browser reported is consulted, so a receipt cannot be fabricated by anyone
 * who did not actually pay.
 */
export function verifyParsedTipReceipt(
  signature: string,
  transaction: ParsedTransactionWithMeta | null,
  status: SignatureStatus | null,
): VerifiedTipReceipt {
  if (!/^[1-9A-HJ-NP-Za-km-z]{80,90}$/.test(signature)) {
    throw new TipReceiptVerificationError("Invalid Solana signature.");
  }
  if (!transaction || !transaction.meta || transaction.meta.err) {
    throw new TipReceiptVerificationError("The Solana tip did not settle.");
  }
  if (transaction.transaction.signatures[0] !== signature) {
    throw new TipReceiptVerificationError("The requested signature is absent.");
  }
  if (status?.err) {
    throw new TipReceiptVerificationError("The Solana tip failed.");
  }

  const programId = parseKey(
    getProtocolConfig().programAddress || TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
    "protocol program",
  );
  const tipInstruction = readTopLevelTip(transaction, programId);
  const events = decodeProtocolEventLogs(
    transaction.meta.logMessages || [],
    programId,
  );
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
    .filter((group) => group.index === tipInstruction.index)
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

  const eventProfile = parseKey(String(event.profile), "event profile");
  const eventProfileOwner = parseKey(
    String(event.profileOwner),
    "event profile owner",
  );
  const [expectedProfile] = PublicKey.findProgramAddressSync(
    [Buffer.from("profile"), eventProfileOwner.toBuffer()],
    programId,
  );

  if (
    !tipInstruction.supporter.equals(source) ||
    !tipInstruction.profile.equals(eventProfile) ||
    !tipInstruction.payoutWallet.equals(destination) ||
    !tipInstruction.profile.equals(expectedProfile) ||
    tipInstruction.amount !== event.amount ||
    !bytesEqual(tipInstruction.reference, event.reference) ||
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
