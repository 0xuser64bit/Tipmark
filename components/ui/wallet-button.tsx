"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Check, ChevronDown, Copy, LogOut, Repeat, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { truncateAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useWalletConnect } from "../wallet-adapter-wrapper";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

/**
 * The wallet control, built from our own primitives.
 *
 * The adapter's `WalletMultiButton` hard-overwrites the className it is
 * given, so it can only be styled by overriding its stylesheet with
 * `!important` — a losing fight for a control this prominent. Composing it
 * from `useWallet` instead costs about sixty lines and puts the header's
 * most visible button inside the design system, where it belongs.
 * Connection routes through `useWalletConnect` so the no-wallet case gets a
 * real explainer rather than the adapter's dead-end modal.
 */
export function WalletTrigger({ className }: { className?: string }) {
  const { publicKey, wallet, connecting, disconnect } = useWallet();
  const { requestConnect } = useWalletConnect();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => setMounted(true), []);
  useEffect(() => () => clearTimeout(timer.current), []);

  /* Reserve the footprint so the header does not reflow on hydration. */
  if (!mounted) {
    return (
      <div
        aria-hidden
        className="h-8 w-[124px] animate-breathe rounded-[3px] border border-rule bg-well"
      />
    );
  }

  if (!publicKey) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={requestConnect}
        loading={connecting}
        loadingText="Connecting…"
        className={className}
      >
        <Wallet aria-hidden />
        <span className="hidden sm:inline">Connect wallet</span>
        <span className="sm:hidden">Connect</span>
      </Button>
    );
  }

  const address = publicKey.toBase58();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "border-stamp-edge bg-stamp-soft text-stamp hover:border-stamp/40 hover:bg-stamp-soft",
            className,
          )}
        >
          {wallet?.adapter.icon ? (
            <img
              src={wallet.adapter.icon}
              alt=""
              className="size-[15px] rounded-[2px]"
            />
          ) : (
            <Wallet aria-hidden />
          )}
          <span className="figure">{truncateAddress(address)}</span>
          <ChevronDown className="[&&]:size-3 opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={7} className="w-[248px]">
        <DropdownMenuLabel className="normal-case tracking-normal">
          <span className="block text-[10px] font-medium uppercase tracking-[0.1em] text-ink-ghost">
            {wallet?.adapter.name ?? "Wallet"}
          </span>
          <span className="figure mt-1 block break-all text-[11px] leading-snug text-ink-soft">
            {address}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copy}>
          {copied ? <Check className="[&&]:text-stamp" /> : <Copy />}
          {copied ? "Copied" : "Copy address"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={requestConnect}>
          <Repeat />
          Change wallet
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => disconnect()}>
          <LogOut />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
