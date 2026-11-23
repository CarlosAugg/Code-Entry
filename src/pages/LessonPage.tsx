import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Lightbulb,
  Map as MapIcon,
  RotateCcw,
  Target,
} from "lucide-react";
import { extractGlossaryTermsFromText } from "../data/glossary";
import { getRecallQuestionsForLesson } from "../data/lessonRecall";
import { LESSON_MAP, LESSONS_BY_TRACK } from "../data/lessons";
import { getRoadmapNodesForLesson } from "../data/roadmaps";
import { TRACK_MAP } from "../data/tracks";
import { usePlatform } from "../context/PlatformContext";
import type { EvaluationContext, Lesson, TrackId } from "../types/curriculum";
import { AmbientAurora } from "../components/motion/AmbientAurora";
import { AnnotatedCodeBlock, AnnotatedText, GlossaryTerm } from "../components/shared/GlossaryTerm";
import { TechIcon } from "../components/shared/TechIcon";
import { LessonConceptDiagram } from "../components/study/LessonConceptDiagram";
import {
  hasInteractiveTheater,
  LessonInteractiveTheater,
} from "../components/study/LessonInteractiveTheater";
import { CodeWorkbench } from "../components/workbenches/CodeWorkbench";
import { WebWorkbench } from "../components/workbenches/WebWorkbench";
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
  const { data, resetEpoch, recordLessonResult, saveDraft, saveWorkspace } = usePlatform();

  const resolvedTrackId = (trackId && trackId in TRACK_MAP ? trackId : "js") as TrackId;
  const track = TRACK_MAP[resolvedTrackId];
  const trackLessons = LESSONS_BY_TRACK[resolvedTrackId] || [];
  const lesson: Lesson = (lessonId && LESSON_MAP[lessonId]) || trackLessons[0];

  const draftKey = `lesson:${lesson.id}`;
  const savedDraft = data.drafts[draftKey];

  const [code, setCode] = useState(savedDraft?.code ?? lesson.starterCode);
  const [stdin, setStdin] = useState(savedDraft?.stdin ?? lesson.defaultStdin ?? "");
  const [activeTab, setActiveTab] = useState<"learn" | "examples" | "practice" | "retain">("learn");
  const [pedagogyCollapsed, setPedagogyCollapsed] = useState(false);
  const [openAidPanel, setOpenAidPanel] = useState<"outline" | "vocab" | "roadmap" | null>(null);
  const [mobilePane, setMobilePane] = useState<"content" | "workbench">("content");
  const [hintLevel, setHintLevel] = useState(0); // 0 = nenhuma aberta, 1..3 níveis revelados
  const [liveDoneIds, setLiveDoneIds] = useState<string[]>(
    () => data.lessonProgress[lesson.id]?.objectivesDone || []
  );
  const [recallAnswers, setRecallAnswers] = useState<Record<string, number>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    savedDraft ? "saved" : "idle"
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const draftTimerRef = useRef<number | null>(null);
  const pendingDraftRef = useRef<{ key: string; code: string; stdin: string } | null>(null);
  const saveDraftRef = useRef(saveDraft);
  saveDraftRef.current = saveDraft;
  const mountedEpochRef = useRef(resetEpoch);
  const resetEpochRef = useRef(resetEpoch);
  resetEpochRef.current = resetEpoch;

  const flushPendingDraft = () => {
    if (draftTimerRef.current) {
      window.clearTimeout(draftTimerRef.current);
      draftTimerRef.current = null;
    }
    const pending = pendingDraftRef.current;
    pendingDraftRef.current = null;
    if (resetEpochRef.current !== mountedEpochRef.current) return;
    if (pending) {
      saveDraftRef.current(pending.key, pending.code, pending.stdin).catch(() => {});
    }
  };

  useEffect(() => {
    flushPendingDraft();
    const nextDraft = data.drafts[`lesson:${lesson.id}`];
    setCode(nextDraft?.code ?? lesson.starterCode);
    setStdin(nextDraft?.stdin ?? lesson.defaultStdin ?? "");
    setLiveDoneIds(data.lessonProgress[lesson.id]?.objectivesDone || []);
    setHintLevel(0);
    setActiveTab("learn");
    setPedagogyCollapsed(false);
    setOpenAidPanel(null);
    setRecallAnswers({});
    setMobilePane("content");
    setSaveStatus(nextDraft ? "saved" : "idle");
    setSaveError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  useEffect(() => {
    return () => {
      flushPendingDraft();
    };
  }, []);

  // Auto-save rascunho de código/stdin com debounce
  const scheduleDraftSave = (nextCode: string, nextStdin: string) => {
    setSaveStatus("saving");
    setSaveError(null);
    pendingDraftRef.current = { key: draftKey, code: nextCode, stdin: nextStdin };
    if (draftTimerRef.current) window.clearTimeout(draftTimerRef.current);
    draftTimerRef.current = window.setTimeout(() => {
      const payload = pendingDraftRef.current;
      pendingDraftRef.current = null;
      draftTimerRef.current = null;
      if (!payload) return;
      saveDraftRef
        .current(payload.key, payload.code, payload.stdin)
        .then(() => {
          setSaveStatus("saved");
        })
        .catch(err => {
          setSaveStatus("error");
          setSaveError(err instanceof Error ? err.message : "Erro ao salvar rascunho localmente.");
        });
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

  const preferredGlossaryCategories = useMemo(() => {
    switch (track.id) {
      case "web":
        return ["web", "js"];
      case "js":
        return ["js", "web", "logic"];
      case "cpp":
        return ["cpp", "logic"];
      case "python":
        return ["python", "logic"];
      case "database":
        return ["sql"];
      case "linux":
      case "networks":
        return ["infra", "architecture"];
      default:
        return ["logic", "js"];
    }
  }, [track.id]);

  const recallQuestions = useMemo(() => getRecallQuestionsForLesson(lesson), [lesson]);
  const roadmapLinks = useMemo(
    () => getRoadmapNodesForLesson(lesson.id, track.id),
    [lesson.id, track.id]
  );
  const vocabularyEntries = useMemo(() => {
    const raw = [
      lesson.title,
      lesson.summary,
      lesson.prompt,
      ...lesson.theoryBlocks.map(b => [b.title || "", b.content || "", b.code || ""].join(" ")),
      ...lesson.examples.map(e => [e.title, e.description, e.code].join(" ")),
    ].join(" ");
    return extractGlossaryTermsFromText(raw, preferredGlossaryCategories).slice(0, 10);
  }, [lesson, preferredGlossaryCategories]);

  const theoryOutline = useMemo(
    () =>
      lesson.theoryBlocks
        .map((block, idx) => ({ id: `ce-sec-${idx}`, title: block.title }))
        .filter((item): item is { id: string; title: string } => Boolean(item.title)),
    [lesson.theoryBlocks]
  );

  const isPracticeSplit = true;
  const allObjectivesNowDone = passedCount === lesson.objectives.length && lesson.objectives.length > 0;
  const showFixarTab = isAlreadyCompleted || allObjectivesNowDone || activeTab === "retain";
  const canTrySnippetInEditor = lesson.workbench === "code" || lesson.workbench === "sql";

  const handleCopySnippet = (key: string, snippet: string) => {
    navigator.clipboard?.writeText(snippet);
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey(prev => (prev === key ? null : prev));
    }, 1500);
  };

  const handleTrySnippetInEditor = (snippet: string) => {
    handleChangeCode(snippet);
    setActiveTab("practice");
    setMobilePane("workbench");
  };

  const recallCorrectCount = recallQuestions.filter(
    q => recallAnswers[q.id] === q.correctIndex
  ).length;
  const recallAnsweredCount = recallQuestions.filter(
    q => recallAnswers[q.id] !== undefined
  ).length;

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

      {/* Split Workspace: Leitura confortável em Aprender/Exemplos/Fixar | Lado a lado em Praticar */}
      <div
        className={`ce-lesson-split ${lesson.workbench === "web" ? "is-web-layout" : ""} ${
          isPracticeSplit ? "is-practice-split" : "is-reading-mode"
        } ${pedagogyCollapsed ? "is-pedagogy-collapsed" : ""}`}
        data-tour="lesson-workspace"
      >
        <section
          className={`ce-pedagogy-panel ${mobilePane === "workbench" ? "is-mobile-hidden" : ""} ${
            pedagogyCollapsed ? "is-collapsed" : ""
          }`}
          aria-label="Conteúdo didático da aula"
        >
          <div className="ce-tabs-bar" data-tour="lesson-tabs" role="tablist">
            {(
              [
                { id: "learn" as const, label: "1. Aprender", icon: BookOpen },
                { id: "examples" as const, label: "2. Exemplos", icon: Code2 },
                {
                  id: "practice" as const,
                  label: `3. Praticar (${passedCount}/${lesson.objectives.length})`,
                  icon: Target,
                },
                ...(showFixarTab
                  ? [{ id: "retain" as const, label: "4. Revisão & Fixar", icon: BrainCircuit }]
                  : []),
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
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPedagogyCollapsed(false);
                  }}
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

            <button
              type="button"
              className="ce-pedagogy-collapse-btn"
              onClick={() => setPedagogyCollapsed(c => !c)}
              title={pedagogyCollapsed ? "Expandir painel da aula" : "Recolher painel da aula"}
              aria-label={pedagogyCollapsed ? "Expandir painel da aula" : "Recolher painel da aula"}
              aria-expanded={!pedagogyCollapsed}
            >
              {pedagogyCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {!pedagogyCollapsed && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className="ce-pedagogy-body"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14 }}
              >
            {activeTab === "learn" && (
              <>
                {hasInteractiveTheater(lesson.id) && (
                  <LessonInteractiveTheater
                    lesson={lesson}
                    track={track}
                    onGoToPractice={() => {
                      setActiveTab("practice");
                      setMobilePane("workbench");
                    }}
                    onGoToExamples={() => setActiveTab("examples")}
                    onSwitchToTextMode={() => {}}
                  />
                )}

                <LessonConceptDiagram lesson={lesson} track={track} />

                {lesson.theoryBlocks.map((block, idx) => {
                  if (block.kind === "text") {
                    return (
                      <div key={idx} id={`ce-sec-${idx}`}>
                        {block.title && (
                          <h2 style={{ fontSize: 15.5, marginBottom: 6 }}>{block.title}</h2>
                        )}
                        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.68 }}>
                          <AnnotatedText
                            text={block.content}
                            categories={preferredGlossaryCategories}
                          />
                        </p>
                      </div>
                    );
                  }
                  if (block.kind === "callout") {
                    return (
                      <div key={idx} id={`ce-sec-${idx}`} className="ce-callout">
                        {block.title && <strong style={{ display: "block", marginBottom: 4 }}>{block.title}</strong>}
                        <span style={{ color: "var(--text-secondary)" }}>
                          <AnnotatedText
                            text={block.content}
                            categories={preferredGlossaryCategories}
                          />
                        </span>
                      </div>
                    );
                  }
                  if (block.kind === "table" && block.headers && block.rows) {
                    return (
                      <table key={idx} id={`ce-sec-${idx}`} className="ce-table">
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
                                  {cIdx === 0 ? (
                                    <code>{cell}</code>
                                  ) : (
                                    <AnnotatedText
                                      text={cell}
                                      categories={preferredGlossaryCategories}
                                    />
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  }
                  if (block.kind === "code" && block.code) {
                    const clipKey = `theory-${idx}`;
                    return (
                      <AnnotatedCodeBlock
                        key={idx}
                        code={block.code}
                        language={block.language || track.id}
                        title={block.title}
                        onCopy={() => handleCopySnippet(clipKey, block.code || "")}
                        copied={copiedKey === clipKey}
                        onTryInEditor={
                          canTrySnippetInEditor
                            ? () => handleTrySnippetInEditor(block.code || "")
                            : undefined
                        }
                      />
                    );
                  }
                  return null;
                })}

                {(theoryOutline.length > 0 || vocabularyEntries.length > 0 || roadmapLinks.length > 0) && (
                  <div className="ce-study-aids-wrap is-bottom-subtle">
                    <div className="ce-study-aids-triggers">
                      <span className="ce-study-aids-label">Apoio:</span>
                      {theoryOutline.length > 0 && (
                        <button
                          type="button"
                          className={`ce-chip ${openAidPanel === "outline" ? "is-active" : ""}`}
                          onClick={() =>
                            setOpenAidPanel(prev => (prev === "outline" ? null : "outline"))
                          }
                          aria-expanded={openAidPanel === "outline"}
                        >
                          <span>Sumário ({theoryOutline.length})</span>
                          <ChevronDown size={12} />
                        </button>
                      )}
                      {vocabularyEntries.length > 0 && (
                        <button
                          type="button"
                          className={`ce-chip ${openAidPanel === "vocab" ? "is-active" : ""}`}
                          onClick={() =>
                            setOpenAidPanel(prev => (prev === "vocab" ? null : "vocab"))
                          }
                          aria-expanded={openAidPanel === "vocab"}
                        >
                          <span>Vocabulário ({vocabularyEntries.length})</span>
                          <ChevronDown size={12} />
                        </button>
                      )}
                      {roadmapLinks.length > 0 && (
                        <button
                          type="button"
                          className={`ce-chip ${openAidPanel === "roadmap" ? "is-active" : ""}`}
                          onClick={() =>
                            setOpenAidPanel(prev => (prev === "roadmap" ? null : "roadmap"))
                          }
                          aria-expanded={openAidPanel === "roadmap"}
                        >
                          <MapIcon size={12} />
                          <span>No Roadmap ({roadmapLinks.length})</span>
                          <ChevronDown size={12} />
                        </button>
                      )}
                    </div>

                    {openAidPanel === "outline" && theoryOutline.length > 0 && (
                      <div className="ce-study-aid-drawer">
                        {theoryOutline.map(sec => (
                          <button
                            key={sec.id}
                            type="button"
                            className="ce-study-outline-item"
                            onClick={() => {
                              document.getElementById(sec.id)?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                            }}
                          >
                            <span className="ce-study-outline-dot" />
                            <span>{sec.title}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {openAidPanel === "vocab" && vocabularyEntries.length > 0 && (
                      <div className="ce-study-aid-drawer">
                        <div className="ce-rm-glossary-pills">
                          {vocabularyEntries.map(entry => (
                            <GlossaryTerm key={entry.id} entry={entry} variant="pill">
                              {entry.term}
                            </GlossaryTerm>
                          ))}
                        </div>
                      </div>
                    )}

                    {openAidPanel === "roadmap" && roadmapLinks.length > 0 && (
                      <div className="ce-study-aid-drawer">
                        <div className="ce-study-rail-roadmaps">
                          {roadmapLinks.map(({ roadmap, node }) => (
                            <Link
                              key={`${roadmap.id}-${node.id}`}
                              to={`/roadmaps/${roadmap.id}?topico=${node.id}`}
                              className="ce-study-rail-rm-link"
                            >
                              <div>
                                <strong>{node.shortTitle || node.title}</strong>
                                <span>Roadmap {roadmap.shortTitle}</span>
                              </div>
                              <ArrowRight size={13} />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "examples" && (
              <>
                {lesson.examples.map((ex, idx) => {
                  const clipKey = `ex-${idx}`;
                  return (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <strong style={{ fontSize: 14 }}>{ex.title}</strong>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        <AnnotatedText
                          text={ex.description}
                          categories={preferredGlossaryCategories}
                        />
                      </p>
                      <AnnotatedCodeBlock
                        code={ex.code}
                        language={track.id}
                        title="Código comentado (passe o mouse ou clique nos termos)"
                        onCopy={() => handleCopySnippet(clipKey, ex.code)}
                        copied={copiedKey === clipKey}
                        onTryInEditor={
                          canTrySnippetInEditor
                            ? () => handleTrySnippetInEditor(ex.code)
                            : undefined
                        }
                      />
                      {ex.output && (
                        <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          Saída esperada: <span style={{ color: "var(--accent-success)" }}>{ex.output}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {activeTab === "practice" && (
              <>
                <div>
                  <h2 style={{ fontSize: 15, marginBottom: 6 }}>O que fazer no editor</h2>
                  <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    <AnnotatedText
                      text={lesson.prompt}
                      categories={preferredGlossaryCategories}
                    />
                  </p>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <strong style={{ fontSize: 13 }}>Como saber que concluiu</strong>
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

                {(isAlreadyCompleted || allObjectivesNowDone) && (
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
                      Objetivos atendidos! Feche com a revisão rápida para fixar (+{lesson.xp} XP).
                    </div>
                    <button
                      type="button"
                      className="ce-btn ce-btn-primary ce-btn-sm"
                      onClick={() => setActiveTab("retain")}
                    >
                      <BrainCircuit size={13} />
                      <span>Revisar &amp; Fixar</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                )}

                {/* Dicas progressivas integradas direto na aba Praticar */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <strong style={{ fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Lightbulb size={14} style={{ color: "var(--accent-warning)" }} />
                      <span>Dicas progressivas ({hintLevel}/3)</span>
                    </strong>
                    <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                      Revele por etapas apenas se travar
                    </span>
                  </div>

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
                          padding: 12,
                          borderRadius: 12,
                          background: "var(--bg-surface-elevated)",
                          border: `1px solid ${unlocked ? track.accentBorder : "var(--border-subtle)"}`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <strong style={{ fontSize: 12.5, color: unlocked ? track.accentSecondary : "var(--text-primary)" }}>
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
                              fontSize: 12.5,
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
              </>
            )}

            {activeTab === "retain" && (
              <div className="ce-recall-wrap">
                <div className="ce-recall-head">
                  <div>
                    <strong style={{ fontSize: 14, display: "inline-flex", alignItems: "center", gap: 7 }}>
                      <BrainCircuit size={15} style={{ color: track.accentColor }} />
                      <span>Verificação Rápida &amp; Retenção</span>
                    </strong>
                    <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 3 }}>
                      Teste seu entendimento respondendo antes de seguir. Sem pressa: clique nas alternativas para ver o porquê.
                    </p>
                  </div>
                  {recallAnsweredCount > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="ce-badge">
                        {recallCorrectCount}/{recallQuestions.length} acertos
                      </span>
                      <button
                        type="button"
                        className="ce-btn ce-btn-ghost ce-btn-sm"
                        onClick={() => setRecallAnswers({})}
                      >
                        <RotateCcw size={12} />
                        <span>Refazer</span>
                      </button>
                    </div>
                  )}
                </div>

                {recallQuestions.map((q, qIdx) => {
                  const chosen = recallAnswers[q.id];
                  const answered = chosen !== undefined;
                  const isCorrect = answered && chosen === q.correctIndex;

                  return (
                    <div key={q.id} className="ce-recall-card">
                      <div className="ce-recall-prompt">
                        <span className="ce-badge">Pergunta {qIdx + 1}</span>
                        <strong>{q.prompt}</strong>
                      </div>
                      <div className="ce-recall-options">
                        {q.options.map((opt, optIdx) => {
                          const selected = chosen === optIdx;
                          const rightOpt = answered && optIdx === q.correctIndex;
                          const wrongChosen = answered && selected && !rightOpt;

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              className={[
                                "ce-recall-option",
                                selected ? "is-selected" : "",
                                rightOpt ? "is-correct" : "",
                                wrongChosen ? "is-wrong" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              onClick={() =>
                                setRecallAnswers(prev => ({ ...prev, [q.id]: optIdx }))
                              }
                            >
                              <span className="ce-recall-letter">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                      {answered && (
                        <div className={`ce-recall-feedback ${isCorrect ? "is-correct" : "is-review"}`}>
                          <strong>
                            {isCorrect ? "Correto!" : "Vale revisar este ponto:"}
                          </strong>{" "}
                          <AnnotatedText
                            text={q.explanation}
                            categories={preferredGlossaryCategories}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {roadmapLinks.length > 0 && (
                  <div className="ce-recall-roadmap-box">
                    <strong style={{ fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <MapIcon size={14} style={{ color: track.accentColor }} />
                      <span>Onde esta aula se encaixa nos Roadmaps</span>
                    </strong>
                    <div className="ce-rm-rel-chips" style={{ marginTop: 8 }}>
                      {roadmapLinks.map(({ roadmap, node }) => (
                        <Link
                          key={`${roadmap.id}-${node.id}`}
                          to={`/roadmaps/${roadmap.id}?topico=${node.id}`}
                          className="ce-rm-rel-btn"
                        >
                          <span
                            className="ce-rm-dot"
                            style={{ background: roadmap.accentColor }}
                            aria-hidden="true"
                          />
                          <span>
                            {roadmap.shortTitle}: {node.shortTitle || node.title}
                          </span>
                          <ArrowRight size={12} />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            </motion.div>
          </AnimatePresence>
          )}

          {!pedagogyCollapsed && (
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

            {activeTab === "retain" ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="ce-btn ce-btn-ghost ce-btn-sm"
                  onClick={() => {
                    setActiveTab("practice");
                    setMobilePane("workbench");
                  }}
                >
                  <span>Voltar à prática</span>
                </button>
                {nextLesson ? (
                  <button
                    type="button"
                    className={`ce-btn ce-btn-track ce-btn-sm ${track.darkTextOnAccent ? "is-dark-text" : ""}`}
                    onClick={() => navigate(`/trilhas/${track.id}/aula/${nextLesson.id}`)}
                  >
                    <span>Próxima aula</span>
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <Link to={`/trilhas/${track.id}`} className="ce-btn ce-btn-primary ce-btn-sm">
                    <span>Concluir e voltar à trilha</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            ) : activeTab !== "practice" ? (
              <button
                type="button"
                className="ce-btn ce-btn-primary ce-btn-sm"
                onClick={() => {
                  setActiveTab("practice");
                  setMobilePane("workbench");
                }}
              >
                <span>Ir para Prática</span>
                <ArrowRight size={13} />
              </button>
            ) : (isAlreadyCompleted || allObjectivesNowDone) ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="ce-btn ce-btn-ghost ce-btn-sm"
                  onClick={() => setActiveTab("retain")}
                >
                  <BrainCircuit size={13} />
                  <span>Revisar &amp; Fixar</span>
                </button>
                {nextLesson && (
                  <button
                    type="button"
                    className={`ce-btn ce-btn-track ce-btn-sm ${track.darkTextOnAccent ? "is-dark-text" : ""}`}
                    onClick={() => navigate(`/trilhas/${track.id}/aula/${nextLesson.id}`)}
                  >
                    <span>Próxima aula</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            ) : null}
          </div>
          )}
        </section>

        {/* COLUNA WORKBENCH ADAPTATIVO (sempre montado para preservar estado) */}
        <div
          className={`ce-workbench-slot ${mobilePane === "content" ? "is-mobile-hidden" : ""} ${
            !isPracticeSplit ? "is-workbench-hidden" : ""
          }`}
        >
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

          {lesson.workbench === "web" && (
            <WebWorkbench
              projectKey={`lesson:${lesson.id}`}
              value={code}
              starterValue={lesson.starterCode}
              inspection={lesson.webInspection}
              saveStatus={saveStatus}
              saveError={saveError}
              onChangeValue={handleChangeCode}
              onEvaluate={handleEvaluate}
              accentColor={track.accentColor}
              darkTextOnAccent={track.darkTextOnAccent}
            />
          )}
        </div>
      </div>
    </div>
  );
};
