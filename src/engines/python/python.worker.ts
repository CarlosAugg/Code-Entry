import { executePythonCode } from "./pythonInterpreter";
import type { CodeRunRequest } from "../../types/execution";

self.onmessage = (event: MessageEvent<CodeRunRequest>) => {
  const { code, stdin, testCases } = event.data;
  const result = executePythonCode(code, stdin || "", testCases || []);
  self.postMessage(result);
};
