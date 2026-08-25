"use server";

import db from "@/db";
import { getProtocolConfig } from "@/lib/protocol/config";
import {
  metadataGatewayUrl,
  resolveOnChainProfileByOwner,
} from "@/lib/protocol/public-profile";
import { readTipReceipt } from "@/lib/protocol/tip-receipt";
import { lamportsToSol } from "@/lib/solana/amount";
import { readDirectTransfer } from "@/lib/solana/direct-transfer";
import { notFound } from "next/navigation";

export async function validateSignature(signature: string) {
  if (getProtocolConfig().enabled) {
    const verified = await readTipReceipt(signature);
    const onChain = await resolveOnChainProfileByOwner(
      String(verified.event.profileOwner),
    ).catch(() => null);
    if (!onChain || onChain.address !== verified.event.profile) notFound();

    return {
      transaction: {
        id: verified.signature,
        user_id: "",
        amount: lamportsToSol(verified.event.amount),
        hash: verified.signature,
        fromPublicKey: String(verified.event.supporter),
        toPublicKey: String(verified.event.payoutWallet),
        status: verified.status,
        createdAt: verified.blockTime,
        updatedAt: verified.blockTime,
      },
      creator: {
        email: "",
        username: onChain.username,
        display_name: onChain.metadata.displayName,
        profile_image: onChain.metadata.images.avatar
          ? metadataGatewayUrl(onChain.metadata.images.avatar)
          : "",
      },
    };
  }

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
