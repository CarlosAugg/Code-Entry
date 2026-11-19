import { useEffect, useRef, useState } from "react";

function prefersReducedMotion(): boolean {
  if (typeof document === "undefined" || typeof window === "undefined") return true;
  if (document.documentElement.classList.contains("reduced-motion")) return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function useAnimatedNumber(target: number, durationMs = 420): number {
  const [display, setDisplay] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    if (prefersReducedMotion() || currentRef.current === target) {
      currentRef.current = target;
      setDisplay(target);
      return;
    }

    const from = currentRef.current;
    const diff = target - from;
    const start = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + diff * eased);
      currentRef.current = next;
      setDisplay(next);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        currentRef.current = target;
        setDisplay(target);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs]);

  return display;
}
