"use server";

import db from "@/db";

interface addTransactionToDBProps {
  userId: string;
  hash: string;
  amount: string;
  fromPublicKey: string;
  toPublicKey: string;
  status: string;
}

export const addTransactionToDB = async ({
  userId,
  hash,
  amount,
  fromPublicKey,
  toPublicKey,
  status,
}: addTransactionToDBProps) => {
  const transaction = await db.transaction.create({
    data: {
      user_id: userId,
      hash: hash,
      amount: amount,
      fromPublicKey: fromPublicKey,
      toPublicKey: toPublicKey,
      status,
    },
  });
  return transaction;
};
