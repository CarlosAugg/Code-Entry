import type {
  ActivityHistoryEntry,
  BootstrapPayload,
  BootstrapWithMeta,
  ChallengeProgressEntry,
  LessonProgressEntry,
  RoadmapTopicProgressEntry,
  RoadmapTopicStatus,
  StorageErrorCode,
  StorageErrorInfo,
  UserSettings,
} from "../types/progress";
import {
  CodeEntryDatabase,
  StorageSchemaError,
  type SyncSqlDatabase,
} from "./progressDatabase.mjs";

export const STORAGE_DB_NAME = "code-entry-local";
export const STORAGE_DB_VERSION = 1;
export const STORAGE_STORE_NAME = "sqlite";
export const STORAGE_PRIMARY_KEY = "progress";
export const LEGACY_STORAGE_KEYS = [
  "progress-v4",
  "progress-v3",
  "progress-v2",
  "progress-v1",
] as const;
export const PRE_MIGRATION_BACKUP_KEY = "backup-pre-migration";
export const CORRUPT_BACKUP_KEY = "backup-corrupted-raw";

export const CODE_ENTRY_WEB_STORAGE_KEYS = [
  "ce.themeMode",
  "ce.themePalette",
  "ce.lastPalette.dark",
  "ce.lastPalette.light",
  "ce.sidebarCollapsed",
] as const;

export const CODE_ENTRY_WEB_STORAGE_PREFIXES = ["ce.", "code-entry."] as const;

export interface StorageLike {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface BinaryKVStore {
  get(key: string): Promise<Uint8Array | undefined>;
  put(key: string, bytes: Uint8Array): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface PersistableSyncDatabase extends SyncSqlDatabase {
  export(): Uint8Array;
}

export interface SqliteRuntimeAdapter {
  initialize(): Promise<void>;
  create(bytes?: Uint8Array): PersistableSyncDatabase;
}

export class LocalStorageError extends Error {
  code: StorageErrorCode;
  canDownloadRawBackup: boolean;
  canImportJson: boolean;
  canResetLocal: boolean;

  constructor(
    code: StorageErrorCode,
    message: string,
    opts: {
      canDownloadRawBackup?: boolean;
      canImportJson?: boolean;
      canResetLocal?: boolean;
    } = {}
  ) {
    super(message);
    this.name = "LocalStorageError";
    this.code = code;
    this.canDownloadRawBackup = Boolean(opts.canDownloadRawBackup);
    this.canImportJson = Boolean(opts.canImportJson);
    this.canResetLocal = opts.canResetLocal ?? true;
  }

  toInfo(): StorageErrorInfo {
    return {
      code: this.code,
      message: this.message,
      canDownloadRawBackup: this.canDownloadRawBackup,
      canImportJson: this.canImportJson,
      canResetLocal: this.canResetLocal,
    };
  }
}

export function isCodeEntryStorageKey(key: string): boolean {
  if (!key) return false;
  if ((CODE_ENTRY_WEB_STORAGE_KEYS as readonly string[]).includes(key)) {
    return true;
  }
  return CODE_ENTRY_WEB_STORAGE_PREFIXES.some(prefix => key.startsWith(prefix));
}

function removeMatchingKeysFromStorage(storage: StorageLike | null | undefined): string[] {
  if (!storage) return [];
  const removed: string[] = [];
  try {
    const keysToRemove = new Set<string>();
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && isCodeEntryStorageKey(k)) {
        keysToRemove.add(k);
      }
    }
    for (const fixedKey of CODE_ENTRY_WEB_STORAGE_KEYS) {
      if (storage.getItem(fixedKey) !== null) {
        keysToRemove.add(fixedKey);
      }
    }
    for (const k of keysToRemove) {
      storage.removeItem(k);
      removed.push(k);
    }
  } catch {
    // Ignora restrições pontuais de Web Storage
  }
  return removed;
}

export function clearCodeEntryWebStorage(
  local?: StorageLike | null,
  session?: StorageLike | null
): string[] {
  const localObj =
    local !== undefined
      ? local
      : typeof window !== "undefined"
        ? window.localStorage
        : null;
  const sessionObj =
    session !== undefined
      ? session
      : typeof window !== "undefined"
        ? window.sessionStorage
        : null;

  return [
    ...removeMatchingKeysFromStorage(localObj),
    ...removeMatchingKeysFromStorage(sessionObj),
  ];
}

function getDefaultLocalStorage(): StorageLike | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readSidebarCollapsed(storage: StorageLike | null = getDefaultLocalStorage()): boolean {
  try {
    return storage?.getItem("ce.sidebarCollapsed") === "1";
  } catch {
    return false;
  }
}

