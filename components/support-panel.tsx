"use client";

import { addTransactionToDB } from "@/actions/addTransactionToDB";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Hash } from "./ui/hash";
import { Input } from "./ui/input";
import { Ledger, LedgerRow } from "./ui/ledger";
import { Money } from "./ui/money";
import { Panel, PanelHeader, PanelTitle } from "./ui/panel";
import { useWalletConnect } from "./wallet-adapter-wrapper";
import { formatSol, formatUsd } from "@/lib/format";
import { useSolPrice } from "@/lib/use-sol-price";
import { cn } from "@/lib/utils";

/**
 * The money moment, modelled as a receipt being filled in.
 *
 * A tipping ladder, not a whale ladder: at a few hundred dollars per SOL
 * these land near $2 / $10 / $50 / $200.
 */
const PRESETS = [0.01, 0.05, 0.25, 1] as const;

/** Solana's base signature fee: 5,000 lamports. */
const NETWORK_FEE = 5_000 / LAMPORTS_PER_SOL;

/** Leave enough behind to cover rent-exemption edge cases and the fee. */
const BALANCE_HEADROOM = NETWORK_FEE * 2;

type Choice = (typeof PRESETS)[number] | "custom";

export function SupportPanel({
  displayName,
  solanaAddress,
  email,
}: {
  displayName: string;
  solanaAddress: string;
  email: string;
}) {
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connecting } = useWallet();
  const { requestConnect } = useWalletConnect();
  const { usd: solPrice } = useSolPrice();

  const [choice, setChoice] = useState<Choice>(PRESETS[1]);
  const [custom, setCustom] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const amount = choice === "custom" ? parseFloat(custom) || 0 : choice;
  const total = amount > 0 ? amount + NETWORK_FEE : 0;
  const connected = Boolean(publicKey);

  /* Knowing the balance up front prevents a failed transaction, which is a
     far worse experience than a disabled button with a reason. */
  useEffect(() => {
    if (!publicKey || !connection) {
      setBalance(null);
      return;
    }
    let live = true;
    connection
      .getBalance(publicKey)
      .then((lamports) => {
        if (live) setBalance(lamports / LAMPORTS_PER_SOL);
      })
      .catch(() => {
        if (live) setBalance(null);
      });
    return () => {
      live = false;
    };
  }, [publicKey, connection, sending]);

  const shortOfFunds =
    balance != null && amount > 0 && total + BALANCE_HEADROOM > balance;

  const send = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!connected || !connection) {
        requestConnect();
        return;
      }
      if (!(amount > 0)) {
        toast.error("Enter an amount above zero.");
        return;
      }
      if (shortOfFunds) {
        toast.error("Not enough SOL in this wallet for that amount.");
        return;
      }

      setSending(true);
      try {
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey!,
            toPubkey: new PublicKey(solanaAddress),
            lamports: Math.round(LAMPORTS_PER_SOL * amount),
          }),
        );

        const signature = await sendTransaction(tx, connection);

        /* Poll briefly for a confirmation status so the receipt can state
           what the cluster actually said, rather than guessing. */
        let status = (await connection.getSignatureStatus(signature))?.value;
        for (let i = 0; i < 10 && !status; i++) {
          await new Promise((r) => setTimeout(r, 1000));
          status = (await connection.getSignatureStatus(signature))?.value;
        }

        await addTransactionToDB({
          userId: email,
          hash: signature,
          amount: amount.toString(),
          fromPublicKey: publicKey!.toString(),
          toPublicKey: solanaAddress,
          status: status?.confirmationStatus ?? "processing",
        });

        router.push(`/check-explorer/${signature}`);
      } catch (error) {
        const message =
          error instanceof Error && /reject|cancel|denied/i.test(error.message)
            ? "You cancelled the transaction."
            : "That didn't go through. Nothing was sent — try again.";
        toast.error(message);
        setSending(false);
      }
    },
    [
      amount,
      connected,
      connection,
      email,
      publicKey,
      router,
      sendTransaction,
      requestConnect,
      shortOfFunds,
      solanaAddress,
    ],
  );

  const firstName = displayName?.trim().split(/\s+/)[0] || "them";

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Send support</PanelTitle>
        <span className="field-label">SOL</span>
      </PanelHeader>

      <form onSubmit={send}>
        {/* ── Amount: one segmented control, not four cards ─────────── */}
        <fieldset className="p-4 pb-0">
          <legend className="sr-only">Amount to send</legend>
          <div className="flex divide-x divide-rule overflow-hidden rounded-[4px] border border-rule">
            {PRESETS.map((preset) => {
              const active = choice === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setChoice(preset)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors duration-100",
                    active
                      ? "bg-ink text-paper"
                      : "bg-sheet text-ink-soft hover:bg-well",
                  )}
                >
                  <span className="figure text-[13.5px] font-medium">
                    {preset}
                  </span>
                  <span
                    className={cn(
                      "figure text-[10px]",
                      active ? "text-paper/60" : "text-ink-ghost",
                    )}
                  >
                    {solPrice != null ? formatUsd(preset * solPrice) : "—"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom amount */}
          <div className="mt-2.5 flex items-center gap-2">
            <label htmlFor="custom-amount" className="field-label shrink-0">
              or
            </label>
            <div className="relative flex-1">
              <Input
                id="custom-amount"
                type="number"
                step="0.001"
                min="0"
                inputMode="decimal"
                placeholder="Any amount"
                value={custom}
                onChange={(e) => {
                  setCustom(e.target.value);
                  setChoice("custom");
                }}
                onFocus={() => setChoice("custom")}
                aria-invalid={choice === "custom" && shortOfFunds}
                className={cn(
                  "figure h-9 pr-11 text-[13.5px]",
                  choice === "custom" && custom && "border-ink-faint bg-sheet",
                )}
              />
              <span className="field-label pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                SOL
              </span>
            </div>
          </div>
        </fieldset>

        {/* ── The receipt ───────────────────────────────────────────── */}
        <div className="mt-4">
          <Ledger className="border-x-0">
            <LedgerRow label="To">
              <span className="flex flex-wrap items-baseline justify-end gap-x-2">
                <span className="text-[13px] text-ink-soft">{displayName}</span>
                <Hash value={solanaAddress} label="wallet address" />
              </span>
            </LedgerRow>
            <LedgerRow label="Amount">
              {amount > 0 ? (
                <Money sol={amount} size="sm" />
              ) : (
                <span className="figure text-[13px] text-ink-ghost">—</span>
              )}
            </LedgerRow>
            <LedgerRow label="Solana fee">
              <span className="figure text-[13px] text-ink-soft">
                {NETWORK_FEE.toFixed(6)}
              </span>
            </LedgerRow>
            <LedgerRow label="Tipmark fee">
              <span className="text-[13px] font-medium text-stamp">None</span>
            </LedgerRow>
            <LedgerRow label="Leaves your wallet" total>
              {total > 0 ? (
                <Money
                  sol={total}
                  priceUsd={solPrice}
                  size="md"
                  fiat="beside"
                  decimals={6}
                />
              ) : (
                <span className="figure text-[15px] text-ink-ghost">—</span>
              )}
            </LedgerRow>
          </Ledger>
        </div>

        {/* ── Action ────────────────────────────────────────────────── */}
        <div className="p-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            block
            loading={sending || connecting}
            loadingText={sending ? "Confirming in your wallet…" : "Connecting…"}
            disabled={connected && (!(amount > 0) || shortOfFunds)}
          >
            {connected
              ? amount > 0
                ? `Send ${formatSol(amount)} SOL`
                : "Choose an amount"
              : "Connect a wallet to send"}
          </Button>

          <p className="mt-2.5 text-center text-[12px] leading-snug text-ink-faint">
            {shortOfFunds ? (
              <span className="text-seal">
                This wallet holds {formatSol(balance ?? 0)} SOL — not enough for
                that amount plus the fee.
              </span>
            ) : connected ? (
              <>
                Straight from your wallet to {firstName}&rsquo;s.
                {balance != null && (
                  <>
                    {" "}
                    <span className="figure text-ink-ghost">
                      Balance {formatSol(balance)} SOL
                    </span>
                  </>
                )}
              </>
            ) : (
              <>Nothing is charged until you approve it in your wallet.</>
            )}
          </p>
        </div>
      </form>
    </Panel>
  );
}
