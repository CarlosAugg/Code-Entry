import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
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

export const DashboardPage: React.FC = () => {
  const { data, stats } = usePlatform();
  const navigate = useNavigate();

  const animatedActivities = useAnimatedNumber(stats.completedActivities, 420);
  const animatedStreak = useAnimatedNumber(stats.streakDays, 380);
  const animatedStudyMinutes = useAnimatedNumber(stats.studyMinutes, 420);
  const animatedXp = useAnimatedNumber(stats.totalXp, 460);

  // Seleciona próxima aula recomendada a partir da trilha ativa e progresso real
  const continueLesson = useMemo(() => {
    const activeTrackLessons = LESSONS_BY_TRACK[data.settings.activeTrackId] || ALL_LESSONS;
    const nextInActive = activeTrackLessons.find(l => !data.lessonProgress[l.id]?.completed);
    if (nextInActive) return nextInActive;
    const nextGlobal = ALL_LESSONS.find(l => !data.lessonProgress[l.id]?.completed);
    return nextGlobal || activeTrackLessons[0];
  }, [data.lessonProgress, data.settings.activeTrackId]);

  const continueTrack = TRACK_MAP[continueLesson.trackId];

  const featuredStripTracks = useMemo(() => {
    const pickedIds: string[] = [];
    for (const id of stats.startedTracks) {
      if (!pickedIds.includes(id)) pickedIds.push(id);
    }
    for (const t of TRACKS) {
      if (!pickedIds.includes(t.id)) pickedIds.push(t.id);
      if (pickedIds.length >= 4) break;
    }
    return pickedIds.slice(0, 4).map(id => TRACK_MAP[id as keyof typeof TRACK_MAP]);
  }, [stats.startedTracks]);

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
        <section className="ce-hero-banner" aria-label="Boas-vindas">
          <AmbientAurora speed={HERO_BANNER_SPEED_MULTIPLIER} />
          <div>
            <span className="ce-badge" style={{ borderColor: "var(--border-accent)", color: "var(--accent-secondary)" }}>
              <Sparkles size={12} />
              <ShinyText text={`Bem-vindo(a), ${data.settings.displayName}`} />
            </span>

            <h1 className="ce-hero-title">
              {stats.completedActivities === 0 ? (
                <BlurText
                  text="Sua jornada no Code Entry começa aqui"
                  highlight="Code Entry"
                />
              ) : (
                <BlurText
                  text={`Continue sua jornada, ${data.settings.displayName}`}
                  highlight={data.settings.displayName}
                />
              )}
            </h1>

            <p className="ce-hero-sub">
              Aprenda programação, Linux, redes e bancos de dados com explicações claras, prática imediata e objetivos fáceis de acompanhar.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="ce-btn ce-btn-primary"
                onClick={() => navigate(`/trilhas/${continueLesson.trackId}/aula/${continueLesson.id}`)}
              >
                <Play size={14} fill="currentColor" />
                <span>{stats.completedActivities === 0 ? "Começar primeira aula" : "Continuar estudando"}</span>
              </button>
              <button
                type="button"
                data-tour="dashboard-explore-tracks"
                className="ce-btn ce-btn-ghost"
                onClick={() => navigate("/trilhas")}
              >
                <Compass size={14} />
                <span>Explorar trilhas</span>
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
              <span style={{ color: "#fbbf24" }}>"{continueTrack.name}"</span>;
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
              {"// Próximo passo: "}{continueLesson.title}
            </div>
          </div>
        </section>

        {/* Faixa compacta de progresso por tecnologia */}
        <section aria-label="Resumo rápido das trilhas">
          <div className="ce-mini-track-strip">
            {featuredStripTracks.map(track => {
              const tp = stats.perTrack[track.id];
              const doneTotal = tp.completedLessons + tp.completedChallenges;
              const allTotal = tp.totalLessons + tp.totalChallenges;
              return (
                <SpotlightCard
                  key={track.id}
                  as="link"
                  to={`/trilhas/${track.id}`}
                  className="ce-mini-track-item ce-card-interactive"
                  spotlightColor={track.accentSoft}
                  style={
                    {
                      "--item-border": track.accentBorder,
                    } as React.CSSProperties
                  }
                >
                  <TechIcon trackId={track.id} size={22} boxed />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <strong style={{ fontSize: 13 }}>{track.name}</strong>
                      <span style={{ fontSize: 12, fontWeight: 700, color: track.accentSecondary }}>
                        {tp.percent}%
                      </span>
                    </div>
                    <div className="ce-progress-track" style={{ marginTop: 6, height: 5 }}>
                      <div
                        className="ce-progress-fill"
                        style={{ width: `${tp.percent}%`, background: track.accentColor }}
                      />
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      {doneTotal} / {allTotal} atividades
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </section>

        {/* Barra horizontal Continue estudando */}
        <SpotlightCard
          starBorder
          className="ce-continue-strip"
          spotlightColor={continueTrack.accentSoft}
          style={
            {
              "--track-accent": continueTrack.accentColor,
              "--track-soft": continueTrack.accentSoft,
            } as React.CSSProperties
          }
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <TechIcon trackId={continueTrack.id} size={28} boxed />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span className="ce-badge" style={{ borderColor: continueTrack.accentBorder, color: continueTrack.accentSecondary }}>
                  Aula {String(continueLesson.order).padStart(2, "0")} de {LESSONS_BY_TRACK[continueTrack.id].length}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{continueLesson.moduleTitle}</span>
              </div>
              <h2 style={{ fontSize: 17, marginTop: 4 }}>{continueLesson.title}</h2>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                {continueTrack.name} · {continueLesson.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="ce-btn ce-btn-primary"
            style={{ flexShrink: 0 }}
            onClick={() => navigate(`/trilhas/${continueLesson.trackId}/aula/${continueLesson.id}`)}
          >
            <span>Continuar</span>
            <ArrowRight size={15} />
          </button>
        </SpotlightCard>

        {/* Grade de Trilhas disponíveis */}
        <section aria-label="Trilhas disponíveis">
          <div className="ce-section-head">
            <h2 className="ce-section-title">
              <Layers size={17} style={{ color: "var(--accent-secondary)" }} />
              <span>Trilhas disponíveis</span>
            </h2>
            <Link to="/trilhas" className="ce-link-more">
              <span>Ver todas ({TRACKS.length})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="ce-tracks-grid-4">
            {TRACKS.slice(0, 4).map(track => {
              const tp = stats.perTrack[track.id];
              const hasStarted = tp.completedLessons > 0 || tp.completedChallenges > 0;
              return (
                <SpotlightCard
                  key={track.id}
                  as="link"
                  to={`/trilhas/${track.id}`}
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
                    <TechIcon trackId={track.id} size={26} boxed />
                    <span className="ce-badge" style={{ fontSize: 11 }}>
                      {hasStarted ? `${tp.percent}%` : `${tp.totalLessons} aulas`}
                    </span>
                  </div>
                  <div>
                    <strong style={{ fontSize: 15, display: "block" }}>{track.name}</strong>
                    <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4 }}>
                      {track.tagline}
                    </p>
                  </div>
                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: track.accentSecondary, fontWeight: 600 }}>
                    <span>{hasStarted ? "Continuar trilha" : "Explorar trilha"}</span>
                    <ArrowRight size={14} />
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
                atividades concluídas
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
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {stats.dailyGoalPercent >= 100
                ? "Objetivo de hoje alcançado — excelente ritmo!"
                : "Estude no seu ritmo. A meta é apenas uma referência pessoal."}
            </span>
          </div>
        </section>

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

          {recentHistory.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 10 }}>
              Nenhuma atividade registrada ainda. Execute sua primeira aula ou desafio para construir seu histórico real.
            </p>
          ) : (
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
          )}
        </section>

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
