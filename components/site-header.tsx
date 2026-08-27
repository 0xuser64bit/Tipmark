"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./ui/logo";

/**
 * One header for the whole product.
 *
 * It is a letterhead: the mark on the left, actions on the right, closed by
 * a single hairline. It does not float, it does not blur the page behind it
 * and it does not follow you down the document — the content is the point.
 */

const CREATOR_NAV = [
  { href: "/dashboard", label: "Ledger" },
  { href: "/home", label: "My page" },
];

export function SiteHeader({
  /** Right-hand action cluster. */
  actions,
  /** Show the creator's primary navigation. */
  nav = false,
  /** Container width — matches the page it sits above. */
  width = "wide",
  className,
}: {
  actions?: ReactNode;
  nav?: boolean;
  width?: "wide" | "text";
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <header className={cn("border-b border-rule bg-paper", className)}>
      <div
        className={cn(
          "mx-auto flex h-14 items-center gap-4 px-5 sm:gap-6 sm:px-8",
          width === "text" ? "max-w-3xl" : "max-w-[1120px]",
        )}
      >
        <Logo compact={nav} />

        <span
          className="field-label inline-flex items-center rounded-[3px] border border-stamp-edge bg-stamp-soft px-2 py-1 text-stamp"
          title="Tipmark's decentralized protocol is available on Solana Devnet only."
          aria-label="Solana Devnet only"
        >
          Devnet
        </span>

        {nav && (
          <nav aria-label="Main" className="-mb-px flex items-end gap-0.5 sm:gap-1">
            {CREATOR_NAV.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative whitespace-nowrap border-b-2 px-2 pb-[17px] pt-[19px] text-[13.5px] transition-colors sm:px-2.5",
                    active
                      ? "border-ink font-medium text-ink"
                      : "border-transparent text-ink-faint hover:text-ink",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        {actions && (
          <div className="ml-auto flex items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}
