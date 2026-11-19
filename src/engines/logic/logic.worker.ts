import { executeLogicCode } from "./logicEvaluator";
import type { CodeRunRequest } from "../../types/execution";

self.onmessage = (event: MessageEvent<CodeRunRequest>) => {
  const { code, testCases } = event.data;
  const result = executeLogicCode(code, testCases || []);
  self.postMessage(result);
};
