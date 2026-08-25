"use server";

import db from "@/db";
import { getProtocolConfig } from "@/lib/protocol/config";
import { scanTipReceipts, summarizeChainTips } from "@/lib/protocol/earnings";

/** Lightweight social-proof stats for a creator's public profile. */
export async function getSupporterStats(
  email: string,
  profileAddress?: string,
) {
  if (getProtocolConfig().enabled && profileAddress) {
    const rows = await scanTipReceipts(profileAddress);
    const summary = summarizeChainTips(rows);
    return {
      contributions: summary.contributions,
      supporters: summary.supporters,
      totalSol: summary.total,
    };
  }
  if (!email) return { contributions: 0, supporters: 0, totalSol: 0 };

  const txns = await db.transaction.findMany({
    where: { user_id: email },
    select: { amount: true, fromPublicKey: true },
  });

  const totalSol = txns.reduce(
    (acc, t) => acc + (parseFloat(t.amount) || 0),
    0,
  );
  const supporters = new Set(txns.map((t) => t.fromPublicKey)).size;

  return {
    contributions: txns.length,
    supporters,
    totalSol,
  };
}
