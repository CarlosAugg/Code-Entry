import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  FolderKanban,
  History,
  Layers,
  Play,
  Sparkles,
} from "lucide-react";
import { ACHIEVEMENTS } from "../data/achievements";
import { ALL_LESSONS, LESSONS_BY_TRACK } from "../data/lessons";
import { TRACK_MAP, TRACKS } from "../data/tracks";
import { usePlatform } from "../context/PlatformContext";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { AmbientAurora, HERO_BANNER_SPEED_MULTIPLIER } from "../components/motion/AmbientAurora";
import { BlurText } from "../components/motion/BlurText";
import { ShinyText } from "../components/motion/ShinyText";
import { SpotlightCard } from "../components/motion/SpotlightCard";
import { ProgressRing } from "../components/shared/ProgressRing";
import { TechIcon } from "../components/shared/TechIcon";
import type { TrackId } from "../types/curriculum";

export const DashboardPage: React.FC = () => {
  const { data, stats } = usePlatform();
  const navigate = useNavigate();

  const animatedActivities = useAnimatedNumber(stats.completedActivities, 420);
  const animatedStreak = useAnimatedNumber(stats.streakDays, 380);
  const animatedStudyMinutes = useAnimatedNumber(stats.studyMinutes, 420);
  const animatedXp = useAnimatedNumber(stats.totalXp, 460);

  const hasStartedAny = stats.hasStartedAnyTrack;
  const customName =
    data.settings.displayName && data.settings.displayName !== "Estudante"
      ? data.settings.displayName
      : null;

  // Seleciona a aula recomendada: em progresso primeiro, depois próxima não concluída
  const recommendedLesson = useMemo(() => {
    const activeTrackLessons = LESSONS_BY_TRACK[data.settings.activeTrackId] || ALL_LESSONS;
    const inProgress =
      activeTrackLessons.find(l => {
        const p = data.lessonProgress[l.id];
        return Boolean(p && !p.completed && (p.attempts > 0 || p.objectivesDone.length > 0));
      }) ||
      ALL_LESSONS.find(l => {
        const p = data.lessonProgress[l.id];
        return Boolean(p && !p.completed && (p.attempts > 0 || p.objectivesDone.length > 0));
      });
    if (inProgress) return inProgress;

    const nextInActive = activeTrackLessons.find(l => !data.lessonProgress[l.id]?.completed);
    if (nextInActive) return nextInActive;
    const nextGlobal = ALL_LESSONS.find(l => !data.lessonProgress[l.id]?.completed);
    return nextGlobal || activeTrackLessons[0];
  }, [data.lessonProgress, data.settings.activeTrackId]);

  const recommendedTrack = TRACK_MAP[recommendedLesson.trackId];

  const featuredTracks = useMemo(() => {
    const pickedIds: TrackId[] = [];
    for (const id of stats.activeTracks) {
      if (!pickedIds.includes(id)) pickedIds.push(id);
    }
    const starterOrder: TrackId[] = ["logic", "web", "js", "python", "cpp", "database", "linux", "networks"];
    for (const id of starterOrder) {
      if (!pickedIds.includes(id) && TRACK_MAP[id]) pickedIds.push(id);
      if (pickedIds.length >= 4) break;
    }
    return pickedIds.slice(0, 4).map(id => TRACK_MAP[id]);
  }, [stats.activeTracks]);

  const highlightAchievement = useMemo(() => {
    const unlockedIds = Object.keys(data.achievements);
    if (unlockedIds.length > 0) {
      const latestId = unlockedIds[unlockedIds.length - 1];
      const def = ACHIEVEMENTS.find(a => a.id === latestId) || ACHIEVEMENTS[0];
      return { def, unlocked: true, evalState: def.evaluate(stats) };
    }
    const next = ACHIEVEMENTS[0];
    return { def: next, unlocked: false, evalState: next.evaluate(stats) };
  }, [data.achievements, stats]);

  const recentHistory = data.history.slice(0, 3);

  return (
    <div className="ce-dashboard-grid">
      {/* COLUNA PRINCIPAL */}
      <div className="ce-dash-main">
        {/* Hero Banner */}
        <section className="ce-hero-banner" data-tour="dashboard-hero" aria-label="Início">
          <AmbientAurora speed={HERO_BANNER_SPEED_MULTIPLIER} />
          <div>
            <span className="ce-badge" style={{ borderColor: "var(--border-accent)", color: "var(--accent-secondary)" }}>
              <Sparkles size={12} />
              <ShinyText text={customName ? `Olá, ${customName}` : "Prática interativa no navegador"} />
            </span>

            <h1 className="ce-hero-title">
              {hasStartedAny ? (
                <BlurText text="Retome sua jornada de estudos" highlight="jornada de estudos" />
              ) : (
                <BlurText text="Aprenda tecnologia praticando no navegador" highlight="praticando no navegador" />
              )}
            </h1>

            <p className="ce-hero-sub">
              {hasStartedAny
                ? "Retome de onde parou e continue avançando no seu ritmo."
                : "Pratique programação, redes, banco de dados e web direto no navegador."}
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                data-tour="dashboard-start-cta"
                className="ce-btn ce-btn-primary"
                onClick={() => navigate(`/trilhas/${recommendedLesson.trackId}/aula/${recommendedLesson.id}`)}
              >
                <Play size={14} fill="currentColor" />
                <span>{hasStartedAny ? "Continuar estudando" : "Começar primeira aula"}</span>
              </button>
              <button
                type="button"
                data-tour="dashboard-explore-tracks"
                className="ce-btn ce-btn-ghost"
                onClick={() => navigate(hasStartedAny ? "/projetos" : "/roadmaps")}
              >
                {hasStartedAny ? <FolderKanban size={14} /> : <Compass size={14} />}
                <span>{hasStartedAny ? "Ver Projetos" : "Explorar Roadmaps"}</span>
              </button>
            </div>
          </div>

          <div className="ce-hero-code-window" aria-hidden="true">
            <div className="ce-hero-window-dots">
              <div className="ce-window-dots-group">
                <span style={{ background: "#f87171" }} />
                <span style={{ background: "#fbbf24" }} />
                <span style={{ background: "#4ade80" }} />
              </div>
              <span>code-entry.ts</span>
            </div>
            <div>
              <span style={{ color: "#c084fc" }}>const</span>{" "}
              <span style={{ color: "#60a5fa" }}>trilha</span> ={" "}
              <span style={{ color: "#fbbf24" }}>"{recommendedTrack.name}"</span>;
            </div>
            <div>
              <span style={{ color: "#c084fc" }}>const</span>{" "}
              <span style={{ color: "#60a5fa" }}>concluidas</span> ={" "}
              <span style={{ color: "#fb923c" }}>{stats.completedActivities}</span>;
            </div>
            <div>
              <span style={{ color: "#c084fc" }}>const</span>{" "}
              <span style={{ color: "#60a5fa" }}>evolucao</span> ={" "}
              <span style={{ color: "#4ade80" }}>`{"${concluidas}"} / {stats.totalActivities} ({stats.overallPercent}%)`</span>;
            </div>
            <div style={{ color: "#64748b", marginTop: 6 }}>
              {`// ${hasStartedAny ? "Próximo passo" : "Ponto de partida"}: ${recommendedLesson.title}`}
            </div>
          </div>
        </section>

        {/* Barra de retomada (exibida após iniciar os estudos para evitar redundância com o Hero em 0%) */}
        {hasStartedAny && (
          <SpotlightCard
            starBorder
            className="ce-continue-strip"
            spotlightColor={recommendedTrack.accentSoft}
            style={
              {
                "--track-accent": recommendedTrack.accentColor,
                "--track-soft": recommendedTrack.accentSoft,
              } as React.CSSProperties
            }
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
              <TechIcon trackId={recommendedTrack.id} size={28} boxed />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span className="ce-badge" style={{ borderColor: recommendedTrack.accentBorder, color: recommendedTrack.accentSecondary }}>
                    Em foco · Aula {String(recommendedLesson.order).padStart(2, "0")} de {LESSONS_BY_TRACK[recommendedTrack.id].length}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{recommendedLesson.moduleTitle}</span>
                </div>
                <h2 style={{ fontSize: 17, marginTop: 4 }}>{recommendedLesson.title}</h2>
                <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                  {recommendedTrack.name} · {recommendedLesson.subtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="ce-btn ce-btn-primary"
              style={{ flexShrink: 0 }}
              onClick={() => navigate(`/trilhas/${recommendedLesson.trackId}/aula/${recommendedLesson.id}`)}
            >
              <span>Continuar aula</span>
              <ArrowRight size={15} />
            </button>
          </SpotlightCard>
        )}

        {/* Trilhas em destaque com capas ilustradas */}
        <section aria-label="Trilhas de estudo">
          <div className="ce-section-head">
            <div>
              <h2 className="ce-section-title">
                <Layers size={17} style={{ color: "var(--accent-secondary)" }} />
                <span>{hasStartedAny ? "Suas trilhas & sugestões" : "Trilhas para começar"}</span>
              </h2>
              <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                Cursos práticos guiados diretamente no navegador
              </span>
            </div>
            <Link to="/trilhas" className="ce-link-more">
              <span>Ver todas ({TRACKS.length})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="ce-dash-tracks-grid">
            {featuredTracks.map(track => {
              const tp = stats.perTrack[track.id];
              const isCompleted = tp.percent === 100;
              const isInProgress = tp.hasEffectiveStart && !isCompleted;
              const coverSrc = `${import.meta.env.BASE_URL}images/tracks/${track.id}.png`;
              return (
                <SpotlightCard
                  key={track.id}
                  as="link"
                  to={`/trilhas/${track.id}`}
                  className="ce-track-cover-card ce-card-interactive"
                  spotlightColor={track.accentSoft}
                  style={
                    {
                      "--item-soft": track.accentSoft,
                      "--item-border": track.accentBorder,
                      "--item-accent": track.accentSecondary,
                    } as React.CSSProperties
                  }
                >
                  <img
                    src={coverSrc}
                    alt=""
                    aria-hidden="true"
                    className="ce-track-cover-bg"
                    loading="lazy"
                  />
                  <div className="ce-track-cover-scrim" aria-hidden="true" />

                  <div className="ce-track-cover-content">
                    <div className="ce-track-cover-top">
                      <TechIcon trackId={track.id} size={36} boxed />
                      <span className="ce-track-cover-pill">
                        {isCompleted
                          ? "Concluída"
                          : isInProgress
                            ? `${tp.percent}%`
                            : `${tp.totalLessons} aulas`}
                      </span>
                    </div>

                    <div className="ce-track-cover-bottom">
                      <strong className="ce-track-cover-title">{track.name}</strong>
                      <div className="ce-track-cover-foot">
                        <p className="ce-track-cover-desc">{track.tagline}</p>
                        <span className="ce-track-cover-cta" style={{ color: track.accentSecondary }}>
                          <span>
                            {isCompleted
                              ? "Revisar"
                              : isInProgress
                                ? "Continuar"
                                : "Começar aula"}
                          </span>
                          <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </section>
      </div>

      {/* RAIL DIREITO — SUA JORNADA, ATIVIDADES RECENTES E CONQUISTAS */}
      <aside className="ce-dash-rail" aria-label="Resumo da jornada">
        <section className="ce-panel" data-tour="dashboard-journey">
          <div className="ce-section-head" style={{ marginBottom: 4 }}>
            <h2 className="ce-section-title" style={{ fontSize: 14.5 }}>Sua Jornada</h2>
          </div>

          <div className="ce-ring-row">
            <ProgressRing
              percent={stats.overallPercent}
              size={84}
              color="var(--accent-blue)"
              sublabel="geral"
            />
            <div>
              <strong style={{ fontSize: 17, display: "block" }}>
                {animatedActivities} de {stats.totalActivities}
              </strong>
              <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                {hasStartedAny ? "atividades concluídas" : "atividades disponíveis"}
              </span>
            </div>
          </div>

          <div className="ce-stat-rows">
            <div className="ce-stat-row">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Flame size={14} style={{ color: "#fb923c" }} />
                Sequência atual
              </span>
              <strong>
                {animatedStreak} {stats.streakDays === 1 ? "dia" : "dias"}
              </strong>
            </div>
            <div className="ce-stat-row">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Clock size={14} style={{ color: "var(--accent-blue)" }} />
                Tempo total de estudo
              </span>
              <strong>{animatedStudyMinutes} min</strong>
            </div>
            <div className="ce-stat-row">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={14} style={{ color: "var(--accent-secondary)" }} />
                Experiência
              </span>
              <strong>{animatedXp} XP</strong>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 12,
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Ritmo diário sugerido</span>
              <strong style={{ color: stats.dailyGoalPercent >= 100 ? "#4ade80" : "var(--text-primary)" }}>
                {stats.todayStudyMinutes} / {data.settings.dailyGoalMinutes} min
              </strong>
            </div>
            <div className="ce-progress-track" style={{ height: 5 }}>
              <div
                className="ce-progress-fill"
                style={{
                  width: `${stats.dailyGoalPercent}%`,
                  background: stats.dailyGoalPercent >= 100 ? "#22c55e" : "linear-gradient(90deg, var(--accent-primary), var(--accent-blue))",
                }}
              />
            </div>
            {stats.dailyGoalPercent >= 100 && (
              <span style={{ fontSize: 11, color: "var(--accent-success)" }}>
                Meta de hoje alcançada!
              </span>
            )}
          </div>
        </section>

        {recentHistory.length > 0 && (
          <section className="ce-panel">
            <div className="ce-section-head" style={{ marginBottom: 4 }}>
              <h2 className="ce-section-title" style={{ fontSize: 14.5 }}>
                <History size={15} style={{ color: "var(--accent-secondary)" }} />
                <span>Atividades recentes</span>
              </h2>
              <Link to="/historico" className="ce-link-more">
                <span>Ver histórico</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="ce-activity-list">
              {recentHistory.map(item => {
                const track = item.trackId ? TRACK_MAP[item.trackId] : null;
                return (
                  <div key={item.id} className="ce-activity-item">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      {track && <TechIcon trackId={track.id} size={20} />}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {item.detail || (item.status === "success" ? "Concluído" : "Prática")}
                        </div>
                      </div>
                    </div>
                    {item.status === "success" && (
                      <CheckCircle2 size={15} style={{ color: "var(--accent-success)", flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="ce-panel">
          <div className="ce-section-head" style={{ marginBottom: 4 }}>
            <h2 className="ce-section-title" style={{ fontSize: 14.5 }}>
              <Award size={15} style={{ color: "#FACC15" }} />
              <span>Conquistas</span>
            </h2>
            <Link to="/conquistas" className="ce-link-more">
              <span>Ver todas</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div
            style={{
              marginTop: 10,
              padding: 12,
              borderRadius: 12,
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <strong style={{ fontSize: 13 }}>{highlightAchievement.def.title}</strong>
              <span className="ce-badge" style={{ color: highlightAchievement.unlocked ? "#4ade80" : "var(--text-muted)" }}>
                {highlightAchievement.unlocked
                  ? "Desbloqueada"
                  : `${highlightAchievement.evalState.current}/${highlightAchievement.evalState.target}`}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {highlightAchievement.def.description}
            </p>
            <div className="ce-progress-track" style={{ height: 5 }}>
              <div
                className="ce-progress-fill"
                style={{
                  width: `${Math.round(
                    (highlightAchievement.evalState.current / highlightAchievement.evalState.target) * 100
                  )}%`,
                  background: highlightAchievement.def.accentColor,
                }}
              />
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
};
