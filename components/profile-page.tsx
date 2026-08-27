"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { CopyLink } from "./copy-link";
import { ShareCardDialog } from "./share-card-dialog";
import { SocialLinks } from "./social-links";
import { SupportPanel } from "./support-panel";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { Button } from "./ui/button";
import { WalletTrigger } from "./ui/wallet-button";
import { formatSol } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BRAND_NAME, profileUrl } from "@/lib/brand";

export interface ProfilePageProps {
  profileImage: string;
  coverImage: string;
  username: string;
  displayName: string;
  description: string;
  x_username: string;
  github_username: string;
  instagram_username: string;
  linkedin_username: string;
  solana_address: string;
  stats?: { supporters: number; contributions: number; totalSol: number };
  isOwner?: boolean;
  profileOwner: string;
}

/**
 * A creator's page is their letterhead: a plate at the top, their name set
 * in the serif, their words as editorial prose, and — held on the right at
 * every size that allows it — the receipt they are asking you to sign.
 */
export default function ProfilePage({
  profileImage,
  coverImage,
  username,
  displayName,
  description,
  x_username,
  github_username,
  instagram_username,
  linkedin_username,
  solana_address,
  stats,
  isOwner = false,
  profileOwner,
}: ProfilePageProps) {
  const url = profileUrl(username);
  const hasHistory = Boolean(stats && stats.supporters > 0);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader nav={isOwner} actions={<WalletTrigger />} />

      <main id="main" className="flex-1">
        {/* ── Owner notice: your page, as others see it ─────────────── */}
        {isOwner && (
          <div className="border-b border-rule bg-well/60">
            <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 sm:px-8">
              <span className="text-[12.5px] text-ink-faint">
                This is your public page.
              </span>
              <div className="ml-auto flex items-center gap-2">
                <CopyLink url={url} size="sm" variant="quiet" />
                <Button asChild variant="outline" size="sm">
                  <Link href="/edit-profile">
                    <Pencil aria-hidden />
                    Edit
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
          {/* ── The plate ───────────────────────────────────────────── */}
          <div className="relative mt-6 sm:mt-8">
            <div className="h-[136px] overflow-hidden rounded-[6px] border border-rule bg-well sm:h-[188px]">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div aria-hidden className="engraved size-full" />
              )}
            </div>

            {/* Avatar rests across the plate's bottom rule. */}
            <div className="absolute -bottom-9 left-5 sm:-bottom-11 sm:left-7">
              <div className="size-[76px] overflow-hidden rounded-[5px] border-[3px] border-paper bg-well sm:size-[96px]">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-ink font-serif text-3xl text-paper">
                    {displayName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Body ────────────────────────────────────────────────── */}
          {/*
            Narrow: a single column, with the ask directly under the name —
            a supporter arrived intending to give and should not have to
            scroll past a biography to do it.
            Wide: two columns, identity and prose in the measure, the ask
            held on the right.

            `contents` lets the same DOM do both: on narrow screens the
            wrapper dissolves so its children can be ordered around the
            panel, on wide screens it becomes the left column.
          */}
          <div className="mt-14 flex flex-col gap-10 pb-16 sm:mt-16 lg:grid lg:grid-cols-[minmax(0,1fr)_364px] lg:items-start lg:gap-14">
            <div className="contents lg:block">
              <header className="order-1 animate-rise">
                <h1 className="text-[clamp(1.9rem,4.4vw,2.6rem)] font-medium">
                  {displayName}
                </h1>

                <p className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[13px] text-ink-faint">
                  <span className="figure text-ink-soft">@{username}</span>
                  {hasHistory && (
                    <>
                      <span aria-hidden className="text-rule-strong">
                        ·
                      </span>
                      <span>
                        <span className="figure text-ink">
                          {stats!.supporters}
                        </span>{" "}
                        {stats!.supporters === 1 ? "supporter" : "supporters"}
                      </span>
                      <span aria-hidden className="text-rule-strong">
                        ·
                      </span>
                      <span>
                        <span className="figure text-ink">
                          {formatSol(stats!.totalSol)} SOL
                        </span>{" "}
                        received
                      </span>
                    </>
                  )}
                </p>
              </header>

              <div className="order-3 animate-rise lg:mt-8">
                {description && (
                  <div className="prose-ledger">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {description}
                    </ReactMarkdown>
                  </div>
                )}

                <div
                  className={cn(
                    "space-y-6",
                    description && "mt-9 border-t border-rule pt-6",
                  )}
                >
                  <SocialLinks
                    handles={{
                      x: x_username,
                      instagram: instagram_username,
                      github: github_username,
                      linkedin: linkedin_username,
                    }}
                  />

                  {isOwner && (
                    <div className="flex flex-wrap items-center gap-2">
                      <ShareCardDialog
                        name={displayName}
                        username={username}
                        profileUrl={url}
                        imageUrl={profileImage}
                      />
                      <CopyLink url={url} size="sm" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="order-2 animate-rise lg:sticky lg:top-8">
              <SupportPanel
                displayName={displayName}
                solanaAddress={solana_address}
                profileOwner={profileOwner}
              />
              <p className="mt-3 px-1 text-[12px] leading-relaxed text-ink-faint">
                {BRAND_NAME} never touches the money. Your wallet signs a
                transfer to {displayName}&rsquo;s address and Solana records it
                — you get a receipt you can verify yourself.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
