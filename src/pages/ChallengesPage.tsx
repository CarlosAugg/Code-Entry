import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Swords,
} from "lucide-react";
import { CHALLENGES } from "../data/challenges";
import { TRACK_MAP, TRACKS } from "../data/tracks";
import { usePlatform } from "../context/PlatformContext";
import type { TrackId } from "../types/curriculum";
import { AmbientAurora } from "../components/motion/AmbientAurora";
import { ShinyText } from "../components/motion/ShinyText";
import { SpotlightCard } from "../components/motion/SpotlightCard";
import { TechIcon } from "../components/shared/TechIcon";
import { HeroIllustration } from "../components/shared/HeroIllustration";

const TRAIL_TOP_OFFSETS = [26, 146, 206, 122];
const TRAIL_COL_WIDTH = 256;
const TRAIL_CARD_WIDTH = 222;
const TRAIL_CANVAS_HEIGHT = 382;

export const ChallengesPage: React.FC = () => {
  const { data, stats } = usePlatform();
  const [trackFilter, setTrackFilter] = useState<"all" | TrackId>("all");
  const [diffFilter, setDiffFilter] = useState<string>("Todas");
  const [statusFilter, setStatusFilter] = useState<"Todos" | "Concluídos" | "Pendentes">("Todos");
  const scrollerRef = useRef<HTMLDivElement | null>(null);

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

  // Converte rolagem vertical do mouse em rolagem horizontal dentro da trilha
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
      const canScrollLeft = el.scrollLeft > 1;
      if ((e.deltaY > 0 && canScrollRight) || (e.deltaY < 0 && canScrollLeft)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [filtered.length]);

  const trailWidth = Math.max(720, filtered.length * TRAIL_COL_WIDTH + 52);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <section className="ce-hero-banner ce-hero-with-art">
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

        <div className="ce-hero-right-cluster">
          <div className="ce-hero-art-slot" aria-hidden="true">
            <HeroIllustration variant="challenges" />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div className="ce-metric-tile" style={{ minWidth: 130 }}>
              <span>Concluídos</span>
              <strong style={{ color: "var(--accent-success)" }}>
                {stats.completedChallenges} / {stats.totalChallenges}
              </strong>
            </div>
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

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
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
        <section
          data-tour="challenges-grid"
          ref={scrollerRef}
          className="ce-surface ce-hscroll-trail"
          aria-label="Trilha horizontal de desafios"
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            paddingBottom: 6,
            background:
              "radial-gradient(circle at 12% 50%, rgba(99, 102, 241, 0.08), transparent 45%), radial-gradient(circle at 88% 50%, rgba(16, 185, 129, 0.08), transparent 45%), var(--bg-surface)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: trailWidth,
              height: TRAIL_CANVAS_HEIGHT,
            }}
          >
            {/* Caminho sinuoso horizontal */}
            <svg
              viewBox={`0 0 ${trailWidth} ${TRAIL_CANVAS_HEIGHT}`}
              style={{
                position: "absolute",
                inset: 0,
                width: trailWidth,
                height: TRAIL_CANVAS_HEIGHT,
                pointerEvents: "none",
                zIndex: 0,
              }}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="ce-ch-trail-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {filtered.map((_, idx) => {
                if (idx === filtered.length - 1) return null;
                const x1 = 26 + idx * TRAIL_COL_WIDTH + TRAIL_CARD_WIDTH / 2;
                const y1 = TRAIL_TOP_OFFSETS[idx % TRAIL_TOP_OFFSETS.length] + 74;
                const x2 = 26 + (idx + 1) * TRAIL_COL_WIDTH + TRAIL_CARD_WIDTH / 2;
                const y2 = TRAIL_TOP_OFFSETS[(idx + 1) % TRAIL_TOP_OFFSETS.length] + 74;
                const midX = (x1 + x2) / 2;

                return (
                  <path
                    key={`ch-seg-${idx}`}
                    d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke="url(#ce-ch-trail-grad)"
                    strokeWidth="4"
                    strokeOpacity="0.45"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>

            {filtered.map((ch, idx) => {
              const track = TRACK_MAP[ch.trackId];
              const prog = data.challengeProgress[ch.id];
              const done = Boolean(prog?.completed);
              const left = 26 + idx * TRAIL_COL_WIDTH;
              const top = TRAIL_TOP_OFFSETS[idx % TRAIL_TOP_OFFSETS.length];
              const stepLabel = String(idx + 1).padStart(2, "0");

              return (
                <SpotlightCard
                  key={ch.id}
                  as="link"
                  to={`/desafios/${ch.id}`}
                  className="ce-track-card ce-card-interactive"
                  spotlightColor={track.accentSoft}
                  style={
                    {
                      position: "absolute",
                      left,
                      top,
                      width: TRAIL_CARD_WIDTH,
                      minHeight: 148,
                      padding: "12px 13px",
                      gap: 8,
                      zIndex: 2,
                      "--item-soft": track.accentSoft,
                      "--item-border": track.accentBorder,
                    } as React.CSSProperties
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: done ? "rgba(34, 197, 94, 0.2)" : "var(--accent-soft)",
                          border: `1.5px solid ${done ? "var(--accent-success)" : "var(--border-accent)"}`,
                          color: done ? "var(--accent-success)" : "var(--accent-secondary)",
                          fontSize: 10,
                          fontWeight: 800,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {stepLabel}
                      </span>
                      <TechIcon trackId={ch.trackId} size={18} boxed />
                    </div>

                    {done ? (
                      <span className="ce-badge ce-badge-diff-easy" style={{ flexShrink: 0, fontSize: 10.5 }}>
                        <CheckCircle2 size={10} />
                        <span>Feito</span>
                      </span>
                    ) : (
                      <span className="ce-badge" style={{ flexShrink: 0, fontSize: 10.5 }}>
                        +{ch.xp} XP
                      </span>
                    )}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: track.accentSecondary,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {track.name} · {ch.difficulty}
                    </div>
                    <h2
                      style={{
                        fontSize: 13.5,
                        margin: "3px 0 0",
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {ch.title}
                    </h2>
                  </div>

                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: 7,
                      borderTop: "1px solid var(--border-subtle)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 11,
                    }}
                  >
                    <span style={{ color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Clock size={10.5} />
                      ~{ch.estimatedMinutes} min
                    </span>
                    <span style={{ color: track.accentSecondary, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <span>{done ? "Revisar" : "Resolver"}</span>
                      <ArrowRight size={11} />
                    </span>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
