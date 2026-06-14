"use client";

import { useReducedMotion } from "framer-motion";
import type { MotionProps } from "framer-motion";

interface RevealOptions {
  delay?: number;
  x?: number;
  y?: number;
}

/**
 * Returns a factory for the standard scroll-reveal props
 * (fade + rise, once, ease-out). When the user prefers reduced
 * motion the factory returns no props, so elements render in
 * their final state with no animation.
 */
export function useReveal() {
  const reduced = useReducedMotion();

  return (options: RevealOptions = {}): MotionProps => {
    if (reduced) return {};
    const { delay = 0, x = 0, y = x !== 0 ? 0 : 28 } = options;
    return {
      initial: { opacity: 0, x, y },
      whileInView: { opacity: 1, x: 0, y: 0 },
      viewport: { once: true, amount: 0.15 },
      transition: { duration: 0.65, ease: "easeOut", delay },
    };
  };
}
