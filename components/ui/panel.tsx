import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A Panel is a piece of paper. Three depths, and that is the whole
 * elevation system:
 *
 *   sheet — white stock resting on the page (the default container)
 *   flat  — same paper as the page, separated by a hairline only
 *   well  — recessed, for grouped data and inputs
 *
 * Panels never stack shadows and never round more than 6px.
 */

type PanelTone = "sheet" | "flat" | "well";

const TONE: Record<PanelTone, string> = {
  sheet: "border-rule bg-sheet shadow-sheet",
  flat: "border-rule bg-paper",
  well: "border-rule bg-well",
};

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: PanelTone;
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, tone = "sheet", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-[6px] border", TONE[tone], className)}
      {...props}
    />
  ),
);
Panel.displayName = "Panel";

/** Header: 20px inset, closed by a hairline. Title left, actions right. */
const PanelHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex min-h-[48px] items-center justify-between gap-3 border-b border-rule px-5 py-3",
      className,
    )}
    {...props}
  />
));
PanelHeader.displayName = "PanelHeader";

/** Titles are interface voice: sans, small, quietly confident. */
const PanelTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "font-sans text-[13.5px] font-semibold tracking-[-0.005em] text-ink",
      className,
    )}
    {...props}
  />
));
PanelTitle.displayName = "PanelTitle";

const PanelBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5", className)} {...props} />
));
PanelBody.displayName = "PanelBody";

const PanelFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-2 border-t border-rule px-5 py-3.5",
      className,
    )}
    {...props}
  />
));
PanelFooter.displayName = "PanelFooter";

export { Panel, PanelHeader, PanelTitle, PanelBody, PanelFooter };
