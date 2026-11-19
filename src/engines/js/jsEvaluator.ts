import type { TestCaseResult, TestCaseSpec, VariableEntry } from "../../types/curriculum";
import type { CodeRunResponse } from "../../types/execution";

const BLOCKED_GLOBALS = [
  "window",
  "globalThis",
  "self",
  "document",
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "importScripts",
  "Function",
  "postMessage",
  "close",
  "navigator",
  "location",
  "process",
  "require",
];

function formatJsValue(value: unknown, depth = 0): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return depth > 0 ? JSON.stringify(value) : value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "function") return `[Função ${(value as { name?: string }).name || "anônima"}]`;
  if (Array.isArray(value)) {
    if (depth > 2) return "[...]";
    return `[${value.map(v => formatJsValue(v, depth + 1)).join(", ")}]`;
  }
  if (typeof value === "object") {
    if (depth > 2) return "{...}";
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([k, v]) => `${k}: ${formatJsValue(v, depth + 1)}`
    );
    return `{ ${entries.join(", ")} }`;
  }
  return String(value);
}

function detectJsType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return `array (${value.length})`;
  if (typeof value === "function") return "function";
  if (typeof value === "number") return Number.isInteger(value) ? "number (int)" : "number (float)";
  return typeof value;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, idx) => deepEqual(item, b[idx]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a as Record<string, unknown>);
    const keysB = Object.keys(b as Record<string, unknown>);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(k =>
      deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
    );
  }
  return false;
}

function injectLoopGuard(source: string): string {
  let out = "";
  let i = 0;
  let quote: string | null = null;

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (quote) {
      out += ch;
      if (ch === "\\" && i + 1 < source.length) {
        out += source[i + 1];
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i++;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      out += ch;
      i++;
      continue;
    }

    if (ch === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") {
        out += source[i++];
      }
      continue;
    }

    if (ch === "/" && next === "*") {
      out += "/*";
      i += 2;
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) {
        out += source[i++];
      }
      if (i < source.length) {
        out += "*/";
        i += 2;
      }
      continue;
    }

    // Detecta cabeçalhos for(...) / while(...) e injeta __tick() dentro do bloco {
    const slice = source.slice(i);
    const loopMatch = slice.match(/^(?:for|while)\s*\(/);
    const isWordBoundary = i === 0 || !/[A-Za-z0-9_$]/.test(source[i - 1]);
    if (loopMatch && isWordBoundary) {
      let j = i + loopMatch[0].length - 1;
      let depth = 0;
      let q: string | null = null;
      for (; j < source.length; j++) {
        const c = source[j];
        if (q) {
          if (c === "\\" && j + 1 < source.length) {
            j++;
            continue;
          }
          if (c === q) q = null;
          continue;
        }
        if (c === '"' || c === "'" || c === "`") {
          q = c;
          continue;
        }
        if (c === "(") depth++;
        else if (c === ")") {
          depth--;
          if (depth === 0) break;
        }
      }
      if (depth === 0) {
        let k = j + 1;
        while (k < source.length && /\s/.test(source[k])) k++;
        if (source[k] === "{") {
          out += source.slice(i, k + 1) + " __tick();";
          i = k + 1;
          continue;
        }
      }
    }

    out += ch;
    i++;
  }

  return out;
}

