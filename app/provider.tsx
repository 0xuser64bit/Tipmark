"use client";

import { EdgeStoreProvider } from "@/lib/edgestore";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <EdgeStoreProvider>{children}</EdgeStoreProvider>
    </SessionProvider>
  );
}
