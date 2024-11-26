"use server";

import db from "@/db";

export default async function UpdateUserProfileAction({
  username,
  profile_image,
  cover_image,
  email,
  display_name,
  description,
  x_username,
  instagram_username,
  github_username,
  linkedin_username,
  blockchainKeys,
  updates,
}: {
  username: string;
  profile_image: string;
  cover_image: string;
  email: string;
  display_name: string;
  description: string;
  x_username: string;
  instagram_username: string;
  github_username: string;
  linkedin_username: string;
  blockchainKeys: any;
  updates?: boolean;
}) {
  // Todo: do same for other blockchains
  const solana_public_key = blockchainKeys.solana;

  // check if username is taken
  const existingUser = await db.user.findFirst({
    where: {
      username,
    },
  });

  // Todo: fix this
  if (existingUser && existingUser.email !== email) {
    return { data: null, error: "Username is already taken", statusCode: 409 };
  }

  const user = await db.user.update({
    where: {
      email,
    },
    data: {
      username,
      profile_image,
      cover_image,
      display_name,
      description,
      x_username,
      instagram_username,
      github_username,
      linkedin_username,
      solana_public_key,
      updates,
    },
  });
  if (!user) {
    return {
      data: null,
      error: "Failed to update user profile",
      statusCode: 400,
    };
  }
  return {
    data: user,
    error: null,
    statusCode: 200,
  };
}
