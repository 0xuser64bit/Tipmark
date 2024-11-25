"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSession } from "next-auth/react";
import { DropdownSettings } from "./dropdown";
import { Badge } from "./ui/badge";

export const Header = () => {
  const session = useSession();
  return (
    <header className="flex justify-between items-center mb-6">
      <div className="font-bold flex items-center justify-center">
        DAOnation
        <Badge variant="outline" className="text-white ms-2">
          Devnet
        </Badge>
      </div>
      <div className="flex gap-x-4 items-center">
        <WalletMultiButton
          style={{
            background: "linear-gradient(90deg, #1a1a1a, #333333)",
            color: "#f0f0f0",
            fontSize: "1rem",
            padding: "0.8rem 1.5rem",
            borderRadius: "6px",
            border: "0.5px solid #444",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
            transition: "all 0.3s ease-in-out",
          }}
        />
        {session.data?.user && <DropdownSettings />}
      </div>
    </header>
  );
};
