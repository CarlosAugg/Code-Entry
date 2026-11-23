import React from "react";

export type HeroIllustrationVariant =
  | "tracks"
  | "roadmaps"
  | "projects"
  | "challenges"
  | "labs"
  | "achievements"
  | "history"
  | "study-plan";

interface HeroIllustrationProps {
  variant: HeroIllustrationVariant;
}

export const HeroIllustration: React.FC<HeroIllustrationProps> = ({ variant }) => {
  if (variant === "tracks") {
    return (
      <svg
        className="ce-hero-vector-art"
        viewBox="0 0 320 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ce-tr-grad-1" x1="20" y1="20" x2="300" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.34" />
            <stop offset="100%" stopColor="var(--accent-tertiary, #38bdf8)" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="ce-tr-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent-secondary)" />
            <stop offset="100%" stopColor="var(--accent-tertiary, #38bdf8)" />
          </linearGradient>
        </defs>

        <ellipse cx="168" cy="112" rx="126" ry="78" fill="url(#ce-tr-grad-1)" opacity="0.55" />
        <path
          d="M72 162 C 110 162, 114 114, 152 114 C 190 114, 194 64, 238 64"
          stroke="url(#ce-tr-stroke)"
          strokeWidth="2.4"
          strokeDasharray="5 5"
          strokeLinecap="round"
        />

        <g transform="translate(22 132)">
          <rect width="112" height="58" rx="12" fill="var(--bg-surface-elevated)" stroke="var(--border-soft)" />
          <rect x="12" y="12" width="22" height="22" rx="6" fill="var(--accent-soft)" stroke="var(--border-accent)" />
          <path d="M19 23L22 26L28 20" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="42" y="14" width="54" height="6" rx="3" fill="var(--text-primary)" opacity="0.72" />
          <rect x="42" y="25" width="38" height="5" rx="2.5" fill="var(--text-muted)" opacity="0.55" />
          <rect x="12" y="42" width="88" height="5" rx="2.5" fill="var(--border-subtle)" />
          <rect x="12" y="42" width="62" height="5" rx="2.5" fill="var(--accent-secondary)" />
        </g>

        <g transform="translate(102 82)">
          <rect width="118" height="62" rx="12" fill="var(--bg-surface-elevated)" stroke="var(--border-accent-soft)" />
          <rect x="12" y="12" width="24" height="24" rx="7" fill="var(--accent-soft)" stroke="var(--border-accent)" />
          <path d="M21 19L27 24L21 29" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="44" y="14" width="58" height="6" rx="3" fill="var(--text-primary)" opacity="0.82" />
          <rect x="44" y="25" width="42" height="5" rx="2.5" fill="var(--text-muted)" opacity="0.6" />
          <rect x="12" y="44" width="94" height="5" rx="2.5" fill="var(--border-subtle)" />
          <rect x="12" y="44" width="46" height="5" rx="2.5" fill="var(--accent-tertiary, #38bdf8)" />
        </g>

        <g transform="translate(184 26)">
          <rect width="114" height="68" rx="14" fill="var(--bg-surface)" stroke="var(--border-accent)" />
          <rect x="12" y="12" width="28" height="28" rx="8" fill="var(--accent-primary)" />
          <path d="M22 21L18 26L22 31M30 21L34 26L30 31M27.5 19.5L24.5 32.5" stroke="#ffffff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="48" y="15" width="52" height="6" rx="3" fill="var(--text-primary)" opacity="0.88" />
          <rect x="48" y="26" width="36" height="5" rx="2.5" fill="var(--accent-secondary)" opacity="0.85" />
          <rect x="12" y="48" width="90" height="8" rx="4" fill="var(--bg-surface-elevated)" stroke="var(--border-subtle)" />
          <circle cx="22" cy="52" r="2.2" fill="#4ade80" />
          <rect x="29" y="50" width="52" height="4" rx="2" fill="var(--text-secondary)" opacity="0.7" />
        </g>

        <circle cx="72" cy="162" r="4.5" fill="var(--accent-secondary)" />
        <circle cx="152" cy="114" r="4.5" fill="var(--accent-tertiary, #38bdf8)" />
        <circle cx="238" cy="64" r="4.5" fill="#4ade80" />
      </svg>
    );
  }

  if (variant === "roadmaps") {
    return (
      <svg
        className="ce-hero-vector-art"
        viewBox="0 0 320 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="ce-rm-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ce-rm-branch" x1="40" y1="110" x2="280" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--accent-secondary)" />
            <stop offset="50%" stopColor="var(--accent-tertiary, #38bdf8)" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>

        <circle cx="164" cy="110" r="105" fill="url(#ce-rm-glow)" />
        <rect x="26" y="24" width="268" height="172" rx="18" fill="var(--bg-surface)" fillOpacity="0.55" stroke="var(--border-subtle)" />
        <path d="M26 82H294M26 138H294M114 24V196M206 24V196" stroke="var(--border-subtle)" strokeOpacity="0.45" />

        <path d="M66 110 H 126 C 146 110, 148 64, 174 64 H 248" stroke="url(#ce-rm-branch)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M126 110 C 146 110, 148 156, 174 156 H 248" stroke="var(--accent-secondary)" strokeOpacity="0.7" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
        <path d="M126 110 H 214" stroke="var(--accent-tertiary, #38bdf8)" strokeWidth="2.2" strokeLinecap="round" />

        <g transform="translate(42 92)">
          <rect width="54" height="36" rx="10" fill="var(--bg-surface-elevated)" stroke="var(--border-accent)" />
          <circle cx="17" cy="18" r="5" fill="var(--accent-primary)" />
          <rect x="27" y="13" width="18" height="4" rx="2" fill="var(--text-primary)" opacity="0.85" />
          <rect x="27" y="20" width="12" height="3.5" rx="1.75" fill="var(--text-muted)" opacity="0.6" />
        </g>

        <g transform="translate(174 44)">
          <rect width="84" height="38" rx="10" fill="var(--bg-surface-elevated)" stroke="var(--border-soft)" />
          <circle cx="17" cy="19" r="5" fill="#4ade80" />
          <rect x="28" y="13" width="44" height="4.5" rx="2.25" fill="var(--text-primary)" opacity="0.85" />
          <rect x="28" y="21" width="30" height="3.5" rx="1.75" fill="var(--text-muted)" opacity="0.6" />
        </g>

        <g transform="translate(194 91)">
          <rect width="86" height="38" rx="10" fill="var(--bg-surface-elevated)" stroke="var(--border-accent)" />
          <rect x="10" y="10" width="18" height="18" rx="5" fill="var(--accent-soft)" />
          <circle cx="19" cy="19" r="4" fill="var(--accent-tertiary, #38bdf8)" />
          <rect x="34" y="13" width="40" height="4.5" rx="2.25" fill="var(--text-primary)" opacity="0.9" />
          <rect x="34" y="21" width="26" height="3.5" rx="1.75" fill="var(--accent-secondary)" opacity="0.8" />
        </g>

        <g transform="translate(174 138)">
          <rect width="84" height="38" rx="10" fill="var(--bg-surface-elevated)" stroke="var(--border-subtle)" />
          <circle cx="17" cy="19" r="5" fill="var(--accent-secondary)" opacity="0.85" />
          <rect x="28" y="13" width="42" height="4.5" rx="2.25" fill="var(--text-secondary)" opacity="0.85" />
          <rect x="28" y="21" width="28" height="3.5" rx="1.75" fill="var(--text-muted)" opacity="0.55" />
        </g>

        <circle cx="126" cy="110" r="5" fill="var(--bg-surface)" stroke="var(--accent-secondary)" strokeWidth="2.2" />
        <circle cx="258" cy="63" r="4" fill="#4ade80" />
      </svg>
    );
  }

  if (variant === "projects") {
    return (
      <svg
        className="ce-hero-vector-art"
        viewBox="0 0 320 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="ce-pj-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="164" cy="112" r="102" fill="url(#ce-pj-glow)" />

        {/* Back API / architecture layer */}
        <g transform="translate(154 24)">
          <rect width="136" height="92" rx="14" fill="var(--bg-surface)" stroke="var(--border-soft)" />
          <rect x="14" y="16" width="44" height="6" rx="3" fill="var(--accent-tertiary, #38bdf8)" opacity="0.85" />
          <rect x="14" y="32" width="108" height="14" rx="5" fill="var(--bg-surface-elevated)" stroke="var(--border-subtle)" />
          <rect x="22" y="37" width="48" height="4" rx="2" fill="var(--text-secondary)" opacity="0.7" />
          <rect x="14" y="54" width="108" height="14" rx="5" fill="var(--bg-surface-elevated)" stroke="var(--border-subtle)" />
          <rect x="22" y="59" width="66" height="4" rx="2" fill="var(--text-muted)" opacity="0.6" />
        </g>

        {/* Main browser / app deliverable frame */}
        <g transform="translate(30 48)">
          <rect width="188" height="136" rx="16" fill="var(--bg-surface-elevated)" stroke="var(--border-accent)" />
          <rect x="0" y="0" width="188" height="26" rx="16" fill="var(--bg-surface)" />
          <circle cx="16" cy="13" r="3" fill="#f87171" />
          <circle cx="26" cy="13" r="3" fill="#fbbf24" />
          <circle cx="36" cy="13" r="3" fill="#4ade80" />
          <rect x="52" y="9" width="76" height="8" rx="4" fill="var(--border-subtle)" />

          {/* UI cards inside app */}
          <rect x="14" y="38" width="160" height="34" rx="9" fill="var(--accent-soft)" stroke="var(--border-accent-soft)" />
          <rect x="24" y="48" width="74" height="6" rx="3" fill="var(--text-primary)" opacity="0.86" />
          <rect x="24" y="59" width="48" height="4" rx="2" fill="var(--accent-secondary)" opacity="0.8" />
          <rect x="128" y="47" width="36" height="16" rx="6" fill="var(--accent-primary)" />

          <rect x="14" y="82" width="76" height="40" rx="9" fill="var(--bg-surface)" stroke="var(--border-subtle)" />
          <rect x="24" y="94" width="46" height="5" rx="2.5" fill="var(--text-secondary)" opacity="0.8" />
          <rect x="24" y="105" width="54" height="4" rx="2" fill="var(--text-muted)" opacity="0.55" />

          <rect x="98" y="82" width="76" height="40" rx="9" fill="var(--bg-surface)" stroke="var(--border-subtle)" />
          <rect x="108" y="94" width="42" height="5" rx="2.5" fill="var(--text-secondary)" opacity="0.8" />
          <rect x="108" y="105" width="52" height="4" rx="2" fill="var(--text-muted)" opacity="0.55" />
        </g>

        {/* Deliverable check badge */}
        <g transform="translate(196 138)">
          <rect width="98" height="46" rx="12" fill="var(--bg-surface)" stroke="rgba(34, 197, 94, 0.5)" />
          <circle cx="22" cy="23" r="10" fill="rgba(34, 197, 94, 0.16)" />
          <path d="M17.5 23L20.5 26L26.5 20" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="40" y="16" width="44" height="5" rx="2.5" fill="var(--text-primary)" opacity="0.86" />
          <rect x="40" y="26" width="32" height="4" rx="2" fill="#4ade80" opacity="0.85" />
        </g>
      </svg>
    );
  }

  if (variant === "challenges") {
    return (
      <svg
        className="ce-hero-vector-art"
        viewBox="0 0 320 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="ce-ch-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent-secondary)" stopOpacity="0.26" />
            <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="162" cy="110" r="100" fill="url(#ce-ch-glow)" />

        {/* Test suite card */}
        <g transform="translate(36 36)">
          <rect width="176" height="148" rx="16" fill="var(--bg-surface-elevated)" stroke="var(--border-soft)" />
          <rect x="16" y="18" width="84" height="7" rx="3.5" fill="var(--text-primary)" opacity="0.85" />

          {[0, 1, 2].map(idx => (
            <g key={idx} transform={`translate(16 ${40 + idx * 32})`}>
              <rect width="144" height="24" rx="8" fill="var(--bg-surface)" stroke="var(--border-subtle)" />
              <circle cx="15" cy="12" r="6" fill="rgba(34, 197, 94, 0.16)" />
              <path d="M12 12L14 14L18 10" stroke="#4ade80" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="28" y="9" width={idx === 1 ? 82 : 66} height="5" rx="2.5" fill="var(--text-secondary)" opacity="0.8" />
            </g>
          ))}
        </g>

        {/* Target / Bolt accent card */}
        <g transform="translate(186 58)">
          <rect width="104" height="104" rx="18" fill="var(--bg-surface)" stroke="var(--border-accent)" />
          <circle cx="52" cy="46" r="24" fill="var(--accent-soft)" stroke="var(--border-accent-soft)" />
          <circle cx="52" cy="46" r="14" stroke="var(--accent-secondary)" strokeWidth="2" />
          <circle cx="52" cy="46" r="5" fill="var(--accent-tertiary, #38bdf8)" />
          <rect x="24" y="82" width="56" height="6" rx="3" fill="var(--accent-secondary)" opacity="0.85" />
        </g>
      </svg>
    );
  }

  if (variant === "labs") {
    return (
      <svg
        className="ce-hero-vector-art"
        viewBox="0 0 320 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="ce-lb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent-tertiary, #38bdf8)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent-tertiary, #38bdf8)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="160" cy="110" r="102" fill="url(#ce-lb-glow)" />

        {/* Terminal sandbox */}
        <g transform="translate(26 36)">
          <rect width="160" height="106" rx="14" fill="var(--bg-surface-elevated)" stroke="var(--border-accent-soft)" />
          <rect x="14" y="14" width="24" height="6" rx="3" fill="#4ade80" opacity="0.85" />
          <path d="M16 38L23 44L16 50" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="30" y="42" width="76" height="5" rx="2.5" fill="var(--text-primary)" opacity="0.8" />
          <rect x="16" y="62" width="112" height="5" rx="2.5" fill="var(--text-muted)" opacity="0.55" />
          <rect x="16" y="76" width="88" height="5" rx="2.5" fill="var(--accent-tertiary, #38bdf8)" opacity="0.7" />
        </g>

        {/* SQL table sandbox */}
        <g transform="translate(154 78)">
          <rect width="138" height="104" rx="14" fill="var(--bg-surface)" stroke="var(--border-soft)" />
          <rect x="14" y="14" width="110" height="16" rx="5" fill="var(--accent-soft)" />
          <rect x="22" y="20" width="38" height="4" rx="2" fill="var(--accent-secondary)" />
          <rect x="14" y="38" width="110" height="1" fill="var(--border-subtle)" />
          <rect x="14" y="48" width="48" height="5" rx="2.5" fill="var(--text-secondary)" opacity="0.75" />
          <rect x="74" y="48" width="42" height="5" rx="2.5" fill="var(--text-muted)" opacity="0.6" />
          <rect x="14" y="64" width="56" height="5" rx="2.5" fill="var(--text-secondary)" opacity="0.75" />
          <rect x="74" y="64" width="36" height="5" rx="2.5" fill="#4ade80" opacity="0.8" />
          <rect x="14" y="80" width="42" height="5" rx="2.5" fill="var(--text-secondary)" opacity="0.75" />
          <rect x="74" y="80" width="46" height="5" rx="2.5" fill="var(--text-muted)" opacity="0.6" />
        </g>

        {/* Network node chip */}
        <g transform="translate(52 152)">
          <rect width="90" height="36" rx="10" fill="var(--bg-surface)" stroke="var(--border-subtle)" />
          <circle cx="20" cy="18" r="5" fill="var(--accent-tertiary, #38bdf8)" />
          <path d="M25 18H41" stroke="var(--accent-secondary)" strokeWidth="2" />
          <circle cx="46" cy="18" r="5" fill="var(--accent-secondary)" />
          <rect x="58" y="15.5" width="20" height="5" rx="2.5" fill="var(--text-primary)" opacity="0.75" />
        </g>
      </svg>
    );
  }

  if (variant === "achievements") {
    return (
      <svg
        className="ce-hero-vector-art"
        viewBox="0 0 320 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="ce-ac-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#facc15" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="160" cy="110" r="100" fill="url(#ce-ac-glow)" />

        {/* Center medal card */}
        <g transform="translate(88 34)">
          <rect width="144" height="152" rx="20" fill="var(--bg-surface-elevated)" stroke="rgba(250, 204, 21, 0.4)" />
          <circle cx="72" cy="64" r="34" fill="rgba(250, 204, 21, 0.14)" stroke="rgba(250, 204, 21, 0.5)" strokeWidth="2" />
          <path
            d="M72 44L77.5 55.2L89.8 57L80.9 65.7L83 78L72 72.2L61 78L63.1 65.7L54.2 57L66.5 55.2L72 44Z"
            fill="#facc15"
            fillOpacity="0.9"
          />
          <rect x="34" y="114" width="76" height="7" rx="3.5" fill="var(--text-primary)" opacity="0.85" />
          <rect x="26" y="130" width="92" height="6" rx="3" fill="var(--border-subtle)" />
          <rect x="26" y="130" width="64" height="6" rx="3" fill="#facc15" />
        </g>

        {/* Side badge cards */}
        <g transform="translate(24 72)">
          <rect width="54" height="54" rx="14" fill="var(--bg-surface)" stroke="var(--border-accent-soft)" />
          <circle cx="27" cy="27" r="11" fill="var(--accent-soft)" />
          <path d="M23 27L26 30L32 24" stroke="var(--accent-secondary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <g transform="translate(242 86)">
          <rect width="54" height="54" rx="14" fill="var(--bg-surface)" stroke="rgba(34, 197, 94, 0.42)" />
          <circle cx="27" cy="27" r="11" fill="rgba(34, 197, 94, 0.15)" />
          <circle cx="27" cy="27" r="4.5" fill="#4ade80" />
        </g>
      </svg>
    );
  }

  if (variant === "history") {
    return (
    <svg
      className="ce-hero-vector-art"
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ce-hs-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="160" cy="110" r="102" fill="url(#ce-hs-glow)" />

      <g transform="translate(36 34)">
        <rect width="248" height="152" rx="18" fill="var(--bg-surface-elevated)" stroke="var(--border-soft)" />
        {/* 7-day bars */}
        {[34, 58, 42, 76, 62, 88, 70].map((barH, idx) => (
          <rect
            key={idx}
            x={26 + idx * 30}
            y={114 - barH}
            width="16"
            height={barH}
            rx="6"
            fill={idx >= 4 ? "var(--accent-primary)" : "var(--accent-soft)"}
            stroke={idx >= 4 ? "var(--accent-secondary)" : "var(--border-subtle)"}
          />
        ))}
        {/* Trend line */}
        <path
          d="M34 78L64 56L94 70L124 38L154 52L184 26L214 44"
          stroke="var(--accent-tertiary, #38bdf8)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="184" cy="26" r="4.5" fill="#4ade80" />
        <rect x="26" y="128" width="196" height="6" rx="3" fill="var(--border-subtle)" />
      </g>
    </svg>
    );
  }

  return (
    <svg
      className="ce-hero-vector-art"
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ce-sp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ce-sp-line" x1="40" y1="170" x2="280" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent-secondary)" />
          <stop offset="55%" stopColor="var(--accent-tertiary, #38bdf8)" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>

      <ellipse cx="160" cy="112" rx="124" ry="82" fill="url(#ce-sp-glow)" />
      <rect x="24" y="22" width="272" height="176" rx="18" fill="var(--bg-surface)" fillOpacity="0.55" stroke="var(--border-subtle)" />
      <path d="M24 78H296M24 142H296M116 22V198M204 22V198" stroke="var(--border-subtle)" strokeOpacity="0.4" />

      {/* Caminho entre as 3 fases */}
      <path
        d="M84 156 C 120 156, 122 112, 160 112 C 198 112, 200 66, 236 66"
        stroke="url(#ce-sp-line)"
        strokeWidth="2.4"
        strokeDasharray="5 5"
        strokeLinecap="round"
      />

      {/* Fase 1 */}
      <g transform="translate(36 128)">
        <rect width="98" height="52" rx="12" fill="var(--bg-surface-elevated)" stroke="var(--border-accent)" />
        <circle cx="18" cy="18" r="7" fill="var(--accent-soft)" stroke="var(--border-accent)" />
        <rect x="31" y="13" width="52" height="5" rx="2.5" fill="var(--text-primary)" opacity="0.85" />
        <rect x="31" y="22" width="36" height="4" rx="2" fill="var(--text-muted)" opacity="0.6" />
        <rect x="12" y="36" width="74" height="5" rx="2.5" fill="var(--accent-secondary)" opacity="0.7" />
      </g>

      {/* Fase 2 */}
      <g transform="translate(110 84)">
        <rect width="102" height="54" rx="12" fill="var(--bg-surface-elevated)" stroke="var(--border-accent-soft)" />
        <rect x="12" y="12" width="16" height="16" rx="5" fill="var(--accent-tertiary, #38bdf8)" fillOpacity="0.22" stroke="var(--accent-tertiary, #38bdf8)" />
        <rect x="34" y="14" width="54" height="5" rx="2.5" fill="var(--text-primary)" opacity="0.85" />
        <rect x="34" y="23" width="40" height="4" rx="2" fill="var(--text-muted)" opacity="0.6" />
        <rect x="12" y="38" width="78" height="5" rx="2.5" fill="var(--accent-tertiary, #38bdf8)" opacity="0.7" />
      </g>

      {/* Fase 3 + selo em construção */}
      <g transform="translate(182 36)">
        <rect width="104" height="58" rx="13" fill="var(--bg-surface)" stroke="#fbbf24" strokeOpacity="0.65" />
        <rect x="12" y="12" width="20" height="20" rx="6" fill="#fbbf24" fillOpacity="0.18" stroke="#fbbf24" strokeOpacity="0.7" />
        <path d="M22 17L26 26H18L22 17Z" stroke="#fbbf24" strokeWidth="1.6" strokeLinejoin="round" />
        <rect x="38" y="15" width="52" height="5" rx="2.5" fill="var(--text-primary)" opacity="0.88" />
        <rect x="38" y="24" width="38" height="4" rx="2" fill="#fbbf24" opacity="0.8" />
        <rect x="12" y="40" width="80" height="6" rx="3" fill="var(--bg-surface-elevated)" stroke="var(--border-subtle)" />
        <circle cx="20" cy="43" r="2" fill="#fbbf24" />
        <rect x="26" y="41" width="48" height="4" rx="2" fill="var(--text-secondary)" opacity="0.7" />
      </g>

      <circle cx="84" cy="156" r="4.5" fill="var(--accent-secondary)" />
      <circle cx="160" cy="112" r="4.5" fill="var(--accent-tertiary, #38bdf8)" />
      <circle cx="236" cy="66" r="4.5" fill="#fbbf24" />
    </svg>
  );
};
