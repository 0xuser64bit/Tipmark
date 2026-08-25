import * as React from "react";
import { cn } from "@/lib/utils";
import { formatSol, formatUsd } from "@/lib/format";

/**
 * How money is set in this product.
 *
 * The figure carries the weight; the unit recedes; the fiat equivalent is a
 * quiet second line. There is no colour on money — an amount received is
 * important because it is large and black, not because it glows green.
 * Everything is tabular so columns of amounts line up down the page.
 */

type MoneySize = "xs" | "sm" | "md" | "lg" | "xl" | "display";

const FIGURE: Record<MoneySize, string> = {
  xs: "text-[11.5px]",
  sm: "text-[13px]",
  md: "text-[15px]",
  lg: "text-[21px] tracking-[-0.03em]",
  xl: "text-[30px] tracking-[-0.035em]",
  display: "text-[clamp(2.5rem,7vw,3.75rem)] tracking-[-0.045em]",
};

const UNIT: Record<MoneySize, string> = {
  xs: "text-[9.5px] ml-1",
  sm: "text-[10.5px] ml-1",
  md: "text-[11px] ml-1.5",
  lg: "text-[12px] ml-1.5",
  xl: "text-[14px] ml-2",
  display: "text-[clamp(0.9rem,1.8vw,1.15rem)] ml-2.5",
};

const FIAT: Record<MoneySize, string> = {
  xs: "text-[10px]",
  sm: "text-[11px]",
  md: "text-[11.5px]",
  lg: "text-[12px]",
  xl: "text-[13px]",
  display: "text-[15px]",
};

export interface MoneyProps {
  /** Amount in SOL. Strings are parsed — transactions store them as text. */
  sol: number | string;
  /** USD price of 1 SOL. When absent the fiat line is omitted entirely. */
  priceUsd?: number | null;
  size?: MoneySize;
  /** "+" marks a credit in the creator's ledger. */
  sign?: "" | "+" | "−";
  /** Where the fiat equivalent goes, or `none` to suppress it. */
  fiat?: "below" | "beside" | "none";
  /** Hide the SOL unit — for columns that are already headed "SOL". */
  unit?: boolean;
  /** Significant fractional digits. Raise it where lamport precision matters. */
  decimals?: number;
  className?: string;
}

export function Money({
  sol,
  priceUsd,
  size = "md",
  sign = "",
  fiat = "none",
  unit = true,
  decimals = 4,
  className,
}: MoneyProps) {
  const value = typeof sol === "string" ? parseFloat(sol) || 0 : sol;
  const usd = priceUsd != null ? formatUsd(value * priceUsd) : null;
  const showFiat = fiat !== "none" && usd != null;

  const figure = (
    <span className={cn("figure font-medium text-ink", FIGURE[size])}>
      {sign}
      {formatSol(value, decimals)}
      {unit && (
        <span className={cn("font-normal text-ink-faint", UNIT[size])}>SOL</span>
      )}
    </span>
  );

  if (!showFiat) return <span className={className}>{figure}</span>;

  return (
    <span
      className={cn(
        fiat === "below"
          ? "flex flex-col items-[inherit] gap-0.5"
          : "inline-flex items-baseline gap-2",
        className,
      )}
    >
      {figure}
      <span className={cn("figure text-ink-faint", FIAT[size])}>{usd}</span>
    </span>
  );
}
