import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The Ledger is the structural idea of this product: a stack of
 * label → value lines separated by hairlines, the way a receipt, an
 * invoice or a bank statement is set.
 *
 * Wherever the interface has to state a fact — an amount, a recipient, a
 * network fee, a signature — it is a ledger row. Nothing here is a card,
 * a pill or a badge.
 */

export const Ledger = React.forwardRef<
  HTMLDListElement,
  React.HTMLAttributes<HTMLDListElement>
>(({ className, ...props }, ref) => (
  <dl
    ref={ref}
    className={cn("divide-y divide-rule border-y border-rule", className)}
    {...props}
  />
));
Ledger.displayName = "Ledger";

export interface LedgerRowProps {
  label: React.ReactNode;
  children: React.ReactNode;
  /** The closing line of a ledger — heavier rule, larger figures. */
  total?: boolean;
  /** Stack label above value. Used in narrow columns. */
  stacked?: boolean;
  className?: string;
}

export function LedgerRow({
  label,
  children,
  total = false,
  stacked = false,
  className,
}: LedgerRowProps) {
  return (
    <div
      className={cn(
        "flex gap-4 px-4",
        stacked ? "flex-col gap-1 py-3" : "items-baseline justify-between py-3",
        total && "border-t-ink bg-well/60 py-3.5",
        className,
      )}
    >
      <dt className={cn("field-label shrink-0", total && "text-ink")}>
        {label}
      </dt>
      <dd
        className={cn(
          "min-w-0 text-[13.5px] text-ink",
          stacked ? "text-left" : "text-right",
        )}
      >
        {children}
      </dd>
    </div>
  );
}
