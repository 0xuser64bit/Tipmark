import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Inputs are recessed wells cut into the paper, so a filled field reads as
 * something written *into* the document rather than floating on it. Focus
 * darkens the rule and prints a ring — it never changes the geometry.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[4px] border border-rule bg-well",
        "px-3 text-[14px] text-ink",
        "placeholder:text-ink-ghost",
        "transition-[border-color,background-color] duration-100",
        "hover:border-rule-strong",
        "focus:bg-sheet focus:outline-2 focus:outline-offset-[-1px] focus:outline-stamp focus-visible:outline-offset-[-1px]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-seal aria-invalid:bg-seal-soft/40",
        "file:mr-3 file:h-full file:border-0 file:bg-transparent file:text-[13px] file:font-medium file:text-ink",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
