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
        "p-5 transition-colors duration-200 hover:border-border-emphasis",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <div className="mt-2 text-[1.65rem] font-semibold tracking-tight tabular-nums leading-none">
            {value}
          </div>
          {sub && (
            <p className="mt-2 truncate text-xs text-muted-foreground">
              {sub}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              accent === "money"
                ? "bg-money-surface text-money"
                : "bg-brand-surface text-brand",
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
