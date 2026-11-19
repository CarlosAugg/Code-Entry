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

const KEYWORD_MAP: Record<string, string> = {
  verdadeiro: "true",
  falso: "false",
  nulo: "null",
  e: "&&",
  ou: "||",
  nao: "!",
  não: "!",
  escreva: "__escreva",
  escreval: "__escreva",
  mostrar: "__escreva",
  imprima: "__escreva",
  tamanho: "__tamanho",
  comprimento: "__tamanho",
  raiz: "Math.sqrt",
  potencia: "Math.pow",
  potência: "Math.pow",
  arredondar: "Math.round",
  funcao: "function",
  função: "function",
  retorne: "return",
  retorna: "return",
  senao: "else",
  senão: "else",
  se: "if",
  enquanto: "while",
  para: "for",
  mod: "%",
};

const TYPE_DECL_MAP: Record<string, string> = {
  inteiro: "let",
  real: "let",
  texto: "let",
  cadeia: "let",
  logico: "let",
  lógico: "let",
  booleano: "let",
  caractere: "let",
  seja: "let",
  constante: "const",
};

function formatLogicValue(value: unknown, depth = 0): string {
  if (value === null) return "nulo";
  if (value === undefined) return "indefinido";
  if (typeof value === "boolean") return value ? "verdadeiro" : "falso";
  if (typeof value === "string") return depth > 0 ? JSON.stringify(value) : value;
  if (typeof value === "number") return String(value);
  if (typeof value === "function") return `[Função ${(value as { name?: string }).name || "anônima"}]`;
  if (Array.isArray(value)) {
    if (depth > 2) return "[...]";
    return `[${value.map(v => formatLogicValue(v, depth + 1)).join(", ")}]`;
  }
  if (typeof value === "object") {
    if (depth > 2) return "{...}";
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([k, v]) => `${k}: ${formatLogicValue(v, depth + 1)}`
    );
    return `{ ${entries.join(", ")} }`;
  }
  return String(value);
}

function detectLogicType(value: unknown): string {
  if (value === null) return "nulo";
  if (Array.isArray(value)) return `lista (${value.length})`;
  if (typeof value === "function") return "função";
  if (typeof value === "boolean") return "lógico";
  if (typeof value === "number") return Number.isInteger(value) ? "inteiro" : "decimal";
  if (typeof value === "string") return "texto";
  if (typeof value === "object") return "registro";
  return typeof value;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a as Record<string, unknown>);
    const kb = Object.keys(b as Record<string, unknown>);
    return (
      ka.length === kb.length &&
      ka.every(k => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
    );
  }
  return false;
}

function preprocessPortugolBlocks(source: string): string {
  return source
    .split(/\r?\n/)
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//")) return line;

      let m: RegExpMatchArray | null;
      if ((m = trimmed.match(/^sen[aã]o\s+se\s+(.+?)\s+ent[aã]o\s*$/i))) {
        return `} else if (${m[1]}) {`;
      }
      if (/^sen[aã]o\s*$/i.test(trimmed)) {
        return "} else {";
      }
      if ((m = trimmed.match(/^se\s+(.+?)\s+ent[aã]o\s*$/i))) {
        return `if (${m[1]}) {`;
      }
      if (/^fim_?se\s*$/i.test(trimmed)) {
        return "}";
      }
      if ((m = trimmed.match(/^enquanto\s+(.+?)\s+fa[cç]a\s*$/i))) {
        return `while (${m[1]}) {`;
      }
      if (/^fim_?enquanto\s*$/i.test(trimmed)) {
        return "}";
      }
      if (
        (m = trimmed.match(
          /^para\s+([A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*)\s+de\s+(.+?)\s+at[eé]\s+(.+?)(?:\s+passo\s+(.+?))?\s+fa[cç]a\s*$/i
        ))
      ) {
        const v = m[1];
        const start = m[2];
        const end = m[3];
        const step = m[4] || "1";
        return `for (let ${v} = (${start}), __step_${v} = (${step}); __step_${v} >= 0 ? ${v} <= (${end}) : ${v} >= (${end}); ${v} += __step_${v}) {`;
      }
      if (/^fim_?para\s*$/i.test(trimmed)) {
        return "}";
      }
      if ((m = trimmed.match(/^func[aã]o\s+([A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*)\s*\(([^)]*)\)\s*$/i))) {
        return `function ${m[1]}(${m[2]}) {`;
      }
      if (/^fim_?func[aã]o\s*$/i.test(trimmed)) {
        return "}";
      }
      return line;
    })
    .join("\n");
}

interface LogicToken {
  type: "ws" | "comment" | "string" | "number" | "ident" | "op" | "punct";
  value: string;
}

