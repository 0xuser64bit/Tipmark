import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-[0.6rem] brand-gradient shadow-[0_4px_16px_-4px_rgba(153,69,255,0.6)]",
        "h-8 w-8",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rising value — two stacked chevrons */}
        <path
          d="M4.5 13.5L12 7l7.5 6.5"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.5 18L12 11.5l7.5 6.5"
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="2.4"
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
        "group inline-flex items-center gap-2.5 transition-opacity hover:opacity-90",
        className,
      )}
    >
      <LogoMark className={markClassName} />
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          DAO<span className="text-muted-foreground">nation</span>
        </span>
      )}
    </Link>
  );
}
