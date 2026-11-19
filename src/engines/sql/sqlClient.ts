import type { SqlExecuteResponse, SqlTableSchema } from "../../types/execution";

export async function fetchSqlSchema(datasetId: "ecommerce" | "empresa"): Promise<{
  datasetId: string;
  name: string;
  description: string;
  tables: SqlTableSchema[];
}> {
  const res = await fetch(`/api/sql/schema?dataset=${encodeURIComponent(datasetId)}`);
  if (!res.ok) {
    throw new Error("Não foi possível carregar o esquema do banco de dados.");
  }
  return res.json();
}

export async function executeSqlQuery(
  datasetId: "ecommerce" | "empresa",
  query: string,
  setupSql = ""
): Promise<SqlExecuteResponse> {
  const res = await fetch("/api/sql/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ datasetId, query, setupSql }),
  });
  return res.json();
}
