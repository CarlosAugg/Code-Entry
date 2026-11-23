export const CURRENT_SCHEMA_VERSION = 6;

const VALID_ROADMAP_STATUSES = new Set([
  "not_started",
  "in_progress",
  "completed",
  "skipped",
]);

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

export class StorageSchemaError extends Error {
  constructor(code, message, foundVersion = null, supportedVersion = CURRENT_SCHEMA_VERSION) {
    super(message);
    this.name = "StorageSchemaError";
    this.code = code;
    this.foundVersion = foundVersion;
    this.supportedVersion = supportedVersion;
  }
}

export class CodeEntryDatabase {
  constructor(db) {
    if (!db) throw new Error("Uma conexão SQLite local é obrigatória.");
    this.db = db;
    this.warnings = [];
    this.schemaInfo = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      previousVersion: null,
      migrated: false,
    };
    this.initSchema();
  }

  addWarning(message) {
    if (!message || this.warnings.includes(message) || this.warnings.length >= 20) return;
    this.warnings.push(message);
  }

  getSchemaInfo() {
    return { ...this.schemaInfo };
  }

  getRecoveryWarnings() {
    return [...this.warnings];
  }

  tableExists(tableName) {
    const row = this.db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
      .get(tableName);
    return Boolean(row);
  }

  runInTransaction(fn) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const result = fn();
      this.db.exec("COMMIT");
      return result;
    } catch (error) {
      try {
        this.db.exec("ROLLBACK");
      } catch {
        // Ignora erro de rollback se a transação já foi revertida
      }
      throw error;
    }
  }

  initSchema() {
    const hasSchemaMeta = this.tableExists("schema_meta");
    const hasUserSettings = this.tableExists("user_settings");
    const hadAnyDataTables =
      hasSchemaMeta ||
      hasUserSettings ||
      this.tableExists("lesson_progress") ||
      this.tableExists("challenge_progress") ||
      this.tableExists("code_drafts");

    let recordedVersion = null;
    if (hasSchemaMeta) {
      const metaRow = this.db
        .prepare("SELECT value FROM schema_meta WHERE key = 'schema_version'")
        .get();
      if (metaRow && metaRow.value !== undefined && metaRow.value !== null) {
        const parsed = Number.parseInt(String(metaRow.value), 10);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          throw new StorageSchemaError(
            "SCHEMA_MIGRATION_FAILED",
            `Metadado de versão inválido no armazenamento local ("${String(metaRow.value)}"). Nenhuma alteração automática foi aplicada.`,
            null,
            CURRENT_SCHEMA_VERSION
          );
        }
        if (parsed > CURRENT_SCHEMA_VERSION) {
          throw new StorageSchemaError(
            "FUTURE_SCHEMA_VERSION",
            `Os dados salvos foram criados por uma versão mais nova do Code Entry (esquema v${parsed}; esta versão suporta até v${CURRENT_SCHEMA_VERSION}). Atualize o aplicativo antes de modificar seus dados.`,
            parsed,
            CURRENT_SCHEMA_VERSION
          );
        }
        recordedVersion = parsed;
      }
    }

    try {
      const migrationMeta = this.runInTransaction(() => {
        this.db.exec(`
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

          CREATE TABLE IF NOT EXISTS roadmap_progress (
            topic_id TEXT PRIMARY KEY,
            roadmap_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'not_started',
            updated_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS saved_roadmaps (
            roadmap_id TEXT PRIMARY KEY,
            saved_at TEXT NOT NULL
          );
        `);

        const inferredLegacyVersion = this.migrateUserSettings(recordedVersion, hasUserSettings);

        const existing = this.db.prepare("SELECT id FROM user_settings WHERE id = 1").get();
        if (!existing) {
          this.db
            .prepare(
              `INSERT INTO user_settings (id, display_name, theme, theme_palette, active_track_id, daily_goal_minutes, study_seconds_total, onboarding_completed, profile_setup_completed, reduced_motion, updated_at)
               VALUES (1, 'Estudante', 'dark', 'dark-violet', 'logic', 30, 0, 0, 0, 0, ?)`
            )
            .run(new Date().toISOString());
        }

        const previousVersion =
          recordedVersion ?? (hadAnyDataTables ? inferredLegacyVersion : null);
        const migrated =
          hadAnyDataTables && previousVersion !== null && previousVersion < CURRENT_SCHEMA_VERSION;

        if (migrated) {
          this.db
            .prepare("INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('migrated_from', ?)")
            .run(String(previousVersion));
          this.db
            .prepare("INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('last_migrated_at', ?)")
            .run(new Date().toISOString());
        }

        this.db
          .prepare("INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('schema_version', ?)")
          .run(String(CURRENT_SCHEMA_VERSION));

        return { previousVersion, migrated };
      });

      this.schemaInfo = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        previousVersion: migrationMeta.previousVersion,
        migrated: migrationMeta.migrated,
      };
    } catch (error) {
      if (error instanceof StorageSchemaError) throw error;
      throw new StorageSchemaError(
        "SCHEMA_MIGRATION_FAILED",
        `Não foi possível preparar ou migrar os dados locais: ${
          error instanceof Error ? error.message : String(error)
        }`,
        recordedVersion,
        CURRENT_SCHEMA_VERSION
      );
    }
  }

  migrateUserSettings(recordedVersion, hasExistingUserSettings) {
    const cols = this.db.prepare("PRAGMA table_info(user_settings)").all();
    const names = new Set(cols.map(c => c.name));
    let inferredVersion = recordedVersion ?? (hasExistingUserSettings ? 4 : CURRENT_SCHEMA_VERSION);

    if (!names.has("onboarding_completed")) {
      inferredVersion = Math.min(inferredVersion, 1);
      this.db.exec(
        "ALTER TABLE user_settings ADD COLUMN onboarding_completed INTEGER NOT NULL DEFAULT 0"
      );
    }
    if (!names.has("profile_setup_completed")) {
      inferredVersion = Math.min(inferredVersion, 2);
      this.db.exec(
        "ALTER TABLE user_settings ADD COLUMN profile_setup_completed INTEGER NOT NULL DEFAULT 0"
      );
      this.db.exec(
        "UPDATE user_settings SET profile_setup_completed = 1 WHERE id = 1 AND (onboarding_completed = 1 OR display_name != 'Estudante')"
      );
    }
    if (!names.has("reduced_motion")) {
      inferredVersion = Math.min(inferredVersion, 3);
      this.db.exec(
        "ALTER TABLE user_settings ADD COLUMN reduced_motion INTEGER NOT NULL DEFAULT 0"
      );
    }
    if (!names.has("theme_palette")) {
      inferredVersion = Math.min(inferredVersion, 3);
      this.db.exec(
        "ALTER TABLE user_settings ADD COLUMN theme_palette TEXT NOT NULL DEFAULT 'dark-violet'"
      );
      this.db.exec(
        "UPDATE user_settings SET theme_palette = CASE WHEN theme = 'light' THEN 'light-arctic' ELSE 'dark-violet' END WHERE id = 1"
      );
    }
    return inferredVersion;
  }

  close() {
    this.db.close();
  }

  getSettings() {
    let row = this.db.prepare("SELECT * FROM user_settings WHERE id = 1").get();
    if (!row) {
      const now = new Date().toISOString();
      this.db
        .prepare(
          `INSERT INTO user_settings (id, display_name, theme, theme_palette, active_track_id, daily_goal_minutes, study_seconds_total, onboarding_completed, profile_setup_completed, reduced_motion, updated_at)
           VALUES (1, 'Estudante', 'dark', 'dark-violet', 'logic', 30, 0, 0, 0, 0, ?)`
        )
        .run(now);
      row = this.db.prepare("SELECT * FROM user_settings WHERE id = 1").get();
      this.addWarning(
        "Preferências de perfil ausentes foram restauradas com valores padrão, preservando seu progresso."
      );
    }

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

    const rawName = typeof row.display_name === "string" ? row.display_name.trim() : "";
    const displayName = rawName ? rawName.slice(0, 48) : "Estudante";

    const rawTrack = typeof row.active_track_id === "string" ? row.active_track_id.trim() : "";
    const activeTrackId = rawTrack || "logic";

    const rawGoal = Number(row.daily_goal_minutes);
    let dailyGoalMinutes = 30;
    if (Number.isFinite(rawGoal)) {
      if (rawGoal < 5 || rawGoal > 240) {
        this.addWarning("Meta diária fora do intervalo esperado foi ajustada com segurança.");
      }
      dailyGoalMinutes = Math.max(5, Math.min(240, Math.round(rawGoal)));
    } else if (row.daily_goal_minutes !== null && row.daily_goal_minutes !== undefined) {
      this.addWarning("Meta diária inválida foi restaurada para 30 minutos.");
    }

    const rawSeconds = Number(row.study_seconds_total);
    const studySecondsTotal =
      Number.isFinite(rawSeconds) && rawSeconds >= 0 ? Math.round(rawSeconds) : 0;

    return {
      displayName,
      theme,
      themePalette,
      activeTrackId,
      dailyGoalMinutes,
      studySecondsTotal,
      onboardingCompleted: Boolean(row.onboarding_completed),
      profileSetupCompleted: Boolean(row.profile_setup_completed),
      reducedMotion: Boolean(row.reduced_motion),
      updatedAt:
        typeof row.updated_at === "string" && row.updated_at
          ? row.updated_at
          : new Date().toISOString(),
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

    return this.runInTransaction(() => {
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
    });
  }

  recordLessonAttempt({ lessonId, trackId, completed, objectivesDone, xpReward }) {
    const now = new Date().toISOString();
    const existing = this.db
      .prepare("SELECT * FROM lesson_progress WHERE lesson_id = ?")
      .get(lessonId);

    const prevCompleted = existing ? Boolean(existing.completed) : false;
    const finalCompleted = prevCompleted || Boolean(completed);
    const prevObjectivesParsed = existing ? safeJsonParseStatus(existing.objectives_json, []) : { value: [], ok: true };
    const prevObjectives = Array.isArray(prevObjectivesParsed.value)
      ? prevObjectivesParsed.value.filter(item => typeof item === "string")
      : [];
    const safeNewObjectives = Array.isArray(objectivesDone)
      ? objectivesDone.filter(item => typeof item === "string")
      : [];
    const mergedObjectives = Array.from(new Set([...prevObjectives, ...safeNewObjectives]));
    const existingXp = Number(existing?.xp_awarded) || 0;
    const xpAwarded =
      finalCompleted && (!existing || existingXp === 0)
        ? Math.max(0, Number(xpReward) || 0)
        : existingXp;
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
          ? Math.min(Number(existing.best_time_ms) || ms, ms)
          : ms
        : existing?.best_time_ms ?? null;
    const existingXp = Number(existing?.xp_awarded) || 0;
    const xpAwarded =
      finalCompleted && (!existing || existingXp === 0)
        ? Math.max(0, Number(xpReward) || 0)
        : existingXp;
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

  setRoadmapTopicStatus(roadmapId, topicId, status) {
    if (typeof roadmapId !== "string" || !roadmapId.trim() || typeof topicId !== "string" || !topicId.trim()) {
      throw new Error("Identificador inválido para o tópico do roadmap.");
    }
    const cleanRoadmapId = roadmapId.trim();
    const cleanTopicId = topicId.trim();
    const normalizedStatus = VALID_ROADMAP_STATUSES.has(status) ? status : "not_started";
    const now = new Date().toISOString();

    if (normalizedStatus === "not_started") {
      this.db.prepare("DELETE FROM roadmap_progress WHERE topic_id = ?").run(cleanTopicId);
    } else {
      this.db
        .prepare(
          `INSERT INTO roadmap_progress (topic_id, roadmap_id, status, updated_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(topic_id) DO UPDATE SET
             roadmap_id = excluded.roadmap_id,
             status = excluded.status,
             updated_at = excluded.updated_at`
        )
        .run(cleanTopicId, cleanRoadmapId, normalizedStatus, now);
    }

    return {
      topicId: cleanTopicId,
      roadmapId: cleanRoadmapId,
      status: normalizedStatus,
      updatedAt: now,
      roadmapProgress: this.getRoadmapProgressMap(),
    };
  }

  toggleSavedRoadmap(roadmapId) {
    if (typeof roadmapId !== "string" || !roadmapId.trim()) {
      throw new Error("Identificador inválido para o roadmap.");
    }
    const cleanId = roadmapId.trim();
    const existing = this.db
      .prepare("SELECT roadmap_id FROM saved_roadmaps WHERE roadmap_id = ?")
      .get(cleanId);

    if (existing) {
      this.db.prepare("DELETE FROM saved_roadmaps WHERE roadmap_id = ?").run(cleanId);
    } else {
      this.db
        .prepare("INSERT INTO saved_roadmaps (roadmap_id, saved_at) VALUES (?, ?)")
        .run(cleanId, new Date().toISOString());
    }

    return {
      saved: !existing,
      savedRoadmaps: this.getSavedRoadmapsList(),
    };
  }

  getLessonProgressMap() {
    const rows = this.db.prepare("SELECT * FROM lesson_progress").all();
    const map = {};
    for (const r of rows) {
      if (typeof r.lesson_id !== "string" || !r.lesson_id.trim()) {
        this.addWarning("Registro inválido de aula sem identificador foi ignorado.");
        continue;
      }
      const parsedObj = safeJsonParseStatus(r.objectives_json, []);
      let objectivesDone = [];
      if (parsedObj.ok && Array.isArray(parsedObj.value)) {
        objectivesDone = parsedObj.value.filter(item => typeof item === "string");
      } else {
        this.addWarning(`Lista de objetivos corrompida na aula ${r.lesson_id} foi normalizada sem apagar a conclusão.`);
      }
      const attemptsNum = Number(r.attempts);
      const xpNum = Number(r.xp_awarded);
      map[r.lesson_id] = {
        lessonId: r.lesson_id,
        trackId: typeof r.track_id === "string" && r.track_id.trim() ? r.track_id : "logic",
        completed: Boolean(r.completed),
        objectivesDone,
        attempts: Number.isFinite(attemptsNum) && attemptsNum >= 0 ? Math.round(attemptsNum) : 0,
        lastAttemptAt: typeof r.last_attempt_at === "string" ? r.last_attempt_at : null,
        completedAt: typeof r.completed_at === "string" ? r.completed_at : null,
        xpAwarded: Number.isFinite(xpNum) && xpNum >= 0 ? Math.round(xpNum) : 0,
      };
    }
    return map;
  }

  getChallengeProgressMap() {
    const rows = this.db.prepare("SELECT * FROM challenge_progress").all();
    const map = {};
    for (const r of rows) {
      if (typeof r.challenge_id !== "string" || !r.challenge_id.trim()) {
        this.addWarning("Registro inválido de desafio sem identificador foi ignorado.");
        continue;
      }
      const attemptsNum = Number(r.attempts);
      const xpNum = Number(r.xp_awarded);
      const bestMsRaw = r.best_time_ms !== null && r.best_time_ms !== undefined ? Number(r.best_time_ms) : null;
      map[r.challenge_id] = {
        challengeId: r.challenge_id,
        trackId: typeof r.track_id === "string" && r.track_id.trim() ? r.track_id : "logic",
        completed: Boolean(r.completed),
        attempts: Number.isFinite(attemptsNum) && attemptsNum >= 0 ? Math.round(attemptsNum) : 0,
        bestTimeMs:
          bestMsRaw !== null && Number.isFinite(bestMsRaw) && bestMsRaw >= 0
            ? Math.round(bestMsRaw)
            : null,
        lastAttemptAt: typeof r.last_attempt_at === "string" ? r.last_attempt_at : null,
        completedAt: typeof r.completed_at === "string" ? r.completed_at : null,
        xpAwarded: Number.isFinite(xpNum) && xpNum >= 0 ? Math.round(xpNum) : 0,
      };
    }
    return map;
  }

  getDraftsMap() {
    const rows = this.db.prepare("SELECT * FROM code_drafts").all();
    const map = {};
    for (const r of rows) {
      if (typeof r.draft_key !== "string" || !r.draft_key.trim()) continue;
      map[r.draft_key] = {
        code: typeof r.code === "string" ? r.code : "",
        stdin: typeof r.stdin === "string" ? r.stdin : "",
        updatedAt: typeof r.updated_at === "string" ? r.updated_at : new Date().toISOString(),
      };
    }
    return map;
  }

  getHistory(limit = 200) {
    const rows = this.db
      .prepare("SELECT * FROM activity_history ORDER BY id DESC LIMIT ?")
      .all(Math.max(1, Math.min(500, Number(limit) || 200)));
    return rows.map(r => ({
      id: Number(r.id) || 0,
      eventType: typeof r.event_type === "string" ? r.event_type : "activity",
      trackId: typeof r.track_id === "string" ? r.track_id : null,
      itemId: typeof r.item_id === "string" ? r.item_id : null,
      title: typeof r.title === "string" ? r.title : "Atividade",
      status: r.status === "success" || r.status === "error" || r.status === "info" ? r.status : "info",
      detail: typeof r.detail === "string" ? r.detail : "",
      xpDelta: Number.isFinite(Number(r.xp_delta)) ? Math.round(Number(r.xp_delta)) : 0,
      durationMs: Number.isFinite(Number(r.duration_ms)) ? Math.max(0, Math.round(Number(r.duration_ms))) : 0,
      createdAt: typeof r.created_at === "string" ? r.created_at : new Date().toISOString(),
    }));
  }

  getAchievementsMap() {
    const rows = this.db.prepare("SELECT * FROM achievements_unlocked").all();
    const map = {};
    for (const r of rows) {
      if (typeof r.achievement_id !== "string" || !r.achievement_id.trim()) continue;
      map[r.achievement_id] =
        typeof r.unlocked_at === "string" && r.unlocked_at ? r.unlocked_at : new Date().toISOString();
    }
    return map;
  }

  getWorkspacesMap() {
    const rows = this.db.prepare("SELECT * FROM workspace_state").all();
    const map = {};
    for (const r of rows) {
      if (typeof r.workspace_key !== "string" || !r.workspace_key.trim()) continue;
      const parsed = safeJsonParseStatus(r.state_json, {});
      if (!parsed.ok || typeof parsed.value !== "object" || parsed.value === null) {
        this.addWarning(
          `Estado parcial do ambiente "${r.workspace_key}" estava corrompido e foi isolado sem apagar outros dados.`
        );
        map[r.workspace_key] = {};
      } else {
        map[r.workspace_key] = parsed.value;
      }
    }
    return map;
  }

  getDailyStudyLogMap() {
    const rows = this.db.prepare("SELECT * FROM daily_study_log").all();
    const map = {};
    for (const r of rows) {
      const sec = Number(r.seconds);
      if (
        typeof r.study_date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(r.study_date) &&
        Number.isFinite(sec) &&
        sec >= 0
      ) {
        map[r.study_date] = Math.round(sec);
      } else {
        this.addWarning("Entrada diária de tempo inválida foi ignorada com segurança.");
      }
    }
    return map;
  }

  getRoadmapProgressMap() {
    const rows = this.db.prepare("SELECT * FROM roadmap_progress").all();
    const map = {};
    for (const r of rows) {
      if (typeof r.topic_id !== "string" || !r.topic_id.trim()) continue;
      if (typeof r.roadmap_id !== "string" || !r.roadmap_id.trim()) continue;
      const status = VALID_ROADMAP_STATUSES.has(r.status) ? r.status : "not_started";
      map[r.topic_id] = {
        topicId: r.topic_id,
        roadmapId: r.roadmap_id,
        status,
        updatedAt: typeof r.updated_at === "string" && r.updated_at ? r.updated_at : new Date().toISOString(),
      };
    }
    return map;
  }

  getSavedRoadmapsList() {
    const rows = this.db
      .prepare("SELECT roadmap_id FROM saved_roadmaps ORDER BY saved_at DESC")
      .all();
    return rows
      .map(r => (typeof r.roadmap_id === "string" ? r.roadmap_id.trim() : ""))
      .filter(Boolean);
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
      roadmapProgress: this.getRoadmapProgressMap(),
      savedRoadmaps: this.getSavedRoadmapsList(),
    };
  }

  exportBackup() {
    return {
      version: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data: this.getBootstrap(),
    };
  }

  restoreBackup(payload) {
    if (!payload || typeof payload !== "object") {
      throw new StorageSchemaError("INVALID_BACKUP", "Arquivo de backup inválido.");
    }
    if (
      typeof payload.version === "number" &&
      Number.isFinite(payload.version) &&
      payload.version > CURRENT_SCHEMA_VERSION
    ) {
      throw new StorageSchemaError(
        "INVALID_BACKUP",
        `Este backup usa formato v${payload.version}, mais recente do que o suportado (v${CURRENT_SCHEMA_VERSION}).`,
        payload.version,
        CURRENT_SCHEMA_VERSION
      );
    }

    const data = payload.data && typeof payload.data === "object" ? payload.data : payload;
    const recognizedKeys = [
      "settings",
      "lessonProgress",
      "challengeProgress",
      "drafts",
      "history",
      "achievements",
      "workspaces",
      "dailyStudyLog",
      "roadmapProgress",
      "savedRoadmaps",
    ];
    if (!data || typeof data !== "object" || !recognizedKeys.some(k => k in data)) {
      throw new StorageSchemaError(
        "INVALID_BACKUP",
        "Arquivo de backup inválido ou sem estrutura reconhecida do Code Entry."
      );
    }

    this.warnings = [];

    return this.runInTransaction(() => {
      this.clearAllTablesInTransaction(false);

      if (data.settings && typeof data.settings === "object") {
        this.updateSettings(data.settings);
        if (
          typeof data.settings.studySecondsTotal === "number" &&
          Number.isFinite(data.settings.studySecondsTotal)
        ) {
          this.db
            .prepare("UPDATE user_settings SET study_seconds_total = ? WHERE id = 1")
            .run(Math.max(0, Math.round(data.settings.studySecondsTotal)));
        }
      }

      if (data.lessonProgress && typeof data.lessonProgress === "object") {
        const stmt = this.db.prepare(
          `INSERT OR REPLACE INTO lesson_progress (lesson_id, track_id, completed, objectives_json, attempts, last_attempt_at, completed_at, xp_awarded)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        );
        for (const [key, rawLp] of Object.entries(data.lessonProgress)) {
          if (!rawLp || typeof rawLp !== "object") continue;
          const lessonId =
            typeof rawLp.lessonId === "string" && rawLp.lessonId.trim() ? rawLp.lessonId.trim() : key;
          if (!lessonId) continue;
          const objectives = Array.isArray(rawLp.objectivesDone)
            ? rawLp.objectivesDone.filter(o => typeof o === "string")
            : [];
          stmt.run(
            lessonId,
            typeof rawLp.trackId === "string" && rawLp.trackId.trim() ? rawLp.trackId.trim() : "logic",
            rawLp.completed ? 1 : 0,
            JSON.stringify(objectives),
            Math.max(0, Math.round(Number(rawLp.attempts) || 0)),
            typeof rawLp.lastAttemptAt === "string" ? rawLp.lastAttemptAt : null,
            typeof rawLp.completedAt === "string" ? rawLp.completedAt : null,
            Math.max(0, Math.round(Number(rawLp.xpAwarded) || 0))
          );
        }
      }

      if (data.challengeProgress && typeof data.challengeProgress === "object") {
        const stmt = this.db.prepare(
          `INSERT OR REPLACE INTO challenge_progress (challenge_id, track_id, completed, attempts, best_time_ms, last_attempt_at, completed_at, xp_awarded)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        );
        for (const [key, rawCp] of Object.entries(data.challengeProgress)) {
          if (!rawCp || typeof rawCp !== "object") continue;
          const challengeId =
            typeof rawCp.challengeId === "string" && rawCp.challengeId.trim()
              ? rawCp.challengeId.trim()
              : key;
          if (!challengeId) continue;
          const bestMs =
            typeof rawCp.bestTimeMs === "number" && Number.isFinite(rawCp.bestTimeMs) && rawCp.bestTimeMs >= 0
              ? Math.round(rawCp.bestTimeMs)
              : null;
          stmt.run(
            challengeId,
            typeof rawCp.trackId === "string" && rawCp.trackId.trim() ? rawCp.trackId.trim() : "logic",
            rawCp.completed ? 1 : 0,
            Math.max(0, Math.round(Number(rawCp.attempts) || 0)),
            bestMs,
            typeof rawCp.lastAttemptAt === "string" ? rawCp.lastAttemptAt : null,
            typeof rawCp.completedAt === "string" ? rawCp.completedAt : null,
            Math.max(0, Math.round(Number(rawCp.xpAwarded) || 0))
          );
        }
      }

      if (data.drafts && typeof data.drafts === "object") {
        for (const [key, d] of Object.entries(data.drafts)) {
          if (!key || !d || typeof d !== "object") continue;
          this.saveDraft(key, d.code || "", d.stdin || "");
        }
      }

      if (Array.isArray(data.history)) {
        const stmt = this.db.prepare(
          `INSERT INTO activity_history (event_type, track_id, item_id, title, status, detail, xp_delta, duration_ms, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );
        for (const h of [...data.history].reverse()) {
          if (!h || typeof h !== "object") continue;
          stmt.run(
            typeof h.eventType === "string" ? h.eventType : "activity",
            typeof h.trackId === "string" ? h.trackId : null,
            typeof h.itemId === "string" ? h.itemId : null,
            typeof h.title === "string" ? h.title : "Atividade",
            typeof h.status === "string" ? h.status : "info",
            typeof h.detail === "string" ? h.detail : "",
            Number.isFinite(Number(h.xpDelta)) ? Math.round(Number(h.xpDelta)) : 0,
            Number.isFinite(Number(h.durationMs)) ? Math.max(0, Math.round(Number(h.durationMs))) : 0,
            typeof h.createdAt === "string" ? h.createdAt : new Date().toISOString()
          );
        }
      }

      if (data.achievements && typeof data.achievements === "object") {
        const stmt = this.db.prepare(
          "INSERT OR REPLACE INTO achievements_unlocked (achievement_id, unlocked_at) VALUES (?, ?)"
        );
        for (const [id, at] of Object.entries(data.achievements)) {
          if (!id) continue;
          stmt.run(id, String(at || new Date().toISOString()));
        }
      }

      if (data.workspaces && typeof data.workspaces === "object") {
        for (const [key, ws] of Object.entries(data.workspaces)) {
          if (!key) continue;
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
          if (/^\d{4}-\d{2}-\d{2}$/.test(dt) && typeof sec === "number" && Number.isFinite(sec) && sec >= 0) {
            stmt.run(dt, Math.round(sec));
          }
        }
      }

      if (data.roadmapProgress && typeof data.roadmapProgress === "object") {
        const stmt = this.db.prepare(
          `INSERT OR REPLACE INTO roadmap_progress (topic_id, roadmap_id, status, updated_at)
           VALUES (?, ?, ?, ?)`
        );
        for (const [key, rawRp] of Object.entries(data.roadmapProgress)) {
          if (!rawRp || typeof rawRp !== "object") continue;
          const topicId =
            typeof rawRp.topicId === "string" && rawRp.topicId.trim() ? rawRp.topicId.trim() : key;
          const roadmapId =
            typeof rawRp.roadmapId === "string" && rawRp.roadmapId.trim() ? rawRp.roadmapId.trim() : "";
          if (!topicId || !roadmapId) continue;
          const status = VALID_ROADMAP_STATUSES.has(rawRp.status) ? rawRp.status : "not_started";
          if (status === "not_started") continue;
          stmt.run(
            topicId,
            roadmapId,
            status,
            typeof rawRp.updatedAt === "string" && rawRp.updatedAt
              ? rawRp.updatedAt
              : new Date().toISOString()
          );
        }
      }

      if (Array.isArray(data.savedRoadmaps)) {
        const stmt = this.db.prepare(
          "INSERT OR REPLACE INTO saved_roadmaps (roadmap_id, saved_at) VALUES (?, ?)"
        );
        const now = new Date().toISOString();
        for (const rmId of data.savedRoadmaps) {
          if (typeof rmId === "string" && rmId.trim()) {
            stmt.run(rmId.trim(), now);
          }
        }
      }

      return this.getBootstrap();
    });
  }

  clearAllTablesInTransaction(preserveSettings = false) {
    this.db.exec(`
      DELETE FROM lesson_progress;
      DELETE FROM challenge_progress;
      DELETE FROM code_drafts;
      DELETE FROM activity_history;
      DELETE FROM achievements_unlocked;
      DELETE FROM workspace_state;
      DELETE FROM daily_study_log;
      DELETE FROM roadmap_progress;
      DELETE FROM saved_roadmaps;
    `);
    if (this.tableExists("sqlite_sequence")) {
      this.db.exec("DELETE FROM sqlite_sequence WHERE name = 'activity_history';");
    }

    const now = new Date().toISOString();
    if (preserveSettings) {
      this.db
        .prepare("UPDATE user_settings SET active_track_id = 'logic', study_seconds_total = 0, updated_at = ? WHERE id = 1")
        .run(now);
    } else {
      this.db
        .prepare(
          `UPDATE user_settings
           SET display_name = 'Estudante', theme = 'dark', theme_palette = 'dark-violet', active_track_id = 'logic', daily_goal_minutes = 30, study_seconds_total = 0, onboarding_completed = 0, profile_setup_completed = 0, reduced_motion = 0, updated_at = ?
           WHERE id = 1`
        )
        .run(now);
      this.db.exec("DELETE FROM schema_meta WHERE key IN ('migrated_from', 'last_migrated_at');");
      this.db
        .prepare("INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('schema_version', ?)")
        .run(String(CURRENT_SCHEMA_VERSION));
    }
  }

  resetAll({ preserveSettings = false } = {}) {
    this.warnings = [];
    this.schemaInfo = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      previousVersion: null,
      migrated: false,
    };
    return this.runInTransaction(() => {
      this.clearAllTablesInTransaction(preserveSettings);
      return this.getBootstrap();
    });
  }
}

function safeJsonParseStatus(raw, fallback) {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, value: fallback };
  }
}
