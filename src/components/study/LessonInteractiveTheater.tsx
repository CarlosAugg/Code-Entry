import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  CirclePlay,
  Code2,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  Terminal,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { LessonStageBackground } from "../motion/LessonStageBackground";
import { LiaRobotMascot, playLiaEasterEggSound } from "./LiaRobotMascot";
import { TheaterVisualStage } from "./TheaterVisualStage";
import { loadTheaterScript } from "../../data/theater/registry";
import {
  getActSpokenNarration,
  stripCueMarkdown,
  type LiaEasterEgg,
  type LiaExpression,
  type LiaPlacement,
  type LiaPointing,
  type TheaterActRuntime,
  type TheaterCodeLine,
  type TheaterCodeToken,
  type TheaterLessonScript,
} from "../../types/theater";
import type { Lesson, TrackMeta } from "../../types/curriculum";

function resolveAudioUrl(lessonId: string, file: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base.endsWith("/") ? base : `${base}/`}audio/lessons/${lessonId}/${file}`;
}

function speakFallback(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const ptFemale =
    voices.find(
      v =>
        v.lang.toLowerCase().startsWith("pt-br") &&
        /francisca|thalita|maria|luciana|leticia|female|feminina|google português/i.test(v.name)
    ) ??
    voices.find(v => v.lang.toLowerCase().startsWith("pt-br")) ??
    voices.find(v => v.lang.toLowerCase().startsWith("pt")) ??
    null;
  u.voice = ptFemale;
  u.lang = ptFemale?.lang || "pt-BR";
  u.rate = 1.02;
  u.pitch = 1.05;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

const HighlightedCaption: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="ce-video-subtitle">
      {parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={idx} className="ce-sub-highlight">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </p>
  );
};

function renderTypedTokens(tokens: TheaterCodeToken[], progress?: number): React.ReactNode {
  if (progress === undefined || progress >= 1) {
    return tokens.map((tok, i) => {
      const cls =
        tok.kind === "kw"
          ? "ce-tok-kw"
          : tok.kind === "fn"
            ? "ce-tok-fn"
            : tok.kind === "str"
              ? "ce-tok-str"
              : tok.kind === "num"
                ? "ce-tok-num"
                : tok.kind === "var-violet"
                  ? "ce-tok-var-violet"
                  : tok.kind === "var-cyan"
                    ? "ce-tok-var-cyan"
                    : tok.kind === "comment"
                      ? "ce-code-comment"
                      : "";
      const fullCls = [cls, tok.pulse ? "is-pulsing-token" : ""].filter(Boolean).join(" ");
      return fullCls ? (
        <span key={i} className={fullCls}>
          {tok.text}
        </span>
      ) : (
        <React.Fragment key={i}>{tok.text}</React.Fragment>
      );
    });
  }

  const fullText = tokens.map(t => t.text).join("");
  if (progress <= 0) {
    return <span style={{ opacity: 0.25 }}>{fullText}</span>;
  }
  const len = Math.max(1, Math.floor(progress * fullText.length));
  return fullText.slice(0, len);
}

function renderCodeLine(line: TheaterCodeLine) {
  const spotCls =
    line.spotlight === "violet"
      ? "is-spotlight-violet"
      : line.spotlight === "cyan"
        ? "is-spotlight-cyan"
        : line.spotlight === "amber"
          ? "is-spotlight-amber"
          : line.spotlight === "green"
            ? "is-spotlight-green"
            : "";

  const pillCls =
    line.pointerPill?.tone === "cyan"
      ? "is-cyan"
      : line.pointerPill?.tone === "amber"
        ? "is-amber"
        : line.pointerPill?.tone === "green"
          ? "is-green"
          : "";

  return (
    <div
      key={line.lineNumber}
      className={`ce-lia-cline ${spotCls}`}
      style={line.dimmed ? { opacity: 0.42 } : undefined}
    >
      <span className="ce-ln">{line.lineNumber}</span>
      <code>{renderTypedTokens(line.tokens, line.typeProgress)}</code>
      {line.pointerPill && (
        <span className={`ce-code-pointer-pill ${pillCls}`}>{line.pointerPill.text}</span>
      )}
    </div>
  );
}

interface LessonInteractiveTheaterProps {
  lesson: Lesson;
  track: TrackMeta;
  onGoToPractice: () => void;
  onGoToExamples: () => void;
  onSwitchToTextMode: () => void;
}

const LIA_VOLUME_KEY = "ce-lia-audio-volume";
const LIA_MUTED_KEY = "ce-lia-audio-muted";

function readSavedVolume(): number {
  if (typeof window === "undefined") return 0.9;
  try {
    const raw = window.localStorage.getItem(LIA_VOLUME_KEY);
    if (raw === null) return 0.9;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 0.9;
  } catch {
    return 0.9;
  }
}

function readSavedMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(LIA_MUTED_KEY) === "true";
  } catch {
    return false;
  }
}

export const LessonInteractiveTheater: React.FC<LessonInteractiveTheaterProps> = ({
  lesson,
  track,
  onGoToPractice,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [script, setScript] = useState<TheaterLessonScript | null>(null);
  const [actIndex, setActIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [actRatio, setActRatio] = useState(0);
  const [volume, setVolume] = useState<number>(readSavedVolume);
  const [muted, setMuted] = useState<boolean>(readSavedMuted);

  const [easterEgg, setEasterEgg] = useState<LiaEasterEgg>(null);
  const eggCountRef = useRef(0);
  const eggTimerRef = useRef<number | null>(null);

  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | null>(null);
  const [quizSolved, setQuizSolved] = useState(false);
  const [overrideCue, setOverrideCue] = useState<string | null>(null);

  const [values, setValues] = useState<Record<string, string>>({});
  const [executedValues, setExecutedValues] = useState<Record<string, string>>({});
  const [sandboxRan, setSandboxRan] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const playbackTokenRef = useRef(0);
  const playbackModeRef = useRef<"audio" | "visual">("visual");
  const elapsedMsRef = useRef(0);
  const lastTickTsRef = useRef(0);
  const activeDurationMsRef = useRef(10000);
  const onCompleteRef = useRef<(() => void) | null>(null);
  const isFeedbackPlayingRef = useRef(false);

  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const activeLessonIdRef = useRef(lesson.id);
  activeLessonIdRef.current = lesson.id;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
    try {
      window.localStorage.setItem(LIA_VOLUME_KEY, String(volume));
      window.localStorage.setItem(LIA_MUTED_KEY, String(muted));
    } catch {
      // Ignora caso storage esteja bloqueado
    }
  }, [volume, muted]);

  const cancelRaf = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const stopAllPlayback = useCallback(() => {
    playbackTokenRef.current += 1;
    cancelRaf();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    elapsedMsRef.current = 0;
    onCompleteRef.current = null;
    isFeedbackPlayingRef.current = false;
    setSpeaking(false);
  }, [cancelRaf]);

  // Reseta o teatro ao trocar de aula
  useEffect(() => {
    stopAllPlayback();
    setIsOpen(false);
    setScript(null);
    setActIndex(0);
    setPlaying(false);
    setActRatio(0);
    setSelectedOption(null);
    setQuizSolved(false);
    setOverrideCue(null);
    setValues({});
    setExecutedValues({});
    setSandboxRan(false);
    setStepIndex(0);
  }, [lesson.id, stopAllPlayback]);

  useEffect(() => {
    return () => {
      stopAllPlayback();
      if (eggTimerRef.current) window.clearTimeout(eggTimerRef.current);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, [stopAllPlayback]);

  const handleLiaEasterEggClick = () => {
    const reactions: Array<"jump" | "startle" | "love"> = ["jump", "startle", "love"];
    const nextReaction = reactions[eggCountRef.current % reactions.length];
    eggCountRef.current += 1;
    setEasterEgg(nextReaction);
    playLiaEasterEggSound(nextReaction);

    if (eggTimerRef.current) window.clearTimeout(eggTimerRef.current);
    eggTimerRef.current = window.setTimeout(() => {
      setEasterEgg(null);
    }, 1150);
  };

  const runVisualClockLoop = useCallback(
    (myToken: number) => {
      cancelRaf();
      lastTickTsRef.current = performance.now();

      const tick = (now: number) => {
        if (playbackTokenRef.current !== myToken) return;
        const dt = Math.min(200, Math.max(0, now - lastTickTsRef.current));
        lastTickTsRef.current = now;
        elapsedMsRef.current += dt;

        const duration = Math.max(1000, activeDurationMsRef.current);
        const nextRatio = Math.min(1, elapsedMsRef.current / duration);
        if (!isFeedbackPlayingRef.current) {
          setActRatio(nextRatio);
        }

        if (elapsedMsRef.current >= duration) {
          cancelRaf();
          setSpeaking(false);
          const done = onCompleteRef.current;
          onCompleteRef.current = null;
          done?.();
          return;
        }
        rafRef.current = window.requestAnimationFrame(tick);
      };

      rafRef.current = window.requestAnimationFrame(tick);
    },
    [cancelRaf]
  );

  const runAudioSyncLoop = useCallback(
    (myToken: number) => {
      cancelRaf();
      lastTickTsRef.current = performance.now();

      const tick = (now: number) => {
        if (playbackTokenRef.current !== myToken) return;
        const dt = Math.min(200, Math.max(0, now - lastTickTsRef.current));
        lastTickTsRef.current = now;
        elapsedMsRef.current += dt;

        if (!isFeedbackPlayingRef.current) {
          if (
            audioRef.current &&
            audioRef.current.duration > 0 &&
            !Number.isNaN(audioRef.current.duration)
          ) {
            setActRatio(Math.min(1, audioRef.current.currentTime / audioRef.current.duration));
          } else {
            setActRatio(Math.min(1, elapsedMsRef.current / Math.max(1000, activeDurationMsRef.current)));
          }
        }
        rafRef.current = window.requestAnimationFrame(tick);
      };

      rafRef.current = window.requestAnimationFrame(tick);
    },
    [cancelRaf]
  );

  const startSegment = useCallback(
    (opts: {
      audioFile?: string;
      fallbackText: string;
      durationMs: number;
      isFeedback?: boolean;
      onDone?: () => void;
    }) => {
      stopAllPlayback();
      const myToken = playbackTokenRef.current;
      isFeedbackPlayingRef.current = Boolean(opts.isFeedback);
      activeDurationMsRef.current = opts.durationMs;
      elapsedMsRef.current = 0;
      onCompleteRef.current = opts.onDone ?? null;

      if (!opts.isFeedback) {
        setActRatio(0);
      }

      if (opts.audioFile) {
        let fellBack = false;
        const fallbackToVisual = () => {
          if (fellBack || playbackTokenRef.current !== myToken) return;
          fellBack = true;
          if (audioRef.current) {
            audioRef.current.onended = null;
            audioRef.current.onerror = null;
            audioRef.current = null;
          }
          playbackModeRef.current = "visual";
          setSpeaking(true);
          if (!mutedRef.current) {
            speakFallback(opts.fallbackText);
          }
          runVisualClockLoop(myToken);
        };

        playbackModeRef.current = "audio";
        const audio = new Audio(resolveAudioUrl(activeLessonIdRef.current, opts.audioFile));
        audio.volume = mutedRef.current ? 0 : volumeRef.current;
        audioRef.current = audio;
        setSpeaking(true);

        const finish = () => {
          if (playbackTokenRef.current !== myToken) return;
          cancelRaf();
          if (!opts.isFeedback) setActRatio(1);
          setSpeaking(false);
          const done = onCompleteRef.current;
          onCompleteRef.current = null;
          done?.();
        };

        audio.onended = finish;
        audio.onerror = () => {
          if (playbackTokenRef.current !== myToken) return;
          fallbackToVisual();
        };

        runAudioSyncLoop(myToken);
        audio.play().catch((err: unknown) => {
          if (playbackTokenRef.current !== myToken) return;
          const errName = err instanceof Error ? err.name : "";
          if (errName === "NotAllowedError") {
            cancelRaf();
            setSpeaking(false);
            setPlaying(false);
            return;
          }
          fallbackToVisual();
        });
      } else {
        playbackModeRef.current = "visual";
        setSpeaking(true);
        runVisualClockLoop(myToken);
      }
    },
    [cancelRaf, runAudioSyncLoop, runVisualClockLoop, stopAllPlayback]
  );

  const playActOnScript = useCallback(
    (targetScript: TheaterLessonScript, targetIdx: number, shouldPlay = true) => {
      const clamped = Math.max(0, Math.min(targetIdx, targetScript.acts.length - 1));
      stopAllPlayback();
      setActIndex(clamped);
      setActRatio(0);
      setOverrideCue(null);

      const act = targetScript.acts[clamped];
      if (!shouldPlay) {
        setPlaying(false);
        setActRatio(1);
        return;
      }

      setPlaying(true);
      startSegment({
        audioFile: act.audioFile,
        fallbackText: getActSpokenNarration(act),
        durationMs: act.durationMs,
        onDone: () => {
          if (act.interaction) {
            setPlaying(false);
            return;
          }
          if (clamped < targetScript.acts.length - 1) {
            playActOnScript(targetScript, clamped + 1, true);
          } else {
            setPlaying(false);
          }
        },
      });
    },
    [startSegment, stopAllPlayback]
  );

  const goToAct = useCallback(
    (targetIdx: number, shouldPlay = true) => {
      if (!script) return;
      playActOnScript(script, targetIdx, shouldPlay);
    },
    [playActOnScript, script]
  );

  const closeTimerRef = useRef<number | null>(null);

  const handleOpenAndPlay = async () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    const loaded = script ?? (await loadTheaterScript(lesson.id));
    if (!loaded) return;
    setScript(loaded);
    setValues({ ...loaded.initialValues });
    setExecutedValues({ ...loaded.initialValues });
    setSelectedOption(null);
    setQuizSolved(false);
    setSandboxRan(false);
    setStepIndex(0);
    setIsClosing(false);
    setIsOpen(true);
    playActOnScript(loaded, 0, true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("ce-tour-auto-theater") === "1") {
      window.sessionStorage.removeItem("ce-tour-auto-theater");
      void handleOpenAndPlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  const handleCloseTheater = useCallback(() => {
    stopAllPlayback();
    setPlaying(false);
    const reduced =
      typeof document !== "undefined" &&
      (document.documentElement.classList.contains("reduced-motion") ||
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    if (reduced) {
      setIsOpen(false);
      setIsClosing(false);
      return;
    }
    setIsClosing(true);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 220);
  }, [stopAllPlayback]);

  const currentAct = script?.acts[actIndex] ?? script?.acts[0] ?? null;

  const handleTogglePause = useCallback(() => {
    if (!script || !currentAct) return;
    if (playing) {
      cancelRaf();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setPlaying(false);
      setSpeaking(false);
      return;
    }

    // Se já terminou o ato (ou estava em feedback concluído), reinicia o ato suavemente
    if (isFeedbackPlayingRef.current || actRatio >= 0.995) {
      goToAct(actIndex, true);
      return;
    }

    const myToken = playbackTokenRef.current;
    if (playbackModeRef.current === "audio" && audioRef.current) {
      setPlaying(true);
      setSpeaking(true);
      runAudioSyncLoop(myToken);
      audioRef.current.play().catch(() => {
        setPlaying(false);
        setSpeaking(false);
      });
    } else if (elapsedMsRef.current > 0 && elapsedMsRef.current < activeDurationMsRef.current) {
      setPlaying(true);
      setSpeaking(true);
      runVisualClockLoop(myToken);
    } else {
      goToAct(actIndex, true);
    }
  }, [actIndex, actRatio, cancelRaf, currentAct, goToAct, playing, runAudioSyncLoop, runVisualClockLoop, script]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (e.key === "Escape") {
        e.stopPropagation();
        handleCloseTheater();
        return;
      }
      if (isTyping) return;

      if (e.code === "Space") {
        e.preventDefault();
        handleTogglePause();
      } else if (e.key === "ArrowRight" && script && actIndex < script.acts.length - 1) {
        e.preventDefault();
        goToAct(actIndex + 1, true);
      } else if (e.key === "ArrowLeft" && actIndex > 0) {
        e.preventDefault();
        goToAct(actIndex - 1, true);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [actIndex, goToAct, handleCloseTheater, handleTogglePause, isOpen, script]);

  const handlePickOption = (opt: "A" | "B" | "C") => {
    if (!currentAct || currentAct.interaction?.kind !== "quiz") return;
    const quiz = currentAct.interaction;
    setSelectedOption(opt);
    if (opt === quiz.correctId) {
      setQuizSolved(true);
    }
    const fb = quiz.feedback[opt];
    setOverrideCue(fb.cue);
    setPlaying(true);
    startSegment({
      audioFile: fb.audioFile,
      fallbackText: fb.spoken ?? stripCueMarkdown(fb.cue),
      durationMs: fb.durationMs ?? 8000,
      isFeedback: true,
      onDone: () => {
        setPlaying(false);
      },
    });
  };

  const handleRunSandbox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAct || currentAct.interaction?.kind !== "sandbox") return;
    setExecutedValues({ ...values });
    setSandboxRan(true);
    window.setTimeout(() => setSandboxRan(false), 950);

    const fb = currentAct.interaction.feedback;
    setOverrideCue(fb.cue);
    setPlaying(true);
    startSegment({
      audioFile: fb.audioFile,
      fallbackText: fb.spoken ?? stripCueMarkdown(fb.cue),
      durationMs: fb.durationMs ?? 7000,
      isFeedback: true,
      onDone: () => {
        setPlaying(false);
      },
    });
  };

  const activeSubtitle = useMemo(() => {
    if (!currentAct) return "";
    if (overrideCue) return overrideCue;
    const cues = currentAct.cues;
    const found = cues.find(c => actRatio >= c.from && actRatio <= c.to);
    return found ? found.text : cues[cues.length - 1]?.text || "";
  }, [actRatio, currentAct, overrideCue]);

  const runtime: TheaterActRuntime = useMemo(
    () => ({
      values,
      executedValues,
      ratio: actRatio,
      selectedOption,
      quizSolved,
      sandboxRan,
      stepIndex,
    }),
    [actRatio, executedValues, quizSolved, sandboxRan, selectedOption, stepIndex, values]
  );

  const liaStage = useMemo(() => {
    if (!currentAct) {
      return {
        visible: false,
        expression: "happy" as LiaExpression,
        pointing: "none" as LiaPointing,
        placement: "corner-left" as LiaPlacement,
        callout: undefined as string | undefined,
      };
    }

    const custom = currentAct.getLiaStage?.(runtime);
    let visible = custom ? custom.visible : false;
    if (!custom) {
      if (currentAct.liaVisible === "always") visible = true;
      else if (currentAct.liaVisible === "never") visible = false;
      else if (currentAct.liaVisible === "on-feedback") visible = Boolean(overrideCue);
      else visible = actRatio < 0.58;
    }

    let expression: LiaExpression = custom?.expression ?? currentAct.liaExpression ?? "happy";
    let callout = custom?.callout;

    if (quizSolved || (currentAct.interaction?.kind === "sandbox" && overrideCue && !custom)) {
      expression = "starry";
    } else if (
      selectedOption &&
      currentAct.interaction?.kind === "quiz" &&
      selectedOption !== currentAct.interaction.correctId
    ) {
      expression = "explaining";
      callout = callout ?? "Olha o detalhe!";
    }

    return {
      visible,
      expression,
      pointing: custom?.pointing ?? ("none" as LiaPointing),
      placement: custom?.placement ?? ("corner-left" as LiaPlacement),
      callout,
    };
  }, [actRatio, currentAct, overrideCue, quizSolved, runtime, selectedOption]);

  const launcherCard = (
    <div
      className="ce-lia-launcher-card"
      style={{ "--theater-accent": track.accentColor } as React.CSSProperties}
    >
      <div className="ce-lia-launcher-left">
        <div className="ce-lia-launcher-avatar">
          <LiaRobotMascot expression="wink" speaking={false} visible />
        </div>
        <div className="ce-lia-launcher-copy">
          <span className="ce-lia-launcher-tag">
            <Sparkles size={11} />
            <span>AULA INTERATIVA EM TELA CHEIA · COM A LIA</span>
          </span>
          <strong>Prefere aprender com uma explicação animada e passo a passo?</strong>
          <span>
            Dê play para abrir o teatro interativo da Lia (ou continue lendo o resumo em texto abaixo enquanto pratica).
          </span>
        </div>
      </div>

      <button type="button" className="ce-lia-launcher-play" onClick={handleOpenAndPlay}>
        <CirclePlay size={19} />
        <span>Assistir aula com a Lia</span>
      </button>
    </div>
  );

  if (!isOpen || !script || !currentAct) {
    return launcherCard;
  }

  const visualModel = currentAct.getVisual(runtime);
  const codeLines = currentAct.getCodeLines(runtime);
  const consoleOutputText = currentAct.getConsoleOutput(runtime);
  const interaction = currentAct.interaction;
  const isLastAct = actIndex === script.acts.length - 1;
  const stageLayout = currentAct.layout ?? "split";
  const activeVisualTitle = currentAct.visualTitle ?? script.visualTitle;
  const activeCodeTitle = currentAct.codeTitle ?? script.codeTitle;
  const hasRecordedAudio = Boolean(currentAct.audioFile);
  const themeVariant = currentAct.themeVariant ?? "default";

  const theaterFullscreen = (
    <div
      className={`ce-lia-fullscreen is-theme-${themeVariant} ${isClosing ? "is-closing" : "is-entering"}`}
      style={{ "--theater-accent": track.accentColor } as React.CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label={`Aula Interativa com a Lia · ${lesson.title}`}
    >
      <div className="ce-lia-aurora-bg" aria-hidden="true">
        <LessonStageBackground />
        <div className="ce-lia-bg-orb is-orb-1" />
        <div className="ce-lia-bg-orb is-orb-2" />
      </div>

      <header className="ce-lia-top">
        <div className="ce-lia-top-meta">
          <span className="ce-lia-step-counter">
            Cena {actIndex + 1}/{script.acts.length}
          </span>
          {!hasRecordedAudio && (
            <span
              className="ce-lia-mode-badge"
              title="Esta aula está rodando em modo visual guiado sincronizado. A narração em áudio será adicionada em uma próxima etapa."
            >
              Modo visual guiado · áudio em produção
            </span>
          )}
        </div>

        <nav className="ce-lia-milestones" aria-label="Etapas da aula">
          {script.acts.map((act, idx) => {
            const isActive = idx === actIndex;
            const isDone = idx < actIndex;
            const label = act.milestoneLabel ?? `Ato ${idx + 1}`;
            return (
              <button
                key={act.id}
                type="button"
                className={`ce-lia-milestone-pill ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}`}
                onClick={() => goToAct(idx, true)}
                title={`${idx + 1}. ${act.title}`}
                aria-label={`Ir para etapa ${idx + 1}: ${act.title}`}
                aria-current={isActive ? "step" : undefined}
              >
                {isActive && (
                  <span
                    className="ce-lia-milestone-fill"
                    style={{ width: `${Math.round(actRatio * 100)}%` }}
                    aria-hidden="true"
                  />
                )}
                <span className="ce-lia-milestone-num">{idx + 1}</span>
                <span className="ce-lia-milestone-text">{label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <button
        type="button"
        className="ce-lia-slide-prev"
        onClick={handleCloseTheater}
        title="Voltar para o resumo em texto da aula (Esc)"
      >
        <ChevronLeft size={19} />
        <span>Texto</span>
      </button>

      <button
        type="button"
        className={`ce-lia-slide-next ${isLastAct ? "is-ready" : ""}`}
        onClick={() => {
          handleCloseTheater();
          onGoToPractice();
        }}
        title="Encerrar apresentação e ir para a Prática no editor"
      >
        <span className="ce-lia-slide-next-text">Praticar</span>
        <ChevronRight size={19} />
      </button>

      <main
        className={`ce-lia-stage-grid is-layout-${stageLayout}`}
        key={`${script.lessonId}-${currentAct.id}-${stageLayout}`}
      >
        {stageLayout !== "code-focus" && (
          <section
            className={`ce-lia-col-visual ${
              stageLayout === "center-story"
                ? "is-centered-stage"
                : stageLayout === "visual-focus"
                  ? "is-wide-focus"
                  : ""
            }`}
            aria-label={activeVisualTitle}
          >
            {stageLayout !== "center-story" && (
              <div className="ce-lia-section-title">
                <Sparkles size={15} style={{ color: "var(--accent-primary)" }} />
                <span>{activeVisualTitle}</span>
              </div>
            )}
            <TheaterVisualStage model={visualModel} />
          </section>
        )}

        {stageLayout === "split" && <div className="ce-lia-vertical-divider" aria-hidden="true" />}

        {(stageLayout === "split" || stageLayout === "code-focus") && (
          <section
            className={`ce-lia-col-code ${stageLayout === "code-focus" ? "is-wide-focus" : ""}`}
            aria-label={activeCodeTitle}
          >
            <div className="ce-lia-section-title">
              <Code2 size={15} style={{ color: "var(--accent-secondary)" }} />
              <span>{activeCodeTitle}</span>
            </div>

            <div className="ce-lia-code-canvas">
              <div className="ce-lia-code-editor">{codeLines.map(renderCodeLine)}</div>

              <div className={`ce-lia-console ${consoleOutputText ? "has-output" : ""}`}>
                <div className="ce-lia-console-head">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Terminal size={12} />
                    <span>{script.consoleTitle ?? "SAÍDA DO CONSOLE"}</span>
                  </span>
                  <span className="ce-lia-console-status">
                    {consoleOutputText ? "Executado com sucesso" : "Aguardando execução"}
                  </span>
                </div>
                <div className="ce-lia-console-body">
                  {consoleOutputText ? (
                    <div className="ce-theater-console-result">
                      <span className="ce-prompt">&gt;</span>
                      <strong>{consoleOutputText}</strong>
                    </div>
                  ) : (
                    <span className="ce-theater-console-wait">
                      O resultado da execução aparecerá aqui...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {interaction?.kind === "quiz" && (
        <div className="ce-lia-dock-shell">
          <div className="ce-lia-floating-dock" role="region" aria-label="Desafio interativo da Lia">
            <div className="ce-lia-dock-head">
              <div className="ce-lia-dock-title">
                <Play size={13} style={{ color: "var(--accent-primary)" }} />
                <strong>{interaction.prompt}</strong>
              </div>

              {!quizSolved && (
                <button
                  type="button"
                  className="ce-lia-dock-skip"
                  onClick={() => goToAct(actIndex + 1, true)}
                >
                  <span>Pular questão</span>
                  <SkipForward size={12} />
                </button>
              )}
            </div>

            <div className="ce-lia-dock-options">
              {interaction.options.map(opt => {
                const isPicked = selectedOption === opt.id;
                const isRight = opt.id === interaction.correctId;
                const stateCls =
                  isPicked && isRight
                    ? "is-correct"
                    : isPicked && !isRight
                      ? "is-wrong"
                      : quizSolved && isRight
                        ? "is-correct"
                        : "";
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`ce-lia-opt-card ${stateCls}`}
                    onClick={() => handlePickOption(opt.id)}
                  >
                    <span className="ce-lia-opt-badge">{opt.id}</span>
                    <code>{opt.label}</code>
                    {stateCls === "is-correct" && <Check size={15} className="ce-quiz-icon-ok" />}
                    {stateCls === "is-wrong" && <X size={15} className="ce-quiz-icon-err" />}
                  </button>
                );
              })}
            </div>
          </div>

          {quizSolved && !isLastAct && (
            <button
              type="button"
              className="ce-lia-side-play-btn"
              onClick={() => goToAct(actIndex + 1, true)}
              title={interaction.nextLabel ?? "Continuar aula"}
              aria-label={interaction.nextLabel ?? "Continuar aula"}
            >
              <Play size={20} fill="currentColor" />
            </button>
          )}
        </div>
      )}

      {interaction?.kind === "stepper" && (
        <div className="ce-lia-dock-shell">
          <div className="ce-lia-floating-dock is-compact-dock" role="region" aria-label="Passo a passo interativo">
            <div className="ce-th-stepper-bar">
              <span className="ce-lia-dock-title">
                <Play size={13} style={{ color: "var(--accent-primary)" }} />
                <strong>{interaction.prompt}</strong>
              </span>
              <div className="ce-th-stepper-actions">
                <button
                  type="button"
                  className="ce-lia-dock-skip"
                  onClick={() => setStepIndex(0)}
                  disabled={stepIndex === 0}
                >
                  <RotateCcw size={12} />
                  <span>{interaction.resetLabel ?? "Reiniciar"}</span>
                </button>
                {stepIndex < interaction.maxSteps && (
                  <button
                    type="button"
                    className="ce-btn ce-btn-primary ce-btn-sm"
                    onClick={() => setStepIndex(s => Math.min(interaction.maxSteps, s + 1))}
                  >
                    <span>{interaction.stepButtonLabel ?? "Próximo passo →"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {stepIndex >= interaction.maxSteps && !isLastAct && (
            <button
              type="button"
              className="ce-lia-side-play-btn"
              onClick={() => goToAct(actIndex + 1, true)}
              title="Continuar aula"
              aria-label="Continuar aula"
            >
              <Play size={20} fill="currentColor" />
            </button>
          )}
        </div>
      )}

      {interaction?.kind === "sandbox" && (
        <div className="ce-lia-dock-shell">
          <div className="ce-lia-floating-dock is-compact-dock" role="region" aria-label="Simulador interativo">
            <form className="ce-lia-sandbox-bar" onSubmit={handleRunSandbox}>
            {interaction.fields.map(field => {
              if (field.type === "toggle") {
                const isOn = values[field.key] === "true";
                return (
                  <button
                    key={field.key}
                    type="button"
                    className={`ce-th-toggle-btn ${isOn ? "is-on" : ""}`}
                    onClick={() =>
                      setValues(prev => ({ ...prev, [field.key]: isOn ? "false" : "true" }))
                    }
                  >
                    <span>{field.label}</span>
                    <strong>{isOn ? "ativado" : "desativado"}</strong>
                  </button>
                );
              }
              if (field.type === "select" && field.options) {
                return (
                  <label key={field.key} className="ce-lia-sandbox-input">
                    <span>{field.label}</span>
                    <select
                      className="ce-th-select"
                      value={values[field.key] ?? field.options[0]?.value ?? ""}
                      onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    >
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }
              return (
                <div
                  key={field.key}
                  className={`ce-lia-sandbox-input ${field.short ? "is-short" : ""}`}
                >
                  <span>{field.label}</span>
                  <input
                    type={field.type}
                    step={field.type === "number" ? "any" : undefined}
                    maxLength={field.maxLength}
                    min={field.min}
                    max={field.max}
                    value={values[field.key] ?? ""}
                    onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    aria-label={field.label}
                  />
                </div>
              );
            })}

            <button type="submit" className="ce-btn ce-btn-primary ce-btn-sm">
              <Play size={13} />
              <span>{interaction.submitLabel ?? "Executar"}</span>
            </button>
          </form>
          </div>
        </div>
      )}

      <footer className="ce-lia-footer">
        <LiaRobotMascot
          expression={liaStage.expression}
          speaking={speaking}
          visible={liaStage.visible}
          pointing={liaStage.pointing}
          placement={liaStage.placement}
          callout={liaStage.callout}
          easterEgg={easterEgg}
          onClick={handleLiaEasterEggClick}
        />

        {hasRecordedAudio && (
          <div
            className={`ce-lia-vol-dock ${liaStage.visible ? "is-with-lia" : ""}`}
            role="group"
            aria-label="Volume da narração da Lia"
          >
            <button
              type="button"
              className="ce-lia-vol-btn"
              onClick={() => setMuted(m => !m)}
              title={muted || volume === 0 ? "Ativar som da Lia" : "Silenciar Lia"}
              aria-label={muted || volume === 0 ? "Ativar som da Lia" : "Silenciar Lia"}
            >
              {muted || volume === 0 ? (
                <VolumeX size={17} />
              ) : volume < 0.45 ? (
                <Volume1 size={17} />
              ) : (
                <Volume2 size={17} />
              )}
            </button>

            <div className="ce-lia-vol-slider-wrap">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={e => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  if (v > 0 && muted) setMuted(false);
                }}
                className="ce-lia-vol-slider"
                aria-label="Nível de volume da Lia"
              />
            </div>
          </div>
        )}

        <div className="ce-lia-subtitle-stage" aria-live="polite">
          <HighlightedCaption key={activeSubtitle} text={activeSubtitle} />
        </div>

        <div className="ce-lia-controls-row">
          <button
            type="button"
            className="ce-lia-nav-btn"
            onClick={() => goToAct(actIndex - 1, true)}
            disabled={actIndex === 0}
            title="Cena anterior (Seta esquerda)"
            aria-label="Cena anterior"
          >
            <SkipBack size={14} />
            <span>Anterior</span>
          </button>

          <button type="button" className="ce-lia-pause-btn" onClick={handleTogglePause}>
            {playing ? (
              <>
                <CirclePause size={16} />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <CirclePlay size={16} />
                <span>{actRatio >= 0.995 ? "Rever cena" : "Continuar"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="ce-lia-nav-btn is-icon-only"
            onClick={() => goToAct(actIndex, true)}
            title="Reiniciar cena atual"
            aria-label="Reiniciar cena atual"
          >
            <RotateCcw size={14} />
          </button>

          <button
            type="button"
            className="ce-lia-nav-btn"
            onClick={() => goToAct(actIndex + 1, true)}
            disabled={isLastAct}
            title="Próxima cena (Seta direita)"
            aria-label="Próxima cena"
          >
            <span>Próxima</span>
            <SkipForward size={14} />
          </button>
        </div>
      </footer>
    </div>
  );

  if (typeof document !== "undefined") {
    return (
      <>
        {launcherCard}
        {createPortal(theaterFullscreen, document.body)}
      </>
    );
  }

  return theaterFullscreen;
};
