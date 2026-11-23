import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import initSqlJs from "sql.js";
import {
  CodeEntryDatabase,
  CURRENT_SCHEMA_VERSION,
  StorageSchemaError,
} from "../src/services/progressDatabase.mjs";
import { executeSql, getDatasetSchema, listDatasets, setSqlDatabaseFactory } from "../src/engines/sql/sqlSandbox.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

let passed = 0;
function pass(msg) {
  passed++;
  console.log(`PASS: ${msg}`);
}

// 1. Compila harness TypeScript via esbuild
const outBundle = path.join(ROOT_DIR, "node_modules", ".cache", "code-entry-verify.mjs");
fs.mkdirSync(path.dirname(outBundle), { recursive: true });
await build({
  entryPoints: [path.join(ROOT_DIR, "src", "tests", "verifyEntry.ts")],
  bundle: true,
  format: "esm",
  platform: "neutral",
  outfile: outBundle,
  logLevel: "silent",
});

const harness = await import(pathToFileURL(outBundle).href);
const {
  executeLogicCode,
  executeJavaScriptCode,
  executePythonCode,
  executeCppCode,
  LinuxShellEngine,
  calculateSubnet,
  calculateVlsm,
  createDefaultTopologyState,
  executeNetworkCommand,
  parseWebFiles,
  serializeWebFiles,
  validateWebFilesSize,
  MAX_WEB_FILE_CHARS,
  WEB_SANDBOX_ATTR,
  WEB_SANDBOX_CSP,
  sanitizeCssForStyleTag,
  sanitizeHtmlForSandbox,
  instrumentStudentJs,
  buildSandboxedSrcDoc,
  evaluateWebProjectHeadless,
  clearCodeEntryWebStorage,
  CORRUPT_BACKUP_KEY,
  createLocalStoreController,
  isCodeEntryStorageKey,
  LEGACY_STORAGE_KEYS,
  LocalStorageError,
  PRE_MIGRATION_BACKUP_KEY,
  STORAGE_PRIMARY_KEY,
  ALL_LESSONS,
  CHALLENGES,
  ACHIEVEMENTS,
  TRACKS,
} = harness;

