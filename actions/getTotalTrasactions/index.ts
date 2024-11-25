"use server";

import db from "@/db";

export const getTotalTrasactions = async ({ userId }: { userId: string }) => {
  const transactions = await db.transaction.findMany({
    where: {
      user_id: userId,
    },
    select: {
      id: true,
    },
  });
  return transactions.length || 0;
};
