import { createSqlJsDatabaseSync, initializeSqlJs } from "../engines/sql/sqliteAdapter";
import {
  clearCodeEntryWebStorage,
  CORRUPT_BACKUP_KEY,
  createLocalStoreController,
  isCodeEntryStorageKey,
  LEGACY_STORAGE_KEYS,
  LocalStorageError,
  PRE_MIGRATION_BACKUP_KEY,
  readLastPaletteForMode,
  readSidebarCollapsed,
  STORAGE_DB_NAME,
  STORAGE_DB_VERSION,
  STORAGE_PRIMARY_KEY,
  STORAGE_STORE_NAME,
  writeSidebarCollapsed,
  writeUiThemeCache,
  type BinaryKVStore,
} from "./localStoreController";

export {
  clearCodeEntryWebStorage,
  CORRUPT_BACKUP_KEY,
  isCodeEntryStorageKey,
  LEGACY_STORAGE_KEYS,
  LocalStorageError,
  PRE_MIGRATION_BACKUP_KEY,
  readLastPaletteForMode,
  readSidebarCollapsed,
  STORAGE_DB_NAME,
  STORAGE_DB_VERSION,
  STORAGE_PRIMARY_KEY,
  STORAGE_STORE_NAME,
  writeSidebarCollapsed,
  writeUiThemeCache,
};

let storePromise: Promise<IDBDatabase> | null = null;

function openStorage(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(
      new LocalStorageError(
        "STORAGE_UNAVAILABLE",
        "IndexedDB não está disponível neste navegador ou modo de navegação.",
        { canDownloadRawBackup: false, canImportJson: false, canResetLocal: false }
      )
    );
  }

  if (storePromise) return storePromise;
  storePromise = new Promise<IDBDatabase>((resolve, reject) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(STORAGE_DB_NAME, STORAGE_DB_VERSION);
    } catch (err) {
      storePromise = null;
      reject(
        new LocalStorageError(
          "STORAGE_UNAVAILABLE",
          err instanceof Error ? err.message : "Não foi possível abrir o armazenamento local.",
          { canDownloadRawBackup: false, canImportJson: true, canResetLocal: false }
        )
      );
      return;
    }

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORAGE_STORE_NAME)) {
        request.result.createObjectStore(STORAGE_STORE_NAME);
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        storePromise = null;
        try {
          db.close();
        } catch {
          // Ignora
        }
      };
      db.onclose = () => {
        storePromise = null;
      };
      resolve(db);
    };

    request.onerror = () => {
      storePromise = null;
      reject(
        new LocalStorageError(
          "STORAGE_UNAVAILABLE",
          request.error?.message || "Não foi possível abrir o armazenamento local.",
          { canDownloadRawBackup: false, canImportJson: true, canResetLocal: false }
        )
      );
    };

    request.onblocked = () => {
      storePromise = null;
      reject(
        new LocalStorageError(
          "STORAGE_UNAVAILABLE",
          "Feche outras abas do Code Entry para atualizar o armazenamento local.",
          { canDownloadRawBackup: false, canImportJson: false, canResetLocal: false }
        )
      );
    };
  });
  return storePromise;
}

const idbKvStore: BinaryKVStore = {
  async get(key: string): Promise<Uint8Array | undefined> {
    const db = await openStorage();
    return new Promise((resolve, reject) => {
      const request = db
        .transaction(STORAGE_STORE_NAME, "readonly")
        .objectStore(STORAGE_STORE_NAME)
        .get(key);
      request.onsuccess = () => {
        const value = request.result as ArrayBuffer | Uint8Array | undefined;
        resolve(value ? new Uint8Array(value instanceof Uint8Array ? value : value) : undefined);
      };
      request.onerror = () =>
        reject(request.error || new Error("Não foi possível ler os dados locais."));
    });
  },

  async put(key: string, bytes: Uint8Array): Promise<void> {
    const db = await openStorage();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORAGE_STORE_NAME, "readwrite");
      const copy = bytes.slice();
      transaction.objectStore(STORAGE_STORE_NAME).put(copy.buffer, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error || new Error("Não foi possível salvar os dados locais."));
      transaction.onabort = () =>
        reject(transaction.error || new Error("O salvamento local foi cancelado."));
    });
  },

  async delete(key: string): Promise<void> {
    const db = await openStorage();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORAGE_STORE_NAME, "readwrite");
      transaction.objectStore(STORAGE_STORE_NAME).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error || new Error("Não foi possível remover item legado local."));
      transaction.onabort = () =>
        reject(transaction.error || new Error("A remoção no armazenamento local foi cancelada."));
    });
  },

  async clear(): Promise<void> {
    const db = await openStorage();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORAGE_STORE_NAME, "readwrite");
      transaction.objectStore(STORAGE_STORE_NAME).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error || new Error("Não foi possível limpar o armazenamento local."));
      transaction.onabort = () =>
        reject(transaction.error || new Error("A limpeza do armazenamento local foi cancelada."));
    });
  },
};

export const localStore = createLocalStoreController(idbKvStore, {
  initialize: initializeSqlJs,
  create: createSqlJsDatabaseSync,
});
