import type { TestCaseResult, TestCaseSpec, VariableEntry } from "../../types/curriculum";
import type { CodeRunResponse } from "../../types/execution";

const DEFAULT_BY_TYPE: Record<string, unknown> = {
  int: 0,
  long: 0,
  short: 0,
  unsigned: 0,
  double: 0,
  float: 0,
  string: "",
  char: "",
  bool: false,
};

function stripComments(source: string): string {
  let out = "";
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '"' || ch === "'") {
      const q = ch;
      out += q;
      i++;
      while (i < source.length) {
        const c = source[i];
        out += c;
        i++;
        if (c === "\\" && i < source.length) {
          out += source[i++];
          continue;
        }
        if (c === q) break;
      }
      continue;
    }
    if (ch === "/" && source[i + 1] === "/") {
      while (i < source.length && source[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      i += 2;
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

function validateStructure(cleanSource: string): string | null {
  if (!/#\s*include\s*<\s*iostream\s*>/i.test(cleanSource)) {
    return "Erro de compilação: faltou '#include <iostream>' no topo do arquivo para usar cout e cin.";
  }
  if (!/\bint\s+main\s*\([^)]*\)\s*\{/.test(cleanSource)) {
    return "Erro de compilação: todo programa C++ precisa da função principal 'int main() { ... }'.";
  }

  const hasUsingStd = /\busing\s+namespace\s+std\s*;/.test(cleanSource);
  if (!hasUsingStd) {
    const bareStd = cleanSource
      .replace(/std\s*::\s*(cout|cin|endl|string|getline|fixed|setprecision|vector)/g, "")
      .replace(/(["'])(?:\\.|(?!\1).)*\1/g, "");
    const match = bareStd.match(/\b(cout|cin|endl|string|getline|vector)\b/);
    if (match) {
      return `Erro de compilação: '${match[1]}' não foi declarado neste escopo. Dica: adicione 'using namespace std;' ou use 'std::${match[1]}'.`;
    }
  }

  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < cleanSource.length; i++) {
    const ch = cleanSource[i];
    if ((ch === '"' || ch === "'") && cleanSource[i - 1] !== "\\") {
      quote = quote === ch ? null : quote || ch;
      continue;
    }
    if (quote) continue;
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (depth < 0) return "Erro de sintaxe: chave '}' sobrando sem abertura correspondente.";
  }
  if (depth !== 0) return "Erro de sintaxe: faltou fechar uma chave '}' no código.";
  return null;
}

function extractSections(cleanSource: string): { beforeMain: string; mainBody: string } {
  const noPreproc = cleanSource
    .replace(/^\s*#.*$/gm, "")
    .replace(/\busing\s+namespace\s+std\s*;/g, "");
  const mainMatch = noPreproc.match(/\bint\s+main\s*\([^)]*\)\s*\{/);
  if (!mainMatch || mainMatch.index === undefined) return { beforeMain: "", mainBody: "" };
  const startBrace = mainMatch.index + mainMatch[0].length - 1;
  let depth = 0;
  let quote: string | null = null;
  let endBrace = -1;

  for (let i = startBrace; i < noPreproc.length; i++) {
    const ch = noPreproc[i];
    if ((ch === '"' || ch === "'") && noPreproc[i - 1] !== "\\") {
      quote = quote === ch ? null : quote || ch;
      continue;
    }
    if (quote) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        endBrace = i;
        break;
      }
    }
  }

  if (endBrace < 0) return { beforeMain: "", mainBody: "" };
  return {
    beforeMain: noPreproc.slice(0, mainMatch.index).trim(),
    mainBody: noPreproc.slice(startBrace + 1, endBrace),
  };
}

function splitTopLevel(str: string, separator: string): string[] {
  const parts: string[] = [];
  let current = "";
  let paren = 0;
  let bracket = 0;
  let brace = 0;
  let quote: string | null = null;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if ((ch === '"' || ch === "'") && str[i - 1] !== "\\") {
      quote = quote === ch ? null : quote || ch;
      current += ch;
      continue;
    }
    if (!quote) {
      if (ch === "(") paren++;
      else if (ch === ")") paren = Math.max(0, paren - 1);
      else if (ch === "[") bracket++;
      else if (ch === "]") bracket = Math.max(0, bracket - 1);
      else if (ch === "{") brace++;
      else if (ch === "}") brace = Math.max(0, brace - 1);

      if (
        paren === 0 &&
        bracket === 0 &&
        brace === 0 &&
        str.slice(i, i + separator.length) === separator
      ) {
        parts.push(current.trim());
        current = "";
        i += separator.length - 1;
        continue;
      }
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function normalizeExpr(expr: string): string {
  // Preserva literais de string ao normalizar apenas código
  let out = "";
  let i = 0;
  let buf = "";

  const flushCode = (codeChunk: string) =>
    codeChunk
      .replace(/\bstd\s*::\s*/g, "")
      .replace(/\.push_back\s*\(/g, ".push(")
      .replace(/\.size\s*\(\s*\)/g, ".length")
      .replace(/\.length\s*\(\s*\)/g, ".length")
      .replace(/static_cast\s*<\s*(double|float)\s*>\s*\(/g, "Number(")
      .replace(/static_cast\s*<\s*(int|long)\s*>\s*\(/g, "Math.trunc(")
      .replace(/\(\s*(double|float)\s*\)\s*([A-Za-z_]\w*|\([^)]*\))/g, "Number($2)")
      .replace(/\(\s*(int|long)\s*\)\s*([A-Za-z_]\w*|\([^)]*\))/g, "Math.trunc($2)")
      .replace(/\bpow\s*\(/g, "Math.pow(")
      .replace(/\bsqrt\s*\(/g, "Math.sqrt(")
      .replace(/\bfabs\s*\(/g, "Math.abs(")
      .replace(/\babs\s*\(/g, "Math.abs(")
      .replace(/\bceil\s*\(/g, "Math.ceil(")
      .replace(/\bfloor\s*\(/g, "Math.floor(")
      .replace(/\bround\s*\(/g, "Math.round(")
      .replace(/\bfmax\s*\(/g, "Math.max(")
      .replace(/\bfmin\s*\(/g, "Math.min(");

  while (i < expr.length) {
    const ch = expr[i];
    if (ch === '"' || ch === "'") {
      if (buf) {
        out += flushCode(buf);
        buf = "";
      }
      const q = ch;
      out += q;
      i++;
      while (i < expr.length) {
        const c = expr[i];
        out += c;
        i++;
        if (c === "\\" && i < expr.length) {
          out += expr[i++];
          continue;
        }
        if (c === q) break;
      }
      continue;
    }
    buf += ch;
    i++;
  }
  if (buf) out += flushCode(buf);
  return out;
}

interface StmtToken {
  kind: "stmt" | "open" | "close";
  text: string;
}

function splitStatements(code: string): StmtToken[] {
  const statements: StmtToken[] = [];
  let current = "";
  let paren = 0;
  let initBrace = 0;
  let quote: string | null = null;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if ((ch === '"' || ch === "'") && code[i - 1] !== "\\") {
      quote = quote === ch ? null : quote || ch;
      current += ch;
      continue;
    }
    if (quote) {
      current += ch;
      continue;
    }
    if (ch === "(") paren++;
    else if (ch === ")") paren = Math.max(0, paren - 1);

    if (ch === "{" && paren === 0) {
      if (initBrace > 0 || /=\s*$/.test(current)) {
        initBrace++;
        current += ch;
        continue;
      }
      statements.push({ kind: "open", text: current.trim() });
      current = "";
      continue;
    }
    if (ch === "}" && paren === 0) {
      if (initBrace > 0) {
        initBrace--;
        current += ch;
        continue;
      }
      if (current.trim()) statements.push({ kind: "stmt", text: current.trim() });
      statements.push({ kind: "close", text: "}" });
      current = "";
      continue;
    }
    if (ch === ";" && paren === 0 && initBrace === 0) {
      if (current.trim()) statements.push({ kind: "stmt", text: current.trim() });
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) statements.push({ kind: "stmt", text: current.trim() });
  return statements;
}

function compileBlockToJs(body: string, { isMain = true, topLevelAsDecl = true } = {}): string {
  const stmts = splitStatements(body);
  const jsLines: string[] = [];
  let blockDepth = 0;

  const emitDecl = (stmtText: string, _isTopLevel: boolean): string | null => {
    const clean = stmtText.replace(/\bstd\s*::\s*/g, "");
    // Suporte a vector<tipo> nome = {...} ou vector<tipo> nome;
    const vecMatch = clean.match(
      /^\s*(?:const\s+)?vector\s*<\s*[A-Za-z_]\w*\s*>\s+([A-Za-z_]\w*)(?:\s*=\s*\{([\s\S]*)\})?\s*$/
    );
    if (vecMatch) {
      const name = vecMatch[1];
      const initItems = vecMatch[2] !== undefined ? `[${normalizeExpr(vecMatch[2])}]` : "[]";
      if (topLevelAsDecl) {
        return `__decl(${JSON.stringify(name)}, "vector", ${initItems});`;
      }
      return `let ${name} = ${initItems};`;
    }

    const typeMatch = clean.match(
      /^\s*(?:const\s+)?(?:(?:unsigned|long|short)\s+)?(int|double|float|string|char|bool|long|short)\s+([\s\S]+)$/
    );
    if (!typeMatch) return null;

    const baseType = typeMatch[1];
    const declList = splitTopLevel(typeMatch[2], ",");
    const compiled: string[] = [];

    for (const item of declList) {
      const eqIdx = item.indexOf("=");
      if (eqIdx >= 0) {
        const varName = item.slice(0, eqIdx).trim();
        const initExpr = normalizeExpr(item.slice(eqIdx + 1).trim());
        if (topLevelAsDecl) {
          compiled.push(`__decl(${JSON.stringify(varName)}, ${JSON.stringify(baseType)}, (${initExpr}));`);
        } else {
          compiled.push(`let ${varName} = (${initExpr});`);
        }
      } else {
        const varName = item.trim();
        const defVal = JSON.stringify(DEFAULT_BY_TYPE[baseType] ?? 0);
        if (topLevelAsDecl) {
          compiled.push(`__decl(${JSON.stringify(varName)}, ${JSON.stringify(baseType)}, ${defVal});`);
        } else {
          compiled.push(`let ${varName} = ${defVal};`);
        }
      }
    }
    return compiled.join(" ");
  };

  const compileSingleStatement = (rawText: string, isTopLevel: boolean): string => {
    const text = rawText.replace(/\bstd\s*::\s*/g, "").trim();
    if (!text) return "";

    if (/^(?:else\s+if|if)\s*\(/.test(text)) {
      const firstParen = text.indexOf("(");
      let pd = 0;
      let quote: string | null = null;
      let closeParen = -1;
      for (let k = firstParen; k < text.length; k++) {
        const c = text[k];
        if ((c === '"' || c === "'") && text[k - 1] !== "\\") {
          quote = quote === c ? null : quote || c;
          continue;
        }
        if (quote) continue;
        if (c === "(") pd++;
        else if (c === ")") {
          pd--;
          if (pd === 0) {
            closeParen = k;
            break;
          }
        }
      }
      if (closeParen > 0) {
        const tail = text.slice(closeParen + 1).trim();
        if (tail) {
          const header = normalizeExpr(text.slice(0, closeParen + 1));
          return `${header} { ${compileSingleStatement(tail, false)} }`;
        }
      }
    }
    if (/^else\b/.test(text)) {
      const tail = text.slice(4).trim();
      if (tail && !/^if\b/.test(tail)) {
        return `else { ${compileSingleStatement(tail, false)} }`;
      }
    }

    if (/^return\b/.test(text)) {
      if (isMain) return "return;";
      const rest = text.replace(/^return\b/, "").trim();
      return rest ? `return (${normalizeExpr(rest)});` : "return;";
    }

    if (/^(setlocale|system)\s*\(/.test(text)) return "";

    if (/^cout\s*<</.test(text)) {
      const rest = text.replace(/^cout\s*<<\s*/, "");
      const items = splitTopLevel(rest, "<<");
      const mapped = items.map(part => {
        const p = part.trim();
        if (p === "endl") return "__ENDL";
        if (p === "fixed") return "__FIXED";
        const precMatch = p.match(/^setprecision\s*\((.+)\)$/);
        if (precMatch) return `{ __setPrecision: (${normalizeExpr(precMatch[1])}) }`;
        if (/^setw\s*\(/.test(p)) return '""';
        return `(${normalizeExpr(p)})`;
      });
      return `__cout([${mapped.join(", ")}]);`;
    }

    if (/^cin\.ignore\s*\(/.test(text)) return "__cinIgnore();";

    const getlineMatch = text.match(/^getline\s*\(\s*cin\s*,\s*([A-Za-z_]\w*)\s*\)$/);
    if (getlineMatch) return `__getline(${JSON.stringify(getlineMatch[1])});`;

    if (/^cin\s*>>/.test(text)) {
      const rest = text.replace(/^cin\s*>>\s*/, "");
      const targets = splitTopLevel(rest, ">>");
      return targets
        .map(t => t.trim())
        .filter(name => /^[A-Za-z_]\w*$/.test(name))
        .map(name => `__cin(${JSON.stringify(name)});`)
        .join(" ");
    }

    const decl = emitDecl(text, isTopLevel);
    if (decl !== null) return decl;

    return `${normalizeExpr(text)};`;
  };

  for (const entry of stmts) {
    if (entry.kind === "close") {
      blockDepth = Math.max(0, blockDepth - 1);
      jsLines.push("}");
      continue;
    }

    if (entry.kind === "open") {
      let header = normalizeExpr(entry.text);
      header = header.replace(
        /\bfor\s*\(\s*(?:int|long|double|float|size_t)\s+/g,
        "for (let "
      );
      const isLoop = /\b(while|for)\s*\(/.test(header) || /\bdo\b/.test(header);
      jsLines.push(`${header} {${isLoop ? " __tick();" : ""}`);
      blockDepth++;
      continue;
    }

    const compiled = compileSingleStatement(entry.text, blockDepth === 0);
    if (compiled) jsLines.push(compiled);
  }

  return jsLines.join("\n");
}

function compileHelperFunctions(beforeMain: string): { jsHelpers: string; helperNames: string[] } {
  if (!beforeMain.trim()) return { jsHelpers: "", helperNames: [] };

  const helperNames: string[] = [];
  const jsParts: string[] = [];
  const fnRegex = /\b(?:int|double|float|string|bool|void|long)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = fnRegex.exec(beforeMain)) !== null) {
    const fnName = match[1];
    const paramsRaw = match[2].trim();
    const startBrace = match.index + match[0].length - 1;
    let depth = 0;
    let quote: string | null = null;
    let endBrace = -1;
    for (let i = startBrace; i < beforeMain.length; i++) {
      const c = beforeMain[i];
      if ((c === '"' || c === "'") && beforeMain[i - 1] !== "\\") {
        quote = quote === c ? null : quote || c;
        continue;
      }
      if (quote) continue;
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          endBrace = i;
          break;
        }
      }
    }
    if (endBrace < 0) continue;

    const params = paramsRaw
      ? paramsRaw.split(",").map(p => {
          const tokens = p.replace(/&/g, "").trim().split(/\s+/);
          return tokens[tokens.length - 1];
        })
      : [];
    const body = beforeMain.slice(startBrace + 1, endBrace);
    const compiledBody = compileBlockToJs(body, { isMain: false, topLevelAsDecl: false });
    helperNames.push(fnName);
    jsParts.push(`function ${fnName}(${params.join(", ")}) {\n${compiledBody}\n}`);
    fnRegex.lastIndex = endBrace + 1;
  }

  return { jsHelpers: jsParts.join("\n"), helperNames };
}

function createStdinReader(stdinText = "") {
  const raw = String(stdinText || "").replace(/\r\n/g, "\n");
  let pos = 0;
  let lastWasCin = false;

  const skipWs = () => {
    while (pos < raw.length && /\s/.test(raw[pos])) pos++;
  };

  return {
    readToken(varName: string): string {
      skipWs();
      if (pos >= raw.length) {
        throw new Error(
          `Entrada (cin) insuficiente: o programa tentou ler '${varName}', mas não há mais valores em 'Entrada (stdin)'.`
        );
      }
      let tok = "";
      while (pos < raw.length && !/\s/.test(raw[pos])) tok += raw[pos++];
      lastWasCin = true;
      return tok;
    },
    ignoreLine() {
      while (pos < raw.length && raw[pos] !== "\n") pos++;
      if (raw[pos] === "\n") pos++;
      lastWasCin = false;
    },
    readLine(varName: string): string {
      if (lastWasCin) {
        let look = pos;
        while (look < raw.length && (raw[look] === " " || raw[look] === "\t")) look++;
        if (raw[look] === "\n") pos = look + 1;
        lastWasCin = false;
      }
      if (pos >= raw.length) {
        throw new Error(
          `Entrada insuficiente: o programa tentou ler '${varName}' com getline(), mas não há mais linhas em 'Entrada (stdin)'.`
        );
      }
      let line = "";
      while (pos < raw.length && raw[pos] !== "\n") line += raw[pos++];
      if (raw[pos] === "\n") pos++;
      return line;
    },
  };
}

function castInputValue(rawToken: string, cppType: string): unknown {
  const normalizedNum = rawToken.replace(",", ".");
  if (["int", "long", "short", "unsigned"].includes(cppType)) {
    const n = parseInt(normalizedNum, 10);
    if (Number.isNaN(n)) {
      throw new Error(`Entrada inválida '${rawToken}': esperado inteiro (${cppType}).`);
    }
    return n;
  }
  if (cppType === "double" || cppType === "float") {
    const n = Number(normalizedNum);
    if (Number.isNaN(n)) {
      throw new Error(`Entrada inválida '${rawToken}': esperado decimal (${cppType}).`);
    }
    return n;
  }
  if (cppType === "bool") return rawToken === "true" || rawToken === "1";
  if (cppType === "char") return rawToken[0] || "";
  return rawToken;
}

function runSingleCppExecution(
  jsHelpers: string,
  helperNames: string[],
  jsMain: string,
  stdinText: string
): {
  success: boolean;
  output: string[];
  outputText: string;
  error?: string;
  scope: Record<string, unknown>;
  varTypes: Record<string, string>;
  helperCall: (expr: string) => unknown;
} {
  const localScope: Record<string, unknown> = Object.create(null);
  const localTypes: Record<string, string> = Object.create(null);
  const outputLines: string[] = [];
  let currentLine = "";
  let isFixed = false;
  let precision: number | null = null;

  const __ENDL = Symbol("endl");
  const __FIXED = Symbol("fixed");

  const flushLine = () => {
    outputLines.push(currentLine);
    currentLine = "";
  };

  const formatItem = (val: unknown): string => {
    if (typeof val === "number") {
      if (isFixed && precision !== null) return val.toFixed(precision);
      if (precision !== null && !Number.isInteger(val)) return Number(val.toPrecision(precision)).toString();
      return String(val);
    }
    if (typeof val === "boolean") return val ? "1" : "0";
    return String(val ?? "");
  };

  const __cout = (items: unknown[]) => {
    for (const item of items) {
      if (item === __ENDL) {
        flushLine();
      } else if (item === __FIXED) {
        isFixed = true;
      } else if (item && typeof item === "object" && "__setPrecision" in item) {
        precision = Math.max(0, Math.min(10, Number((item as { __setPrecision: number }).__setPrecision) || 0));
      } else {
        const text = formatItem(item);
        if (text.includes("\n")) {
          const parts = text.split("\n");
          currentLine += parts[0];
          for (let p = 1; p < parts.length; p++) {
            flushLine();
            currentLine += parts[p];
          }
        } else {
          currentLine += text;
        }
      }
    }
  };

  const reader = createStdinReader(stdinText);

  const __decl = (name: string, type: string, initVal: unknown) => {
    localTypes[name] = type;
    localScope[name] = ["int", "long", "short", "unsigned"].includes(type)
      ? Math.trunc(Number(initVal) || 0)
      : initVal;
  };

  const __cin = (name: string) => {
    const tok = reader.readToken(name);
    localScope[name] = castInputValue(tok, localTypes[name] || "string");
  };

  const __getline = (name: string) => {
    localScope[name] = reader.readLine(name);
  };

  const __cinIgnore = () => {
    reader.ignoreLine();
  };

  let ticks = 0;
  const __tick = () => {
    ticks++;
    if (ticks > 50000) {
      throw new Error("Erro de execução: laço ultrapassou 50.000 iterações (loop protegido).");
    }
  };

  const proxy = new Proxy(localScope, {
    has(target, prop) {
      if (prop === Symbol.unscopables) return false;
      return typeof prop === "string" && prop in target;
    },
    get(target, prop) {
      if (typeof prop === "string") return target[prop];
      return undefined;
    },
    set(target, prop, value) {
      if (typeof prop === "string") target[prop] = value;
      return true;
    },
  });

  const helperCapture = helperNames.map(h => `try { __helpers[${JSON.stringify(h)}] = ${h}; } catch {}`).join("\n");

  try {
    const runner = new Function(
      "__proxy",
      "__cout",
      "__decl",
      "__cin",
      "__getline",
      "__cinIgnore",
      "__tick",
      "__ENDL",
      "__FIXED",
      `
      const window = undefined, globalThis = undefined, self = undefined, document = undefined, fetch = undefined, XMLHttpRequest = undefined, WebSocket = undefined, importScripts = undefined, localStorage = undefined, process = undefined, require = undefined;
      const __helpers = Object.create(null);
      ${jsHelpers}
      ${helperCapture}
      with (__proxy) {
        (function() {
          ${jsMain}
        })();
      }
      return (expr) => eval(expr);
      `
    );

    const helperCall = runner(
      proxy,
      __cout,
      __decl,
      __cin,
      __getline,
      __cinIgnore,
      __tick,
      __ENDL,
      __FIXED
    ) as (expr: string) => unknown;

    if (currentLine.length > 0) flushLine();

    return {
      success: true,
      output: outputLines,
      outputText: outputLines.join("\n"),
      scope: { ...localScope },
      varTypes: { ...localTypes },
      helperCall,
    };
  } catch (err) {
    const msg =
      err instanceof SyntaxError
        ? `Erro de sintaxe C++: verifique ponto e vírgula (;), chaves { }, aspas ou operadores. (${err.message})`
        : err instanceof Error
        ? err.message
        : String(err);
    return {
      success: false,
      output: outputLines,
      outputText: outputLines.join("\n"),
      error: msg,
      scope: { ...localScope },
      varTypes: { ...localTypes },
      helperCall: () => undefined,
    };
  }
}

export function executeCppCode(
  code: string,
  stdin = "",
  testCases: TestCaseSpec[] = []
): CodeRunResponse {
  const startedAt = performance.now();
  const source = String(code ?? "").trim();

  if (!source) {
    return {
      success: false,
      output: [],
      outputText: "",
      error: "Escreva algum código C++ antes de executar.",
      variables: [],
      scope: {},
      varTypes: {},
      testResults: [],
      durationMs: 0,
    };
  }

  const clean = stripComments(source);
  const structureErr = validateStructure(clean);
  if (structureErr) {
    return {
      success: false,
      output: [],
      outputText: "",
      error: structureErr,
      variables: [],
      scope: {},
      varTypes: {},
      testResults: testCases.map(tc => ({
        id: tc.id,
        label: tc.label,
        passed: false,
        error: structureErr,
      })),
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
    };
  }

  const { beforeMain, mainBody } = extractSections(clean);
  const { jsHelpers, helperNames } = compileHelperFunctions(beforeMain);
  const jsMain = compileBlockToJs(mainBody, { isMain: true, topLevelAsDecl: true });

  const mainRes = runSingleCppExecution(jsHelpers, helperNames, jsMain, stdin);

  const variables: VariableEntry[] = Object.entries(mainRes.scope).map(([name, val]) => ({
    name,
    value: Array.isArray(val) ? `[${val.join(", ")}]` : String(val),
    type: mainRes.varTypes[name] || typeof val,
  }));

  const testResults: TestCaseResult[] = testCases.map(tc => {
    if (!mainRes.success && tc.stdin === undefined) {
      return { id: tc.id, label: tc.label, passed: false, error: mainRes.error };
    }
    try {
      const targetRes =
        tc.stdin !== undefined
          ? runSingleCppExecution(jsHelpers, helperNames, jsMain, tc.stdin)
          : mainRes;

      if (!targetRes.success) {
        return { id: tc.id, label: tc.label, passed: false, error: targetRes.error };
      }
      if (tc.expression) {
        const val = targetRes.helperCall(tc.expression);
        if ("assertReturnEquals" in tc && tc.assertReturnEquals !== undefined) {
          const passed = JSON.stringify(val) === JSON.stringify(tc.assertReturnEquals);
          return {
            id: tc.id,
            label: tc.label,
            passed,
            expected: JSON.stringify(tc.assertReturnEquals),
            actual: JSON.stringify(val),
          };
        }
      }
      if (tc.assertOutputIncludes !== undefined) {
        const passed = targetRes.outputText.toLowerCase().includes(tc.assertOutputIncludes.toLowerCase());
        return {
          id: tc.id,
          label: tc.label,
          passed,
          expected: `conter "${tc.assertOutputIncludes}"`,
          actual: targetRes.outputText || "(sem saída)",
        };
      }
      if (tc.assertOutputEquals !== undefined) {
        const passed = targetRes.outputText.trim() === tc.assertOutputEquals.trim();
        return {
          id: tc.id,
          label: tc.label,
          passed,
          expected: tc.assertOutputEquals.trim(),
          actual: targetRes.outputText.trim(),
        };
      }
      return { id: tc.id, label: tc.label, passed: targetRes.success };
    } catch (err) {
      return {
        id: tc.id,
        label: tc.label,
        passed: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  return {
    success: mainRes.success,
    output: mainRes.output,
    outputText: mainRes.outputText,
    error: mainRes.error,
    variables,
    scope: mainRes.scope,
    varTypes: mainRes.varTypes,
    testResults,
    durationMs: Number((performance.now() - startedAt).toFixed(2)),
  };
}
