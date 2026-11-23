export type LiaExpression = "happy" | "wink" | "curious" | "starry" | "explaining" | "startled";
export type LiaEasterEgg = "jump" | "startle" | "love" | null;
export type LiaPointing = "none" | "right" | "left" | "up" | "down";
export type LiaPlacement = "corner-left" | "corner-right";
export type TheaterStageLayout = "split" | "center-story" | "visual-focus" | "code-focus";
export type TheaterThemeVariant =
  | "default"
  | "math-amber"
  | "flow-emerald"
  | "bool-cyan"
  | "ladder-violet"
  | "loop-indigo"
  | "array-amber"
  | "fn-teal"
  | "capstone-aurora";

export interface LiaStageDirective {
  visible: boolean;
  expression?: LiaExpression;
  pointing?: LiaPointing;
  placement?: LiaPlacement;
  callout?: string;
}

export interface SubtitleCue {
  from: number;
  to: number;
  text: string;
  /** Texto exato para fala (opcional; se omitido, usa `text` sem os marcadores **). */
  spoken?: string;
}

export interface TheaterCodeToken {
  text: string;
  kind?: "plain" | "kw" | "fn" | "str" | "num" | "var-violet" | "var-cyan" | "comment";
  pulse?: boolean;
}

export interface TheaterCodeLine {
  lineNumber: number;
  tokens: TheaterCodeToken[];
  spotlight?: "violet" | "cyan" | "amber" | "green";
  pointerPill?: {
    text: string;
    tone?: "violet" | "cyan" | "amber" | "green";
  };
  dimmed?: boolean;
  /** Se definido (0..1), anima efeito de digitação proporcional ao progresso do ato. */
  typeProgress?: number;
}

export interface TheaterQuizOption {
  id: "A" | "B" | "C";
  label: string;
}

export interface TheaterFeedbackScript {
  /** Preenchido apenas quando o .mp3 existe em public/audio/lessons/<lessonId>/. */
  audioFile?: string;
  /** Nome planejado do áudio para produção futura sem gerar 404 em runtime. */
  plannedAudioFile?: string;
  cue: string;
  /** Texto exato para TTS; se omitido, deriva de `cue` sem `**`. */
  spoken?: string;
  durationMs?: number;
}

export interface TheaterQuizInteraction {
  kind: "quiz";
  prompt: string;
  options: TheaterQuizOption[];
  correctId: "A" | "B" | "C";
  feedback: Record<"A" | "B" | "C", TheaterFeedbackScript>;
  nextLabel?: string;
}

