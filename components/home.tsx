"use client";

import { Card, CardContent } from "@/components/ui/card";
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

      <main className="mx-auto w-full max-w-6xl flex-grow px-4 pb-20 sm:px-6">
        {isOwner && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-brand/20 bg-brand/5 px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">
              This is your public page — here&apos;s how supporters see you.
            </span>
            <code className="hidden shrink-0 font-mono text-xs text-brand-muted sm:block">
              daonation.xyz/{username}
            </code>
          </div>
        )}

        {/* Cover + avatar */}
        <motion.div
          className="relative mt-4"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-border sm:h-60">
            <img
              src={coverImage || "/dummy-cover.png"}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
          </div>
          <div className="absolute -bottom-12 left-5 sm:-bottom-14">
            <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-background bg-surface sm:h-28 sm:w-28">
              <img
                src={profileImage || "/sol.png"}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        {/* Identity */}
        <div className="mt-16 flex flex-col gap-4 sm:mt-20 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {displayName}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-money/30 bg-money/10 px-2 py-0.5 text-[11px] font-medium text-money">
                <BadgeCheck className="h-3 w-3" /> On-chain
              </span>
            </div>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              @{username}
            </p>
            {stats && stats.supporters > 0 && (
              <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-brand" />
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
                  <Check className="h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" /> Share
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <div className="markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {description}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
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
