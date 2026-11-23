import React from "react";

export type AbstractWireframeKind =
  | "web-static"
  | "web-interactive"
  | "fullstack-app"
  | "backend-api"
  | "sql-report"
  | "linux-dmz"
  | "algo-runner";

export function resolveAbstractWireframeKind(nodeId: string, roadmapId: string): AbstractWireframeKind {
  if (nodeId === "fs-cp-static" || nodeId === "fs-checkpoint-static") return "web-static";
  if (nodeId === "fs-cp-interactive" || nodeId === "fs-checkpoint-interactive" || nodeId === "fe-checkpoint-ui") {
    return "web-interactive";
  }
  if (
    nodeId === "fe-project-spa" ||
    nodeId === "fe-project-app" ||
    nodeId === "fs-cp-crud" ||
    nodeId === "fs-project-complete" ||
    nodeId === "fs-project-app" ||
    nodeId === "fs-project-capstone"
  ) {
    return "fullstack-app";
  }
  if (roadmapId === "backend") return "backend-api";
  if (roadmapId === "data-sql") return "sql-report";
  if (roadmapId === "systems-networks") return "linux-dmz";
  return "algo-runner";
}

interface AbstractProjectWireframeProps {
  nodeId: string;
  roadmapId: string;
  accentColor: string;
}

/**
 * Ilustrações abstratas em wireframe preservadas para reaproveitamento futuro em
 * outros contextos da plataforma (ex.: esquemas conceituais ou estados vazios).
 */
