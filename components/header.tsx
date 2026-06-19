"use client";

import { useSession } from "next-auth/react";
import { AppNav } from "./app-nav";
import { DropdownSettings } from "./dropdown";
import { StylishWalletButton } from "./ui/wallet-button";

export const Header = () => {
  const { data } = useSession();

  return (
    <AppNav
      right={
        <>
          <StylishWalletButton />
          {data?.user && <DropdownSettings />}
        </>
      }
    />
  );
};
