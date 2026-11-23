import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Compass,
  Flag,
  FolderGit2,
  GitBranch,
  Layers,
  Map as MapIcon,
  Rocket,
  Sparkles,
} from "lucide-react";
import { AmbientAurora } from "../components/motion/AmbientAurora";
import { ShinyText } from "../components/motion/ShinyText";
import { RoadmapCanvas } from "../components/roadmaps/RoadmapCanvas";
import { TopicInspectorDrawer } from "../components/roadmaps/TopicInspectorDrawer";
import { AnnotatedText } from "../components/shared/GlossaryTerm";
import { ProgressRing } from "../components/shared/ProgressRing";
import { TechIcon } from "../components/shared/TechIcon";
import { usePlatform } from "../context/PlatformContext";
import { LESSONS_BY_TRACK } from "../data/lessons";
import {
  ROADMAP_CATEGORY_MAP,
  ROADMAP_MAP,
  computeRoadmapNodeState,
  computeRoadmapSummary,
} from "../data/roadmaps";
import { TRACK_MAP } from "../data/tracks";
import type { RoadmapKind, RoadmapNode, RoadmapPriority } from "../types/roadmap";

type DetailTab = "map" | "pathways" | "tracks" | "projects";

const KIND_LABELS: Record<RoadmapKind, string> = {
  role: "Carreira",
  skill: "Tecnologia",
  foundation: "Fundamentos",
};

