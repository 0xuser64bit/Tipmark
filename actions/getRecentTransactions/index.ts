"use server";

import db from "@/db";

export const getRecentTransactions = async ({ userId }: { userId: string }) => {
  const transactions = await db.transaction.findMany({
    where: {
      user_id: userId,
    },
    select: {
      hash: true,
      amount: true,
      createdAt: true,
      fromPublicKey: true,
    },
    take: 5,
  });
  return transactions;
};
