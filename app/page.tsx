"use client";

import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Link2,
  ShieldCheck,
  Share2,
  Wallet,
  Zap,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";

const STEPS = [
  {
    step: "01",
    icon: Link2,
    title: "Claim your link",
    body: "Pick a @handle and drop in your Solana wallet. Takes under a minute.",
  },
  {
    step: "02",
    icon: Share2,
    title: "Share it anywhere",
    body: "Post your link or QR card in your bio, threads, videos, or streams.",
  },
  {
    step: "03",
    icon: Wallet,
    title: "Get paid on-chain",
    body: "Supporters send SOL straight to your wallet. You keep all of it.",
  },
];

const TRUST = [
  { icon: ShieldCheck, label: "Non-custodial" },
  { icon: Zap, label: "~1s settlement" },
  { icon: BadgeCheck, label: "Verifiable on Solana" },
];

export default function LandingPage() {
  const session = useSession();
  if (session?.data?.user) {
    redirect("/home");
  }

  const [claim, setClaim] = useState("");
  const startOnboarding = () =>
    signIn("google", { redirect: true, callbackUrl: "/edit-profile" });

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <LandingHeader />

      <main className="flex-grow">
        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-24 pt-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24">
          <motion.div
            variants={staggerContainer(0.1, 0)}
            initial="hidden"
            animate="show"
          >
            {/* Eyebrow */}
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
            >
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-money" />
              Solana-powered support
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="mt-5 text-[2.75rem] font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl"
            >
              Get paid in crypto.
              <br />
              <span className="text-gradient">Keep all of it.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-muted-foreground"
            >
              DAOnation is the fastest way for creators to receive support — a
              shareable link, your wallet, near-zero fees. No middlemen, settled
              on Solana in seconds.
            </motion.p>

            {/* Claim form */}
            <motion.form
              variants={fadeUp}
              onSubmit={(e) => {
                e.preventDefault();
                startOnboarding();
              }}
              className="mt-8 flex max-w-md items-stretch overflow-hidden rounded-xl border border-border bg-surface transition-colors focus-within:border-border-emphasis"
            >
              <span className="flex items-center pl-4 font-mono text-[13px] text-muted-foreground select-none">
                daonation.xyz/
              </span>
              <input
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                placeholder="your-name"
                aria-label="Claim your username"
                className="min-w-0 flex-1 bg-transparent px-1 py-3 font-mono text-[13px] text-foreground outline-none placeholder:text-muted-foreground/50"
              />
              <Button type="submit" variant="brand" className="m-1 shrink-0">
                Claim
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.form>

            {/* Trust signals */}
            <motion.div
              variants={fadeUp}
              className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              {TRUST.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground"
                >
                  <Icon className="h-3.5 w-3.5 text-money" />
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Product preview — stable, no float animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="relative mx-auto w-full max-w-sm"
          >
            {/* Single, restrained ambient glow — one moment per page */}
            <div
              aria-hidden
              className="absolute -inset-10 -z-10 rounded-[3rem] bg-brand/[0.06] blur-3xl"
            />
            <ProfilePreview />
          </motion.div>
        </section>

        {/* ── How it works ────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="mb-14 max-w-xl"
          >
            <h2 className="text-3xl font-bold tracking-[-0.03em]">
              Live in three steps
            </h2>
            <p className="mt-2.5 text-muted-foreground">
              No contracts to deploy. No approvals to wait on. No fees taken.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-px border border-border rounded-xl overflow-hidden md:grid-cols-3"
          >
            {STEPS.map(({ step, icon: Icon, title, body }) => (
              <motion.div
                key={step}
                variants={fadeUp}
                className="relative bg-card p-6 hover:bg-surface transition-colors duration-200"
              >
                {/* Step number — large, editorial, recedes */}
                <span className="absolute right-5 top-5 font-mono text-[11px] font-medium tracking-widest text-muted-foreground/40 select-none">
                  {step}
                </span>
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-surface text-brand">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-28 sm:px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-surface px-8 py-16 text-center sm:px-16"
          >
            {/* Subtle top-center glow — contained, not spilling */}
            <div
              aria-hidden
              className="absolute inset-x-0 -top-20 -z-10 mx-auto h-40 w-1/2 rounded-full bg-brand/10 blur-3xl"
            />

            <LogoMark className="mx-auto mb-5 h-10 w-10 rounded-xl" />

            <h2 className="text-3xl font-bold tracking-[-0.03em] sm:text-[2.5rem]">
              Ready to get supported?
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
              Claim your link and start receiving crypto in the next five
              minutes. It&apos;s free forever.
            </p>

            <Button
              variant="brand"
              size="xl"
              className="mt-8"
              onClick={startOnboarding}
            >
              Start earning — it&apos;s free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

/* ── Profile Preview Card ───────────────────────────────────────────── */

const PREVIEW_PRESETS: [string, string][] = [
  ["0.1", "$7"],
  ["0.5", "$34"],
  ["1", "$69"],
  ["5", "$345"],
];

function ProfilePreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_32px_64px_-24px_rgba(0,0,0,0.9)]">
      {/* Cover */}
      <div className="relative h-[100px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(130%_140%_at_15%_0%,#3d1d72_0%,#1a2048_46%,#0d2e24_100%)]" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
      </div>

      <div className="px-5 pb-5">
        {/* Avatar + badge */}
        <div className="-mt-9 flex items-end justify-between">
          <div className="flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-xl border-[3px] border-card bg-[#0a0a14] ring-1 ring-white/8">
            <img src="/sol.png" alt="" className="h-9 w-9 object-contain" />
          </div>
          <span className="mb-1.5 inline-flex items-center gap-1 rounded-full border border-money/25 bg-money/8 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide text-money">
            <BadgeCheck className="h-2.5 w-2.5" />
            On-chain
          </span>
        </div>

        {/* Identity */}
        <div className="mt-3">
          <p className="text-[15px] font-semibold leading-tight tracking-tight">
            Satoshi Nakamoto
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            @satoshi
          </p>
        </div>

        <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
          Building open money. Your support funds open-source work. 🪙
        </p>

        {/* Support widget */}
        <div className="mt-4 rounded-xl border border-border bg-surface p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-widest text-money">
              Support in SOL
            </span>
            <Wallet className="h-3 w-3 text-money" />
          </div>

          <div className="mt-2.5 grid grid-cols-4 gap-1">
            {PREVIEW_PRESETS.map(([sol, usd]) => (
              <div
                key={sol}
                className="rounded-md border border-border bg-surface-2 py-1.5 text-center"
              >
                <div className="font-mono text-[11px] font-semibold tabular-nums">
                  {sol}
                </div>
                <div className="font-mono text-[9px] text-muted-foreground tabular-nums">
                  {usd}
                </div>
              </div>
            ))}
          </div>

          <div className="brand-gradient mt-2 flex items-center justify-center rounded-md py-2 text-[11px] font-semibold text-white">
            Send support
          </div>
        </div>
      </div>
    </div>
  );
}
