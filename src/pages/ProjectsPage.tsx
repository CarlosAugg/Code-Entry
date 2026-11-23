import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  Clock,
  Flag,
  FolderGit2,
  FolderKanban,
  Map as MapIcon,
  Play,
  Swords,
  Target,
} from "lucide-react";
import { HeroIllustration } from "../components/shared/HeroIllustration";
import { ProjectLightbox, ProjectPreview, getProjectEstimatedTime } from "../components/shared/ProjectPreview";
import { AmbientAurora } from "../components/motion/AmbientAurora";
import { ShinyText } from "../components/motion/ShinyText";
import { SpotlightCard } from "../components/motion/SpotlightCard";
import { AnnotatedText } from "../components/shared/GlossaryTerm";
import { TechIcon } from "../components/shared/TechIcon";
import { usePlatform } from "../context/PlatformContext";
import { CHALLENGE_MAP } from "../data/challenges";
import { LESSON_MAP } from "../data/lessons";
import { ROADMAPS, computeRoadmapNodeState, getAllRoadmapProjects } from "../data/roadmaps";
import { TRACK_MAP } from "../data/tracks";
import type { TrackId } from "../types/curriculum";
import type { RoadmapTopicStatus } from "../types/progress";
import type { RoadmapDefinition, RoadmapNode, RoadmapStudyLink } from "../types/roadmap";

function resolvePrimaryStudyLink(link?: RoadmapStudyLink): { to: string; label: string } | null {
  if (!link) return null;
  if (link.kind === "lesson") {
    const lesson = LESSON_MAP[link.id];
    const trackId = lesson?.trackId || link.trackId;
    if (trackId) {
      return { to: `/trilhas/${trackId}/aula/${link.id}`, label: `Abrir ${link.label}` };
    }
  }
  if (link.kind === "challenge") {
    const ch = CHALLENGE_MAP[link.id];
    return { to: ch ? `/desafios/${ch.id}` : "/desafios", label: `Praticar ${link.label}` };
  }
  if (link.kind === "track") {
    const tId = (link.trackId || link.id) as TrackId;
    const track = TRACK_MAP[tId];
    return {
      to: `/trilhas/${tId}`,
      label: track ? `Estudar trilha ${track.shortName}` : `Abrir ${link.label}`,
    };
  }
  return { to: "/laboratorios", label: "Experimentar no Laboratório" };
}