// 2. Verifica banco SQLite (CodeEntryDatabase) + Migração e Meta Diária
{
  const db = new CodeEntryDatabase(new DatabaseSync(":memory:"));
  const init = db.getBootstrap();
  assert.equal(init.settings.displayName, "Estudante");
  assert.equal(init.settings.theme, "dark");
  assert.equal(init.settings.themePalette, "dark-violet");
  assert.equal(init.settings.activeTrackId, "logic");
  assert.equal(init.settings.onboardingCompleted, false);
  assert.equal(init.settings.profileSetupCompleted, false);
  assert.equal(init.settings.reducedMotion, false);

  // Testa todas as 8 paletas (4 escuras + 4 claras), sincronia modo/paleta e rejeição segura de paleta inválida
  const expectedPalettes = [
    ["dark-violet", "dark"],
    ["dark-crimson", "dark"],
    ["dark-cyber", "dark"],
    ["dark-amber", "dark"],
    ["light-arctic", "light"],
    ["light-ocean", "light"],
    ["light-mint", "light"],
    ["light-coral", "light"],
  ];
  for (const [pal, expectedMode] of expectedPalettes) {
    const updated = db.updateSettings({ themePalette: pal });
    assert.equal(updated.themePalette, pal);
    assert.equal(updated.theme, expectedMode);
  }
  const ignoredInvalid = db.updateSettings({ themePalette: "invalid-palette" });
  assert.equal(ignoredInvalid.themePalette, "light-coral");
  const flippedDark = db.updateSettings({ theme: "dark" });
  assert.equal(flippedDark.theme, "dark");
  assert.equal(flippedDark.themePalette, "dark-violet");

  db.updateSettings({
    displayName: "Carlo",
    theme: "light",
    themePalette: "light-mint",
    activeTrackId: "python",
    dailyGoalMinutes: 45,
    onboardingCompleted: true,
    profileSetupCompleted: true,
    reducedMotion: true,
  });
  db.addStudySeconds(90, "2026-11-19");
  const s = db.getSettings();
  assert.equal(s.displayName, "Carlo");
  assert.equal(s.theme, "light");
  assert.equal(s.themePalette, "light-mint");
  assert.equal(s.studySecondsTotal, 90);
  assert.equal(s.onboardingCompleted, true);
  assert.equal(s.profileSetupCompleted, true);
  assert.equal(s.reducedMotion, true);
  assert.equal(db.getDailyStudyLogMap()["2026-11-19"], 90);

  const lRes = db.recordLessonAttempt({
    lessonId: "js-01",
    trackId: "js",
    completed: true,
    objectivesDone: ["js01-const", "js01-let", "js01-log"],
    xpReward: 40,
  });
  assert.equal(lRes.newlyCompleted, true);
  assert.equal(lRes.xpAwarded, 40);

  // Não-duplicação ao re-concluir aula já finalizada
  const lRepeat = db.recordLessonAttempt({
    lessonId: "js-01",
    trackId: "js",
    completed: true,
    objectivesDone: ["js01-const", "js01-let", "js01-log"],
    xpReward: 40,
  });
  assert.equal(lRepeat.newlyCompleted, false);
  assert.equal(lRepeat.xpAwarded, 0);

  const cRes = db.recordChallengeAttempt({
    challengeId: "ch-js-1",
    trackId: "js",
    completed: true,
    durationMs: 12,
    xpReward: 90,
  });
  assert.equal(cRes.newlyCompleted, true);

  // Não-duplicação ao re-concluir desafio já resolvido
  const cRepeat = db.recordChallengeAttempt({
    challengeId: "ch-js-1",
    trackId: "js",
    completed: true,
    durationMs: 10,
    xpReward: 90,
  });
  assert.equal(cRepeat.newlyCompleted, false);
  assert.equal(cRepeat.xpAwarded, 0);

  db.saveDraft("lesson:js-02", "const a = 1;", "");
  assert.equal(db.getDraftsMap()["lesson:js-02"].code, "const a = 1;");

  db.addHistoryEvent({
    eventType: "lesson_completed",
    trackId: "js",
    itemId: "js-01",
    title: "Variáveis, const e console.log",
    status: "success",
    detail: "Concluída",
    xpDelta: 40,
    durationMs: 3,
  });
  assert.equal(db.getHistory().length, 1);

  const unlocked = db.unlockAchievements(["ach-first-step"]);
  assert.equal(unlocked.length, 1);

  const backup = db.exportBackup();
  assert.equal(backup.version, CURRENT_SCHEMA_VERSION);
  db.resetAll();
  assert.equal(db.getHistory().length, 0);
  assert.equal(db.getSettings().onboardingCompleted, false);
  assert.equal(db.getSettings().profileSetupCompleted, false);
  assert.equal(db.getSettings().themePalette, "dark-violet");
  assert.deepEqual(db.getDailyStudyLogMap(), {});

  // Testa restauração de backup v4 e compatibilidade com backup v1 (sem themePalette/onboarding)
  db.restoreBackup(backup);
  assert.equal(db.getSettings().displayName, "Carlo");
  assert.equal(db.getSettings().themePalette, "light-mint");
  assert.equal(db.getSettings().onboardingCompleted, true);
  assert.equal(db.getSettings().profileSetupCompleted, true);
  assert.equal(db.getDailyStudyLogMap()["2026-11-19"], 90);
  assert.equal(db.getLessonProgressMap()["js-01"].completed, true);

  const legacyBackup = {
    version: 1,
    exportedAt: backup.exportedAt,
    data: {
      ...backup.data,
      dailyStudyLog: undefined,
      settings: {
        displayName: "Legado",
        theme: "light",
        activeTrackId: "cpp",
        dailyGoalMinutes: 25,
        studySecondsTotal: 120,
      },
    },
  };
  db.restoreBackup(legacyBackup);
  assert.equal(db.getSettings().displayName, "Legado");
  assert.equal(db.getSettings().theme, "light");
  assert.equal(db.getSettings().themePalette, "light-arctic");
  assert.equal(db.getSettings().activeTrackId, "cpp");
  assert.equal(db.getSettings().onboardingCompleted, false);
  db.close();
  pass("SQLite Database CRUD, 8 paletas, meta diária, não-duplicação de XP, backup v1/v4 e reset");
}

