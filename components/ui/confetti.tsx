"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const COLORS = ["#9945ff", "#14f195", "#22d3ee", "#ffffff", "#b07cff"];

/** A single, tasteful burst of confetti that plays once on mount. */
export function Confetti({ count = 28 }: { count?: number }) {
  const reduce = useReducedMotion();
  // Client-only: the random positions must not run during SSR or they
  // cause a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 1.6 + Math.random() * 1.2,
        rotate: (Math.random() - 0.5) * 720,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 6,
      })),
    [count],
  );

  if (reduce || !mounted) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 rounded-[2px]"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
          }}
          initial={{ y: "-10%", opacity: 0, rotate: 0 }}
          animate={{ y: "120%", opacity: [0, 1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
