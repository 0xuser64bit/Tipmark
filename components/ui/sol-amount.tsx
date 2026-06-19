import { cn } from "@/lib/utils";
import { formatSol, formatUsd } from "@/lib/format";

interface SolAmountProps {
  sol: number | string;
  /** USD price per 1 SOL. When provided, the USD equivalent is shown. */
  priceUsd?: number | null;
  showUsd?: boolean;
  sign?: string;
  layout?: "stacked" | "inline";
  className?: string;
  amountClassName?: string;
  usdClassName?: string;
}

export function SolAmount({
  sol,
  priceUsd,
  showUsd = true,
  sign = "",
  layout = "stacked",
  className,
  amountClassName,
  usdClassName,
}: SolAmountProps) {
  const value = typeof sol === "string" ? parseFloat(sol) || 0 : sol;
  const usd = priceUsd != null ? value * priceUsd : null;
  const usdNode =
    showUsd && usd != null ? (
      <span
        className={cn(
          "font-mono text-xs text-muted-foreground tabular-nums",
          usdClassName,
        )}
      >
        ≈ {formatUsd(usd)}
      </span>
    ) : null;

  return (
    <span
      className={cn(
        layout === "stacked"
          ? "inline-flex flex-col gap-0.5"
          : "inline-flex items-baseline gap-2",
        className,
      )}
    >
      <span
        className={cn(
          "font-mono font-semibold tracking-tight tabular-nums",
          amountClassName,
        )}
      >
        {sign}
        {formatSol(value)}{" "}
        <span className="font-normal text-muted-foreground">SOL</span>
      </span>
      {usdNode}
    </span>
  );
}
