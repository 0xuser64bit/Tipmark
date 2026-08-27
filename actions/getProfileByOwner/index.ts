"use server";

import {
  PublicProfileResolutionError,
  resolveOnChainProfileByOwner,
} from "@/lib/protocol/public-profile";
import {
  toCreatorProfileView,
  type CreatorProfileResult,
} from "@/lib/protocol/profile-view";
import { PublicKey } from "@solana/web3.js";

/**
 * Resolve the profile a wallet owns.
 *
 * The wallet address is the whole identity: the profile PDA is seeded by
 * owner, so a connected wallet is sufficient to find its own page and no
 * session, cookie, or stored row is consulted. Because the caller supplies
 * the address, this proves nothing about control of the wallet — it is a
 * read, and every mutation is separately signed by the owner on chain.
 */
export async function getProfileByOwner(
  owner: string,
): Promise<CreatorProfileResult> {
  let normalized: string;
  try {
    normalized = new PublicKey(owner).toBase58();
  } catch {
    return { status: "unavailable", message: "Invalid Solana wallet address." };
  }

  try {
    const resolved = await resolveOnChainProfileByOwner(normalized);
    if (!resolved) return { status: "unclaimed" };
    return { status: "found", profile: toCreatorProfileView(resolved) };
  } catch (error) {
    /* A claim whose metadata or account relationships fail verification is
       reported as unavailable rather than silently treated as unclaimed —
       overwriting it would be the one irreversible mistake here. */
    if (error instanceof PublicProfileResolutionError) {
      return { status: "unavailable", message: error.message };
    }
    return {
      status: "unavailable",
      message: "Solana could not be reached. Try again shortly.",
    };
  }
}
