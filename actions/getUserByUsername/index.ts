"use server";

import { notFound } from "next/navigation";
import {
  metadataGatewayUrl,
  PublicProfileResolutionError,
  resolveOnChainProfile,
} from "@/lib/protocol/public-profile";
import {
  isValidProtocolUsername,
  normalizeUsername,
} from "@/lib/protocol/username";

export interface PublicCreator {
  profileAddress: string;
  profileOwner: string;
  username: string;
  displayName: string;
  description: string;
  profileImage: string;
  coverImage: string;
  x_username: string;
  instagram_username: string;
  github_username: string;
  linkedin_username: string;
  payoutWallet: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Resolve a public handle from Solana.
 *
 * A handle that no username PDA claims does not exist, and a claim whose
 * account relationships or metadata hash fail verification is treated as
 * unavailable rather than degraded — there is no second source of truth to
 * fall back to, which is the point.
 */
export default async function getUserByUsername({
  username,
}: {
  username: string;
}): Promise<PublicCreator> {
  const normalized = normalizeUsername(username);
  if (!isValidProtocolUsername(normalized)) notFound();

  let onChain;
  try {
    onChain = await resolveOnChainProfile(normalized);
  } catch (error) {
    if (error instanceof PublicProfileResolutionError) notFound();
    throw error;
  }
  if (!onChain || !onChain.active) notFound();

  return {
    profileAddress: onChain.address,
    profileOwner: onChain.owner,
    username: onChain.username,
    displayName: onChain.metadata.displayName,
    description: onChain.metadata.bio,
    profileImage: onChain.metadata.images.avatar
      ? metadataGatewayUrl(onChain.metadata.images.avatar)
      : "",
    coverImage: onChain.metadata.images.cover
      ? metadataGatewayUrl(onChain.metadata.images.cover)
      : "",
    x_username: onChain.metadata.links.x || "",
    instagram_username: onChain.metadata.links.instagram || "",
    github_username: onChain.metadata.links.github || "",
    linkedin_username: onChain.metadata.links.linkedin || "",
    payoutWallet: onChain.payoutWallet,
    createdAt: onChain.createdAt,
    updatedAt: onChain.updatedAt,
  };
}
