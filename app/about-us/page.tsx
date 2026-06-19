"use client";

import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { Button } from "@/components/ui/button";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { motion } from "motion/react";
import { ArrowRight, Globe, ShieldCheck, Wallet, Zap } from "lucide-react";
import { signIn } from "next-auth/react";

const FEATURES = [
  {
    icon: Wallet,
    title: "Direct crypto payments",
    body: "Supporters send SOL straight to your wallet. No middlemen, no custody, no holds.",
  },
  {
    icon: Zap,
    title: "Fast & near-zero fees",
    body: "Solana settles in about a second for a fraction of a cent, so almost all of it reaches you.",
  },
  {
    icon: Globe,
    title: "Borderless by default",
    body: "Anyone, anywhere can support you. No bank account or payment processor required.",
  },
];

const STEPS = [
  "Sign in and claim your @handle.",
  "Add your Solana wallet, a photo, and a short bio.",
  "Share your link or QR card with your audience.",
  "Supporters connect a wallet and send SOL.",
  "It lands in your wallet instantly — verifiable on-chain.",
];

export default function AboutPage() {
  const startOnboarding = () =>
    signIn("google", { redirect: true, callbackUrl: "/edit-profile" });

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40" />
      <LandingHeader />

      <main className="mx-auto w-full max-w-3xl flex-grow px-4 py-16 sm:px-6">
        <motion.section
          variants={staggerContainer(0.1)}
          initial="hidden"
          animate="show"
          className="text-center"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-money" /> Non-custodial ·
            built on Solana
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            About <span className="text-gradient">DAOnation</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground"
          >
            Support your favorite creators directly with crypto. Think “Buy Me a
            Coffee”, but the money goes wallet-to-wallet and you can prove every
            cent on-chain.
          </motion.p>
        </motion.section>

        <motion.section
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-14 grid gap-5 sm:grid-cols-3"
        >
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold tracking-tight">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-14 rounded-2xl border border-border bg-card p-8"
        >
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <ol className="mt-6 space-y-4">
            {STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 font-mono text-xs font-semibold text-brand">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-14 text-center"
        >
          <h2 className="text-2xl font-semibold tracking-tight">
            Ready to support creators?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Claim your own page in seconds and start receiving crypto support.
          </p>
          <Button variant="brand" size="lg" className="mt-6" onClick={startOnboarding}>
            Get started
            <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.section>
      </main>

      <LandingFooter />
    </div>
  );
}
