import React, { useEffect, useRef, useState } from "react";
import { Folder, FolderOpen, FileText, FileCode, RotateCcw, Terminal, Trash2 } from "lucide-react";
import { LinuxShellEngine, type LinuxLine } from "../../engines/linux/linuxShell";
import type { VfsTreeItem } from "../../engines/linux/vfs";
import type { EvaluationContext } from "../../types/curriculum";

interface LinuxWorkbenchProps {
  workspaceKey: string;
  initialSerialized?: unknown;
  quickCommands?: { label: string; command: string }[];
  onPersistState?: (serialized: unknown) => void;
  onEvaluate?: (ctx: EvaluationContext, durationMs: number) => void;
}

const DEFAULT_QUICK = [
  { label: "pwd", command: "pwd" },
  { label: "ls -la", command: "ls -la" },
  { label: "tree", command: "tree" },
  { label: "help", command: "help" },
];

const VfsTreeNode: React.FC<{ item: VfsTreeItem; depth: number; cwd: string }> = ({ item, depth, cwd }) => {
  const isCurrentDir = item.path === cwd;
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 6px",
          paddingLeft: 6 + depth * 12,
          borderRadius: 6,
          fontSize: 12,
          background: isCurrentDir ? "rgba(34, 197, 94, 0.14)" : "transparent",
          color: isCurrentDir ? "#4ade80" : "var(--text-secondary)",
        }}
      >
        {item.type === "dir" ? (
          isCurrentDir ? (
            <FolderOpen size={13} style={{ color: "#22C55E", flexShrink: 0 }} />
          ) : (
            <Folder size={13} style={{ color: "#60A5FA", flexShrink: 0 }} />
          )
        ) : item.executable ? (
          <FileCode size={13} style={{ color: "#22C55E", flexShrink: 0 }} />
        ) : (
          <FileText size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        )}
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: isCurrentDir ? 700 : 400 }}>
          {item.name}
          {item.type === "dir" ? "/" : ""}
        </span>
      </div>
      {item.children?.map(child => (
        <VfsTreeNode key={child.path} item={child} depth={depth + 1} cwd={cwd} />
      ))}
    </div>
  );
};

