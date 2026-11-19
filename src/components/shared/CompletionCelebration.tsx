import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Award, CheckCircle2, Sparkles, Trophy, X } from "lucide-react";
import { CHALLENGES } from "../../data/challenges";
import { LESSONS_BY_TRACK } from "../../data/lessons";
import { usePlatform } from "../../context/PlatformContext";
import { TechIcon } from "./TechIcon";

const AUTO_DISMISS_MS = 7500;

export const CompletionCelebration: React.FC = () => {
  const { data, celebration, dismissCelebration } = usePlatform();
  const navigate = useNavigate();

  useEffect(() => {
    if (!celebration) return;
    const timer = window.setTimeout(() => {
      dismissCelebration();
    }, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [celebration, dismissCelebration]);

  const studentName = data.settings.displayName || "Estudante";

  const nextAction = (() => {
    if (!celebration) return null;
    if (celebration.kind === "lesson") {
      const list = LESSONS_BY_TRACK[celebration.trackId] || [];
      const curIdx = list.findIndex(l => l.id === celebration.itemId);
      const next = curIdx >= 0 && curIdx < list.length - 1 ? list[curIdx + 1] : null;
      if (next) {
        return {
          label: "Próxima aula",
          to: `/trilhas/${celebration.trackId}/aula/${next.id}`,
        };
      }
      return { label: "Ver trilha", to: `/trilhas/${celebration.trackId}` };
    }
    const nextChallenge = CHALLENGES.find(
      c => c.id !== celebration.itemId && !data.challengeProgress[c.id]?.completed && c.trackId === celebration.trackId
    );
    if (nextChallenge) {
      return { label: "Próximo desafio", to: `/desafios/${nextChallenge.id}` };
    }
    return { label: "Ver desafios", to: "/desafios" };
  })();

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          key={`${celebration.kind}-${celebration.itemId}`}
          role="status"
          aria-live="polite"
          data-testid="completion-toast"
          className="ce-completion-toast"
          initial={{ opacity: 0, x: 36, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 28, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          style={{ "--celeb-accent": celebration.trackAccent } as React.CSSProperties}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div className="ce-celebration-icon">
                {celebration.kind === "challenge" ? <Trophy size={18} /> : <CheckCircle2 size={18} />}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span
                    className="ce-badge"
                    style={{
                      borderColor: "rgba(34, 197, 94, 0.45)",
                      background: "rgba(34, 197, 94, 0.14)",
                      color: "#4ade80",
                      fontSize: 11,
                      padding: "2px 8px",
                    }}
                  >
                    <Sparkles size={11} />
                    <span>{celebration.kind === "lesson" ? "Aula concluída" : "Desafio superado"}</span>
                  </span>
                  <span
                    className="ce-badge"
                    style={{
                      borderColor: "rgba(74, 222, 128, 0.35)",
                      color: "#4ade80",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    +{celebration.xpAwarded} XP
                  </span>
                </div>
                <strong style={{ fontSize: 14.5, display: "block", marginTop: 4, color: "var(--text-primary)" }}>
                  {celebration.kind === "lesson"
                    ? `Excelente trabalho, ${studentName}! Aula concluída.`
                    : `Excelente trabalho, ${studentName}! Desafio concluído.`}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="ce-icon-btn"
              style={{ width: 26, height: 26, flexShrink: 0 }}
              onClick={dismissCelebration}
              aria-label="Fechar notificação de conclusão"
            >
              <X size={13} />
            </button>
          </div>

          <div className="ce-completion-toast-metrics">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600 }}>
                <TechIcon trackId={celebration.trackId} size={15} />
                <span>
                  {celebration.trackDeltaPercent > 0
                    ? `Você avançou ${celebration.trackDeltaPercent}% na trilha ${celebration.trackName}`
                    : `Trilha ${celebration.trackName}`}
                </span>
              </span>
              <strong style={{ fontSize: 12.5, color: celebration.trackAccent }}>
                {celebration.nextTrackPercent}%
              </strong>
            </div>

            <div className="ce-progress-track" style={{ height: 5, margin: "6px 0" }}>
              <motion.div
                className="ce-progress-fill"
                initial={{ width: `${celebration.prevTrackPercent}%` }}
                animate={{ width: `${celebration.nextTrackPercent}%` }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{ background: celebration.trackAccent }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)" }}>
              <span>
                Progresso geral agora é de <strong style={{ color: "var(--text-primary)" }}>{celebration.nextOverallPercent}%</strong>
              </span>
              <span>
                {celebration.completedActivities}/{celebration.totalActivities} atividades
              </span>
            </div>
          </div>

          {celebration.newlyUnlockedAchievements.length > 0 && (
            <div className="ce-completion-toast-ach">
              <Award size={14} style={{ color: "#facc15", flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Conquista: <strong>{celebration.newlyUnlockedAchievements[0].title}</strong>
              </span>
              <strong style={{ color: "#facc15", flexShrink: 0 }}>
                +{celebration.newlyUnlockedAchievements[0].xpBonus} XP
              </strong>
            </div>
          )}

          {nextAction && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="ce-btn ce-btn-primary ce-btn-sm"
                style={{ height: 30, padding: "0 12px", fontSize: 12 }}
                onClick={() => {
                  const target = nextAction.to;
                  dismissCelebration();
                  navigate(target);
                }}
              >
                <span>{nextAction.label}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          <motion.div
            className="ce-completion-toast-timer"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: AUTO_DISMISS_MS / 1000, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
