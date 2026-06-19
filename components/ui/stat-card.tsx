import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface StatCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  accent?: "brand" | "money";
  className?: string;
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "brand",
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden p-5 transition-colors hover:border-border/80",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full blur-2xl",
          accent === "money" ? "bg-money/10" : "bg-brand/10",
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </div>
          {sub && (
            <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              accent === "money"
                ? "bg-money/10 text-money"
                : "bg-brand/10 text-brand",
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
