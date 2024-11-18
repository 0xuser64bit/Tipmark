"use server";

import db from "@/db";

export default async function UpdateUserProfileAction({
  username,
  profile_image,
  cover_image,
  email,
  display_name,
  description,
  x_url,
  instagram_url,
  github_url,
  linkedin_url,
  blockchainKeys,
}: {
  username: string;
  profile_image: string;
  cover_image: string;
  email: string;
  display_name: string;
  description: string;
  x_url: string;
  instagram_url: string;
  github_url: string;
  linkedin_url: string;
  blockchainKeys: any;
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
    return { response: "Username is already taken", code: 400 };
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
      x_url,
      instagram_url,
      github_url,
      linkedin_url,
      solana_public_key,
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
