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

  return true;
}
