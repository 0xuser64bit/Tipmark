"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getSolanaNetworkConfig } from "@/lib/solana/cluster";
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

/**
 * Non-production clusters are labelled so nobody mistakes test SOL for real
 * money. Read from the configured cluster rather than hardcoded, so the badge
 * cannot outlive the deployment it describes; mainnet shows nothing.
 */
function ClusterBadge({ compact }: { compact: boolean }) {
  const { cluster } = getSolanaNetworkConfig();
  if (cluster === "mainnet-beta") return null;

  return (
    <span
      className={cn(
        "field-label shrink-0 items-center rounded-[3px] border border-pending-edge bg-pending-soft px-1.5 py-0.5 text-[9.5px] text-pending",
        /* With creator nav present the row is already tight on a phone. */
        compact ? "hidden sm:inline-flex" : "inline-flex",
      )}
      title={`Connected to Solana ${cluster}. Balances and transfers are not real money.`}
    >
      {cluster.toUpperCase()}
    </span>
  );
}

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

        <ClusterBadge compact={nav} />

        {nav && (
          <nav
            aria-label="Main"
            className="-mb-px flex items-end gap-0.5 sm:gap-1"
          >
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
