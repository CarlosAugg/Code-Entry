import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Code2,
  Copy,
  Lightbulb,
  Target,
} from "lucide-react";
import { LESSON_MAP, LESSONS_BY_TRACK } from "../data/lessons";
import { TRACK_MAP } from "../data/tracks";
import { usePlatform } from "../context/PlatformContext";
import type { EvaluationContext, Lesson, TrackId } from "../types/curriculum";
import { AmbientAurora } from "../components/motion/AmbientAurora";
import { TechIcon } from "../components/shared/TechIcon";
import { CodeWorkbench } from "../components/workbenches/CodeWorkbench";
import { LinuxWorkbench } from "../components/workbenches/LinuxWorkbench";
import { SqlWorkbench } from "../components/workbenches/SqlWorkbench";
import { NetworkWorkbench } from "../components/workbenches/NetworkWorkbench";

function difficultyBadgeClass(diff: string): string {
  const lower = diff.toLowerCase();
  if (lower.includes("difícil") || lower.includes("avançado")) return "ce-badge-diff-hard";
  if (lower.includes("intermediário")) return "ce-badge-diff-medium";
  return "ce-badge-diff-easy";
}

export const LessonPage: React.FC = () => {
  const { trackId, lessonId } = useParams<{ trackId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { data, recordLessonResult, saveDraft, saveWorkspace } = usePlatform();

  const resolvedTrackId = (trackId && trackId in TRACK_MAP ? trackId : "js") as TrackId;
  const track = TRACK_MAP[resolvedTrackId];
  const trackLessons = LESSONS_BY_TRACK[resolvedTrackId] || [];
  const lesson: Lesson = (lessonId && LESSON_MAP[lessonId]) || trackLessons[0];

  const draftKey = `lesson:${lesson.id}`;
  const savedDraft = data.drafts[draftKey];

  const [code, setCode] = useState(savedDraft?.code ?? lesson.starterCode);
  const [stdin, setStdin] = useState(savedDraft?.stdin ?? lesson.defaultStdin ?? "");
  const [activeTab, setActiveTab] = useState<"theory" | "examples" | "challenge" | "hints">("theory");
  const [mobilePane, setMobilePane] = useState<"content" | "workbench">("content");
  const [hintLevel, setHintLevel] = useState(0); // 0 = nenhuma aberta, 1..3 níveis revelados
  const [liveDoneIds, setLiveDoneIds] = useState<string[]>(
    () => data.lessonProgress[lesson.id]?.objectivesDone || []
  );
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const draftTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const nextDraft = data.drafts[`lesson:${lesson.id}`];
    setCode(nextDraft?.code ?? lesson.starterCode);
    setStdin(nextDraft?.stdin ?? lesson.defaultStdin ?? "");
    setLiveDoneIds(data.lessonProgress[lesson.id]?.objectivesDone || []);
    setHintLevel(0);
    setActiveTab("theory");
    setMobilePane("content");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  // Auto-save rascunho de código/stdin com debounce
  const scheduleDraftSave = (nextCode: string, nextStdin: string) => {
    if (draftTimerRef.current) window.clearTimeout(draftTimerRef.current);
    draftTimerRef.current = window.setTimeout(() => {
      saveDraft(draftKey, nextCode, nextStdin).catch(() => {});
    }, 650);
  };

  const handleChangeCode = (next: string) => {
    setCode(next);
    scheduleDraftSave(next, stdin);
  };

  const handleChangeStdin = (next: string) => {
    setStdin(next);
    scheduleDraftSave(code, next);
  };

  const isAlreadyCompleted = Boolean(data.lessonProgress[lesson.id]?.completed);

  const handleEvaluate = async (ctx: EvaluationContext, durationMs: number) => {
    // Avalia objetivos desta execução mantendo acumulação para atividades multi-comando (ex: Linux / Redes)
    const passedNow = lesson.objectives.filter(obj => obj.test(ctx)).map(o => o.id);
    const mergedObjectives =
      lesson.workbench === "linux" || lesson.workbench === "networks"
        ? Array.from(new Set([...liveDoneIds, ...passedNow]))
        : passedNow;

    const allObjectivesDone = lesson.objectives.every(o => mergedObjectives.includes(o.id));
    const allTestsDone =
      !ctx.testResults.length || ctx.testResults.every(t => t.passed);
    const completed = allObjectivesDone && allTestsDone;

    setLiveDoneIds(mergedObjectives);

    try {
      await recordLessonResult({
        lessonId: lesson.id,
        trackId: lesson.trackId,
        title: lesson.title,
        completed,
        objectivesDone: mergedObjectives,
        xpReward: lesson.xp,
        durationMs,
        detail: completed
          ? `Aula concluída (${mergedObjectives.length}/${lesson.objectives.length} objetivos)`
          : `${mergedObjectives.length}/${lesson.objectives.length} objetivos atendidos`,
      });
    } catch {
      // Erro tratado e exibido no PlatformContext sem celebrar indevidamente
    }
  };

  const lessonIdx = trackLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = lessonIdx > 0 ? trackLessons[lessonIdx - 1] : null;
  const nextLesson = lessonIdx >= 0 && lessonIdx < trackLessons.length - 1 ? trackLessons[lessonIdx + 1] : null;
  const passedCount = useMemo(
    () => lesson.objectives.filter(o => liveDoneIds.includes(o.id)).length,
    [lesson.objectives, liveDoneIds]
  );

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
      {/* Breadcrumb + Seletor Rápido */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
        <nav className="ce-breadcrumb" aria-label="Caminho da aula" style={{ marginBottom: 0 }}>
          <Link to="/">Início</Link>
          <ChevronRight size={13} />
          <Link to={`/trilhas/${track.id}`}>{track.name}</Link>
          <ChevronRight size={13} />
          <span>{lesson.moduleTitle}</span>
          <ChevronRight size={13} />
          <strong style={{ color: "var(--text-primary)" }}>{lesson.title}</strong>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            className="ce-select"
            style={{ height: 32, fontSize: 12 }}
            value={lesson.id}
            onChange={e => navigate(`/trilhas/${track.id}/aula/${e.target.value}`)}
            aria-label="Selecionar aula da trilha"
          >
            {trackLessons.map(l => (
              <option key={l.id} value={l.id}>
                {String(l.order).padStart(2, "0")}. {l.title}{" "}
                {data.lessonProgress[l.id]?.completed ? "✓" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero compacto da aula */}
      <section className="ce-lesson-banner">
        <AmbientAurora accentColor={track.accentColor} secondaryColor={track.accentSecondary} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <TechIcon trackId={track.id} size={32} boxed />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              <span className="ce-badge" style={{ borderColor: track.accentBorder, color: track.accentSecondary }}>
                Aula {String(lesson.order).padStart(2, "0")} de {trackLessons.length}
              </span>
              <span className={`ce-badge ${difficultyBadgeClass(lesson.difficulty)}`}>
                {lesson.difficulty}
              </span>
              <span className="ce-badge">+{lesson.xp} XP</span>
              {isAlreadyCompleted && (
                <span className="ce-badge ce-badge-diff-easy">
                  <CheckCircle2 size={12} />
                  <span>Concluída</span>
                </span>
              )}
            </div>
            <h1 style={{ fontSize: 21 }}>{lesson.title}</h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{lesson.summary}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {prevLesson && (
            <button
              type="button"
              className="ce-btn ce-btn-ghost ce-btn-sm"
              onClick={() => navigate(`/trilhas/${track.id}/aula/${prevLesson.id}`)}
            >
              <ArrowLeft size={13} />
              <span>Anterior</span>
            </button>
          )}
          {nextLesson && (
            <button
              type="button"
              className={`ce-btn ce-btn-sm ${
                isAlreadyCompleted ? "ce-btn-track" : "ce-btn-ghost"
              } ${isAlreadyCompleted && track.darkTextOnAccent ? "is-dark-text" : ""}`}
              onClick={() => navigate(`/trilhas/${track.id}/aula/${nextLesson.id}`)}
            >
              <span>Próxima aula</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </section>

      {/* Alternador Mobile: Conteúdo vs Ambiente Prático */}
      <div className="ce-mobile-view-switch" role="tablist" aria-label="Alternar painel da aula">
        <button
          type="button"
          role="tab"
          aria-selected={mobilePane === "content"}
          className={mobilePane === "content" ? "is-active" : ""}
          onClick={() => setMobilePane("content")}
        >
          <BookOpen size={15} />
          <span>Conteúdo</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePane === "workbench"}
          className={mobilePane === "workbench" ? "is-active" : ""}
          onClick={() => setMobilePane("workbench")}
        >
          <Code2 size={15} />
          <span>Ambiente Prático</span>
        </button>
      </div>

      {/* Split Workspace: Conteúdo Pedagógico à Esquerda | Workbench Interativo à Direita */}
      <div className="ce-lesson-split" data-tour="lesson-workspace">
        <section
          className={`ce-pedagogy-panel ${mobilePane === "workbench" ? "is-mobile-hidden" : ""}`}
          aria-label="Conteúdo didático da aula"
        >
          <div className="ce-tabs-bar" data-tour="lesson-tabs" role="tablist">
            {(
              [
                { id: "theory" as const, label: "Teoria", icon: BookOpen },
                { id: "examples" as const, label: "Exemplos", icon: Code2 },
                { id: "challenge" as const, label: `Desafio (${passedCount}/${lesson.objectives.length})`, icon: Target },
                { id: "hints" as const, label: "Dicas", icon: Lightbulb },
              ] as const
            ).map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`ce-tab-btn ${isSelected ? "is-active" : ""}`}
                  style={{ position: "relative" }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={13} style={{ position: "relative", zIndex: 1 }} />
                  <span style={{ position: "relative", zIndex: 1 }}>{tab.label}</span>
                  {isSelected && (
                    <motion.span
                      layoutId="ce-lesson-tab-underline"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      style={{
                        position: "absolute",
                        left: 10,
                        right: 10,
                        bottom: 1,
                        height: 2,
                        borderRadius: 999,
                        background: track.accentColor,
                      }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="ce-pedagogy-body"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.14 }}
            >
            {activeTab === "theory" && (
              <>
                {lesson.theoryBlocks.map((block, idx) => {
                  if (block.kind === "text") {
                    return (
                      <div key={idx}>
                        {block.title && (
                          <h2 style={{ fontSize: 15.5, marginBottom: 6 }}>{block.title}</h2>
                        )}
                        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                          {block.content}
                        </p>
                      </div>
                    );
                  }
                  if (block.kind === "callout") {
                    return (
                      <div key={idx} className="ce-callout">
                        {block.title && <strong style={{ display: "block", marginBottom: 4 }}>{block.title}</strong>}
                        <span style={{ color: "var(--text-secondary)" }}>{block.content}</span>
                      </div>
                    );
                  }
                  if (block.kind === "table" && block.headers && block.rows) {
                    return (
                      <table key={idx} className="ce-table">
                        <thead>
                          <tr>
                            {block.headers.map(h => (
                              <th key={h}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.rows.map((r, rIdx) => (
                            <tr key={rIdx}>
                              {r.map((cell, cIdx) => (
                                <td key={cIdx}>
                                  {cIdx === 0 ? <code>{cell}</code> : cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  }
                  if (block.kind === "code") {
                    return (
                      <pre key={idx} className="ce-code-sample">
                        <code>{block.code}</code>
                      </pre>
                    );
                  }
                  return null;
                })}

                <div
                  style={{
                    marginTop: 4,
                    padding: 13,
                    borderRadius: 12,
                    background: "var(--bg-surface-elevated)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                    Pronto para praticar esta lição?
                  </span>
                  <button
                    type="button"
                    className="ce-btn ce-btn-ghost ce-btn-sm"
                    onClick={() => setActiveTab("challenge")}
                  >
                    <span>Ver Desafio &amp; Objetivos</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </>
            )}

            {activeTab === "examples" && (
              <>
                {lesson.examples.map((ex, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <strong style={{ fontSize: 14 }}>{ex.title}</strong>
                      <button
                        type="button"
                        className="ce-btn ce-btn-ghost ce-btn-sm"
                        onClick={() => {
                          navigator.clipboard?.writeText(ex.code);
                          setCopiedIdx(idx);
                          setTimeout(() => setCopiedIdx(null), 1500);
                        }}
                      >
                        <Copy size={12} />
                        <span>{copiedIdx === idx ? "Copiado!" : "Copiar"}</span>
                      </button>
                    </div>
                    <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{ex.description}</p>
                    <pre className="ce-code-sample">
                      <code>{ex.code}</code>
                    </pre>
                    {ex.output && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        Saída esperada: <span style={{ color: "var(--accent-success)" }}>{ex.output}</span>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {activeTab === "challenge" && (
              <>
                <div>
                  <h2 style={{ fontSize: 15, marginBottom: 6 }}>Atividade Prática</h2>
                  <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {lesson.prompt}
                  </p>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <strong style={{ fontSize: 13 }}>Objetivos desta aula</strong>
                    <span className="ce-badge">
                      {passedCount} / {lesson.objectives.length}
                    </span>
                  </div>

                  <ul className="ce-objective-list">
                    {lesson.objectives.map(obj => {
                      const done = liveDoneIds.includes(obj.id);
                      return (
                        <li key={obj.id} className={`ce-objective-item ${done ? "is-done" : ""}`}>
                          <CheckCircle2
                            size={16}
                            style={{ color: done ? "var(--accent-success)" : "var(--text-muted)", flexShrink: 0 }}
                          />
                          <span>{obj.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {isAlreadyCompleted && (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      background: "rgba(34,197,94,0.1)",
                      border: "1px solid rgba(34,197,94,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ fontSize: 13, color: "#4ade80", fontWeight: 600 }}>
                      Objetivos atendidos! Aula concluída (+{lesson.xp} XP).
                    </div>
                    {nextLesson && (
                      <button
                        type="button"
                        className="ce-btn ce-btn-primary ce-btn-sm"
                        onClick={() => navigate(`/trilhas/${track.id}/aula/${nextLesson.id}`)}
                      >
                        <span>Avançar para {nextLesson.title}</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "hints" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  Nosso sistema de dicas revela orientações em 3 níveis progressivos para ajudar você a raciocinar sem entregar a resposta antes da hora.
                </p>

                {(
                  [
                    { level: 1, label: "Nível 1 — Pista Conceitual", text: lesson.hints[0] },
                    { level: 2, label: "Nível 2 — Orientação Prática", text: lesson.hints[1] },
                    { level: 3, label: "Nível 3 — Explicação Detalhada", text: lesson.hints[2] },
                  ] as const
                ).map(h => {
                  const unlocked = hintLevel >= h.level;
                  const canReveal = hintLevel === h.level - 1;
                  return (
                    <div
                      key={h.level}
                      style={{
                        padding: 13,
                        borderRadius: 12,
                        background: "var(--bg-surface-elevated)",
                        border: `1px solid ${unlocked ? track.accentBorder : "var(--border-subtle)"}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <strong style={{ fontSize: 13, color: unlocked ? track.accentSecondary : "var(--text-primary)" }}>
                          {h.label}
                        </strong>
                        {!unlocked && (
                          <button
                            type="button"
                            className="ce-btn ce-btn-ghost ce-btn-sm"
                            disabled={!canReveal}
                            onClick={() => setHintLevel(h.level)}
                          >
                            {canReveal ? `Revelar Nível ${h.level}` : `Libere o Nível ${h.level - 1} antes`}
                          </button>
                        )}
                      </div>
                      {unlocked && (
                        <pre
                          style={{
                            margin: "8px 0 0",
                            whiteSpace: "pre-wrap",
                            fontFamily: "var(--font-sans)",
                            fontSize: 13,
                            color: "var(--text-secondary)",
                            lineHeight: 1.55,
                          }}
                        >
                          {h.text}
                        </pre>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            </motion.div>
          </AnimatePresence>

          <div
            style={{
              padding: "12px 18px",
              borderTop: "1px solid var(--border-subtle)",
              background: isAlreadyCompleted ? "rgba(34, 197, 94, 0.08)" : "var(--bg-surface-elevated)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600 }}>
              <CheckCircle2
                size={15}
                style={{ color: isAlreadyCompleted ? "var(--accent-success)" : "var(--text-muted)" }}
              />
              <span style={{ color: isAlreadyCompleted ? "#4ade80" : "var(--text-secondary)" }}>
                {isAlreadyCompleted
                  ? `Aula concluída (+${lesson.xp} XP)`
                  : `${passedCount} de ${lesson.objectives.length} objetivos concluídos`}
              </span>
            </div>

            {isAlreadyCompleted && nextLesson ? (
              <button
                type="button"
                className={`ce-btn ce-btn-track ce-btn-sm ${track.darkTextOnAccent ? "is-dark-text" : ""}`}
                onClick={() => navigate(`/trilhas/${track.id}/aula/${nextLesson.id}`)}
              >
                <span>Próxima aula</span>
                <ArrowRight size={13} />
              </button>
            ) : activeTab !== "challenge" ? (
              <button
                type="button"
                className="ce-btn ce-btn-ghost ce-btn-sm"
                onClick={() => setActiveTab("challenge")}
              >
                <span>Ver desafio</span>
              </button>
            ) : null}
          </div>
        </section>

        {/* COLUNA WORKBENCH ADAPTATIVO */}
        <div className={mobilePane === "content" ? "is-mobile-hidden" : ""}>
          {lesson.workbench === "code" && (
            <CodeWorkbench
              trackId={lesson.trackId as "logic" | "cpp" | "js" | "python"}
              code={code}
              stdin={stdin}
              starterCode={lesson.starterCode}
              requiresStdin={lesson.requiresStdin}
              testCases={lesson.testCases}
              onChangeCode={handleChangeCode}
              onChangeStdin={handleChangeStdin}
              onEvaluate={handleEvaluate}
              accentColor={track.accentColor}
              darkTextOnAccent={track.darkTextOnAccent}
            />
          )}

          {lesson.workbench === "linux" && (
            <LinuxWorkbench
              workspaceKey={`linux:${lesson.id}`}
              initialSerialized={data.workspaces[`linux:${lesson.id}`]}
              quickCommands={lesson.quickCommands}
              onPersistState={state => saveWorkspace(`linux:${lesson.id}`, state).catch(() => {})}
              onEvaluate={handleEvaluate}
            />
          )}

          {lesson.workbench === "sql" && (
            <SqlWorkbench
              datasetId={lesson.sqlDatasetId || "ecommerce"}
              code={code}
              starterCode={lesson.starterCode}
              onChangeCode={handleChangeCode}
              onEvaluate={handleEvaluate}
            />
          )}

          {lesson.workbench === "networks" && (
            <NetworkWorkbench
              mode={lesson.networkMode || "osi"}
              preset={lesson.networkPreset}
              quickCommands={lesson.quickCommands}
              onEvaluate={handleEvaluate}
            />
          )}
        </div>
      </div>
    </div>
  );
};
