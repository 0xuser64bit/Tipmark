import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Confirmation state, set as a rubber stamp: mono, small caps, letterspaced.
 *
 * Information design note — on a creator's ledger nearly every row is
 * confirmed, so the settled state gets no box and no colour at all. Only the
 * exceptions (still processing, failed) are stamped. Marking the norm is
 * what turns a table into noise.
 */

type Tone = "settled" | "pending" | "failed" | "neutral";

const TONE: Record<Tone, string> = {
  settled: "text-ink-ghost",
  pending:
    "rounded-[2px] border border-pending-edge bg-pending-soft px-1.5 py-[3px] text-pending",
  failed:
    "rounded-[2px] border border-seal-edge bg-seal-soft px-1.5 py-[3px] text-seal",
  neutral: "rounded-[2px] border border-rule px-1.5 py-[3px] text-ink-faint",
};

const FROM_STATUS: Record<string, { tone: Tone; label: string }> = {
  confirmed: { tone: "settled", label: "Confirmed" },
  finalized: { tone: "settled", label: "Finalized" },
  processed: { tone: "pending", label: "Processed" },
  processing: { tone: "pending", label: "Processing" },
  failed: { tone: "failed", label: "Failed" },
};

/** True when a status needs no marking. Callers use it to skip the tag. */
export function isSettled(status?: string) {
  return status ? FROM_STATUS[status.toLowerCase()]?.tone === "settled" : false;
}

export interface StampProps {
  /** Raw confirmation status as reported by the chain. */
  status?: string;
  /** Or drive it directly. */
  tone?: Tone;
  children?: React.ReactNode;
  className?: string;
}

export function Stamp({ status, tone, children, className }: StampProps) {
  const mapped = status ? FROM_STATUS[status.toLowerCase()] : undefined;
  const resolvedTone = tone ?? mapped?.tone ?? "neutral";
  const label = children ?? mapped?.label ?? status ?? "Unknown";

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono text-[9.5px] font-medium uppercase leading-none tracking-[0.09em]",
        TONE[resolvedTone],
        className,
      )}
    >
      {label}
    </span>
  );
}

/**
 * The one moment in the product that earns a real stamp: the receipt for a
 * contribution that landed. Rotated, letterpressed, used exactly once.
 */
export function PaidMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex -rotate-[7deg] items-center rounded-[3px] border-2 border-stamp/55 px-2.5 py-1",
        "font-mono text-[13px] font-semibold uppercase leading-none tracking-[0.16em] text-stamp/85",
        className,
      )}
    >
      Received
    </span>
  );
}
