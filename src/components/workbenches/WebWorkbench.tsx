import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Braces,
  CheckCircle2,
  Clock,
  Eraser,
  FileCode2,
  Monitor,
  Palette,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Terminal,
  Trash2,
} from "lucide-react";
import type {
  EvaluationContext,
  WebConsoleEntry,
  WebElementReport,
  WebEvaluationState,
  WebInspectionSpec,
  WebInteractionReport,
  WebProjectFiles,
} from "../../types/curriculum";
import {
  EMPTY_WEB_FILES,
  isWebProjectEmpty,
  parseWebFiles,
  serializeWebFiles,
  validateWebFilesSize,
} from "../../engines/web/webFiles";
import {
  WEB_SANDBOX_ATTR,
  WEB_WATCHDOG_MS,
  buildSandboxedSrcDoc,
} from "../../engines/web/webSandbox";
import { CodeEditor, type EditorLanguage } from "../editor/CodeEditor";

type WebFileTab = keyof WebProjectFiles;
type PreviewViewport = "desktop" | "mobile";
type PreviewStatus = "empty" | "running" | "ready" | "error" | "timeout";

interface SandboxReportPayload {
  title?: string;
  lang?: string;
  bodyText?: string;
  elementCount?: number;
  consoleEntries?: WebConsoleEntry[];
  runtimeErrors?: string[];
  queries?: Record<string, WebElementReport>;
  interactions?: Record<string, WebInteractionReport>;
}

interface PendingEvaluation {
  runId: number;
  token: string;
  startMs: number;
  files: WebProjectFiles;
  usesHiddenIframe: boolean;
}

export interface WebWorkbenchProps {
  projectKey: string;
  value: string;
  starterValue: string;
  inspection?: WebInspectionSpec;
  saveStatus?: "idle" | "saving" | "saved" | "error";
  saveError?: string | null;
  onChangeValue: (serialized: string) => void;
  onEvaluate?: (ctx: EvaluationContext, durationMs: number) => void;
  accentColor?: string;
  darkTextOnAccent?: boolean;
  mode?: "lesson" | "lab";
}

const FILE_TABS: {
  id: WebFileTab;
  label: string;
  lang: EditorLanguage;
  hint: string;
}[] = [
  { id: "html", label: "index.html", lang: "html", hint: "Estrutura semântica HTML5" },
  { id: "css", label: "style.css", lang: "css", hint: "Estilos, cores e layout responsivo" },
  { id: "js", label: "script.js", lang: "js", hint: "Lógica no navegador, DOM e eventos" },
];

