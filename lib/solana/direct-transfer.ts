import {
  Connection,
  PublicKey,
  SystemProgram,
  type ParsedInstruction,
} from "@solana/web3.js";
import { lamportsToSol, solToLamports } from "./amount";
import { getSolanaNetworkConfig } from "./cluster";

const MAX_LOOKUP_ATTEMPTS = 20;
const LOOKUP_DELAY_MS = 500;

export interface DirectTransferExpectation {
  signature: string;
  fromPublicKey: string;
  toPublicKey: string;
  amountSol: string;
}

export interface VerifiedDirectTransfer {
  signature: string;
  amountLamports: bigint;
  amountSol: string;
  fromPublicKey: string;
  toPublicKey: string;
  status: "processed" | "confirmed" | "finalized";
  blockTime: Date | null;
}

export class DirectTransferVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DirectTransferVerificationError";
  }
}

function getConnection(): Connection {
  return new Connection(getSolanaNetworkConfig().rpcUrl, "confirmed");
}

function parsePublicKey(value: string, label: string): PublicKey {
  try {
    return new PublicKey(value);
  } catch {
    throw new DirectTransferVerificationError(`Invalid ${label} public key.`);
  }
}

function isSystemTransfer(
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
    typeof instruction.parsed.info?.lamports === "number" &&
    Number.isSafeInteger(instruction.parsed.info.lamports) &&
    instruction.parsed.info.lamports > 0
  );
}

async function findParsedTransaction(
  connection: Connection,
  signature: string,
) {
  for (let attempt = 0; attempt < MAX_LOOKUP_ATTEMPTS; attempt += 1) {
    const transaction = await connection.getParsedTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    if (transaction) return transaction;
    await new Promise((resolve) => setTimeout(resolve, LOOKUP_DELAY_MS));
  }
  return null;
}

/** Read the one direct System Program transfer represented by a Tipmark receipt. */
export async function readDirectTransfer(
  signature: string,
  connection = getConnection(),
): Promise<VerifiedDirectTransfer> {
  if (!/^[1-9A-HJ-NP-Za-km-z]{80,90}$/.test(signature)) {
    throw new DirectTransferVerificationError("Invalid Solana signature.");
  }

  const transaction = await findParsedTransaction(connection, signature);
  if (!transaction) {
    throw new DirectTransferVerificationError(
      "The Solana transaction is not available yet. Try again shortly.",
    );
  }
  if (transaction.meta?.err) {
    throw new DirectTransferVerificationError(
      "The Solana transaction failed and did not send support.",
    );
  }
  if (!transaction.transaction.signatures.includes(signature)) {
    throw new DirectTransferVerificationError(
      "The RPC transaction does not contain the requested signature.",
    );
  }

  const transfers = transaction.transaction.message.instructions.filter(
    (instruction): instruction is ParsedInstruction =>
      "parsed" in instruction && isSystemTransfer(instruction),
  );
  if (transfers.length !== 1) {
    throw new DirectTransferVerificationError(
      "The transaction does not contain exactly one direct SOL transfer.",
    );
  }

  const transfer = transfers[0];
  const from = parsePublicKey(transfer.parsed.info.source, "sender");
  const to = parsePublicKey(transfer.parsed.info.destination, "recipient");
  const lamports = BigInt(transfer.parsed.info.lamports);

  const senderAccount = transaction.transaction.message.accountKeys.find(
    (account) => account.pubkey.equals(from),
  );
  if (!senderAccount?.signer) {
    throw new DirectTransferVerificationError(
      "The transfer source did not sign the Solana transaction.",
    );
  }

  const signatureStatus = (await connection.getSignatureStatuses([signature]))
    .value[0];
  if (signatureStatus?.err) {
    throw new DirectTransferVerificationError(
      "The Solana transaction failed and did not send support.",
    );
  }
  const status = signatureStatus?.confirmationStatus || "confirmed";

  const blockTime =
    transaction.blockTime ?? (await connection.getBlockTime(transaction.slot));

  return {
    signature,
    amountLamports: lamports,
    amountSol: lamportsToSol(lamports),
    fromPublicKey: from.toBase58(),
    toPublicKey: to.toBase58(),
    status,
    blockTime: blockTime === null ? null : new Date(blockTime * 1000),
  };
}

/** Verify a direct wallet-to-wallet SOL payment against expected client data. */
export async function verifyDirectTransfer(
  expectation: DirectTransferExpectation,
  connection = getConnection(),
): Promise<VerifiedDirectTransfer> {
  const from = parsePublicKey(expectation.fromPublicKey, "sender");
  const to = parsePublicKey(expectation.toPublicKey, "recipient");
  const expectedLamports = solToLamports(expectation.amountSol);
  const verified = await readDirectTransfer(expectation.signature, connection);

  if (
    verified.fromPublicKey !== from.toBase58() ||
    verified.toPublicKey !== to.toBase58() ||
    verified.amountLamports !== expectedLamports
  ) {
    throw new DirectTransferVerificationError(
      "The transaction does not match the expected direct SOL transfer.",
    );
  }

  return verified;
}
