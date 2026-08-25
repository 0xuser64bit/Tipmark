"use server";

import db from "@/db";
import { readDirectTransfer } from "@/lib/solana/direct-transfer";
import { notFound } from "next/navigation";

export async function validateSignature(signature: string) {
  const transaction = await db.transaction.findFirst({
    where: {
      hash: signature,
    },
  });

  const verified = await readDirectTransfer(signature);

  const cachedCreator = transaction
    ? await db.user.findFirst({
        where: {
          email: transaction.user_id,
          solana_public_key: verified.toPublicKey,
        },
        select: {
          email: true,
          username: true,
          display_name: true,
          profile_image: true,
        },
      })
    : null;
  const recipientCreators = cachedCreator
    ? []
    : await db.user.findMany({
        where: { solana_public_key: verified.toPublicKey },
        take: 2,
        select: {
          email: true,
          username: true,
          display_name: true,
          profile_image: true,
        },
      });
  const creator =
    cachedCreator ||
    (recipientCreators.length === 1 ? recipientCreators[0] : null);
  if (!creator) notFound();

  return {
    transaction: {
      id: transaction?.id || verified.signature,
      user_id: creator.email,
      amount: verified.amountSol,
      hash: verified.signature,
      fromPublicKey: verified.fromPublicKey,
      toPublicKey: verified.toPublicKey,
      status: verified.status,
      createdAt: verified.blockTime,
      updatedAt: verified.blockTime,
    },
    creator,
  };
}
