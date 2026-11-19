export type TrackId = "logic" | "cpp" | "js" | "python" | "linux" | "networks" | "database";

export type DifficultyLevel =
  | "Muito fácil"
  | "Fácil"
  | "Intermediário"
  | "Difícil"
  | "Avançado";

export type WorkbenchKind = "code" | "linux" | "sql" | "networks";

export type NetworkWorkbenchMode = "osi" | "subnet" | "topology";

export interface TheoryBlock {
  kind: "text" | "callout" | "table" | "code";
  title?: string;
  content?: string;
  tone?: "info" | "tip" | "warning";
  headers?: string[];
  rows?: string[][];
  language?: string;
  code?: string;
}

export interface LessonExample {
  title: string;
  description: string;
  code: string;
  output?: string;
}

export interface VariableEntry {
  name: string;
  value: string;
  type: string;
}

export interface SqlResultData {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  changes: number;
  executionTimeMs: number;
}

export interface LinuxSnapshotData {
  cwd: string;
  lastCommand: string;
  stages: { command: string; args: string[]; flags: string[] }[];
  filesCreatedOrModified?: string[];
  exists: (path: string) => boolean;
  read: (path: string) => string | null;
  isExecutable: (path: string) => boolean;
}

export interface NetworkEvaluationState {
  mode: NetworkWorkbenchMode;
  subnetValidation?: {
    ipCidr: string;
    networkAddress: string;
    broadcastAddress: string;
    firstHost: string;
    lastHost: string;
    usableHosts: number;
    subnetMask: string;
    isValidUserAttempt: boolean;
    checkedCount: number;
  };
  topologyCommands?: string[];
  lastPingSuccess?: boolean;
  lastPingTarget?: string;
  lastAclBlocked?: boolean;
  packetsDelivered?: number;
  osiScore?: number;
  osiCompleted?: boolean;
  activeRoutesCount?: number;
  aclRulesCount?: number;
}

export interface TestCaseResult {
  id: string;
  label: string;
  passed: boolean;
  expected?: string;
  actual?: string;
  error?: string;
}

export interface EvaluationContext {
  trackId: TrackId;
  code: string;
  stdin: string;
  success: boolean;
  output: string[];
  outputText: string;
  error?: string;
  variables: VariableEntry[];
  scope: Record<string, unknown>;
  varTypes: Record<string, string>;
  testResults: TestCaseResult[];
  sql?: SqlResultData;
  linux?: LinuxSnapshotData;
  network?: NetworkEvaluationState;
}

export interface ObjectiveRule {
  id: string;
  label: string;
  test: (ctx: EvaluationContext) => boolean;
}

export interface TestCaseSpec {
  id: string;
  label: string;
  stdin?: string;
  /** Código ou chamada extra executada no mesmo escopo para validar funções */
  expression?: string;
  assertOutputIncludes?: string;
  assertOutputEquals?: string;
  assertReturnEquals?: unknown;
}

export interface Lesson {
  id: string;
  trackId: TrackId;
  moduleId: string;
  moduleTitle: string;
  order: number;
  title: string;
  subtitle: string;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  xp: number;
  workbench: WorkbenchKind;
  summary: string;
  theoryBlocks: TheoryBlock[];
  examples: LessonExample[];
  prompt: string;
  starterCode: string;
  requiresStdin?: boolean;
  defaultStdin?: string;
  sqlDatasetId?: "ecommerce" | "empresa";
  networkMode?: NetworkWorkbenchMode;
  networkPreset?: Record<string, unknown>;
  quickCommands?: { label: string; command: string }[];
  hints: [string, string, string];
  objectives: ObjectiveRule[];
  testCases?: TestCaseSpec[];
  referenceSolution: string;
}

export interface Challenge {
  id: string;
  trackId: TrackId;
  title: string;
  topic: string;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  xp: number;
  workbench: WorkbenchKind;
  summary: string;
  prompt: string;
  starterCode: string;
  requiresStdin?: boolean;
  defaultStdin?: string;
  sqlDatasetId?: "ecommerce" | "empresa";
  networkMode?: NetworkWorkbenchMode;
  networkPreset?: Record<string, unknown>;
  hints: [string, string, string];
  objectives: ObjectiveRule[];
  testCases?: TestCaseSpec[];
  referenceSolution: string;
}

export interface TrackMeta {
  id: TrackId;
  name: string;
  shortName: string;
  category: "Programação" | "Sistemas & Infraestrutura" | "Dados & Redes";
  level: string;
  tagline: string;
  description: string;
  iconPath?: string;
  accentColor: string;
  accentSecondary: string;
  accentSoft: string;
  accentBorder: string;
  accentGlow: string;
  darkTextOnAccent?: boolean;
  workbench: WorkbenchKind;
  prerequisites?: string[];
  recommendedNext?: TrackId[];
  outcomes: string[];
}
