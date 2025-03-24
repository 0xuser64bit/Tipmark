"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { cn } from "@/lib/utils";

interface StylishWalletButtonProps {
  className?: string;
  iconSize?: number;
  showIcon?: boolean;
}

export const StylishWalletButton: React.FC<StylishWalletButtonProps> = ({
  className,
  iconSize = 18,
  showIcon = true,
}) => {
  const { connected } = useWallet();
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background effect */}
      <motion.div
        className="absolute inset-0 rounded-md"
        initial={{
          backgroundImage:
            "linear-gradient(45deg, rgba(79, 70, 229, 0.5), rgba(236, 72, 153, 0.5))",
          opacity: 0,
          borderRadius: "0.375rem",
        }}
        animate={{
          opacity: isHovered ? 0.8 : 0,
          scale: isHovered ? 1.05 : 1,
        }}
        style={{ filter: "blur(10px)" }}
        transition={{ duration: 0.2 }}
      />

      {/* Custom styling for the wallet button */}
      <WalletMultiButton
        className={cn(
          "wallet-adapter-button !bg-zinc-800 hover:!bg-zinc-700",
          "!border !border-zinc-700 hover:!border-zinc-600",
          "shadow-md hover:shadow-lg !transition-all !duration-300",
          "relative z-10 flex items-center gap-2 overflow-hidden",
          "!rounded-md !text-zinc-100 !px-4 !py-2 !font-medium",
          connected && "!bg-indigo-900/40 hover:!bg-indigo-800/50",
          className,
        )}
      >
        {showIcon && (
          <motion.span
            animate={{
              rotate: isHovered ? [0, -10, 10, -5, 5, 0] : 0,
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
              repeat: isHovered ? 0 : 0,
            }}
            className="flex items-center"
          >
            <Wallet size={iconSize} />
          </motion.span>
        )}

        {/* Shine effect */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 z-0"
            initial={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              left: "-100%",
            }}
            animate={{ left: "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        )}
      </WalletMultiButton>
    </div>
  );
};
