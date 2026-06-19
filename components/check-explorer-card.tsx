"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddressChip } from "@/components/ui/address-chip";
import { SolAmount } from "@/components/ui/sol-amount";
import { Confetti } from "@/components/ui/confetti";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { useSolPrice } from "@/lib/use-sol-price";

interface CheckExplorerCardProps {
  signature: string;
  amount?: string;
  toPublicKey?: string;
  creatorUsername?: string;
  creatorName?: string;
}

export const CheckExplorerCard = ({
  signature,
  amount,
  toPublicKey,
  creatorUsername,
  creatorName,
}: CheckExplorerCardProps) => {
  const { usd } = useSolPrice();
  const explorerUrl = `https://solscan.io/tx/${signature}`;

  return (
    <Card className="relative w-full max-w-md overflow-hidden p-0">
      <Confetti />

      <div className="flex flex-col items-center px-6 pt-8 text-center">
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-money/15 text-money ring-1 ring-money/30"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
        >
          <Check className="h-8 w-8" strokeWidth={3} />
        </motion.div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight">
          Support sent
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {creatorName
            ? `Your support is on its way to ${creatorName}.`
            : "Your support is on its way."}{" "}
          🚀
        </p>

        {amount && (
          <div className="mt-5 w-full rounded-xl border border-border bg-surface-2/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Amount</span>
              <SolAmount
                sol={amount}
                priceUsd={usd}
                layout="inline"
                amountClassName="text-base"
              />
            </div>
            {toPublicKey && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">To</span>
                <AddressChip address={toPublicKey} />
              </div>
            )}
          </div>
        )}

        <div className="mt-4 w-full rounded-lg border border-border bg-surface p-3 text-left">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Transaction signature
          </p>
          <p className="mt-1 break-all font-mono text-xs text-brand-muted">
            {signature}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-6 pt-5">
        <Button asChild variant="outline" className="w-full">
          <Link href={explorerUrl} target="_blank" rel="noopener noreferrer">
            View on Solscan
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        {creatorUsername && (
          <Button
            asChild
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            <Link href={`/${creatorUsername}`}>Back to @{creatorUsername}</Link>
          </Button>
        )}

        <div className="mt-2 rounded-xl border border-brand/20 bg-brand/5 p-4 text-center">
          <p className="text-sm font-medium text-foreground">
            Want to get supported too?
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Claim your own DAOnation page in seconds.
          </p>
          <Button asChild variant="brand" size="sm" className="mt-3">
            <Link href="/">
              Create your page
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};
