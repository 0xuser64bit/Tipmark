"use server";

import db from "@/db";

export default async function GetUserInfoAction({ email }: { email: string }) {
  const user = await db.user.findFirst({
    where: {
      email,
    },
  });
  if (!user) {
    return {
      data: null,
      error: "User not found",
      statusCode: 404,
    };
  }

  return {
    data: user,
    error: null,
    statusCode: 200,
  };
}
