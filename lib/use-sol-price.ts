"use client";

import { useEffect, useState } from "react";

/** Client hook for the live SOL→USD price. Degrades to null silently. */
export function useSolPrice() {
  const [usd, setUsd] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/sol-price")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d && typeof d.usd === "number") setUsd(d.usd);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { usd, loading };
}
