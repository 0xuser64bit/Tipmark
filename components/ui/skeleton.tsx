import { cn } from "@/lib/utils";

/** Paper waiting to be printed. Breathes; does not shimmer. */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("animate-breathe rounded-[3px] bg-well-deep", className)}
      {...props}
    />
  );
}
