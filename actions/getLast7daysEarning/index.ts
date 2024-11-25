"use server";

import db from "@/db";

export const getLast7daysEarning = async ({ userId }: { userId: string }) => {
  const transactions = await db.transaction.findMany({
    where: {
      user_id: userId,
      createdAt: {
        gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    select: {
      amount: true,
    },
  });
  const totalEarning = transactions.reduce((acc, curr) => {
    return acc + parseFloat(curr.amount);
  }, 0);
  return totalEarning;
};
