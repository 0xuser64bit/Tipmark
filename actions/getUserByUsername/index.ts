"use server";

import db from "@/db";
import { notFound } from "next/navigation";
import { getProtocolConfig } from "@/lib/protocol/config";
import {
  metadataGatewayUrl,
  PublicProfileResolutionError,
  resolveOnChainProfile,
} from "@/lib/protocol/public-profile";
import { isValidProtocolUsername } from "@/lib/protocol/username";

export default async function getUserByUsername({
  username,
}: {
  username: string;
}) {
  const normalized = username.trim().toLowerCase();

  if (getProtocolConfig().enabled && isValidProtocolUsername(normalized)) {
    let onChain;
    try {
      onChain = await resolveOnChainProfile(normalized);
    } catch (error) {
      if (error instanceof PublicProfileResolutionError) notFound();
      throw error;
    }
    if (onChain) {
      if (!onChain.active) notFound();
      return {
        id: onChain.address,
        email: "",
        username: onChain.username,
        description: onChain.metadata.bio,
        display_name: onChain.metadata.displayName,
        profile_image: onChain.metadata.images.avatar
          ? metadataGatewayUrl(onChain.metadata.images.avatar)
          : "",
        cover_image: onChain.metadata.images.cover
          ? metadataGatewayUrl(onChain.metadata.images.cover)
          : "",
        x_username: onChain.metadata.links.x || "",
        instagram_username: onChain.metadata.links.instagram || "",
        github_username: onChain.metadata.links.github || "",
        linkedin_username: onChain.metadata.links.linkedin || "",
        solana_public_key: onChain.payoutWallet,
        updates: false,
        createdAt: onChain.createdAt,
        updatedAt: onChain.updatedAt,
        source: onChain.source,
      };
    }
  }

  const user = await db.user.findFirst({
    where: {
      username: normalized,
    },
  });

  if (!user) {
    notFound();
  }

  return user;
}
