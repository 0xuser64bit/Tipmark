import type { Variants } from "motion/react";

/**
 * Shared, calm motion vocabulary for DAOnation.
 * Premium = restrained. Gentle fades and rises, never busy.
 * Components should also respect `prefers-reduced-motion` via the
 * `useReducedMotion` hook from `motion/react` where they animate on a loop.
 */

export const easeOutSoft = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutSoft },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: easeOutSoft } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: easeOutSoft },
  },
};

export const staggerContainer = (
  staggerChildren = 0.08,
  delayChildren = 0.1,
): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});
