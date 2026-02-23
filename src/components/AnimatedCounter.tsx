"use client";

import React, { useEffect, useRef, useState } from "react";

/** Ease-out cubic for satisfying deceleration at the end */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface AnimatedCounterProps {
  /** Target value to animate to */
  value: number;
  /** Duration in ms for the animation */
  duration?: number;
  /** Shorter duration when value updates (e.g. after poll or optimistic increment) */
  updateDuration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1400,
  updateDuration = 400,
  className = "",
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const target = value;
    const startValue = currentRef.current;
    const isInitial = startValue === 0 && target > 0;
    const animDuration = isInitial ? duration : updateDuration;

    if (target === startValue) return;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / animDuration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(startValue + (target - startValue) * eased);
      currentRef.current = current;
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, updateDuration]);

  return <span className={className}>{display.toLocaleString()}</span>;
}
