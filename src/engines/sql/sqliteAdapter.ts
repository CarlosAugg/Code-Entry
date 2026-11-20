import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

export interface SqlStatement {
  get(...params: unknown[]): Record<string, unknown> | undefined;
  all(...params: unknown[]): Record<string, unknown>[];
  run(...params: unknown[]): { changes: number; lastInsertRowid: number };
}

export class SqlJsDatabaseSync {
  constructor(private readonly database: import("sql.js").Database) {}

  exec(sql: string): void {
    this.database.exec(sql);
  }

  prepare(sql: string): SqlStatement {
    const database = this.database;
    return {
      get(...params: unknown[]) {
        const statement = database.prepare(sql);
        try {
          if (params.length) statement.bind(params as any[]);
          return statement.step() ? statement.getAsObject() as Record<string, unknown> : undefined;
        } finally {
          statement.free();
        }
      },
      all(...params: unknown[]) {
        const statement = database.prepare(sql);
        const rows: Record<string, unknown>[] = [];
        try {
          if (params.length) statement.bind(params as any[]);
          while (statement.step()) rows.push(statement.getAsObject() as Record<string, unknown>);
          return rows;
        } finally {
          statement.free();
        }
      },
      run(...params: unknown[]) {
        database.run(sql, params as any[]);
        const changes = database.getRowsModified();
        const inserted = /\b(?:insert|replace)\b/i.test(sql);
        const rowId = inserted
          ? Number(database.exec("SELECT last_insert_rowid() AS id")[0]?.values[0]?.[0] || 0)
          : 0;
        return { changes, lastInsertRowid: rowId };
      },
    };
  }

  export(): Uint8Array {
    return this.database.export();
  }

  close(): void {
    this.database.close();
  }
}

let initialized: Promise<import("sql.js").SqlJsStatic> | null = null;
let runtime: import("sql.js").SqlJsStatic | null = null;

export async function initializeSqlJs(): Promise<void> {
  initialized ??= initSqlJs({ locateFile: () => wasmUrl });
  runtime = await initialized;
}

export function createSqlJsDatabaseSync(data?: Uint8Array): SqlJsDatabaseSync {
  if (!runtime) throw new Error("O mecanismo SQLite ainda não foi inicializado.");
  return new SqlJsDatabaseSync(new runtime.Database(data));
}

export async function createSqlJsDatabase(data?: Uint8Array): Promise<SqlJsDatabaseSync> {
  await initializeSqlJs();
  return createSqlJsDatabaseSync(data);
}
