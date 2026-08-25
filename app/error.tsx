"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

/**
 * The last line of defence. It says what we know, does not pretend to know
 * more, and gives exactly two ways out.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-rule">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-5 sm:px-8">
          <Logo />
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-20 sm:px-8">
        <p className="field-label">Error</p>
        <h1 className="mt-4 max-w-[24ch] text-[clamp(1.9rem,4.6vw,2.75rem)] font-medium leading-[1.05]">
          Something on our side broke.
        </h1>
        <p className="mt-5 max-w-[50ch] text-[15px] leading-relaxed text-ink-faint">
          No transfer was started or lost — money only moves when your wallet
          signs for it. Reloading usually clears this.
        </p>

        {error.digest && (
          <p className="figure mt-6 text-[11.5px] text-ink-ghost">
            Reference {error.digest}
          </p>
        )}

        <div className="mt-9 flex flex-wrap gap-2">
          <Button variant="ink" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="quiet">
            {/* Deliberately a full document load, not a client transition —
                the router may be part of what failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">Back to the start</a>
          </Button>
        </div>
      </main>
    </div>
  );
}
