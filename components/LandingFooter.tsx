import Link from "next/link";
import { Logo } from "./ui/logo";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-1.5 sm:items-start">
          <Logo />
          <p className="text-xs text-muted-foreground">
            Non-custodial support, powered by Solana.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/about-us"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </Link>
          <a
            href="https://github.com/0xuser64bit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href="https://x.com/user64bit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            X
          </a>
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DAOnation
          </span>
        </div>
      </div>
    </footer>
  );
}
