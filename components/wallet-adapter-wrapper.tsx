"use client";

import { WalletReadyState } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { ArrowUpRight } from "lucide-react";
import React, { createContext, useContext, useMemo, useState } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./wallet-button-styles.css";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

/**
 * Every wallet the product recommends, with an honest one-line reason.
 * Kept short on purpose: three good options beat a directory.
 */
const WALLETS = [
  {
    name: "Phantom",
    href: "https://phantom.com/download",
    note: "The most widely used. Browser extension and mobile app.",
  },
  {
    name: "Solflare",
    href: "https://solflare.com/download",
    note: "Also supports hardware wallets if you have one.",
  },
  {
    name: "Backpack",
    href: "https://backpack.app/download",
    note: "Newer, with a well-regarded mobile app.",
  },
];

interface WalletConnectContext {
  /** Open the picker, or the explainer when there is nothing to pick. */
  requestConnect: () => void;
  /** Whether any wallet is actually available in this browser. */
  hasWallet: boolean;
}

const Ctx = createContext<WalletConnectContext>({
  requestConnect: () => {},
  hasWallet: false,
});

export const useWalletConnect = () => useContext(Ctx);

/**
 * Sits between the app and the adapter's picker.
 *
 * When a wallet is installed the adapter's modal is genuinely useful — it
 * detects what is there. When nothing is installed, the adapter shows a
 * pastel gradient icon and the sentence "You'll need a wallet on Solana to
 * continue", which is a dead end for precisely the person who most needs
 * help. That case gets a real answer instead.
 */
function WalletConnectProvider({ children }: { children: React.ReactNode }) {
  const { wallets } = useWallet();
  const { setVisible } = useWalletModal();
  const [explaining, setExplaining] = useState(false);

  const hasWallet = wallets.some(
    (w) =>
      w.readyState === WalletReadyState.Installed ||
      w.readyState === WalletReadyState.Loadable,
  );

  const value = useMemo(
    () => ({
      hasWallet,
      requestConnect: () => (hasWallet ? setVisible(true) : setExplaining(true)),
    }),
    [hasWallet, setVisible],
  );

  return (
    <Ctx.Provider value={value}>
      {children}

      <Dialog open={explaining} onOpenChange={setExplaining}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>You&rsquo;ll need a Solana wallet</DialogTitle>
            <DialogDescription>
              A wallet is a free app that holds your crypto and signs the
              transfer. It takes a couple of minutes to set up, and you keep it
              for everything else on Solana afterwards.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="p-0">
            <ul className="divide-y divide-rule border-b border-rule">
              {WALLETS.map(({ name, href, note }) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-well"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-ink">
                        {name}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-faint">
                        {note}
                      </span>
                    </div>
                    <ArrowUpRight
                      className="mt-0.5 size-4 shrink-0 text-ink-ghost transition-colors group-hover:text-ink"
                      aria-hidden
                    />
                  </a>
                </li>
              ))}
            </ul>

            <div className="px-5 py-4">
              <p className="text-[12.5px] leading-relaxed text-ink-faint">
                Once one is installed, reload this page and it will appear
                here. Never share your seed phrase with anyone — including us.
              </p>
              <Button
                variant="quiet"
                size="sm"
                className="mt-3 -ml-3"
                onClick={() => setExplaining(false)}
              >
                Maybe later
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}

export const WalletAdapterWrapper = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  /* The public cluster endpoint is rate-limited and unreliable for payment
     traffic — set NEXT_PUBLIC_SOLANA_RPC_URL to a dedicated RPC in prod. */
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("mainnet-beta"),
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <WalletConnectProvider>{children}</WalletConnectProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