export function writeSidebarCollapsed(
  collapsed: boolean,
  storage: StorageLike | null = getDefaultLocalStorage()
): void {
  try {
    if (!storage) return;
    if (collapsed) storage.setItem("ce.sidebarCollapsed", "1");
    else storage.removeItem("ce.sidebarCollapsed");
  } catch {
    // Ignora restrições de navegador
  }
}

export function readLastPaletteForMode(
  mode: "dark" | "light",
  storage: StorageLike | null = getDefaultLocalStorage()
): string | null {
  try {
    return storage?.getItem(`ce.lastPalette.${mode}`) ?? null;
  } catch {
    return null;
  }
}

export function writeUiThemeCache(
  mode: "dark" | "light",
  paletteId: string,
  storage: StorageLike | null = getDefaultLocalStorage()
): void {
  try {
    if (!storage) return;
    storage.setItem("ce.themeMode", mode);
    storage.setItem("ce.themePalette", paletteId);
    storage.setItem(`ce.lastPalette.${mode}`, paletteId);
  } catch {
    // Ignora restrições de navegador
  }
}

interface StoreHandle {
  sqlite: PersistableSyncDatabase;
  database: CodeEntryDatabase;
  migratedFromKey: string | null;
  migratedFromVersion: number | null;
}

export function createLocalStoreController(
  kv: BinaryKVStore,
  runtime: SqliteRuntimeAdapter,
  webStorage?: {
    local?: StorageLike | null;
    session?: StorageLike | null;
  }
) {
  let activeHandle: StoreHandle | null = null;
  let queue: Promise<unknown> = Promise.resolve();

  function enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const res = queue.then(fn);
    queue = res.then(
      () => undefined,
      () => undefined
    );
    return res;
  }

  function closeActiveHandle() {
    if (!activeHandle) return;
    try {
      activeHandle.sqlite.close();
    } catch {
      // Ignora erro ao fechar instância já liberada
    }
    activeHandle = null;
  }

  async function initializeStore(): Promise<StoreHandle> {
    if (activeHandle) return activeHandle;

    let primaryBytes: Uint8Array | undefined;
    const legacyHits: { key: string; bytes: Uint8Array }[] = [];

    try {
      primaryBytes = await kv.get(STORAGE_PRIMARY_KEY);
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const legacyBytes = await kv.get(legacyKey);
        if (legacyBytes && legacyBytes.byteLength > 0) {
          legacyHits.push({ key: legacyKey, bytes: legacyBytes });
        }
      }
    } catch (err) {
      if (err instanceof LocalStorageError) throw err;
      throw new LocalStorageError(
        "STORAGE_UNAVAILABLE",
        err instanceof Error
          ? err.message
          : "Não foi possível acessar o armazenamento local deste navegador.",
        { canDownloadRawBackup: false, canImportJson: true, canResetLocal: false }
      );
    }

    const hasPrimary = Boolean(primaryBytes && primaryBytes.byteLength > 0);
    const chosenLegacy = !hasPrimary ? legacyHits[0] : undefined;
    const sourceKey = hasPrimary
      ? STORAGE_PRIMARY_KEY
      : chosenLegacy
        ? chosenLegacy.key
        : null;
    const sourceBytes = hasPrimary
      ? (primaryBytes as Uint8Array)
      : chosenLegacy
        ? chosenLegacy.bytes
        : undefined;

    await runtime.initialize();

    if (!sourceBytes) {
      const sqlite = runtime.create(undefined);
      const database = new CodeEntryDatabase(sqlite);
      activeHandle = {
        sqlite,
        database,
        migratedFromKey: null,
        migratedFromVersion: null,
      };
      return activeHandle;
    }

    const rawSnapshot = sourceBytes.slice();
    let sqlite: PersistableSyncDatabase | null = null;

    try {
      sqlite = runtime.create(rawSnapshot.slice());
      const checkRow = sqlite.prepare("PRAGMA quick_check").get();
      const qcValue = checkRow ? String(Object.values(checkRow)[0] ?? "") : "";
      if (qcValue.toLowerCase() !== "ok") {
        throw new Error(`Falha na verificação de integridade SQLite (${qcValue || "inválida"}).`);
      }

      const database = new CodeEntryDatabase(sqlite);
      const schemaInfo = database.getSchemaInfo();
      const needsKeyPromotion = sourceKey !== STORAGE_PRIMARY_KEY;
      const needsMigrationPersist = Boolean(schemaInfo.migrated) || needsKeyPromotion;

      if (needsMigrationPersist) {
        // Preserva uma cópia bruta pré-migração antes de promover ou atualizar o banco principal
        await kv.put(PRE_MIGRATION_BACKUP_KEY, rawSnapshot);
        await kv.put(STORAGE_PRIMARY_KEY, sqlite.export());
        for (const item of legacyHits) {
          await kv.delete(item.key);
        }
      } else if (legacyHits.length > 0) {
        // Limpa chaves legadas residuais apenas depois de validar o banco canônico principal
        for (const item of legacyHits) {
          await kv.delete(item.key);
        }
      }

      activeHandle = {
        sqlite,
        database,
        migratedFromKey: needsKeyPromotion ? sourceKey : null,
        migratedFromVersion: schemaInfo.migrated ? schemaInfo.previousVersion : null,
      };
      return activeHandle;
    } catch (error) {
      if (sqlite) {
        try {
          sqlite.close();
        } catch {
          // Ignora
        }
      }

      if (error instanceof StorageSchemaError && error.code === "FUTURE_SCHEMA_VERSION") {
        throw new LocalStorageError("UNSUPPORTED_FUTURE_SCHEMA", error.message, {
          canDownloadRawBackup: true,
          canImportJson: true,
          canResetLocal: true,
        });
      }

      if (error instanceof LocalStorageError) throw error;

      // Nunca apaga os dados originais em caso de corrupção; preserva uma cópia recuperável
      try {
        const existingRawBackup = await kv.get(CORRUPT_BACKUP_KEY);
        if (!existingRawBackup || existingRawBackup.byteLength === 0) {
          await kv.put(CORRUPT_BACKUP_KEY, rawSnapshot);
        }
      } catch {
        // Melhor esforço sem mascarar o erro principal de corrupção
      }

      const detail = error instanceof Error ? error.message : String(error);
      throw new LocalStorageError(
        "CORRUPTED_STORAGE",
        `Os dados locais salvos estão corrompidos ou em formato ilegível (${detail}). Nenhuma informação foi apagada automaticamente e uma cópia bruta foi preservada para recuperação.`,
        {
          canDownloadRawBackup: true,
          canImportJson: true,
          canResetLocal: true,
        }
      );
    }
  }

  function run<T>(operation: (database: CodeEntryDatabase) => T, persist = false): Promise<T> {
    return enqueue(async () => {
      const handle = await initializeStore();
      const checkpoint = persist ? handle.sqlite.export() : null;
      try {
        const value = operation(handle.database);
        if (persist) {
          try {
            await kv.put(STORAGE_PRIMARY_KEY, handle.sqlite.export());
          } catch (writeErr) {
            throw new LocalStorageError(
              "WRITE_FAILED",
              writeErr instanceof Error
                ? writeErr.message
                : "Não foi possível gravar as alterações no armazenamento local.",
              { canDownloadRawBackup: true, canImportJson: true, canResetLocal: true }
            );
          }
        }
        return value;
      } catch (error) {
        if (checkpoint) {
          try {
            handle.sqlite.close();
          } catch {
            // Ignora
          }
          const restoredSqlite = runtime.create(checkpoint);
          handle.sqlite = restoredSqlite;
          handle.database = new CodeEntryDatabase(restoredSqlite);
        }
        throw error;
      }
    });
  }

  async function resetAllLocalData(): Promise<BootstrapPayload> {
    return enqueue(async () => {
      closeActiveHandle();
      await kv.clear();
      clearCodeEntryWebStorage(
        webStorage ? webStorage.local : undefined,
        webStorage ? webStorage.session : undefined
      );
      await runtime.initialize();
      const freshSqlite = runtime.create(undefined);
      const freshDb = new CodeEntryDatabase(freshSqlite);
      activeHandle = {
        sqlite: freshSqlite,
        database: freshDb,
        migratedFromKey: null,
        migratedFromVersion: null,
      };
      return freshDb.getBootstrap();
    });
  }

  async function restoreBackup(payload: unknown): Promise<BootstrapPayload> {
    return enqueue(async () => {
      await runtime.initialize();
      const tempSqlite = runtime.create(undefined);
      try {
        const tempDb = new CodeEntryDatabase(tempSqlite);
        const restored = tempDb.restoreBackup(payload);
        await kv.put(STORAGE_PRIMARY_KEY, tempSqlite.export());
        await kv.delete(CORRUPT_BACKUP_KEY);
        await kv.delete(PRE_MIGRATION_BACKUP_KEY);
        for (const legacyKey of LEGACY_STORAGE_KEYS) {
          await kv.delete(legacyKey);
        }
        closeActiveHandle();
        activeHandle = {
          sqlite: tempSqlite,
          database: tempDb,
          migratedFromKey: null,
          migratedFromVersion: null,
        };
        return restored;
      } catch (error) {
        try {
          tempSqlite.close();
        } catch {
          // Ignora
        }
        throw error;
      }
    });
  }

  async function getRawRecoverySnapshot(): Promise<{ bytes: Uint8Array; filename: string } | null> {
    return enqueue(async () => {
      const dateStr = new Date().toISOString().slice(0, 10);
      const corrupt = await kv.get(CORRUPT_BACKUP_KEY);
      if (corrupt && corrupt.byteLength > 0) {
        return { bytes: corrupt, filename: `code-entry-corrupted-${dateStr}.sqlite` };
      }
      const primary = await kv.get(STORAGE_PRIMARY_KEY);
      if (primary && primary.byteLength > 0) {
        return { bytes: primary, filename: `code-entry-preserved-${dateStr}.sqlite` };
      }
      const preMig = await kv.get(PRE_MIGRATION_BACKUP_KEY);
      if (preMig && preMig.byteLength > 0) {
        return { bytes: preMig, filename: `code-entry-premigration-${dateStr}.sqlite` };
      }
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const legacy = await kv.get(legacyKey);
        if (legacy && legacy.byteLength > 0) {
          return { bytes: legacy, filename: `code-entry-${legacyKey}-${dateStr}.sqlite` };
        }
      }
      return null;
    });
  }

  return {
    bootstrap(): Promise<BootstrapPayload> {
      return run(database => database.getBootstrap());
    },

    bootstrapWithMeta(): Promise<BootstrapWithMeta> {
      return enqueue(async () => {
        const handle = await initializeStore();
        return {
          payload: handle.database.getBootstrap(),
          warnings: handle.database.getRecoveryWarnings(),
          migratedFromKey: handle.migratedFromKey,
          migratedFromVersion: handle.migratedFromVersion,
        };
      });
    },

    updateSettings(patch: Partial<UserSettings>): Promise<{ settings: UserSettings }> {
      return run(database => ({ settings: database.updateSettings(patch) }), true);
    },

    addStudySeconds(
      seconds: number,
      date?: string
    ): Promise<{ settings: UserSettings; dailyStudyLog: Record<string, number> }> {
      return run(
        database => ({
          settings: database.addStudySeconds(seconds, date),
          dailyStudyLog: database.getDailyStudyLogMap(),
        }),
        true
      );
    },

    recordLessonAttempt(payload: {
      lessonId: string;
      trackId: string;
      completed: boolean;
      objectivesDone: string[];
      xpReward: number;
    }): Promise<{
      newlyCompleted: boolean;
      xpAwarded: number;
      progress: Record<string, LessonProgressEntry>;
    }> {
      return run(database => database.recordLessonAttempt(payload), true);
    },

    recordChallengeAttempt(payload: {
      challengeId: string;
      trackId: string;
      completed: boolean;
      durationMs: number;
      xpReward: number;
    }): Promise<{
      newlyCompleted: boolean;
      xpAwarded: number;
      progress: Record<string, ChallengeProgressEntry>;
    }> {
      return run(database => database.recordChallengeAttempt(payload), true);
    },

    saveDraft(
      draftKey: string,
      code: string,
      stdin = ""
    ): Promise<{ draftKey: string; updatedAt: string }> {
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
      return run(
        database => ({
          newlyUnlocked: database.unlockAchievements(ids),
          achievements: database.getAchievementsMap(),
        }),
        true
      );
    },

    saveWorkspace(
      key: string,
      state: unknown
    ): Promise<{ workspaceKey: string; updatedAt: string }> {
      return run(database => database.saveWorkspaceState(key, state), true);
    },

    setRoadmapTopicStatus(
      roadmapId: string,
      topicId: string,
      status: RoadmapTopicStatus
    ): Promise<{
      topicId: string;
      roadmapId: string;
      status: RoadmapTopicStatus;
      updatedAt: string;
      roadmapProgress: Record<string, RoadmapTopicProgressEntry>;
    }> {
      return run(database => database.setRoadmapTopicStatus(roadmapId, topicId, status), true);
    },

    toggleSavedRoadmap(roadmapId: string): Promise<{ saved: boolean; savedRoadmaps: string[] }> {
      return run(database => database.toggleSavedRoadmap(roadmapId), true);
    },

    exportBackup(): Promise<unknown> {
      return run(database => database.exportBackup());
    },

    restoreBackup,
    resetAllLocalData,
    getRawRecoverySnapshot,

    resetAll(preserveSettings = false): Promise<BootstrapPayload> {
      if (!preserveSettings) {
        return resetAllLocalData();
      }
      return run(database => database.resetAll({ preserveSettings: true }), true);
    },
  };
}
