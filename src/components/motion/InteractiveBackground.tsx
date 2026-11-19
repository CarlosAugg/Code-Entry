import React, { useEffect, useRef } from "react";
import { getPaletteById, type ThemePaletteId } from "../../data/themes";

interface ParticleNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  colorIdx: number;
  alpha: number;
}

/*
 * React Bits (DavidHDev/react-bits) — Combinação de DotGrid + Particles interativo em Canvas 2D.
 * Renderiza malha de pontos que se ilumina perto do cursor + partículas conectadas flutuantes.
 */
export const InteractiveBackground: React.FC<{
  reducedMotion?: boolean;
  theme?: "dark" | "light";
  paletteId?: ThemePaletteId;
}> = ({ reducedMotion = false, theme = "dark", paletteId }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let rafId = 0;

    const pointer = { x: width * 0.62, y: height * 0.28, active: false };
    const paletteDef = getPaletteById(paletteId || (theme === "light" ? "light-arctic" : "dark-violet"));
    const palette = paletteDef.canvasRgb;

    const particleCount = Math.min(44, Math.max(22, Math.floor((width * height) / 34000)));
    const particles: ParticleNode[] = Array.from({ length: particleCount }, (_, i) => ({
      x: (i * 197) % Math.max(1, width),
      y: (i * 313) % Math.max(1, height),
      vx: (i % 2 === 0 ? 1 : -1) * (0.18 + (i % 5) * 0.05),
      vy: (i % 3 === 0 ? -1 : 1) * (0.15 + (i % 4) * 0.04),
      r: 1.4 + (i % 3) * 0.7,
      colorIdx: i % palette.length,
      alpha: theme === "light" ? 0.34 : 0.48,
    }));

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      if (reducedMotion) renderFrame();
    };

    const onMouseMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Halo radial suave acompanhando o cursor
      const glowRadius = Math.min(width, height) * 0.45;
      const grad = ctx.createRadialGradient(
        pointer.x,
        pointer.y,
        10,
        pointer.x,
        pointer.y,
        glowRadius
      );
      grad.addColorStop(0, `rgba(${palette[0]}, ${theme === "light" ? 0.075 : 0.12})`);
      grad.addColorStop(0.5, `rgba(${palette[1]}, ${theme === "light" ? 0.035 : 0.05})`);
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. React Bits DotGrid (pontos reativos à proximidade do ponteiro)
      const spacing = width <= 680 ? 44 : 38;
      const maxInfluence = 175;
      const baseDotAlpha = theme === "light" ? 0.11 : 0.13;

      for (let gx = spacing; gx < width; gx += spacing) {
        for (let gy = spacing; gy < height; gy += spacing) {
          const dx = gx - pointer.x;
          const dy = gy - pointer.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxInfluence) {
            const factor = 1 - dist / maxInfluence;
            const shift = factor * 3.2;
            const angle = Math.atan2(dy, dx);
            const drawX = gx + Math.cos(angle) * shift;
            const drawY = gy + Math.sin(angle) * shift;
            ctx.fillStyle = `rgba(${palette[0]}, ${baseDotAlpha + factor * 0.36})`;
            ctx.beginPath();
            ctx.arc(drawX, drawY, 1.15 + factor * 1.15, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle =
              theme === "light" ? `rgba(15, 23, 42, ${baseDotAlpha})` : `rgba(148, 163, 184, ${baseDotAlpha})`;
            ctx.fillRect(gx - 0.7, gy - 0.7, 1.4, 1.4);
          }
        }
      }

      // 3. React Bits Particles + Constelação sutil
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        const rgb = palette[p.colorIdx];
        ctx.fillStyle = `rgba(${rgb}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 135) {
            const lineAlpha = (1 - d / 135) * (theme === "light" ? 0.11 : 0.16);
            ctx.strokeStyle = `rgba(${rgb}, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        if (pointer.active) {
          const dp = Math.hypot(p.x - pointer.x, p.y - pointer.y);
          if (dp < 160) {
            const cursorAlpha = (1 - dp / 160) * (theme === "light" ? 0.18 : 0.26);
            ctx.strokeStyle = `rgba(${palette[1]}, ${cursorAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }
    };

    renderFrame();

    if (!reducedMotion) {
      const loop = () => {
        renderFrame();
        rafId = window.requestAnimationFrame(loop);
      };
      rafId = window.requestAnimationFrame(loop);
      window.addEventListener("mousemove", onMouseMove, { passive: true });
    }

    window.addEventListener("resize", onResize);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, [reducedMotion, theme, paletteId]);

  return (
    <canvas
      ref={canvasRef}
      data-bg="interactive-grid"
      className="ce-interactive-bg-canvas"
      aria-hidden="true"
    />
  );
};
