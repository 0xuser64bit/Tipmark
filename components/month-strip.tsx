import { cn } from "@/lib/utils";
import { formatSol } from "@/lib/format";

/**
 * Twelve months of income as a small strip of bars.
 *
 * Deliberately the size of a data mark, not a hero graphic: at a handful of
 * contributions a month, a 280px chart is decoration. Rendered with plain
 * elements rather than a charting library — the whole thing is twelve
 * numbers, and this way it matches the type system exactly.
 */
export function MonthStrip({
  months,
  className,
}: {
  months: { label: string; year: number; total: number }[];
  className?: string;
}) {
  const peak = Math.max(...months.map((m) => m.total), 0);
  const hasData = peak > 0;

  return (
    <figure className={cn("min-w-0", className)}>
      <figcaption className="flex items-baseline justify-between gap-4">
        <span className="field-label">Last 12 months</span>
        {hasData && (
          <span className="figure text-[11px] text-ink-ghost">
            peak {formatSol(peak)} SOL
          </span>
        )}
      </figcaption>

      <div
        className="mt-3 flex h-[68px] items-end gap-[3px] border-b border-rule"
        role="img"
        aria-label={
          hasData
            ? `Monthly income: ${months
                .map((m) => `${m.label} ${formatSol(m.total)} SOL`)
                .join(", ")}`
            : "No income recorded in the last twelve months"
        }
      >
        {months.map((m, i) => {
          const ratio = peak > 0 ? m.total / peak : 0;
          const isCurrent = i === months.length - 1;
          return (
            <div
              key={`${m.year}-${m.label}-${i}`}
              title={`${m.label} ${m.year} — ${formatSol(m.total)} SOL`}
              className="flex h-full flex-1 items-end"
            >
              <div
                className={cn(
                  "w-full rounded-t-[1px] transition-colors",
                  m.total > 0
                    ? isCurrent
                      ? "bg-stamp"
                      : "bg-ink"
                    : "bg-well-deep",
                )}
                style={{
                  height: m.total > 0 ? `${Math.max(ratio * 100, 6)}%` : "3px",
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-[3px]" aria-hidden>
        {months.map((m, i) => (
          <span
            key={`${m.year}-${m.label}-label-${i}`}
            className={cn(
              "flex-1 text-center font-mono text-[9px] uppercase tracking-[0.04em]",
              i === months.length - 1 ? "text-ink" : "text-ink-ghost",
            )}
          >
            {m.label.charAt(0)}
          </span>
        ))}
      </div>
    </figure>
  );
}
