"use server";

import db from "@/db";
import { notFound } from "next/navigation";

export default async function getUserByUsername({
  username,
}: {
  username: string;
}) {
  const user = await db.user.findFirst({
    where: {
      username,
    },
  });

  if (!user) {
    notFound();
  }

  return user;
}
