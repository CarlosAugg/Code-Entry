import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Shuffle, Sparkles, X } from "lucide-react";
import { usePlatform } from "../../context/PlatformContext";
import { LiaRobotMascot, playLiaEasterEggSound } from "../study/LiaRobotMascot";
import type { LiaEasterEgg, LiaExpression, LiaPointing } from "../../types/theater";

export type LiaCameoId =
  | "walk-dog"
  | "shopping"
  | "coffee-break"
  | "balloon-flight"
  | "bug-chase"
  | "music-skate";

interface LiaCameoSpec {
  id: LiaCameoId;
  label: string;
  emoji: string;
  direction: "ltr" | "rtl" | "peek-right";
  durationSec: number;
  expression: LiaExpression;
  pointing: LiaPointing;
  speech: string;
}

const CAMEOS: LiaCameoSpec[] = [
  {
    id: "walk-dog",
    label: "Doguinho",
    emoji: "🐶",
    direction: "ltr",
    durationSec: 14,
    expression: "happy",
    pointing: "right",
    speech: "Hora do passeio do Byte! Hoje ele só quer saber de farejar bugs...",
  },
  {
    id: "shopping",
    label: "Comprinhas",
    emoji: "🛍️",
    direction: "rtl",
    durationSec: 13.5,
    expression: "wink",
    pointing: "none",
    speech: "Comprei uns pacotes npm novinhos... só espero que caibam no disco!",
  },
  {
    id: "coffee-break",
    label: "Cafézinho",
    emoji: "☕",
    direction: "peek-right",
    durationSec: 8.5,
    expression: "happy",
    pointing: "none",
    speech: "Pausa rápida pro café... nenhum compilador trabalha sem cafeína!",
  },
  {
    id: "balloon-flight",
    label: "Balão",
    emoji: "🎈",
    direction: "ltr",
    durationSec: 14.5,
    expression: "starry",
    pointing: "up",
    speech: "Olha a vista daqui de cima! Seu código tá ficando cada vez mais limpo!",
  },
  {
    id: "bug-chase",
    label: "Caça-Bug",
    emoji: "🐛",
    direction: "ltr",
    durationSec: 11.5,
    expression: "startled",
    pointing: "right",
    speech: "Ei, volta aqui!! Esse bug não tava em produção ontem!!",
  },
  {
    id: "music-skate",
    label: "Skate & Som",
    emoji: "🛹",
    direction: "rtl",
    durationSec: 12.5,
    expression: "wink",
    pointing: "none",
    speech: "Modo foco ativado: lo-fi no fone e zero erros no console!",
  },
];

