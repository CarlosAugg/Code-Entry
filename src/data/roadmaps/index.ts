import { ALL_LESSONS } from "../lessons";
import { CHALLENGES } from "../challenges";
import type { TrackId } from "../../types/curriculum";
import type { BootstrapPayload } from "../../types/progress";
import type {
  ComputedRoadmapNodeState,
  ComputedRoadmapSummary,
  RoadmapCategory,
  RoadmapDefinition,
  RoadmapNode,
} from "../../types/roadmap";
import { BACKEND_ROADMAP } from "./backend";
import { ROADMAP_CATEGORIES, ROADMAP_CATEGORY_MAP } from "./categories";
import { FRONTEND_ROADMAP } from "./frontend";
import { FULL_STACK_ROADMAP } from "./fullStack";
import {
  CS_FOUNDATIONS_ROADMAP,
  DATA_SQL_ROADMAP,
  SYSTEMS_NETWORKS_ROADMAP,
} from "./otherAreas";

export { ROADMAP_CATEGORIES, ROADMAP_CATEGORY_MAP };

export const ROADMAPS: RoadmapDefinition[] = [
  FULL_STACK_ROADMAP,
  FRONTEND_ROADMAP,
  BACKEND_ROADMAP,
  CS_FOUNDATIONS_ROADMAP,
  DATA_SQL_ROADMAP,
  SYSTEMS_NETWORKS_ROADMAP,
];

export const ROADMAP_MAP: Record<string, RoadmapDefinition> = Object.fromEntries(
  ROADMAPS.map(rm => [rm.id, rm])
);

const TRACK_LESSON_IDS = new Map<TrackId, string[]>();
for (const lesson of ALL_LESSONS) {
  const list = TRACK_LESSON_IDS.get(lesson.trackId) || [];
  list.push(lesson.id);
  TRACK_LESSON_IDS.set(lesson.trackId, list);
}

const TRACK_CHALLENGE_IDS = new Map<TrackId, string[]>();
for (const ch of CHALLENGES) {
  const list = TRACK_CHALLENGE_IDS.get(ch.trackId) || [];
  list.push(ch.id);
  TRACK_CHALLENGE_IDS.set(ch.trackId, list);
}

function countNodeActivities(
  node: RoadmapNode,
  data: BootstrapPayload
): { linkedTotal: number; linkedCompleted: number; linkedInProgress: number } {
  const seenActivities = new Set<string>();
  let linkedTotal = 0;
  let linkedCompleted = 0;
  let linkedInProgress = 0;

  const inspectLesson = (lessonId: string) => {
    const key = `lesson:${lessonId}`;
    if (seenActivities.has(key)) return;
    seenActivities.add(key);
    linkedTotal += 1;
    const p = data.lessonProgress[lessonId];
    if (p?.completed) {
      linkedCompleted += 1;
    } else if (p && (p.attempts > 0 || p.objectivesDone.length > 0)) {
      linkedInProgress += 1;
    }
  };

  const inspectChallenge = (challengeId: string) => {
    const key = `challenge:${challengeId}`;
    if (seenActivities.has(key)) return;
    seenActivities.add(key);
    linkedTotal += 1;
    const p = data.challengeProgress[challengeId];
    if (p?.completed) {
      linkedCompleted += 1;
    } else if (p && p.attempts > 0) {
      linkedInProgress += 1;
    }
  };

  for (const link of node.studyLinks) {
    if (link.kind === "lesson") {
      inspectLesson(link.id);
    } else if (link.kind === "challenge") {
      inspectChallenge(link.id);
    } else if (link.kind === "track") {
      const tId = (link.trackId || link.id) as TrackId;
      for (const lId of TRACK_LESSON_IDS.get(tId) || []) inspectLesson(lId);
      for (const cId of TRACK_CHALLENGE_IDS.get(tId) || []) inspectChallenge(cId);
    }
  }

  return { linkedTotal, linkedCompleted, linkedInProgress };
}

export function computeRoadmapNodeState(
  node: RoadmapNode,
  data: BootstrapPayload
): ComputedRoadmapNodeState {
  const manualEntry = data.roadmapProgress?.[node.id];
  const manualStatus = manualEntry?.status || "not_started";

  // Calcula progresso real das atividades práticas ligadas a este tópico (sem inflar por mera visualização)
  const { linkedTotal, linkedCompleted, linkedInProgress } = countNodeActivities(node, data);

  let effectiveStatus = manualStatus;
  if (manualStatus === "not_started" && linkedTotal > 0) {
    if (linkedCompleted === linkedTotal) {
      effectiveStatus = "completed";
    } else if (linkedCompleted > 0 || linkedInProgress > 0) {
      effectiveStatus = "in_progress";
    }
  }

  const percent =
    effectiveStatus === "completed"
      ? 100
      : linkedTotal > 0
        ? Math.round((linkedCompleted / linkedTotal) * 100)
        : 0;

  // Pré-requisitos faltantes (não bloqueiam inspeção, mas orientam a ordem sugerida)
  const roadmap = ROADMAP_MAP[node.roadmapId];
  const nodeById = roadmap
    ? new Map(roadmap.nodes.map(item => [item.id, item]))
    : new Map<string, RoadmapNode>();

  const missingPrereqIds: string[] = [];
  for (const preId of node.prerequisites) {
    const preManual = data.roadmapProgress?.[preId]?.status;
    if (preManual === "completed" || preManual === "skipped") continue;
    const preNode = nodeById.get(preId);
    if (!preNode) continue;
    const preCounts = countNodeActivities(preNode, data);
    const preResolvedManual = preManual || "not_started";
    const preAutoDone =
      preResolvedManual === "not_started" &&
      preCounts.linkedTotal > 0 &&
      preCounts.linkedCompleted === preCounts.linkedTotal;
    if (!preAutoDone) {
      missingPrereqIds.push(preId);
    }
  }

  return {
    effectiveStatus,
    manualStatus,
    linkedTotal,
    linkedCompleted,
    percent,
    isUnlocked: missingPrereqIds.length === 0,
    missingPrereqIds,
  };
}

