import Link from "next/link";
import { cn } from "@/lib/utils";
import { Wordmark } from "./ui/logo";

/**
 * One footer. A colophon, not a sitemap: who made it, what it runs on, and
 * the two links that matter.
 */
export function SiteFooter({
  width = "wide",
  className,
}: {
  width?: "wide" | "text";
  className?: string;
}) {
  return (
    <footer className={cn("mt-auto border-t border-rule", className)}>
      <div
        className={cn(
          "mx-auto flex flex-col gap-6 px-5 py-8 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10 sm:px-8",
          width === "text" ? "max-w-3xl" : "max-w-[1120px]",
        )}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-2.5">
          <Wordmark size="sm" />
          <p className="max-w-[46ch] text-[12.5px] leading-relaxed text-ink-faint">
            Contributions settle wallet to wallet on Solana. We never hold your
            money.
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-ink-faint"
        >
          <Link href="/about-us" className="transition-colors hover:text-ink">
            How it works
          </Link>
          <a
            href="https://github.com/0xuser64bit"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ink"
          >
            GitHub
          </a>
          <a
            href="https://x.com/user64bit"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ink"
          >
            X
          </a>
          <span className="figure text-ink-ghost">
            © {new Date().getFullYear()}
          </span>
        </nav>
      </div>
    </footer>
  );
}
