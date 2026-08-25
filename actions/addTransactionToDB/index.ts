"use server";

import db from "@/db";
import { verifyDirectTransfer } from "@/lib/solana/direct-transfer";

interface addTransactionToDBProps {
  userId: string;
  hash: string;
  amount: string;
  fromPublicKey: string;
  toPublicKey: string;
}

export const addTransactionToDB = async ({
  userId,
  hash,
  amount,
  fromPublicKey,
  toPublicKey,
}: addTransactionToDBProps) => {
  const verified = await verifyDirectTransfer({
    signature: hash,
    amountSol: amount,
    fromPublicKey,
    toPublicKey,
  });

  const creator = await db.user.findFirst({
    where: { email: userId, solana_public_key: verified.toPublicKey },
    select: { email: true },
  });
  if (!creator) {
    throw new Error("The selected creator does not own this payout wallet.");
  }

  const transaction = await db.transaction.upsert({
    where: { hash: verified.signature },
    update: {
      user_id: userId,
      amount: verified.amountSol,
      fromPublicKey: verified.fromPublicKey,
      toPublicKey: verified.toPublicKey,
      status: verified.status,
    },
    create: {
      user_id: userId,
      hash: verified.signature,
      amount: verified.amountSol,
      fromPublicKey: verified.fromPublicKey,
      toPublicKey: verified.toPublicKey,
      status: verified.status,
    },
  });
  return transaction;
};
