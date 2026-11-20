import type {
  ActivityHistoryEntry,
  BootstrapPayload,
  ChallengeProgressEntry,
  LessonProgressEntry,
  UserSettings,
} from "../types/progress";
import { CodeEntryDatabase } from "./progressDatabase.mjs";
import { createSqlJsDatabaseSync, initializeSqlJs, SqlJsDatabaseSync } from "../engines/sql/sqliteAdapter";

const STORAGE_DB_NAME = "code-entry-local";
const STORAGE_DB_VERSION = 1;
const STORAGE_STORE_NAME = "sqlite";
const STORAGE_KEY = "progress-v4";

interface StoreHandle {
  sqlite: SqlJsDatabaseSync;
  database: CodeEntryDatabase;
}

let activeHandle: StoreHandle | null = null;
let storePromise: Promise<IDBDatabase> | null = null;
let queue: Promise<unknown> = Promise.resolve();

function openStorage(): Promise<IDBDatabase> {
  if (storePromise) return storePromise;
  storePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(STORAGE_DB_NAME, STORAGE_DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORAGE_STORE_NAME)) {
        request.result.createObjectStore(STORAGE_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Não foi possível abrir o armazenamento local."));
    request.onblocked = () => reject(new Error("Feche outras abas do Code Entry para atualizar o armazenamento."));
  });
  return storePromise;
}

async function readStoredBytes(): Promise<Uint8Array | undefined> {
  const db = await openStorage();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORAGE_STORE_NAME, "readonly").objectStore(STORAGE_STORE_NAME).get(STORAGE_KEY);
    request.onsuccess = () => {
      const value = request.result as ArrayBuffer | Uint8Array | undefined;
      resolve(value ? new Uint8Array(value instanceof Uint8Array ? value : value) : undefined);
    };
    request.onerror = () => reject(request.error || new Error("Não foi possível ler os dados locais."));
  });
}

async function writeStoredBytes(bytes: Uint8Array): Promise<void> {
  const db = await openStorage();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORAGE_STORE_NAME, "readwrite");
    const copy = bytes.slice();
    transaction.objectStore(STORAGE_STORE_NAME).put(copy.buffer, STORAGE_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Não foi possível salvar os dados locais."));
    transaction.onabort = () => reject(transaction.error || new Error("O salvamento local foi cancelado."));
  });
}

async function initializeStore(): Promise<StoreHandle> {
  if (activeHandle) return activeHandle;
  const storedBytes = await readStoredBytes();
  await initializeSqlJs();
  const sqlite = createSqlJsDatabaseSync(storedBytes);
  const database = new CodeEntryDatabase(sqlite);
  const handle = { sqlite, database };
  activeHandle = handle;
  if (!storedBytes) await writeStoredBytes(sqlite.export());
  return handle;
}

function run<T>(operation: (database: CodeEntryDatabase) => T, persist = false): Promise<T> {
  const result = queue.then(async () => {
    const handle = await initializeStore();
    const checkpoint = persist ? handle.sqlite.export() : null;
    try {
      const value = operation(handle.database);
      if (persist) await writeStoredBytes(handle.sqlite.export());
      return value;
    } catch (error) {
      if (checkpoint) {
        handle.sqlite.close();
        const sqlite = createSqlJsDatabaseSync(checkpoint);
        handle.sqlite = sqlite;
        handle.database = new CodeEntryDatabase(sqlite);
      }
      throw error;
    }
  });
  queue = result.then(() => undefined, () => undefined);
  return result;
}

export const localStore = {
  bootstrap(): Promise<BootstrapPayload> {
    return run(database => database.getBootstrap());
  },

  updateSettings(patch: Partial<UserSettings>): Promise<{ settings: UserSettings }> {
    return run(database => ({ settings: database.updateSettings(patch) }), true);
  },

  addStudySeconds(seconds: number, date?: string): Promise<{ settings: UserSettings; dailyStudyLog: Record<string, number> }> {
    return run(database => ({
      settings: database.addStudySeconds(seconds, date),
      dailyStudyLog: database.getDailyStudyLogMap(),
    }), true);
  },

  recordLessonAttempt(payload: {
    lessonId: string;
    trackId: string;
    completed: boolean;
    objectivesDone: string[];
    xpReward: number;
  }): Promise<{ newlyCompleted: boolean; xpAwarded: number; progress: Record<string, LessonProgressEntry> }> {
    return run(database => database.recordLessonAttempt(payload), true);
  },

  recordChallengeAttempt(payload: {
    challengeId: string;
    trackId: string;
    completed: boolean;
    durationMs: number;
    xpReward: number;
  }): Promise<{ newlyCompleted: boolean; xpAwarded: number; progress: Record<string, ChallengeProgressEntry> }> {
    return run(database => database.recordChallengeAttempt(payload), true);
  },

  saveDraft(draftKey: string, code: string, stdin = ""): Promise<{ draftKey: string; updatedAt: string }> {
    return run(database => database.saveDraft(draftKey, code, stdin), true);
  },

  deleteDraft(draftKey: string): Promise<{ deleted: boolean }> {
    return run(database => database.deleteDraft(draftKey), true);
  },

  addHistoryEvent(payload: {
    eventType: string;
    trackId?: string | null;
    itemId?: string | null;
    title: string;
    status: string;
    detail?: string;
    xpDelta?: number;
    durationMs?: number;
  }): Promise<{ item: ActivityHistoryEntry }> {
    return run(database => ({ item: database.addHistoryEvent(payload) }), true);
  },

  unlockAchievements(ids: string[]): Promise<{
    newlyUnlocked: { achievementId: string; unlockedAt: string }[];
    achievements: Record<string, string>;
  }> {
    return run(database => ({
      newlyUnlocked: database.unlockAchievements(ids),
      achievements: database.getAchievementsMap(),
    }), true);
  },

  saveWorkspace(key: string, state: unknown): Promise<{ workspaceKey: string; updatedAt: string }> {
    return run(database => database.saveWorkspaceState(key, state), true);
  },

  exportBackup(): Promise<unknown> {
    return run(database => database.exportBackup());
  },

  restoreBackup(payload: unknown): Promise<BootstrapPayload> {
    return run(database => database.restoreBackup(payload), true);
  },

  resetAll(preserveSettings = true): Promise<BootstrapPayload> {
    return run(database => database.resetAll({ preserveSettings }), true);
  },
};
