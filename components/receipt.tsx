import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hash } from "@/components/ui/hash";
import { Ledger, LedgerRow } from "@/components/ui/ledger";
import { Money } from "@/components/ui/money";
import { PaidMark, Stamp } from "@/components/ui/stamp";
import { Wordmark } from "@/components/ui/logo";
import {
  getSolanaNetworkConfig,
  getSolscanTransactionUrl,
} from "@/lib/solana/cluster";

/**
 * The receipt.
 *
 * This is the artefact the whole product exists to produce, so it is not a
 * success modal with confetti — it is a piece of till roll: torn top and
 * bottom, the amount set large and black, every fact stated on its own
 * ruled line, and the signature printed in full so it can be checked.
 *
 * The one animation in the product with a reason to exist is here: the
 * sheet unrolls downward, the way paper leaves a printer.
 */
export function Receipt({
  signature,
  amount,
  toPublicKey,
  fromPublicKey,
  status,
  createdAt,
  priceUsd,
  creatorUsername,
  creatorName,
}: {
  signature: string;
  amount: string;
  toPublicKey: string;
  fromPublicKey: string;
  status: string;
  createdAt: Date | null;
  priceUsd: number | null;
  creatorUsername?: string;
  creatorName?: string;
}) {
  const settled = /confirmed|finalized/i.test(status);
  const network = getSolanaNetworkConfig();

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="perforated animate-print bg-sheet">
        {/* Masthead */}
        <div className="flex items-center justify-between border-b border-rule px-5 pb-3 pt-6">
          <Wordmark size="sm" />
          <span className="field-label">Receipt</span>
        </div>

        {/* The amount — the news on this page */}
        <div className="px-5 py-8 text-center">
          <p className="field-label">Amount</p>
          <div className="mt-3">
            <Money
              sol={amount}
              priceUsd={priceUsd}
              size="xl"
              fiat="below"
              className="items-center"
            />
          </div>
          <div className="mt-6 flex justify-center">
            {settled ? (
              <PaidMark />
            ) : (
              <p className="max-w-[30ch] text-[12.5px] leading-relaxed text-pending">
                The cluster is still confirming this. It is already on its way —
                reload in a few seconds.
              </p>
            )}
          </div>
        </div>

        {/* The facts */}
        <Ledger className="border-x-0">
          <LedgerRow label="To">
            <span className="flex flex-col items-end gap-1">
              {creatorName && (
                <span className="text-[13px] text-ink">{creatorName}</span>
              )}
              <Hash value={toPublicKey} label="recipient address" />
            </span>
          </LedgerRow>
          <LedgerRow label="From">
            <Hash value={fromPublicKey} label="sender address" />
          </LedgerRow>
          <LedgerRow label="Date">
            <span className="figure text-[12.5px] text-ink-soft">
              {createdAt
                ? new Date(createdAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Unavailable"}
            </span>
          </LedgerRow>
          <LedgerRow label="Network">
            <span className="text-[13px] text-ink-soft">{network.label}</span>
          </LedgerRow>
          <LedgerRow label="Status">
            <Stamp status={status} />
          </LedgerRow>
          <LedgerRow label="Signature" stacked>
            <Hash value={signature} full size="xs" label="signature" />
          </LedgerRow>
        </Ledger>

        {/* Verification */}
        <div className="px-5 pb-8 pt-5">
          <Button asChild variant="outline" block>
            <a
              href={getSolscanTransactionUrl(signature, network)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Check it on Solscan
              <ExternalLink aria-hidden />
            </a>
          </Button>
          <p className="mt-3 text-center text-[12px] leading-relaxed text-ink-faint">
            This transfer is on the public ledger. Nobody — including us — can
            reverse or reroute it.
          </p>
        </div>
      </div>

      {/* Below the tear line: where to go next */}
      <div className="mt-8 flex flex-col items-center gap-4 text-center">
        {creatorUsername && (
          <Button asChild variant="quiet" size="sm">
            <Link href={`/${creatorUsername}`}>Back to @{creatorUsername}</Link>
          </Button>
        )}

        <div className="w-full border-t border-rule pt-6">
          <p className="font-serif text-[19px] leading-snug text-ink">
            Collecting support yourself?
          </p>
          <p className="mx-auto mt-1.5 max-w-[34ch] text-[13px] leading-relaxed text-ink-faint">
            Claim a link, share it, and receipts like this one land in your
            wallet.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/">
              Start a page
              <ArrowUpRight aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
