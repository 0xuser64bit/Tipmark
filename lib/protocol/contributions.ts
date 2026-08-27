import { unstable_cache } from "next/cache";
import { scanTipReceipts, summarizeChainTips } from "./earnings";

/**
 * A contribution ledger shaped for transport and caching.
 *
 * Timestamps are epoch milliseconds rather than `Date` objects: this crosses
 * both the cache boundary and the server/client boundary, and a `Date` does not
 * survive either reliably. Callers rehydrate at the edge where they need one.
 */
export interface ContributionRow {
  signature: string;
  amount: number;
  fromPublicKey: string;
  toPublicKey: string;
  status: string;
  createdAtMs: number;
}

export interface ContributionLedger {
  total: number;
  last7: number;
  last30: number;
  contributions: number;
  supporters: number;
  largest: number;
  months: { label: string; year: number; total: number }[];
  rows: ContributionRow[];
}

/** How long a scan may be reused. Short: a creator watches for a new tip. */
const REVALIDATE_SECONDS = 30;

export function contributionCacheTag(profileAddress: string): string {
  return `contributions:${profileAddress}`;
}

async function readContributionLedger(
  profileAddress: string,
): Promise<ContributionLedger> {
  const rows = await scanTipReceipts(profileAddress);
  const summary = summarizeChainTips(rows);

  return {
    total: summary.total,
    last7: summary.last7,
    last30: summary.last30,
    contributions: summary.contributions,
    supporters: summary.supporters,
    largest: summary.largest,
    months: summary.months,
    rows: summary.rows.map((row) => ({
      signature: row.signature,
      amount: row.amount,
      fromPublicKey: row.fromPublicKey,
      toPublicKey: row.toPublicKey,
      status: row.status,
      createdAtMs: row.createdAt.getTime(),
    })),
  };
}

/**
 * Read a profile's ledger, reusing a recent scan when one exists.
 *
 * Scanning is the most expensive read in the product, and on a public profile
 * it is triggered by anonymous visitors, so an uncached implementation lets any
 * traffic spike multiply into RPC quota. The cache is keyed by profile address
 * and bounded in time; it holds nothing that is not reconstructable from chain,
 * and losing it costs one slower request. It is never consulted to authorize
 * anything.
 */
export const getContributionLedger = unstable_cache(
  readContributionLedger,
  ["tipmark-contribution-ledger"],
  { revalidate: REVALIDATE_SECONDS },
);

/** Rehydrate a cached row for components that want a real `Date`. */
export function withDates(ledger: ContributionLedger) {
  return {
    ...ledger,
    rows: ledger.rows.map((row) => ({
      ...row,
      createdAt: new Date(row.createdAtMs),
    })),
  };
}
