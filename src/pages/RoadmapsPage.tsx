import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Compass,
  FlaskConical,
  GitBranch,
  Layers,
  Map as MapIcon,
  Play,
  Swords,
} from "lucide-react";
import { CHALLENGES } from "../data/challenges";
import { LESSONS_BY_TRACK } from "../data/lessons";
import { TRACK_MAP, TRACKS } from "../data/tracks";
import { usePlatform } from "../context/PlatformContext";
import type { TrackId } from "../types/curriculum";
import { AmbientAurora } from "../components/motion/AmbientAurora";
import { ShinyText } from "../components/motion/ShinyText";
import { SpotlightCard } from "../components/motion/SpotlightCard";
import { ProgressRing } from "../components/shared/ProgressRing";
import { TechIcon } from "../components/shared/TechIcon";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { motion } from "motion/react";

type FocusPreset = "all" | "programming" | "infra";

const FOCUS_TRACKS: Record<FocusPreset, TrackId[]> = {
  all: ["logic", "cpp", "js", "python", "linux", "networks", "database"],
  programming: ["logic", "js", "python", "cpp", "database"],
  infra: ["logic", "linux", "networks", "database", "python"],
};

const STAGES: { id: string; step: string; title: string; subtitle: string; tracks: TrackId[] }[] = [
  {
    id: "stage-1",
    step: "Etapa 01",
    title: "Base Algorítmica Universal",
    subtitle: "Aprenda a estruturar pensamento lógico antes de escolher uma sintaxe específica.",
    tracks: ["logic"],
  },
  {
    id: "stage-2",
    step: "Etapa 02",
    title: "Linguagens e Sistema Operacional",
    subtitle: "Escolha uma ou mais linguagens principais e ganhe autonomia na linha de comando.",
    tracks: ["js", "python", "cpp", "linux"],
  },
  {
    id: "stage-3",
    step: "Etapa 03",
    title: "Banco de Dados e Redes",
    subtitle: "Conecte aplicações a dados estruturados e entenda como a informação trafega em rede.",
    tracks: ["database", "networks"],
  },
];

