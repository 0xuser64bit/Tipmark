"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/format";

/**
 * On-chain identifiers — wallet addresses and transaction signatures.
 *
 * These are machine facts, so they are set in mono and marked with a dotted
 * underline: the visual convention for "there is more here than is shown".
 * They are not pills. A page can contain a dozen addresses and none of them
 * should look like a button.
 */

export interface HashProps {
  value: string;
  start?: number;
  end?: number;
  /** Render the full string, wrapped — used for signature blocks. */
  full?: boolean;
  size?: "xs" | "sm";
  className?: string;
  label?: string;
}

export function Hash({
  value,
  start = 4,
  end = 4,
  full = false,
  size = "sm",
  className,
  label = "address",
}: HashProps) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the value is selectable either way */
    }
  };

  if (!value) return null;

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Copied" : `Copy ${label}`}
      aria-label={copied ? "Copied" : `Copy ${label}: ${value}`}
      className={cn(
        "group inline-flex max-w-full items-baseline gap-1.5 rounded-[2px] text-left align-baseline",
        "figure text-ink-soft transition-colors hover:text-ink",
        size === "xs" ? "text-[11px]" : "text-[12.5px]",
        className,
      )}
    >
      <span
        className={cn(
          "underline decoration-dotted decoration-from-font underline-offset-[3px]",
          "decoration-rule-strong group-hover:decoration-ink-faint",
          full && "break-all",
        )}
      >
        {full ? value : truncateAddress(value, start, end)}
      </span>
      <span aria-hidden className="translate-y-px">
        {copied ? (
          <Check className="size-3 text-stamp" />
        ) : (
          <Copy className="size-3 text-ink-ghost transition-colors group-hover:text-ink-faint" />
        )}
      </span>
    </button>
  );
}
