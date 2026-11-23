import type { TheaterLessonScript } from "../../types/theater";

const THEATER_LESSON_IDS = new Set<string>([
  "logic-01",
  "logic-02",
  "logic-03",
  "logic-04",
  "logic-05",
  "logic-06",
  "logic-07",
  "logic-08",
  "logic-09",
  "logic-10",
]);

const scriptCache = new Map<string, TheaterLessonScript>();

export function hasInteractiveTheater(lessonId: string): boolean {
  return THEATER_LESSON_IDS.has(lessonId);
}

export async function loadTheaterScript(lessonId: string): Promise<TheaterLessonScript | null> {
  if (!THEATER_LESSON_IDS.has(lessonId)) return null;
  const cached = scriptCache.get(lessonId);
  if (cached) return cached;

  if (lessonId.startsWith("logic-")) {
    const mod = await import("./logic");
    for (const [id, script] of Object.entries(mod.LOGIC_THEATER_SCRIPTS)) {
      scriptCache.set(id, script);
    }
  }

  return scriptCache.get(lessonId) ?? null;
}
