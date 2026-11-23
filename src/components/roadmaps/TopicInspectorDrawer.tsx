import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  FlaskConical,
  FolderGit2,
  GitBranch,
  Layers,
  Lightbulb,
  Swords,
  X,
} from "lucide-react";
import { CHALLENGE_MAP } from "../../data/challenges";
import { GLOSSARY_MAP } from "../../data/glossary";
import { LESSONS_BY_TRACK, LESSON_MAP } from "../../data/lessons";
import { ROADMAP_MAP } from "../../data/roadmaps";
import { TRACK_MAP } from "../../data/tracks";
import type { BootstrapPayload, RoadmapTopicStatus } from "../../types/progress";
import type {
  RoadmapDefinition,
  RoadmapNode,
  RoadmapPriority,
  RoadmapStudyLink,
} from "../../types/roadmap";
import { AnnotatedText, GlossaryTerm } from "../shared/GlossaryTerm";
import { ProjectLightbox, ProjectPreview } from "../shared/ProjectPreview";
import { TechIcon } from "../shared/TechIcon";

interface TopicInspectorDrawerProps {
  roadmap: RoadmapDefinition;
  node: RoadmapNode | null;
  data: BootstrapPayload;
  onSelectNode: (nodeId: string) => void;
  onSetStatus: (roadmapId: string, topicId: string, status: RoadmapTopicStatus) => void;
  onClose?: () => void;
}

const PRIORITY_META: Record<RoadmapPriority, { label: string; dotClass: string }> = {
  required: { label: "Obrigatório", dotClass: "is-required" },
  recommended: { label: "Recomendado", dotClass: "is-recommended" },
  optional: { label: "Opcional", dotClass: "is-optional" },
};

const KIND_LABEL: Record<RoadmapNode["kind"], string> = {
  foundation: "Fundamento",
  concept: "Conceito-chave",
  technology: "Tecnologia / Ferramenta",
  "alternative-group": "Escolha & Caminhos",
  checkpoint: "Checkpoint",
  project: "Projeto Integrador",
};

function resolveStudyDestination(link: RoadmapStudyLink): {
  to: string;
  doneMeta?: string;
} {
  if (link.kind === "lesson") {
    const lesson = LESSON_MAP[link.id];
    if (lesson) {
      return { to: `/trilhas/${lesson.trackId}/aula/${lesson.id}` };
    }
    if (link.trackId) {
      return { to: `/trilhas/${link.trackId}/aula/${link.id}` };
    }
    return { to: "/trilhas" };
  }

  if (link.kind === "challenge") {
    const ch = CHALLENGE_MAP[link.id];
    return { to: ch ? `/desafios/${ch.id}` : "/desafios" };
  }

  if (link.kind === "track") {
    const trackId = link.trackId || link.id;
    return { to: `/trilhas/${trackId}` };
  }

  return { to: "/laboratorios" };
}

