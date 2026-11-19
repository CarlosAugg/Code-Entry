import React, { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Clock, Swords } from "lucide-react";
import { CHALLENGES } from "../data/challenges";
import { TRACK_MAP, TRACKS } from "../data/tracks";
import { usePlatform } from "../context/PlatformContext";
import type { TrackId } from "../types/curriculum";
import { AmbientAurora } from "../components/motion/AmbientAurora";
import { ShinyText } from "../components/motion/ShinyText";
import { SpotlightCard } from "../components/motion/SpotlightCard";
import { TechIcon } from "../components/shared/TechIcon";

export const ChallengesPage: React.FC = () => {
  const { data, stats } = usePlatform();
  const [trackFilter, setTrackFilter] = useState<"all" | TrackId>("all");
  const [diffFilter, setDiffFilter] = useState<string>("Todas");
  const [statusFilter, setStatusFilter] = useState<"Todos" | "Concluídos" | "Pendentes">("Todos");

  const filtered = useMemo(() => {
    return CHALLENGES.filter(ch => {
      const done = Boolean(data.challengeProgress[ch.id]?.completed);
      if (trackFilter !== "all" && ch.trackId !== trackFilter) return false;
      if (diffFilter !== "Todas" && ch.difficulty !== diffFilter) return false;
      if (statusFilter === "Concluídos" && !done) return false;
      if (statusFilter === "Pendentes" && done) return false;
      return true;
    });
  }, [data.challengeProgress, diffFilter, statusFilter, trackFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <section className="ce-hero-banner" style={{ gridTemplateColumns: "1fr auto" }}>
        <AmbientAurora />
        <div>
          <span className="ce-badge" style={{ borderColor: "var(--border-accent)", color: "var(--accent-secondary)" }}>
            <Swords size={12} />
            <ShinyText text="Arena de Prática Independente" />
          </span>
          <h1 className="ce-hero-title" style={{ marginTop: 10 }}>
            Desafios de Programação e Infraestrutura
          </h1>
          <p className="ce-hero-sub" style={{ marginBottom: 0 }}>
            Resolva problemas objetivos sem roteiro passo a passo e confira sua solução contra testes automáticos.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div className="ce-metric-tile" style={{ minWidth: 130 }}>
            <span>Concluídos</span>
            <strong style={{ color: "var(--accent-success)" }}>
              {stats.completedChallenges} / {stats.totalChallenges}
            </strong>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section
        className="ce-surface"
        style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            type="button"
            className={`ce-btn ce-btn-sm ${trackFilter === "all" ? "ce-btn-primary" : "ce-btn-ghost"}`}
            onClick={() => setTrackFilter("all")}
          >
            Todas ({CHALLENGES.length})
          </button>
          {TRACKS.map(t => (
            <button
              key={t.id}
              type="button"
              className={`ce-btn ce-btn-sm ${trackFilter === t.id ? "ce-btn-primary" : "ce-btn-ghost"}`}
              onClick={() => setTrackFilter(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            className="ce-select"
            style={{ height: 32, fontSize: 12.5 }}
            value={diffFilter}
            onChange={e => setDiffFilter(e.target.value)}
            aria-label="Filtrar por dificuldade"
          >
            <option value="Todas">Dificuldade: Todas</option>
            <option value="Fácil">Fácil</option>
            <option value="Intermediário">Intermediário</option>
            <option value="Difícil">Difícil</option>
            <option value="Avançado">Avançado</option>
          </select>

          <select
            className="ce-select"
            style={{ height: 32, fontSize: 12.5 }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            aria-label="Filtrar por status"
          >
            <option value="Todos">Status: Todos</option>
            <option value="Pendentes">Pendentes</option>
            <option value="Concluídos">Concluídos</option>
          </select>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="ce-surface" style={{ padding: 28, textAlign: "center", color: "var(--text-muted)" }}>
          Nenhum desafio encontrado para esses filtros.
        </div>
      ) : (
        <section data-tour="challenges-grid" className="ce-tracks-grid-3">
          {filtered.map(ch => {
            const track = TRACK_MAP[ch.trackId];
            const prog = data.challengeProgress[ch.id];
            const done = Boolean(prog?.completed);
            return (
              <SpotlightCard
                key={ch.id}
                as="link"
                to={`/desafios/${ch.id}`}
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
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <TechIcon trackId={ch.trackId} size={24} boxed />
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: track.accentSecondary }}>
                        {track.name} · {ch.topic}
                      </div>
                      <span className="ce-badge" style={{ marginTop: 3 }}>{ch.difficulty}</span>
                    </div>
                  </div>
                  {done ? (
                    <span className="ce-badge ce-badge-diff-easy">
                      <CheckCircle2 size={12} />
                      <span>Resolvido</span>
                    </span>
                  ) : (
                    <span className="ce-badge">+{ch.xp} XP</span>
                  )}
                </div>

                <div>
                  <h2 style={{ fontSize: 16 }}>{ch.title}</h2>
                  <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 5 }}>
                    {ch.summary}
                  </p>
                </div>

                <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Clock size={12} />
                    ~{ch.estimatedMinutes} min
                    {prog?.attempts ? ` · ${prog.attempts} tent.` : ""}
                  </span>
                  <span style={{ color: track.accentSecondary, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span>{done ? "Revisar" : "Resolver"}</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </SpotlightCard>
            );
          })}
        </section>
      )}
    </div>
  );
};
