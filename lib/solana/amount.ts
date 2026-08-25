const LAMPORTS_PER_SOL_BIGINT = 1_000_000_000n;
const MAX_SOL_DECIMALS = 9;

export class SolAmountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SolAmountError";
  }
}

/** Convert a decimal SOL amount without going through floating point. */
export function solToLamports(value: string): bigint {
  const normalized = value.trim();
  const match = /^(0|[1-9]\d*)(?:\.(\d{1,9}))?$/.exec(normalized);
  if (!match) throw new SolAmountError("Invalid SOL amount.");

  const whole = BigInt(match[1]);
  const fraction = (match[2] || "").padEnd(MAX_SOL_DECIMALS, "0");
  const lamports = whole * LAMPORTS_PER_SOL_BIGINT + BigInt(fraction || "0");
  if (lamports <= 0n)
    throw new SolAmountError("Transfer amount must be positive.");
  if (lamports > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new SolAmountError(
      "Transfer amount exceeds the supported client range.",
    );
  }
  return lamports;
}

export function lamportsToSol(lamports: bigint): string {
  const whole = lamports / LAMPORTS_PER_SOL_BIGINT;
  const fraction = (lamports % LAMPORTS_PER_SOL_BIGINT)
    .toString()
    .padStart(MAX_SOL_DECIMALS, "0")
    .replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}
