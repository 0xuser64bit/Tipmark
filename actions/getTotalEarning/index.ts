"use server";

import db from "@/db";

export const getTotalEarning = async ({ userId }: { userId: string }) => {
  const transactions = await db.transaction.findMany({
    where: {
      user_id: userId,
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
