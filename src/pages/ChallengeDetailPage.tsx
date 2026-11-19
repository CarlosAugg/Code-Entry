import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Lightbulb, Target } from "lucide-react";
import { CHALLENGE_MAP, CHALLENGES } from "../data/challenges";
import { TRACK_MAP } from "../data/tracks";
import { usePlatform } from "../context/PlatformContext";
import type { EvaluationContext } from "../types/curriculum";
import { TechIcon } from "../components/shared/TechIcon";
import { CodeWorkbench } from "../components/workbenches/CodeWorkbench";
import { LinuxWorkbench } from "../components/workbenches/LinuxWorkbench";
import { SqlWorkbench } from "../components/workbenches/SqlWorkbench";
import { NetworkWorkbench } from "../components/workbenches/NetworkWorkbench";

export const ChallengeDetailPage: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { data, recordChallengeResult, saveDraft, saveWorkspace } = usePlatform();

  const challenge = (challengeId && CHALLENGE_MAP[challengeId]) || CHALLENGES[0];
  const track = TRACK_MAP[challenge.trackId];

  const draftKey = `challenge:${challenge.id}`;
  const savedDraft = data.drafts[draftKey];

  const [code, setCode] = useState(savedDraft?.code ?? challenge.starterCode);
  const [stdin, setStdin] = useState(savedDraft?.stdin ?? challenge.defaultStdin ?? "");
  const [hintLevel, setHintLevel] = useState(0);
  const [doneObjectives, setDoneObjectives] = useState<string[]>([]);
  const [mobilePane, setMobilePane] = useState<"content" | "workbench">("content");
  const draftTimer = useRef<number | null>(null);

  useEffect(() => {
    const nextDraft = data.drafts[`challenge:${challenge.id}`];
    setCode(nextDraft?.code ?? challenge.starterCode);
    setStdin(nextDraft?.stdin ?? challenge.defaultStdin ?? "");
    setHintLevel(0);
    setDoneObjectives([]);
    setMobilePane("content");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge.id]);

  const scheduleDraftSave = (nextCode: string, nextStdin: string) => {
    if (draftTimer.current) window.clearTimeout(draftTimer.current);
    draftTimer.current = window.setTimeout(() => {
      saveDraft(draftKey, nextCode, nextStdin).catch(() => {});
    }, 650);
  };

  const handleEvaluate = async (ctx: EvaluationContext, durationMs: number) => {
    const passedObj = challenge.objectives.filter(o => o.test(ctx)).map(o => o.id);
    const mergedObj =
      challenge.workbench === "linux" || challenge.workbench === "networks"
        ? Array.from(new Set([...doneObjectives, ...passedObj]))
        : passedObj;

    setDoneObjectives(mergedObj);
    const objComplete = challenge.objectives.every(o => mergedObj.includes(o.id));
    const testsComplete = !ctx.testResults.length || ctx.testResults.every(t => t.passed);
    const completed = objComplete && testsComplete;

    try {
      await recordChallengeResult({
        challengeId: challenge.id,
        trackId: challenge.trackId,
        title: `Desafio: ${challenge.title}`,
        completed,
        xpReward: challenge.xp,
        durationMs,
        detail: completed ? "Todos os objetivos e testes atendidos" : "Tentativa registrada",
      });
    } catch {
      // Erro exibido ao estudante sem exibir celebração enganosa
    }
  };

  const prog = data.challengeProgress[challenge.id];
  const isCompleted = Boolean(prog?.completed);

  return (
    <div
      style={
        {
          "--track-accent": track.accentColor,
          "--track-secondary": track.accentSecondary,
          "--track-soft": track.accentSoft,
          "--track-border": track.accentBorder,
          "--track-glow": track.accentGlow,
        } as React.CSSProperties
      }
    >
      <Link to="/desafios" className="ce-link-more" style={{ color: "var(--text-secondary)", marginBottom: 10 }}>
        <ArrowLeft size={14} />
        <span>Voltar para Desafios</span>
      </Link>

      <section className="ce-lesson-banner">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <TechIcon trackId={track.id} size={32} boxed />
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              <span className="ce-badge" style={{ borderColor: track.accentBorder, color: track.accentSecondary }}>
                {track.name} · {challenge.topic}
              </span>
              <span className="ce-badge">{challenge.difficulty}</span>
              <span className="ce-badge">+{challenge.xp} XP</span>
              {isCompleted && (
                <span className="ce-badge ce-badge-diff-easy">
                  <CheckCircle2 size={12} />
                  <span>Resolvido {prog?.bestTimeMs != null ? `(${prog.bestTimeMs}ms)` : ""}</span>
                </span>
              )}
            </div>
            <h1 style={{ fontSize: 21 }}>{challenge.title}</h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{challenge.summary}</p>
          </div>
        </div>
      </section>

      <div className="ce-mobile-view-switch" role="tablist" aria-label="Alternar painel do desafio">
        <button
          type="button"
          role="tab"
          aria-selected={mobilePane === "content"}
          className={mobilePane === "content" ? "is-active" : ""}
          onClick={() => setMobilePane("content")}
        >
          <Target size={15} />
          <span>Especificação</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePane === "workbench"}
          className={mobilePane === "workbench" ? "is-active" : ""}
          onClick={() => setMobilePane("workbench")}
        >
          <span>Ambiente Prático</span>
        </button>
      </div>

      <div className="ce-lesson-split">
        <section className={`ce-pedagogy-panel ${mobilePane === "workbench" ? "is-mobile-hidden" : ""}`}>
          <div className="ce-pedagogy-body">
            <div>
              <h2 className="ce-section-title" style={{ fontSize: 15, marginBottom: 8 }}>
                <Target size={15} style={{ color: track.accentSecondary }} />
                <span>Especificação do Desafio</span>
              </h2>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                {challenge.prompt}
              </p>
            </div>

            <div>
              <strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Objetivos do desafio</strong>
              <ul className="ce-objective-list">
                {challenge.objectives.map(obj => {
                  const ok = isCompleted || doneObjectives.includes(obj.id);
                  return (
                    <li key={obj.id} className={`ce-objective-item ${ok ? "is-done" : ""}`}>
                      <CheckCircle2 size={16} style={{ color: ok ? "var(--accent-success)" : "var(--text-muted)" }} />
                      <span>{obj.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <strong style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  <Lightbulb size={15} style={{ color: "#fbbf24" }} />
                  <span>Dicas Progressivas ({hintLevel}/3)</span>
                </strong>
                {hintLevel < 3 && (
                  <button
                    type="button"
                    className="ce-btn ce-btn-ghost ce-btn-sm"
                    onClick={() => setHintLevel(h => Math.min(3, h + 1))}
                  >
                    Revelar Dica {hintLevel + 1}
                  </button>
                )}
              </div>

              {hintLevel === 0 ? (
                <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                  Tente implementar por conta própria primeiro. Caso trave, libere uma pista por vez.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {challenge.hints.slice(0, hintLevel).map((h, i) => (
                    <div key={i} className="ce-callout" style={{ fontSize: 12.5 }}>
                      <strong style={{ display: "block", marginBottom: 2 }}>Nível {i + 1}</strong>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className={mobilePane === "content" ? "is-mobile-hidden" : ""}>
          {challenge.workbench === "code" && (
            <CodeWorkbench
              trackId={challenge.trackId as "logic" | "cpp" | "js" | "python"}
              code={code}
              stdin={stdin}
              starterCode={challenge.starterCode}
              requiresStdin={challenge.requiresStdin}
              testCases={challenge.testCases}
              onChangeCode={next => {
                setCode(next);
                scheduleDraftSave(next, stdin);
              }}
              onChangeStdin={next => {
                setStdin(next);
                scheduleDraftSave(code, next);
              }}
              onEvaluate={handleEvaluate}
              accentColor={track.accentColor}
              darkTextOnAccent={track.darkTextOnAccent}
            />
          )}

          {challenge.workbench === "linux" && (
            <LinuxWorkbench
              workspaceKey={`linux:${challenge.id}`}
              initialSerialized={data.workspaces[`linux:${challenge.id}`]}
              onPersistState={s => saveWorkspace(`linux:${challenge.id}`, s).catch(() => {})}
              onEvaluate={handleEvaluate}
            />
          )}

          {challenge.workbench === "sql" && (
            <SqlWorkbench
              datasetId={challenge.sqlDatasetId || "ecommerce"}
              code={code}
              starterCode={challenge.starterCode}
              onChangeCode={next => {
                setCode(next);
                scheduleDraftSave(next, "");
              }}
              onEvaluate={handleEvaluate}
            />
          )}

          {challenge.workbench === "networks" && (
            <NetworkWorkbench
              mode={challenge.networkMode || "subnet"}
              preset={challenge.networkPreset}
              onEvaluate={handleEvaluate}
            />
          )}
        </div>
      </div>
    </div>
  );
};