export const ProjectsPage: React.FC = () => {
  const { data, setRoadmapTopicStatus } = usePlatform();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get("destaque");

  const [kindFilter, setKindFilter] = useState<"all" | "project" | "checkpoint">("all");
  const [roadmapFilter, setRoadmapFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "not_started" | "in_progress" | "completed">("all");
  const [expandedProject, setExpandedProject] = useState<{
    node: RoadmapNode;
    roadmap: RoadmapDefinition;
  } | null>(null);

  const allItems = useMemo(() => getAllRoadmapProjects(), []);

  const counts = useMemo(() => {
    let projects = 0;
    let checkpoints = 0;
    let completed = 0;
    for (const item of allItems) {
      if (item.node.kind === "project") projects += 1;
      else checkpoints += 1;
      const st = computeRoadmapNodeState(item.node, data);
      if (st.effectiveStatus === "completed") completed += 1;
    }
    return { projects, checkpoints, completed };
  }, [allItems, data]);

  const filteredItems = useMemo(() => {
    return allItems.filter(({ node, roadmap }) => {
      if (kindFilter !== "all" && node.kind !== kindFilter) return false;
      if (roadmapFilter !== "all" && roadmap.id !== roadmapFilter) return false;
      if (statusFilter !== "all") {
        const st = computeRoadmapNodeState(node, data);
        if (statusFilter === "completed" && st.effectiveStatus !== "completed") return false;
        if (statusFilter === "in_progress" && st.effectiveStatus !== "in_progress") return false;
        if (statusFilter === "not_started" && st.effectiveStatus !== "not_started") return false;
      }
      return true;
    });
  }, [allItems, data, kindFilter, roadmapFilter, statusFilter]);

  const handleStatusChange = (roadmapId: string, nodeId: string, status: RoadmapTopicStatus) => {
    setRoadmapTopicStatus(roadmapId, nodeId, status).catch(() => {});
  };

  return (
    <div className="ce-page">
      <section className="ce-hero-banner ce-projects-hero ce-hero-with-art">
        <AmbientAurora speed={0.5} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span className="ce-badge" style={{ borderColor: "var(--border-accent)", color: "var(--accent-secondary)", alignSelf: "flex-start" }}>
            <FolderKanban size={12} />
            <ShinyText text="Aplicação Integrada & Portfólio" />
          </span>

          <h1 className="ce-hero-title">Projetos &amp; Checkpoints Integradores</h1>

          <p className="ce-hero-sub" style={{ marginBottom: 0 }}>
            Construa projetos completos para unir vários conceitos e montar seu portfólio.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
            <Link to="/desafios" className="ce-btn ce-btn-ghost ce-btn-sm">
              <Swords size={13} />
              <span>Ver Desafios independentes</span>
            </Link>
            <Link to="/roadmaps" className="ce-btn ce-btn-ghost ce-btn-sm">
              <MapIcon size={13} />
              <span>Explorar Roadmaps</span>
            </Link>
          </div>
        </div>

        <div className="ce-hero-right-cluster">
          <div className="ce-hero-art-slot" aria-hidden="true">
            <HeroIllustration variant="projects" />
          </div>

          <div className="ce-proj-hero-metrics">
            <div className="ce-metric-tile">
              <span>Projetos</span>
              <strong>{counts.projects}</strong>
            </div>
            <div className="ce-metric-tile">
              <span>Checkpoints</span>
              <strong>{counts.checkpoints}</strong>
            </div>
            <div className="ce-metric-tile">
              <span>Concluídos</span>
              <strong style={{ color: "var(--accent-success)" }}>
                {counts.completed} / {allItems.length}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="ce-surface ce-proj-filter-bar" aria-label="Filtros de projetos">
        <div className="ce-rm-filter-chips">
          <button
            type="button"
            className={`ce-chip ${kindFilter === "all" ? "is-active" : ""}`}
            onClick={() => setKindFilter("all")}
          >
            Todos ({allItems.length})
          </button>
          <button
            type="button"
            className={`ce-chip ${kindFilter === "project" ? "is-active" : ""}`}
            onClick={() => setKindFilter("project")}
          >
            <FolderGit2 size={12} />
            <span>Projetos Integradores ({counts.projects})</span>
          </button>
          <button
            type="button"
            className={`ce-chip ${kindFilter === "checkpoint" ? "is-active" : ""}`}
            onClick={() => setKindFilter("checkpoint")}
          >
            <Flag size={12} />
            <span>Checkpoints ({counts.checkpoints})</span>
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            className="ce-select"
            style={{ height: 34, fontSize: 12.5 }}
            value={roadmapFilter}
            onChange={e => setRoadmapFilter(e.target.value)}
            aria-label="Filtrar por roadmap"
          >
            <option value="all">Roadmap: Todos</option>
            {ROADMAPS.map(rm => (
              <option key={rm.id} value={rm.id}>
                {rm.shortTitle}
              </option>
            ))}
          </select>

          <select
            className="ce-select"
            style={{ height: 34, fontSize: 12.5 }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            aria-label="Filtrar por status do projeto"
          >
            <option value="all">Status: Todos</option>
            <option value="not_started">Pendentes</option>
            <option value="in_progress">Em andamento</option>
            <option value="completed">Concluídos</option>
          </select>
        </div>
      </section>

      {highlightId && (
        <div className="ce-proj-highlight-bar">
          <span>
            Destacando item selecionado na busca.
          </span>
          <button
            type="button"
            className="ce-btn ce-btn-ghost ce-btn-sm"
            onClick={() => setSearchParams({}, { replace: true })}
          >
            Mostrar todos normalmente
          </button>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="ce-rm-empty-state">
          <FolderKanban size={28} style={{ color: "var(--accent-secondary)" }} />
          <h3>Nenhum projeto ou checkpoint encontrado</h3>
          <p>Ajuste os filtros acima para explorar todas as entregas integradoras disponíveis.</p>
          <button
            type="button"
            className="ce-btn ce-btn-primary"
            onClick={() => {
              setKindFilter("all");
              setRoadmapFilter("all");
              setStatusFilter("all");
            }}
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="ce-proj-grid">
          {filteredItems.map(({ node, roadmap }) => {
            const state = computeRoadmapNodeState(node, data);
            const isHighlighted = highlightId === node.id;
            const isProject = node.kind === "project";
            const primaryStudy = resolvePrimaryStudyLink(node.studyLinks[0]);

            const relatedTrackIds = Array.from(
              new Set<TrackId>([
                ...node.studyLinks
                  .map(l => (l.kind === "track" ? (l.trackId || l.id) : l.trackId))
                  .filter((t): t is TrackId => Boolean(t && t in TRACK_MAP)),
                ...roadmap.relatedTrackIds.slice(0, 2),
              ])
            );

            return (
              <SpotlightCard
                key={node.id}
                className={`ce-proj-card ${isHighlighted ? "is-highlighted" : ""} status-${state.effectiveStatus}`}
                spotlightColor={roadmap.accentSoft}
                style={
                  {
                    "--rm-accent": roadmap.accentColor,
                    "--rm-accent-border": roadmap.accentBorder,
                  } as React.CSSProperties
                }
              >
                <div className="ce-proj-card-head">
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span
                      className="ce-badge"
                      style={{
                        borderColor: isProject
                          ? "rgba(var(--accent-secondary-rgb), 0.48)"
                          : "rgba(245, 158, 11, 0.42)",
                        color: isProject ? "var(--accent-secondary)" : "var(--accent-warning)",
                      }}
                    >
                      {isProject ? <FolderGit2 size={12} /> : <Flag size={12} />}
                      <span>{isProject ? "Projeto Integrador" : "Checkpoint"}</span>
                    </span>

                    <Link
                      to={`/roadmaps/${roadmap.id}?topico=${node.id}`}
                      className="ce-badge"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span
                        className="ce-rm-dot"
                        style={{ background: roadmap.accentColor }}
                        aria-hidden="true"
                      />
                      <span>{roadmap.shortTitle}</span>
                    </Link>

                    <span className="ce-badge" title="Tempo médio estimado para concluir">
                      <Clock size={11} />
                      <span>{getProjectEstimatedTime(node.id, node.kind)}</span>
                    </span>
                  </div>

                  <div className="ce-proj-status-switch" role="group" aria-label={`Status de ${node.title}`}>
                    {(
                      [
                        { id: "not_started" as const, label: "Pendente", icon: CircleDashed },
                        { id: "in_progress" as const, label: "Em andamento", icon: Play },
                        { id: "completed" as const, label: "Concluído", icon: CheckCircle2 },
                      ] as const
                    ).map(opt => {
                      const Icon = opt.icon;
                      const active = state.effectiveStatus === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          className={`ce-proj-status-btn status-${opt.id} ${active ? "is-active" : ""}`}
                          onClick={() => handleStatusChange(roadmap.id, node.id, opt.id)}
                          aria-pressed={active}
                        >
                          <Icon size={12} />
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h2 className="ce-proj-title">{node.title}</h2>
                  <p className="ce-proj-goal">
                    <strong>Objetivo: </strong>
                    <AnnotatedText text={node.summary} />
                  </p>
                  <p className="ce-proj-why">
                    <AnnotatedText text={node.whyItMatters} />
                  </p>
                </div>

                <ProjectPreview
                  nodeId={node.id}
                  accentColor={roadmap.accentColor}
                  onExpand={() => setExpandedProject({ node, roadmap })}
                />

                {node.projectIdeas && node.projectIdeas.length > 0 && (
                  <div className="ce-proj-deliverables">
                    <strong className="ce-proj-section-label">
                      <Target size={13} style={{ color: "var(--accent-warning)" }} />
                      <span>Resultado esperado &amp; entregas</span>
                    </strong>
                    <ul className="ce-rm-project-list">
                      {node.projectIdeas.map(idea => (
                        <li key={idea}>{idea}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="ce-proj-relations">
                  {node.keyConcepts.length > 0 && (
                    <div className="ce-rm-concepts-wrap">
                      {node.keyConcepts.map(concept => (
                        <span key={concept} className="ce-rm-concept-tag">
                          {concept}
                        </span>
                      ))}
                    </div>
                  )}

                  {relatedTrackIds.length > 0 && (
                    <div className="ce-rm-card-tracks">
                      {relatedTrackIds.slice(0, 4).map(trackId => {
                        const track = TRACK_MAP[trackId];
                        if (!track) return null;
                        return (
                          <Link key={trackId} to={`/trilhas/${trackId}`} className="ce-rm-track-pill">
                            <TechIcon trackId={trackId} size={14} />
                            <span>{track.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="ce-proj-card-foot">
                  {primaryStudy ? (
                    <Link to={primaryStudy.to} className="ce-btn ce-btn-primary ce-btn-sm">
                      <BookOpen size={13} />
                      <span>{primaryStudy.label}</span>
                      <ArrowRight size={13} />
                    </Link>
                  ) : (
                    <Link to={`/trilhas/${roadmap.relatedTrackIds[0] || "web"}`} className="ce-btn ce-btn-primary ce-btn-sm">
                      <BookOpen size={13} />
                      <span>Estudar base recomendada</span>
                      <ArrowRight size={13} />
                    </Link>
                  )}

                  <Link
                    to={`/roadmaps/${roadmap.id}?topico=${node.id}`}
                    className="ce-btn ce-btn-ghost ce-btn-sm"
                  >
                    <MapIcon size={13} />
                    <span>Ver no Roadmap</span>
                  </Link>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}

      <ProjectLightbox item={expandedProject} onClose={() => setExpandedProject(null)} />
    </div>
  );
};
