import { Github, Twitter } from "lucide-react";
import { Logo } from "./ui/logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo />
          <p className="text-xs text-muted-foreground">
            Non-custodial support, powered by Solana.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DAOnation
          </span>
          <a
            href="https://x.com/user64bit"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Twitter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter className="h-4 w-4" />
          </a>
          <a
            href="https://github.com/user-64bit"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="GitHub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