export const TopicInspectorDrawer: React.FC<TopicInspectorDrawerProps> = ({
  roadmap,
  node,
  data,
  onClose,
}) => {
  const [expandedPreview, setExpandedPreview] = useState(false);

  if (!node) {
    return (
      <aside className="ce-rm-inspector ce-rm-inspector-empty" aria-label="Inspetor de tópico">
        <div className="ce-rm-inspector-placeholder">
          <Compass size={26} style={{ color: roadmap.accentColor }} />
          <h3>Selecione um tópico no mapa</h3>
          <p>
            Clique em qualquer nó ao lado para explorar por que o tema importa, alternativas técnicas e aulas práticas ligadas no Code Entry.
          </p>
        </div>
      </aside>
    );
  }

  const priority = node.priority || "recommended";
  const prioMeta = PRIORITY_META[priority];

  const relatedRoadmaps = (node.relatedRoadmapIds || [])
    .map(id => ROADMAP_MAP[id])
    .filter(Boolean);

  return (
    <aside
      className="ce-rm-inspector"
      aria-label={`Detalhes de ${node.title}`}
      style={
        {
          "--rm-accent": roadmap.accentColor,
          "--rm-accent-soft": roadmap.accentSoft,
          "--rm-accent-border": roadmap.accentBorder,
        } as React.CSSProperties
      }
    >
      <div className="ce-rm-inspector-head">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="ce-rm-inspector-badges">
            <span className="ce-rm-legend-pill">
              <span className={`ce-rm-dot ${prioMeta.dotClass}`} aria-hidden="true" />
              <span>{prioMeta.label}</span>
            </span>
            <span className="ce-badge">{KIND_LABEL[node.kind]}</span>
          </div>
          <h2 className="ce-rm-inspector-title">{node.title}</h2>
        </div>

        {onClose && (
          <button
            type="button"
            className="ce-rm-inspector-close"
            onClick={onClose}
            aria-label="Fechar inspetor do tópico"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Explicação didática contextualizada */}
      <div className="ce-rm-inspector-section">
        <h4>Resumo do tópico</h4>
        <p className="ce-rm-inspector-prose">
          <AnnotatedText text={node.summary} />
        </p>

        <div className="ce-rm-why-box">
          <div className="ce-rm-why-title">
            <Lightbulb size={14} style={{ color: "var(--accent-warning)" }} />
            <span>Por que isso importa</span>
          </div>
          <p className="ce-rm-inspector-prose" style={{ marginBottom: 0 }}>
            <AnnotatedText text={node.whyItMatters} />
          </p>
        </div>
      </div>

      {/* Alternativas e comparação quando o nó envolve escolha tecnológica */}
      {node.alternatives && node.alternatives.length > 0 && (
        <div className="ce-rm-inspector-section">
          <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <GitBranch size={14} style={{ color: roadmap.accentSecondary }} />
            <span>Alternativas e quando escolher</span>
          </h4>
          <div className="ce-rm-alts-list">
            {node.alternatives.map(alt => {
              const gEntry = alt.glossaryId ? GLOSSARY_MAP[alt.glossaryId] : undefined;
              const altPrio = alt.priority || "recommended";
              return (
                <div key={alt.id} className="ce-rm-alt-card">
                  <div className="ce-rm-alt-head">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong>{alt.name}</strong>
                      {gEntry && (
                        <GlossaryTerm entry={gEntry} variant="pill">
                          {gEntry.term}
                        </GlossaryTerm>
                      )}
                    </div>
                    <span className="ce-rm-legend-pill">
                      <span className={`ce-rm-dot ${PRIORITY_META[altPrio].dotClass}`} />
                      <span>{PRIORITY_META[altPrio].label}</span>
                    </span>
                  </div>
                  <p className="ce-rm-alt-summary">
                    <AnnotatedText text={alt.summary} />
                  </p>
                  <div className="ce-rm-alt-when">
                    <strong>Quando escolher:</strong> <AnnotatedText text={alt.whenToChoose} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ligações reais com Trilhas, Aulas, Desafios e Laboratórios */}
      <div className="ce-rm-inspector-section">
        <h4>Estude e pratique no Code Entry</h4>
        {node.studyLinks.length === 0 ? (
          <p className="ce-rm-muted-note">
            Este tópico conceitual amplia sua visão arquitetural. Use os termos interativos acima para revisar definições ou avance para os próximos nós práticos do mapa.
          </p>
        ) : (
          <div className="ce-rm-study-links">
            {node.studyLinks.map((link, idx) => {
              const dest = resolveStudyDestination(link);
              const isDone =
                (link.kind === "lesson" && Boolean(data.lessonProgress[link.id]?.completed)) ||
                (link.kind === "challenge" && Boolean(data.challengeProgress[link.id]?.completed));
              const trackId =
                link.kind === "track"
                  ? ((link.trackId || link.id) as keyof typeof TRACK_MAP)
                  : link.trackId;
              const trackMeta = trackId ? TRACK_MAP[trackId] : undefined;

              let trackProgressLabel: string | null = null;
              if (link.kind === "track" && trackId && LESSONS_BY_TRACK[trackId]) {
                const trackLessons = LESSONS_BY_TRACK[trackId];
                const doneCount = trackLessons.filter(l => data.lessonProgress[l.id]?.completed).length;
                trackProgressLabel = `${doneCount}/${trackLessons.length} aulas`;
              }

              return (
                <Link key={`${link.kind}-${link.id}-${idx}`} to={dest.to} className="ce-rm-study-card">
                  <div className="ce-rm-study-icon">
                    {link.kind === "track" && trackMeta ? (
                      <TechIcon trackId={trackMeta.id} size={20} />
                    ) : link.kind === "challenge" ? (
                      <Swords size={17} style={{ color: "var(--accent-warning)" }} />
                    ) : link.kind === "lab" ? (
                      <FlaskConical size={17} style={{ color: "var(--accent-tertiary)" }} />
                    ) : (
                      <BookOpen size={17} style={{ color: trackMeta?.accentColor || roadmap.accentColor }} />
                    )}
                  </div>
                  <div className="ce-rm-study-meta">
                    <div className="ce-rm-study-top">
                      <strong>{link.label}</strong>
                      {isDone && (
                        <span className="ce-rm-done-chip">
                          <CheckCircle2 size={11} />
                          <span>Concluído</span>
                        </span>
                      )}
                      {trackProgressLabel && (
                        <span className="ce-badge">{trackProgressLabel}</span>
                      )}
                    </div>
                    {link.description && <span>{link.description}</span>}
                  </div>
                  <ArrowRight size={15} className="ce-rm-study-arrow" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Projetos sugeridos + prévia sutil de referência */}
      {(node.kind === "checkpoint" ||
        node.kind === "project" ||
        (node.projectIdeas && node.projectIdeas.length > 0)) && (
        <div className="ce-rm-inspector-section">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FolderGit2 size={14} style={{ color: "var(--accent-warning)" }} />
              <span>Projetos e marcos práticos</span>
            </h4>
            <Link
              to={`/projetos?destaque=${node.id}`}
              className="ce-link-more"
              style={{ fontSize: 11.5 }}
            >
              <span>Ver em Projetos</span>
              <ArrowRight size={11} />
            </Link>
          </div>

          {node.projectIdeas && node.projectIdeas.length > 0 && (
            <ul className="ce-rm-project-list">
              {node.projectIdeas.map(idea => (
                <li key={idea}>{idea}</li>
              ))}
            </ul>
          )}

          {(node.kind === "checkpoint" || node.kind === "project") && (
            <div className="ce-rm-subtle-preview">
              <ProjectPreview
                nodeId={node.id}
                accentColor={roadmap.accentColor}
                onExpand={() => setExpandedPreview(true)}
              />
            </div>
          )}
        </div>
      )}

      <ProjectLightbox
        item={expandedPreview ? { node, roadmap } : null}
        onClose={() => setExpandedPreview(false)}
      />

      {/* Outros roadmaps conectados */}
      {relatedRoadmaps.length > 0 && (
        <div className="ce-rm-inspector-section">
          <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Layers size={14} />
            <span>Continue em outros Roadmaps</span>
          </h4>
          <div className="ce-rm-rel-chips">
            {relatedRoadmaps.map(rm => (
              <Link key={rm.id} to={`/roadmaps/${rm.id}`} className="ce-rm-rel-btn">
                <span
                  className="ce-rm-dot"
                  style={{ background: rm.accentColor }}
                  aria-hidden="true"
                />
                <span>{rm.shortTitle}</span>
                <ArrowRight size={12} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
