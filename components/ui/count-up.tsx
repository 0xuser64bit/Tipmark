"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import { easeOutSoft } from "@/lib/motion";

interface CountUpProps {
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  value,
  decimals = 2,
  duration = 1.1,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: easeOutSoft,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, duration, reduce]);

  return (
    <span className={className}>
      {prefix}
      {display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
