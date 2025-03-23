"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { DropdownSettings } from "./dropdown";
import { StylishWalletButton } from "./ui/wallet-button";

export const Header = () => {
  const session = useSession();
  
  return (
    <header className="flex justify-between items-center mb-6">
      <div className="font-bold flex items-center justify-center cursor-pointer">
        DAOnation
      </div>
      <div className="flex gap-x-4 items-center">
        <StylishWalletButton />
        
        {session.data?.user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <DropdownSettings />
          </motion.div>
        )}
      </div>
    </header>
  );
};
