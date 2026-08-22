import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-[0.55rem]",
        "brand-gradient",
        "h-7 w-7",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rising value — double chevron mark */}
        <path
          d="M4.5 13.5L12 7l7.5 6.5"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.5 18L12 11.5l7.5 6.5"
          stroke="white"
          strokeOpacity="0.4"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  href = "/",
  className,
  showWordmark = true,
  markClassName,
}: {
  href?: string;
  className?: string;
  showWordmark?: boolean;
  markClassName?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 transition-opacity hover:opacity-85",
        className,
      )}
    >
      <LogoMark className={markClassName} />
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-[-0.025em] text-foreground">
          DAO<span className="text-muted-foreground font-normal">nation</span>
        </span>
      )}
    </Link>
  );
}
