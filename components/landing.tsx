"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { Button } from "./ui/button";
import { Ledger, LedgerRow } from "./ui/ledger";
import { Money } from "./ui/money";
import { PaidMark } from "./ui/stamp";
import { Wordmark } from "./ui/logo";
import { cn } from "@/lib/utils";
import { BRAND_DOMAIN, BRAND_NAME } from "@/lib/brand";

/* ── Content ────────────────────────────────────────────────────────── */

const STEPS = [
  {
    n: "01",
    title: "Claim a handle",
    body: "Sign in with Google and pick your link. Nothing to install, nothing to deploy.",
  },
  {
    n: "02",
    title: "Paste your wallet address",
    body: `Your own Solana address. ${BRAND_NAME} stores it and nothing else — no keys, no custody, no balance of yours to hold.`,
  },
  {
    n: "03",
    title: "Put the link where people are",
    body: "A bio, a video description, a stream overlay, the footer of a newsletter. There is a QR card for the offline version.",
  },
  {
    n: "04",
    title: "Money lands in your wallet",
    body: "Not a balance you withdraw later. The transfer is direct, settles in about a second, and prints a receipt anyone can check.",
  },
];

/** Published rates, rounded. See the note under the table. */
const COSTS = [
  { name: "Patreon", cut: "8–12%", processing: "~2.9% + 30¢", keep: "$85–89" },
  {
    name: "Buy Me a Coffee",
    cut: "5%",
    processing: "~2.9% + 30¢",
    keep: "≈ $92",
  },
  {
    name: "Ko-fi Gold",
    cut: "0% + $6/mo",
    processing: "~2.9% + 30¢",
    keep: "≈ $97",
  },
  {
    name: BRAND_NAME,
    cut: "0%",
    processing: "≈ $0.0004",
    keep: "$100.00",
    ours: true,
  },
];

const CAVEATS = [
  {
    q: "You get paid in SOL, and SOL moves.",
    a: "A contribution worth $50 today may be worth $40 or $65 next month. Convert on an exchange if you want dollars.",
  },
  {
    q: "Your supporters need a Solana wallet.",
    a: "Phantom, Solflare and Backpack take a couple of minutes to set up. Outside crypto circles that is a real barrier, and no amount of design fixes it.",
  },
  {
    q: "Transfers are final.",
    a: "There is no chargeback, no refund button and no dispute process. That is what makes the fee near zero. It also means a mistake stays made.",
  },
  {
    q: "We can't help you recover a wallet.",
    a: "We never hold your funds, which also means we can never return them. Your keys are entirely yours.",
  },
];

/* ── Page ───────────────────────────────────────────────────────────── */

