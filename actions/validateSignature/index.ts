"use server";

import db from "@/db";
import { notFound } from "next/navigation";

export async function validateSignature(signature: string) {
  const transaction = await db.transaction.findFirst({
    where: {
      hash: signature,
    },
  });

  if (!transaction) {
    notFound();
  }

  const creator = await db.user.findUnique({
    where: { email: transaction.user_id },
    select: { username: true, display_name: true, profile_image: true },
  });

  return { transaction, creator };
}
