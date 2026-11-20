import type { SqlExecuteResponse, SqlTableSchema } from "../../types/execution";

type DatasetId = "ecommerce" | "empresa";
type SqlWorkerResponse = {
  id: number;
  result?: any;
  error?: string;
};

const worker = new Worker(new URL("./sql.worker.ts", import.meta.url), { type: "module" });
const pending = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void }>();
let nextRequestId = 1;

worker.addEventListener("message", (event: MessageEvent<SqlWorkerResponse>) => {
  const request = pending.get(event.data.id);
  if (!request) return;
  pending.delete(event.data.id);
  if (event.data.error) request.reject(new Error(event.data.error));
  else request.resolve(event.data.result);
});

worker.addEventListener("error", event => {
  const error = new Error(event.message || "O executor SQL local falhou.");
  for (const request of pending.values()) request.reject(error);
  pending.clear();
});

function request<T>(type: "schema" | "execute", datasetId: DatasetId, query = ""): Promise<T> {
  const id = nextRequestId++;
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    worker.postMessage({ id, type, datasetId, query });
  });
}

export async function fetchSqlSchema(datasetId: DatasetId): Promise<{
  datasetId: string;
  name: string;
  description: string;
  tables: SqlTableSchema[];
}> {
  return request("schema", datasetId);
}

export async function executeSqlQuery(
  datasetId: DatasetId,
  query: string,
  _setupSql = ""
): Promise<SqlExecuteResponse> {
  return request("execute", datasetId, query);
}
