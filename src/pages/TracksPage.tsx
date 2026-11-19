import React, { useMemo, useState } from "react";
import { ArrowRight, Compass, Search } from "lucide-react";
import { CHALLENGES } from "../data/challenges";
import { TRACKS } from "../data/tracks";
import { usePlatform } from "../context/PlatformContext";
import { AmbientAurora } from "../components/motion/AmbientAurora";
import { ShinyText } from "../components/motion/ShinyText";
import { SpotlightCard } from "../components/motion/SpotlightCard";
import { TechIcon } from "../components/shared/TechIcon";

export const TracksPage: React.FC = () => {
  const { stats } = usePlatform();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Todas");
  const [statusFilter, setStatusFilter] = useState<"Todas" | "Em andamento" | "Não iniciadas" | "Concluídas">("Todas");

  const filteredTracks = useMemo(() => {
    return TRACKS.filter(track => {
      const tp = stats.perTrack[track.id];
      if (categoryFilter !== "Todas" && track.category !== categoryFilter) return false;
      if (statusFilter === "Em andamento" && !(tp.completedLessons > 0 && tp.completedLessons < tp.totalLessons)) {
        return false;
      }
      if (statusFilter === "Não iniciadas" && tp.completedLessons > 0) return false;
      if (statusFilter === "Concluídas" && tp.completedLessons < tp.totalLessons) return false;

      if (search.trim()) {
        const hay = `${track.name} ${track.tagline} ${track.description} ${track.category}`.toLowerCase();
        if (!hay.includes(search.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [categoryFilter, search, stats.perTrack, statusFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Hero da página Trilhas */}
      <section className="ce-hero-banner" style={{ gridTemplateColumns: "1fr auto" }}>
        <AmbientAurora />
        <div>
          <span className="ce-badge" style={{ borderColor: "var(--border-accent)", color: "var(--accent-secondary)" }}>
            <Compass size={12} />
            <ShinyText text="Explore as trilhas" />
          </span>
          <h1 className="ce-hero-title" style={{ marginTop: 10 }}>
            Escolha sua trilha de estudos
          </h1>
          <p className="ce-hero-sub" style={{ marginBottom: 0 }}>
            Formações estruturadas com teoria clara, exemplos comentados, ambientes práticos interativos e desafios guiados.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="ce-metric-tile" style={{ minWidth: 130 }}>
            <span>Trilhas ativas</span>
            <strong>{TRACKS.length}</strong>
          </div>
          <div className="ce-metric-tile" style={{ minWidth: 130 }}>
            <span>Aulas práticas</span>
            <strong>{stats.totalLessons}</strong>
          </div>
        </div>
      </section>

      {/* Barra de Busca e Filtros */}
      <section
        className="ce-surface"
        style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}
      >
        <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 360 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
          <input
            className="ce-input"
            style={{ width: "100%", paddingLeft: 34 }}
            placeholder="Filtrar por tecnologia ou tema..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Filtrar trilhas"
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {(["Todas", "Programação", "Sistemas & Infraestrutura", "Dados & Redes"] as const).map(cat => (
            <button
              key={cat}
              type="button"
              className={`ce-btn ce-btn-sm ${categoryFilter === cat ? "ce-btn-primary" : "ce-btn-ghost"}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}

          <select
            className="ce-select"
            style={{ height: 32, fontSize: 12.5 }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            aria-label="Filtrar por progresso"
          >
            <option value="Todas">Status: Todos</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Não iniciadas">Não iniciadas</option>
            <option value="Concluídas">Concluídas</option>
          </select>
        </div>
      </section>

      {/* Grid 3 colunas de Trilhas */}
      {filteredTracks.length === 0 ? (
        <div className="ce-surface" style={{ padding: 28, textAlign: "center", color: "var(--text-muted)" }}>
          Nenhuma trilha corresponde aos filtros selecionados.
        </div>
      ) : (
        <section data-tour="tracks-grid" className="ce-tracks-grid-3" aria-label="Catálogo de trilhas">
          {filteredTracks.map(track => {
            const tp = stats.perTrack[track.id];
            const challengeCount = CHALLENGES.filter(c => c.trackId === track.id).length;
            return (
              <SpotlightCard
                key={track.id}
                as="link"
                to={`/trilhas/${track.id}`}
                data-tour={track.id === "logic" ? "track-card-logic" : undefined}
                className="ce-track-card ce-card-interactive"
                spotlightColor={track.accentSoft}
                style={
                  {
                    "--item-soft": track.accentSoft,
                    "--item-border": track.accentBorder,
                  } as React.CSSProperties
                }
              >
                <div className="ce-track-card-top">
                  <TechIcon trackId={track.id} size={32} boxed />
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <span className="ce-badge">{track.category}</span>
                    {(tp.completedLessons > 0 || tp.completedChallenges > 0) && (
                      <span
                        className="ce-badge"
                        style={{
                          borderColor: track.accentBorder,
                          background: track.accentSoft,
                          color: track.accentSecondary,
                        }}
                      >
                        {tp.percent}%
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h2 style={{ fontSize: 19 }}>{track.name}</h2>
                  <p style={{ fontSize: 12.5, color: track.accentSecondary, fontWeight: 600, marginTop: 2 }}>
                    {track.level}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>
                    {track.description}
                  </p>
                </div>

                <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid var(--border-subtle)" }}>
                  <div className="ce-progress-track" style={{ height: 5, marginBottom: 10 }}>
                    <div
                      className="ce-progress-fill"
                      style={{ width: `${tp.percent}%`, background: track.accentColor }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span style={{ color: "var(--text-muted)" }}>
                      {tp.completedLessons}/{tp.totalLessons} aulas · {tp.completedChallenges}/{challengeCount} desafios
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700, color: track.accentSecondary }}>
                      <span>{tp.completedLessons > 0 || tp.completedChallenges > 0 ? "Continuar" : "Iniciar"}</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </section>
      )}
    </div>
  );
};