export interface TheaterSandboxField {
  key: string;
  label: string;
  type: "text" | "number" | "toggle" | "select";
  maxLength?: number;
  min?: number;
  max?: number;
  short?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export interface TheaterSandboxInteraction {
  kind: "sandbox";
  fields: TheaterSandboxField[];
  submitLabel?: string;
  feedback: TheaterFeedbackScript;
}

export interface TheaterStepperInteraction {
  kind: "stepper";
  prompt: string;
  maxSteps: number;
  stepButtonLabel?: string;
  resetLabel?: string;
  stepFeedback?: (step: number) => string;
}

export type TheaterInteraction =
  | TheaterQuizInteraction
  | TheaterSandboxInteraction
  | TheaterStepperInteraction;

/* --------------------------------------------------------------------------
   MODELOS VISUAIS MODULARES DO PALCO ESQUERDO (ADAPTADOS POR CONTEÚDO)
   -------------------------------------------------------------------------- */
export type TheaterVisualModel =
  | {
      kind: "memory-boxes";
      boxes: Array<{
        id: string;
        label: string;
        typeTag: string;
        value: string;
        caption?: string;
        tone: "violet" | "cyan";
        focused?: boolean;
        dimmed?: boolean;
        callout?: { text: string; tone?: "violet" | "cyan" | "read" };
      }>;
    }
  | {
      kind: "expression-compare";
      cards: Array<{
        id: string;
        badge: string;
        expression: string;
        steps: string[];
        result: string;
        tone: "good" | "bad" | "neutral";
        focused?: boolean;
        note?: string;
      }>;
    }
  | {
      kind: "logic-gates";
      inputs: Array<{ label: string; value: string; truthy: boolean; focused?: boolean }>;
      operator: string;
      expression: string;
      result: boolean;
      resultLabel: string;
      note?: string;
      stage?: 1 | 2 | 3;
    }
  | {
      kind: "branch-flow";
      inputChip: string;
      condition: string;
      conditionResult: boolean;
      trueBranch: { label: string; action: string };
      falseBranch: { label: string; action: string };
      note?: string;
    }
  | {
      kind: "tier-ladder";
      inputLabel: string;
      inputValue: string;
      warning?: string;
      activeRung?: number;
      tiers: Array<{
        condition: string;
        result: string;
        matched: boolean;
        skipped?: boolean;
        wronglyCaught?: boolean;
      }>;
    }
  | {
      kind: "loop-stepper";
      loopLabel: string;
      currentStep: number;
      totalSteps: number;
      vars: Array<{ label: string; value: string; tone?: "violet" | "cyan" | "green" | "amber"; highlight?: boolean }>;
      items?: string[];
      itemsLabel?: string;
      warning?: string;
      statusText: string;
    }
  | {
      kind: "array-scanner";
      arrayLabel: string;
      items: number[];
      activeIndex: number;
      championIndex: number;
      championLabel: string;
      championValue: string;
      comparisonText: string;
      note?: string;
      verdictBadge?: string;
    }
  | {
      kind: "function-machine";
      fnName: string;
      inputLabel: string;
      inputValue: string;
      ruleText: string;
      outputValue: string;
      outputTone?: "violet" | "cyan" | "green" | "amber";
      note?: string;
      phase?: 1 | 2 | 3;
      cases?: Array<{ input: string; output: string; active?: boolean }>;
    }
  | {
      kind: "architecture-flow";
      visibleCount?: number;
      stages: Array<{
        id: string;
        tag: string;
        title: string;
        detail: string;
        active?: boolean;
        tone?: "violet" | "cyan" | "green" | "amber";
      }>;
      summaryCard?: {
        title: string;
        entries: Array<{ key: string; value: string }>;
      };
    }
  | {
      kind: "story-scene";
      eyebrow: string;
      headline: string;
      subtext: string;
      sceneArt: "pizza-split" | "confused-math" | "road-fork" | "vip-bouncer";
      mediaUrl?: string;
      captionBadge?: string;
      floatingTags?: string[];
      tone?: "violet" | "cyan" | "amber" | "green";
    }
  | {
      kind: "svg-flowchart";
      startLabel: string;
      inputBadge: string;
      decisionLabel: string;
      isTrue: boolean;
      trueLabel: string;
      trueAction: string;
      falseLabel: string;
      falseAction: string;
      endLabel: string;
      note?: string;
      highlightPart?: "start" | "decision" | "true" | "false" | "all";
      /** Etapa progressiva de revelação (1=entrada, 2=losango, 3=caminho escolhido, 4=fluxo completo). */
      revealStage?: 1 | 2 | 3 | 4;
      verdictBadge?: string;
      compareBanner?: { text: string; tone: "bad" | "good" | "info" };
      animatePulse?: boolean;
    }
  | {
      kind: "bill-discovery";
      eyebrow: string;
      headline: string;
      /** Etapa progressiva 0..5 sincronizada com as falas da Lia. */
      stage: number;
      caption?: string;
    }
  | {
      kind: "expr-evaluator";
      mode: "single" | "compare";
      showPriorityRuler?: boolean;
      activeRule?: "parens" | "muldiv" | "addsub" | null;
      items: Array<{
        id: string;
        badge: string;
        tone: "bad" | "good" | "neutral";
        focused?: boolean;
        dimmed?: boolean;
        tokens: Array<{
          text: string;
          kind?: "num" | "op" | "paren" | "var";
          active?: boolean;
          grouped?: boolean;
        }>;
        steps: Array<{
          label: string;
          expr: string;
          visible: boolean;
          active?: boolean;
          tone?: "bad" | "good" | "neutral";
        }>;
        finalResult?: string;
        verdictStamp?: string;
        showVerdict?: boolean;
        note?: string;
      }>;
    }
  | {
      kind: "turnstile-scene";
      eyebrow: string;
      headline: string;
      /** Etapa progressiva 0..4 sincronizada com as falas da Lia. */
      stage: number;
      activeTest?: {
        label: string;
        value: string;
        allowed: boolean;
      } | null;
      caption?: string;
    }
  | {
      kind: "concept-hook";
      eyebrow: string;
      headline: string;
      tone?: "violet" | "cyan" | "amber" | "green";
      cards: Array<{
        badge: string;
        title: string;
        value: string;
        state?: "good" | "bad" | "neutral" | "active";
        visible: boolean;
      }>;
      verdict?: { text: string; tone: "good" | "bad" | "info"; visible: boolean };
      caption?: string;
    };

export interface TheaterActRuntime {
  values: Record<string, string>;
  executedValues: Record<string, string>;
  ratio: number;
  selectedOption: "A" | "B" | "C" | null;
  quizSolved: boolean;
  sandboxRan: boolean;
  stepIndex: number;
}

export interface TheaterAct {
  id: string;
  title: string;
  milestoneLabel?: string;
  themeVariant?: TheaterThemeVariant;
  layout?: TheaterStageLayout;
  visualTitle?: string;
  codeTitle?: string;
  /** Preenchido apenas quando o .mp3 existe em public/audio/lessons/<lessonId>/. */
  audioFile?: string;
  /** Nome planejado do áudio para produção futura sem gerar 404 em runtime. */
  plannedAudioFile?: string;
  durationMs: number;
  cues: SubtitleCue[];
  liaVisible?: "start" | "always" | "never" | "on-feedback";
  liaExpression?: LiaExpression;
  getLiaStage?: (rt: TheaterActRuntime) => LiaStageDirective;
  interaction?: TheaterInteraction;
  getCodeLines: (rt: TheaterActRuntime) => TheaterCodeLine[];
  getVisual: (rt: TheaterActRuntime) => TheaterVisualModel;
  getConsoleOutput: (rt: TheaterActRuntime) => string | null;
}

export interface TheaterLessonScript {
  lessonId: string;
  languageLabel: string;
  visualTitle: string;
  codeTitle: string;
  consoleTitle?: string;
  launcherTitle?: string;
  launcherDescription?: string;
  initialValues: Record<string, string>;
  acts: TheaterAct[];
}

/** Remove marcadores de destaque **...** para enviar o texto exato ao TTS mantendo 100% coerência. */
export function stripCueMarkdown(text: string): string {
  return text.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Constrói cues com intervalos `from`/`to` proporcionais ao comprimento real das falas,
 * garantindo sincronia limpa entre a voz da Lia e o texto exibido na tela.
 */
export function buildSyncedCues(parts: Array<{ text: string; spoken?: string }>): SubtitleCue[] {
  const weights = parts.map(p => Math.max(8, stripCueMarkdown(p.spoken ?? p.text).length));
  const total = weights.reduce((acc, w) => acc + w, 0) || 1;
  let cursor = 0;
  return parts.map((p, idx) => {
    const from = cursor / total;
    cursor += weights[idx];
    const to = idx === parts.length - 1 ? 1 : cursor / total;
    return {
      from,
      to,
      text: p.text,
      spoken: p.spoken ?? stripCueMarkdown(p.text),
    };
  });
}

/** Concatena o texto falado de todos os cues de um ato (fonte única de verdade para TTS). */
export function getActSpokenNarration(act: TheaterAct): string {
  return act.cues.map(c => c.spoken ?? stripCueMarkdown(c.text)).join(" ");
}
