import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Eraser,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Variable,
  XCircle,
} from "lucide-react";
import { runCodeInWorker } from "../../engines/workerClient";
import type { EvaluationContext, TestCaseSpec, TrackId } from "../../types/curriculum";
import type { CodeRunResponse, ExecutionHistoryEntry } from "../../types/execution";
import { CodeEditor } from "../editor/CodeEditor";

interface CodeWorkbenchProps {
  trackId: "logic" | "cpp" | "js" | "python";
  code: string;
  stdin?: string;
  starterCode?: string;
  requiresStdin?: boolean;
  testCases?: TestCaseSpec[];
  onChangeCode: (next: string) => void;
  onChangeStdin?: (next: string) => void;
  onEvaluate?: (ctx: EvaluationContext, durationMs: number) => void;
  accentColor?: string;
  darkTextOnAccent?: boolean;
}

function basicFormatCode(code: string, lang: "logic" | "cpp" | "js" | "python"): string {
  const lines = code.replace(/\r\n/g, "\n").split("\n").map(l => l.replace(/\s+$/, ""));
  if (lang === "python") {
    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
  }
  let indent = 0;
  const formatted: string[] = [];
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      formatted.push("");
      continue;
    }
    if (trimmed.startsWith("}")) indent = Math.max(0, indent - 1);
    formatted.push("  ".repeat(indent) + trimmed);
    if (trimmed.endsWith("{")) indent++;
  }
  return formatted.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

