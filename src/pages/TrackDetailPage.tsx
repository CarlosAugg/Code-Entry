import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Map as MapIcon,
  Play,
  Swords,
} from "lucide-react";
import { CHALLENGES } from "../data/challenges";
import { LESSONS_BY_TRACK } from "../data/lessons";
import { getRoadmapsForTrack } from "../data/roadmaps";
import { TRACK_MAP } from "../data/tracks";
import { usePlatform } from "../context/PlatformContext";
import type { Lesson, TrackId } from "../types/curriculum";
import { AmbientAurora } from "../components/motion/AmbientAurora";
import { ShinyText } from "../components/motion/ShinyText";
import { ProgressRing } from "../components/shared/ProgressRing";
import { TechIcon } from "../components/shared/TechIcon";

export const TrackDetailPage: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const { data, stats } = usePlatform();

  const resolvedId = (trackId && trackId in TRACK_MAP ? trackId : "js") as TrackId;
  const track = TRACK_MAP[resolvedId];
  const lessons = LESSONS_BY_TRACK[resolvedId] || [];
  const tp = stats.perTrack[resolvedId];
  const trackChallenges = CHALLENGES.filter(c => c.trackId === resolvedId);

  const modules = useMemo(() => {
    const grouped = new Map<string, { id: string; title: string; items: Lesson[] }>();
    for (const l of lessons) {
      if (!grouped.has(l.moduleId)) {
        grouped.set(l.moduleId, { id: l.moduleId, title: l.moduleTitle, items: [] });
      }
      grouped.get(l.moduleId)!.items.push(l);
    }
    return Array.from(grouped.values());
  }, [lessons]);

  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const isModuleOpen = (id: string) => openModules[id] ?? true;

  const nextLesson = lessons.find(l => !data.lessonProgress[l.id]?.completed) || lessons[0];
  const totalEstimatedMins = lessons.reduce((acc, l) => acc + l.estimatedMinutes, 0);

  return (
    <div
      style={
        {
          "--track-accent": track.accentColor,
          "--track-secondary": track.accentSecondary,
          "--track-soft": track.accentSoft,
          "--track-border": track.accentBorder,
          "--track-glow": track.accentGlow,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        } as React.CSSProperties
      }
    >
      <div>
        <Link
          to="/trilhas"
          className="ce-link-more"
          style={{ color: "var(--text-secondary)", marginBottom: 10 }}
        >
          <ArrowLeft size={14} />
          <span>Voltar para todas as trilhas</span>
        </Link>

        {/* Hero da Trilha */}
        <section className="ce-track-hero">
          <AmbientAurora accentColor={track.accentColor} secondaryColor={track.accentSecondary} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, maxWidth: 680 }}>
            <TechIcon trackId={track.id} size={42} boxed />
            <div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                <span className="ce-badge" style={{ borderColor: track.accentBorder, color: track.accentSecondary }}>
                  <ShinyText text={track.category} />
                </span>
                <span className="ce-badge">{track.level}</span>
              </div>
              <h1 style={{ fontSize: 28 }}>{track.name}</h1>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 6 }}>
                {track.description}
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                <button
                  type="button"
                  data-tour="track-start-lesson"
                  className={`ce-btn ce-btn-track ${track.darkTextOnAccent ? "is-dark-text" : ""}`}
                  onClick={() => navigate(`/trilhas/${track.id}/aula/${nextLesson.id}`)}
                >
                  <Play size={14} fill="currentColor" />
                  <span>
                    {tp.completedLessons > 0 ? `Continuar: ${nextLesson.title}` : `Iniciar Aula 01`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="ce-track-hero-panel">
            <ProgressRing
              percent={tp.percent}
              size={84}
              strokeWidth={7.5}
              color={track.accentColor}
              sublabel="trilha"
            />
            <div className="ce-track-hero-kpis">
              <div>
                <strong>
                  {tp.completedLessons}/{tp.totalLessons}
                </strong>
                <span>aulas</span>
              </div>
              <div>
                <strong>
                  {tp.completedChallenges}/{tp.totalChallenges}
                </strong>
                <span>desafios</span>
              </div>
              <div>
                <strong>{tp.xp} XP</strong>
                <span>conquistados</span>
              </div>
              <div>
                <strong>{modules.length}</strong>
                <span>módulos</span>
              </div>
            </div>
          </div>
        </section>

        {/* Métricas reais da trilha */}
        <div className="ce-metrics-row">
          <div className="ce-metric-tile">
            <span>Aulas concluídas</span>
            <strong style={{ color: "var(--accent-success)" }}>
              {tp.completedLessons} / {tp.totalLessons}
            </strong>
          </div>
          <div className="ce-metric-tile">
            <span>Desafios superados</span>
            <strong style={{ color: track.accentSecondary }}>
              {tp.completedChallenges} / {tp.totalChallenges}
            </strong>
          </div>
          <div className="ce-metric-tile">
            <span>XP conquistado na trilha</span>
            <strong>{tp.xp} XP</strong>
          </div>
          <div className="ce-metric-tile">
            <span>Carga estimada</span>
            <strong>~{totalEstimatedMins} min</strong>
          </div>
        </div>
      </div>

      {/* Progresso real por módulo + O que você vai dominar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <section className="ce-panel">
          <h2 className="ce-section-title" style={{ fontSize: 15, marginBottom: 12 }}>
            Progresso por Módulo
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {modules.map(mod => {
              const done = mod.items.filter(l => data.lessonProgress[l.id]?.completed).length;
              const pct = Math.round((done / mod.items.length) * 100);
              return (
                <div key={mod.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                    <span>{mod.title}</span>
                    <strong>{done}/{mod.items.length} ({pct}%)</strong>
                  </div>
                  <div className="ce-progress-track" style={{ height: 6 }}>
                    <div
                      className="ce-progress-fill"
                      style={{ width: `${pct}%`, background: track.accentColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="ce-panel">
          <h2 className="ce-section-title" style={{ fontSize: 15, marginBottom: 12 }}>
            Competências desenvolvidas
          </h2>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 7, color: "var(--text-secondary)", fontSize: 13 }}>
            {track.outcomes.map(o => (
              <li key={o}>{o}</li>
            ))}
          </ul>

          {track.prerequisites && track.prerequisites.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
              <strong style={{ fontSize: 12.5, display: "block", marginBottom: 6 }}>Pré-requisitos recomendados</strong>
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)", fontSize: 12.5, display: "flex", flexDirection: "column", gap: 4 }}>
                {track.prerequisites.map(req => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {(track.recommendedNext && track.recommendedNext.length > 0) && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
                <strong style={{ fontSize: 12.5 }}>Próximos passos &amp; Roadmaps conectados</strong>
                <Link to="/roadmaps" className="ce-link-more" style={{ fontSize: 12 }}>
                  <span>Hub de Roadmaps</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {getRoadmapsForTrack(track.id).map(rm => (
                  <Link
                    key={rm.id}
                    to={`/roadmaps/${rm.id}`}
                    className="ce-btn ce-btn-ghost ce-btn-sm"
                    style={{ borderColor: rm.accentBorder }}
                  >
                    <MapIcon size={13} style={{ color: rm.accentColor }} />
                    <span>Roadmap {rm.shortTitle}</span>
                    <ArrowRight size={12} />
                  </Link>
                ))}
                {track.recommendedNext.map(nextId => {
                  const nt = TRACK_MAP[nextId];
                  if (!nt) return null;
                  return (
                    <Link
                      key={nextId}
                      to={`/trilhas/${nextId}`}
                      className="ce-btn ce-btn-ghost ce-btn-sm"
                      style={{ borderColor: nt.accentBorder }}
                    >
                      <TechIcon trackId={nextId} size={15} />
                      <span>{nt.name}</span>
                      <ArrowRight size={12} />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Roteiro de Módulos e Aulas */}
      <section aria-label="Módulos e aulas">
        <h2 className="ce-section-title" style={{ marginBottom: 12 }}>
          Conteúdo da Formação ({lessons.length} aulas)
        </h2>

        <div className="ce-module-list">
          {modules.map(mod => {
            const expanded = isModuleOpen(mod.id);
            const doneCount = mod.items.filter(l => data.lessonProgress[l.id]?.completed).length;
            return (
              <div key={mod.id} className="ce-module-box">
                <button
                  type="button"
                  className="ce-module-head"
                  onClick={() => setOpenModules(prev => ({ ...prev, [mod.id]: !expanded }))}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <strong style={{ fontSize: 14.5 }}>{mod.title}</strong>
                  </div>
                  <span className="ce-badge">
                    {doneCount}/{mod.items.length} concluídas
                  </span>
                </button>

                {expanded &&
                  mod.items.map(lesson => {
                    const prog = data.lessonProgress[lesson.id];
                    const isDone = Boolean(prog?.completed);
                    return (
                      <Link
                        key={lesson.id}
                        to={`/trilhas/${track.id}/aula/${lesson.id}`}
                        className="ce-lesson-row"
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 999,
                              display: "grid",
                              placeItems: "center",
                              fontSize: 12,
                              fontWeight: 700,
                              flexShrink: 0,
                              background: isDone ? "rgba(34,197,94,0.16)" : track.accentSoft,
                              color: isDone ? "var(--accent-success)" : track.accentSecondary,
                              border: `1px solid ${isDone ? "rgba(34,197,94,0.4)" : track.accentBorder}`,
                            }}
                          >
                            {isDone ? <CheckCircle2 size={15} /> : String(lesson.order).padStart(2, "0")}
                          </span>

                          <div style={{ minWidth: 0 }}>
                            <strong style={{ fontSize: 14, display: "block" }}>{lesson.title}</strong>
                            <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                              {lesson.subtitle}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
                          <span className="ce-badge">{lesson.difficulty}</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-muted)" }}>
                            <Clock size={12} />
                            {lesson.estimatedMinutes}m
                          </span>
                          <span className="ce-badge">+{lesson.xp} XP</span>
                          <ArrowRight size={15} style={{ color: track.accentSecondary }} />
                        </div>
                      </Link>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </section>

      {/* Desafios associados */}
      <section aria-label="Desafios recomendados da trilha">
        <div className="ce-section-head">
          <h2 className="ce-section-title">
            <Swords size={17} style={{ color: track.accentSecondary }} />
            <span>Desafios de consolidação ({trackChallenges.length})</span>
          </h2>
          <Link to="/desafios" className="ce-link-more">
            <span>Abrir arena de desafios</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="ce-tracks-grid-3">
          {trackChallenges.map(ch => {
            const done = Boolean(data.challengeProgress[ch.id]?.completed);
            return (
              <Link key={ch.id} to={`/desafios/${ch.id}`} className="ce-track-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span className="ce-badge">{ch.difficulty}</span>
                  <span className="ce-badge" style={{ color: done ? "var(--accent-success)" : track.accentSecondary }}>
                    {done ? "Resolvido" : `+${ch.xp} XP`}
                  </span>
                </div>
                <div>
                  <strong style={{ fontSize: 15 }}>{ch.title}</strong>
                  <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4 }}>{ch.summary}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};
