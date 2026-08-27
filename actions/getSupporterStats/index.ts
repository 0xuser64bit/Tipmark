"use server";

import { getContributionLedger } from "@/lib/protocol/contributions";

export interface SupporterStats {
  contributions: number;
  supporters: number;
  totalSol: number;
}

/**
 * Lightweight social proof for a public profile.
 *
 * This runs for anonymous visitors, so it shares the cached ledger rather than
 * starting its own scan: a popular page must not turn each visit into a full
 * signature walk.
 */
export async function getSupporterStats(
  profileAddress: string,
): Promise<SupporterStats> {
  const ledger = await getContributionLedger(profileAddress);

  return {
    contributions: ledger.contributions,
    supporters: ledger.supporters,
    totalSol: ledger.total,
  };
}
