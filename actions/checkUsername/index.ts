"use server";

import db from "@/db";
import { auth } from "@/lib/auth";

export type UsernameStatus =
  | { available: true }
  | { available: false; reason: "empty" | "invalid" | "taken" };

/**
 * Real-time username availability check for onboarding.
 * The current user's own handle counts as available.
 */
export async function checkUsernameAvailable(
  raw: string,
): Promise<UsernameStatus> {
  const username = raw.trim().toLowerCase();

  if (!username) return { available: false, reason: "empty" };
  if (!/^[a-z0-9-]{2,30}$/.test(username)) {
    return { available: false, reason: "invalid" };
  }

  const session = await auth();
  const existing = await db.user.findFirst({ where: { username } });
  const available = !existing || existing.email === session?.user?.email;

  return available ? { available: true } : { available: false, reason: "taken" };
}