export const CodeWorkbench: React.FC<CodeWorkbenchProps> = ({
  trackId,
  code,
  stdin = "",
  starterCode = "",
  requiresStdin = false,
  testCases = [],
  onChangeCode,
  onChangeStdin,
  onEvaluate,
  accentColor = "var(--accent-primary)",
  darkTextOnAccent = false,
}) => {
  const [running, setRunning] = useState(false);
  const [showStdin, setShowStdin] = useState(requiresStdin);
  const [lastRun, setLastRun] = useState<CodeRunResponse | null>(null);
  const [outputTab, setOutputTab] = useState<"console" | "vars" | "tests" | "history">("console");
  const [execHistory, setExecHistory] = useState<ExecutionHistoryEntry[]>([]);

  useEffect(() => {
    setShowStdin(requiresStdin);
    setLastRun(null);
    setOutputTab("console");
  }, [requiresStdin, starterCode, trackId]);

  const handleRun = async () => {
    if (running) return;
    setRunning(true);
    try {
      const res = await runCodeInWorker(trackId, code, stdin, testCases);
      setLastRun(res);
      if (res.testResults.length > 0 && res.testResults.some(t => !t.passed)) {
        setOutputTab("tests");
      } else {
        setOutputTab("console");
      }

      setExecHistory(prev => [
        {
          id: `${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("pt-BR"),
          success: res.success,
          summary: res.success
            ? res.outputText
              ? res.outputText.split("\n")[0].slice(0, 64)
              : "Execução concluída sem saída."
            : (res.error || "Erro").slice(0, 64),
          durationMs: res.durationMs,
        },
        ...prev.slice(0, 14),
      ]);

      const evalCtx: EvaluationContext = {
        trackId: trackId as TrackId,
        code,
        stdin,
        success: res.success,
        output: res.output,
        outputText: res.outputText,
        error: res.error,
        variables: res.variables,
        scope: res.scope,
        varTypes: res.varTypes,
        testResults: res.testResults,
      };
      onEvaluate?.(evalCtx, res.durationMs);
    } finally {
      setRunning(false);
    }
  };

  const langLabel =
    trackId === "logic"
      ? "Portugol / Lógica"
      : trackId === "cpp"
      ? "C++17"
      : trackId === "python"
      ? "Python 3"
      : "JavaScript ES2024";
  const passedTests = lastRun?.testResults.filter(t => t.passed).length ?? 0;

  return (
    <div className="ce-workbench">
      <div className="ce-wb-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Terminal size={15} style={{ color: accentColor }} aria-hidden="true" />
          <strong style={{ fontSize: 13 }}>Editor de Código</strong>
          <span className="ce-badge">{langLabel}</span>
        </div>

        <div className="ce-wb-actions">
          <button
            type="button"
            className="ce-btn ce-btn-ghost ce-btn-sm"
            onClick={() => setShowStdin(s => !s)}
            title="Mostrar ou ocultar entrada de dados para o programa"
          >
            <span>{showStdin ? "Ocultar entrada" : "Entrada de dados"}</span>
          </button>

          <button
            type="button"
            className="ce-btn ce-btn-ghost ce-btn-sm"
            onClick={() => onChangeCode(basicFormatCode(code, trackId))}
            title="Formatar indentação do código"
          >
            <Sparkles size={13} />
            <span>Formatar</span>
          </button>

          {starterCode !== undefined && (
            <button
              type="button"
              className="ce-btn ce-btn-ghost ce-btn-sm"
              onClick={() => onChangeCode(starterCode)}
              title="Restaurar modelo inicial"
            >
              <RotateCcw size={13} />
              <span>Modelo</span>
            </button>
          )}

          <button
            type="button"
            className="ce-btn ce-btn-ghost ce-btn-sm"
            onClick={() => onChangeCode("")}
            title="Limpar editor"
          >
            <Eraser size={13} />
            <span>Limpar</span>
          </button>

          <button
            type="button"
            className={`ce-btn ce-btn-track ce-btn-sm ${darkTextOnAccent ? "is-dark-text" : ""} ${running ? "ce-running-pulse" : ""}`}
            onClick={handleRun}
            disabled={running}
            title="Executar código (Ctrl+Enter)"
          >
            <Play size={13} fill="currentColor" />
            <span>{running ? "Executando..." : "Executar (Ctrl+Enter)"}</span>
          </button>
        </div>
      </div>

      <CodeEditor
        language={trackId}
        value={code}
        onChange={onChangeCode}
        onRun={handleRun}
      />

      {showStdin && (
        <div className="ce-stdin-panel">
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--text-secondary)", gap: 8, flexWrap: "wrap" }}>
            <label htmlFor="ce-stdin-box" style={{ fontWeight: 600 }}>
              Entrada de dados ({trackId === "cpp" ? "valores lidos por cin / getline" : "valores lidos pelo programa"})
            </label>
            <span style={{ color: "var(--text-muted)" }}>Digite os valores que seu programa deverá receber (um por linha)</span>
          </div>
          <textarea
            id="ce-stdin-box"
            className="ce-stdin-textarea"
            value={stdin}
            onChange={e => onChangeStdin?.(e.target.value)}
            placeholder="Digite os dados que seu programa receberá ao executar..."
            spellCheck={false}
          />
        </div>
      )}

      <div className="ce-output-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <button
              type="button"
              className={`ce-tab-btn ${outputTab === "console" ? "is-active" : ""}`}
              onClick={() => setOutputTab("console")}
            >
              <Terminal size={13} />
              <span>Saída</span>
            </button>
            <button
              type="button"
              className={`ce-tab-btn ${outputTab === "vars" ? "is-active" : ""}`}
              onClick={() => setOutputTab("vars")}
            >
              <Variable size={13} />
              <span>Variáveis ({lastRun?.variables.length ?? 0})</span>
            </button>
            {testCases.length > 0 && (
              <button
                type="button"
                className={`ce-tab-btn ${outputTab === "tests" ? "is-active" : ""}`}
                onClick={() => setOutputTab("tests")}
              >
                <CheckCircle2 size={13} />
                <span>
                  Testes ({passedTests}/{testCases.length})
                </span>
              </button>
            )}
            <button
              type="button"
              className={`ce-tab-btn ${outputTab === "history" ? "is-active" : ""}`}
              onClick={() => setOutputTab("history")}
            >
              <Clock size={13} />
              <span>Execuções ({execHistory.length})</span>
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {lastRun && (
              <span
                className={`ce-badge ${lastRun.success ? "ce-badge-diff-easy" : "ce-badge-diff-hard"}`}
              >
                {lastRun.success ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                <span>
                  {lastRun.success ? `Concluído em ${lastRun.durationMs}ms` : "Erro de execução"}
                </span>
              </span>
            )}
          </div>
        </div>

        {outputTab === "console" && (
          <pre className="ce-output-pre">
            {!lastRun ? (
              <span style={{ color: "var(--text-muted)" }}>
                Clique em "Executar (Ctrl+Enter)" para rodar seu código e ver o resultado aqui.
              </span>
            ) : (
              <>
                {lastRun.outputText && <span>{lastRun.outputText}</span>}
                {lastRun.error && (
                  <div style={{ color: "var(--accent-danger)", marginTop: lastRun.outputText ? 8 : 0 }}>
                    {lastRun.error}
                  </div>
                )}
                {lastRun.success && !lastRun.outputText && !lastRun.error && (
                  <span style={{ color: "var(--text-muted)" }}>(Execução concluída sem saída no console.)</span>
                )}
              </>
            )}
          </pre>
        )}

        {outputTab === "vars" && (
          <div style={{ maxHeight: 190, overflowY: "auto" }}>
            {!lastRun || lastRun.variables.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                Nenhuma variável capturada na última execução.
              </div>
            ) : (
              <table className="ce-table">
                <thead>
                  <tr>
                    <th>Variável</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {lastRun.variables.map(v => (
                    <tr key={v.name}>
                      <td><code>{v.name}</code></td>
                      <td><span className="ce-badge">{v.type}</span></td>
                      <td><code>{v.value}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {outputTab === "tests" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 190, overflowY: "auto" }}>
            {(lastRun?.testResults || []).map(tr => (
              <div
                key={tr.id}
                style={{
                  padding: "8px 10px",
                  borderRadius: 9,
                  border: `1px solid ${tr.passed ? "rgba(34,197,94,0.35)" : "rgba(248,113,113,0.35)"}`,
                  background: tr.passed ? "rgba(34,197,94,0.08)" : "rgba(248,113,113,0.08)",
                  fontSize: 12.5,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
                  {tr.passed ? (
                    <CheckCircle2 size={14} style={{ color: "var(--accent-success)" }} />
                  ) : (
                    <XCircle size={14} style={{ color: "var(--accent-danger)" }} />
                  )}
                  <span>{tr.label}</span>
                </div>
                {!tr.passed && (
                  <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                    {tr.error ? tr.error : `Esperado: ${tr.expected} | Obtido: ${tr.actual}`}
                  </div>
                )}
              </div>
            ))}
            {!lastRun && (
              <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                Execute o código para rodar os {testCases.length} casos de teste automáticos.
              </div>
            )}
          </div>
        )}

        {outputTab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 190, overflowY: "auto" }}>
            {execHistory.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Nenhuma execução nesta sessão ainda.</div>
            ) : (
              execHistory.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: "var(--bg-surface)",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: item.success ? "var(--accent-success)" : "var(--accent-danger)", fontWeight: 600 }}>
                    {item.timestamp}
                  </span>
                  <code style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.summary}
                  </code>
                  <span style={{ color: "var(--text-muted)" }}>{item.durationMs}ms</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
