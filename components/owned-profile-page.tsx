"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getSupporterStats,
  type SupporterStats,
} from "@/actions/getSupporterStats";
import type { CreatorProfileView } from "@/lib/protocol/profile-view";
import { RequireProfile } from "./creator-route";
import ProfilePage from "./profile-page";
import { Button } from "./ui/button";

/** The creator's own page, exactly as a supporter sees it. */
export function OwnedProfile() {
  return (
    <RequireProfile
      unclaimed={
        <>
          <p className="field-label">Nothing claimed yet</p>
          <h1 className="mt-4 max-w-[24ch] text-[clamp(1.9rem,4.6vw,2.75rem)] font-medium leading-[1.05]">
            This wallet has no page.
          </h1>
          <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-ink-faint">
            Pick a handle, add a name, and choose the wallet you want to be paid
            in. That is the whole setup.
          </p>
          <div className="mt-9">
            <Button asChild variant="primary">
              <Link href="/claim">Claim your page</Link>
            </Button>
          </div>
        </>
      }
    >
      {(profile) => <Owned profile={profile} />}
    </RequireProfile>
  );
}

/**
 * Stats are fetched after the page paints: the letterhead is the point of this
 * screen and should not wait on a full tip scan to appear.
 */
function Owned({ profile }: { profile: CreatorProfileView }) {
  const [stats, setStats] = useState<SupporterStats | undefined>();

  useEffect(() => {
    let cancelled = false;
    getSupporterStats(profile.profileAddress)
      .then((result) => {
        if (!cancelled) setStats(result);
      })
      .catch(() => {
        /* Social proof is decoration; its absence must not break the page. */
      });
    return () => {
      cancelled = true;
    };
  }, [profile.profileAddress]);

  return (
    <ProfilePage
      profileImage={profile.avatarUrl}
      coverImage={profile.coverUrl}
      username={profile.username}
      displayName={profile.displayName}
      description={profile.bio}
      x_username={profile.links.x}
      github_username={profile.links.github}
      instagram_username={profile.links.instagram}
      linkedin_username={profile.links.linkedin}
      solana_address={profile.payoutWallet}
      profileOwner={profile.owner}
      stats={stats}
      isOwner
    />
  );
}