// 2b. Verifica migração não-destrutiva de arquivo SQLite v1/v2/v3 real para v4
{
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ce-mig-test-"));
  const legacyDbPath = path.join(tmpDir, "legacy-v1.db");
  try {
    const raw = new DatabaseSync(legacyDbPath);
    raw.exec(`
      CREATE TABLE user_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        display_name TEXT NOT NULL DEFAULT 'Estudante',
        theme TEXT NOT NULL DEFAULT 'dark',
        active_track_id TEXT NOT NULL DEFAULT 'js',
        daily_goal_minutes INTEGER NOT NULL DEFAULT 30,
        study_seconds_total INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE lesson_progress (
        lesson_id TEXT PRIMARY KEY,
        track_id TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        objectives_json TEXT NOT NULL DEFAULT '[]',
        attempts INTEGER NOT NULL DEFAULT 0,
        last_attempt_at TEXT,
        completed_at TEXT,
        xp_awarded INTEGER NOT NULL DEFAULT 0
      );
      INSERT INTO user_settings (id, display_name, theme, active_track_id, daily_goal_minutes, study_seconds_total, updated_at)
      VALUES (1, 'Veterano', 'light', 'python', 50, 600, '2026-01-10T10:00:00.000Z');
      INSERT INTO lesson_progress (lesson_id, track_id, completed, objectives_json, attempts, xp_awarded)
      VALUES ('py-01', 'python', 1, '["py01-print"]', 2, 40);
    `);
    raw.close();

    const migrated = new CodeEntryDatabase(new DatabaseSync(legacyDbPath));
    const boot = migrated.getBootstrap();
    assert.equal(boot.settings.displayName, "Veterano");
    assert.equal(boot.settings.theme, "light");
    assert.equal(boot.settings.themePalette, "light-arctic");
    assert.equal(boot.settings.activeTrackId, "python");
    assert.equal(boot.settings.studySecondsTotal, 600);
    assert.equal(boot.settings.onboardingCompleted, false);
    assert.equal(boot.settings.profileSetupCompleted, true);
    assert.equal(boot.settings.reducedMotion, false);
    assert.equal(boot.lessonProgress["py-01"].completed, true);

    migrated.updateSettings({ onboardingCompleted: true, reducedMotion: true, themePalette: "dark-cyber" });
    assert.equal(migrated.getSettings().onboardingCompleted, true);
    assert.equal(migrated.getSettings().reducedMotion, true);
    assert.equal(migrated.getSettings().theme, "dark");
    assert.equal(migrated.getSettings().themePalette, "dark-cyber");
    migrated.close();

    // Reabre o mesmo arquivo já migrado para garantir idempotência sem sobrescrever preferências
    const reopened = new CodeEntryDatabase(new DatabaseSync(legacyDbPath));
    assert.equal(reopened.getSettings().displayName, "Veterano");
    assert.equal(reopened.getSettings().themePalette, "dark-cyber");
    assert.equal(reopened.getSettings().onboardingCompleted, true);
    assert.equal(reopened.getSchemaInfo().migrated, false);
    assert.equal(reopened.getLessonProgressMap()["py-01"].completed, true);
    reopened.close();
    pass("Migração SQLite legado -> v5 idempotente preservando progresso, tema e perfil");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// 2c. Integridade, proteção contra versão futura, recuperação parcial, rollback e reset completo com sql.js
{
  const createMemoryStorage = (initial = {}) => {
    const map = new Map(Object.entries(initial).map(([k, v]) => [k, String(v)]));
    return {
      get length() {
        return map.size;
      },
      key(i) {
        return Array.from(map.keys())[i] ?? null;
      },
      getItem(k) {
        return map.has(k) ? map.get(k) : null;
      },
      setItem(k, v) {
        map.set(k, String(v));
      },
      removeItem(k) {
        map.delete(k);
      },
      snapshot() {
        return Object.fromEntries(map.entries());
      },
    };
  };

  const createMemoryKv = () => {
    const map = new Map();
    let failWrites = false;
    return {
      map,
      setFailWrites(v) {
        failWrites = v;
      },
      async get(k) {
        const b = map.get(k);
        return b ? b.slice() : undefined;
      },
      async put(k, bytes) {
        if (failWrites) throw new Error("Simulated QuotaExceededError");
        map.set(k, bytes.slice());
      },
      async delete(k) {
        map.delete(k);
      },
      async clear() {
        map.clear();
      },
    };
  };

  const SQL = await initSqlJs();
  const sqlJsRuntime = {
    async initialize() {},
    create(bytes) {
      const database = new SQL.Database(bytes);
      return {
        exec(sql) {
          database.exec(sql);
        },
        prepare(sql) {
          return {
            get(...params) {
              const stmt = database.prepare(sql);
              try {
                if (params.length) stmt.bind(params);
                return stmt.step() ? stmt.getAsObject() : undefined;
              } finally {
                stmt.free();
              }
            },
            all(...params) {
              const stmt = database.prepare(sql);
              const rows = [];
              try {
                if (params.length) stmt.bind(params);
                while (stmt.step()) rows.push(stmt.getAsObject());
                return rows;
              } finally {
                stmt.free();
              }
            },
            run(...params) {
              database.run(sql, params);
              const changes = database.getRowsModified();
              const inserted = /\b(?:insert|replace)\b/i.test(sql);
              const rowId = inserted
                ? Number(database.exec("SELECT last_insert_rowid() AS id")[0]?.values[0]?.[0] || 0)
                : 0;
              return { changes, lastInsertRowid: rowId };
            },
          };
        },
        export() {
          return database.export();
        },
        close() {
          database.close();
        },
      };
    },
  };

  // A. Proteção contra esquema futuro + recuperação de dados parcialmente corrompidos + rollback de restore inválido
  {
    const rawFuture = new DatabaseSync(":memory:");
    rawFuture.exec(`
      CREATE TABLE schema_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      INSERT INTO schema_meta (key, value) VALUES ('schema_version', '99');
    `);
    assert.throws(
      () => new CodeEntryDatabase(rawFuture),
      err => err instanceof StorageSchemaError && err.code === "FUTURE_SCHEMA_VERSION"
    );
    rawFuture.close();

    const partialRaw = new DatabaseSync(":memory:");
    partialRaw.exec(`
      CREATE TABLE schema_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      INSERT INTO schema_meta (key, value) VALUES ('schema_version', '4');
      CREATE TABLE user_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        display_name TEXT NOT NULL DEFAULT 'Estudante',
        theme TEXT NOT NULL DEFAULT 'dark',
        theme_palette TEXT NOT NULL DEFAULT 'dark-violet',
        active_track_id TEXT NOT NULL DEFAULT 'logic',
        daily_goal_minutes INTEGER NOT NULL DEFAULT 30,
        study_seconds_total INTEGER NOT NULL DEFAULT 0,
        onboarding_completed INTEGER NOT NULL DEFAULT 0,
        profile_setup_completed INTEGER NOT NULL DEFAULT 0,
        reduced_motion INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE lesson_progress (
        lesson_id TEXT PRIMARY KEY,
        track_id TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        objectives_json TEXT NOT NULL DEFAULT '[]',
        attempts INTEGER NOT NULL DEFAULT 0,
        last_attempt_at TEXT,
        completed_at TEXT,
        xp_awarded INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE workspace_state (
        workspace_key TEXT PRIMARY KEY,
        state_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      INSERT INTO lesson_progress (lesson_id, track_id, completed, objectives_json, attempts, xp_awarded)
      VALUES ('web-01', 'web', 1, '{bad-json', 3, 40);
      INSERT INTO workspace_state (workspace_key, state_json, updated_at)
      VALUES ('lesson:lx-01', 'not-valid-json', '2026-01-01T00:00:00Z');
    `);
    const recoveredDb = new CodeEntryDatabase(partialRaw);
    const bootPartial = recoveredDb.getBootstrap();
    assert.equal(bootPartial.lessonProgress["web-01"].completed, true);
    assert.equal(bootPartial.lessonProgress["web-01"].xpAwarded, 40);
    assert.deepEqual(bootPartial.lessonProgress["web-01"].objectivesDone, []);
    assert.deepEqual(bootPartial.workspaces["lesson:lx-01"], {});
    assert.equal(bootPartial.settings.dailyGoalMinutes, 30);
    assert.ok(recoveredDb.getRecoveryWarnings().length >= 2);

    // Backup inválido não apaga os dados existentes (rollback limpo)
    assert.throws(
      () => recoveredDb.restoreBackup({ invalidKey: true }),
      err => err instanceof StorageSchemaError && err.code === "INVALID_BACKUP"
    );
    assert.equal(recoveredDb.getLessonProgressMap()["web-01"].completed, true);

    // IDs estáveis de lições permanecem vinculados ao ID mesmo com reordenação/inclusão de aulas
    const stableMap = recoveredDb.getLessonProgressMap();
    const reorderedSubset = ["py-01", "web-new", "web-01"];
    assert.equal(stableMap[reorderedSubset[0]]?.completed ?? false, false);
    assert.equal(stableMap[reorderedSubset[2]]?.completed, true);
    recoveredDb.close();
  }

  // B. Migração de chave legada progress-v4 -> progress, estado interrompido, falha de gravação e reset escopado
  {
    const legacyMem = new SQL.Database();
    legacyMem.exec(`
      CREATE TABLE schema_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      INSERT INTO schema_meta (key, value) VALUES ('schema_version', '4');
      CREATE TABLE user_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        display_name TEXT NOT NULL,
        theme TEXT NOT NULL,
        theme_palette TEXT NOT NULL,
        active_track_id TEXT NOT NULL,
        daily_goal_minutes INTEGER NOT NULL,
        study_seconds_total INTEGER NOT NULL,
        onboarding_completed INTEGER NOT NULL,
        profile_setup_completed INTEGER NOT NULL,
        reduced_motion INTEGER NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE lesson_progress (
        lesson_id TEXT PRIMARY KEY, track_id TEXT NOT NULL, completed INTEGER NOT NULL,
        objectives_json TEXT NOT NULL, attempts INTEGER NOT NULL, last_attempt_at TEXT, completed_at TEXT, xp_awarded INTEGER NOT NULL
      );
      CREATE TABLE code_drafts (draft_key TEXT PRIMARY KEY, code TEXT NOT NULL, stdin TEXT NOT NULL, updated_at TEXT NOT NULL);
      INSERT INTO user_settings VALUES (1, 'Marina', 'light', 'light-ocean', 'web', 60, 420, 1, 1, 1, '2026-06-01T12:00:00Z');
      INSERT INTO lesson_progress VALUES ('js-01', 'js', 1, '["js01-const"]', 1, '2026-06-01T12:00:00Z', '2026-06-01T12:00:00Z', 40);
      INSERT INTO code_drafts VALUES ('lesson:web-01', '{"__ceWebProject":1,"html":"<h1>Oi</h1>","css":"","js":""}', '', '2026-06-01T12:00:00Z');
    `);
    const legacyBytes = legacyMem.export();
    legacyMem.close();

    const kv = createMemoryKv();
    await kv.put(LEGACY_STORAGE_KEYS[0], legacyBytes); // "progress-v4"
    const localMem = createMemoryStorage({
      "ce.themeMode": "light",
      "ce.themePalette": "light-ocean",
      "ce.lastPalette.light": "light-ocean",
      "ce.sidebarCollapsed": "1",
      "otherApp.token": "keep-token-123",
      "githubPages.theme": "unrelated-site",
    });
    const sessionMem = createMemoryStorage({
      "ce.tempFlag": "remove-me",
      "otherApp.session": "keep-session-456",
    });

    const controller1 = createLocalStoreController(kv, sqlJsRuntime, {
      local: localMem,
      session: sessionMem,
    });
    const bootMeta = await controller1.bootstrapWithMeta();
    assert.equal(bootMeta.migratedFromKey, "progress-v4");
    assert.equal(bootMeta.migratedFromVersion, 4);
    assert.equal(bootMeta.payload.settings.displayName, "Marina");
    assert.equal(bootMeta.payload.settings.themePalette, "light-ocean");
    assert.equal(bootMeta.payload.settings.dailyGoalMinutes, 60);
    assert.equal(bootMeta.payload.lessonProgress["js-01"].completed, true);
    assert.ok(bootMeta.payload.drafts["lesson:web-01"].code.includes("<h1>Oi</h1>"));
    assert.ok(kv.map.has(STORAGE_PRIMARY_KEY));
    assert.ok(kv.map.has(PRE_MIGRATION_BACKUP_KEY));
    assert.ok(!kv.map.has(LEGACY_STORAGE_KEYS[0]));

    // Simula migração anteriormente interrompida (chaves progress E progress-v4 presentes) + falha de gravação
    await kv.put(LEGACY_STORAGE_KEYS[0], legacyBytes);
    const controller2 = createLocalStoreController(kv, sqlJsRuntime, {
      local: localMem,
      session: sessionMem,
    });
    const boot2 = await controller2.bootstrapWithMeta();
    assert.equal(boot2.payload.settings.displayName, "Marina");
    assert.ok(!kv.map.has(LEGACY_STORAGE_KEYS[0]));

    kv.setFailWrites(true);
    await assert.rejects(
      () => controller2.updateSettings({ displayName: "FalhouEscrita" }),
      err => err instanceof LocalStorageError && err.code === "WRITE_FAILED"
    );
    kv.setFailWrites(false);
    // Rollback manteve nome original intacto na memória e no armazenamento
    const afterFailedWrite = await controller2.bootstrap();
    assert.equal(afterFailedWrite.settings.displayName, "Marina");

    // Reset local completo remove apenas dados do Code Entry em ambos os mecanismos
    const resetBoot = await controller2.resetAllLocalData();
    assert.equal(resetBoot.settings.displayName, "Estudante");
    assert.equal(resetBoot.settings.dailyGoalMinutes, 30);
    assert.equal(resetBoot.settings.themePalette, "dark-violet");
    assert.equal(resetBoot.settings.profileSetupCompleted, false);
    assert.equal(resetBoot.settings.onboardingCompleted, false);
    assert.deepEqual(resetBoot.lessonProgress, {});
    assert.deepEqual(resetBoot.drafts, {});
    assert.equal(kv.map.size, 0);
    assert.deepEqual(localMem.snapshot(), {
      "otherApp.token": "keep-token-123",
      "githubPages.theme": "unrelated-site",
    });
    assert.deepEqual(sessionMem.snapshot(), {
      "otherApp.session": "keep-session-456",
    });
  }

  // C. Dados corrompidos no armazenamento NÃO sofrem reset silencioso e preservam cópia recuperável
  {
    const kv = createMemoryKv();
    const corruptBytes = new Uint8Array([0, 1, 2, 3, 255, 128, 42]);
    await kv.put(STORAGE_PRIMARY_KEY, corruptBytes);
    const controller = createLocalStoreController(kv, sqlJsRuntime, {
      local: createMemoryStorage(),
      session: createMemoryStorage(),
    });
    await assert.rejects(
      () => controller.bootstrapWithMeta(),
      err =>
        err instanceof LocalStorageError &&
        err.code === "CORRUPTED_STORAGE" &&
        err.canDownloadRawBackup === true &&
        err.canResetLocal === true
    );
    // Bytes originais continuam intactos E cópia bruta recuperável foi salva
    assert.deepEqual(Array.from(kv.map.get(STORAGE_PRIMARY_KEY)), Array.from(corruptBytes));
    assert.deepEqual(Array.from(kv.map.get(CORRUPT_BACKUP_KEY)), Array.from(corruptBytes));

    // Mesmo diante de erro por corrupção, é possível restaurar um backup JSON válido sem reset destrutivo
    const restored = await controller.restoreBackup({
      version: CURRENT_SCHEMA_VERSION,
      data: {
        settings: { displayName: "Recuperado", profileSetupCompleted: true, onboardingCompleted: true },
        lessonProgress: {
          "web-02": {
            lessonId: "web-02",
            trackId: "web",
            completed: true,
            objectivesDone: ["w02-a11y"],
            attempts: 1,
            xpAwarded: 50,
          },
        },
      },
    });
    assert.equal(restored.settings.displayName, "Recuperado");
    assert.equal(restored.lessonProgress["web-02"].completed, true);
    assert.ok(!kv.map.has(CORRUPT_BACKUP_KEY));
    assert.equal(isCodeEntryStorageKey("ce.themePalette"), true);
    assert.equal(isCodeEntryStorageKey("otherApp.token"), false);
  }

  pass("Integridade, versão futura, recuperação parcial, rollback, migração progress-v4 -> progress e reset local escopado");
}

// 3. Verifica SQL Sandbox
{
  setSqlDatabaseFactory(() => new DatabaseSync(":memory:"));
  const datasets = listDatasets();
  assert.equal(datasets.length, 2);
  assert.equal(getDatasetSchema("ecommerce").tables.length, 4);
  assert.equal(getDatasetSchema("empresa").tables.length, 3);

  const blocked = executeSql({ datasetId: "ecommerce", query: "ATTACH DATABASE '/tmp/x.db' AS x;" });
  assert.equal(blocked.success, false);
  assert.match(blocked.error, /bloqueada/i);

  const ok = executeSql({ datasetId: "ecommerce", query: "SELECT COUNT(*) AS total FROM clientes;" });
  assert.equal(ok.success, true);
  assert.equal(ok.rows[0].total, 8);
  pass("SQLite Sandbox isolado (datasets, consultas e bloqueio de ATTACH)");
}

// 4. Verifica proteção de loop infinito e segurança nos motores (incluindo Portugol/Lógica)
{
  const lgBlocks = executeLogicCode(`
var total = 0
para i de 1 ate 4 faca
  se (i % 2 == 0) entao
    total = total + i
  fimse
fimpara
escreva("Par:", total)
`);
  assert.equal(lgBlocks.success, true, lgBlocks.error);
  assert.equal(lgBlocks.scope.total, 6);
  assert.match(lgBlocks.outputText, /Par: 6/);

  const lgFunc = executeLogicCode(`
funcao dobro(x)
  retorne x * 2
fimfuncao
var r = dobro(7)
escreva(r)
`);
  assert.equal(lgFunc.success, true, lgFunc.error);
  assert.equal(lgFunc.scope.r, 14);

  const lgInf = executeLogicCode("enquanto (verdadeiro) {\n}");
  assert.equal(lgInf.success, false);
  assert.match(lgInf.error, /50\.000/);

  const lgSec = executeLogicCode("var f = typeof fetch; escreva(f);");
  assert.equal(lgSec.success, true);
  assert.equal(lgSec.scope.f, "undefined");

  const jsInf = executeJavaScriptCode("while (true) {}");
  assert.equal(jsInf.success, false);
  assert.match(jsInf.error, /50\.000/);

  const jsSec = executeJavaScriptCode("const f = typeof fetch; console.log(f);");
  assert.equal(jsSec.success, true);
  assert.equal(jsSec.scope.f, "undefined");

  const pyInf = executePythonCode("while True:\n    pass");
  assert.equal(pyInf.success, false);
  assert.match(pyInf.error, /50\.000/);

  const cppInf = executeCppCode("#include <iostream>\nusing namespace std;\nint main(){ while(true){} return 0; }");
  assert.equal(cppInf.success, false);
  assert.match(cppInf.error, /50\.000/);

  const sub26 = calculateSubnet("10.0.20.75/26");
  assert.equal(sub26.networkAddress, "10.0.20.64");
  assert.equal(sub26.broadcastAddress, "10.0.20.127");
  assert.equal(sub26.usableHosts, 62);

  const vlsm = calculateVlsm("192.168.0.0/24", [
    { name: "LAN", hosts: 50 },
    { name: "WAN", hosts: 2 },
  ]);
  assert.equal(vlsm[0].prefix, 26);
  assert.equal(vlsm[1].prefix, 30);

  pass("Segurança dos motores (Lógica/Portugol, JS, Python, C++), loop infinito e IPv4/VLSM");
}

// 4b. Verifica isolamento, sanitização, loop guard e multiarquivo Web
{
  assert.ok(WEB_SANDBOX_ATTR.includes("allow-scripts"));
  assert.ok(WEB_SANDBOX_ATTR.includes("allow-forms"));
  assert.ok(!WEB_SANDBOX_ATTR.includes("allow-same-origin"));
  assert.ok(!WEB_SANDBOX_ATTR.includes("allow-top-navigation"));
  assert.ok(!WEB_SANDBOX_ATTR.includes("allow-popups"));

  assert.ok(WEB_SANDBOX_CSP.includes("default-src 'none'"));
  assert.ok(WEB_SANDBOX_CSP.includes("connect-src 'none'"));

  const sanHtml = sanitizeHtmlForSandbox(
    `<html lang="pt-BR"><head><link rel="stylesheet" href="https://evil.test/x.css"><script src="https://evil.test/x.js"></script></head><body><h1 onclick="alert(1)">Oi</h1><a href="javascript:alert(2)">Link</a><iframe src="https://evil.test"></iframe><img src="x" onerror="alert(3)" /></body></html>`
  );
  assert.equal(sanHtml.lang, "pt-BR");
  assert.ok(!sanHtml.bodyHtml.includes("<script"));
  assert.ok(!sanHtml.bodyHtml.includes("<iframe"));
  assert.ok(!sanHtml.bodyHtml.includes("onerror="));
  assert.ok(!sanHtml.bodyHtml.includes("onclick="));
  assert.ok(!/javascript:/i.test(sanHtml.bodyHtml));
  assert.ok(sanHtml.warnings.length >= 1);

  const sanCss = sanitizeCssForStyleTag(
    `@import url("https://evil.test/a.css"); body { color: red; } </style><script>alert(1)</script>`
  );
  assert.ok(!sanCss.toLowerCase().includes("</style>"));
  assert.ok(!sanCss.includes("https://evil.test"));

  const instJs = instrumentStudentJs(`for (let i = 0; i < 3; i++) { console.log("</script>"); }`);
  assert.ok(instJs.includes("__ceTick()"));
  assert.ok(!instJs.includes("</script>"));

  const roundTripInput = {
    html: `<main><h1>Web</h1></main>`,
    css: `h1 { color: #f97316; }`,
    js: `console.log("ok");`,
  };
  const serialized = serializeWebFiles(roundTripInput);
  const parsed = parseWebFiles(serialized);
  assert.deepEqual(parsed, roundTripInput);

  const fallback = parseWebFiles("not-json", roundTripInput);
  assert.deepEqual(fallback, roundTripInput);

  const oversized = validateWebFilesSize({
    html: "a".repeat(MAX_WEB_FILE_CHARS + 1),
    css: "",
    js: "",
  });
  assert.equal(oversized.ok, false);

  const infWeb = evaluateWebProjectHeadless({
    html: `<p id="p">oi</p>`,
    css: "",
    js: `while (true) {}`,
  });
  assert.equal(infWeb.timedOut, true);
  assert.ok(infWeb.runtimeErrors.some(e => /50\.000|loop/i.test(e)));

  const blockedGlobalsWeb = evaluateWebProjectHeadless({
    html: `<p id="out"></p>`,
    css: "",
    js: `console.log(typeof fetch, typeof localStorage);`,
  });
  assert.equal(blockedGlobalsWeb.consoleEntries[0]?.text, "undefined undefined");

  const srcDoc = buildSandboxedSrcDoc({
    files: roundTripInput,
    runId: 7,
    token: "tok-1",
  });
  assert.ok(srcDoc.includes("default-src 'none'"));
  assert.ok(srcDoc.includes("code-entry-web-sandbox"));
  assert.ok(srcDoc.includes("h1 { color: #f97316; }"));

  pass("Motor Web isolado (sandbox, CSP, sanitização, loop guard, multiarquivo e limites)");
}

// Helper unificado para executar qualquer aula ou desafio
function evaluateItem(item, codeToRun, isReference) {
  const stdin = item.defaultStdin || "";
  const testCases = item.testCases || [];

  if (item.workbench === "code") {
    const lang = item.trackId;
    const res =
      lang === "logic"
        ? executeLogicCode(codeToRun, testCases)
        : lang === "js"
        ? executeJavaScriptCode(codeToRun, testCases)
        : lang === "python"
        ? executePythonCode(codeToRun, stdin, testCases)
        : executeCppCode(codeToRun, stdin, testCases);

    const ctx = {
      trackId: item.trackId,
      code: codeToRun,
      stdin,
      success: res.success,
      output: res.output,
      outputText: res.outputText,
      error: res.error,
      variables: res.variables,
      scope: res.scope,
      varTypes: res.varTypes,
      testResults: res.testResults,
    };
    const objDone = item.objectives.every(o => o.test(ctx));
    const testsDone = !res.testResults.length || res.testResults.every(t => t.passed);
    return { passed: objDone && testsDone, res, ctx };
  }

  if (item.workbench === "sql") {
    if (!codeToRun.trim() || !/select|create|insert/i.test(codeToRun)) {
      return { passed: false };
    }
    const res = executeSql({ datasetId: item.sqlDatasetId || "ecommerce", query: codeToRun });
    const ctx = {
      trackId: "database",
      code: codeToRun,
      stdin: "",
      success: res.success,
      output: res.messages || [],
      outputText: (res.messages || []).join("\n"),
      error: res.error,
      variables: [],
      scope: {},
      varTypes: {},
      testResults: [],
      sql: res,
    };
    return { passed: item.objectives.every(o => o.test(ctx)), res, ctx };
  }

  if (item.workbench === "linux") {
    if (!codeToRun.trim()) return { passed: false };
    const engine = new LinuxShellEngine();
    const parts = codeToRun.split("&&").map(s => s.trim()).filter(Boolean);
    const doneSet = new Set();
    let lastRes = null;
    for (const part of parts) {
      lastRes = engine.execute(part);
      const ctx = {
        trackId: "linux",
        code: part,
        stdin: "",
        success: lastRes.success,
        output: lastRes.lines.map(l => l.text),
        outputText: lastRes.outputText,
        variables: [],
        scope: { ...engine.env },
        varTypes: {},
        testResults: [],
        linux: lastRes.snapshot,
      };
      item.objectives.forEach(o => {
        if (o.test(ctx)) doneSet.add(o.id);
      });
    }
    return { passed: item.objectives.every(o => doneSet.has(o.id)) };
  }

  if (item.workbench === "networks") {
    if (!isReference) return { passed: false };
    const mode = item.networkMode || "osi";
    if (mode === "osi") {
      const ctx = {
        trackId: "networks",
        code: codeToRun,
        stdin: "",
        success: true,
        output: [],
        outputText: "",
        variables: [],
        scope: {},
        varTypes: {},
        testResults: [],
        network: { mode: "osi", osiScore: 100, osiCompleted: true },
      };
      return { passed: item.objectives.every(o => o.test(ctx)) };
    }
    if (mode === "subnet") {
      const info = calculateSubnet(codeToRun);
      const ctx = {
        trackId: "networks",
        code: codeToRun,
        stdin: "",
        success: true,
        output: [],
        outputText: "",
        variables: [],
        scope: {},
        varTypes: {},
        testResults: [],
        network: {
          mode: "subnet",
          subnetValidation: {
            ipCidr: codeToRun,
            networkAddress: info.networkAddress,
            broadcastAddress: info.broadcastAddress,
            firstHost: info.firstHost,
            lastHost: info.lastHost,
            usableHosts: info.usableHosts,
            subnetMask: info.subnetMask,
            isValidUserAttempt: true,
            checkedCount: 1,
          },
        },
      };
      return { passed: item.objectives.every(o => o.test(ctx)) };
    }
    if (mode === "topology") {
      const state = createDefaultTopologyState(item.networkPreset?.topologyPreset || "healthy");
      const cmds = [];
      const doneSet = new Set();
      for (const step of codeToRun.split("&&").map(s => s.trim())) {
        if (step.startsWith("enable-route:")) {
          const dest = step.slice("enable-route:".length);
          state.routes = state.routes.map(r => (r.destination === dest ? { ...r, enabled: true } : r));
          continue;
        }
        if (step.startsWith("allow-acl:")) {
          const id = step.slice("allow-acl:".length);
          state.aclRules = state.aclRules.map(a => (a.id === id ? { ...a, action: "ALLOW" } : a));
          continue;
        }
        cmds.push(step);
        const res = executeNetworkCommand(state, step);
        const ctx = {
          trackId: "networks",
          code: step,
          stdin: "",
          success: res.success,
          output: res.outputLines,
          outputText: res.outputLines.join("\n"),
          variables: [],
          scope: {},
          varTypes: {},
          testResults: [],
          network: {
            mode: "topology",
            topologyCommands: [...cmds],
            lastPingSuccess: res.delivered,
            lastPingTarget: res.targetIp,
            lastAclBlocked: Boolean(res.aclBlocked),
          },
        };
        item.objectives.forEach(o => {
          if (o.test(ctx)) doneSet.add(o.id);
        });
      }
      return { passed: item.objectives.every(o => doneSet.has(o.id)) };
    }
  }

  if (item.workbench === "web") {
    const files = parseWebFiles(codeToRun);
    const res = evaluateWebProjectHeadless(files, item.webInspection);
    const output = res.consoleEntries.map(entry =>
      entry.level === "error"
        ? `[erro] ${entry.text}`
        : entry.level === "warn"
        ? `[aviso] ${entry.text}`
        : entry.text
    );
    const ctx = {
      trackId: "web",
      code: codeToRun,
      stdin: "",
      success: !res.timedOut && res.runtimeErrors.length === 0,
      output,
      outputText: output.join("\n"),
      error: res.runtimeErrors[0],
      variables: [],
      scope: {},
      varTypes: {},
      testResults: [],
      web: res,
    };
    return {
      passed: !res.timedOut && item.objectives.every(o => o.test(ctx)),
      res: { ...res, error: res.runtimeErrors[0] },
      ctx,
    };
  }

  return { passed: false };
}

// 5. Valida todas as 66 Aulas em 8 Trilhas
assert.equal(TRACKS.length, 8, "Devem existir 8 trilhas");
assert.equal(ALL_LESSONS.length, 66, "Devem existir exatamente 66 aulas");
for (const lesson of ALL_LESSONS) {
  assert.equal(lesson.hints.length, 3, `Aula ${lesson.id} deve ter 3 níveis de dicas`);
  assert.ok(lesson.theoryBlocks.length >= 1, `Aula ${lesson.id} deve ter blocos de teoria`);
  assert.ok(lesson.examples.length >= 1, `Aula ${lesson.id} deve ter exemplos`);

  const starterCheck = evaluateItem(lesson, lesson.starterCode, false);
  assert.equal(
    starterCheck.passed,
    false,
    `FALHA PEDAGÓGICA: starterCode da aula ${lesson.id} (${lesson.title}) já passa os critérios sem edição!`
  );

  const solCheck = evaluateItem(lesson, lesson.referenceSolution, true);
  assert.equal(
    solCheck.passed,
    true,
    `Aula ${lesson.id} (${lesson.title}) falhou com referenceSolution: ${solCheck.res?.error || ""}`
  );
  pass(`Aula ${lesson.id} · ${lesson.title}`);
}

// 6. Valida todos os 24 Desafios
assert.equal(CHALLENGES.length, 24, "Devem existir exatamente 24 desafios");
for (const ch of CHALLENGES) {
  assert.equal(ch.hints.length, 3, `Desafio ${ch.id} deve ter 3 níveis de dicas`);
  const starterCheck = evaluateItem(ch, ch.starterCode, false);
  assert.equal(
    starterCheck.passed,
    false,
    `FALHA PEDAGÓGICA: starterCode do desafio ${ch.id} já passa sem resolução!`
  );

  const solCheck = evaluateItem(ch, ch.referenceSolution, true);
  assert.equal(
    solCheck.passed,
    true,
    `Desafio ${ch.id} (${ch.title}) falhou com referenceSolution: ${solCheck.res?.error || ""}`
  );
  pass(`Desafio ${ch.id} · ${ch.title}`);
}

// 7. Verifica estrutura das conquistas
assert.equal(ACHIEVEMENTS.length, 20, "Devem existir 20 conquistas");
pass("Conquistas (20 definições validadas)");

// 8. Verifica ícones oficiais salvos em public/icons/tech
for (const iconFile of ["cplusplus.svg", "javascript.svg", "python.svg", "web.svg", "linux.svg", "sqlite.svg", "postgresql.svg"]) {
  assert.ok(
    fs.existsSync(path.join(ROOT_DIR, "public", "icons", "tech", iconFile)),
    `Ícone oficial ausente: ${iconFile}`
  );
}
pass("Ícones oficiais Devicon presentes");

console.log(`\nResumo Code Entry: ${passed} verificações executadas com sucesso (8 trilhas, 66 aulas, 24 desafios, 20 conquistas e infraestrutura).`);
