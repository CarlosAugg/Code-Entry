import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  Compass,
  Cpu,
  Database,
  Layers,
  Layout,
  Map as MapIcon,
  Search,
  Server,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import { AmbientAurora } from "../components/motion/AmbientAurora";
import { ShinyText } from "../components/motion/ShinyText";
import { SpotlightCard } from "../components/motion/SpotlightCard";
import { RoadmapMiniPreview } from "../components/roadmaps/RoadmapCanvas";
import { AnnotatedText } from "../components/shared/GlossaryTerm";
import { ProgressRing } from "../components/shared/ProgressRing";
import { TechIcon } from "../components/shared/TechIcon";
import { HeroIllustration } from "../components/shared/HeroIllustration";
import { usePlatform } from "../context/PlatformContext";
import {
  ROADMAPS,
  ROADMAP_CATEGORIES,
  ROADMAP_CATEGORY_MAP,
  computeRoadmapSummary,
} from "../data/roadmaps";
import { TRACK_MAP } from "../data/tracks";
import type {
  RoadmapCategoryIcon,
  RoadmapDefinition,
  RoadmapKind,
  RoadmapNode,
} from "../types/roadmap";

const KIND_LABELS: Record<RoadmapKind, string> = {
  role: "Carreira",
  skill: "Tecnologia",
  foundation: "Fundamentos",
};

function renderCategoryIcon(icon: RoadmapCategoryIcon, color: string, size = 18) {
  const props = { size, style: { color } };
  switch (icon) {
    case "layout":
      return <Layout {...props} />;
    case "server":
      return <Server {...props} />;
    case "layers":
      return <Layers {...props} />;
    case "terminal":
      return <Terminal {...props} />;
    case "database":
      return <Database {...props} />;
    case "cpu":
      return <Cpu {...props} />;
  }
}