export const LinuxWorkbench: React.FC<LinuxWorkbenchProps> = ({
  workspaceKey,
  initialSerialized,
  quickCommands = DEFAULT_QUICK,
  onPersistState,
  onEvaluate,
}) => {
  const engineRef = useRef<LinuxShellEngine>(
    new LinuxShellEngine(initialSerialized as ConstructorParameters<typeof LinuxShellEngine>[0])
  );
  const [lines, setLines] = useState<LinuxLine[]>([
    { text: "Code Entry Linux Shell — Ambiente Virtual Isolado", tone: "accent" },
    { text: "Digite 'help' para comandos disponíveis ou use Tab para autocompletar.", tone: "muted" },
  ]);
  const [commandInput, setCommandInput] = useState("");
  const [histCursor, setHistCursor] = useState(-1);
  const [treeSnapshot, setTreeSnapshot] = useState<VfsTreeItem | null>(() =>
    engineRef.current.fs.toTree("/home/aluno")
  );
  const [cwd, setCwd] = useState(engineRef.current.cwd);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    // Quando troca de lição/workspace, reinicia com estado salvo se houver
    engineRef.current = new LinuxShellEngine(
      initialSerialized && typeof initialSerialized === "object"
        ? (initialSerialized as { cwd?: string; env?: Record<string, string> })
        : undefined
    );
    setCwd(engineRef.current.cwd);
    setTreeSnapshot(engineRef.current.fs.toTree("/home/aluno"));
    setLines([
      { text: "Code Entry Linux Shell — Sessão pronta", tone: "accent" },
      { text: "Use Tab para autocompletar, ↑/↓ para histórico e Ctrl+L para limpar.", tone: "muted" },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceKey]);

  const runCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const t0 = performance.now();
    const promptBefore = engineRef.current.prompt();
    const result = engineRef.current.execute(trimmed);
    const elapsed = Number((performance.now() - t0).toFixed(2));

    if (result.clearRequested) {
      setLines([]);
    } else {
      setLines(prev => [
        ...prev,
        { text: `${promptBefore} ${trimmed}`, tone: "cmd" },
        ...result.lines,
      ]);
    }

    setCwd(engineRef.current.cwd);
    setTreeSnapshot(engineRef.current.fs.toTree("/home/aluno"));
    setHistCursor(-1);
    setCommandInput("");
    onPersistState?.(engineRef.current.serialize());

    const evalCtx: EvaluationContext = {
      trackId: "linux",
      code: trimmed,
      stdin: "",
      success: result.success,
      output: result.lines.map(l => l.text),
      outputText: result.outputText,
      variables: Object.entries(engineRef.current.env).map(([name, value]) => ({
        name,
        value,
        type: "env",
      })),
      scope: { ...engineRef.current.env },
      varTypes: {},
      testResults: [],
      linux: result.snapshot,
    };
    onEvaluate?.(evalCtx, elapsed);
  };

  const handleReset = () => {
    engineRef.current.reset();
    setCwd(engineRef.current.cwd);
    setTreeSnapshot(engineRef.current.fs.toTree("/home/aluno"));
    setLines([{ text: "Sistema de arquivos virtual restaurado para o estado inicial.", tone: "accent" }]);
    onPersistState?.(engineRef.current.serialize());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(commandInput);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const completed = engineRef.current.autocomplete(commandInput);
      if (completed) setCommandInput(completed);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const hist = engineRef.current.history;
      if (!hist.length) return;
      const nextIdx = histCursor < 0 ? hist.length - 1 : Math.max(0, histCursor - 1);
      setHistCursor(nextIdx);
      setCommandInput(hist[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const hist = engineRef.current.history;
      if (histCursor < 0) return;
      if (histCursor >= hist.length - 1) {
        setHistCursor(-1);
        setCommandInput("");
      } else {
        const nextIdx = histCursor + 1;
        setHistCursor(nextIdx);
        setCommandInput(hist[nextIdx]);
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setLines([]);
    }
  };

  const toneColor: Record<LinuxLine["tone"], string> = {
    normal: "#e2e8f0",
    accent: "#4ade80",
    muted: "#94a3b8",
    error: "#f87171",
    success: "#34d399",
    cmd: "#93c5fd",
  };

  return (
    <div className="ce-workbench">
      <div className="ce-wb-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Terminal size={15} style={{ color: "#22C55E" }} />
          <strong style={{ fontSize: 13 }}>Terminal Linux (Bash Virtual)</strong>
          <span className="ce-badge">{cwd}</span>
        </div>

        <div className="ce-wb-actions">
          {quickCommands.map(qc => (
            <button
              key={qc.command}
              type="button"
              className="ce-btn ce-btn-ghost ce-btn-sm"
              onClick={() => runCommand(qc.command)}
            >
              <code>{qc.label}</code>
            </button>
          ))}
          <button
            type="button"
            className="ce-btn ce-btn-ghost ce-btn-sm"
            onClick={() => setLines([])}
            title="Limpar terminal (Ctrl+L)"
          >
            <Trash2 size={13} />
            <span>Limpar</span>
          </button>
          <button
            type="button"
            className="ce-btn ce-btn-ghost ce-btn-sm"
            onClick={handleReset}
            title="Restaurar diretórios e arquivos"
          >
            <RotateCcw size={13} />
            <span>Restaurar arquivos</span>
          </button>
        </div>
      </div>

      <div className="ce-linux-grid">
        <div className="ce-terminal-pane">
          <div ref={logRef} className="ce-terminal-log" role="log" aria-live="polite">
            {lines.map((line, i) => (
              <div
                key={i}
                style={{
                  color: toneColor[line.tone],
                  fontWeight: line.tone === "cmd" ? 600 : 400,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {line.text}
              </div>
            ))}
          </div>

          <div className="ce-terminal-prompt-row">
            <span style={{ color: "#22C55E", fontWeight: 600, fontSize: 12.5, whiteSpace: "nowrap" }}>
              {engineRef.current.prompt()}
            </span>
            <input
              type="text"
              className="ce-terminal-input"
              value={commandInput}
              onChange={e => setCommandInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite um comando Linux..."
              aria-label="Linha de comando Linux"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        <aside className="ce-vfs-pane" aria-label="Explorador de arquivos virtual">
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Arquivos (/home/aluno)
          </div>
          {treeSnapshot && <VfsTreeNode item={treeSnapshot} depth={0} cwd={cwd} />}
        </aside>
      </div>
    </div>
  );
};
