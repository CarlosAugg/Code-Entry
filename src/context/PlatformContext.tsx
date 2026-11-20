import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ACHIEVEMENTS } from "../data/achievements";
import { CHALLENGES } from "../data/challenges";
import { ALL_LESSONS, LESSONS_BY_TRACK } from "../data/lessons";
import { TRACK_MAP, TRACKS } from "../data/tracks";
import {
  DEFAULT_DARK_PALETTE,
  DEFAULT_LIGHT_PALETTE,
  getPaletteById,
  resolvePalette,
  type ThemeMode,
  type ThemePaletteId,
} from "../data/themes";
import { localStore } from "../services/localStore";
import type { TrackId } from "../types/curriculum";
import type {
  ActivityHistoryEntry,
  BootstrapPayload,
  CompletionOutcome,
  ComputedStats,
  UnlockedAchievementSummary,
  UserSettings,
} from "../types/progress";
import { fireAchievementConfetti, fireCompletionConfetti } from "../utils/confetti";

export type ToastKind = "success" | "info" | "error";

interface ToastMessage {
  id: string;
  title: string;
  subtitle: string;
  kind: ToastKind;
}

interface PlatformContextValue {
  loading: boolean;
  error: string | null;
  retryBootstrap: () => void;
  data: BootstrapPayload;
  stats: ComputedStats;
  referenceOpen: boolean;
  setReferenceOpen: (open: boolean) => void;
  referenceTrackId: TrackId | null;
  openReferenceFor: (trackId?: TrackId | null) => void;
  personalizationOpen: boolean;
  completePersonalization: (opts: {
    displayName: string;
    dailyGoalMinutes: number;
    theme?: ThemeMode;
    themePalette?: ThemePaletteId;
  }) => Promise<void>;
  skipPersonalization: () => Promise<void>;
  tourOpen: boolean;
  startTour: () => void;
  closeTour: () => void;
  completeTour: () => Promise<void>;
  celebration: CompletionOutcome | null;
  dismissCelebration: () => void;
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  setThemePalette: (paletteId: ThemePaletteId) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  recordLessonResult: (opts: {
    lessonId: string;
    trackId: TrackId;
    title: string;
    completed: boolean;
    objectivesDone: string[];
    xpReward: number;
    durationMs: number;
    detail: string;
  }) => Promise<CompletionOutcome>;
  recordChallengeResult: (opts: {
    challengeId: string;
    trackId: TrackId;
    title: string;
    completed: boolean;
    xpReward: number;
    durationMs: number;
    detail: string;
  }) => Promise<CompletionOutcome>;
  logLabActivity: (trackId: TrackId | null, title: string, detail: string, status?: "success" | "error" | "info") => Promise<void>;
  saveDraft: (key: string, code: string, stdin?: string) => Promise<void>;
  clearDraft: (key: string) => Promise<void>;
  saveWorkspace: (key: string, state: unknown) => Promise<void>;
  resetProgress: () => Promise<void>;
  restoreFromBackup: (payload: unknown) => Promise<void>;
  pushToast: (title: string, subtitle: string, kind?: ToastKind) => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
}

const DEFAULT_PAYLOAD: BootstrapPayload = {
  settings: {
    displayName: "Estudante",
    theme: "dark",
    themePalette: DEFAULT_DARK_PALETTE,
    activeTrackId: "logic",
    dailyGoalMinutes: 30,
    studySecondsTotal: 0,
    onboardingCompleted: false,
    profileSetupCompleted: false,
    reducedMotion: false,
    updatedAt: new Date().toISOString(),
  },
  lessonProgress: {},
  challengeProgress: {},
  drafts: {},
  history: [],
  achievements: {},
  workspaces: {},
  dailyStudyLog: {},
};

