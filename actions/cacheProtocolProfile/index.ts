"use server";

import db from "@/db";
import { auth } from "@/lib/auth";
import { getWalletAuthorization } from "@/actions/walletAuth";

export interface ProtocolProfileCacheInput {
  email: string;
  username: string;
  profile_image: string;
  cover_image: string;
  display_name: string;
  description: string;
  x_username: string;
  instagram_username: string;
  github_username: string;
  linkedin_username: string;
  solana_public_key: string;
  owner: string;
}

/** Keep the legacy dashboard cache current after a confirmed on-chain write. */
export default async function cacheProtocolProfile(
  input: ProtocolProfileCacheInput,
) {
  const session = await auth();
  if (session?.user?.email !== input.email) {
    throw new Error("The signed-in user cannot update this profile cache.");
  }
  const authorization = await getWalletAuthorization();
  if (!authorization || authorization.wallet !== input.owner) {
    throw new Error("A verified wallet authorization is required.");
  }

  return db.user.update({
    where: { email: input.email },
    data: {
      username: input.username,
      profile_image: input.profile_image,
      cover_image: input.cover_image,
      display_name: input.display_name,
      description: input.description,
      x_username: input.x_username,
      instagram_username: input.instagram_username,
      github_username: input.github_username,
      linkedin_username: input.linkedin_username,
      solana_public_key: input.solana_public_key,
    },
  });
}
