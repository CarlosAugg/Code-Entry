import { executeSql, getDatasetSchema, setSqlDatabaseFactory } from "./sqlSandbox.mjs";
import { initializeSqlJs, SqlJsDatabaseSync } from "./sqliteAdapter";

interface SqlRequest {
  id: number;
  type: "schema" | "execute";
  datasetId: "ecommerce" | "empresa";
  query?: string;
}

const workerScope = self as unknown as {
  addEventListener(type: "message", listener: (event: MessageEvent<SqlRequest>) => void): void;
  postMessage(message: unknown): void;
};

const ready = initializeSqlJs().then(() => {
  setSqlDatabaseFactory(SqlJsDatabaseSync);
});

workerScope.addEventListener("message", async event => {
  const request = event.data;
  try {
    await ready;
    const result = request.type === "schema"
      ? getDatasetSchema(request.datasetId)
      : executeSql({ datasetId: request.datasetId, query: request.query || "" });
    workerScope.postMessage({ id: request.id, result });
  } catch (error) {
    workerScope.postMessage({
      id: request.id,
      error: error instanceof Error ? error.message : "Erro ao executar SQL local.",
    });
  }
});