export function Landing({ priceUsd }: { priceUsd: number | null }) {
  const [handle, setHandle] = useState("");

  const start = (desired?: string) => {
    const slug = (desired ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/^-+|-+$/g, "");
    const callbackUrl = slug
      ? `/edit-profile?handle=${encodeURIComponent(slug)}`
      : "/edit-profile";
    signIn("google", { redirect: true, callbackUrl });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        actions={
          <>
            <Link
              href="/about-us"
              className="hidden px-2 text-[13.5px] text-ink-faint transition-colors hover:text-ink sm:block"
            >
              How it works
            </Link>
            <Button variant="primary" size="sm" onClick={() => start(handle)}>
              Start a page
            </Button>
          </>
        }
      />

      <main id="main" className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-[1120px] px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
          <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_384px] lg:gap-20">
            <div>
              <h1 className="max-w-[18ch] text-[clamp(2.6rem,7vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.03em]">
                A tip jar that keeps nothing.
              </h1>

              <p className="mt-7 max-w-[46ch] font-serif text-[clamp(1.0625rem,1.7vw,1.25rem)] leading-[1.55] text-ink-soft">
                Share one link. People send SOL straight from their wallet to
                yours. {BRAND_NAME} never holds the money, never takes a
                percentage, and leaves a receipt you can check on Solana.
              </p>

              {/* The one interaction on the page */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  start(handle);
                }}
                className="mt-9 max-w-[440px]"
              >
                <label htmlFor="claim" className="field-label">
                  Claim your link
                </label>
                <div className="mt-2.5 flex items-stretch rounded-[4px] border border-rule-strong bg-sheet transition-colors focus-within:outline-2 focus-within:outline-offset-[-1px] focus-within:outline-stamp">
                  <span className="figure flex select-none items-center pl-3.5 text-[13.5px] text-ink-faint">
                    {BRAND_DOMAIN}/
                  </span>
                  <input
                    id="claim"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="your-name"
                    autoComplete="off"
                    spellCheck={false}
                    className="figure min-w-0 flex-1 bg-transparent py-3 pl-px pr-2 text-[13.5px] text-ink outline-none placeholder:text-ink-ghost"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    className="m-[5px] shrink-0"
                  >
                    Claim
                    <ArrowRight aria-hidden />
                  </Button>
                </div>
                <p className="mt-2.5 text-[12.5px] text-ink-faint">
                  Free. Takes about a minute. You keep your keys.
                </p>
              </form>
            </div>

            {/* ── Specimen: the artefact the product makes ──────────── */}
            <figure className="mx-auto w-full max-w-[340px] lg:mx-0">
              <ReceiptSpecimen priceUsd={priceUsd} />
              <figcaption className="mt-5 border-t border-rule pt-3.5 text-[12.5px] leading-relaxed text-ink-faint">
                Every contribution prints one of these — for the person who sent
                it and for you. It is the transaction itself, not a notification
                about one.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ── The argument: what it costs ───────────────────────────── */}
        <section className="border-t border-rule bg-well/40">
          <div className="mx-auto max-w-[1120px] px-5 py-16 sm:px-8 sm:py-20">
            <div className="grid items-end gap-6 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <p className="field-label">What it costs</p>
                <h2 className="mt-3.5 max-w-[22ch] text-[clamp(1.75rem,3.6vw,2.5rem)] font-medium">
                  On $100, here is what reaches you.
                </h2>
              </div>
              <p className="max-w-[36ch] text-[13.5px] leading-relaxed text-ink-faint sm:text-right">
                Nothing is deducted on the way, because nothing passes through
                us on the way.
              </p>
            </div>

            {/* Wide: a real table. Narrow: one block per service, so the
                figure that matters is never scrolled off the screen. */}
            <table className="mt-10 hidden w-full border-collapse text-left sm:table">
              <thead>
                <tr className="border-y border-rule">
                  <th scope="col" className="field-label py-2.5 pr-4">
                    Service
                  </th>
                  <th scope="col" className="field-label py-2.5 pr-4">
                    Platform cut
                  </th>
                  <th scope="col" className="field-label py-2.5 pr-4">
                    Processing
                  </th>
                  <th scope="col" className="field-label py-2.5 text-right">
                    You keep
                  </th>
                </tr>
              </thead>
              <tbody>
                {COSTS.map((row) => (
                  <tr
                    key={row.name}
                    className={cn(
                      "border-b border-rule",
                      row.ours && "border-b-2 border-b-ink bg-sheet",
                    )}
                  >
                    <td
                      className={cn(
                        "py-3.5 pr-4 text-[14px]",
                        row.ours ? "font-medium text-ink" : "text-ink-soft",
                      )}
                    >
                      {row.ours ? <Wordmark size="sm" /> : row.name}
                    </td>
                    <td className="figure py-3.5 pr-4 text-[13px] text-ink-soft">
                      {row.cut}
                    </td>
                    <td className="figure py-3.5 pr-4 text-[13px] text-ink-soft">
                      {row.processing}
                    </td>
                    <td
                      className={cn(
                        "figure py-3.5 text-right",
                        row.ours
                          ? "text-[18px] font-medium text-ink"
                          : "text-[14px] text-ink-soft",
                      )}
                    >
                      {row.keep}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="mt-8 border-t border-rule sm:hidden">
              {COSTS.map((row) => (
                <li
                  key={row.name}
                  className={cn(
                    "border-b border-rule px-3 py-3.5",
                    row.ours && "-mx-3 border-b-2 border-b-ink bg-sheet",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span
                      className={cn(
                        "text-[14px]",
                        row.ours ? "font-medium text-ink" : "text-ink-soft",
                      )}
                    >
                      {row.ours ? <Wordmark size="sm" /> : row.name}
                    </span>
                    <span
                      className={cn(
                        "figure shrink-0",
                        row.ours
                          ? "text-[18px] font-medium text-ink"
                          : "text-[14px] text-ink-soft",
                      )}
                    >
                      {row.keep}
                    </span>
                  </div>
                  <p className="figure mt-1.5 text-[11.5px] text-ink-faint">
                    {row.cut} platform · {row.processing} processing
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-4 max-w-[70ch] text-[12px] leading-relaxed text-ink-faint">
              Figures are each service&rsquo;s published rates for a $100
              contribution, rounded, and they change — check the current ones
              before you decide. The Solana network fee is roughly $0.0004 per
              transfer and is paid by the sender, not by you.
            </p>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-[1120px] px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
            <div className="lg:sticky lg:top-10 lg:self-start">
              <p className="field-label">How it works</p>
              <h2 className="mt-3.5 max-w-[18ch] text-[clamp(1.75rem,3.6vw,2.5rem)] font-medium">
                Four steps, then you are done forever.
              </h2>
            </div>

            <ol className="border-t border-rule">
              {STEPS.map(({ n, title, body }) => (
                <li
                  key={n}
                  className="grid gap-x-5 gap-y-1.5 border-b border-rule py-6 sm:grid-cols-[2.5rem_minmax(0,1fr)]"
                >
                  <span className="figure pt-0.5 text-[13px] text-ink-ghost">
                    {n}
                  </span>
                  <div>
                    <h3 className="font-sans text-[15px] font-semibold tracking-[-0.005em]">
                      {title}
                    </h3>
                    <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-ink-faint">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── The honest part ──────────────────────────────────────── */}
        <section className="border-t border-rule">
          <div className="mx-auto max-w-[1120px] px-5 py-16 sm:px-8 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
              <div className="lg:sticky lg:top-10 lg:self-start">
                <p className="field-label">Before you commit</p>
                <h2 className="mt-3.5 max-w-[18ch] text-[clamp(1.75rem,3.6vw,2.5rem)] font-medium">
                  Four reasons this might not suit you.
                </h2>
                <p className="mt-5 max-w-[40ch] font-serif text-[17px] leading-relaxed text-ink-soft">
                  Crypto payments are a genuinely better deal on fees and a
                  genuinely worse deal on convenience. You should know which
                  trade you are making.
                </p>
              </div>

              <dl className="border-t border-rule">
                {CAVEATS.map(({ q, a }) => (
                  <div key={q} className="border-b border-rule py-6">
                    <dt className="font-sans text-[14.5px] font-semibold tracking-[-0.005em]">
                      {q}
                    </dt>
                    <dd className="mt-2 max-w-[62ch] text-[13.5px] leading-relaxed text-ink-faint">
                      {a}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ── Close ────────────────────────────────────────────────── */}
        <section className="border-t border-rule bg-well/40">
          <div className="mx-auto flex max-w-[1120px] flex-col items-start gap-6 px-5 py-16 sm:flex-row sm:items-end sm:justify-between sm:px-8">
            <h2 className="max-w-[24ch] text-[clamp(1.6rem,3.2vw,2.2rem)] font-medium">
              Still yours if you leave. Claim the link anyway.
            </h2>
            <Button
              variant="primary"
              size="xl"
              onClick={() => start(handle)}
              className="shrink-0"
            >
              Start a page
              <ArrowRight aria-hidden />
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/* ── Specimen ───────────────────────────────────────────────────────── */

/**
 * A type specimen of a real receipt: honest sample data, no glow, no tilt,
 * no float. It is here because it is the clearest possible explanation of
 * what the product does.
 */
function ReceiptSpecimen({ priceUsd }: { priceUsd: number | null }) {
  return (
    <div className="perforated bg-sheet">
      <div className="flex items-center justify-between border-b border-rule px-5 pb-3 pt-6">
        <Wordmark size="sm" />
        <span className="field-label">Receipt</span>
      </div>

      <div className="px-5 py-7 text-center">
        <p className="field-label">Amount</p>
        <div className="mt-3">
          <Money
            sol={0.25}
            priceUsd={priceUsd}
            size="xl"
            fiat="below"
            className="items-center"
          />
        </div>
        <div className="mt-5 flex justify-center">
          <PaidMark />
        </div>
      </div>

      <Ledger className="border-x-0">
        <LedgerRow label="To">
          <span className="flex flex-col items-end gap-1">
            <span className="text-[13px] text-ink">Ada Lovelace</span>
            <span className="figure text-[12.5px] text-ink-soft">
              7Xk4…9fPq
            </span>
          </span>
        </LedgerRow>
        <LedgerRow label="From">
          <span className="figure text-[12.5px] text-ink-soft">9aBc…1dEf</span>
        </LedgerRow>
        <LedgerRow label="Solana fee">
          <span className="figure text-[12.5px] text-ink-soft">0.000005</span>
        </LedgerRow>
        <LedgerRow label={`${BRAND_NAME} fee`}>
          <span className="text-[13px] font-medium text-stamp">None</span>
        </LedgerRow>
      </Ledger>

      <div className="px-5 pb-7 pt-4">
        <p className="figure text-center text-[10.5px] leading-relaxed text-ink-ghost">
          5vJ9kQ2mR7…verified on Solana
        </p>
      </div>
    </div>
  );
}
