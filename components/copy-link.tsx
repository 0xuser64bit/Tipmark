"use client";

import { Check, Link2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

/**
 * Copying your own link is the single most-repeated action a creator takes,
 * so it shows the link itself rather than hiding it behind a share icon.
 */
export function CopyLink({
  url,
  label,
  size = "md",
  variant = "outline",
}: {
  url: string;
  /** What to display. Defaults to the URL without its scheme. */
  label?: string;
  size?: "sm" | "md";
  variant?: "outline" | "quiet";
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      /* no clipboard — the link is visible and selectable regardless */
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={copy}
      aria-label={`Copy ${url}`}
    >
      {copied ? (
        <Check className="text-stamp" aria-hidden />
      ) : (
        <Link2 aria-hidden />
      )}
      <span className="figure">
        {copied ? "Copied" : (label ?? url.replace(/^https?:\/\//, ""))}
      </span>
    </Button>
  );
}
