import type { SqlExecuteResponse, SqlTableSchema } from "../../types/execution";

export type SqlDatasetId = "ecommerce" | "empresa";

export interface SqlSyncDatabase {
  exec(sql: string): void;
  prepare(sql: string): {
    get(...params: unknown[]): Record<string, unknown> | undefined;
    all(...params: unknown[]): Record<string, unknown>[];
    run(...params: unknown[]): { changes: number; lastInsertRowid: number };
  };
  close(): void;
}

export function setSqlDatabaseFactory(factory: () => SqlSyncDatabase): void;
export function listDatasets(): {
  id: SqlDatasetId;
  name: string;
  description: string;
  tables: SqlTableSchema[];
}[];
export function getDatasetSchema(datasetId?: SqlDatasetId): {
  datasetId: string;
  name: string;
  description: string;
  tables: SqlTableSchema[];
};
export function executeSql(input?: {
  datasetId?: SqlDatasetId;
  query?: string;
  setupSql?: string;
}): SqlExecuteResponse;
