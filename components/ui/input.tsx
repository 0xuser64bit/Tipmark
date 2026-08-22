import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Stable height — border is part of the element, no layout shift on focus
          "flex h-9 w-full rounded-md",
          "border border-input bg-surface",
          "px-3 py-0 text-sm leading-none",
          "text-foreground placeholder:text-muted-foreground",
          "shadow-none",
          "transition-colors duration-150",
          // Focus: ring-inset prevents any geometry change
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
