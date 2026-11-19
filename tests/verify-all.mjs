import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { CodeEntryDatabase } from "../server/db.mjs";
import { createServer, listenWithFallback } from "../server/index.mjs";
import { executeSql, getDatasetSchema, listDatasets } from "../server/sqlSandbox.mjs";

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
  ALL_LESSONS,
  CHALLENGES,
  ACHIEVEMENTS,
  TRACKS,
} = harness;

// 2. Verifica banco SQLite (CodeEntryDatabase) + Migração e Meta Diária
{
  const db = new CodeEntryDatabase(":memory:");
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
  assert.equal(backup.version, 4);
  db.resetAll({ preserveSettings: false });
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

    const migrated = new CodeEntryDatabase(legacyDbPath);
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
    pass("Migração SQLite legado -> v4 não-destrutiva preservando progresso, tema e perfil");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// 2c. Verifica /api/health e resolução dinâmica de porta quando porta preferencial está ocupada
{
  const blocker = http.createServer((_req, res) => {
    res.writeHead(200);
    res.end("occupied");
  });
  await new Promise(resolve => blocker.listen(0, "127.0.0.1", resolve));
  const occupiedPort = blocker.address().port;

  const { server } = createServer({ port: occupiedPort, dbPath: ":memory:" });
  try {
    const resolvedPort = await listenWithFallback(server, {
      host: "127.0.0.1",
      preferredPort: occupiedPort,
      strictPort: false,
      maxAttempts: 20,
    });
    assert.notEqual(resolvedPort, occupiedPort, "Deve migrar para outra porta livre quando ocupada");

    const healthRes = await fetch(`http://127.0.0.1:${resolvedPort}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthJson = await healthRes.json();
    assert.equal(healthJson.ok, true);
    assert.equal(healthJson.service, "code-entry-api");
    pass("Servidor HTTP: endpoint /api/health e fallback automático de porta livre");
  } finally {
    await new Promise(resolve => server.close(resolve));
    await new Promise(resolve => blocker.close(resolve));
  }
}

// 3. Verifica SQL Sandbox
{
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

  return { passed: false };
}

// 5. Valida todas as 58 Aulas em 7 Trilhas
assert.equal(TRACKS.length, 7, "Devem existir 7 trilhas");
assert.equal(ALL_LESSONS.length, 58, "Devem existir exatamente 58 aulas");
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

// 6. Valida todos os 21 Desafios
assert.equal(CHALLENGES.length, 21, "Devem existir exatamente 21 desafios");
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
assert.equal(ACHIEVEMENTS.length, 19, "Devem existir 19 conquistas");
pass("Conquistas (19 definições validadas)");

// 8. Verifica ícones oficiais salvos em public/icons/tech
for (const iconFile of ["cplusplus.svg", "javascript.svg", "python.svg", "linux.svg", "sqlite.svg", "postgresql.svg"]) {
  assert.ok(
    fs.existsSync(path.join(ROOT_DIR, "public", "icons", "tech", iconFile)),
    `Ícone oficial ausente: ${iconFile}`
  );
}
pass("Ícones oficiais Devicon presentes");

console.log(`\nResumo Code Entry: ${passed} verificações executadas com sucesso (7 trilhas, 58 aulas, 21 desafios, 19 conquistas e infraestrutura).`);
