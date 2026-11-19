import React, { useEffect, useState } from "react";
import { CheckCircle2, Database, Eraser, Play, RotateCcw, Table2, XCircle } from "lucide-react";
import { executeSqlQuery, fetchSqlSchema } from "../../engines/sql/sqlClient";
import type { EvaluationContext } from "../../types/curriculum";
import type { SqlExecuteResponse, SqlTableSchema } from "../../types/execution";
import { CodeEditor } from "../editor/CodeEditor";

interface SqlWorkbenchProps {
  datasetId: "ecommerce" | "empresa";
  code: string;
  starterCode?: string;
  allowDatasetSwitch?: boolean;
  onChangeDataset?: (next: "ecommerce" | "empresa") => void;
  onChangeCode: (next: string) => void;
  onEvaluate?: (ctx: EvaluationContext, durationMs: number) => void;
}

export const SqlWorkbench: React.FC<SqlWorkbenchProps> = ({
  datasetId,
  code,
  starterCode = "",
  allowDatasetSwitch = false,
  onChangeDataset,
  onChangeCode,
  onEvaluate,
}) => {
  const [schema, setSchema] = useState<SqlTableSchema[]>([]);
  const [datasetTitle, setDatasetTitle] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SqlExecuteResponse | null>(null);

  useEffect(() => {
    setResult(null);
    fetchSqlSchema(datasetId)
      .then(data => {
        setSchema(data.tables);
        setDatasetTitle(data.name);
      })
      .catch(() => {});
  }, [datasetId]);

  const handleExecute = async () => {
    if (running) return;
    setRunning(true);
    try {
      const res = await executeSqlQuery(datasetId, code);
      setResult(res);
      if (res.schema?.length) setSchema(res.schema);

      const evalCtx: EvaluationContext = {
        trackId: "database",
        code,
        stdin: "",
        success: res.success,
        output: res.messages || [],
        outputText: (res.messages || []).join("\n"),
        error: res.error,
        variables: [],
        scope: {},
        varTypes: {},
        testResults: [],
        sql: {
          columns: res.columns,
          rows: res.rows,
          rowCount: res.rowCount,
          changes: res.changes,
          executionTimeMs: res.executionTimeMs,
        },
      };
      onEvaluate?.(evalCtx, res.executionTimeMs);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="ce-workbench">
      <div className="ce-wb-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Database size={15} style={{ color: "#14B8A6" }} />
          <strong style={{ fontSize: 13 }}>Editor SQL</strong>
          {allowDatasetSwitch && onChangeDataset ? (
            <select
              className="ce-select"
              style={{ height: 30, fontSize: 12 }}
              value={datasetId}
              onChange={e => onChangeDataset(e.target.value as "ecommerce" | "empresa")}
              aria-label="Selecionar dataset SQL"
            >
              <option value="ecommerce">E-commerce TechStore</option>
              <option value="empresa">Corporação NexusRH</option>
            </select>
          ) : (
            <span className="ce-badge">{datasetTitle || datasetId}</span>
          )}
        </div>

        <div className="ce-wb-actions">
          {starterCode !== undefined && (
            <button
              type="button"
              className="ce-btn ce-btn-ghost ce-btn-sm"
              onClick={() => onChangeCode(starterCode)}
            >
              <RotateCcw size={13} />
              <span>Modelo</span>
            </button>
          )}
          <button
            type="button"
            className="ce-btn ce-btn-ghost ce-btn-sm"
            onClick={() => onChangeCode("")}
          >
            <Eraser size={13} />
            <span>Limpar</span>
          </button>
          <button
            type="button"
            className="ce-btn ce-btn-track ce-btn-sm"
            style={{ background: "#14B8A6", color: "#042f2e" }}
            onClick={handleExecute}
            disabled={running}
          >
            <Play size={13} fill="currentColor" />
            <span>{running ? "Executando..." : "Executar SQL (Ctrl+Enter)"}</span>
          </button>
        </div>
      </div>

      <div className="ce-sql-top">
        <CodeEditor
          language="sql"
          value={code}
          onChange={onChangeCode}
          onRun={handleExecute}
          minHeight={240}
          ariaLabel="Editor de consultas SQL"
        />

        <aside className="ce-sql-schema" aria-label="Esquema das tabelas">
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase" }}>
            Esquema do Banco
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {schema.map(tbl => (
              <div
                key={tbl.name}
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <button
                    type="button"
                    style={{
                      border: 0,
                      background: "transparent",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontWeight: 700,
                      fontSize: 12.5,
                      color: "#2dd4bf",
                    }}
                    title={`Inserir SELECT * FROM ${tbl.name} LIMIT 10;`}
                    onClick={() => onChangeCode(`SELECT * FROM ${tbl.name} LIMIT 10;`)}
                  >
                    <Table2 size={13} />
                    <span>{tbl.name}</span>
                  </button>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{tbl.rowCount} reg.</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {tbl.columns.map(col => (
                    <div
                      key={col.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 11.5,
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      <span>
                        {col.name}
                        {col.pk ? " [PK]" : col.fk ? " [FK]" : ""}
                      </span>
                      <span style={{ color: "var(--text-muted)", fontSize: 10.5 }}>{col.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="ce-output-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <strong style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Resultado da Consulta
          </strong>
          {result && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`ce-badge ${result.success ? "ce-badge-diff-easy" : "ce-badge-diff-hard"}`}>
                {result.success ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                <span>
                  {result.success
                    ? `${result.rowCount} linha(s) · ${result.executionTimeMs}ms`
                    : "Erro SQL"}
                </span>
              </span>
            </div>
          )}
        </div>

        {!result ? (
          <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
            Escreva uma instrução SQL e pressione Ctrl+Enter para consultar o banco em memória.
          </div>
        ) : result.error ? (
          <div style={{ fontSize: 12.5, color: "var(--accent-danger)", fontFamily: "var(--font-mono)" }}>
            {result.error}
          </div>
        ) : result.columns.length > 0 ? (
          <div className="ce-sql-table-wrap">
            <table className="ce-table">
              <thead>
                <tr>
                  {result.columns.map(c => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, idx) => (
                  <tr key={idx}>
                    {result.columns.map(col => (
                      <td key={col}>
                        {row[col] === null ? (
                          <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>NULL</span>
                        ) : (
                          String(row[col])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ fontSize: 12.5, color: "var(--accent-success)" }}>
            {(result.messages || []).join(" · ")} ({result.changes} alteração(ões)).
          </div>
        )}
      </div>
    </div>
  );
};
