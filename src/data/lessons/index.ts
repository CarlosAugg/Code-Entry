import type { Lesson, TrackId } from "../../types/curriculum";
import { LOGIC_LESSONS } from "./logic";
import { CPP_LESSONS } from "./cpp";
import { JS_LESSONS } from "./js";
import { PYTHON_LESSONS } from "./python";
import { LINUX_LESSONS } from "./linux";
import { NETWORK_LESSONS } from "./networks";
import { DATABASE_LESSONS } from "./database";

export const ALL_LESSONS: Lesson[] = [
  ...LOGIC_LESSONS,
  ...CPP_LESSONS,
  ...JS_LESSONS,
  ...PYTHON_LESSONS,
  ...LINUX_LESSONS,
  ...NETWORK_LESSONS,
  ...DATABASE_LESSONS,
];

export const LESSONS_BY_TRACK: Record<TrackId, Lesson[]> = {
  logic: LOGIC_LESSONS,
  cpp: CPP_LESSONS,
  js: JS_LESSONS,
  python: PYTHON_LESSONS,
  linux: LINUX_LESSONS,
  networks: NETWORK_LESSONS,
  database: DATABASE_LESSONS,
};

export const LESSON_MAP: Record<string, Lesson> = ALL_LESSONS.reduce(
  (acc, lesson) => {
    acc[lesson.id] = lesson;
    return acc;
  },
  {} as Record<string, Lesson>
);
