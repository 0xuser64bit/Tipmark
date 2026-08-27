"use server";

import { scanTipReceipts, summarizeChainTips } from "@/lib/protocol/earnings";

export interface EarningRow {
  hash: string;
  amount: number;
  fromPublicKey: string;
  status: string;
  createdAt: Date;
}

export interface EarningSummary {
  total: number;
  last7: number;
  last30: number;
  contributions: number;
  supporters: number;
  /** Largest single contribution — a creator's most-asked question. */
  largest: number;
  /** Rolling 12 months, oldest first. */
  months: { label: string; year: number; total: number }[];
  rows: EarningRow[];
}

/**
 * Everything the creator's statement needs, derived from verified
 * `TipReceived` events on the profile PDA. Nothing here is read from a
 * cache, so deleting any local state cannot change a creator's totals.
 */
export const getEarningData = async ({
  profileAddress,
}: {
  profileAddress: string;
}): Promise<EarningSummary> => {
  const rows = await scanTipReceipts(profileAddress);
  const summary = summarizeChainTips(rows);

  return {
    ...summary,
    rows: summary.rows.map((row) => ({
      hash: row.signature,
      amount: Number(row.amount),
      fromPublicKey: row.fromPublicKey,
      status: row.status,
      createdAt: row.createdAt,
    })),
  };
};
