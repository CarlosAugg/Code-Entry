import React, { useMemo, useState } from "react";
import { Award, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { ACHIEVEMENTS } from "../data/achievements";
import { TRACKS } from "../data/tracks";
import { usePlatform } from "../context/PlatformContext";
import { AmbientAurora } from "../components/motion/AmbientAurora";
import { ShinyText } from "../components/motion/ShinyText";
import { SpotlightCard } from "../components/motion/SpotlightCard";
import { TechIcon } from "../components/shared/TechIcon";

export const AchievementsPage: React.FC = () => {
  const { data, stats } = usePlatform();
  const [category, setCategory] = useState<string>("Todas");

  const evaluated = useMemo(() => {
    return ACHIEVEMENTS.map(def => {
      const res = def.evaluate(stats);
      const unlockedAt = data.achievements[def.id] || null;
      const unlocked = Boolean(unlockedAt) || res.unlocked;
      return { def, unlocked, unlockedAt, current: res.current, target: res.target };
    }).filter(item => category === "Todas" || item.def.category === category);
  }, [category, data.achievements, stats]);

  const unlockedTotal = ACHIEVEMENTS.filter(
    a => Boolean(data.achievements[a.id]) || a.evaluate(stats).unlocked
  ).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <section className="ce-hero-banner" style={{ gridTemplateColumns: "1fr auto" }}>
        <AmbientAurora />
        <div>
          <span className="ce-badge" style={{ borderColor: "rgba(250,204,21,0.4)", color: "#FACC15" }}>
            <Award size={12} />
            <ShinyText text="Marcos & Competências" />
          </span>
          <h1 className="ce-hero-title" style={{ marginTop: 10 }}>
            Suas Conquistas
          </h1>
          <p className="ce-hero-sub" style={{ marginBottom: 0 }}>
            Todas as medalhas são calculadas em tempo real a partir das suas atividades concluídas, desafios resolvidos e sequência de estudo.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div className="ce-metric-tile" style={{ minWidth: 140 }}>
            <span>Desbloqueadas</span>
            <strong style={{ color: "#FACC15" }}>
              {unlockedTotal} / {ACHIEVEMENTS.length}
            </strong>
          </div>
          <div className="ce-metric-tile" style={{ minWidth: 130 }}>
            <span>XP Total</span>
            <strong>{stats.totalXp} XP</strong>
          </div>
        </div>
      </section>

      {/* Competências por tecnologia */}
      <section className="ce-panel">
        <h2 className="ce-section-title" style={{ fontSize: 15, marginBottom: 14 }}>
          <Sparkles size={15} style={{ color: "var(--accent-secondary)" }} />
          <span>Mapa de Competências por Trilha</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {TRACKS.map(t => {
            const tp = stats.perTrack[t.id];
            return (
              <div
                key={t.id}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <TechIcon trackId={t.id} size={20} />
                    <strong style={{ fontSize: 13.5 }}>{t.name}</strong>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: t.accentSecondary }}>{tp.percent}%</span>
                </div>
                <div className="ce-progress-track" style={{ height: 5 }}>
                  <div className="ce-progress-fill" style={{ width: `${tp.percent}%`, background: t.accentColor }} />
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                  {tp.completedLessons}/{tp.totalLessons} aulas · {tp.completedChallenges}/{tp.totalChallenges} desafios
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filtros de conquistas */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["Todas", "Geral", "Trilhas", "Desafios", "Consistência"] as const).map(cat => (
          <button
            key={cat}
            type="button"
            className={`ce-btn ce-btn-sm ${category === cat ? "ce-btn-primary" : "ce-btn-ghost"}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Conquistas */}
      <section className="ce-tracks-grid-3">
        {evaluated.map(({ def, unlocked, unlockedAt, current, target }) => {
          const pct = Math.round((current / Math.max(1, target)) * 100);
          return (
            <SpotlightCard
              key={def.id}
              className="ce-surface ce-card-interactive"
              spotlightColor={unlocked ? "rgba(250, 204, 21, 0.16)" : "rgba(var(--accent-rgb), 0.12)"}
              style={{
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                borderColor: unlocked ? def.accentColor : "var(--border-subtle)",
                boxShadow: unlocked ? `0 8px 26px ${def.accentColor}1f` : undefined,
                opacity: unlocked ? 1 : 0.85,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span className="ce-badge">{def.category}</span>
                {unlocked ? (
                  <span className="ce-badge ce-badge-diff-easy">
                    <CheckCircle2 size={12} />
                    <span>Desbloqueada (+{def.xpBonus} XP)</span>
                  </span>
                ) : (
                  <span className="ce-badge">
                    <Lock size={11} />
                    <span>+{def.xpBonus} XP</span>
                  </span>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: 15.5 }}>{def.title}</h3>
                <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4 }}>
                  {def.description}
                </p>
              </div>

              <div style={{ marginTop: "auto", paddingTop: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--text-muted)", marginBottom: 5 }}>
                  <span>
                    Progresso: {current} / {target}
                  </span>
                  <span>{unlockedAt ? new Date(unlockedAt).toLocaleDateString("pt-BR") : `${pct}%`}</span>
                </div>
                <div className="ce-progress-track" style={{ height: 5 }}>
                  <div
                    className="ce-progress-fill"
                    style={{ width: `${pct}%`, background: unlocked ? "#22C55E" : def.accentColor }}
                  />
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </section>
    </div>
  );
};