export const AbstractProjectWireframe: React.FC<AbstractProjectWireframeProps> = ({
  nodeId,
  roadmapId,
  accentColor,
}) => {
  const kind = resolveAbstractWireframeKind(nodeId, roadmapId);

  return (
    <div
      className="ce-proj-preview-box"
      style={{ "--proj-accent": accentColor } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="ce-proj-preview-label">
        <span>Esquema conceitual</span>
        <span className="ce-proj-preview-dot" />
      </div>

      {kind === "web-static" && (
        <svg viewBox="0 0 280 96" className="ce-proj-preview-svg" fill="none">
          <rect x="4" y="4" width="272" height="88" rx="10" fill="var(--bg-surface)" stroke="var(--border-subtle)" />
          <rect x="4" y="4" width="272" height="16" rx="10" fill="var(--bg-surface-elevated)" />
          <circle cx="15" cy="12" r="2.5" fill="#f87171" />
          <circle cx="23" cy="12" r="2.5" fill="#fbbf24" />
          <circle cx="31" cy="12" r="2.5" fill="#4ade80" />
          <rect x="14" y="28" width="106" height="8" rx="4" fill="var(--text-primary)" opacity="0.82" />
          <rect x="14" y="40" width="84" height="4" rx="2" fill="var(--text-muted)" opacity="0.55" />
          {[0, 1, 2].map(i => (
            <g key={i} transform={`translate(${14 + i * 86} 52)`}>
              <rect
                width="78"
                height="32"
                rx="6"
                fill="var(--bg-surface-elevated)"
                stroke={i === 1 ? "var(--proj-accent)" : "var(--border-subtle)"}
              />
              <rect x="8" y="8" width="32" height="4" rx="2" fill={i === 1 ? "var(--proj-accent)" : "var(--text-secondary)"} opacity="0.85" />
              <rect x="8" y="17" width="54" height="3.5" rx="1.75" fill="var(--text-muted)" opacity="0.55" />
              <rect x="8" y="23" width="38" height="3.5" rx="1.75" fill="var(--text-muted)" opacity="0.4" />
            </g>
          ))}
        </svg>
      )}

      {kind === "web-interactive" && (
        <svg viewBox="0 0 280 96" className="ce-proj-preview-svg" fill="none">
          <rect x="4" y="4" width="272" height="88" rx="10" fill="var(--bg-surface)" stroke="var(--border-subtle)" />
          <rect x="14" y="14" width="160" height="14" rx="6" fill="var(--bg-surface-elevated)" stroke="var(--border-subtle)" />
          <rect x="182" y="14" width="48" height="14" rx="6" fill="var(--proj-accent)" opacity="0.9" />
          <rect x="238" y="14" width="28" height="14" rx="7" fill="var(--bg-surface-elevated)" stroke="var(--border-accent-soft)" />
          <circle cx="258" cy="21" r="4" fill="var(--proj-accent)" />
          {[0, 1].map(i => (
            <g key={i} transform={`translate(14 ${36 + i * 24})`}>
              <rect width="252" height="19" rx="6" fill="var(--bg-surface-elevated)" stroke="var(--border-subtle)" />
              <circle cx="12" cy="9.5" r="4" fill={i === 0 ? "#4ade80" : "var(--border-soft)"} />
              <rect x="24" y="7.5" width={i === 0 ? 110 : 140} height="4.5" rx="2.25" fill="var(--text-primary)" opacity="0.8" />
              <rect x="210" y="6" width="32" height="7" rx="3.5" fill="var(--proj-accent)" opacity="0.25" />
            </g>
          ))}
        </svg>
      )}

      {kind === "fullstack-app" && (
        <svg viewBox="0 0 280 96" className="ce-proj-preview-svg" fill="none">
          <rect x="4" y="4" width="272" height="88" rx="10" fill="var(--bg-surface)" stroke="var(--border-subtle)" />
          <rect x="12" y="12" width="44" height="72" rx="7" fill="var(--bg-surface-elevated)" stroke="var(--border-subtle)" />
          <rect x="18" y="20" width="32" height="5" rx="2.5" fill="var(--proj-accent)" />
          <rect x="18" y="32" width="26" height="4" rx="2" fill="var(--text-muted)" opacity="0.5" />
          <rect x="18" y="42" width="28" height="4" rx="2" fill="var(--text-muted)" opacity="0.5" />
          <rect x="64" y="12" width="128" height="32" rx="7" fill="var(--bg-surface-elevated)" stroke="var(--border-accent-soft)" />
          <rect x="74" y="20" width="64" height="5" rx="2.5" fill="var(--text-primary)" opacity="0.85" />
          <rect x="74" y="30" width="96" height="4" rx="2" fill="var(--proj-accent)" opacity="0.7" />
          <rect x="64" y="50" width="60" height="34" rx="7" fill="var(--bg-surface-elevated)" stroke="var(--border-subtle)" />
          <rect x="132" y="50" width="60" height="34" rx="7" fill="var(--bg-surface-elevated)" stroke="var(--border-subtle)" />
          <rect x="200" y="12" width="68" height="72" rx="8" fill="var(--bg-surface-elevated)" stroke="var(--border-soft)" />
          <ellipse cx="234" cy="30" rx="18" ry="6" fill="var(--proj-accent)" fillOpacity="0.25" stroke="var(--proj-accent)" />
          <path d="M216 30V58C216 61.5 224 64 234 64C244 64 252 61.5 252 58V30" stroke="var(--proj-accent)" />
          <rect x="214" y="72" width="40" height="4" rx="2" fill="#4ade80" opacity="0.85" />
        </svg>
      )}

      {kind === "backend-api" && (
        <svg viewBox="0 0 280 96" className="ce-proj-preview-svg" fill="none">
          <rect x="4" y="4" width="272" height="88" rx="10" fill="var(--bg-surface)" stroke="var(--border-subtle)" />
          {[
            { method: "#4ade80", w: 96 },
            { method: "var(--proj-accent)", w: 118 },
            { method: "#38bdf8", w: 84 },
          ].map((row, idx) => (
            <g key={idx} transform={`translate(14 ${14 + idx * 24})`}>
              <rect width="166" height="19" rx="6" fill="var(--bg-surface-elevated)" stroke="var(--border-subtle)" />
              <rect x="6" y="5" width="26" height="9" rx="3" fill={row.method} fillOpacity="0.24" />
              <rect x="38" y="7.5" width={row.w} height="4" rx="2" fill="var(--text-primary)" opacity="0.78" />
            </g>
          ))}
          <rect x="190" y="14" width="76" height="68" rx="8" fill="var(--bg-surface-elevated)" stroke="var(--border-soft)" />
          <rect x="198" y="24" width="44" height="4.5" rx="2" fill="var(--proj-accent)" />
          <rect x="198" y="34" width="58" height="4" rx="2" fill="var(--text-secondary)" opacity="0.7" />
          <rect x="198" y="43" width="48" height="4" rx="2" fill="var(--text-muted)" opacity="0.55" />
          <rect x="198" y="52" width="54" height="4" rx="2" fill="#4ade80" opacity="0.7" />
        </svg>
      )}

      {kind === "sql-report" && (
        <svg viewBox="0 0 280 96" className="ce-proj-preview-svg" fill="none">
          <rect x="4" y="4" width="272" height="88" rx="10" fill="var(--bg-surface)" stroke="var(--border-subtle)" />
          <rect x="14" y="12" width="154" height="72" rx="7" fill="var(--bg-surface-elevated)" stroke="var(--border-subtle)" />
          <rect x="22" y="20" width="138" height="10" rx="3" fill="var(--proj-accent)" fillOpacity="0.22" />
          <rect x="22" y="36" width="124" height="5" rx="2" fill="var(--text-secondary)" opacity="0.75" />
          <rect x="22" y="48" width="110" height="5" rx="2" fill="var(--text-muted)" opacity="0.6" />
          <rect x="22" y="60" width="132" height="5" rx="2" fill="var(--text-secondary)" opacity="0.75" />
          <rect x="22" y="72" width="96" height="5" rx="2" fill="var(--text-muted)" opacity="0.5" />
          <rect x="176" y="12" width="90" height="72" rx="7" fill="var(--bg-surface-elevated)" stroke="var(--border-soft)" />
          {[28, 44, 34, 52].map((bh, idx) => (
            <rect
              key={idx}
              x={190 + idx * 17}
              y={74 - bh}
              width="10"
              height={bh}
              rx="3"
              fill="var(--proj-accent)"
              opacity={0.45 + idx * 0.16}
            />
          ))}
        </svg>
      )}

      {kind === "linux-dmz" && (
        <svg viewBox="0 0 280 96" className="ce-proj-preview-svg" fill="none">
          <rect x="4" y="4" width="272" height="88" rx="10" fill="var(--bg-surface)" stroke="var(--border-subtle)" />
          <rect x="14" y="14" width="124" height="68" rx="7" fill="var(--bg-surface-elevated)" stroke="var(--border-subtle)" />
          <path d="M24 30L30 35L24 40" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="36" y="33" width="62" height="4" rx="2" fill="var(--text-primary)" opacity="0.82" />
          <rect x="24" y="48" width="92" height="4" rx="2" fill="var(--text-muted)" opacity="0.6" />
          <rect x="24" y="60" width="76" height="4" rx="2" fill="#4ade80" opacity="0.75" />
          <rect x="148" y="14" width="118" height="68" rx="7" fill="var(--bg-surface-elevated)" stroke="var(--border-soft)" />
          <circle cx="172" cy="48" r="9" fill="var(--proj-accent)" fillOpacity="0.22" stroke="var(--proj-accent)" />
          <path d="M181 48H206M218 48H236" stroke="#4ade80" strokeWidth="1.8" />
          <rect x="206" y="34" width="12" height="28" rx="4" fill="rgba(34, 197, 94, 0.2)" stroke="#4ade80" />
          <circle cx="244" cy="48" r="9" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" />
        </svg>
      )}

      {kind === "algo-runner" && (
        <svg viewBox="0 0 280 96" className="ce-proj-preview-svg" fill="none">
          <rect x="4" y="4" width="272" height="88" rx="10" fill="var(--bg-surface)" stroke="var(--border-subtle)" />
          <rect x="14" y="14" width="126" height="68" rx="7" fill="var(--bg-surface-elevated)" stroke="var(--border-subtle)" />
          <rect x="24" y="24" width="64" height="4.5" rx="2" fill="var(--proj-accent)" />
          <rect x="32" y="36" width="84" height="4" rx="2" fill="var(--text-secondary)" opacity="0.8" />
          <rect x="32" y="47" width="68" height="4" rx="2" fill="var(--text-muted)" opacity="0.6" />
          <rect x="24" y="58" width="90" height="4" rx="2" fill="var(--text-secondary)" opacity="0.75" />
          {[0, 1, 2].map(idx => (
            <g key={idx} transform={`translate(148 ${14 + idx * 24})`}>
              <rect width="118" height="19" rx="6" fill="var(--bg-surface-elevated)" stroke="var(--border-subtle)" />
              <circle cx="12" cy="9.5" r="4" fill="#4ade80" />
              <rect x="22" y="7.5" width="72" height="4" rx="2" fill="var(--text-primary)" opacity="0.75" />
            </g>
          ))}
        </svg>
      )}
    </div>
  );
};