export const RoadmapsPage: React.FC = () => {
  const { data, stats } = usePlatform();
  const navigate = useNavigate();
  const [focus, setFocus] = useState<FocusPreset>("all");
  const [selectedId, setSelectedId] = useState<TrackId>(data.settings.activeTrackId || "logic");

  const animatedCompleted = useAnimatedNumber(stats.completedLessons, 420);
  const animatedXp = useAnimatedNumber(stats.totalXp, 460);

  const focusedSet = useMemo(() => new Set(FOCUS_TRACKS[focus]), [focus]);
  const selectedTrack = TRACK_MAP[selectedId] || TRACKS[0];
  const selectedStats = stats.perTrack[selectedTrack.id];
  const selectedLessons = LESSONS_BY_TRACK[selectedTrack.id] || [];
  const nextLesson =
    selectedLessons.find(l => !data.lessonProgress[l.id]?.completed) || selectedLessons[0];

  const selectedModules = useMemo(() => {
    const grouped = new Map<string, { id: string; title: string; total: number; done: number }>();
    for (const l of selectedLessons) {
      if (!grouped.has(l.moduleId)) {
        grouped.set(l.moduleId, { id: l.moduleId, title: l.moduleTitle, total: 0, done: 0 });
      }
      const entry = grouped.get(l.moduleId)!;
      entry.total += 1;
      if (data.lessonProgress[l.id]?.completed) entry.done += 1;
    }
    return Array.from(grouped.values());
  }, [data.lessonProgress, selectedLessons]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Hero Roadmaps */}
      <section className="ce-hero-banner" style={{ gridTemplateColumns: "1fr auto" }}>
        <AmbientAurora />
        <div>
          <span
            className="ce-badge"
            style={{ borderColor: "var(--border-accent)", color: "var(--accent-secondary)" }}
          >
            <MapIcon size={12} />
            <ShinyText text="Arquitetura de Estudos" />
          </span>
          <h1 className="ce-hero-title" style={{ marginTop: 10 }}>
            Roadmaps e Progressão entre Trilhas
          </h1>
          <p className="ce-hero-sub" style={{ marginBottom: 0 }}>
            Visualize como os conceitos se conectam no Code Entry, consulte pré-requisitos reais e planeje seu próximo passo com clareza. Todas as trilhas ficam livres para você estudar no seu ritmo.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="ce-metric-tile" style={{ minWidth: 125 }}>
            <span>Aulas concluídas</span>
            <strong>
              {animatedCompleted} / {stats.totalLessons}
            </strong>
          </div>
          <div className="ce-metric-tile" style={{ minWidth: 125 }}>
            <span>Trilhas concluídas</span>
            <strong style={{ color: "var(--accent-success)" }}>
              {stats.completedTracks.length} / {TRACKS.length}
            </strong>
          </div>
          <div className="ce-metric-tile" style={{ minWidth: 125 }}>
            <span>XP total</span>
            <strong style={{ color: "var(--accent-secondary)" }}>{animatedXp} XP</strong>
          </div>
        </div>
      </section>

      {/* Filtro de Foco de Carreira */}
      <section
        className="ce-surface"
        style={{
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", marginRight: 4 }}>
            Destacar percurso:
          </span>
          {(
            [
              { id: "all" as const, label: "Visão Completa (7 trilhas)", icon: Layers },
              { id: "programming" as const, label: "Programação & Dados", icon: GitBranch },
              { id: "infra" as const, label: "Sistemas, Redes & SQL", icon: Compass },
            ] as const
          ).map(preset => {
            const Icon = preset.icon;
            const active = focus === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={`ce-btn ce-btn-sm ${active ? "ce-btn-primary" : "ce-btn-ghost"}`}
                style={{ position: "relative" }}
                onClick={() => setFocus(preset.id)}
              >
                {active && (
                  <motion.span
                    layoutId="ce-roadmap-focus-pill"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 10,
                      background: "var(--gradient-primary)",
                      zIndex: 0,
                    }}
                    aria-hidden="true"
                  />
                )}
                <Icon size={13} style={{ position: "relative", zIndex: 1 }} />
                <span style={{ position: "relative", zIndex: 1 }}>{preset.label}</span>
              </button>
            );
          })}
        </div>

        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Clique em qualquer nó para inspecionar módulos e recomendações
        </span>
      </section>

      {/* Mapa Visual de Etapas */}
      <section data-tour="roadmaps-graph" className="ce-roadmap-board" aria-label="Mapa de progressão por etapas">
        {STAGES.map((stage, stageIdx) => (
          <React.Fragment key={stage.id}>
            <div className="ce-roadmap-stage">
              <div className="ce-roadmap-stage-head">
                <div>
                  <span className="ce-badge" style={{ borderColor: "var(--border-accent)", color: "var(--accent-secondary)" }}>
                    {stage.step}
                  </span>
                  <h2 style={{ fontSize: 16, marginTop: 6 }}>{stage.title}</h2>
                </div>
                <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: 0 }}>{stage.subtitle}</p>
              </div>

              <div className="ce-roadmap-nodes">
                {stage.tracks.map(tId => {
                  const track = TRACK_MAP[tId];
                  const tp = stats.perTrack[tId];
                  const isHighlighted = focusedSet.has(tId);
                  const isSelected = selectedId === tId;
                  const isDone = tp.totalLessons > 0 && tp.completedLessons === tp.totalLessons;

                  return (
                    <SpotlightCard
                      key={tId}
                      as="button"
                      onClick={() => setSelectedId(tId)}
                      spotlightColor={track.accentSoft}
                      className={`ce-roadmap-node ce-card-interactive ${isSelected ? "is-selected" : ""} ${
                        !isHighlighted ? "is-dimmed" : ""
                      }`}
                      style={
                        {
                          "--item-soft": track.accentSoft,
                          "--item-border": track.accentBorder,
                          "--item-accent": track.accentColor,
                        } as React.CSSProperties
                      }
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <TechIcon trackId={track.id} size={24} boxed />
                          <div style={{ textAlign: "left", minWidth: 0 }}>
                            <strong style={{ fontSize: 14.5, display: "block", color: "var(--text-primary)" }}>
                              {track.name}
                            </strong>
                            <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{track.category}</span>
                          </div>
                        </div>
                        {isDone ? (
                          <span className="ce-badge ce-badge-diff-easy">
                            <CheckCircle2 size={12} />
                            <span>100%</span>
                          </span>
                        ) : (
                          <span className="ce-badge" style={{ color: track.accentSecondary, borderColor: track.accentBorder }}>
                            {tp.percent}%
                          </span>
                        )}
                      </div>

                      <div className="ce-progress-track" style={{ height: 5 }}>
                        <div
                          className="ce-progress-fill"
                          style={{ width: `${tp.percent}%`, background: track.accentColor }}
                        />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5, color: "var(--text-secondary)" }}>
                        <span>
                          {tp.completedLessons}/{tp.totalLessons} aulas · {tp.completedChallenges}/{tp.totalChallenges} desafios
                        </span>
                        <span style={{ color: track.accentSecondary, fontWeight: 600 }}>
                          {isSelected ? "Em inspeção" : "Ver detalhes"}
                        </span>
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            </div>

            {stageIdx < STAGES.length - 1 && (
              <div className="ce-roadmap-connector" aria-hidden="true">
                <ArrowDown size={18} />
                <span>evolui para</span>
              </div>
            )}
          </React.Fragment>
        ))}

        {/* Etapa 4 — Consolidação Prática */}
        <div className="ce-roadmap-connector" aria-hidden="true">
          <ArrowDown size={18} />
          <span>consolida em</span>
        </div>

        <div className="ce-roadmap-stage is-consolidation">
          <div className="ce-roadmap-stage-head">
            <div>
              <span className="ce-badge" style={{ borderColor: "rgba(34,197,94,0.4)", color: "#4ade80" }}>
                Etapa 04
              </span>
              <h2 style={{ fontSize: 16, marginTop: 6 }}>Consolidação Prática &amp; Autonomia</h2>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: 0 }}>
              Aplique o conhecimento combinado em desafios avaliados sem roteiro e experimentos livres.
            </p>
          </div>

          <div className="ce-roadmap-consolidation-grid">
            <SpotlightCard as="link" to="/desafios" className="ce-roadmap-node ce-card-interactive" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="ce-brand-mark" style={{ width: 34, height: 34, borderRadius: 10 }}>
                    <Swords size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: 14.5, color: "var(--text-primary)", display: "block" }}>
                      Desafios Independentes
                    </strong>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {stats.completedChallenges} de {CHALLENGES.length} superados
                    </span>
                  </div>
                </div>
                <ArrowRight size={15} style={{ color: "var(--accent-secondary)" }} />
              </div>
            </SpotlightCard>

            <SpotlightCard as="link" to="/laboratorios" className="ce-roadmap-node ce-card-interactive" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="ce-brand-mark" style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>
                    <FlaskConical size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: 14.5, color: "var(--text-primary)", display: "block" }}>
                      Laboratórios Interativos
                    </strong>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      7 ambientes abertos (Portugol, JS, Python, C++, Linux, SQL e Redes)
                    </span>
                  </div>
                </div>
                <ArrowRight size={15} style={{ color: "var(--accent-secondary)" }} />
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Painel de Inspeção da Trilha Selecionada */}
      <section
        className="ce-panel"
        style={
          {
            "--track-accent": selectedTrack.accentColor,
            "--track-secondary": selectedTrack.accentSecondary,
            "--track-soft": selectedTrack.accentSoft,
            "--track-border": selectedTrack.accentBorder,
          } as React.CSSProperties
        }
        aria-label={`Detalhes do roadmap de ${selectedTrack.name}`}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <TechIcon trackId={selectedTrack.id} size={36} boxed />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h2 style={{ fontSize: 20 }}>{selectedTrack.name}</h2>
                <span className="ce-badge" style={{ borderColor: selectedTrack.accentBorder, color: selectedTrack.accentSecondary }}>
                  {selectedTrack.level}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{selectedTrack.description}</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <ProgressRing
              percent={selectedStats.percent}
              size={64}
              strokeWidth={6}
              color={selectedTrack.accentColor}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {nextLesson && (
                <button
                  type="button"
                  className={`ce-btn ce-btn-track ce-btn-sm ${selectedTrack.darkTextOnAccent ? "is-dark-text" : ""}`}
                  onClick={() => navigate(`/trilhas/${selectedTrack.id}/aula/${nextLesson.id}`)}
                >
                  <Play size={13} fill="currentColor" />
                  <span>{selectedStats.completedLessons > 0 ? "Continuar aula" : "Iniciar aula 01"}</span>
                </button>
              )}
              <Link to={`/trilhas/${selectedTrack.id}`} className="ce-btn ce-btn-ghost ce-btn-sm">
                <span>Abrir trilha</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        <div className="ce-roadmap-detail-grid">
          <div>
            <strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Pré-requisitos recomendados</strong>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-secondary)", fontSize: 13, display: "flex", flexDirection: "column", gap: 5 }}>
              {(selectedTrack.prerequisites || ["Nenhum pré-requisito obrigatório"]).map(p => (
                <li key={p}>{p}</li>
              ))}
            </ul>

            <strong style={{ fontSize: 13, display: "block", marginTop: 16, marginBottom: 8 }}>
              Próximas conexões sugeridas
            </strong>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(selectedTrack.recommendedNext || []).map(nextId => {
                const nt = TRACK_MAP[nextId];
                if (!nt) return null;
                return (
                  <button
                    key={nextId}
                    type="button"
                    className="ce-btn ce-btn-ghost ce-btn-sm"
                    style={{ borderColor: nt.accentBorder }}
                    onClick={() => setSelectedId(nextId)}
                  >
                    <TechIcon trackId={nextId} size={15} />
                    <span>{nt.name}</span>
                    <ArrowRight size={12} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
              Módulos de {selectedTrack.name} ({selectedModules.length})
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {selectedModules.map(mod => {
                const pct = mod.total > 0 ? Math.round((mod.done / mod.total) * 100) : 0;
                return (
                  <div key={mod.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                      <span>{mod.title}</span>
                      <strong>
                        {mod.done}/{mod.total} ({pct}%)
                      </strong>
                    </div>
                    <div className="ce-progress-track" style={{ height: 5 }}>
                      <div
                        className="ce-progress-fill"
                        style={{ width: `${pct}%`, background: selectedTrack.accentColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