export function computeRoadmapSummary(
  roadmap: RoadmapDefinition,
  data: BootstrapPayload
): ComputedRoadmapSummary {
  let completedNodes = 0;
  let inProgressNodes = 0;
  let requiredCount = 0;
  let recommendedCount = 0;
  let optionalCount = 0;
  let checkpointCount = 0;

  const uniqueLessons = new Set<string>();
  const uniqueChallenges = new Set<string>();

  for (const node of roadmap.nodes) {
    const state = computeRoadmapNodeState(node, data);
    if (state.effectiveStatus === "completed") completedNodes += 1;
    else if (state.effectiveStatus === "in_progress") inProgressNodes += 1;

    if (node.priority === "required") requiredCount += 1;
    else if (node.priority === "recommended") recommendedCount += 1;
    else if (node.priority === "optional") optionalCount += 1;

    if (node.kind === "checkpoint" || node.kind === "project") {
      checkpointCount += 1;
    }

    for (const link of node.studyLinks) {
      if (link.kind === "lesson") uniqueLessons.add(link.id);
      else if (link.kind === "challenge") uniqueChallenges.add(link.id);
      else if (link.kind === "track") {
        const tId = (link.trackId || link.id) as TrackId;
        for (const id of TRACK_LESSON_IDS.get(tId) || []) uniqueLessons.add(id);
        for (const id of TRACK_CHALLENGE_IDS.get(tId) || []) uniqueChallenges.add(id);
      }
    }
  }

  let linkedActivitiesDone = 0;
  for (const id of uniqueLessons) {
    if (data.lessonProgress[id]?.completed) linkedActivitiesDone += 1;
  }
  for (const id of uniqueChallenges) {
    if (data.challengeProgress[id]?.completed) linkedActivitiesDone += 1;
  }

  const linkedActivitiesTotal = uniqueLessons.size + uniqueChallenges.size;
  const totalNodes = roadmap.nodes.length;
  const percent = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  return {
    totalNodes,
    completedNodes,
    inProgressNodes,
    requiredCount,
    recommendedCount,
    optionalCount,
    checkpointCount,
    linkedActivitiesTotal,
    linkedActivitiesDone,
    percent,
  };
}

export function getRoadmapsForTrack(trackId: TrackId): RoadmapDefinition[] {
  return ROADMAPS.filter(rm => rm.relatedTrackIds.includes(trackId));
}

export function getRoadmapNodesForLesson(
  lessonId: string,
  trackId: TrackId
): { roadmap: RoadmapDefinition; node: RoadmapNode }[] {
  const direct: { roadmap: RoadmapDefinition; node: RoadmapNode }[] = [];
  const byTrack: { roadmap: RoadmapDefinition; node: RoadmapNode }[] = [];

  for (const rm of ROADMAPS) {
    for (const node of rm.nodes) {
      const hasDirectLesson = node.studyLinks.some(
        l => l.kind === "lesson" && l.id === lessonId
      );
      if (hasDirectLesson) {
        direct.push({ roadmap: rm, node });
      } else if (
        node.studyLinks.some(l => l.kind === "track" && (l.trackId || l.id) === trackId)
      ) {
        byTrack.push({ roadmap: rm, node });
      }
    }
  }

  return direct.length > 0 ? direct : byTrack.slice(0, 4);
}

export function getRoadmapNodesForChallenge(
  challengeId: string,
  trackId: TrackId
): { roadmap: RoadmapDefinition; node: RoadmapNode }[] {
  const direct: { roadmap: RoadmapDefinition; node: RoadmapNode }[] = [];
  const byTrack: { roadmap: RoadmapDefinition; node: RoadmapNode }[] = [];

  for (const rm of ROADMAPS) {
    for (const node of rm.nodes) {
      if (node.studyLinks.some(l => l.kind === "challenge" && l.id === challengeId)) {
        direct.push({ roadmap: rm, node });
      } else if (
        node.studyLinks.some(l => l.kind === "track" && (l.trackId || l.id) === trackId)
      ) {
        byTrack.push({ roadmap: rm, node });
      }
    }
  }

  return direct.length > 0 ? direct : byTrack.slice(0, 4);
}

export interface RoadmapProjectItem {
  node: RoadmapNode;
  roadmap: RoadmapDefinition;
  category: RoadmapCategory | undefined;
}

export function getAllRoadmapProjects(): RoadmapProjectItem[] {
  const items: RoadmapProjectItem[] = [];
  for (const roadmap of ROADMAPS) {
    const category = ROADMAP_CATEGORY_MAP[roadmap.categoryId];
    for (const node of roadmap.nodes) {
      if (node.kind === "project" || node.kind === "checkpoint") {
        items.push({ node, roadmap, category });
      }
    }
  }
  return items.sort((a, b) => {
    if (a.node.kind === b.node.kind) return 0;
    return a.node.kind === "project" ? -1 : 1;
  });
}
