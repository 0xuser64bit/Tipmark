"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LogOut, Menu, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
        {session.data?.user && (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white"
                >
                  <Menu />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-zinc-800 border-zinc-700 mt-2"
                align="end"
              >
                <DropdownMenuItem
                  className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100 cursor-pointer"
                  onClick={() => redirect("/edit-profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-700" />
                <DropdownMenuItem
                  className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100 cursor-pointer"
                  onClick={async () =>
                    await signOut({
                      redirect: true,
                      callbackUrl: "/",
                    })
                  }
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};
