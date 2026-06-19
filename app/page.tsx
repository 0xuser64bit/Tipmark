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
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";

const STEPS = [
  {
    icon: Link2,
    title: "Claim your link",
    body: "Pick a @handle and drop in your Solana wallet. Takes under a minute.",
  },
  {
    icon: Share2,
    title: "Share it anywhere",
    body: "Post your link or QR card in your bio, threads, videos, or streams.",
  },
  {
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
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40" />
      <LandingHeader />

      <main className="flex-grow">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
          <motion.div
            variants={staggerContainer(0.12, 0.05)}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              Crypto support, the way it should be
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
            >
              Get paid in crypto.
              <br />
              <span className="text-gradient">Keep all of it.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-xl text-lg text-muted-foreground"
            >
              DAOnation is the fastest way for creators to receive support — a
              shareable link, your wallet, near-zero fees. No middlemen, settled
              on Solana in seconds.
            </motion.p>

            {/* Claim link */}
            <motion.form
              variants={fadeUp}
              onSubmit={(e) => {
                e.preventDefault();
                startOnboarding();
              }}
              className="mt-7 flex max-w-md items-stretch overflow-hidden rounded-xl border border-border bg-surface focus-within:border-brand/50"
            >
              <span className="flex items-center pl-3 font-mono text-sm text-muted-foreground">
                daonation.xyz/
              </span>
              <input
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                placeholder="your-name"
                className="min-w-0 flex-1 bg-transparent px-1 py-3 font-mono text-sm outline-none placeholder:text-muted-foreground/60"
              />
              <Button type="submit" variant="brand" className="m-1 shrink-0">
                Claim
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.form>

            <motion.div
              variants={fadeUp}
              className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              {TRUST.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <Icon className="h-4 w-4 text-money" />
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Product showcase */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div
              aria-hidden
              className="absolute -inset-8 -z-10 rounded-[3rem] bg-brand/10 blur-3xl"
            />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ProfilePreview />
            </motion.div>
          </motion.div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="mb-10 text-center"
          >
            <h2 className="text-3xl font-semibold tracking-tight">
              Live in three steps
            </h2>
            <p className="mt-2 text-muted-foreground">
              No contracts to deploy, no approvals to wait on.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.12)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-5 md:grid-cols-3"
          >
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="relative overflow-hidden rounded-3xl border border-brand/20 bg-surface p-10 text-center sm:p-16"
          >
            <div
              aria-hidden
              className="absolute inset-x-0 -top-24 -z-10 mx-auto h-48 w-2/3 rounded-full bg-brand/15 blur-3xl"
            />
            <LogoMark className="mx-auto mb-5 h-11 w-11 rounded-xl" />
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to get supported?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Claim your link and start receiving crypto in the next five
              minutes. It&apos;s free.
            </p>
            <Button
              variant="brand"
              size="xl"
              className="mt-7"
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

const PREVIEW_PRESETS: [string, string][] = [
  ["0.1", "$7"],
  ["0.5", "$34"],
  ["1", "$69"],
  ["5", "$345"],
];

function ProfilePreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-24px_rgba(0,0,0,0.8)]">
      {/* Cover */}
      <div className="relative h-28 w-full overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(130%_140%_at_15%_0%,#5b2da6_0%,#21305a_46%,#0f3c31_100%)]" />
        <div className="absolute inset-0 bg-grid opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
      </div>

      <div className="px-5 pb-5">
        <div className="-mt-10 flex items-end justify-between">
          <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-[#0c0c12] shadow-xl ring-1 ring-white/10">
            <img src="/sol.png" alt="" className="h-10 w-10 object-contain" />
          </div>
          <span className="mb-2 inline-flex items-center gap-1 rounded-full border border-money/30 bg-money/10 px-2.5 py-0.5 text-[11px] font-medium text-money">
            <BadgeCheck className="h-3 w-3" /> On-chain
          </span>
        </div>

        <div className="mt-3">
          <p className="text-lg font-semibold tracking-tight">
            Satoshi Nakamoto
          </p>
          <p className="font-mono text-xs text-muted-foreground">@satoshi</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Building open money. Your support funds open-source work. 🪙
        </p>

        {/* Support widget */}
        <div className="mt-4 rounded-xl border border-border bg-surface-2/40 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-money">
              Support in SOL
            </span>
            <Wallet className="h-3.5 w-3.5 text-money" />
          </div>
          <div className="mt-2.5 grid grid-cols-4 gap-1.5">
            {PREVIEW_PRESETS.map(([sol, usd]) => (
              <div
                key={sol}
                className="rounded-md border border-border bg-surface py-1.5 text-center"
              >
                <div className="font-mono text-xs font-semibold tabular-nums">
                  {sol}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground tabular-nums">
                  {usd}
                </div>
              </div>
            ))}
          </div>
          <div className="brand-gradient mt-2.5 flex items-center justify-center rounded-md py-2 text-xs font-semibold text-white">
            Send support
          </div>
        </div>
      </div>
    </div>
  );
}
