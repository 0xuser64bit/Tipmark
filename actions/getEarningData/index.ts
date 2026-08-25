"use server";

import db from "@/db";

const DAY = 86_400_000;

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
 * Everything the creator's statement needs, in one query.
 *
 * Buckets are built per request — an earlier version mutated a module-level
 * array, which leaked one creator's earnings into the next request.
 */
export const getEarningData = async ({
  userId,
}: {
  userId: string;
}): Promise<EarningSummary> => {
  const transactions = await db.transaction.findMany({
    where: { user_id: userId },
    orderBy: { createdAt: "desc" },
    select: {
      hash: true,
      amount: true,
      createdAt: true,
      fromPublicKey: true,
      status: true,
    },
  });

  const rows: EarningRow[] = transactions.map((t) => ({
    ...t,
    amount: parseFloat(t.amount) || 0,
  }));

  const now = Date.now();
  const sumWithin = (days: number) =>
    rows.reduce(
      (acc, r) =>
        now - new Date(r.createdAt).getTime() < days * DAY
          ? acc + r.amount
          : acc,
      0,
    );

  const today = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("en-US", { month: "short" }),
      year: d.getFullYear(),
      total: 0,
    };
  });
  const indexOf = new Map(months.map((m, i) => [m.key, i]));

  for (const r of rows) {
    const d = new Date(r.createdAt);
    const i = indexOf.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) months[i].total += r.amount;
  }

  return {
    total: rows.reduce((acc, r) => acc + r.amount, 0),
    last7: sumWithin(7),
    last30: sumWithin(30),
    contributions: rows.length,
    supporters: new Set(rows.map((r) => r.fromPublicKey)).size,
    largest: rows.reduce((max, r) => Math.max(max, r.amount), 0),
    months: months.map(({ label, year, total }) => ({
      label,
      year,
      total: Number(total.toFixed(6)),
    })),
    rows,
  };
};
