"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/format";

interface AddressChipProps {
  address: string;
  start?: number;
  end?: number;
  className?: string;
}

export function AddressChip({
  address,
  start = 4,
  end = 4,
  className,
}: AddressChipProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${address}`}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground",
        className,
      )}
    >
      <span className="tabular-nums">{truncateAddress(address, start, end)}</span>
      {copied ? (
        <Check className="h-3 w-3 text-money" />
      ) : (
        <Copy className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}
