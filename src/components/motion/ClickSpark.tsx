import React, { useEffect, useRef } from "react";
import { getPaletteById, type ThemePaletteId } from "../../data/themes";

interface SparkParticle {
  x: number;
  y: number;
  angle: number;
  startTime: number;
  color: string;
}

/*
 * React Bits (DavidHDev/react-bits) — ClickSpark.
 * Desenha 8 fagulhas radiais discretas em cada clique na interface.
 */
export const ClickSpark: React.FC<{
  sparkColor?: string;
  paletteId?: ThemePaletteId;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
}> = ({
  sparkColor,
  paletteId,
  sparkSize = 9,
  sparkRadius = 22,
  sparkCount = 8,
  duration = 360,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<SparkParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const isReduced = () =>
      document.documentElement.classList.contains("reduced-motion") ||
      (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

    const onPointerDown = (e: PointerEvent) => {
      if (isReduced()) return;
      const now = performance.now();
      const palette = getPaletteById(paletteId || document.documentElement.dataset.palette);
      const colors = sparkColor ? [sparkColor, palette.sparkColors[1], palette.sparkColors[2]] : palette.sparkColors;
      for (let i = 0; i < sparkCount; i++) {
        sparksRef.current.push({
          x: e.clientX,
          y: e.clientY,
          angle: (2 * Math.PI * i) / sparkCount,
          startTime: now,
          color: colors[i % colors.length],
        });
      }
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparksRef.current = sparksRef.current.filter(sp => {
        const elapsed = now - sp.startTime;
        if (elapsed >= duration) return false;
        const progress = elapsed / duration;
        const eased = 1 - Math.pow(1 - progress, 3);
        const dist = eased * sparkRadius;
        const lineLen = sparkSize * (1 - eased);

        const x1 = sp.x + dist * Math.cos(sp.angle);
        const y1 = sp.y + dist * Math.sin(sp.angle);
        const x2 = sp.x + (dist + lineLen) * Math.cos(sp.angle);
        const y2 = sp.y + (dist + lineLen) * Math.sin(sp.angle);

        ctx.strokeStyle = sp.color;
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return true;
      });

      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", resize);
    };
  }, [duration, paletteId, sparkColor, sparkCount, sparkRadius, sparkSize]);

  return (
    <canvas
      ref={canvasRef}
      data-bg="click-spark"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 999,
      }}
      aria-hidden="true"
    />
  );
};
