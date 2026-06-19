"use server";

import db from "@/db";

const DAY_MS = 1000 * 60 * 60 * 24;

export const getEarningData = async ({ userId }: { userId: string }) => {
  const transactions = await db.transaction.findMany({
    where: { user_id: userId },
    select: {
      amount: true,
      createdAt: true,
      hash: true,
      fromPublicKey: true,
      status: true,
    },
  });

  const now = new Date();
  const amountOf = (a: string) => parseFloat(a) || 0;

  const totalEarning = transactions.reduce((acc, t) => acc + amountOf(t.amount), 0);

  const sumWithin = (days: number) =>
    transactions.reduce((acc, t) => {
      const diff = now.getTime() - new Date(t.createdAt).getTime();
      return diff < days * DAY_MS ? acc + amountOf(t.amount) : acc;
    }, 0);

  // Rolling last-12-months buckets — built per request (no shared mutable state).
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: d.toLocaleString("en-US", { month: "short" }),
      total: 0,
    };
  });
  const indexByKey = new Map(months.map((m, i) => [m.key, i]));

  for (const t of transactions) {
    const d = new Date(t.createdAt);
    const i = indexByKey.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) months[i].total += amountOf(t.amount);
  }

  const monthlyEarningData = months.map(({ month, total }) => ({
    month,
    total: Number(total.toFixed(4)),
  }));

  const recentTransactions = [...transactions]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 6);

  const uniqueSupporters = new Set(transactions.map((t) => t.fromPublicKey))
    .size;

  return {
    totalEarning,
    last30daysEarning: sumWithin(30),
    last7daysEarning: sumWithin(7),
    totalTrasactions: transactions.length,
    uniqueSupporters,
    recentTransactions,
    monthlyEarningData,
  };
};
