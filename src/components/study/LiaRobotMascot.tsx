import React from "react";
import type { LiaEasterEgg, LiaExpression, LiaPlacement, LiaPointing } from "../../types/theater";

/**
 * Sintetizador de efeitos sonoros fofos via Web Audio API para o Easter Egg de clique na Lia.
 */
export function playLiaEasterEggSound(kind: "jump" | "startle" | "love") {
  if (typeof window === "undefined") return;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (kind === "jump") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.11);
      osc.frequency.setValueAtTime(520, now + 0.13);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.26);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.29);
    } else if (kind === "startle") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(620, now + 0.06);
      osc.frequency.setValueAtTime(1040, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        const t = now + idx * 0.055;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.29);
      });
    }
  } catch {
    // Ignora caso o navegador bloqueie WebAudio
  }
}

interface LiaRobotMascotProps {
  expression: LiaExpression;
  speaking: boolean;
  visible: boolean;
  easterEgg?: LiaEasterEgg;
  pointing?: LiaPointing;
  placement?: LiaPlacement;
  callout?: string;
  title?: string;
  onClick?: () => void;
}

/**
 * Componente reutilizável da mentora Lia em SVG com expressões dinâmicas, gestos e Easter Eggs.
 * Instanciado uma única vez pelo motor do teatro para máxima performance.
 */
