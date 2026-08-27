"use server";

import { scanTipReceipts, summarizeChainTips } from "@/lib/protocol/earnings";

export interface SupporterStats {
  contributions: number;
  supporters: number;
  totalSol: number;
}

/** Lightweight social-proof stats derived from verified on-chain tips. */
export async function getSupporterStats(
  profileAddress: string,
): Promise<SupporterStats> {
  const rows = await scanTipReceipts(profileAddress);
  const summary = summarizeChainTips(rows);

  return {
    contributions: summary.contributions,
    supporters: summary.supporters,
    totalSol: summary.total,
  };
}
