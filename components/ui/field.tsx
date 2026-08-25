import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

/**
 * A line on a form. Label, control, and then exactly one of hint or error —
 * never both, and the slot never collapses, so validating a form does not
 * make the page jump.
 */
export interface FieldProps {
  label: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: string;
  /** Right-aligned adornment on the label line (e.g. a character count). */
  aside?: React.ReactNode;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  aside,
  optional,
  children,
  className,
}: FieldProps) {
  const message = error || hint;
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor}>
          {label}
          {optional && (
            <span className="ml-1.5 normal-case tracking-normal text-ink-ghost">
              optional
            </span>
          )}
        </Label>
        {aside}
      </div>
      {children}
      {message && (
        <p
          className={cn(
            "text-[12.5px] leading-snug",
            error ? "text-seal" : "text-ink-faint",
          )}
          role={error ? "alert" : undefined}
        >
          {message}
        </p>
      )}
    </div>
  );
}
