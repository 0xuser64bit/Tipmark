"use server";

import db from "@/db";

export default async function getUserByEmail({ email }: { email: string }) {
  const user = await db.user.findFirst({
    where: {
      email,
    },
  });

  return user;
}
