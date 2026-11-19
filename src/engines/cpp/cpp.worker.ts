import { executeCppCode } from "./cppCompiler";
import type { CodeRunRequest } from "../../types/execution";

self.onmessage = (event: MessageEvent<CodeRunRequest>) => {
  const { code, stdin, testCases } = event.data;
  const result = executeCppCode(code, stdin || "", testCases || []);
  self.postMessage(result);
};
