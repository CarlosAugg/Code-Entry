import type { TestCaseSpec } from "../types/curriculum";
import type { CodeRunResponse } from "../types/execution";

const WORKER_TIMEOUT_MS = 2500;

function createWorker(lang: "logic" | "js" | "python" | "cpp"): Worker {
  switch (lang) {
    case "logic":
      return new Worker(new URL("./logic/logic.worker.ts", import.meta.url), { type: "module" });
    case "js":
      return new Worker(new URL("./js/js.worker.ts", import.meta.url), { type: "module" });
    case "python":
      return new Worker(new URL("./python/python.worker.ts", import.meta.url), { type: "module" });
    case "cpp":
      return new Worker(new URL("./cpp/cpp.worker.ts", import.meta.url), { type: "module" });
  }
}

export function runCodeInWorker(
  lang: "logic" | "js" | "python" | "cpp",
  code: string,
  stdin = "",
  testCases: TestCaseSpec[] = []
): Promise<CodeRunResponse> {
  return new Promise(resolve => {
    let worker: Worker;
    try {
      worker = createWorker(lang);
    } catch (err) {
      resolve({
        success: false,
        output: [],
        outputText: "",
        error: `Falha ao inicializar ambiente isolado (${lang}): ${err instanceof Error ? err.message : String(err)}`,
        variables: [],
        scope: {},
        varTypes: {},
        testResults: [],
        durationMs: 0,
      });
      return;
    }

    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      worker.terminate();
      resolve({
        success: false,
        output: [],
        outputText: "",
        error: `Tempo limite excedido (${WORKER_TIMEOUT_MS}ms): execução interrompida por segurança (possível loop infinito).`,
        variables: [],
        scope: {},
        varTypes: {},
        testResults: testCases.map(tc => ({
          id: tc.id,
          label: tc.label,
          passed: false,
          error: "Timeout de execução",
        })),
        durationMs: WORKER_TIMEOUT_MS,
      });
    }, WORKER_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<CodeRunResponse>) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      worker.terminate();
      resolve(event.data);
    };

    worker.onerror = (err: ErrorEvent) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      worker.terminate();
      resolve({
        success: false,
        output: [],
        outputText: "",
        error: err.message || "Erro inesperado no Worker de execução.",
        variables: [],
        scope: {},
        varTypes: {},
        testResults: [],
        durationMs: 0,
      });
    };

    worker.postMessage({ code, stdin, testCases });
  });
}
