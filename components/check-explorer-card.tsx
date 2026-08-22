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
    <div className="flex w-full items-center justify-center p-4 min-h-[calc(100vh-140px)]">
      <Card className="relative w-full max-w-[440px] overflow-hidden p-0 border-border">
        <Confetti />

        <div className="flex flex-col items-center px-8 pt-10 text-center">
          <motion.div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-money-surface text-money ring-1 ring-money/20"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
          >
            <Check className="h-8 w-8" strokeWidth={3} />
          </motion.div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            Support sent
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground leading-relaxed">
            {creatorName
              ? `Your support is on its way to ${creatorName}.`
              : "Your support is on its way."}{" "}
            🚀
          </p>

          {amount && (
            <div className="mt-8 w-full rounded-xl border border-border bg-surface-2 p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">Amount</span>
                <SolAmount
                  sol={amount}
                  priceUsd={usd}
                  layout="inline"
                  amountClassName="text-lg font-bold text-foreground"
                />
              </div>
              {toPublicKey && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">To</span>
                  <AddressChip address={toPublicKey} />
                </div>
              )}
            </div>
          )}

          <div className="mt-5 w-full rounded-xl border border-border bg-surface p-4 text-left">
            <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">
              Transaction signature
            </p>
            <p className="mt-2 break-all font-mono text-[11px] text-brand-muted">
              {signature}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-8 pt-6">
          <Button asChild variant="outline" className="w-full h-11">
            <Link href={explorerUrl} target="_blank" rel="noopener noreferrer">
              View on Solscan
              <ExternalLink className="h-4 w-4 ml-1.5 opacity-70" />
            </Link>
          </Button>
          {creatorUsername && (
            <Button
              asChild
              variant="ghost"
              className="w-full h-11 text-muted-foreground"
            >
              <Link href={`/${creatorUsername}`}>Back to @{creatorUsername}</Link>
            </Button>
          )}

          <div className="mt-3 flex flex-col items-center justify-center border-t border-border pt-6">
            <p className="text-sm font-medium text-foreground">
              Want to get supported too?
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground text-center">
              Claim your own DAOnation page in seconds.
            </p>
            <Button asChild variant="brand" size="sm" className="mt-4">
              <Link href="/">
                Create your page
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