export const LiaRobotMascot: React.FC<LiaRobotMascotProps> = React.memo(
  ({
    expression,
    speaking,
    visible,
    easterEgg = null,
    pointing = "none",
    placement = "corner-left",
    callout,
    title,
    onClick,
  }) => {
    const effectiveExpression: LiaExpression =
      easterEgg === "startle"
        ? "startled"
        : easterEgg === "love"
          ? "wink"
          : easterEgg === "jump"
            ? "starry"
            : expression;

    const leftArmTransform =
      pointing === "left" ? "rotate(76 42 105) translate(0 -8)" : "rotate(18 42 115)";
    const rightArmTransform =
      pointing === "right"
        ? "rotate(-76 112 105) translate(0 -8)"
        : pointing === "up"
          ? "rotate(-128 112 96) translate(0 -6)"
          : pointing === "down"
            ? "rotate(26 112 103) translate(3 9)"
            : "rotate(-38 112 103)";

    return (
      <div
        className={`ce-liabot-wrap is-place-${placement} ${visible ? "is-visible" : "is-hidden"} ${
          speaking ? "is-speaking" : ""
        } ${pointing !== "none" ? `is-pointing-${pointing}` : ""} ${
          easterEgg ? `is-egg-${easterEgg}` : ""
        }`}
        onClick={visible ? onClick : undefined}
        role={visible && onClick ? "button" : undefined}
        tabIndex={visible && onClick ? 0 : -1}
        onKeyDown={e => {
          if (visible && onClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick();
          }
        }}
        title={visible ? title : undefined}
        aria-label={visible ? "Lia" : undefined}
        aria-hidden={!visible}
      >
        {visible && callout && !easterEgg && (
          <div key={callout} className="ce-liabot-callout" aria-hidden="true">
            {callout}
          </div>
        )}
        {easterEgg === "love" && (
          <div className="ce-liabot-egg-badge is-love" aria-hidden="true">
            <span>♥</span>
            <span>♥</span>
            <span>♥</span>
          </div>
        )}
        {easterEgg === "startle" && (
          <div className="ce-liabot-egg-badge is-startle" aria-hidden="true">
            <span>!</span>
          </div>
        )}
        {easterEgg === "jump" && (
          <div className="ce-liabot-egg-badge is-jump" aria-hidden="true">
            <span>✦</span>
            <span>✧</span>
          </div>
        )}

        <svg viewBox="0 0 150 165" className="ce-liabot-svg">
          <defs>
            <linearGradient id="liaBodyShell" x1="0" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="liaVisorBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#090d1a" />
            </linearGradient>
            <linearGradient id="liaRibbonGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="liaCyanGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <filter id="liaEyeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <ellipse cx="75" cy="154" rx="30" ry="6.5" fill="rgba(168, 85, 247, 0.34)" />

          <path d="M27 38 C12 24, 10 46, 23 55 Z" fill="url(#liaRibbonGrad)" />
          <path d="M123 38 C138 24, 140 46, 127 55 Z" fill="url(#liaRibbonGrad)" />
          <circle cx="30" cy="34" r="5" fill="#f472b6" />
          <circle cx="120" cy="34" r="5" fill="#f472b6" />

          <path d="M52 102 C48 122, 58 142, 75 142 C92 142, 102 122, 98 102 Z" fill="url(#liaBodyShell)" />
          <path
            d="M62 110 Q75 117 88 110 Q85 127 75 130 Q65 127 62 110 Z"
            fill={easterEgg === "love" ? "#f472b6" : "url(#liaCyanGlow)"}
          />

          <ellipse
            cx="42"
            cy="115"
            rx="8"
            ry="15"
            transform={leftArmTransform}
            fill={pointing === "left" ? "url(#liaCyanGlow)" : "url(#liaBodyShell)"}
            className="ce-liabot-arm"
          />
          <ellipse
            cx="112"
            cy="103"
            rx="8"
            ry="16"
            transform={rightArmTransform}
            fill={pointing === "right" || pointing === "up" ? "url(#liaCyanGlow)" : "url(#liaBodyShell)"}
            className="ce-liabot-wave-arm ce-liabot-arm"
          />

          <rect x="26" y="26" width="98" height="76" rx="38" fill="url(#liaBodyShell)" />
          <rect x="19" y="50" width="9" height="26" rx="4.5" fill="url(#liaRibbonGrad)" />
          <rect x="122" y="50" width="9" height="26" rx="4.5" fill="url(#liaRibbonGrad)" />

          <rect
            x="35"
            y="38"
            width="80"
            height="52"
            rx="25"
            fill="url(#liaVisorBg)"
            stroke="#a855f7"
            strokeWidth="1.6"
          />

          <ellipse cx="48" cy="73" rx="6" ry="3.2" fill="#f472b6" opacity={easterEgg === "love" ? 0.95 : 0.65} />
          <ellipse cx="102" cy="73" rx="6" ry="3.2" fill="#f472b6" opacity={easterEgg === "love" ? 0.95 : 0.65} />

          <g filter="url(#liaEyeGlow)">
            <path d="M46 55 L42 52" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <path d="M104 55 L108 52" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />

            {effectiveExpression === "startled" ? (
              <>
                <circle cx="56" cy="60" r="8.5" fill="none" stroke="#38bdf8" strokeWidth="3" />
                <circle cx="56" cy="60" r="3" fill="#ffffff" />
                <circle cx="94" cy="60" r="8.5" fill="none" stroke="#38bdf8" strokeWidth="3" />
                <circle cx="94" cy="60" r="3" fill="#ffffff" />
              </>
            ) : effectiveExpression === "wink" ? (
              <>
                <ellipse cx="56" cy="61" rx="7" ry="8.5" fill="#38bdf8" />
                <circle cx="58.5" cy="58" r="2.6" fill="#ffffff" />
                <path
                  d="M86 62 Q94 53 102 62"
                  fill="none"
                  stroke={easterEgg === "love" ? "#f472b6" : "#38bdf8"}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </>
            ) : effectiveExpression === "starry" ? (
              <>
                <path d="M48 63 Q56 51 64 63" fill="none" stroke="#4ade80" strokeWidth="3.8" strokeLinecap="round" />
                <path d="M86 63 Q94 51 102 63" fill="none" stroke="#4ade80" strokeWidth="3.8" strokeLinecap="round" />
              </>
            ) : effectiveExpression === "curious" || effectiveExpression === "explaining" ? (
              <>
                <ellipse cx="56" cy="61" rx="7.2" ry="8.2" fill="#38bdf8" />
                <circle cx="58.5" cy="58.5" r="2.5" fill="#ffffff" />
                <ellipse cx="94" cy="61" rx="7.2" ry="8.2" fill="#38bdf8" />
                <circle cx="96.5" cy="58.5" r="2.5" fill="#ffffff" />
                <path d="M48 49 Q56 46 63 49" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
                <path d="M87 47 Q94 44 102 48" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M48 63 Q56 52 64 63" fill="none" stroke="#38bdf8" strokeWidth="3.6" strokeLinecap="round" />
                <path d="M86 63 Q94 52 102 63" fill="none" stroke="#38bdf8" strokeWidth="3.6" strokeLinecap="round" />
              </>
            )}

            {effectiveExpression === "startled" ? (
              <circle cx="75" cy="76" r="4" fill="none" stroke="#f472b6" strokeWidth="2.2" />
            ) : speaking ? (
              <path d="M69 75 Q75 82 81 75 Z" fill="#f472b6" stroke="#38bdf8" strokeWidth="1.4" />
            ) : (
              <path d="M70 75 Q75 79 80 75" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
            )}
          </g>
        </svg>
      </div>
    );
  }
);

LiaRobotMascot.displayName = "LiaRobotMascot";