function tokenizeLogic(source: string): LogicToken[] {
  const tokens: LogicToken[] = [];
  let i = 0;

  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) {
      let ws = "";
      while (i < source.length && /\s/.test(source[i])) ws += source[i++];
      tokens.push({ type: "ws", value: ws });
      continue;
    }
    if (ch === "/" && source[i + 1] === "/") {
      let cmt = "";
      while (i < source.length && source[i] !== "\n") cmt += source[i++];
      tokens.push({ type: "comment", value: cmt });
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      let cmt = "/*";
      i += 2;
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) cmt += source[i++];
      if (i < source.length) {
        cmt += "*/";
        i += 2;
      }
      tokens.push({ type: "comment", value: cmt });
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      const q = ch;
      let str = q;
      i++;
      while (i < source.length) {
        const c = source[i++];
        str += c;
        if (c === "\\" && i < source.length) {
          str += source[i++];
          continue;
        }
        if (c === q) break;
      }
      tokens.push({ type: "string", value: str });
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let num = "";
      while (i < source.length && /[0-9._]/.test(source[i])) num += source[i++];
      tokens.push({ type: "number", value: num });
      continue;
    }
    if (/[A-Za-zÀ-ÿ_]/.test(ch)) {
      let ident = "";
      while (i < source.length && /[A-Za-zÀ-ÿ0-9_]/.test(source[i])) ident += source[i++];
      tokens.push({ type: "ident", value: ident });
      continue;
    }
    const tri = source.slice(i, i + 3);
    if (tri === "===" || tri === "!==") {
      tokens.push({ type: "op", value: tri });
      i += 3;
      continue;
    }
    const pair = source.slice(i, i + 2);
    if (["==", "!=", "<=", ">=", "&&", "||", "++", "--", "+=", "-=", "*=", "/=", "%=", "=>"].includes(pair)) {
      tokens.push({ type: "op", value: pair });
      i += 2;
      continue;
    }
    tokens.push({ type: "punct", value: ch });
    i++;
  }
  return tokens;
}

function transpileLogic(source: string): { code: string; declaredNames: string[] } {
  const normalized = preprocessPortugolBlocks(source);
  const tokens = tokenizeLogic(normalized);

  const mapped: LogicToken[] = [];
  let prevSig: LogicToken | null = null;
  for (let ti = 0; ti < tokens.length; ti++) {
    const tok = tokens[ti];
    if (tok.type === "ident") {
      const lower = tok.value.toLowerCase();
      const isMember = prevSig && prevSig.value === ".";
      if (!isMember && Object.prototype.hasOwnProperty.call(KEYWORD_MAP, lower)) {
        const rep = KEYWORD_MAP[lower];
        const newTok: LogicToken = {
          type: /^[A-Za-z_]/.test(rep) ? "ident" : "op",
          value: rep,
        };
        mapped.push(newTok);
        prevSig = newTok;
        continue;
      }

      if (!isMember && Object.prototype.hasOwnProperty.call(TYPE_DECL_MAP, lower)) {
        let nextNonWs: LogicToken | null = null;
        let crossedLine = false;
        for (let tj = ti + 1; tj < tokens.length; tj++) {
          const nt = tokens[tj];
          if (nt.type === "ws" || nt.type === "comment") {
            if (nt.value.includes("\n")) {
              crossedLine = true;
              break;
            }
            continue;
          }
          nextNonWs = nt;
          break;
        }
        const prevIsDecl =
          prevSig && (prevSig.value === "var" || prevSig.value === "let" || prevSig.value === "const" || prevSig.value === "function");
        if (!crossedLine && !prevIsDecl && nextNonWs && nextNonWs.type === "ident") {
          const rep = TYPE_DECL_MAP[lower];
          const newTok: LogicToken = { type: "ident", value: rep };
          mapped.push(newTok);
          prevSig = newTok;
          continue;
        }
      }
    }
    mapped.push(tok);
    if (tok.type !== "ws" && tok.type !== "comment") prevSig = tok;
  }

  const sigIndexes: number[] = [];
  mapped.forEach((t, idx) => {
    if (t.type !== "ws" && t.type !== "comment") sigIndexes.push(idx);
  });

  const nextSig = (s: number) => (s + 1 < sigIndexes.length ? mapped[sigIndexes[s + 1]] : null);
  const out = mapped.map(t => t.value);
  const declaredSet = new Set<string>();

  let braceDepth = 0;
  let parenDepth = 0;
  let pendingLoopHeader = false;
  let loopParenDepth = 0;

  for (let s = 0; s < sigIndexes.length; s++) {
    const idx = sigIndexes[s];
    const tok = mapped[idx];
    const val = tok.value;

    if (tok.type === "ident" && (val === "while" || val === "for")) {
      pendingLoopHeader = true;
      loopParenDepth = parenDepth;
    } else if (tok.type === "ident" && val === "do") {
      const n = nextSig(s);
      if (n && n.value === "{") pendingLoopHeader = true;
    }

    if (val === "(") parenDepth++;
    else if (val === ")") parenDepth = Math.max(0, parenDepth - 1);

    if (val === "{") {
      if (pendingLoopHeader && parenDepth <= loopParenDepth) {
        out[idx] = "{ __tick(); ";
        pendingLoopHeader = false;
      }
      braceDepth++;
      continue;
    }
    if (val === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
      continue;
    }

    if (braceDepth === 0 && parenDepth === 0 && tok.type === "ident") {
      if (val === "let" || val === "var" || val === "const") {
        const nameTok = nextSig(s);
        if (nameTok && nameTok.type === "ident") {
          declaredSet.add(nameTok.value);
        }
      } else if (val === "function") {
        const nameTok = nextSig(s);
        const afterName = nextSig(s + 1);
        if (nameTok && nameTok.type === "ident" && afterName && afterName.value === "(") {
          declaredSet.add(nameTok.value);
        }
      }
    }
  }

  return { code: out.join(""), declaredNames: Array.from(declaredSet) };
}

