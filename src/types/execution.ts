import type {
  SqlResultData,
  TestCaseResult,
  TestCaseSpec,
  VariableEntry,
} from "./curriculum";

export interface CodeRunRequest {
  code: string;
  stdin?: string;
  testCases?: TestCaseSpec[];
}

export interface CodeRunResponse {
  success: boolean;
  output: string[];
  outputText: string;
  error?: string;
  variables: VariableEntry[];
  scope: Record<string, unknown>;
  varTypes: Record<string, string>;
  testResults: TestCaseResult[];
  durationMs: number;
}

export interface ExecutionHistoryEntry {
  id: string;
  timestamp: string;
  success: boolean;
  summary: string;
  durationMs: number;
}

export interface SqlTableColumn {
  name: string;
  type: string;
  notnull: boolean;
  pk: boolean;
  fk: string | null;
}

export interface SqlTableSchema {
  name: string;
  rowCount: number;
  columns: SqlTableColumn[];
}

export interface SqlExecuteResponse extends SqlResultData {
  success: boolean;
  error?: string;
  truncated?: boolean;
  messages?: string[];
  schema: SqlTableSchema[];
}
