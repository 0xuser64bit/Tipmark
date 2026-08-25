/** Shared formatting for money and on-chain values. */

/**
 * SOL amounts. Trailing zeros are dropped so a ledger column reads as
 * numbers rather than as padding, and grouping separators keep large
 * balances legible.
 */
export function formatSol(value: number, maxFractionDigits = 4): string {
  if (!Number.isFinite(value)) return "0";
  return parseFloat(value.toFixed(maxFractionDigits)).toLocaleString("en-US", {
    maximumFractionDigits: maxFractionDigits,
  });
}

/**
 * Fiat equivalents. Always two decimals — this is a secondary reference
 * figure, and four decimal places in a preset cell reads as noise, not as
 * precision. Amounts too small to express in cents say so instead of
 * rounding to zero.
 */
export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "$0.00";
  if (value > 0 && value < 0.005) return "< $0.01";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Middle-truncate an address or signature, keeping both ends checkable. */
export function truncateAddress(address: string, start = 4, end = 4): string {
  if (!address) return "";
  if (address.length <= start + end + 1) return address;
  return `${address.slice(0, start)}…${address.slice(-end)}`;
}