const CameoPropsOverlay: React.FC<{ id: LiaCameoId }> = ({ id }) => {
  if (id === "walk-dog") {
    return (
      <div className="ce-cameo-prop-dog" aria-hidden="true">
        <svg viewBox="0 0 110 68" className="ce-cameo-dog-svg">
          {/* Coleira / guia energética */}
          <path
            d="M 4 28 Q 32 48 64 38"
            fill="none"
            stroke="var(--accent-secondary)"
            strokeWidth="2.2"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />
          {/* Cachorrinho cibernético Byte */}
          <g className="ce-cameo-dog-body">
            {/* Rabinho abanando */}
            <path
              d="M 59 38 Q 52 24 58 20"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="4"
              strokeLinecap="round"
              className="ce-cameo-dog-tail"
            />
            {/* Patinhas */}
            <rect x="64" y="48" width="5" height="12" rx="2.5" fill="#d97706" className="ce-cameo-paw-a" />
            <rect x="82" y="48" width="5" height="12" rx="2.5" fill="#d97706" className="ce-cameo-paw-b" />
            {/* Corpo */}
            <rect x="60" y="32" width="30" height="19" rx="9" fill="#f59e0b" />
            {/* Coleira */}
            <rect x="81" y="32" width="5" height="16" rx="2" fill="#38bdf8" />
            {/* Cabeça */}
            <circle cx="91" cy="28" r="11" fill="#fbbf24" />
            {/* Orelha */}
            <ellipse cx="84" cy="27" rx="3.5" ry="6.5" fill="#b45309" />
            {/* Olhinho & focinho */}
            <circle cx="94" cy="26" r="2" fill="#0f172a" />
            <circle cx="101" cy="29" r="2.3" fill="#0f172a" />
          </g>
        </svg>
      </div>
    );
  }

  if (id === "shopping") {
    return (
      <div className="ce-cameo-prop-bags" aria-hidden="true">
        <svg viewBox="0 0 96 64" className="ce-cameo-bags-svg">
          <g className="ce-cameo-bag-a">
            <path d="M 16 20 C 16 12 28 12 28 20" fill="none" stroke="#c084fc" strokeWidth="2.4" />
            <rect x="10" y="20" width="24" height="28" rx="4" fill="#8b5cf6" stroke="#ddd6fe" strokeWidth="1.4" />
            <text x="22" y="38" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">
              JS
            </text>
          </g>
          <g className="ce-cameo-bag-b">
            <path d="M 58 22 C 58 14 70 14 70 22" fill="none" stroke="#67e8f9" strokeWidth="2.4" />
            <rect x="52" y="22" width="24" height="26" rx="4" fill="#06b6d4" stroke="#cffafe" strokeWidth="1.4" />
            <text x="64" y="39" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="800">
              UI
            </text>
          </g>
        </svg>
      </div>
    );
  }

  if (id === "coffee-break") {
    return (
      <div className="ce-cameo-prop-coffee" aria-hidden="true">
        <svg viewBox="0 0 56 64" className="ce-cameo-coffee-svg">
          <path d="M 18 18 Q 14 10 20 4" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" className="ce-cameo-steam-a" />
          <path d="M 28 17 Q 32 9 26 3" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" className="ce-cameo-steam-b" />
          <rect x="12" y="24" width="24" height="24" rx="5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.6" />
          <path d="M 36 29 C 44 29 44 41 36 41" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          <rect x="15" y="27" width="18" height="4" rx="2" fill="#78350f" />
        </svg>
      </div>
    );
  }

  if (id === "bug-chase") {
    return (
      <div className="ce-cameo-prop-bug" aria-hidden="true">
        <svg viewBox="0 0 46 38" className="ce-cameo-bug-svg">
          <ellipse cx="23" cy="21" rx="11" ry="9" fill="#22c55e" stroke="#bbf7d0" strokeWidth="1.5" />
          <circle cx="33" cy="19" r="5" fill="#15803d" />
          <line x1="36" y1="15" x2="41" y2="10" stroke="#86efac" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="37" y1="21" x2="43" y2="20" stroke="#86efac" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="20" cy="19" r="1.8" fill="#0f172a" />
          <circle cx="26" cy="23" r="1.8" fill="#0f172a" />
        </svg>
      </div>
    );
  }

  return null;
};

