import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DEFAULT_DB_PATH = path.resolve(process.cwd(), "data", "code-entry.db");

const VALID_PALETTES = new Set([
  "dark-violet",
  "dark-crimson",
  "dark-cyber",
  "dark-amber",
  "light-arctic",
  "light-ocean",
  "light-mint",
  "light-coral",
]);

function getPaletteMode(paletteId) {
  return typeof paletteId === "string" && paletteId.startsWith("light-") ? "light" : "dark";
}

export class CodeEntryDatabase {
  constructor(dbPath = DEFAULT_DB_PATH) {
    this.dbPath = dbPath;
    if (dbPath !== ":memory:") {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }
    this.db = new DatabaseSync(dbPath);
    this.initSchema();
  }

  initSchema() {
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS schema_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_settings (
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

      CREATE TABLE IF NOT EXISTS daily_study_log (
        study_date TEXT PRIMARY KEY,
        seconds INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS lesson_progress (
        lesson_id TEXT PRIMARY KEY,
        track_id TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        objectives_json TEXT NOT NULL DEFAULT '[]',
        attempts INTEGER NOT NULL DEFAULT 0,
        last_attempt_at TEXT,
        completed_at TEXT,
        xp_awarded INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS challenge_progress (
        challenge_id TEXT PRIMARY KEY,
        track_id TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        attempts INTEGER NOT NULL DEFAULT 0,
        best_time_ms INTEGER,
        last_attempt_at TEXT,
        completed_at TEXT,
        xp_awarded INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS code_drafts (
        draft_key TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        stdin TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS activity_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        track_id TEXT,
        item_id TEXT,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        detail TEXT NOT NULL DEFAULT '',
        xp_delta INTEGER NOT NULL DEFAULT 0,
        duration_ms INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS achievements_unlocked (
        achievement_id TEXT PRIMARY KEY,
        unlocked_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workspace_state (
        workspace_key TEXT PRIMARY KEY,
        state_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    this.migrateUserSettings();

    const existing = this.db.prepare("SELECT id FROM user_settings WHERE id = 1").get();
    if (!existing) {
      this.db
        .prepare(
          `INSERT INTO user_settings (id, display_name, theme, theme_palette, active_track_id, daily_goal_minutes, study_seconds_total, onboarding_completed, profile_setup_completed, reduced_motion, updated_at)
           VALUES (1, 'Estudante', 'dark', 'dark-violet', 'logic', 30, 0, 0, 0, 0, ?)`
        )
        .run(new Date().toISOString());
    }
  }

  migrateUserSettings() {
    const cols = this.db.prepare("PRAGMA table_info(user_settings)").all();
    const names = new Set(cols.map(c => c.name));
    if (!names.has("onboarding_completed")) {
      this.db.exec(
        "ALTER TABLE user_settings ADD COLUMN onboarding_completed INTEGER NOT NULL DEFAULT 0"
      );
    }
    if (!names.has("profile_setup_completed")) {
      this.db.exec(
        "ALTER TABLE user_settings ADD COLUMN profile_setup_completed INTEGER NOT NULL DEFAULT 0"
      );
      this.db.exec(
        "UPDATE user_settings SET profile_setup_completed = 1 WHERE id = 1 AND (onboarding_completed = 1 OR display_name != 'Estudante')"
      );
    }
    if (!names.has("reduced_motion")) {
      this.db.exec(
        "ALTER TABLE user_settings ADD COLUMN reduced_motion INTEGER NOT NULL DEFAULT 0"
      );
    }
    if (!names.has("theme_palette")) {
      this.db.exec(
        "ALTER TABLE user_settings ADD COLUMN theme_palette TEXT NOT NULL DEFAULT 'dark-violet'"
      );
      this.db.exec(
        "UPDATE user_settings SET theme_palette = CASE WHEN theme = 'light' THEN 'light-arctic' ELSE 'dark-violet' END WHERE id = 1"
      );
    }
    this.db
      .prepare("INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('schema_version', '4')")
      .run();
  }

  close() {
    this.db.close();
  }

  getSettings() {
    const row = this.db.prepare("SELECT * FROM user_settings WHERE id = 1").get();
    const theme = row.theme === "light" ? "light" : "dark";
    const rawPalette = row.theme_palette;
    const themePalette =
      typeof rawPalette === "string" &&
      VALID_PALETTES.has(rawPalette) &&
      getPaletteMode(rawPalette) === theme
        ? rawPalette
        : theme === "light"
        ? "light-arctic"
        : "dark-violet";
    return {
      displayName: row.display_name,
      theme,
      themePalette,
      activeTrackId: row.active_track_id,
      dailyGoalMinutes: row.daily_goal_minutes,
      studySecondsTotal: row.study_seconds_total,
      onboardingCompleted: Boolean(row.onboarding_completed),
      profileSetupCompleted: Boolean(row.profile_setup_completed),
      reducedMotion: Boolean(row.reduced_motion),
      updatedAt: row.updated_at,
    };
  }

  updateSettings(patch = {}) {
    const current = this.getSettings();
    const validPatchPalette =
      typeof patch.themePalette === "string" && VALID_PALETTES.has(patch.themePalette)
        ? patch.themePalette
        : null;

    let nextTheme =
      patch.theme === "light" ? "light" : patch.theme === "dark" ? "dark" : current.theme;
    let nextPalette = current.themePalette;

    if (validPatchPalette) {
      nextPalette = validPatchPalette;
      nextTheme = getPaletteMode(validPatchPalette);
    } else if (getPaletteMode(nextPalette) !== nextTheme) {
      nextPalette = nextTheme === "light" ? "light-arctic" : "dark-violet";
    }

    const next = {
      displayName:
        typeof patch.displayName === "string" && patch.displayName.trim()
          ? patch.displayName.trim().slice(0, 48)
          : current.displayName,
      theme: nextTheme,
      themePalette: nextPalette,
      activeTrackId:
        typeof patch.activeTrackId === "string" && patch.activeTrackId.trim()
          ? patch.activeTrackId.trim()
          : current.activeTrackId,
      dailyGoalMinutes:
        typeof patch.dailyGoalMinutes === "number" && Number.isFinite(patch.dailyGoalMinutes)
          ? Math.max(5, Math.min(240, Math.round(patch.dailyGoalMinutes)))
          : current.dailyGoalMinutes,
      onboardingCompleted:
        typeof patch.onboardingCompleted === "boolean"
          ? patch.onboardingCompleted
          : current.onboardingCompleted,
      profileSetupCompleted:
        typeof patch.profileSetupCompleted === "boolean"
          ? patch.profileSetupCompleted
          : current.profileSetupCompleted,
      reducedMotion:
        typeof patch.reducedMotion === "boolean"
          ? patch.reducedMotion
          : current.reducedMotion,
    };
    const now = new Date().toISOString();
    this.db
      .prepare(
        `UPDATE user_settings
         SET display_name = ?, theme = ?, theme_palette = ?, active_track_id = ?, daily_goal_minutes = ?, onboarding_completed = ?, profile_setup_completed = ?, reduced_motion = ?, updated_at = ?
         WHERE id = 1`
      )
      .run(
        next.displayName,
        next.theme,
        next.themePalette,
        next.activeTrackId,
        next.dailyGoalMinutes,
        next.onboardingCompleted ? 1 : 0,
        next.profileSetupCompleted ? 1 : 0,
        next.reducedMotion ? 1 : 0,
        now
      );

    return this.getSettings();
  }

  addStudySeconds(seconds, dateStr) {
    const delta = Math.max(0, Math.min(120, Math.round(Number(seconds) || 0)));
    if (delta === 0) return this.getSettings();
    const now = new Date();
    const validDate =
      typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
        ? dateStr
        : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    this.db
      .prepare(
        `UPDATE user_settings
         SET study_seconds_total = study_seconds_total + ?, updated_at = ?
         WHERE id = 1`
      )
      .run(delta, now.toISOString());

    this.db
      .prepare(
        `INSERT INTO daily_study_log (study_date, seconds)
         VALUES (?, ?)
         ON CONFLICT(study_date) DO UPDATE SET seconds = seconds + excluded.seconds`
      )
      .run(validDate, delta);

    return this.getSettings();
  }

  recordLessonAttempt({ lessonId, trackId, completed, objectivesDone, xpReward }) {
    const now = new Date().toISOString();
    const existing = this.db
      .prepare("SELECT * FROM lesson_progress WHERE lesson_id = ?")
      .get(lessonId);

    const prevCompleted = existing ? Boolean(existing.completed) : false;
    const finalCompleted = prevCompleted || Boolean(completed);
    const prevObjectives = existing ? safeJsonParse(existing.objectives_json, []) : [];
    const mergedObjectives = Array.from(new Set([...(prevObjectives || []), ...(objectivesDone || [])]));
    const xpAwarded =
      finalCompleted && (!existing || existing.xp_awarded === 0)
        ? Number(xpReward) || 0
        : existing?.xp_awarded || 0;
    const completedAt = prevCompleted
      ? existing.completed_at
      : finalCompleted
      ? now
      : null;

    if (!existing) {
      this.db
        .prepare(
          `INSERT INTO lesson_progress (lesson_id, track_id, completed, objectives_json, attempts, last_attempt_at, completed_at, xp_awarded)
           VALUES (?, ?, ?, ?, 1, ?, ?, ?)`
        )
        .run(
          lessonId,
          trackId,
          finalCompleted ? 1 : 0,
          JSON.stringify(mergedObjectives),
          now,
          completedAt,
          xpAwarded
        );
    } else {
      this.db
        .prepare(
          `UPDATE lesson_progress
           SET track_id = ?, completed = ?, objectives_json = ?, attempts = attempts + 1, last_attempt_at = ?, completed_at = ?, xp_awarded = ?
           WHERE lesson_id = ?`
        )
        .run(
          trackId,
          finalCompleted ? 1 : 0,
          JSON.stringify(mergedObjectives),
          now,
          completedAt,
          xpAwarded,
          lessonId
        );
    }

    const newlyCompleted = !prevCompleted && finalCompleted;
    return {
      newlyCompleted,
      xpAwarded: newlyCompleted ? xpAwarded : 0,
      progress: this.getLessonProgressMap(),
    };
  }

  recordChallengeAttempt({ challengeId, trackId, completed, durationMs, xpReward }) {
    const now = new Date().toISOString();
    const existing = this.db
      .prepare("SELECT * FROM challenge_progress WHERE challenge_id = ?")
      .get(challengeId);

    const prevCompleted = existing ? Boolean(existing.completed) : false;
    const finalCompleted = prevCompleted || Boolean(completed);
    const ms = typeof durationMs === "number" && Number.isFinite(durationMs) ? Math.max(1, Math.round(durationMs)) : null;
    const bestTimeMs =
      completed && ms !== null
        ? existing?.best_time_ms != null
          ? Math.min(existing.best_time_ms, ms)
          : ms
        : existing?.best_time_ms ?? null;
    const xpAwarded =
      finalCompleted && (!existing || existing.xp_awarded === 0)
        ? Number(xpReward) || 0
        : existing?.xp_awarded || 0;
    const completedAt = prevCompleted
      ? existing.completed_at
      : finalCompleted
      ? now
      : null;

    if (!existing) {
      this.db
        .prepare(
          `INSERT INTO challenge_progress (challenge_id, track_id, completed, attempts, best_time_ms, last_attempt_at, completed_at, xp_awarded)
           VALUES (?, ?, ?, 1, ?, ?, ?, ?)`
        )
        .run(challengeId, trackId, finalCompleted ? 1 : 0, bestTimeMs, now, completedAt, xpAwarded);
    } else {
      this.db
        .prepare(
          `UPDATE challenge_progress
           SET track_id = ?, completed = ?, attempts = attempts + 1, best_time_ms = ?, last_attempt_at = ?, completed_at = ?, xp_awarded = ?
           WHERE challenge_id = ?`
        )
        .run(trackId, finalCompleted ? 1 : 0, bestTimeMs, now, completedAt, xpAwarded, challengeId);
    }

    const newlyCompleted = !prevCompleted && finalCompleted;
    return {
      newlyCompleted,
      xpAwarded: newlyCompleted ? xpAwarded : 0,
      progress: this.getChallengeProgressMap(),
    };
  }

  saveDraft(draftKey, code, stdin = "") {
    const now = new Date().toISOString();
    this.db
      .prepare(
        `INSERT INTO code_drafts (draft_key, code, stdin, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(draft_key) DO UPDATE SET
           code = excluded.code,
           stdin = excluded.stdin,
           updated_at = excluded.updated_at`
      )
      .run(draftKey, String(code ?? ""), String(stdin ?? ""), now);
    return { draftKey, updatedAt: now };
  }

  deleteDraft(draftKey) {
    this.db.prepare("DELETE FROM code_drafts WHERE draft_key = ?").run(draftKey);
    return { deleted: true };
  }

  addHistoryEvent({ eventType, trackId = null, itemId = null, title, status, detail = "", xpDelta = 0, durationMs = 0 }) {
    const now = new Date().toISOString();
    const res = this.db
      .prepare(
        `INSERT INTO activity_history (event_type, track_id, item_id, title, status, detail, xp_delta, duration_ms, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        String(eventType || "activity"),
        trackId,
        itemId,
        String(title || "Atividade"),
        String(status || "info"),
        String(detail || ""),
        Number(xpDelta) || 0,
        Number(durationMs) || 0,
        now
      );
    return {
      id: Number(res.lastInsertRowid),
      eventType,
      trackId,
      itemId,
      title,
      status,
      detail,
      xpDelta: Number(xpDelta) || 0,
      durationMs: Number(durationMs) || 0,
      createdAt: now,
    };
  }

  unlockAchievements(ids = []) {
    const now = new Date().toISOString();
    const newlyUnlocked = [];
    const stmtCheck = this.db.prepare("SELECT achievement_id FROM achievements_unlocked WHERE achievement_id = ?");
    const stmtInsert = this.db.prepare(
      "INSERT INTO achievements_unlocked (achievement_id, unlocked_at) VALUES (?, ?)"
    );
    for (const id of ids) {
      if (!id) continue;
      const found = stmtCheck.get(id);
      if (!found) {
        stmtInsert.run(id, now);
        newlyUnlocked.push({ achievementId: id, unlockedAt: now });
      }
    }
    return newlyUnlocked;
  }

  saveWorkspaceState(workspaceKey, stateObj) {
    const now = new Date().toISOString();
    this.db
      .prepare(
        `INSERT INTO workspace_state (workspace_key, state_json, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(workspace_key) DO UPDATE SET
           state_json = excluded.state_json,
           updated_at = excluded.updated_at`
      )
      .run(workspaceKey, JSON.stringify(stateObj ?? {}), now);
    return { workspaceKey, updatedAt: now };
  }

  getLessonProgressMap() {
    const rows = this.db.prepare("SELECT * FROM lesson_progress").all();
    const map = {};
    for (const r of rows) {
      map[r.lesson_id] = {
        lessonId: r.lesson_id,
        trackId: r.track_id,
        completed: Boolean(r.completed),
        objectivesDone: safeJsonParse(r.objectives_json, []),
        attempts: r.attempts,
        lastAttemptAt: r.last_attempt_at,
        completedAt: r.completed_at,
        xpAwarded: r.xp_awarded,
      };
    }
    return map;
  }

  getChallengeProgressMap() {
    const rows = this.db.prepare("SELECT * FROM challenge_progress").all();
    const map = {};
    for (const r of rows) {
      map[r.challenge_id] = {
        challengeId: r.challenge_id,
        trackId: r.track_id,
        completed: Boolean(r.completed),
        attempts: r.attempts,
        bestTimeMs: r.best_time_ms,
        lastAttemptAt: r.last_attempt_at,
        completedAt: r.completed_at,
        xpAwarded: r.xp_awarded,
      };
    }
    return map;
  }

  getDraftsMap() {
    const rows = this.db.prepare("SELECT * FROM code_drafts").all();
    const map = {};
    for (const r of rows) {
      map[r.draft_key] = {
        code: r.code,
        stdin: r.stdin,
        updatedAt: r.updated_at,
      };
    }
    return map;
  }

  getHistory(limit = 200) {
    const rows = this.db
      .prepare("SELECT * FROM activity_history ORDER BY id DESC LIMIT ?")
      .all(Math.max(1, Math.min(500, Number(limit) || 200)));
    return rows.map(r => ({
      id: r.id,
      eventType: r.event_type,
      trackId: r.track_id,
      itemId: r.item_id,
      title: r.title,
      status: r.status,
      detail: r.detail,
      xpDelta: r.xp_delta,
      durationMs: r.duration_ms,
      createdAt: r.created_at,
    }));
  }

  getAchievementsMap() {
    const rows = this.db.prepare("SELECT * FROM achievements_unlocked").all();
    const map = {};
    for (const r of rows) {
      map[r.achievement_id] = r.unlocked_at;
    }
    return map;
  }

  getWorkspacesMap() {
    const rows = this.db.prepare("SELECT * FROM workspace_state").all();
    const map = {};
    for (const r of rows) {
      map[r.workspace_key] = safeJsonParse(r.state_json, {});
    }
    return map;
  }

  getDailyStudyLogMap() {
    const rows = this.db.prepare("SELECT * FROM daily_study_log").all();
    const map = {};
    for (const r of rows) {
      map[r.study_date] = r.seconds;
    }
    return map;
  }

  getBootstrap() {
    return {
      settings: this.getSettings(),
      lessonProgress: this.getLessonProgressMap(),
      challengeProgress: this.getChallengeProgressMap(),
      drafts: this.getDraftsMap(),
      history: this.getHistory(250),
      achievements: this.getAchievementsMap(),
      workspaces: this.getWorkspacesMap(),
      dailyStudyLog: this.getDailyStudyLogMap(),
    };
  }

  exportBackup() {
    return {
      version: 4,
      exportedAt: new Date().toISOString(),
      data: this.getBootstrap(),
    };
  }

  restoreBackup(payload) {
    const data = payload?.data || payload;
    if (!data || typeof data !== "object") {
      throw new Error("Arquivo de backup inválido.");
    }
    this.resetAll({ preserveSettings: false });
    if (data.settings) {
      this.updateSettings(data.settings);
      if (typeof data.settings.studySecondsTotal === "number") {
        this.db
          .prepare("UPDATE user_settings SET study_seconds_total = ? WHERE id = 1")
          .run(Math.max(0, Math.round(data.settings.studySecondsTotal)));
      }
    }
    if (data.lessonProgress && typeof data.lessonProgress === "object") {
      const stmt = this.db.prepare(
        `INSERT INTO lesson_progress (lesson_id, track_id, completed, objectives_json, attempts, last_attempt_at, completed_at, xp_awarded)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );
      for (const lp of Object.values(data.lessonProgress)) {
        stmt.run(
          lp.lessonId,
          lp.trackId,
          lp.completed ? 1 : 0,
          JSON.stringify(lp.objectivesDone || []),
          lp.attempts || 0,
          lp.lastAttemptAt || null,
          lp.completedAt || null,
          lp.xpAwarded || 0
        );
      }
    }
    if (data.challengeProgress && typeof data.challengeProgress === "object") {
      const stmt = this.db.prepare(
        `INSERT INTO challenge_progress (challenge_id, track_id, completed, attempts, best_time_ms, last_attempt_at, completed_at, xp_awarded)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );
      for (const cp of Object.values(data.challengeProgress)) {
        stmt.run(
          cp.challengeId,
          cp.trackId,
          cp.completed ? 1 : 0,
          cp.attempts || 0,
          cp.bestTimeMs ?? null,
          cp.lastAttemptAt || null,
          cp.completedAt || null,
          cp.xpAwarded || 0
        );
      }
    }
    if (data.drafts && typeof data.drafts === "object") {
      for (const [key, d] of Object.entries(data.drafts)) {
        this.saveDraft(key, d.code || "", d.stdin || "");
      }
    }
    if (Array.isArray(data.history)) {
      const stmt = this.db.prepare(
        `INSERT INTO activity_history (event_type, track_id, item_id, title, status, detail, xp_delta, duration_ms, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      for (const h of [...data.history].reverse()) {
        stmt.run(
          h.eventType || "activity",
          h.trackId || null,
          h.itemId || null,
          h.title || "Atividade",
          h.status || "info",
          h.detail || "",
          h.xpDelta || 0,
          h.durationMs || 0,
          h.createdAt || new Date().toISOString()
        );
      }
    }
    if (data.achievements && typeof data.achievements === "object") {
      const stmt = this.db.prepare(
        "INSERT INTO achievements_unlocked (achievement_id, unlocked_at) VALUES (?, ?)"
      );
      for (const [id, at] of Object.entries(data.achievements)) {
        stmt.run(id, String(at));
      }
    }
    if (data.workspaces && typeof data.workspaces === "object") {
      for (const [key, ws] of Object.entries(data.workspaces)) {
        this.saveWorkspaceState(key, ws);
      }
    }
    if (data.dailyStudyLog && typeof data.dailyStudyLog === "object") {
      const stmt = this.db.prepare(
        `INSERT INTO daily_study_log (study_date, seconds)
         VALUES (?, ?)
         ON CONFLICT(study_date) DO UPDATE SET seconds = excluded.seconds`
      );
      for (const [dt, sec] of Object.entries(data.dailyStudyLog)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dt) && typeof sec === "number" && sec >= 0) {
          stmt.run(dt, Math.round(sec));
        }
      }
    }
    return this.getBootstrap();
  }

  resetAll({ preserveSettings = true } = {}) {
    this.db.exec(`
      DELETE FROM lesson_progress;
      DELETE FROM challenge_progress;
      DELETE FROM code_drafts;
      DELETE FROM activity_history;
      DELETE FROM achievements_unlocked;
      DELETE FROM workspace_state;
      DELETE FROM daily_study_log;
    `);
    if (preserveSettings) {
      this.db
        .prepare("UPDATE user_settings SET active_track_id = 'logic', study_seconds_total = 0, updated_at = ? WHERE id = 1")
        .run(new Date().toISOString());
    } else {
      this.db
        .prepare(
          `UPDATE user_settings
           SET display_name = 'Estudante', theme = 'dark', theme_palette = 'dark-violet', active_track_id = 'logic', daily_goal_minutes = 30, study_seconds_total = 0, onboarding_completed = 0, profile_setup_completed = 0, reduced_motion = 0, updated_at = ?
           WHERE id = 1`
        )
        .run(new Date().toISOString());
    }
    return this.getBootstrap();
  }
}

function safeJsonParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
