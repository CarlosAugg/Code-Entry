import type {
  ActivityHistoryEntry,
  BootstrapPayload,
  ChallengeProgressEntry,
  LessonProgressEntry,
  UserSettings,
} from "../types/progress";

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
  getBootstrap(): BootstrapPayload;
  getSettings(): UserSettings;
  updateSettings(patch?: Partial<UserSettings>): UserSettings;
  addStudySeconds(seconds: number, dateStr?: string): UserSettings;
  recordLessonAttempt(payload: {lessonId:string;trackId:string;completed:boolean;objectivesDone:string[];xpReward:number}): {newlyCompleted:boolean;xpAwarded:number;progress:Record<string,LessonProgressEntry>};
  recordChallengeAttempt(payload: {challengeId:string;trackId:string;completed:boolean;durationMs:number;xpReward:number}): {newlyCompleted:boolean;xpAwarded:number;progress:Record<string,ChallengeProgressEntry>};
  saveDraft(key:string,code:string,stdin?:string): {draftKey:string;updatedAt:string};
  deleteDraft(key:string): {deleted:boolean};
  addHistoryEvent(payload: Record<string, any>): ActivityHistoryEntry;
  unlockAchievements(ids?:string[]): {achievementId:string;unlockedAt:string}[];
  getAchievementsMap(): Record<string,string>;
  saveWorkspaceState(key:string,state:unknown): {workspaceKey:string;updatedAt:string};
  getDailyStudyLogMap(): Record<string,number>;
  exportBackup(): unknown;
  restoreBackup(payload:unknown): BootstrapPayload;
  resetAll(options?:{preserveSettings?:boolean}): BootstrapPayload;
}