export const RoadmapDetailPage: React.FC = () => {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, setRoadmapTopicStatus, toggleSavedRoadmap } = usePlatform();

  const roadmap = roadmapId ? ROADMAP_MAP[roadmapId] : undefined;
  const topicParam = searchParams.get("topico");

  const [tab, setTab] = useState<DetailTab>("map");
  const [priorityFilter, setPriorityFilter] = useState<RoadmapPriority | "all">("all");
  const [activePathwayId, setActivePathwayId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(Boolean(topicParam));

  const summary = useMemo(
    () => (roadmap ? computeRoadmapSummary(roadmap, data) : null),
    [roadmap, data]
  );

  const nextSuggestedNode: RoadmapNode | null = useMemo(() => {
    if (!roadmap) return null;
    const candidates = roadmap.nodes.filter(node => {
      const st = computeRoadmapNodeState(node, data);
      return st.effectiveStatus !== "completed" && st.effectiveStatus !== "skipped" && st.isUnlocked;
    });
    if (candidates.length === 0) {
      return (
        roadmap.nodes.find(node => {
          const st = computeRoadmapNodeState(node, data);
          return st.effectiveStatus !== "completed" && st.effectiveStatus !== "skipped";
        }) || roadmap.nodes[0] || null
      );
    }
    const orderRank = (p?: RoadmapPriority) =>
      p === "required" ? 0 : p === "recommended" ? 1 : 2;
    return [...candidates].sort((a, b) => orderRank(a.priority) - orderRank(b.priority))[0];
  }, [roadmap, data]);

  // Sincroniza o tópico selecionado quando abre um roadmap ou muda ?topico=
  useEffect(() => {
    if (!roadmap) return;
    if (topicParam && roadmap.nodes.some(n => n.id === topicParam)) {
      setSelectedNodeId(topicParam);
      setTab("map");
      setDrawerOpen(true);
      return;
    }
    setDrawerOpen(false);
    setSelectedNodeId(prev => {
      if (prev && roadmap.nodes.some(n => n.id === prev)) return prev;
      return nextSuggestedNode?.id || roadmap.nodes[0]?.id || null;
    });
    setActivePathwayId(null);
    setPriorityFilter("all");
  }, [roadmap, topicParam, nextSuggestedNode?.id]);

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    if (searchParams.has("topico")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("topico");
      setSearchParams(nextParams, { replace: true });
    }
  };

  // Fecha o inspetor lateral com Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") handleCloseDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  if (!roadmap || !summary) {
    return (
      <div className="ce-page">
        <div className="ce-rm-empty-state">
          <Compass size={30} style={{ color: "var(--accent-blue)" }} />
          <h2>Roadmap não encontrado</h2>
          <p>O mapa solicitado não existe ou foi movido. Explore todos os roadmaps disponíveis no hub.</p>
          <Link to="/roadmaps" className="ce-btn ce-btn-primary">
            <ArrowLeft size={14} />
            <span>Voltar ao Hub de Roadmaps</span>
          </Link>
        </div>
      </div>
    );
  }

  const category = ROADMAP_CATEGORY_MAP[roadmap.categoryId];
  const isSaved = (data.savedRoadmaps || []).includes(roadmap.id);
  const selectedNode = roadmap.nodes.find(n => n.id === selectedNodeId) || null;
  const milestoneNodes = roadmap.nodes.filter(
    n => n.kind === "checkpoint" || n.kind === "project"
  );

  const handleSelectNode = (nodeId: string, openDrawer = true) => {
    setSelectedNodeId(nodeId);
    if (openDrawer) setDrawerOpen(true);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("topico", nodeId);
    setSearchParams(nextParams, { replace: true });
  };

  const handleApplyPathway = (pathwayId: string) => {
    const pw = roadmap.pathways.find(p => p.id === pathwayId);
    setActivePathwayId(pathwayId);
    setTab("map");
    if (pw?.nodeIds[0]) {
      setSelectedNodeId(pw.nodeIds[0]);
    }
  };

  return (
    <div
      className="ce-page"
      style={
        {
          "--rm-accent": roadmap.accentColor,
          "--rm-accent-secondary": roadmap.accentSecondary,
          "--rm-accent-soft": roadmap.accentSoft,
          "--rm-accent-border": roadmap.accentBorder,
        } as React.CSSProperties
      }
    >
      {/* Hero compacto para deixar o mapa visível acima da dobra */}
      <section className="ce-rm-detail-hero is-compact">
        <AmbientAurora
          accentColor={roadmap.accentColor}
          secondaryColor={roadmap.accentSecondary}
          speed={0.5}
        />
        <div className="ce-rm-detail-hero-inner">
          <div className="ce-rm-detail-main">
            <div className="ce-rm-breadcrumb">
              <Link to="/roadmaps">Roadmaps</Link>
              <span>›</span>
              <span>{category?.shortLabel || "Área"}</span>
              <span>›</span>
              <strong>{roadmap.shortTitle}</strong>
            </div>

            <div className="ce-rm-detail-badges">
              <span className="ce-hero-badge">
                <MapIcon size={12} style={{ color: roadmap.accentColor }} />
                <ShinyText text={KIND_LABELS[roadmap.kind]} />
              </span>
              <span className="ce-badge">{roadmap.scopeLabel}</span>
              <span className="ce-badge">{roadmap.nodes.length} tópicos</span>
            </div>

            <h1>{roadmap.title}</h1>
            <p className="ce-rm-detail-summary">
              <AnnotatedText text={roadmap.summary} />
            </p>
          </div>

          <div className="ce-rm-detail-side">
            <div className="ce-rm-detail-progress-box">
              <ProgressRing
                percent={summary.percent}
                size={74}
                strokeWidth={7}
                color={roadmap.accentColor}
                sublabel="concluído"
              />
              <div className="ce-rm-detail-kpis">
                <div>
                  <strong>
                    {summary.completedNodes}/{summary.totalNodes}
                  </strong>
                  <span>tópicos</span>
                </div>
                <div>
                  <strong>
                    {summary.linkedActivitiesDone}/{summary.linkedActivitiesTotal}
                  </strong>
                  <span>práticas</span>
                </div>
                <div>
                  <strong>{roadmap.relatedTrackIds.length}</strong>
                  <span>trilhas</span>
                </div>
              </div>
            </div>

            <div className="ce-rm-detail-hero-actions">
              <button
                type="button"
                className={`ce-btn ce-btn-sm ${isSaved ? "ce-btn-primary" : "ce-btn-ghost"}`}
                onClick={() => toggleSavedRoadmap(roadmap.id)}
              >
                <Bookmark size={13} />
                <span>{isSaved ? "Salvo" : "Salvar"}</span>
              </button>
              <Link to="/roadmaps" className="ce-btn ce-btn-ghost ce-btn-sm">
                <ArrowLeft size={13} />
                <span>Catálogo</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Navegação por abas do Roadmap (sem filtros duplicados) */}
      <div className="ce-rm-subtabs-bar">
        <div className="ce-tabs" role="tablist" aria-label="Visões do roadmap">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "map"}
            className={`ce-tab ${tab === "map" ? "is-active" : ""}`}
            onClick={() => setTab("map")}
          >
            <MapIcon size={14} />
            <span>Mapa do Conhecimento</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "pathways"}
            className={`ce-tab ${tab === "pathways" ? "is-active" : ""}`}
            onClick={() => setTab("pathways")}
          >
            <GitBranch size={14} />
            <span>Percursos ({roadmap.pathways.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "tracks"}
            className={`ce-tab ${tab === "tracks" ? "is-active" : ""}`}
            onClick={() => setTab("tracks")}
          >
            <Layers size={14} />
            <span>Trilhas ({roadmap.relatedTrackIds.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "projects"}
            className={`ce-tab ${tab === "projects" ? "is-active" : ""}`}
            onClick={() => setTab("projects")}
          >
            <Flag size={14} />
            <span>Projetos &amp; Marcos ({milestoneNodes.length})</span>
          </button>
        </div>

        {tab === "map" && roadmap.pathways.length > 0 && (
          <div className="ce-rm-pathway-select-wrap">
            <label htmlFor="ce-rm-pathway-select">Percurso:</label>
            <select
              id="ce-rm-pathway-select"
              className="ce-select"
              value={activePathwayId || ""}
              onChange={e => setActivePathwayId(e.target.value || null)}
            >
              <option value="">Mapa completo ({roadmap.nodes.length} tópicos)</option>
              {roadmap.pathways.map(pw => (
                <option key={pw.id} value={pw.id}>
                  {pw.label} ({pw.nodeIds.length})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Conteúdo por aba */}
      {tab === "map" && (
        <div className="ce-rm-workspace is-full-canvas">
          <div className="ce-rm-workspace-main">
            {nextSuggestedNode && (
              <div className="ce-rm-next-banner">
                <div className="ce-rm-next-icon">
                  <Rocket size={20} style={{ color: roadmap.accentColor }} />
                </div>
                <div className="ce-rm-next-copy">
                  <span className="ce-rm-next-eyebrow">
                    <Sparkles size={12} /> Próximo objetivo sugerido para você
                  </span>
                  <strong>{nextSuggestedNode.title}</strong>
                  <p>{nextSuggestedNode.summary}</p>
                </div>
                <button
                  type="button"
                  className="ce-btn ce-btn-primary"
                  onClick={() => handleSelectNode(nextSuggestedNode.id, true)}
                >
                  <span>Abrir detalhes</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            <RoadmapCanvas
              roadmap={roadmap}
              data={data}
              selectedNodeId={drawerOpen ? selectedNodeId : null}
              onSelectNode={id => handleSelectNode(id, true)}
              onSetStatus={(rmId, topicId, status) => {
                setRoadmapTopicStatus(rmId, topicId, status).catch(() => {});
              }}
              activePathwayId={activePathwayId}
              onClearPathway={() => setActivePathwayId(null)}
              priorityFilter={priorityFilter}
              onChangePriorityFilter={setPriorityFilter}
              focusHighlightNextId={nextSuggestedNode?.id || null}
            />
          </div>

          {/* Inspetor lateral sob demanda ao clicar em qualquer nó */}
          <div
            className={`ce-rm-drawer-backdrop ${drawerOpen ? "is-open" : ""}`}
            onClick={handleCloseDrawer}
          />
          <div className={`ce-rm-inspector-slot ${drawerOpen ? "is-open" : ""}`}>
            <TopicInspectorDrawer
              roadmap={roadmap}
              node={selectedNode}
              data={data}
              onSelectNode={id => handleSelectNode(id, true)}
              onSetStatus={setRoadmapTopicStatus}
              onClose={handleCloseDrawer}
            />
          </div>
        </div>
      )}

      {tab === "pathways" && (
        <section className="ce-rm-tab-section" aria-label="Percursos recomendados">
          <div className="ce-rm-pathways-grid">
            {roadmap.pathways.map(pw => {
              const pwNodes = pw.nodeIds
                .map(id => roadmap.nodes.find(n => n.id === id))
                .filter((n): n is RoadmapNode => Boolean(n));
              const done = pwNodes.filter(
                n => computeRoadmapNodeState(n, data).effectiveStatus === "completed"
              ).length;
              const pct = pwNodes.length > 0 ? Math.round((done / pwNodes.length) * 100) : 0;

              return (
                <article key={pw.id} className="ce-rm-pathway-card">
                  <div className="ce-rm-pathway-head">
                    <span className="ce-badge">{pw.audience}</span>
                    <strong>
                      {done}/{pwNodes.length} concluídos ({pct}%)
                    </strong>
                  </div>
                  <h3>{pw.label}</h3>
                  <p>
                    <AnnotatedText text={pw.description} />
                  </p>
                  <div className="ce-rm-node-bar" style={{ height: 6, marginBottom: 14 }}>
                    <div className="ce-rm-node-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="ce-rm-pathway-steps">
                    {pwNodes.map((node, idx) => {
                      const st = computeRoadmapNodeState(node, data);
                      return (
                        <button
                          key={node.id}
                          type="button"
                          className={`ce-rm-pathway-step status-${st.effectiveStatus}`}
                          onClick={() => {
                            setTab("map");
                            handleSelectNode(node.id, true);
                          }}
                        >
                          <span className="ce-rm-step-num">{idx + 1}</span>
                          <span>{node.shortTitle || node.title}</span>
                          {st.effectiveStatus === "completed" && (
                            <CheckCircle2 size={13} style={{ color: "var(--accent-success)", marginLeft: "auto" }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className="ce-btn ce-btn-primary"
                    style={{ marginTop: "auto" }}
                    onClick={() => handleApplyPathway(pw.id)}
                  >
                    <span>Destacar este percurso no mapa</span>
                    <ArrowRight size={14} />
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tab === "tracks" && (
        <section className="ce-rm-tab-section" aria-label="Trilhas conectadas">
          <div className="ce-rm-tracks-grid">
            {roadmap.relatedTrackIds.map(trackId => {
              const track = TRACK_MAP[trackId];
              if (!track) return null;
              const lessons = LESSONS_BY_TRACK[trackId] || [];
              const completed = lessons.filter(l => data.lessonProgress[l.id]?.completed).length;
              const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

              return (
                <article
                  key={track.id}
                  className="ce-rm-linked-track-card"
                  style={{ borderColor: track.accentBorder }}
                >
                  <div className="ce-rm-linked-track-head">
                    <TechIcon trackId={track.id} size={28} boxed />
                    <div>
                      <span className="ce-badge">{track.level}</span>
                      <h3>{track.name}</h3>
                    </div>
                    <strong style={{ marginLeft: "auto", color: track.accentColor }}>{pct}%</strong>
                  </div>
                  <p>{track.description}</p>
                  <div className="ce-rm-linked-track-foot">
                    <span>
                      {completed}/{lessons.length} aulas concluídas
                    </span>
                    <Link to={`/trilhas/${track.id}`} className="ce-btn ce-btn-primary ce-btn-sm">
                      <span>Abrir trilha</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tab === "projects" && (
        <section className="ce-rm-tab-section" aria-label="Projetos e checkpoints">
          <div className="ce-proj-roadmap-callout">
            <span>
              Quer explorar todas as entregas integradoras e acompanhar suas metas em um só lugar?
            </span>
            <Link to="/projetos" className="ce-btn ce-btn-ghost ce-btn-sm">
              <span>Abrir área Projetos</span>
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="ce-rm-milestones-grid">
            {milestoneNodes.map(node => {
              const st = computeRoadmapNodeState(node, data);
              return (
                <article key={node.id} className="ce-rm-milestone-card">
                  <div className="ce-rm-pathway-head">
                    <span className="ce-badge" style={{ color: "var(--accent-warning)" }}>
                      {node.kind === "project" ? (
                        <FolderGit2 size={12} />
                      ) : (
                        <Flag size={12} />
                      )}
                      <span>{node.kind === "project" ? "Projeto" : "Checkpoint"}</span>
                    </span>
                    {st.effectiveStatus === "completed" && (
                      <span className="ce-rm-done-chip">
                        <CheckCircle2 size={12} />
                        <span>Concluído</span>
                      </span>
                    )}
                  </div>
                  <h3>{node.title}</h3>
                  <p>
                    <AnnotatedText text={node.summary} />
                  </p>
                  {node.projectIdeas && node.projectIdeas.length > 0 && (
                    <ul className="ce-rm-project-list">
                      {node.projectIdeas.map(idea => (
                        <li key={idea}>{idea}</li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    className="ce-btn ce-btn-ghost ce-btn-sm"
                    style={{ marginTop: "auto", alignSelf: "flex-start" }}
                    onClick={() => {
                      setTab("map");
                      handleSelectNode(node.id, true);
                    }}
                  >
                    <span>Ver pré-requisitos e recursos no mapa</span>
                    <ArrowRight size={13} />
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Roadmaps relacionados */}
      {roadmap.relatedRoadmapIds.length > 0 && (
        <section className="ce-rm-related-strip" aria-label="Roadmaps relacionados">
          <h3>Continue sua exploração em áreas vizinhas</h3>
          <div className="ce-rm-related-grid">
            {roadmap.relatedRoadmapIds.map(relId => {
              const rel = ROADMAP_MAP[relId];
              if (!rel) return null;
              const relSummary = computeRoadmapSummary(rel, data);
              return (
                <Link key={rel.id} to={`/roadmaps/${rel.id}`} className="ce-rm-related-card">
                  <span
                    className="ce-rm-dot"
                    style={{ background: rel.accentColor, width: 10, height: 10 }}
                    aria-hidden="true"
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <strong>{rel.title}</strong>
                    <span>
                      {rel.nodes.length} tópicos · {relSummary.percent}% concluído
                    </span>
                  </div>
                  <ArrowRight size={15} />
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
