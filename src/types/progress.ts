import type { TrackId } from "./curriculum";
import type { ThemeMode, ThemePaletteId } from "../data/themes";

export interface UserSettings {
  displayName: string;
  theme: ThemeMode;
  themePalette: ThemePaletteId;
  activeTrackId: TrackId;
  dailyGoalMinutes: number;
  studySecondsTotal: number;
  onboardingCompleted: boolean;
  profileSetupCompleted: boolean;
  reducedMotion: boolean;
  updatedAt: string;
}

export interface LessonProgressEntry {
  lessonId: string;
  trackId: TrackId;
  completed: boolean;
  objectivesDone: string[];
  attempts: number;
  lastAttemptAt: string | null;
  completedAt: string | null;
  xpAwarded: number;
}

export interface ChallengeProgressEntry {
  challengeId: string;
  trackId: TrackId;
  completed: boolean;
  attempts: number;
  bestTimeMs: number | null;
  lastAttemptAt: string | null;
  completedAt: string | null;
  xpAwarded: number;
}

export interface CodeDraftEntry {
  code: string;
  stdin: string;
  updatedAt: string;
}

export interface ActivityHistoryEntry {
  id: number;
  eventType: "lesson_completed" | "lesson_attempt" | "challenge_completed" | "challenge_attempt" | "lab_run" | string;
  trackId: TrackId | null;
  itemId: string | null;
  title: string;
  status: "success" | "error" | "info";
  detail: string;
  xpDelta: number;
  durationMs: number;
  createdAt: string;
}

export interface BootstrapPayload {
  settings: UserSettings;
  lessonProgress: Record<string, LessonProgressEntry>;
  challengeProgress: Record<string, ChallengeProgressEntry>;
  drafts: Record<string, CodeDraftEntry>;
  history: ActivityHistoryEntry[];
  achievements: Record<string, string>;
  workspaces: Record<string, unknown>;
  dailyStudyLog: Record<string, number>;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: "Geral" | "Trilhas" | "Desafios" | "Consistência";
  xpBonus: number;
  iconName: string;
  accentColor: string;
  evaluate: (stats: ComputedStats) => { unlocked: boolean; current: number; target: number };
}

export interface UnlockedAchievementSummary {
  id: string;
  title: string;
  xpBonus: number;
}

export interface CompletionOutcome {
  kind: "lesson" | "challenge";
  itemId: string;
  title: string;
  trackId: TrackId;
  trackName: string;
  trackAccent: string;
  newlyCompleted: boolean;
  xpAwarded: number;
  prevTrackPercent: number;
  nextTrackPercent: number;
  trackDeltaPercent: number;
  prevOverallPercent: number;
  nextOverallPercent: number;
  overallDeltaPercent: number;
  completedActivities: number;
  totalActivities: number;
  newlyUnlockedAchievements: UnlockedAchievementSummary[];
}

export interface ComputedStats {
  totalLessons: number;
  completedLessons: number;
  totalChallenges: number;
  completedChallenges: number;
  totalActivities: number;
  completedActivities: number;
  overallPercent: number;
  totalXp: number;
  studyMinutes: number;
  todayStudySeconds: number;
  todayStudyMinutes: number;
  dailyGoalPercent: number;
  streakDays: number;
  historyCount: number;
  startedTracks: TrackId[];
  completedTracks: TrackId[];
  perTrack: Record<
    TrackId,
    {
      totalLessons: number;
      completedLessons: number;
      totalChallenges: number;
      completedChallenges: number;
      lessonPercent: number;
      percent: number;
      xp: number;
    }
  >;
}
