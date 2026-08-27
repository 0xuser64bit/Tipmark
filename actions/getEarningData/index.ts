"use server";

import { getContributionLedger, withDates } from "@/lib/protocol/contributions";

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
 * `TipReceived` events on the profile PDA. No stored total exists to drift
 * from the ledger.
 */
export const getEarningData = async ({
  profileAddress,
}: {
  profileAddress: string;
}): Promise<EarningSummary> => {
  const ledger = withDates(await getContributionLedger(profileAddress));

  return {
    total: ledger.total,
    last7: ledger.last7,
    last30: ledger.last30,
    contributions: ledger.contributions,
    supporters: ledger.supporters,
    largest: ledger.largest,
    months: ledger.months,
    rows: ledger.rows.map((row) => ({
      hash: row.signature,
      amount: row.amount,
      fromPublicKey: row.fromPublicKey,
      status: row.status,
      createdAt: row.createdAt,
    })),
  };
};
