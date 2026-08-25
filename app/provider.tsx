"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Only what every page needs. Image uploads mount their own EdgeStore
 * provider inside the editor — previously it wrapped the whole app, so every
 * page load fired an `/api/edgestore/init` request for a feature used on
 * exactly one route.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
