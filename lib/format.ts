/** Shared formatting helpers for money + on-chain values. */

export function formatSol(value: number, maxFractionDigits = 4): string {
  if (!Number.isFinite(value)) return "0";
  return parseFloat(value.toFixed(maxFractionDigits)).toLocaleString("en-US", {
    maximumFractionDigits: maxFractionDigits,
  });
}

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "$0.00";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value > 0 && value < 1 ? 4 : 2,
  });
}

export function truncateAddress(address: string, start = 4, end = 4): string {
  if (!address) return "";
  if (address.length <= start + end + 1) return address;
  return `${address.slice(0, start)}…${address.slice(-end)}`;
}