function formatFriendlyError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.startsWith("LoopLimitExceeded:")) {
    return msg.replace("LoopLimitExceeded:", "Erro de execução:");
  }
  const refMatch = msg.match(/^(\S+) is not defined$/);
  if (refMatch) {
    return `Erro: '${refMatch[1]}' não foi definido. Dica: declare com 'var ${refMatch[1]} = ...' antes de usar.`;
  }
  if (error instanceof SyntaxError) {
    return `Erro de sintaxe em Portugol: verifique parênteses, chaves { } ou blocos se/entao/fimse. (${msg})`;
  }
  return `Erro de execução: ${msg}`;
}

export function executeLogicCode(
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
      error: "Escreva algum algoritmo em Portugol antes de executar.",
      variables: [],
      scope: {},
      varTypes: {},
      testResults: [],
      durationMs: 0,
    };
  }

  const { code: transpiled, declaredNames } = transpileLogic(source);

  const __escreva = (...args: unknown[]) => {
    output.push(args.map(a => formatLogicValue(a, 0)).join(" "));
  };

  const __tamanho = (val: unknown): number => {
    if (val == null) return 0;
    if (typeof val === "string" || Array.isArray(val)) return val.length;
    if (typeof val === "object") return Object.keys(val).length;
    return 0;
  };

  let ticks = 0;
  const __tick = () => {
    ticks++;
    if (ticks > 50000) {
      throw new Error(
        "LoopLimitExceeded: seu laço ultrapassou 50.000 iterações (verifique a condição de parada)."
      );
    }
  };

  const shadowDecls = BLOCKED_GLOBALS.map(g => `const ${g} = undefined;`).join("\n");
  const captureLines = declaredNames
    .map(name => `try { __scope[${JSON.stringify(name)}] = ${name}; } catch {}`)
    .join("\n");
  const testCasesLiteral = JSON.stringify(
    testCases.map(tc => ({ id: tc.id, expression: tc.expression || "" }))
  );

  const wrapper = `
    "use strict";
    ${shadowDecls}
    const __scope = Object.create(null);
    const __testOutputs = [];
    ${transpiled}
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
    const fn = new Function("__escreva", "__tamanho", "__tick", wrapper);
    const execResult = fn(__escreva, __tamanho, __tick) as {
      scope: Record<string, unknown>;
      testOutputs: { id: string; ok: boolean; value?: unknown; error?: string }[];
    };

    const rawScope = execResult?.scope || {};
    const variables: VariableEntry[] = [];
    const cleanScope: Record<string, unknown> = {};
    const varTypes: Record<string, string> = {};

    for (const [k, v] of Object.entries(rawScope)) {
      const t = detectLogicType(v);
      varTypes[k] = t;
      variables.push({
        name: k,
        value: formatLogicValue(v, 1),
        type: t,
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
        return { id: tc.id, label: tc.label, passed: false, error: ran.error };
      }
      if ("assertReturnEquals" in tc && tc.assertReturnEquals !== undefined) {
        const passed = deepEqual(ran?.value, tc.assertReturnEquals);
        return {
          id: tc.id,
          label: tc.label,
          passed,
          expected: formatLogicValue(tc.assertReturnEquals, 1),
          actual: formatLogicValue(ran?.value, 1),
        };
      }
      if (tc.assertOutputIncludes !== undefined) {
        return {
          id: tc.id,
          label: tc.label,
          passed: outputText.includes(tc.assertOutputIncludes),
          expected: `conter "${tc.assertOutputIncludes}"`,
          actual: outputText || "(sem saída)",
        };
      }
      if (tc.assertOutputEquals !== undefined) {
        return {
          id: tc.id,
          label: tc.label,
          passed: outputText.trim() === tc.assertOutputEquals.trim(),
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
    const friendly = formatFriendlyError(err);
    return {
      success: false,
      output,
      outputText: output.join("\n"),
      error: friendly,
      variables: [],
      scope: {},
      varTypes: {},
      testResults: testCases.map(tc => ({
        id: tc.id,
        label: tc.label,
        passed: false,
        error: friendly,
      })),
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
    };
  }
}
