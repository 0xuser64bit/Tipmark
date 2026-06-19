import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./ui/logo";

interface AppNavProps {
  /** Right-aligned actions (wallet button, menu, links). */
  right?: ReactNode;
  logoHref?: string;
  maxWidth?: string;
  sticky?: boolean;
  border?: boolean;
  className?: string;
}

/**
 * The single navigation shell for every DAOnation surface.
 * Logo on the left, composable actions on the right. Glassy, sticky, calm.
 */
export function AppNav({
  right,
  logoHref = "/",
  maxWidth = "max-w-6xl",
  sticky = true,
  border = true,
  className,
}: AppNavProps) {
  return (
    <header
      className={cn(
        "z-40 w-full bg-background/70 backdrop-blur-xl",
        sticky && "sticky top-0",
        border && "border-b border-border/70",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-16 items-center justify-between px-4 sm:px-6",
          maxWidth,
        )}
      >
        <Logo href={logoHref} />
        {right && (
          <div className="flex items-center gap-2 sm:gap-3">{right}</div>
        )}
      </div>
    </header>
  );
}
