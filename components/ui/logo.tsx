import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The mark is a receipt: a small sheet with two ledger rules and a torn
 * bottom edge. It is the artefact the product makes, so it is the artefact
 * that stands for the product.
 */
export function LogoMark({
  className,
  tone = "stamp",
}: {
  className?: string;
  tone?: "stamp" | "ink" | "paper";
}) {
  const fill =
    tone === "paper" ? "#faf8f4" : tone === "ink" ? "#17150f" : "#14573c";

  return (
    <svg
      viewBox="0 0 20 20"
      className={cn("size-[18px] shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3.5 2.2h13v13.05l-1.625 1.35-1.625-1.35-1.625 1.35L10 15.25l-1.625 1.35-1.625-1.35L5.125 16.6 3.5 15.25V2.2Z"
        fill={fill}
      />
      <path
        d="M6.4 6.6h7.2M6.4 9.9h4.4"
        stroke={tone === "paper" ? "#17150f" : "#faf8f4"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The wordmark pairs a compact machine voice with a human serif. The seam
 * makes Tipmark feel both verifiable and personal.
 */
export function Wordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const scale = {
    sm: ["text-[11px] tracking-[0.02em]", "text-[15px]"],
    md: ["text-[12.5px] tracking-[0.02em]", "text-[17px]"],
    lg: ["text-[15px] tracking-[0.02em]", "text-[21px]"],
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-baseline whitespace-nowrap text-ink",
        className,
      )}
    >
      <span className={cn("font-mono font-medium uppercase", scale[0])}>
        TIP
      </span>
      <span
        className={cn(
          "font-serif font-medium leading-none tracking-[-0.02em]",
          scale[1],
        )}
      >
        mark
      </span>
    </span>
  );
}

export function Logo({
  href = "/",
  className,
  size = "md",
  showMark = true,
  /** Drop the wordmark on narrow screens to make room for navigation. */
  compact = false,
}: {
  href?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  showMark?: boolean;
  compact?: boolean;
}) {
  const inner = (
    <>
      {showMark && (
        <LogoMark className={size === "lg" ? "size-[22px]" : undefined} />
      )}
      <Wordmark
        size={size}
        className={compact ? "hidden sm:inline-flex" : undefined}
      />
    </>
  );

  const classes = cn(
    "inline-flex shrink-0 items-center gap-2 transition-opacity hover:opacity-70",
    className,
  );

  if (!href)
    return <span className={cn(classes, "hover:opacity-100")}>{inner}</span>;

  return (
    <Link href={href} className={classes} aria-label="Tipmark home">
      {inner}
    </Link>
  );
}