export const RoadmapsPage: React.FC = () => {
  const { data, toggleSavedRoadmap } = usePlatform();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<RoadmapKind | "all">("all");
  const [onlySaved, setOnlySaved] = useState(false);

  const savedSet = useMemo(() => new Set(data.savedRoadmaps || []), [data.savedRoadmaps]);

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const rm of ROADMAPS) {
      counts[rm.categoryId] = (counts[rm.categoryId] || 0) + 1;
    }
    return counts;
  }, []);

  const summaryByRoadmap = useMemo(() => {
    const map: Record<string, ReturnType<typeof computeRoadmapSummary>> = {};
    for (const rm of ROADMAPS) {
      map[rm.id] = computeRoadmapSummary(rm, data);
    }
    return map;
  }, [data]);

  const normalizedQuery = search.trim().toLowerCase();

  const matchingTopicsMap = useMemo(() => {
    const map: Record<string, RoadmapNode[]> = {};
    if (!normalizedQuery) return map;

    for (const rm of ROADMAPS) {
      const hits = rm.nodes.filter(n => {
        const hay = `${n.title} ${n.summary} ${n.keyConcepts.join(" ")} ${(n.alternatives || [])
          .map(a => a.name)
          .join(" ")}`.toLowerCase();
        return hay.includes(normalizedQuery);
      });
      if (hits.length > 0) {
        map[rm.id] = hits.slice(0, 4);
      }
    }
    return map;
  }, [normalizedQuery]);

  const filteredRoadmaps = useMemo(() => {
    return ROADMAPS.filter(rm => {
      if (categoryFilter !== "all" && rm.categoryId !== categoryFilter) return false;
      if (kindFilter !== "all" && rm.kind !== kindFilter) return false;
      if (onlySaved && !savedSet.has(rm.id)) return false;

      if (normalizedQuery) {
        const cat = ROADMAP_CATEGORY_MAP[rm.categoryId];
        const baseHay = `${rm.title} ${rm.shortTitle} ${rm.summary} ${rm.audience} ${
          cat?.label || ""
        }`.toLowerCase();
        const hasTopicMatch = (matchingTopicsMap[rm.id]?.length || 0) > 0;
        if (!baseHay.includes(normalizedQuery) && !hasTopicMatch) {
          return false;
        }
      }

      return true;
    });
  }, [categoryFilter, kindFilter, onlySaved, savedSet, normalizedQuery, matchingTopicsMap]);

  const featuredRoadmap: RoadmapDefinition | undefined = useMemo(() => {
    if (normalizedQuery || categoryFilter !== "all" || kindFilter !== "all" || onlySaved) {
      return undefined;
    }
    return ROADMAPS.find(rm => rm.featured) || ROADMAPS[0];
  }, [normalizedQuery, categoryFilter, kindFilter, onlySaved]);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setKindFilter("all");
    setOnlySaved(false);
  };

  const hasActiveFilters =
    Boolean(normalizedQuery) || categoryFilter !== "all" || kindFilter !== "all" || onlySaved;

  return (
    <div className="ce-page">
      {/* Hero de Descoberta */}
      <section className="ce-rm-hero">
        <AmbientAurora speed={0.55} />
        <div className="ce-rm-hero-inner">
          <div className="ce-rm-hero-copy">
            <span className="ce-badge" style={{ borderColor: "var(--border-accent)", color: "var(--accent-secondary)" }}>
              <MapIcon size={12} />
              <ShinyText text="Roadmaps de Carreira e Áreas" />
            </span>

            <h1 className="ce-rm-hero-title">
              Explore o conhecimento, <span>descubra seu caminho.</span>
            </h1>

            <p className="ce-rm-hero-sub">
              Visualize a jornada completa de cada carreira ou tecnologia e acompanhe o que já domina.
            </p>

            <div className="ce-rm-hero-controls">
              <div className="ce-rm-hero-search">
                <Search size={16} className="ce-rm-hero-search-icon" />
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar roadmap, área ou tecnologia..."
                  aria-label="Buscar roadmaps e tópicos"
                />
                {search && (
                  <button
                    type="button"
                    className="ce-rm-search-clear"
                    onClick={() => setSearch("")}
                    aria-label="Limpar busca"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="ce-rm-hero-stats-inline" aria-label="Resumo do catálogo">
                <span>
                  <strong>{ROADMAPS.length}</strong> roadmaps
                </span>
                <span>·</span>
                <span>
                  <strong>{ROADMAP_CATEGORIES.length}</strong> áreas
                </span>
                <span>·</span>
                <span>
                  <strong>{savedSet.size}</strong> salvos
                </span>
              </div>
            </div>
          </div>

          <div className="ce-rm-hero-art-wrap" aria-hidden="true">
            <HeroIllustration variant="roadmaps" />
          </div>
        </div>
      </section>

      {/* Roadmap recomendado para iniciantes */}
      {featuredRoadmap && (
        <section className="ce-rm-featured-card" data-tour="roadmaps-graph">
          <div className="ce-rm-featured-info">
            <div className="ce-rm-featured-top">
              <span className="ce-badge" style={{ color: "var(--accent-warning)", borderColor: "rgba(245, 158, 11, 0.35)" }}>
                <Sparkles size={11} />
                <span>Recomendado para iniciantes</span>
              </span>
              <span className="ce-badge">{KIND_LABELS[featuredRoadmap.kind]}</span>
              <button
                type="button"
                className={`ce-rm-save-btn ${savedSet.has(featuredRoadmap.id) ? "is-saved" : ""}`}
                onClick={() => toggleSavedRoadmap(featuredRoadmap.id)}
                aria-label={
                  savedSet.has(featuredRoadmap.id) ? "Remover dos salvos" : "Salvar roadmap"
                }
              >
                <Bookmark size={14} />
              </button>
            </div>

            <h2>{featuredRoadmap.title}</h2>
            <p className="ce-rm-featured-desc">
              <AnnotatedText text={featuredRoadmap.summary} />
            </p>

            <div className="ce-rm-featured-metrics">
              <span>
                <strong>{summaryByRoadmap[featuredRoadmap.id].totalNodes}</strong> tópicos no grafo
              </span>
              <span>
                <strong>{summaryByRoadmap[featuredRoadmap.id].linkedActivitiesTotal}</strong> práticas integradas
              </span>
              <span>
                <strong>{summaryByRoadmap[featuredRoadmap.id].percent}%</strong> concluído
              </span>
            </div>

            <div className="ce-rm-featured-pathways">
              {featuredRoadmap.pathways.slice(0, 2).map(pw => (
                <div key={pw.id} className="ce-rm-pathway-chip">
                  <Compass size={13} style={{ color: featuredRoadmap.accentColor }} />
                  <span>
                    <strong>{pw.label}:</strong> {pw.audience}
                  </span>
                </div>
              ))}
            </div>

            <div className="ce-rm-featured-actions">
              <Link
                to={`/roadmaps/${featuredRoadmap.id}`}
                className="ce-btn ce-btn-primary ce-rm-featured-cta"
              >
                <span>Explorar roadmap completo</span>
                <ArrowRight size={17} strokeWidth={2.2} />
              </Link>
            </div>
          </div>

          <div className="ce-rm-featured-preview">
            <RoadmapMiniPreview roadmap={featuredRoadmap} data={data} />
          </div>
        </section>
      )}

      {/* Trilho dinâmico de Categorias (acima do Catálogo onde o filtro atua) */}
      <section className="ce-rm-categories-section" aria-label="Categorias de roadmaps">
        <div className="ce-section-head">
          <div>
            <h2>Áreas de Conhecimento</h2>
            <span>
              {categoryFilter !== "all" && ROADMAP_CATEGORY_MAP[categoryFilter]
                ? ROADMAP_CATEGORY_MAP[categoryFilter].description
                : "Selecione uma área para filtrar o catálogo abaixo"}
            </span>
          </div>
          {categoryFilter !== "all" && (
            <button
              type="button"
              className="ce-btn ce-btn-ghost ce-btn-sm"
              onClick={() => setCategoryFilter("all")}
            >
              Ver todas as áreas
            </button>
          )}
        </div>

        <div className="ce-rm-cat-grid">
          {ROADMAP_CATEGORIES.map(cat => {
            const count = countsByCategory[cat.id] || 0;
            const active = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`ce-rm-cat-card ${active ? "is-active" : ""}`}
                style={{ "--cat-accent": cat.accentColor } as React.CSSProperties}
                onClick={() => setCategoryFilter(prev => (prev === cat.id ? "all" : cat.id))}
                aria-pressed={active}
                title={cat.description}
              >
                <div className="ce-rm-cat-top">
                  <span className="ce-rm-cat-icon">
                    {renderCategoryIcon(cat.icon, cat.accentColor, 18)}
                  </span>
                  <span className="ce-rm-cat-count">
                    {count} {count === 1 ? "mapa" : "mapas"}
                  </span>
                </div>
                <strong>{cat.shortLabel}</strong>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filtros secundários (Tipo e Salvos) */}
      <section aria-label="Catálogo completo de roadmaps" {...(!featuredRoadmap ? { "data-tour": "roadmaps-graph" } : {})}>
        <div className="ce-rm-catalog-bar">
          <div className="ce-section-head" style={{ marginBottom: 0 }}>
            <div>
              <h2>Catálogo de Roadmaps</h2>
              <span>
                {filteredRoadmaps.length} de {ROADMAPS.length} roadmaps exibidos · clique para abrir o mapa não linear
              </span>
            </div>
          </div>

          <div className="ce-rm-filter-chips">
            <button
              type="button"
              className={`ce-chip ${kindFilter === "all" ? "is-active" : ""}`}
              onClick={() => setKindFilter("all")}
            >
              Todos
            </button>
            <button
              type="button"
              className={`ce-chip ${kindFilter === "role" ? "is-active" : ""}`}
              onClick={() => setKindFilter("role")}
            >
              Carreiras
            </button>
            <button
              type="button"
              className={`ce-chip ${kindFilter === "skill" ? "is-active" : ""}`}
              onClick={() => setKindFilter("skill")}
            >
              Tecnologias
            </button>
            <button
              type="button"
              className={`ce-chip ${kindFilter === "foundation" ? "is-active" : ""}`}
              onClick={() => setKindFilter("foundation")}
            >
              Fundamentos
            </button>
            <button
              type="button"
              className={`ce-chip ${onlySaved ? "is-active" : ""}`}
              onClick={() => setOnlySaved(prev => !prev)}
            >
              <Bookmark size={12} />
              <span>Salvos ({savedSet.size})</span>
            </button>
          </div>
        </div>

        {filteredRoadmaps.length === 0 ? (
          <div className="ce-rm-empty-state">
            <Compass size={28} style={{ color: "var(--accent-blue)" }} />
            <h3>Nenhum roadmap encontrado com esses filtros</h3>
            <p>
              Tente outro termo de busca (como "SQL", "Backend", "Redes" ou "DOM") ou limpe os filtros atuais.
            </p>
            {hasActiveFilters && (
              <button type="button" className="ce-btn ce-btn-primary" onClick={clearFilters}>
                Mostrar todos os roadmaps
              </button>
            )}
          </div>
        ) : (
          <div className="ce-rm-catalog-grid">
            {filteredRoadmaps.map(rm => {
              const cat = ROADMAP_CATEGORY_MAP[rm.categoryId];
              const summary = summaryByRoadmap[rm.id];
              const isSaved = savedSet.has(rm.id);
              const topicMatches = matchingTopicsMap[rm.id] || [];

              return (
                <SpotlightCard
                  key={rm.id}
                  className="ce-rm-card"
                  spotlightColor={rm.accentSoft}
                  style={
                    {
                      "--rm-accent": rm.accentColor,
                      "--rm-accent-border": rm.accentBorder,
                    } as React.CSSProperties
                  }
                >
                  <div className="ce-rm-card-head">
                    <div className="ce-rm-card-badges">
                      <span
                        className="ce-rm-cat-dot-badge"
                        style={{ color: cat?.accentColor || rm.accentColor }}
                      >
                        {cat && renderCategoryIcon(cat.icon, cat.accentColor, 14)}
                        <span>{cat?.shortLabel || "Área"}</span>
                      </span>
                      <span className="ce-badge">{KIND_LABELS[rm.kind]}</span>
                    </div>

                    <button
                      type="button"
                      className={`ce-rm-save-btn ${isSaved ? "is-saved" : ""}`}
                      onClick={() => toggleSavedRoadmap(rm.id)}
                      aria-label={isSaved ? `Remover ${rm.title} dos salvos` : `Salvar ${rm.title}`}
                    >
                      <Bookmark size={14} />
                    </button>
                  </div>

                  <div className="ce-rm-card-body-row">
                    <div className="ce-rm-card-main">
                      <Link to={`/roadmaps/${rm.id}`} className="ce-rm-card-title-link">
                        <h3>{rm.title}</h3>
                      </Link>
                      <span className="ce-rm-card-scope">{rm.scopeLabel}</span>
                      <p className="ce-rm-card-summary">{rm.summary}</p>
                    </div>

                    <div className="ce-rm-card-ring">
                      <ProgressRing
                        percent={summary.percent}
                        size={82}
                        strokeWidth={7}
                        color={rm.accentColor}
                      />
                    </div>
                  </div>

                  <div className="ce-rm-card-tracks">
                    {rm.relatedTrackIds.slice(0, 4).map(trackId => {
                      const track = TRACK_MAP[trackId];
                      if (!track) return null;
                      return (
                        <Link
                          key={trackId}
                          to={`/trilhas/${trackId}`}
                          className="ce-rm-track-pill"
                        >
                          <TechIcon trackId={trackId} size={14} />
                          <span>{track.shortName}</span>
                        </Link>
                      );
                    })}
                    {rm.relatedTrackIds.length > 4 && (
                      <span className="ce-rm-track-pill" style={{ color: "var(--text-muted)" }}>
                        +{rm.relatedTrackIds.length - 4}
                      </span>
                    )}
                  </div>

                  {topicMatches.length > 0 && (
                    <div className="ce-rm-search-hits">
                      <span>Tópicos correspondentes:</span>
                      <div className="ce-rm-search-hit-pills">
                        {topicMatches.map(node => (
                          <Link
                            key={node.id}
                            to={`/roadmaps/${rm.id}?topico=${node.id}`}
                            className="ce-rm-hit-pill"
                          >
                            {node.shortTitle || node.title} →
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="ce-rm-card-foot">
                    <span>
                      <strong>{summary.completedNodes}/{summary.totalNodes}</strong> tópicos ·{" "}
                      <strong>{summary.linkedActivitiesTotal}</strong> práticas
                    </span>
                    <Link to={`/roadmaps/${rm.id}`} className="ce-link-more">
                      <span>Explorar mapa</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