function collectDeclaredIdentifiers(source: string): string[] {
  const cleaned = source
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/`(?:\\.|[^`])*`|"(?:\\.|[^"\n])*"|'(?:\\.|[^'\n])*'/g, '""');

  const names = new Set<string>();

  for (const m of cleaned.matchAll(/\b(?:let|const|var)\s+([A-Za-z_$][\w$]*)\b/g)) {
    names.add(m[1]);
  }
  for (const m of cleaned.matchAll(/\b(?:let|const|var)\s*\{([^}]+)\}/g)) {
    for (const part of m[1].split(",")) {
      const seg = part.includes(":") ? part.split(":")[1] : part;
      const cleanName = seg.split("=")[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(cleanName)) names.add(cleanName);
    }
  }
  for (const m of cleaned.matchAll(/\b(?:let|const|var)\s*\[([^\]]+)\]/g)) {
    for (const part of m[1].split(",")) {
      const cleanName = part.replace(/^\.\.\./, "").split("=")[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(cleanName)) names.add(cleanName);
    }
  }
  for (const m of cleaned.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)) {
    names.add(m[1]);
  }

  return Array.from(names);
}

export function executeJavaScriptCode(
  code: string,
  testCases: TestCaseSpec[] = []
): CodeRunResponse {
  const startedAt = performance.now();
  const source = String(code ?? "");
  const output: string[] = [];

  if (!source.trim()) {
    return {
      success: false,
      output: [],
      outputText: "",
      error: "Escreva algum código JavaScript antes de executar.",
      variables: [],
      scope: {},
      varTypes: {},
      testResults: [],
      durationMs: 0,
    };
  }

  const guarded = injectLoopGuard(source);
  const declaredNames = collectDeclaredIdentifiers(source);

  const safeConsole = {
    log: (...args: unknown[]) => {
      output.push(args.map(a => formatJsValue(a, 0)).join(" "));
    },
    info: (...args: unknown[]) => {
      output.push(args.map(a => formatJsValue(a, 0)).join(" "));
    },
    warn: (...args: unknown[]) => {
      output.push("[aviso] " + args.map(a => formatJsValue(a, 0)).join(" "));
    },
    error: (...args: unknown[]) => {
      output.push("[erro] " + args.map(a => formatJsValue(a, 0)).join(" "));
    },
  };

  let ticks = 0;
  const __tick = () => {
    ticks++;
    if (ticks > 50000) {
      throw new Error("Erro de execução: laço ultrapassou 50.000 iterações (loop infinito protegido).");
    }
  };

  const captureLines = declaredNames
    .map(name => `try { __scope[${JSON.stringify(name)}] = ${name}; } catch {}`)
    .join("\n");

  const shadowDecls = BLOCKED_GLOBALS.map(g => `const ${g} = undefined;`).join("\n");

  const testCasesLiteral = JSON.stringify(
    testCases.map(tc => ({ id: tc.id, expression: tc.expression || "" }))
  );

  const wrapperBody = `
    "use strict";
    ${shadowDecls}
    const __scope = Object.create(null);
    const __testOutputs = [];
    ${guarded}
    ${captureLines}
    for (const __tc of ${testCasesLiteral}) {
      if (__tc.expression) {
        try {
          const __val = eval(__tc.expression);
          __testOutputs.push({ id: __tc.id, ok: true, value: __val });
        } catch (__err) {
          __testOutputs.push({ id: __tc.id, ok: false, error: __err?.message || String(__err) });
        }
      } else {
        __testOutputs.push({ id: __tc.id, ok: true, value: undefined });
      }
    }
    return { scope: __scope, testOutputs: __testOutputs };
  `;

  try {
    const fn = new Function("console", "__tick", wrapperBody);
    const execResult = fn(safeConsole, __tick) as {
      scope: Record<string, unknown>;
      testOutputs: { id: string; ok: boolean; value?: unknown; error?: string }[];
    };

    const rawScope = execResult?.scope || {};
    const variables: VariableEntry[] = [];
    const cleanScope: Record<string, unknown> = {};
    const varTypes: Record<string, string> = {};

    for (const [k, v] of Object.entries(rawScope)) {
      varTypes[k] = detectJsType(v);
      variables.push({
        name: k,
        value: formatJsValue(v, 1),
        type: varTypes[k],
      });
      if (typeof v === "function") {
        cleanScope[k] = `[Function ${v.name || k}]`;
      } else {
        try {
          cleanScope[k] = JSON.parse(JSON.stringify(v));
        } catch {
          cleanScope[k] = String(v);
        }
      }
    }

    const outputText = output.join("\n");
    const testResults: TestCaseResult[] = testCases.map(tc => {
      const ran = execResult.testOutputs.find(t => t.id === tc.id);
      if (ran && !ran.ok) {
        return {
          id: tc.id,
          label: tc.label,
          passed: false,
          error: ran.error,
        };
      }
      if ("assertReturnEquals" in tc && tc.assertReturnEquals !== undefined) {
        const passed = deepEqual(ran?.value, tc.assertReturnEquals);
        return {
          id: tc.id,
          label: tc.label,
          passed,
          expected: formatJsValue(tc.assertReturnEquals, 1),
          actual: formatJsValue(ran?.value, 1),
        };
      }
      if (tc.assertOutputIncludes !== undefined) {
        const passed = outputText.includes(tc.assertOutputIncludes);
        return {
          id: tc.id,
          label: tc.label,
          passed,
          expected: `conter "${tc.assertOutputIncludes}"`,
          actual: outputText || "(sem saída)",
        };
      }
      if (tc.assertOutputEquals !== undefined) {
        const passed = outputText.trim() === tc.assertOutputEquals.trim();
        return {
          id: tc.id,
          label: tc.label,
          passed,
          expected: tc.assertOutputEquals.trim(),
          actual: outputText.trim(),
        };
      }
      return { id: tc.id, label: tc.label, passed: Boolean(ran?.ok) };
    });

    return {
      success: true,
      output,
      outputText,
      variables,
      scope: cleanScope,
      varTypes,
      testResults,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      output,
      outputText: output.join("\n"),
      error: msg,
      variables: [],
      scope: {},
      varTypes: {},
      testResults: testCases.map(tc => ({
        id: tc.id,
        label: tc.label,
        passed: false,
        error: msg,
      })),
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
    };
  }
}
