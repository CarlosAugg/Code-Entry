import type {
  ActivityHistoryEntry,
  BootstrapPayload,
  ChallengeProgressEntry,
  LessonProgressEntry,
  RoadmapTopicProgressEntry,
  RoadmapTopicStatus,
  UserSettings,
} from "../types/progress";

export const CURRENT_SCHEMA_VERSION: number;

export type StorageSchemaErrorCode =
  | "FUTURE_SCHEMA_VERSION"
  | "SCHEMA_MIGRATION_FAILED"
  | "INVALID_BACKUP";

export class StorageSchemaError extends Error {
  code: StorageSchemaErrorCode;
  foundVersion: number | null;
  supportedVersion: number;
  constructor(
    code: StorageSchemaErrorCode,
    message: string,
    foundVersion?: number | null,
    supportedVersion?: number
  );
}

export interface SchemaInfo {
  schemaVersion: number;
  previousVersion: number | null;
  migrated: boolean;
}

export interface SyncSqlStatement {
  get(...params: unknown[]): Record<string, unknown> | undefined;
  all(...params: unknown[]): Record<string, unknown>[];
  run(...params: unknown[]): { changes: number; lastInsertRowid: number };
}

export interface SyncSqlDatabase {
  exec(sql: string): void;
  prepare(sql: string): SyncSqlStatement;
  close(): void;
}

export class CodeEntryDatabase {
  constructor(db: SyncSqlDatabase);
  close(): void;
  getSchemaInfo(): SchemaInfo;
  getRecoveryWarnings(): string[];
  getBootstrap(): BootstrapPayload;
  getSettings(): UserSettings;
  updateSettings(patch?: Partial<UserSettings>): UserSettings;
  addStudySeconds(seconds: number, dateStr?: string): UserSettings;
  recordLessonAttempt(payload: {
    lessonId: string;
    trackId: string;
    completed: boolean;
    objectivesDone: string[];
    xpReward: number;
  }): { newlyCompleted: boolean; xpAwarded: number; progress: Record<string, LessonProgressEntry> };
  recordChallengeAttempt(payload: {
    challengeId: string;
    trackId: string;
    completed: boolean;
    durationMs: number;
    xpReward: number;
  }): { newlyCompleted: boolean; xpAwarded: number; progress: Record<string, ChallengeProgressEntry> };
  saveDraft(key: string, code: string, stdin?: string): { draftKey: string; updatedAt: string };
  deleteDraft(key: string): { deleted: boolean };
  addHistoryEvent(payload: Record<string, any>): ActivityHistoryEntry;
  unlockAchievements(ids?: string[]): { achievementId: string; unlockedAt: string }[];
  getAchievementsMap(): Record<string, string>;
  saveWorkspaceState(key: string, state: unknown): { workspaceKey: string; updatedAt: string };
  setRoadmapTopicStatus(
    roadmapId: string,
    topicId: string,
    status: RoadmapTopicStatus
  ): {
    topicId: string;
    roadmapId: string;
    status: RoadmapTopicStatus;
    updatedAt: string;
    roadmapProgress: Record<string, RoadmapTopicProgressEntry>;
  };
  toggleSavedRoadmap(roadmapId: string): { saved: boolean; savedRoadmaps: string[] };
  getRoadmapProgressMap(): Record<string, RoadmapTopicProgressEntry>;
  getSavedRoadmapsList(): string[];
  getDailyStudyLogMap(): Record<string, number>;
  exportBackup(): unknown;
  restoreBackup(payload: unknown): BootstrapPayload;
  resetAll(options?: { preserveSettings?: boolean }): BootstrapPayload;
}
