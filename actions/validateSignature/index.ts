"use server";

import {
  metadataGatewayUrl,
  resolveOnChainProfileByOwner,
} from "@/lib/protocol/public-profile";
import { readTipReceipt } from "@/lib/protocol/tip-receipt";
import { lamportsToSol } from "@/lib/solana/amount";
import { notFound } from "next/navigation";

export interface VerifiedReceipt {
  transaction: {
    amount: string;
    hash: string;
    fromPublicKey: string;
    toPublicKey: string;
    status: string;
    createdAt: Date | null;
  };
  creator: {
    username: string;
    display_name: string;
    profile_image: string;
  } | null;
}

/**
 * Rebuild a receipt from the Solana transaction alone.
 *
 * Every field is read back from the confirmed transaction — instruction,
 * event, inner transfer, signer, and re-derived profile PDA all have to
 * agree — so a receipt URL cannot be forged by anyone who did not actually
 * pay, and the page needs no record of its own.
 */
export async function validateSignature(
  signature: string,
): Promise<VerifiedReceipt> {
  const verified = await readTipReceipt(signature);
  const onChain = await resolveOnChainProfileByOwner(
    String(verified.event.profileOwner),
  ).catch(() => null);
  if (!onChain || onChain.address !== verified.event.profile) notFound();

  return {
    transaction: {
      amount: lamportsToSol(verified.event.amount),
      hash: verified.signature,
      fromPublicKey: String(verified.event.supporter),
      toPublicKey: String(verified.event.payoutWallet),
      status: verified.status,
      createdAt: verified.blockTime,
    },
    creator: {
      username: onChain.username,
      display_name: onChain.metadata.displayName,
      profile_image: onChain.metadata.images.avatar
        ? metadataGatewayUrl(onChain.metadata.images.avatar)
        : "",
    },
  };
}
