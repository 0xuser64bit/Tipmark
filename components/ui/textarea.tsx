import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[112px] w-full rounded-[4px] border border-rule bg-well",
      "px-3 py-2.5 text-[14px] leading-[1.6] text-ink",
      "placeholder:text-ink-ghost",
      "resize-y transition-[border-color,background-color] duration-100",
      "hover:border-rule-strong",
      "focus:bg-sheet focus:outline-2 focus:outline-offset-[-1px] focus:outline-stamp focus-visible:outline-offset-[-1px]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-invalid:border-seal aria-invalid:bg-seal-soft/40",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
