"use client";

import { motion } from "motion/react";
import { BadgeCheck, Check, Share2, Users } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Footer } from "./footer";
import { GetCard } from "./get-card";
import { Header } from "./header";
import { SocialsCard } from "./socials-card";
import { SupportUserCard } from "./support-user";
import { Button } from "./ui/button";
import { fadeUp } from "@/lib/motion";
import { formatSol } from "@/lib/format";

interface HomeStats {
  supporters: number;
  contributions: number;
  totalSol: number;
}

interface HomeProps {
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
  email: string;
  stats?: HomeStats;
  isOwner?: boolean;
}

export default function Home({
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
  email,
  stats,
  isOwner = false,
}: HomeProps) {
  const [copied, setCopied] = useState(false);
  const profileUrl = `https://daonation.xyz/${username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-grow px-4 pb-24 sm:px-6">
        {isOwner && (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-brand-surface bg-brand-surface/50 px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">
              This is your public page — here&apos;s how supporters see you.
            </span>
            <code className="hidden shrink-0 font-mono text-[13px] text-brand-muted sm:block">
              daonation.xyz/{username}
            </code>
          </div>
        )}

        {/* ── Cover & Avatar ──────────────────────────────────────── */}
        <motion.div
          className="relative mt-6 sm:mt-8"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          {/* Taller cover image for premium feel */}
          <div className="relative h-52 w-full overflow-hidden rounded-2xl border border-border sm:h-72">
            <img
              src={coverImage || "/dummy-cover.png"}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
          </div>
          
          {/* Avatar pulled up to overlap cover more intentionally */}
          <div className="absolute -bottom-14 left-6 sm:-bottom-16">
            <div className="h-28 w-28 overflow-hidden rounded-[1.25rem] border-[4px] border-background bg-surface shadow-lg sm:h-32 sm:w-32">
              <img
                src={profileImage || "/sol.png"}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        {/* ── Identity & Stats ────────────────────────────────────── */}
        <div className="mt-20 flex flex-col gap-5 sm:mt-24 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
              {displayName}
            </h1>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              @{username}
            </p>
            {stats && stats.supporters > 0 && (
              <p className="mt-3.5 inline-flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-brand-muted" />
                <span className="font-medium text-foreground">
                  {stats.supporters}
                </span>
                supporter{stats.supporters === 1 ? "" : "s"}
                <span className="text-border">·</span>
                <span className="font-mono tabular-nums text-foreground">
                  {formatSol(stats.totalSol)} SOL
                </span>
                raised
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <GetCard
              name={displayName}
              username={username}
              profileUrl={profileUrl}
              imageUrl={profileImage}
            />
            <Button variant="outline" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-money" /> Copied
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" /> Share
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ── Content Grid ────────────────────────────────────────── */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {/* Unboxed Bio */}
            {description && (
              <div className="markdown text-base">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {description}
                </ReactMarkdown>
              </div>
            )}
            
            <SocialsCard
              x_username={x_username}
              instagram_username={instagram_username}
              github_username={github_username}
              linkedin_username={linkedin_username}
            />
          </div>

          <div className="h-fit lg:sticky lg:top-20">
            <SupportUserCard
              displayName={displayName}
              solana_address={solana_address}
              email={email}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
