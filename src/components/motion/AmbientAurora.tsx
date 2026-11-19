import React, { useEffect, useRef } from "react";
import { getPaletteById } from "../../data/themes";

/*
 * Controle explícito de velocidade das ondas e partículas de fundo (Aurora + Waves).
 * BASE_TIME_STEP representa o avanço temporal por frame (aprox. 60fps).
 * HERO_BANNER_SPEED_MULTIPLIER = 0.5 reduz em 50% a velocidade apenas no banner principal inicial.
 */
export const BASE_TIME_STEP = 0.022;
export const HERO_BANNER_SPEED_MULTIPLIER = 0.5;

interface AmbientAuroraProps {
  accentColor?: string;
  secondaryColor?: string;
  speed?: number;
}

/*
 * React Bits (DavidHDev/react-bits) — Aurora + Waves em HTML5 Canvas 2D para Hero Banners.
 * Desenha ondas de aurora em múltiplas camadas senoidais + partículas luminosas que reagem ao mouse.
 */
export const AmbientAurora: React.FC<AmbientAuroraProps> = ({
  accentColor,
  secondaryColor,
  speed = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let time = 0;
    let pointerRatioX = 0.72;
    let pointerRatioY = 0.38;

    const isReduced = () =>
      document.documentElement.classList.contains("reduced-motion") ||
      (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = Math.max(300, Math.floor(rect.width));
      canvas.height = Math.max(140, Math.floor(rect.height));
    };

    resize();

    const sparks = Array.from({ length: 18 }, (_, i) => ({
      xRatio: ((i * 61 + 17) % 97) / 97,
      yRatio: ((i * 43 + 29) % 89) / 89,
      r: 1.1 + (i % 3) * 0.75,
      phase: i * 0.7,
    }));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const isLight = document.documentElement.classList.contains("light-theme");
      const activePalette = getPaletteById(
        document.documentElement.dataset.palette || (isLight ? "light-arctic" : "dark-violet")
      );
      const resolvedPrimary = accentColor || activePalette.auroraPrimary;
      const resolvedSecondary = secondaryColor || activePalette.auroraSecondary;

      ctx.clearRect(0, 0, w, h);

      // 1. Halo de luz focal da aurora
      const focalX = w * pointerRatioX;
      const focalY = h * pointerRatioY;
      const radial = ctx.createRadialGradient(focalX, focalY, 8, focalX, focalY, Math.max(w, h) * 0.65);
      radial.addColorStop(0, accentColor ? `${accentColor}38` : activePalette.auroraFocalRgba);
      radial.addColorStop(0.55, secondaryColor ? `${secondaryColor}26` : activePalette.auroraSecondaryRgba);
      radial.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, w, h);

      // 2. Fitas / ondas fluidas (Aurora Waves)
      const layers = [
        { amp: 18, freq: 0.0085, speed: 1.1, yOffset: h * 0.42, alpha: isLight ? 0.16 : 0.24, width: 2.2 },
        { amp: 24, freq: 0.0065, speed: -0.85, yOffset: h * 0.58, alpha: isLight ? 0.13 : 0.2, width: 1.8 },
        { amp: 14, freq: 0.011, speed: 1.45, yOffset: h * 0.72, alpha: isLight ? 0.11 : 0.17, width: 1.4 },
      ];

      layers.forEach((layer, idx) => {
        const waveGrad = ctx.createLinearGradient(0, 0, w, h);
        waveGrad.addColorStop(0, resolvedPrimary.startsWith("#") ? `${resolvedPrimary}44` : resolvedPrimary);
        waveGrad.addColorStop(0.5, activePalette.auroraFocalRgba);
        waveGrad.addColorStop(1, resolvedSecondary.startsWith("#") ? `${resolvedSecondary}44` : resolvedSecondary);

        ctx.save();
        ctx.beginPath();
        for (let x = 0; x <= w; x += 10) {
          const cursorPull = Math.exp(-Math.pow((x - focalX) / (w * 0.28), 2)) * ((pointerRatioY - 0.5) * 26);
          const y =
            layer.yOffset +
            Math.sin(x * layer.freq + time * layer.speed + idx) * layer.amp +
            Math.cos(x * layer.freq * 0.55 - time * 0.6) * (layer.amp * 0.45) +
            cursorPull;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = waveGrad;
        ctx.lineWidth = layer.width;
        ctx.stroke();

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.globalAlpha = layer.alpha * 0.55;
        ctx.fillStyle = waveGrad;
        ctx.fill();
        ctx.restore();
      });

      // 3. Micro-partículas cintilantes dentro do Hero
      sparks.forEach(sp => {
        const sx = (sp.xRatio * w + time * 11) % w;
        const sy = sp.yRatio * h + Math.sin(time * 1.4 + sp.phase) * 6;
        const pulse = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(time * 2.1 + sp.phase));
        ctx.fillStyle = `rgba(${activePalette.auroraSparkRgb}, ${pulse * (isLight ? 0.55 : 0.72)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sp.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const parent = canvas.parentElement;
    const onPointerMove = (e: MouseEvent) => {
      if (!parent) return;
      const r = parent.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        pointerRatioX = Math.max(0.05, Math.min(0.95, (e.clientX - r.left) / r.width));
        pointerRatioY = Math.max(0.05, Math.min(0.95, (e.clientY - r.top) / r.height));
      }
    };

    draw();

    // Redesenha imediatamente quando o usuário troca a paleta ou modo no <html>
    const themeObserver = new MutationObserver(() => {
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-palette", "class"],
    });

    const tick = () => {
      if (!isReduced()) {
        time += BASE_TIME_STEP * speed;
        draw();
      }
      rafId = window.requestAnimationFrame(tick);
    };

    if (!isReduced()) {
      rafId = window.requestAnimationFrame(tick);
      parent?.addEventListener("mousemove", onPointerMove, { passive: true });
    }

    window.addEventListener("resize", resize);
    return () => {
      window.cancelAnimationFrame(rafId);
      themeObserver.disconnect();
      parent?.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("resize", resize);
    };
  }, [accentColor, secondaryColor, speed]);

  return (
    <div className="ce-ambient-aurora" aria-hidden="true">
      <canvas
        ref={canvasRef}
        data-bg="ambient-aurora"
        data-speed-multiplier={String(speed)}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
};
