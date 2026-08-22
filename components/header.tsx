"use client";

import { useSession } from "next-auth/react";
import { AppNav } from "./app-nav";
import { DropdownSettings } from "./dropdown";
import { WalletButton } from "./ui/wallet-button";
import { Button } from "./ui/button";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export const Header = () => {
  const { data: session } = useSession();

  return (
    <AppNav
      right={
        <>
          <WalletButton />
          {session?.user && (
            <>
              {/* Direct dashboard link on desktop for better UX than just dropdown */}
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden text-muted-foreground sm:inline-flex"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <DropdownSettings />
            </>
          )}
        </>
      }
    />
  );
};
