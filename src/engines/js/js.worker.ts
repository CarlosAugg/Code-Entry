import { executeJavaScriptCode } from "./jsEvaluator";
import type { CodeRunRequest } from "../../types/execution";

self.onmessage = (event: MessageEvent<CodeRunRequest>) => {
  const { code, testCases } = event.data;
  const result = executeJavaScriptCode(code, testCases || []);
  self.postMessage(result);
};
