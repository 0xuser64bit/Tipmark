"use client";

import { EdgeStoreProvider } from "@/lib/edgestore";
import { SessionProvider } from "next-auth/react";
import { NProgressProvider } from "@/components/nprogress-provider";
import { RouteChangeProgress } from "@/components/route-progress";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <EdgeStoreProvider>
        <NProgressProvider>
          <RouteChangeProgress />
          {children}
        </NProgressProvider>
      </EdgeStoreProvider>
    </SessionProvider>
  );
}
