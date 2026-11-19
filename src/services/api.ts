import type { TrackId } from "../types/curriculum";
import type {
  ActivityHistoryEntry,
  BootstrapPayload,
  ChallengeProgressEntry,
  LessonProgressEntry,
  UserSettings,
} from "../types/progress";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error || `Erro HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  bootstrap(): Promise<BootstrapPayload> {
    return jsonFetch<BootstrapPayload>("/api/bootstrap");
  },

  updateSettings(patch: Partial<UserSettings>): Promise<{ settings: UserSettings }> {
    return jsonFetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify(patch),
    });
  },

  addStudySeconds(seconds: number, date?: string): Promise<{ settings: UserSettings; dailyStudyLog: Record<string, number> }> {
    return jsonFetch("/api/study-time", {
      method: "POST",
      body: JSON.stringify({ seconds, date }),
    });
  },

  recordLessonAttempt(payload: {
    lessonId: string;
    trackId: TrackId;
    completed: boolean;
    objectivesDone: string[];
    xpReward: number;
  }): Promise<{ newlyCompleted: boolean; xpAwarded: number; progress: Record<string, LessonProgressEntry> }> {
    return jsonFetch("/api/progress/lesson", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  recordChallengeAttempt(payload: {
    challengeId: string;
    trackId: TrackId;
    completed: boolean;
    durationMs: number;
    xpReward: number;
  }): Promise<{ newlyCompleted: boolean; xpAwarded: number; progress: Record<string, ChallengeProgressEntry> }> {
    return jsonFetch("/api/progress/challenge", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  saveDraft(draftKey: string, code: string, stdin = ""): Promise<{ draftKey: string; updatedAt: string }> {
    return jsonFetch(`/api/drafts/${encodeURIComponent(draftKey)}`, {
      method: "PUT",
      body: JSON.stringify({ code, stdin }),
    });
  },

  deleteDraft(draftKey: string): Promise<{ deleted: boolean }> {
    return jsonFetch(`/api/drafts/${encodeURIComponent(draftKey)}`, {
      method: "DELETE",
    });
  },

  addHistoryEvent(payload: {
    eventType: string;
    trackId?: TrackId | null;
    itemId?: string | null;
    title: string;
    status: "success" | "error" | "info";
    detail?: string;
    xpDelta?: number;
    durationMs?: number;
  }): Promise<{ item: ActivityHistoryEntry }> {
    return jsonFetch("/api/history", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  unlockAchievements(ids: string[]): Promise<{
    newlyUnlocked: { achievementId: string; unlockedAt: string }[];
    achievements: Record<string, string>;
  }> {
    return jsonFetch("/api/achievements/unlock", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  },

  saveWorkspace(key: string, state: unknown): Promise<{ workspaceKey: string; updatedAt: string }> {
    return jsonFetch(`/api/workspace/${encodeURIComponent(key)}`, {
      method: "PUT",
      body: JSON.stringify({ state }),
    });
  },

  exportBackup(): Promise<unknown> {
    return jsonFetch("/api/backup");
  },

  restoreBackup(payload: unknown): Promise<BootstrapPayload> {
    return jsonFetch("/api/restore", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  resetAll(preserveSettings = true): Promise<BootstrapPayload> {
    return jsonFetch("/api/reset", {
      method: "POST",
      body: JSON.stringify({ preserveSettings }),
    });
  },
};
