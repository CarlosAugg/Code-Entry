import type { TrackId } from "./curriculum";
import type { RoadmapTopicStatus } from "./progress";

export type RoadmapCategoryId = string;

export type RoadmapCategoryIcon =
  | "layout"
  | "server"
  | "layers"
  | "terminal"
  | "database"
  | "cpu";

export interface RoadmapCategory {
  id: RoadmapCategoryId;
  label: string;
  shortLabel: string;
  description: string;
  icon: RoadmapCategoryIcon;
  accentColor: string;
}

export type RoadmapKind = "role" | "skill" | "foundation";

export type RoadmapPriority = "required" | "recommended" | "optional";

export type RoadmapNodeKind =
  | "foundation"
  | "concept"
  | "technology"
  | "alternative-group"
  | "checkpoint"
  | "project";

export interface RoadmapTopicAlternative {
  id: string;
  name: string;
  summary: string;
  priority?: RoadmapPriority;
  whenToChoose: string;
  glossaryId?: string;
}

export interface RoadmapStudyLink {
  kind: "track" | "lesson" | "challenge" | "lab";
  id: string;
  trackId?: TrackId;
  label: string;
  description?: string;
}

export interface RoadmapNode {
  id: string;
  roadmapId: string;
  stageId: string;
  title: string;
  shortTitle?: string;
  kind: RoadmapNodeKind;
  priority?: RoadmapPriority;
  summary: string;
  whyItMatters: string;
  keyConcepts: string[];
  glossaryIds?: string[];
  prerequisites: string[];
  nextIds: string[];
  alternatives?: RoadmapTopicAlternative[];
  projectIdeas?: string[];
  studyLinks: RoadmapStudyLink[];
  relatedRoadmapIds?: string[];
  column?: 0 | 1 | 2;
}

export interface RoadmapStage {
  id: string;
  order: number;
  label: string;
  title: string;
  subtitle: string;
}

export interface RoadmapPathway {
  id: string;
  label: string;
  audience: string;
  description: string;
  nodeIds: string[];
}

export interface RoadmapDefinition {
  id: string;
  title: string;
  shortTitle: string;
  categoryId: RoadmapCategoryId;
  kind: RoadmapKind;
  scopeLabel: string;
  accentColor: string;
  accentSecondary: string;
  accentSoft: string;
  accentBorder: string;
  summary: string;
  audience: string;
  featured?: boolean;
  relatedTrackIds: TrackId[];
  relatedRoadmapIds: string[];
  pathways: RoadmapPathway[];
  stages: RoadmapStage[];
  nodes: RoadmapNode[];
}

export interface ComputedRoadmapNodeState {
  effectiveStatus: RoadmapTopicStatus;
  manualStatus: RoadmapTopicStatus;
  linkedTotal: number;
  linkedCompleted: number;
  percent: number;
  isUnlocked: boolean;
  missingPrereqIds: string[];
}

export interface ComputedRoadmapSummary {
  totalNodes: number;
  completedNodes: number;
  inProgressNodes: number;
  requiredCount: number;
  recommendedCount: number;
  optionalCount: number;
  checkpointCount: number;
  linkedActivitiesTotal: number;
  linkedActivitiesDone: number;
  percent: number;
}
