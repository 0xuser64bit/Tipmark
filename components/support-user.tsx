"use client";

import { addTransactionToDB } from "@/actions/addTransactionToDB";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { ShieldCheck, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AddressChip } from "./ui/address-chip";
import { Input } from "./ui/input";
import { LoadingButton } from "./ui/loading-button";
import { Spinner } from "./spinner";
import { formatUsd } from "@/lib/format";
import { useSolPrice } from "@/lib/use-sol-price";
import { cn } from "@/lib/utils";

const PRESET_AMOUNTS = [0.1, 0.5, 1, 5];

export const SupportUserCard = ({
  displayName,
  solana_address,
  email,
}: {
  displayName: string;
  solana_address: string;
  email: string;
}) => {
  const router = useRouter();
  const [customAmount, setCustomAmount] = useState("");
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { setVisible } = useWalletModal();
  const { usd: solPrice } = useSolPrice();

  const persistAndRedirect = async ({
    signature,
    amount,
    fromPubkey,
    toPubkey,
    status,
  }: {
    signature: string;
    amount: string;
    fromPubkey: string;
    toPubkey: string;
    status: string;
  }) => {
    const transaction = await addTransactionToDB({
      userId: email,
      hash: signature,
      amount,
      fromPublicKey: fromPubkey,
      toPublicKey: toPubkey,
      status,
    });
    if (transaction) {
      router.push(`/check-explorer/${signature}`);
    }
  };

  const handleSupportUser = async (
    e: React.SyntheticEvent,
    amount?: number,
  ) => {
    e.preventDefault();

    if (!connection || !publicKey) {
      setVisible(true);
      return;
    }

    const transferAmount = amount ?? parseFloat(customAmount);
    if (!transferAmount || transferAmount <= 0 || Number.isNaN(transferAmount)) {
      toast.error("Enter an amount greater than 0");
      return;
    }

    setIsLoading(true);
    setPendingAmount(amount ?? -1);
    try {
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(solana_address),
          lamports: Math.round(LAMPORTS_PER_SOL * transferAmount),
        }),
      );
      const signature = await sendTransaction(transaction, connection);
      const status = await connection.getSignatureStatus(signature);

      if (!status || !status.value) {
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const latestStatus = await connection.getSignatureStatus(signature);
          if (latestStatus && latestStatus.value) {
            await persistAndRedirect({
              signature,
              amount: transferAmount.toString(),
              fromPubkey: publicKey.toString(),
              toPubkey: solana_address,
              status: latestStatus.value.confirmationStatus || "confirmed",
            });
            break;
          }
          attempts++;
        }

        if (attempts >= maxAttempts) {
          await persistAndRedirect({
            signature,
            amount: transferAmount.toString(),
            fromPubkey: publicKey.toString(),
            toPubkey: solana_address,
            status: "processing",
          });
        }
      } else {
        await persistAndRedirect({
          signature,
          amount: transferAmount.toString(),
          fromPubkey: publicKey.toString(),
          toPubkey: solana_address,
          status: status.value.confirmationStatus || "confirmed",
        });
      }

      toast.success("Transaction sent!");
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error("Couldn't send the transaction. Please try again.");
    } finally {
      setIsLoading(false);
      setPendingAmount(null);
    }
  };

  const customUsd =
    solPrice != null && parseFloat(customAmount) > 0
      ? formatUsd(parseFloat(customAmount) * solPrice)
      : null;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Card header — unified surface, no inner border-bottom section */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Support in SOL
            </p>
            <h2 className="mt-1.5 text-[15px] font-semibold leading-tight tracking-tight">
              Send {displayName} some crypto
            </h2>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-money-surface text-money">
            <Wallet className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[13px] text-muted-foreground">
          <span>Goes directly to</span>
          <AddressChip address={solana_address} />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-border" />

      {/* Amount section */}
      <div className="space-y-4 p-5">
        {/* Preset amounts */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESET_AMOUNTS.map((amount) => {
            const usd = solPrice != null ? formatUsd(amount * solPrice) : null;
            const loadingThis = isLoading && pendingAmount === amount;
            return (
              <button
                key={amount}
                type="button"
                disabled={isLoading}
                onClick={(e) => handleSupportUser(e, amount)}
                className={cn(
                  "group flex flex-col items-center justify-center gap-0.5",
                  "rounded-lg border border-border bg-surface",
                  "py-3 px-2",
                  "transition-all duration-150",
                  "hover:border-border-emphasis hover:bg-surface-2",
                  "active:scale-[0.98]",
                  "disabled:opacity-50 disabled:pointer-events-none",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                )}
              >
                {loadingThis ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <span className="font-mono text-[13px] font-semibold tabular-nums">
                      {amount} SOL
                    </span>
                    {usd && (
                      <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                        {usd}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider with label */}
        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            or custom
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Custom amount form */}
        <form onSubmit={(e) => handleSupportUser(e)} className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="h-10 pr-14 font-mono tabular-nums"
                disabled={isLoading}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] font-medium text-muted-foreground">
                SOL
              </span>
            </div>
            <LoadingButton
              type="submit"
              variant="brand"
              className="h-10 px-5 shrink-0"
              isLoading={isLoading && pendingAmount === -1}
            >
              {publicKey ? "Send" : "Connect"}
            </LoadingButton>
          </div>
          {customUsd && (
            <p className="pl-1 font-mono text-[11px] text-muted-foreground tabular-nums">
              ≈ {customUsd}
            </p>
          )}
        </form>

        {/* Trust line */}
        <div className="flex items-center justify-center gap-1.5 pt-0.5 text-center text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 text-money" />
          <span>Non-custodial · settled on Solana</span>
        </div>
      </div>
    </div>
  );
};
