"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEarningData, type EarningSummary } from "@/actions/getEarningData";
import type { CreatorProfileView } from "@/lib/protocol/profile-view";
import { RequireProfile } from "./creator-route";
import { Statement } from "./statement";
import { StatementSkeleton } from "./statement-skeleton";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { Button } from "./ui/button";
import { WalletTrigger } from "./ui/wallet-button";
import { useSolPrice } from "@/lib/use-sol-price";

/** The creator's ledger: gate on a claimed profile, then read it from chain. */
export function CreatorLedger() {
  return (
    <RequireProfile
      nav
      unclaimed={
        <>
          <p className="field-label">Nothing claimed yet</p>
          <h1 className="mt-4 max-w-[24ch] text-[clamp(1.9rem,4.6vw,2.75rem)] font-medium leading-[1.05]">
            This wallet has no page.
          </h1>
          <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-ink-faint">
            A ledger needs somewhere for money to arrive first. Claim a handle
            and this becomes your statement.
          </p>
          <div className="mt-9">
            <Button asChild variant="primary">
              <Link href="/claim">Claim your page</Link>
            </Button>
          </div>
        </>
      }
    >
      {(profile) => <Ledger profile={profile} />}
    </RequireProfile>
  );
}

/**
 * Earnings are scanned from the profile PDA's verified tips rather than any
 * stored total, so this is deliberately the slowest screen in the product:
 * the numbers are recomputed from the ledger instead of being trusted from a
 * cache we would have to keep honest.
 */
function Ledger({ profile }: { profile: CreatorProfileView }) {
  const { usd: priceUsd } = useSolPrice();
  const [data, setData] = useState<EarningSummary | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setFailed(false);

    getEarningData({ profileAddress: profile.profileAddress })
      .then((summary) => {
        if (!cancelled) setData(summary);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [profile.profileAddress, attempt]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader nav actions={<WalletTrigger />} />
      {failed ? (
        <main
          id="main"
          className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col justify-center px-5 py-20 sm:px-8"
        >
          <p className="field-label">Unavailable</p>
          <h1 className="mt-4 max-w-[24ch] text-[clamp(1.9rem,4.6vw,2.75rem)] font-medium leading-[1.05]">
            We could not read your ledger.
          </h1>
          <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-ink-faint">
            Solana holds the record, not us, so nothing has been lost — this is
            a failure to read it. Every contribution is still verifiable on the
            explorer.
          </p>
          <div className="mt-9">
            <Button variant="ink" onClick={() => setAttempt((n) => n + 1)}>
              Try again
            </Button>
          </div>
        </main>
      ) : data ? (
        <Statement
          data={data}
          priceUsd={priceUsd}
          username={profile.username}
          displayName={profile.displayName}
          profileImage={profile.avatarUrl}
        />
      ) : (
        <StatementSkeleton />
      )}
      <SiteFooter />
    </div>
  );
}
