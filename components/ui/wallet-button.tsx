"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { cn } from "@/lib/utils";

interface StylishWalletButtonProps {
  className?: string;
}

/**
 * Calm, brand-aligned wallet trigger. Visual styling lives in
 * wallet-button-styles.css (scoped to .wallet-adapter-button-trigger) so it
 * survives Tailwind utility ordering. Connected state turns brand-purple.
 */
export const StylishWalletButton: React.FC<StylishWalletButtonProps> = ({
  className,
}) => {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-[148px] animate-pulse rounded-lg bg-surface" />;
  }

  return (
    <WalletMultiButton
      className={cn(connected && "wallet-connected", className)}
    />
  );
};