function makeRunToken(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const WebWorkbench: React.FC<WebWorkbenchProps> = ({
  projectKey,
  value,
  starterValue,
  inspection,
  saveStatus = "idle",
  saveError = null,
  onChangeValue,
  onEvaluate,
  accentColor,
  darkTextOnAccent,
  mode = "lesson",
}) => {
  const starterFiles = useMemo(
    () => parseWebFiles(starterValue, EMPTY_WEB_FILES),
    [starterValue]
  );

  const files = useMemo(
    () => parseWebFiles(value, starterFiles),
    [value, starterFiles]
  );

  const filesRef = useRef<WebProjectFiles>(files);
  filesRef.current = files;

  const lastInternalValueRef = useRef<string>(value);

  const inspectionRef = useRef<WebInspectionSpec | undefined>(inspection);
  inspectionRef.current = inspection;

  const onEvaluateRef = useRef(onEvaluate);
  onEvaluateRef.current = onEvaluate;

  const [activeTab, setActiveTab] = useState<WebFileTab>("html");
  const [autoPreview, setAutoPreview] = useState(true);
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");
  const [previewSrcDoc, setPreviewSrcDoc] = useState<string>("");
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>("empty");
  const [consoleEntries, setConsoleEntries] = useState<WebConsoleEntry[]>([]);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const hiddenHostRef = useRef<HTMLDivElement>(null);
  const hiddenIframeRef = useRef<HTMLIFrameElement | null>(null);
  const tabButtonRefs = useRef<Partial<Record<WebFileTab, HTMLButtonElement | null>>>({});

  const runCounterRef = useRef(0);
  const activePreviewRef = useRef<{ runId: number; token: string } | null>(null);
  const pendingEvalRef = useRef<PendingEvaluation | null>(null);

  const debounceTimerRef = useRef<number | null>(null);
  const previewWatchdogRef = useRef<number | null>(null);
  const evalWatchdogRef = useRef<number | null>(null);

  const clearTimer = (ref: React.MutableRefObject<number | null>) => {
    if (ref.current !== null) {
      window.clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const cleanupHiddenEvalIframe = useCallback(() => {
    clearTimer(evalWatchdogRef);
    if (hiddenIframeRef.current) {
      try {
        hiddenIframeRef.current.srcdoc = "<!doctype html><html><body></body></html>";
        hiddenIframeRef.current.remove();
      } catch {
        // Ignora caso já tenha sido removido do DOM
      }
      hiddenIframeRef.current = null;
    }
  }, []);

  const buildEvalContext = useCallback(
    (
      evalFiles: WebProjectFiles,
      report: SandboxReportPayload,
      options: { timedOut?: boolean; errorMsg?: string } = {}
    ): EvaluationContext => {
      const entries = Array.isArray(report.consoleEntries) ? report.consoleEntries : [];
      const runtimeErrors = Array.isArray(report.runtimeErrors) ? report.runtimeErrors : [];
      const timedOut = Boolean(options.timedOut);
      const firstErr =
        options.errorMsg ||
        (runtimeErrors.length > 0 ? runtimeErrors[0] : undefined);

      const webState: WebEvaluationState = {
        files: evalFiles,
        title: report.title || "",
        lang: report.lang || "",
        bodyText: report.bodyText || "",
        elementCount: typeof report.elementCount === "number" ? report.elementCount : 0,
        consoleEntries: entries,
        runtimeErrors,
        queries: report.queries || {},
        interactions: report.interactions || {},
        timedOut,
      };

      const output = entries.map(entry =>
        entry.level === "error"
          ? `[erro] ${entry.text}`
          : entry.level === "warn"
            ? `[aviso] ${entry.text}`
            : entry.text
      );

      const hasFailure = timedOut || Boolean(firstErr);

      return {
        trackId: "web",
        code: serializeWebFiles(evalFiles),
        stdin: "",
        success: !hasFailure,
        output,
        outputText: output.join("\n"),
        error: firstErr,
        variables: [],
        scope: {},
        varTypes: {},
        testResults: timedOut || options.errorMsg
          ? [
              {
                id: "web-sandbox-runtime",
                label: "Execução segura na pré-visualização Web",
                passed: false,
                error: firstErr,
              },
            ]
          : [],
        web: webState,
      };
    },
    []
  );

  const launchPreview = useCallback(
    (targetFiles: WebProjectFiles, attachVerifyStartMs?: number) => {
      clearTimer(previewWatchdogRef);
      setBannerError(null);

      const sizeCheck = validateWebFilesSize(targetFiles);
      if (!sizeCheck.ok) {
        activePreviewRef.current = null;
        setPreviewSrcDoc("");
        setPreviewStatus("error");
        setBannerError(sizeCheck.error);
        setConsoleEntries([
          { level: "error", text: sizeCheck.error, timestamp: Date.now() },
        ]);

        if (typeof attachVerifyStartMs === "number" && onEvaluateRef.current) {
          pendingEvalRef.current = null;
          setIsVerifying(false);
          onEvaluateRef.current(
            buildEvalContext(targetFiles, {}, { errorMsg: sizeCheck.error }),
            Math.max(1, Math.round(performance.now() - attachVerifyStartMs))
          );
        }
        return;
      }

      if (isWebProjectEmpty(targetFiles)) {
        activePreviewRef.current = null;
        setPreviewSrcDoc("");
        setPreviewStatus("empty");
        setConsoleEntries([]);

        if (typeof attachVerifyStartMs === "number" && onEvaluateRef.current) {
          pendingEvalRef.current = null;
          setIsVerifying(false);
          onEvaluateRef.current(
            buildEvalContext(
              targetFiles,
              {
                consoleEntries: [],
                runtimeErrors: [],
                queries: {},
                interactions: {},
              },
              { errorMsg: "O projeto está vazio. Escreva HTML, CSS ou JS antes de verificar." }
            ),
            Math.max(1, Math.round(performance.now() - attachVerifyStartMs))
          );
        }
        return;
      }

      runCounterRef.current += 1;
      const runId = runCounterRef.current;
      const token = makeRunToken();
      activePreviewRef.current = { runId, token };

      if (typeof attachVerifyStartMs === "number") {
        pendingEvalRef.current = {
          runId,
          token,
          startMs: attachVerifyStartMs,
          files: targetFiles,
          usesHiddenIframe: false,
        };
      }

      setPreviewStatus("running");
      setConsoleEntries([]);

      const srcDoc = buildSandboxedSrcDoc({
        files: targetFiles,
        runId,
        token,
        inspection: inspectionRef.current,
        runInteractions: false,
      });
      setPreviewSrcDoc(srcDoc);

      previewWatchdogRef.current = window.setTimeout(() => {
        if (
          !activePreviewRef.current ||
          activePreviewRef.current.runId !== runId ||
          activePreviewRef.current.token !== token
        ) {
          return;
        }

        const timeoutMsg =
          "Execução da pré-visualização interrompida pelo limite de tempo (2.500 ms). Verifique laços infinitos ou recursão no script.js.";
        activePreviewRef.current = null;
        setPreviewStatus("timeout");
        setBannerError(timeoutMsg);
        setPreviewSrcDoc("<!doctype html><html><body></body></html>");
        setConsoleEntries(prev => [
          ...prev,
          { level: "error", text: timeoutMsg, timestamp: Date.now() },
        ]);

        const pending = pendingEvalRef.current;
        if (
          pending &&
          !pending.usesHiddenIframe &&
          pending.runId === runId &&
          pending.token === token
        ) {
          pendingEvalRef.current = null;
          setIsVerifying(false);
          onEvaluateRef.current?.(
            buildEvalContext(pending.files, {}, { timedOut: true, errorMsg: timeoutMsg }),
            Math.max(1, Math.round(performance.now() - pending.startMs))
          );
        }
      }, WEB_WATCHDOG_MS);
    },
    [buildEvalContext]
  );

  const launchHiddenEvaluation = useCallback(
    (targetFiles: WebProjectFiles, startMs: number) => {
      cleanupHiddenEvalIframe();

      if (!hiddenHostRef.current) {
        setIsVerifying(false);
        return;
      }

      runCounterRef.current += 1;
      const runId = runCounterRef.current;
      const token = makeRunToken();

      pendingEvalRef.current = {
        runId,
        token,
        startMs,
        files: targetFiles,
        usesHiddenIframe: true,
      };

      const iframe = document.createElement("iframe");
      iframe.setAttribute("sandbox", WEB_SANDBOX_ATTR);
      iframe.setAttribute("title", "Verificação isolada de interações Web");
      iframe.setAttribute("aria-hidden", "true");
      iframe.tabIndex = -1;
      iframe.style.cssText =
        "position:absolute;width:375px;height:600px;opacity:0;pointer-events:none;border:0;left:-9999px;top:0;";
      iframe.srcdoc = buildSandboxedSrcDoc({
        files: targetFiles,
        runId,
        token,
        inspection: inspectionRef.current,
        runInteractions: true,
      });

      hiddenIframeRef.current = iframe;
      hiddenHostRef.current.appendChild(iframe);

      evalWatchdogRef.current = window.setTimeout(() => {
        const pending = pendingEvalRef.current;
        if (
          !pending ||
          !pending.usesHiddenIframe ||
          pending.runId !== runId ||
          pending.token !== token
        ) {
          return;
        }
        pendingEvalRef.current = null;
        cleanupHiddenEvalIframe();
        setIsVerifying(false);

        const timeoutMsg =
          "Verificação interrompida pelo limite de tempo (2.500 ms). Verifique laços infinitos no script.js.";
        setBannerError(timeoutMsg);
        setConsoleEntries(prev => [
          ...prev,
          { level: "error", text: timeoutMsg, timestamp: Date.now() },
        ]);

        onEvaluateRef.current?.(
          buildEvalContext(pending.files, {}, { timedOut: true, errorMsg: timeoutMsg }),
          Math.max(1, Math.round(performance.now() - pending.startMs))
        );
      }, WEB_WATCHDOG_MS);
    },
    [buildEvalContext, cleanupHiddenEvalIframe]
  );

  // Escuta mensagens apenas do iframe de prévia ou verificação ativo com token + runId válidos
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data as {
        channel?: string;
        token?: string;
        runId?: number;
        kind?: "console" | "report";
        payload?: unknown;
      } | null;

      if (!msg || typeof msg !== "object" || msg.channel !== "code-entry-web-sandbox") {
        return;
      }

      const activePreview = activePreviewRef.current;
      const isFromPreview =
        Boolean(activePreview) &&
        Boolean(previewIframeRef.current?.contentWindow) &&
        event.source === previewIframeRef.current?.contentWindow &&
        msg.runId === activePreview?.runId &&
        msg.token === activePreview?.token;

      const pendingEval = pendingEvalRef.current;
      const isFromHiddenEval =
        Boolean(pendingEval?.usesHiddenIframe) &&
        Boolean(hiddenIframeRef.current?.contentWindow) &&
        event.source === hiddenIframeRef.current?.contentWindow &&
        msg.runId === pendingEval?.runId &&
        msg.token === pendingEval?.token;

      if (!isFromPreview && !isFromHiddenEval) {
        return;
      }

      if (msg.kind === "console" && isFromPreview) {
        const entry = msg.payload as WebConsoleEntry;
        if (entry && typeof entry.text === "string") {
          setConsoleEntries(prev => [...prev, entry]);
        }
        return;
      }

      if (msg.kind === "report") {
        const report = (msg.payload || {}) as SandboxReportPayload;
        const runtimeErrors = Array.isArray(report.runtimeErrors) ? report.runtimeErrors : [];

        if (isFromPreview) {
          clearTimer(previewWatchdogRef);
          setPreviewStatus(runtimeErrors.length > 0 ? "error" : "ready");
          if (runtimeErrors.length > 0) {
            setBannerError(runtimeErrors[0]);
          }
          if (Array.isArray(report.consoleEntries) && report.consoleEntries.length > 0) {
            setConsoleEntries(report.consoleEntries);
          }

          if (
            pendingEval &&
            !pendingEval.usesHiddenIframe &&
            pendingEval.runId === msg.runId &&
            pendingEval.token === msg.token
          ) {
            pendingEvalRef.current = null;
            setIsVerifying(false);
            onEvaluateRef.current?.(
              buildEvalContext(pendingEval.files, report),
              Math.max(1, Math.round(performance.now() - pendingEval.startMs))
            );
          }
        } else if (isFromHiddenEval && pendingEval) {
          pendingEvalRef.current = null;
          cleanupHiddenEvalIframe();
          setIsVerifying(false);
          if (runtimeErrors.length > 0) {
            setBannerError(runtimeErrors[0]);
          }
          onEvaluateRef.current?.(
            buildEvalContext(pendingEval.files, report),
            Math.max(1, Math.round(performance.now() - pendingEval.startMs))
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [buildEvalContext, cleanupHiddenEvalIframe]);

  // Reinicia prévia ao abrir uma nova aula, desafio ou laboratório
  useEffect(() => {
    clearTimer(debounceTimerRef);
    clearTimer(previewWatchdogRef);
    cleanupHiddenEvalIframe();
    pendingEvalRef.current = null;
    activePreviewRef.current = null;
    setIsVerifying(false);
    setBannerError(null);
    setActiveTab("html");
    lastInternalValueRef.current = value;

    const initialFiles = parseWebFiles(value, starterFiles);
    launchPreview(initialFiles);

    return () => {
      clearTimer(debounceTimerRef);
      clearTimer(previewWatchdogRef);
      cleanupHiddenEvalIframe();
      pendingEvalRef.current = null;
      activePreviewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectKey]);

  // Re-sincroniza prévia se o componente pai trocar o valor após mudança de rota/aula ou carga assíncrona
  useEffect(() => {
    if (value === lastInternalValueRef.current) return;
    lastInternalValueRef.current = value;
    clearTimer(debounceTimerRef);
    launchPreview(parseWebFiles(value, starterFiles));
  }, [value, starterFiles, launchPreview]);

  const handleFileChange = (nextText: string) => {
    const nextFiles: WebProjectFiles = {
      ...filesRef.current,
      [activeTab]: nextText,
    };
    filesRef.current = nextFiles;
    const serialized = serializeWebFiles(nextFiles);
    lastInternalValueRef.current = serialized;
    onChangeValue(serialized);

    if (autoPreview) {
      clearTimer(debounceTimerRef);
      debounceTimerRef.current = window.setTimeout(() => {
        launchPreview(nextFiles);
      }, 450);
    }
  };

  const handleExecuteAndVerify = useCallback(() => {
    clearTimer(debounceTimerRef);
    const currentFiles = filesRef.current;
    const hasEvaluate = Boolean(onEvaluateRef.current);

    if (!hasEvaluate) {
      launchPreview(currentFiles);
      return;
    }

    const startMs = performance.now();
    const sizeCheck = validateWebFilesSize(currentFiles);
    if (!sizeCheck.ok) {
      launchPreview(currentFiles, startMs);
      return;
    }

    if (isWebProjectEmpty(currentFiles)) {
      launchPreview(currentFiles, startMs);
      return;
    }

    const hasInteractions = Boolean(inspectionRef.current?.interactions?.length);
    setIsVerifying(true);

    if (hasInteractions) {
      launchPreview(currentFiles);
      launchHiddenEvaluation(currentFiles, startMs);
    } else {
      launchPreview(currentFiles, startMs);
    }
  }, [launchHiddenEvaluation, launchPreview]);

  const handleResetStarter = () => {
    clearTimer(debounceTimerRef);
    cleanupHiddenEvalIframe();
    pendingEvalRef.current = null;
    setIsVerifying(false);

    const restored = { ...starterFiles };
    filesRef.current = restored;
    const serialized = serializeWebFiles(restored);
    lastInternalValueRef.current = serialized;
    onChangeValue(serialized);
    launchPreview(restored);
  };

  const handleClearProject = () => {
    clearTimer(debounceTimerRef);
    cleanupHiddenEvalIframe();
    pendingEvalRef.current = null;
    setIsVerifying(false);

    const cleared: WebProjectFiles = { ...EMPTY_WEB_FILES };
    filesRef.current = cleared;
    const serialized = serializeWebFiles(cleared);
    lastInternalValueRef.current = serialized;
    onChangeValue(serialized);
    launchPreview(cleared);
  };

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % FILE_TABS.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + FILE_TABS.length) % FILE_TABS.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = FILE_TABS.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const target = FILE_TABS[nextIndex];
    setActiveTab(target.id);
    tabButtonRefs.current[target.id]?.focus();
  };

  const renderTabIcon = (tabId: WebFileTab) => {
    if (tabId === "html") return <FileCode2 size={14} />;
    if (tabId === "css") return <Palette size={14} />;
    return <Braces size={14} />;
  };

  const activeMeta = FILE_TABS.find(t => t.id === activeTab) ?? FILE_TABS[0];

  const renderSaveIndicator = () => {
    if (saveStatus === "saving") {
      return (
        <span className="ce-web-save-pill is-saving" aria-live="polite">
          Salvando...
        </span>
      );
    }
    if (saveStatus === "error") {
      return (
        <span
          className="ce-web-save-pill is-error"
          role="status"
          title={saveError || "Não foi possível gravar o rascunho localmente; suas edições continuam ativas nesta aba."}
        >
          <AlertTriangle size={12} /> Falha ao salvar
        </span>
      );
    }
    if (saveStatus === "saved") {
      return (
        <span className="ce-web-save-pill is-saved" aria-live="polite">
          Salvo
        </span>
      );
    }
    return null;
  };

  const renderPreviewStatusBadge = () => {
    if (previewStatus === "running" || isVerifying) {
      return (
        <span className="ce-badge is-running">
          <Clock size={12} /> {isVerifying ? "Verificando..." : "Atualizando..."}
        </span>
      );
    }
    if (previewStatus === "timeout") {
      return (
        <span className="ce-badge is-error">
          <AlertTriangle size={12} /> Tempo esgotado (2,5s)
        </span>
      );
    }
    if (previewStatus === "error") {
      return (
        <span className="ce-badge is-error">
          <AlertTriangle size={12} /> Erro no script
        </span>
      );
    }
    if (previewStatus === "ready") {
      return (
        <span className="ce-badge is-success">
          <CheckCircle2 size={12} /> Prévia pronta
        </span>
      );
    }
    return <span className="ce-badge">Projeto vazio</span>;
  };

  const btnAccentStyle: React.CSSProperties | undefined = accentColor
    ? {
        background: accentColor,
        color: darkTextOnAccent ? "#0d0f18" : "#ffffff",
      }
    : undefined;

  return (
    <div
      className={`ce-workbench ce-web-workbench ${mode === "lab" ? "is-lab" : ""}`}
    >
      {/* Toolbar principal */}
      <div className="ce-wb-toolbar">
        <div className="ce-wb-tabs" role="tablist" aria-label="Arquivos do projeto Web">
          {FILE_TABS.map((tab, index) => {
            const hasContent = Boolean(files[tab.id].trim());
            const isChangedFromStarter = files[tab.id] !== starterFiles[tab.id];
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={el => {
                  tabButtonRefs.current[tab.id] = el;
                }}
                id={`ce-web-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`ce-web-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={e => handleTabKeyDown(e, index)}
                className={`ce-web-file-tab is-${tab.id} ${selected ? "is-active" : ""}`}
                title={tab.hint}
              >
                {renderTabIcon(tab.id)}
                <span>{tab.label}</span>
                {isChangedFromStarter ? (
                  <span
                    className="ce-web-tab-dot is-dirty"
                    title="Arquivo modificado em relação ao modelo"
                  />
                ) : hasContent ? (
                  <span className="ce-web-tab-dot" title="Arquivo preenchido" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="ce-wb-actions">
          {renderSaveIndicator()}
          <button
            type="button"
            className={`ce-btn ce-btn-ghost ce-btn-sm ${autoPreview ? "is-active-toggle" : ""}`}
            aria-pressed={autoPreview}
            onClick={() => setAutoPreview(v => !v)}
            title="Atualiza a prévia automaticamente após pausar a digitação (não marca a aula como concluída)"
          >
            Auto-prévia: {autoPreview ? "On" : "Off"}
          </button>
          <button
            type="button"
            className="ce-btn ce-btn-ghost ce-btn-sm"
            onClick={handleResetStarter}
            title="Restaurar o código inicial desta atividade"
          >
            <RotateCcw size={14} /> Formatar
          </button>
          <button
            type="button"
            className="ce-btn ce-btn-ghost ce-btn-sm"
            onClick={handleClearProject}
            title="Limpar HTML, CSS e JS"
          >
            <Eraser size={14} /> Limpar
          </button>
          <button
            type="button"
            className="ce-btn ce-btn-primary ce-btn-sm"
            onClick={handleExecuteAndVerify}
            disabled={isVerifying}
            style={btnAccentStyle}
            title="Atalho: Ctrl+Enter"
          >
            <Play size={14} />
            {onEvaluate
              ? isVerifying
                ? "Verificando..."
                : "Executar e verificar (Ctrl+Enter)"
              : "Executar prévia (Ctrl+Enter)"}
          </button>
        </div>
      </div>

      {/* Área principal Web: Editor multiarquivo + Prévia isolada + Console */}
      <div className="ce-web-split">
        {/* Painel do Editor */}
        <div
          id={`ce-web-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`ce-web-tab-${activeTab}`}
          className="ce-web-editor-pane"
        >
          <div className="ce-web-pane-subbar">
            <span className="ce-web-pane-hint">
              <strong>{activeMeta.label}</strong> — {activeMeta.hint}
            </span>
            <span className="ce-web-chars-count">
              {files[activeTab].length.toLocaleString("pt-BR")} chars
            </span>
          </div>
          <CodeEditor
            key={`${projectKey}:${activeTab}`}
            language={activeMeta.lang}
            value={files[activeTab]}
            onChange={handleFileChange}
            onRun={handleExecuteAndVerify}
            minHeight={mode === "lab" ? 390 : 270}
            ariaLabel={`Editor do arquivo ${activeMeta.label}`}
          />
        </div>

        {/* Painel de Pré-visualização e Console */}
        <div className="ce-web-preview-pane">
          <div className="ce-web-preview-bar">
            <div className="ce-web-preview-status">
              <span className="ce-web-sandbox-pill" title="Código roda em iframe com sandbox restrito, origem opaca e CSP bloqueando acessos externos e ao Code Entry.">
                <ShieldCheck size={13} /> Sandbox isolado
              </span>
              {renderPreviewStatusBadge()}
            </div>

            <div className="ce-web-preview-controls">
              <div className="ce-web-viewport-switch" role="group" aria-label="Largura da pré-visualização">
                <button
                  type="button"
                  className={`ce-web-vp-btn ${viewport === "desktop" ? "is-active" : ""}`}
                  aria-pressed={viewport === "desktop"}
                  onClick={() => setViewport("desktop")}
                  title="Prévia em largura desktop"
                >
                  <Monitor size={13} /> Desktop
                </button>
                <button
                  type="button"
                  className={`ce-web-vp-btn ${viewport === "mobile" ? "is-active" : ""}`}
                  aria-pressed={viewport === "mobile"}
                  onClick={() => setViewport("mobile")}
                  title="Simular viewport mobile de 375px"
                >
                  <Smartphone size={13} /> Mobile 375px
                </button>
              </div>
              <button
                type="button"
                className="ce-btn ce-btn-ghost ce-btn-sm"
                onClick={() => launchPreview(filesRef.current)}
                title="Recarregar prévia imediatamente"
              >
                <RefreshCw size={13} /> Atualizar
              </button>
            </div>
          </div>

          {bannerError && (
            <div className="ce-web-runtime-banner" role="alert">
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{bannerError}</span>
            </div>
          )}

          <div
            className={`ce-web-preview-stage ${viewport === "mobile" ? "is-mobile" : ""}`}
          >
            {previewStatus === "empty" ? (
              <div className="ce-web-empty-state">
                <FileCode2 size={28} style={{ opacity: 0.65 }} />
                <strong>Nenhum código para pré-visualizar</strong>
                <span>
                  Edite <code>index.html</code>, <code>style.css</code> ou{" "}
                  <code>script.js</code>, ou clique em <strong>Modelo</strong> para
                  restaurar o ponto de partida.
                </span>
              </div>
            ) : (
              <div className="ce-web-preview-frame-shell">
                <iframe
                  ref={previewIframeRef}
                  className="ce-web-preview-frame"
                  sandbox={WEB_SANDBOX_ATTR}
                  srcDoc={previewSrcDoc}
                  title={`Pré-visualização isolada de ${projectKey}`}
                />
              </div>
            )}
          </div>

          {/* Console dedicado do script.js e avisos de sandbox */}
          <div className="ce-web-console">
            <div className="ce-web-console-header">
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Terminal size={13} />
                <span>Console</span>
                <span className="ce-web-console-count">{consoleEntries.length}</span>
              </div>
              <button
                type="button"
                className="ce-btn ce-btn-ghost ce-btn-sm"
                onClick={() => {
                  setConsoleEntries([]);
                  setBannerError(null);
                }}
                disabled={consoleEntries.length === 0 && !bannerError}
              >
                <Trash2 size={12} /> Limpar console
              </button>
            </div>

            <div className="ce-web-console-body" aria-live="polite">
              {consoleEntries.length === 0 ? (
                <div className="ce-web-console-empty">
                  Nenhuma mensagem no console ainda. Use <code>console.log(...)</code>{" "}
                  em <code>script.js</code> ou acompanhe avisos e erros aqui.
                </div>
              ) : (
                consoleEntries.map((entry, idx) => (
                  <div
                    key={`${entry.timestamp || idx}-${idx}`}
                    className={`ce-web-console-line is-${entry.level}`}
                  >
                    <span className="ce-web-console-tag">{entry.level.toUpperCase()}</span>
                    <span className="ce-web-console-text">{entry.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Container oculto dedicado para rodar `inspection.interactions` isolado durante verificação */}
      <div
        ref={hiddenHostRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          width: 0,
          height: 0,
          overflow: "hidden",
          pointerEvents: "none",
          opacity: 0,
        }}
      />
    </div>
  );
};