const CameoAttachedProps: React.FC<{ id: LiaCameoId }> = ({ id }) => {
  if (id === "balloon-flight") {
    return (
      <div className="ce-cameo-prop-balloon" aria-hidden="true">
        <svg viewBox="0 0 64 126" className="ce-cameo-balloon-svg">
          <path d="M 32 54 Q 26 84 34 122" fill="none" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="32" cy="28" rx="22" ry="26" fill="url(#ceBalloonGrad)" stroke="#fbcfe8" strokeWidth="1.5" />
          <polygon points="32,54 27,59 37,59" fill="#ec4899" />
          <path
            d="M32 18 L34.4 23.2 L40 24 L35.9 27.9 L36.9 33.5 L32 30.8 L27.1 33.5 L28.1 27.9 L24 24 L29.6 23.2 Z"
            fill="#ffffff"
            opacity="0.9"
          />
          <defs>
            <linearGradient id="ceBalloonGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (id === "bug-chase") {
    return (
      <div className="ce-cameo-prop-net" aria-hidden="true">
        <svg viewBox="0 0 68 54" className="ce-cameo-net-svg">
          <line x1="6" y1="42" x2="36" y2="20" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="48" cy="16" rx="13" ry="10" fill="rgba(56,189,248,0.18)" stroke="#38bdf8" strokeWidth="2.2" />
        </svg>
      </div>
    );
  }

  if (id === "music-skate") {
    return (
      <>
        <div className="ce-cameo-prop-headphones" aria-hidden="true">
          <svg viewBox="0 0 96 52" className="ce-cameo-hp-svg">
            <path d="M 13 40 C 13 3 83 3 83 40" fill="none" stroke="#38bdf8" strokeWidth="4.2" strokeLinecap="round" />
            <rect x="6" y="30" width="10" height="18" rx="5" fill="#8b5cf6" stroke="#e0e7ff" strokeWidth="1.4" />
            <rect x="80" y="30" width="10" height="18" rx="5" fill="#8b5cf6" stroke="#e0e7ff" strokeWidth="1.4" />
          </svg>
        </div>
        <div className="ce-cameo-prop-skate" aria-hidden="true">
          <svg viewBox="0 0 110 28" className="ce-cameo-skate-svg">
            <rect x="8" y="8" width="94" height="9" rx="4.5" fill="url(#ceSkateGrad)" stroke="#bae6fd" strokeWidth="1.3" />
            <circle cx="26" cy="21" r="5" fill="#38bdf8" />
            <circle cx="84" cy="21" r="5" fill="#a855f7" />
            <defs>
              <linearGradient id="ceSkateGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className="ce-cameo-note is-a" aria-hidden="true">♪</span>
        <span className="ce-cameo-note is-b" aria-hidden="true">♫</span>
      </>
    );
  }

  return null;
};

export const LiaAmbientCameos: React.FC = () => {
  const { tourOpen, personalizationOpen } = usePlatform();
  const [activeCameo, setActiveCameo] = useState<LiaCameoSpec | null>(null);
  const [cameoRunKey, setCameoRunKey] = useState(0);
  const [testPanelOpen, setTestPanelOpen] = useState(false);
  const [liaEgg, setLiaEgg] = useState<LiaEasterEgg>(null);
  const [liaCallout, setLiaCallout] = useState<string | null>(null);

  const cameoTimerRef = useRef<number | null>(null);
  const eggTimerRef = useRef<number | null>(null);
  const eggCountRef = useRef(0);

  const isSuppressed = useCallback(() => {
    if (tourOpen || personalizationOpen) return true;
    if (typeof document !== "undefined" && document.querySelector(".ce-lia-theater-overlay")) {
      return true;
    }
    return false;
  }, [tourOpen, personalizationOpen]);

  const triggerCameo = useCallback(
    (id?: LiaCameoId) => {
      if (isSuppressed()) return;
      const picked = id
        ? CAMEOS.find(c => c.id === id) || CAMEOS[0]
        : CAMEOS[Math.floor(Math.random() * CAMEOS.length)];

      if (cameoTimerRef.current) window.clearTimeout(cameoTimerRef.current);
      setLiaEgg(null);
      setLiaCallout(null);
      setActiveCameo(picked);
      setCameoRunKey(k => k + 1);

      cameoTimerRef.current = window.setTimeout(() => {
        setActiveCameo(null);
        cameoTimerRef.current = null;
      }, picked.durationSec * 1000 + 250);
    },
    [isSuppressed]
  );

  // Ouvinte para abrir o painel de testes pelo menu do perfil
  useEffect(() => {
    const onOpenPanel = () => setTestPanelOpen(true);
    window.addEventListener("ce-lia-ambient-panel", onOpenPanel);
    return () => window.removeEventListener("ce-lia-ambient-panel", onOpenPanel);
  }, []);

  // A cada 10 minutos, rola um dado (45% de chance) para decidir se acontece um evento aleatório
  useEffect(() => {
    if (tourOpen || personalizationOpen) {
      if (cameoTimerRef.current) window.clearTimeout(cameoTimerRef.current);
      setActiveCameo(null);
      return;
    }

    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const intervalId = window.setInterval(() => {
      if (activeCameo || isSuppressed()) return;
      if (Math.random() < 0.45) {
        triggerCameo();
      }
    }, TEN_MINUTES_MS);

    return () => window.clearInterval(intervalId);
  }, [tourOpen, personalizationOpen, activeCameo, isSuppressed, triggerCameo]);

  useEffect(() => {
    return () => {
      if (cameoTimerRef.current) window.clearTimeout(cameoTimerRef.current);
      if (eggTimerRef.current) window.clearTimeout(eggTimerRef.current);
    };
  }, []);

  const handleLiaClick = useCallback(() => {
    const reactions: Array<{ egg: "jump" | "startle" | "love"; text: string }> = [
      { egg: "jump", text: "Hehe!" },
      { egg: "startle", text: "Opa!" },
      { egg: "love", text: "♥" },
    ];
    const picked = reactions[eggCountRef.current % reactions.length];
    eggCountRef.current += 1;
    setLiaEgg(picked.egg);
    setLiaCallout(picked.text);
    playLiaEasterEggSound(picked.egg);

    if (eggTimerRef.current) window.clearTimeout(eggTimerRef.current);
    eggTimerRef.current = window.setTimeout(() => {
      setLiaEgg(null);
      setLiaCallout(null);
    }, 1250);
  }, []);

  if (typeof document === "undefined") return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;

  const getMotionTrack = (spec: LiaCameoSpec) => {
    if (spec.direction === "ltr") {
      return {
        initial: { x: -160, opacity: 0 },
        animate: { x: vw + 180, opacity: [0, 1, 1, 1, 0] },
        transition: { duration: spec.durationSec, ease: "linear" as const },
      };
    }
    if (spec.direction === "rtl") {
      return {
        initial: { x: vw + 140, opacity: 0 },
        animate: { x: -240, opacity: [0, 1, 1, 1, 0] },
        transition: { duration: spec.durationSec, ease: "linear" as const },
      };
    }
    return {
      initial: { x: vw + 80, opacity: 0 },
      animate: {
        x: [vw + 80, Math.max(16, vw - 360), Math.max(16, vw - 360), vw + 80],
        opacity: [0, 1, 1, 0],
      },
      transition: {
        duration: spec.durationSec,
        times: [0, 0.22, 0.78, 1],
        ease: "easeInOut" as const,
      },
    };
  };

  return createPortal(
    <>
      <AnimatePresence>
        {activeCameo && (
          <motion.div
            key={`${activeCameo.id}-${cameoRunKey}`}
            className={`ce-cameo-stage is-cameo-${activeCameo.id} is-dir-${activeCameo.direction}`}
            {...getMotionTrack(activeCameo)}
          >
            <div className="ce-cameo-actor">
              <CameoPropsOverlay id={activeCameo.id} />

              <div className="ce-cameo-mascot">
                <CameoAttachedProps id={activeCameo.id} />
                <LiaRobotMascot
                  expression={activeCameo.expression}
                  speaking={false}
                  visible
                  pointing={activeCameo.pointing}
                  easterEgg={liaEgg}
                  callout={liaCallout ?? undefined}
                  onClick={handleLiaClick}
                />
              </div>

              <div className="ce-cameo-bubble" role="status">
                <span>{activeCameo.speech}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {testPanelOpen && (
        <div className="ce-cameo-test-dock" role="region" aria-label="Testar eventos da Lia">
          <div className="ce-cameo-test-head">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={13} style={{ color: "var(--accent-secondary)" }} />
              <strong>Eventos da Lia</strong>
            </span>
            <button
              type="button"
              className="ce-tour-bubble-close"
              onClick={() => setTestPanelOpen(false)}
              aria-label="Fechar painel de eventos"
            >
              <X size={13} />
            </button>
          </div>

          <div className="ce-cameo-test-grid">
            {CAMEOS.map(c => (
              <button
                key={c.id}
                type="button"
                className={`ce-btn ce-btn-sm ${
                  activeCameo?.id === c.id ? "ce-btn-primary" : "ce-btn-ghost"
                }`}
                onClick={() => triggerCameo(c.id)}
              >
                <span>{c.emoji}</span>
                <span>{c.label}</span>
              </button>
            ))}
            <button
              type="button"
              className="ce-btn ce-btn-ghost ce-btn-sm"
              onClick={() => triggerCameo()}
            >
              <Shuffle size={12} />
              <span>Aleatório</span>
            </button>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};
