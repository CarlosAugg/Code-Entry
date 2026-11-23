import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  phase: number;
  useSecondary: boolean;
}

function readRgbVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return val || fallback;
}

/**
 * Efeito atmosférico sutil e exclusivo para o palco de Aulas Interativas:
 * Partículas suaves em bokeh profundo que respiram em baixa opacidade usando
 * as cores do tema ativo — sem grades chamativas nem linhas distraindo do código.
 */
export const LessonStageBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion =
      document.documentElement.classList.contains("reduced-motion") ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    const particles: Particle[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(300, Math.floor(rect.width || window.innerWidth));
      height = Math.max(300, Math.floor(rect.height || window.innerHeight));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const count = 26;
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: i < 5 ? 65 + Math.random() * 85 : 1.4 + Math.random() * 2.4,
        vx: (Math.random() - 0.5) * (i < 5 ? 0.14 : 0.22),
        vy: (Math.random() - 0.5) * (i < 5 ? 0.12 : 0.2) - (i < 5 ? 0 : 0.05),
        alpha: i < 5 ? 0.045 + Math.random() * 0.035 : 0.16 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
        useSecondary: i % 3 === 0,
      });
    }

    window.addEventListener("resize", resize);

    let t = 0;
    const render = () => {
      t += 0.012;
      ctx.clearRect(0, 0, width, height);

      const accentRgb = readRgbVar("--accent-rgb", "139, 92, 246");
      const tertiaryRgb = readRgbVar("--accent-tertiary-rgb", "56, 189, 248");

      for (const p of particles) {
        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -p.r) p.x = width + p.r;
          if (p.x > width + p.r) p.x = -p.r;
          if (p.y < -p.r) p.y = height + p.r;
          if (p.y > height + p.r) p.y = -p.r;
        }

        const rgb = p.useSecondary ? tertiaryRgb : accentRgb;
        const breathe = 0.78 + Math.sin(t + p.phase) * 0.22;
        const a = p.alpha * breathe;

        if (p.r > 20) {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          grad.addColorStop(0, `rgba(${rgb}, ${a.toFixed(3)})`);
          grad.addColorStop(1, `rgba(${rgb}, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(${rgb}, ${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!reducedMotion) {
        raf = window.requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
};
