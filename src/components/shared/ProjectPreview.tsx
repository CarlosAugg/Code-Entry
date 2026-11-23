import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, ExternalLink, Maximize2, Sparkles, Target, X } from "lucide-react";
import { getProjectReference, ProjectRealisticScene } from "./ProjectPreviewScenes";
import type { RoadmapDefinition, RoadmapNode } from "../../types/roadmap";

export function getProjectEstimatedTime(nodeId: string, kind: string): string {
  const map: Record<string, string> = {
    "fs-cp-static": "~45 min",
    "fe-checkpoint-ui": "~1h",
    "fs-cp-interactive": "~1h 15min",
    "fe-project-spa": "~2h 30min",
    "fs-cp-crud": "~2h 30min",
    "fs-project-complete": "~4h",
    "be-checkpoint-api": "~1h 30min",
    "be-project-service": "~3h",
    "sn-ops-project": "~1h 15min",
    "ds-checkpoint-report": "~50 min",
    "cs-checkpoint-algo": "~1h",
  };
  if (map[nodeId]) return map[nodeId];
  return kind === "project" ? "~2h 30min" : "~1h";
}

const SCENE_W = 960;
const SCENE_H = 540;

const ScaledStage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const sync = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / SCENE_W);
    };
    sync();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="ce-proj-shot-stage">
      <div
        className="ce-proj-shot-canvas"
        style={{
          width: SCENE_W,
          height: SCENE_H,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

interface ProjectPreviewProps {
  nodeId: string;
  accentColor: string;
  onExpand?: () => void;
}

export const ProjectPreview: React.FC<ProjectPreviewProps> = ({
  nodeId,
  accentColor,
  onExpand,
}) => {
  const refMeta = getProjectReference(nodeId);

  return (
    <div
      className="ce-proj-preview-box"
      style={{ "--proj-accent": accentColor } as React.CSSProperties}
    >
      <div className="ce-proj-preview-label">
        <span className="ce-proj-preview-title">
          <span className="ce-proj-preview-dot" aria-hidden="true" />
          <span>Prévia do resultado final</span>
        </span>
        <a
          href={refMeta.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ce-proj-ref-chip"
          onClick={e => e.stopPropagation()}
          title={`Abrir exemplo real: ${refMeta.siteName}`}
        >
          <span>Ref.: {refMeta.siteName}</span>
          <ExternalLink size={11} />
        </a>
      </div>

      <div
        className="ce-proj-shot-frame"
        role="button"
        tabIndex={0}
        onClick={onExpand}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onExpand?.();
          }
        }}
        aria-label={`Ampliar prévia visual do projeto (inspiração: ${refMeta.siteName})`}
      >
        <ScaledStage>
          <ProjectRealisticScene nodeId={nodeId} />
        </ScaledStage>

        {/* Overlay interativo no hover (hoover) */}
        <div className="ce-proj-shot-hover">
          <span className="ce-proj-hover-tag">
            <Sparkles size={12} />
            <span>{refMeta.domainTag}</span>
          </span>
          <p className="ce-proj-hover-desc">
            Inspiração real de referência: <strong>{refMeta.siteName}</strong>
          </p>
          <div className="ce-proj-hover-actions">
            <span className="ce-proj-hover-btn is-primary">
              <Maximize2 size={13} />
              <span>Ampliar imagem</span>
            </span>
            <a
              href={refMeta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ce-proj-hover-btn is-secondary"
              onClick={e => e.stopPropagation()}
            >
              <span>Abrir {refMeta.siteName}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProjectLightboxProps {
  item: { node: RoadmapNode; roadmap: RoadmapDefinition } | null;
  onClose: () => void;
}

export const ProjectLightbox: React.FC<ProjectLightboxProps> = ({ item, onClose }) => {
  useEffect(() => {
    if (!item) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [item, onClose]);

  if (!item || typeof document === "undefined") return null;

  const { node, roadmap } = item;
  const refMeta = getProjectReference(node.id);
  const estTime = getProjectEstimatedTime(node.id, node.kind);

  return createPortal(
    <div
      className="ce-proj-lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ce-proj-lightbox-title"
      onClick={onClose}
    >
      <div
        className="ce-proj-lightbox-modal"
        style={{ "--proj-accent": roadmap.accentColor } as React.CSSProperties}
        onClick={e => e.stopPropagation()}
      >
        <div className="ce-proj-lightbox-head">
          <div className="ce-proj-lightbox-titlewrap">
            <div className="ce-badges-row">
              <span className="ce-badge ce-badge-accent">{refMeta.domainTag}</span>
              <span className="ce-badge ce-badge-muted">{roadmap.shortTitle}</span>
              <span className="ce-badge ce-badge-muted">
                <Clock size={11} />
                <span>{estTime}</span>
              </span>
            </div>
            <h2 id="ce-proj-lightbox-title">{node.title}</h2>
          </div>

          <button
            type="button"
            className="ce-btn ce-btn-ghost ce-btn-icon"
            onClick={onClose}
            aria-label="Fechar prévia ampliada"
          >
            <X size={18} />
          </button>
        </div>

        <div className="ce-proj-lightbox-stage">
          <ScaledStage>
            <ProjectRealisticScene nodeId={node.id} />
          </ScaledStage>
        </div>

        <div className="ce-proj-lightbox-foot">
          <div className="ce-proj-lightbox-info">
            <div className="ce-proj-lightbox-refline">
              <Sparkles size={14} style={{ color: "var(--accent-secondary)" }} />
              <span>
                Referência real de mercado: <strong>{refMeta.siteName}</strong> — {refMeta.whyReference}
              </span>
            </div>
            {node.projectIdeas && node.projectIdeas.length > 0 && (
              <div className="ce-proj-lightbox-deliverables">
                <Target size={13} style={{ color: "var(--accent-warning)", flexShrink: 0, marginTop: 2 }} />
                <span>{node.projectIdeas.join(" • ")}</span>
              </div>
            )}
          </div>

          <a
            href={refMeta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ce-btn ce-btn-primary"
            style={{ flexShrink: 0 }}
          >
            <span>Visitar {refMeta.siteName}</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
};