export function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function computeStreakDays(history: ActivityHistoryEntry[]): number {
  const daysSet = new Set<string>();
  for (const h of history) {
    if (!h.createdAt) continue;
    const parsed = new Date(h.createdAt);
    daysSet.add(Number.isNaN(parsed.getTime()) ? h.createdAt.slice(0, 10) : toLocalDateKey(parsed));
  }
  if (daysSet.size === 0) return 0;

  const today = new Date();
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const todayStr = toLocalDateKey(todayLocal);
  const yesterdayStr = toLocalDateKey(yesterdayLocal);

  let cursor: Date;
  if (daysSet.has(todayStr)) cursor = todayLocal;
  else if (daysSet.has(yesterdayStr)) cursor = yesterdayLocal;
  else return 0;

  let streak = 0;
  while (daysSet.has(toLocalDateKey(cursor))) {
    streak++;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }
  return streak;
}

function computeStats(data: BootstrapPayload): ComputedStats {
  const perTrack = {} as ComputedStats["perTrack"];
  const startedTracks: TrackId[] = [];
  const completedTracks: TrackId[] = [];

  for (const track of TRACKS) {
    const trackLessons = LESSONS_BY_TRACK[track.id] || [];
    const trackChallenges = CHALLENGES.filter(c => c.trackId === track.id);
    const completedL = trackLessons.filter(l => data.lessonProgress[l.id]?.completed).length;
    const completedC = trackChallenges.filter(c => data.challengeProgress[c.id]?.completed).length;
    const totalItems = trackLessons.length + trackChallenges.length;
    const completedItems = completedL + completedC;

    const lessonXp = trackLessons.reduce(
      (acc, l) => acc + (data.lessonProgress[l.id]?.xpAwarded || 0),
      0
    );
    const chalXp = trackChallenges.reduce(
      (acc, c) => acc + (data.challengeProgress[c.id]?.xpAwarded || 0),
      0
    );

    const lessonPercent = trackLessons.length > 0 ? Math.round((completedL / trackLessons.length) * 100) : 0;
    const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    perTrack[track.id] = {
      totalLessons: trackLessons.length,
      completedLessons: completedL,
      totalChallenges: trackChallenges.length,
      completedChallenges: completedC,
      lessonPercent,
      percent,
      xp: lessonXp + chalXp,
    };

    if (completedItems > 0) startedTracks.push(track.id);
    if (trackLessons.length > 0 && completedL === trackLessons.length) {
      completedTracks.push(track.id);
    }
  }

  const totalLessons = ALL_LESSONS.length;
  const completedLessons = ALL_LESSONS.filter(l => data.lessonProgress[l.id]?.completed).length;
  const totalChallenges = CHALLENGES.length;
  const completedChallenges = CHALLENGES.filter(c => data.challengeProgress[c.id]?.completed).length;
  const totalActivities = totalLessons + totalChallenges;
  const completedActivities = completedLessons + completedChallenges;
  const overallPercent = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  const baseXp = Object.values(perTrack).reduce((sum, t) => sum + t.xp, 0);
  const bonusXp = ACHIEVEMENTS.reduce(
    (sum, a) => sum + (data.achievements[a.id] ? a.xpBonus : 0),
    0
  );

  const todayKey = toLocalDateKey(new Date());
  const todayStudySeconds = data.dailyStudyLog?.[todayKey] || 0;
  const todayStudyMinutes = Math.floor(todayStudySeconds / 60);
  const goalMinutes = Math.max(5, data.settings.dailyGoalMinutes || 30);
  const dailyGoalPercent = Math.min(100, Math.round((todayStudySeconds / (goalMinutes * 60)) * 100));

  return {
    totalLessons,
    completedLessons,
    totalChallenges,
    completedChallenges,
    totalActivities,
    completedActivities,
    overallPercent,
    totalXp: baseXp + bonusXp,
    studyMinutes: Math.floor((data.settings.studySecondsTotal || 0) / 60),
    todayStudySeconds,
    todayStudyMinutes,
    dailyGoalPercent,
    streakDays: computeStreakDays(data.history),
    historyCount: data.history.length,
    startedTracks,
    completedTracks,
    perTrack,
  };
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BootstrapPayload>(DEFAULT_PAYLOAD);
  const dataRef = useRef<BootstrapPayload>(DEFAULT_PAYLOAD);
  dataRef.current = data;

  const [referenceOpen, setReferenceOpen] = useState(false);
  const [referenceTrackId, setReferenceTrackId] = useState<TrackId | null>(null);
  const [personalizationOpen, setPersonalizationOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [celebration, setCelebration] = useState<CompletionOutcome | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem("ce.sidebarCollapsed") === "1";
    } catch {
      return false;
    }
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const autoPromptedRef = useRef(false);
  const themeTransitionTimerRef = useRef<number | null>(null);

  const pulseThemeTransition = useCallback(() => {
    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    if (themeTransitionTimerRef.current !== null) {
      window.clearTimeout(themeTransitionTimerRef.current);
    }
    themeTransitionTimerRef.current = window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
      themeTransitionTimerRef.current = null;
    }, 280);
  }, []);

  const pushToast = useCallback((title: string, subtitle: string, kind: ToastKind = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev, { id, title, subtitle, kind }]);
    window.setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const fetchBootstrap = useCallback(async (isActive: () => boolean) => {
    setLoading(true);
    setError(null);
    try {
      const payload = await localStore.bootstrap();
      if (!isActive()) return;
      const resolvedTheme = payload.settings.theme === "light" ? "light" : "dark";
      const resolvedPalette = resolvePalette(resolvedTheme, payload.settings.themePalette);
      const normalized: BootstrapPayload = {
        ...payload,
        settings: {
          ...payload.settings,
          theme: resolvedPalette.mode,
          themePalette: resolvedPalette.id,
        },
        dailyStudyLog: payload.dailyStudyLog || {},
      };
      setData(normalized);
      dataRef.current = normalized;

      if (!autoPromptedRef.current) {
        autoPromptedRef.current = true;
        if (!normalized.settings.profileSetupCompleted) {
          setPersonalizationOpen(true);
        } else if (!normalized.settings.onboardingCompleted) {
          setTourOpen(true);
        }
      }
    } catch (err) {
      if (!isActive()) return;
      console.error("Erro ao carregar dados iniciais:", err);
      setError(err instanceof Error ? err.message : "Não foi possível carregar seus dados salvos.");
    } finally {
      if (isActive()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchBootstrap(() => active);
    return () => {
      active = false;
    };
  }, [fetchBootstrap]);

  const retryBootstrap = useCallback(() => {
    fetchBootstrap(() => true);
  }, [fetchBootstrap]);

  // Sincroniza modo + paleta no elemento raiz <html> e armazena cache anti-flash
  useEffect(() => {
    const root = document.documentElement;
    const palette = resolvePalette(data.settings.theme, data.settings.themePalette);
    if (palette.mode === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
    root.dataset.palette = palette.id;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", palette.metaThemeColor);
    try {
      window.localStorage.setItem("ce.themeMode", palette.mode);
      window.localStorage.setItem("ce.themePalette", palette.id);
      window.localStorage.setItem(`ce.lastPalette.${palette.mode}`, palette.id);
    } catch {
      // Ignora restrições de armazenamento local do navegador
    }
  }, [data.settings.theme, data.settings.themePalette]);

  // Sincroniza preferência explícita de redução de animações no <html>
  useEffect(() => {
    const root = document.documentElement;
    if (data.settings.reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }
  }, [data.settings.reducedMotion]);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        window.localStorage.setItem("ce.sidebarCollapsed", next ? "1" : "0");
      } catch {
        // Ignora restrições de armazenamento local do navegador
      }
      return next;
    });
  }, []);

  // Cronômetro real de estudo ativo (envia a cada 15s enquanto a aba está visível)
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        api
          .addStudySeconds(15, toLocalDateKey(new Date()))
          .then(res => {
            setData(prev => ({
              ...prev,
              settings: res.settings,
              dailyStudyLog: res.dailyStudyLog || prev.dailyStudyLog,
            }));
          })
          .catch(() => {});
      }
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const stats = useMemo(() => computeStats(data), [data]);

  // Verifica e desbloqueia conquistas reais automaticamente
  const syncAchievements = useCallback(
    async (snapshot: BootstrapPayload, suppressStandaloneConfetti = false): Promise<UnlockedAchievementSummary[]> => {
      const nextStats = computeStats(snapshot);
      const toUnlock = ACHIEVEMENTS.filter(
        a => !snapshot.achievements[a.id] && a.evaluate(nextStats).unlocked
      ).map(a => a.id);

      if (toUnlock.length === 0) return [];

      try {
        const res = await localStore.unlockAchievements(toUnlock);
        if (res.newlyUnlocked.length > 0) {
          setData(prev => {
            const updated = { ...prev, achievements: res.achievements };
            dataRef.current = updated;
            return updated;
          });
          const unlockedSummaries: UnlockedAchievementSummary[] = [];
          for (const item of res.newlyUnlocked) {
            const def = ACHIEVEMENTS.find(a => a.id === item.achievementId);
            if (def) {
              unlockedSummaries.push({ id: def.id, title: def.title, xpBonus: def.xpBonus });
              pushToast(`Conquista desbloqueada: ${def.title}`, `+${def.xpBonus} XP bônus`, "success");
            }
          }
          if (!suppressStandaloneConfetti && unlockedSummaries.length > 0) {
            fireAchievementConfetti();
          }
          return unlockedSummaries;
        }
      } catch (err) {
        console.error("Erro ao sincronizar conquistas:", err);
      }
      return [];
    },
    [pushToast]
  );

  const openReferenceFor = useCallback((trackId: TrackId | null = null) => {
    setReferenceTrackId(trackId);
    setReferenceOpen(true);
  }, []);

  const updateSettings = useCallback(async (patch: Partial<UserSettings>) => {
    const res = await localStore.updateSettings(patch);
    setData(prev => {
      const updated = { ...prev, settings: res.settings };
      dataRef.current = updated;
      return updated;
    });
  }, []);

  const setThemePalette = useCallback(
    async (paletteId: ThemePaletteId) => {
      const palette = getPaletteById(paletteId);
      pulseThemeTransition();
      setData(prev => {
        const updated: BootstrapPayload = {
          ...prev,
          settings: {
            ...prev.settings,
            theme: palette.mode,
            themePalette: palette.id,
          },
        };
        dataRef.current = updated;
        return updated;
      });
      await updateSettings({ theme: palette.mode, themePalette: palette.id });
    },
    [pulseThemeTransition, updateSettings]
  );

  const setThemeMode = useCallback(
    async (mode: ThemeMode) => {
      let savedForMode: string | null = null;
      try {
        savedForMode = window.localStorage.getItem(`ce.lastPalette.${mode}`);
      } catch {
        savedForMode = null;
      }
      const fallback = mode === "light" ? DEFAULT_LIGHT_PALETTE : DEFAULT_DARK_PALETTE;
      const palette = resolvePalette(mode, savedForMode || fallback);
      await setThemePalette(palette.id);
    },
    [setThemePalette]
  );

  const toggleTheme = useCallback(async () => {
    const next: ThemeMode = data.settings.theme === "dark" ? "light" : "dark";
    await setThemeMode(next);
  }, [data.settings.theme, setThemeMode]);

  const completePersonalization = useCallback(
    async ({
      displayName,
      dailyGoalMinutes,
      theme,
      themePalette,
    }: {
      displayName: string;
      dailyGoalMinutes: number;
      theme?: ThemeMode;
      themePalette?: ThemePaletteId;
    }) => {
      const currentTheme = theme || dataRef.current.settings.theme;
      const resolvedPalette = resolvePalette(
        currentTheme,
        themePalette || dataRef.current.settings.themePalette
      );
      await updateSettings({
        displayName: displayName.trim() || "Estudante",
        dailyGoalMinutes,
        theme: resolvedPalette.mode,
        themePalette: resolvedPalette.id,
        profileSetupCompleted: true,
      });
      setPersonalizationOpen(false);
      if (!dataRef.current.settings.onboardingCompleted) {
        setTourOpen(true);
      }
    },
    [updateSettings]
  );

  const skipPersonalization = useCallback(async () => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, profileSetupCompleted: true },
    }));
    setPersonalizationOpen(false);
    try {
      await updateSettings({ profileSetupCompleted: true });
    } catch {
      // ignora erro isolado ao pular
    }
    if (!dataRef.current.settings.onboardingCompleted) {
      setTourOpen(true);
    }
  }, [updateSettings]);

  const startTour = useCallback(() => {
    setPersonalizationOpen(false);
    setTourOpen(true);
  }, []);

  const persistOnboardingDone = useCallback(async () => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, onboardingCompleted: true },
    }));
    try {
      await updateSettings({ onboardingCompleted: true });
    } catch {
      // ignora erro de rede isolado após fechar localmente
    }
  }, [updateSettings]);

  const closeTour = useCallback(() => {
    setTourOpen(false);
    if (!data.settings.onboardingCompleted) {
      persistOnboardingDone();
    }
  }, [data.settings.onboardingCompleted, persistOnboardingDone]);

  const completeTour = useCallback(async () => {
    setTourOpen(false);
    await persistOnboardingDone();
    pushToast(
      `Tudo pronto, ${dataRef.current.settings.displayName}!`,
      "Você pode rever o roteiro inicial quando quiser pelo botão ? no topo.",
      "info"
    );
  }, [persistOnboardingDone, pushToast]);

  const dismissCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const recordLessonResult = useCallback(
    async (opts: {
      lessonId: string;
      trackId: TrackId;
      title: string;
      completed: boolean;
      objectivesDone: string[];
      xpReward: number;
      durationMs: number;
      detail: string;
    }): Promise<CompletionOutcome> => {
      const prevSnapshot = dataRef.current;
      const prevStats = computeStats(prevSnapshot);
      const track = TRACK_MAP[opts.trackId];

      let res: Awaited<ReturnType<typeof localStore.recordLessonAttempt>>;
      try {
        res = await localStore.recordLessonAttempt({
          lessonId: opts.lessonId,
          trackId: opts.trackId,
          completed: opts.completed,
          objectivesDone: opts.objectivesDone,
          xpReward: opts.xpReward,
        });
      } catch (err) {
        pushToast(
          "Falha ao salvar seu progresso",
          "Não foi possível gravar a conclusão agora. Tente executar novamente.",
          "error"
        );
        throw err;
      }

      let historyItem: ActivityHistoryEntry | null = null;
      try {
        const histRes = await localStore.addHistoryEvent({
          eventType: opts.completed ? "lesson_completed" : "lesson_attempt",
          trackId: opts.trackId,
          itemId: opts.lessonId,
          title: opts.title,
          status: opts.completed ? "success" : "info",
          detail: opts.detail,
          xpDelta: res.xpAwarded,
          durationMs: opts.durationMs,
        });
        historyItem = histRes.item;
      } catch {
        // O progresso da aula já foi persistido com segurança
      }

      const nextSnapshot: BootstrapPayload = {
        ...dataRef.current,
        lessonProgress: res.progress,
        history: historyItem ? [historyItem, ...dataRef.current.history].slice(0, 250) : dataRef.current.history,
      };
      dataRef.current = nextSnapshot;
      setData(nextSnapshot);

      api
        .updateSettings({ activeTrackId: opts.trackId })
        .then(s => {
          setData(prev => {
            const merged = { ...prev, settings: s.settings };
            dataRef.current = merged;
            return merged;
          });
        })
        .catch(() => {});

      const unlockedAchievements = await syncAchievements(nextSnapshot, Boolean(opts.completed && res.newlyCompleted));
      const nextStats = computeStats(dataRef.current);

      const prevTrackPercent = prevStats.perTrack[opts.trackId].percent;
      const nextTrackPercent = nextStats.perTrack[opts.trackId].percent;
      const outcome: CompletionOutcome = {
        kind: "lesson",
        itemId: opts.lessonId,
        title: opts.title,
        trackId: opts.trackId,
        trackName: track.name,
        trackAccent: track.accentColor,
        newlyCompleted: res.newlyCompleted,
        xpAwarded: res.xpAwarded,
        prevTrackPercent,
        nextTrackPercent,
        trackDeltaPercent: Math.max(0, nextTrackPercent - prevTrackPercent),
        prevOverallPercent: prevStats.overallPercent,
        nextOverallPercent: nextStats.overallPercent,
        overallDeltaPercent: Math.max(0, nextStats.overallPercent - prevStats.overallPercent),
        completedActivities: nextStats.completedActivities,
        totalActivities: nextStats.totalActivities,
        newlyUnlockedAchievements: unlockedAchievements,
      };

      if (opts.completed && res.newlyCompleted) {
        fireCompletionConfetti(track.accentColor);
        setCelebration(outcome);
      }

      return outcome;
    },
    [pushToast, syncAchievements]
  );

  const recordChallengeResult = useCallback(
    async (opts: {
      challengeId: string;
      trackId: TrackId;
      title: string;
      completed: boolean;
      xpReward: number;
      durationMs: number;
      detail: string;
    }): Promise<CompletionOutcome> => {
      const prevSnapshot = dataRef.current;
      const prevStats = computeStats(prevSnapshot);
      const track = TRACK_MAP[opts.trackId];

      let res: Awaited<ReturnType<typeof localStore.recordChallengeAttempt>>;
      try {
        res = await localStore.recordChallengeAttempt({
          challengeId: opts.challengeId,
          trackId: opts.trackId,
          completed: opts.completed,
          durationMs: opts.durationMs,
          xpReward: opts.xpReward,
        });
      } catch (err) {
        pushToast(
          "Falha ao salvar seu desafio",
          "Não foi possível gravar a resolução agora. Tente executar novamente.",
          "error"
        );
        throw err;
      }

      let historyItem: ActivityHistoryEntry | null = null;
      try {
        const histRes = await localStore.addHistoryEvent({
          eventType: opts.completed ? "challenge_completed" : "challenge_attempt",
          trackId: opts.trackId,
          itemId: opts.challengeId,
          title: opts.title,
          status: opts.completed ? "success" : "info",
          detail: opts.detail,
          xpDelta: res.xpAwarded,
          durationMs: opts.durationMs,
        });
        historyItem = histRes.item;
      } catch {
        // O progresso do desafio já foi confirmado no armazenamento
      }

      const nextSnapshot: BootstrapPayload = {
        ...dataRef.current,
        challengeProgress: res.progress,
        history: historyItem ? [historyItem, ...dataRef.current.history].slice(0, 250) : dataRef.current.history,
      };
      dataRef.current = nextSnapshot;
      setData(nextSnapshot);

      const unlockedAchievements = await syncAchievements(nextSnapshot, Boolean(opts.completed && res.newlyCompleted));
      const nextStats = computeStats(dataRef.current);

      const prevTrackPercent = prevStats.perTrack[opts.trackId].percent;
      const nextTrackPercent = nextStats.perTrack[opts.trackId].percent;
      const outcome: CompletionOutcome = {
        kind: "challenge",
        itemId: opts.challengeId,
        title: opts.title,
        trackId: opts.trackId,
        trackName: track.name,
        trackAccent: track.accentColor,
        newlyCompleted: res.newlyCompleted,
        xpAwarded: res.xpAwarded,
        prevTrackPercent,
        nextTrackPercent,
        trackDeltaPercent: Math.max(0, nextTrackPercent - prevTrackPercent),
        prevOverallPercent: prevStats.overallPercent,
        nextOverallPercent: nextStats.overallPercent,
        overallDeltaPercent: Math.max(0, nextStats.overallPercent - prevStats.overallPercent),
        completedActivities: nextStats.completedActivities,
        totalActivities: nextStats.totalActivities,
        newlyUnlockedAchievements: unlockedAchievements,
      };

      if (opts.completed && res.newlyCompleted) {
        fireCompletionConfetti(track.accentColor);
        setCelebration(outcome);
      }

      return outcome;
    },
    [pushToast, syncAchievements]
  );

  const logLabActivity = useCallback(
    async (
      trackId: TrackId | null,
      title: string,
      detail: string,
      status: "success" | "error" | "info" = "info"
    ) => {
      const histRes = await localStore.addHistoryEvent({
        eventType: "lab_run",
        trackId,
        itemId: null,
        title,
        status,
        detail,
        xpDelta: 0,
        durationMs: 0,
      });
      setData(prev => ({
        ...prev,
        history: [histRes.item, ...prev.history].slice(0, 250),
      }));
    },
    []
  );

  const saveDraft = useCallback(async (key: string, code: string, stdin = "") => {
    const res = await localStore.saveDraft(key, code, stdin);
    setData(prev => ({
      ...prev,
      drafts: {
        ...prev.drafts,
        [key]: { code, stdin, updatedAt: res.updatedAt },
      },
    }));
  }, []);

  const clearDraft = useCallback(async (key: string) => {
    await localStore.deleteDraft(key);
    setData(prev => {
      const next = { ...prev.drafts };
      delete next[key];
      return { ...prev, drafts: next };
    });
  }, []);

  const saveWorkspace = useCallback(async (key: string, state: unknown) => {
    await localStore.saveWorkspace(key, state);
    setData(prev => ({
      ...prev,
      workspaces: { ...prev.workspaces, [key]: state },
    }));
  }, []);

  const resetProgress = useCallback(async () => {
    const next = await localStore.resetAll(true);
    const normalized = { ...next, dailyStudyLog: next.dailyStudyLog || {} };
    dataRef.current = normalized;
    setData(normalized);
    pushToast("Progresso reiniciado", "Seu avanço de aulas, desafios e histórico foi zerado.", "info");
  }, [pushToast]);

  const restoreFromBackup = useCallback(
    async (payload: unknown) => {
      const next = await localStore.restoreBackup(payload);
      const normalized = { ...next, dailyStudyLog: next.dailyStudyLog || {} };
      dataRef.current = normalized;
      setData(normalized);
      pushToast("Backup restaurado", "Progresso e preferências importados neste dispositivo.");
    },
    [pushToast]
  );

  return (
    <PlatformContext.Provider
      value={{
        loading,
        error,
        retryBootstrap,
        data,
        stats,
        referenceOpen,
        setReferenceOpen,
        referenceTrackId,
        openReferenceFor,
        personalizationOpen,
        completePersonalization,
        skipPersonalization,
        tourOpen,
        startTour,
        closeTour,
        completeTour,
        celebration,
        dismissCelebration,
        sidebarCollapsed,
        toggleSidebarCollapsed,
        updateSettings,
        setThemePalette,
        setThemeMode,
        toggleTheme,
        recordLessonResult,
        recordChallengeResult,
        logLabActivity,
        saveDraft,
        clearDraft,
        saveWorkspace,
        resetProgress,
        restoreFromBackup,
        pushToast,
        toasts,
        dismissToast,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export function usePlatform(): PlatformContextValue {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform deve ser usado dentro de PlatformProvider");
  return ctx;
}
