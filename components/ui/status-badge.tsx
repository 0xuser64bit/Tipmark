import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "text-money border-money/30 bg-money/10" },
  finalized: { label: "Finalized", cls: "text-money border-money/30 bg-money/10" },
  processed: {
    label: "Processed",
    cls: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  },
  processing: {
    label: "Processing",
    cls: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = (status ?? "").toLowerCase();
  const s = STATUS_MAP[key] ?? {
    label: status || "Unknown",
    cls: "text-muted-foreground border-border bg-surface",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
        s.cls,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}
