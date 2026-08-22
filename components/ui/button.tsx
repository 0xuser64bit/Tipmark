import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base: stable geometry — border included in sizing so focus ring never causes layout shift
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md",
    "text-sm font-medium leading-none",
    "transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",

        // Primary CTA — brand gradient, controlled glow, no excessive shadow
        brand:
          "brand-gradient text-white font-semibold glow-brand hover:brightness-110 hover:shadow-[0_10px_28px_-8px_rgba(124,78,243,0.55)] active:brightness-95 active:scale-[0.99]",

        // Money / SOL action
        money:
          "bg-money text-money-foreground font-semibold shadow-[0_6px_20px_-8px_rgba(16,217,126,0.5)] hover:brightness-105 active:brightness-95",

        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",

        // Elevated outline — no shadow, clean border
        outline:
          "border border-border bg-surface/50 text-foreground hover:bg-surface hover:border-border-emphasis active:bg-surface-2",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",

        ghost:
          "text-foreground/80 hover:bg-accent hover:text-foreground active:bg-accent/70",

        link:
          "text-brand-muted underline-offset-4 hover:underline hover:text-brand p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-0",
        sm:      "h-8 rounded-md px-3 text-xs",
        lg:      "h-11 rounded-lg px-6 text-[15px]",
        xl:      "h-12 rounded-lg px-8 text-[15px]",
        icon:    "h-9 w-9 p-0",
        "icon-sm": "h-8 w-8 p-0 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
