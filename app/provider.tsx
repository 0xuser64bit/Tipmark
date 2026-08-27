"use client";

import { SessionProvider } from "next-auth/react";

/** Only what every page needs. Wallet and RPC providers mount per route. */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
