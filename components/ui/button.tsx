import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Buttons are printed controls: a hairline, a small radius, no gradient and
 * no glow. Pressing one moves it half a pixel down, like a stamp meeting
 * paper. There is exactly one `primary` per screen — the money action.
 */
const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap",
    "font-medium leading-none",
    "border transition-[background-color,border-color,color,transform] duration-100 ease-press",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:translate-y-[0.5px]",
    "[&_svg]:pointer-events-none [&_svg]:size-[15px] [&_svg]:shrink-0",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        /** The money action. Engraved banknote green. One per screen. */
        primary:
          "border-stamp bg-stamp text-stamp-ink hover:bg-stamp-deep hover:border-stamp-deep",
        /** Strong neutral — downloads, confirmations, "next". */
        ink: "border-ink bg-ink text-paper hover:bg-ink-soft hover:border-ink-soft",
        /** The workhorse. A sheet with a hairline. */
        outline:
          "border-rule bg-sheet text-ink hover:border-rule-strong hover:bg-well",
        /** Tertiary — sits inside dense areas without drawing a box. */
        quiet:
          "border-transparent bg-transparent text-ink-soft hover:bg-well hover:text-ink",
        /** Destructive. */
        danger:
          "border-seal-edge bg-seal-soft text-seal hover:border-seal hover:bg-seal hover:text-white",
        /** Inline text action. */
        link: "h-auto border-transparent p-0 text-stamp underline decoration-stamp-edge decoration-1 underline-offset-[3px] hover:decoration-stamp active:translate-y-0",
      },
      size: {
        xs: "h-7 rounded-[3px] px-2.5 text-[12.5px]",
        sm: "h-8 rounded-[3px] px-3 text-[13px]",
        md: "h-9 rounded-[4px] px-3.5 text-[13.5px]",
        lg: "h-11 rounded-[4px] px-5 text-[14.5px]",
        xl: "h-[52px] rounded-[5px] px-7 text-[15.5px]",
        icon: "h-9 w-9 rounded-[4px] p-0",
        "icon-sm": "h-8 w-8 rounded-[3px] p-0",
      },
      /** Fill the parent's width — common in panels and dialogs. */
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "outline", size: "md", block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /**
   * Pending state. Swaps the leading content for a spinner and keeps the
   * label, so the button never changes width mid-transaction.
   */
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      block,
      asChild = false,
      loading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, block }), className)}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            {loadingText ?? children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
