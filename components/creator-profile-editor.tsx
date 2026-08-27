"use client";

import ProtocolProfileEditor from "./protocol-profile-editor";
import { RequireWallet } from "./creator-route";
import type { CreatorProfileView } from "@/lib/protocol/profile-view";

/**
 * The editor, seeded from whatever the connected wallet already owns.
 *
 * A wallet with no profile gets the setup form; a wallet with one gets its
 * published values back, read from chain rather than from any local copy, so
 * a save always republishes exactly what is live.
 */
export function CreatorProfileEditor({
  seededHandle = "",
}: {
  seededHandle?: string;
}) {
  return (
    <RequireWallet>
      {(profile: CreatorProfileView | null, owner: string) => (
        <ProtocolProfileEditor
          mode={profile ? "edit" : "setup"}
          profileOwner={profile?.owner}
          initial={{
            username: profile?.username ?? seededHandle,
            displayName: profile?.displayName ?? "",
            description: profile?.bio ?? "",
            /* The permanent URI, not the gateway URL: a republish must carry
               the same content address, not a mirror of it. */
            coverImage: profile?.coverUri ?? "",
            profileImage: profile?.avatarUri ?? "",
            /* Default the payout to the connected wallet — it is the answer
               for almost everyone, and it is still editable. */
            solana: profile?.payoutWallet ?? owner,
            x: profile?.links.x ?? "",
            instagram: profile?.links.instagram ?? "",
            github: profile?.links.github ?? "",
            linkedin: profile?.links.linkedin ?? "",
          }}
        />
      )}
    </RequireWallet>
  );
}
