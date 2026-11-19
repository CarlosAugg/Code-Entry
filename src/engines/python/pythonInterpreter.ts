import type { TestCaseResult, TestCaseSpec, VariableEntry } from "../../types/curriculum";
import type { CodeRunResponse } from "../../types/execution";

type PyVal = unknown;

class PyTuple {
  items: PyVal[];
  constructor(items: PyVal[]) {
    this.items = items;
  }
}

class PySet {
  items: PyVal[];
  constructor(items: PyVal[] = []) {
    this.items = [];
    for (const v of items) this.add(v);
  }
  has(val: PyVal): boolean {
    return this.items.some(x => pyEquals(x, val));
  }
  add(val: PyVal): void {
    if (!this.has(val)) this.items.push(val);
  }
}

class PyRange {
  start: number;
  stop: number;
  step: number;
  length: number;
  constructor(start: number, stop: number, step = 1) {
    if (step === 0) throw new PyError("ValueError", "range() arg 3 (step) não pode ser zero");
    this.start = start;
    this.stop = stop;
    this.step = step;
    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      this.length = 0;
    } else {
      this.length = Math.floor((Math.abs(stop - start) - 1) / Math.abs(step)) + 1;
    }
  }
  at(idx: number): number {
    const i = idx < 0 ? this.length + idx : idx;
    if (i < 0 || i >= this.length) throw new PyError("IndexError", "índice do range fora dos limites");
    return this.start + i * this.step;
  }
  includes(val: PyVal): boolean {
    if (typeof val !== "number" || !Number.isInteger(val)) return false;
    if (this.step > 0 ? val < this.start || val >= this.stop : val > this.start || val <= this.stop) {
      return false;
    }
    return (val - this.start) % this.step === 0;
  }
  toArray(): number[] {
    const arr: number[] = [];
    for (let i = 0; i < this.length; i++) arr.push(this.start + i * this.step);
    return arr;
  }
}

class PyFunction {
  name: string;
  params: string[];
  defaults: (PyVal | undefined)[];
  body: Stmt[];
  closure: PyEnv;
  constructor(name: string, params: string[], defaults: (PyVal | undefined)[], body: Stmt[], closure: PyEnv) {
    this.name = name;
    this.params = params;
    this.defaults = defaults;
    this.body = body;
    this.closure = closure;
  }
}

class PyError extends Error {
  pyType: string;
  constructor(pyType: string, message: string) {
    super(`${pyType}: ${message}`);
    this.pyType = pyType;
  }
}

class ReturnSignal {
  value: PyVal;
  constructor(value: PyVal) {
    this.value = value;
  }
}
class BreakSignal {}
class ContinueSignal {}

class PyEnv {
  vars: Record<string, PyVal> = Object.create(null);
  parent: PyEnv | null;
  constructor(parent: PyEnv | null = null) {
    this.parent = parent;
  }
  get(name: string): PyVal {
    if (Object.prototype.hasOwnProperty.call(this.vars, name)) return this.vars[name];
    if (this.parent) return this.parent.get(name);
    throw new PyError("NameError", `nome '${name}' não está definido`);
  }
  set(name: string, val: PyVal): void {
    this.vars[name] = val;
  }
  hasOwn(name: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.vars, name);
  }
}

const KEYWORDS = new Set([
  "False",
  "True",
  "None",
  "and",
  "or",
  "not",
  "in",
  "is",
  "if",
  "elif",
  "else",
  "for",
  "while",
  "def",
  "return",
  "break",
  "continue",
  "pass",
  "lambda",
  "try",
  "except",
]);

function pyTypeName(val: PyVal): string {
  if (val === null || val === undefined) return "NoneType";
  if (typeof val === "boolean") return "bool";
  if (typeof val === "number") return Number.isInteger(val) ? "int" : "float";
  if (typeof val === "string") return "str";
  if (Array.isArray(val)) return "list";
  if (val instanceof PyTuple) return "tuple";
  if (val instanceof PySet) return "set";
  if (val instanceof Map) return "dict";
  if (val instanceof PyRange) return "range";
  if (val instanceof PyFunction || typeof val === "function") return "function";
  return typeof val;
}

function pyTruthiness(val: PyVal): boolean {
  if (val === null || val === undefined || val === false) return false;
  if (typeof val === "number") return val !== 0;
  if (typeof val === "string") return val.length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (val instanceof PyTuple || val instanceof PySet) return val.items.length > 0;
  if (val instanceof Map) return val.size > 0;
  if (val instanceof PyRange) return val.length > 0;
  return true;
}

function pyEquals(a: PyVal, b: PyVal): boolean {
  if (a === b) return true;
  if (typeof a === "boolean" && typeof b === "number") return Number(a) === b;
  if (typeof a === "number" && typeof b === "boolean") return a === Number(b);
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => pyEquals(v, b[i]));
  }
  if (a instanceof PyTuple && b instanceof PyTuple) {
    return a.items.length === b.items.length && a.items.every((v, i) => pyEquals(v, b.items[i]));
  }
  if (a instanceof PySet && b instanceof PySet) {
    return a.items.length === b.items.length && a.items.every(v => b.has(v));
  }
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a.entries()) {
      if (!b.has(k) || !pyEquals(v, b.get(k))) return false;
    }
    return true;
  }
  return false;
}

function pyRepr(val: PyVal): string {
  if (val === null || val === undefined) return "None";
  if (val === true) return "True";
  if (val === false) return "False";
  if (typeof val === "number") return String(val);
  if (typeof val === "string") return `'${val.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
  if (Array.isArray(val)) return `[${val.map(pyRepr).join(", ")}]`;
  if (val instanceof PyTuple) {
    if (val.items.length === 1) return `(${pyRepr(val.items[0])},)`;
    return `(${val.items.map(pyRepr).join(", ")})`;
  }
  if (val instanceof PySet) {
    return val.items.length === 0 ? "set()" : `{${val.items.map(pyRepr).join(", ")}}`;
  }
  if (val instanceof Map) {
    const pairs = Array.from(val.entries()).map(([k, v]) => `${pyRepr(k)}: ${pyRepr(v)}`);
    return `{${pairs.join(", ")}}`;
  }
  if (val instanceof PyRange) {
    return val.step === 1
      ? `range(${val.start}, ${val.stop})`
      : `range(${val.start}, ${val.stop}, ${val.step})`;
  }
  if (val instanceof PyFunction) return `<function ${val.name}>`;
  if (typeof val === "function") return `<built-in function>`;
  return String(val);
}

function pyStr(val: PyVal): string {
  if (typeof val === "string") return val;
  return pyRepr(val);
}

function toJsValue(val: PyVal): unknown {
  if (val === null || val === undefined) return null;
  if (Array.isArray(val)) return val.map(toJsValue);
  if (val instanceof PyTuple || val instanceof PySet) return val.items.map(toJsValue);
  if (val instanceof PyRange) return val.toArray();
  if (val instanceof Map) {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of val.entries()) obj[String(k)] = toJsValue(v);
    return obj;
  }
  if (val instanceof PyFunction) return `[Function ${val.name}]`;
  return val;
}

function toPyValue(val: unknown): PyVal {
  if (val === null || val === undefined) return null;
  if (Array.isArray(val)) return val.map(toPyValue);
  if (val instanceof Map || val instanceof PyTuple || val instanceof PySet || val instanceof PyRange) {
    return val;
  }
  if (typeof val === "object") {
    const m = new Map();
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) m.set(k, toPyValue(v));
    return m;
  }
  return val;
}

function pyIterableToArray(val: PyVal): PyVal[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") return val.split("");
  if (val instanceof PyTuple || val instanceof PySet) return val.items;
  if (val instanceof PyRange) return val.toArray();
  if (val instanceof Map) return Array.from(val.keys());
  throw new PyError("TypeError", `'${pyTypeName(val)}' não é iterável`);
}

function pySliceSeq(seq: PyVal, start: PyVal, stop: PyVal, step: PyVal): PyVal {
  const isStr = typeof seq === "string";
  const isTuple = seq instanceof PyTuple;
  const arr = isStr ? seq.split("") : isTuple ? seq.items : Array.isArray(seq) ? seq : null;
  if (!arr) throw new PyError("TypeError", `'${pyTypeName(seq)}' não suporta fatiamento`);

  const len = arr.length;
  const sStep = step === null || step === undefined ? 1 : Number(step);
  if (!Number.isInteger(sStep) || sStep === 0) {
    throw new PyError("ValueError", "passo do fatiamento deve ser inteiro diferente de zero");
  }

  const sNum = start === null || start === undefined ? null : Number(start);
  const eNum = stop === null || stop === undefined ? null : Number(stop);

  if (sStep > 0) {
    const s = sNum === null ? 0 : sNum < 0 ? Math.max(0, len + sNum) : Math.min(len, sNum);
    const e = eNum === null ? len : eNum < 0 ? Math.max(0, len + eNum) : Math.min(len, eNum);
    const res: PyVal[] = [];
    for (let i = s; i < e; i += sStep) res.push(arr[i]);
    return isStr ? res.join("") : isTuple ? new PyTuple(res) : res;
  } else {
    const s = sNum === null ? len - 1 : sNum < 0 ? Math.max(-1, len + sNum) : Math.min(len - 1, sNum);
    const e = eNum === null ? -1 : eNum < 0 ? Math.max(-1, len + eNum) : Math.min(len - 1, eNum);
    const res: PyVal[] = [];
    for (let i = s; i > e; i += sStep) res.push(arr[i]);
    return isStr ? res.join("") : isTuple ? new PyTuple(res) : res;
  }
}

interface Token {
  type: "INDENT" | "DEDENT" | "NEWLINE" | "EOF" | "NUMBER" | "STRING" | "FSTRING" | "KEYWORD" | "IDENT" | "OP";
  value: string | number | null;
  line: number;
}

function tokenizePython(source: string): Token[] {
  const tokens: Token[] = [];
  const indentStack = [0];
  let parenDepth = 0;
  let i = 0;
  let line = 1;
  let atLineStart = true;

  const readString = (quote: string, triple: boolean): string => {
    let value = "";
    while (i < source.length) {
      if (triple) {
        if (source.slice(i, i + 3) === quote.repeat(3)) {
          i += 3;
          return value;
        }
        if (source[i] === "\n") line++;
        value += source[i++];
      } else {
        const ch = source[i++];
        if (ch === "\n") throw new PyError("SyntaxError", `string não fechada na linha ${line}`);
        if (ch === "\\") {
          const esc = source[i++];
          if (esc === "n") value += "\n";
          else if (esc === "t") value += "\t";
          else if (esc === "r") value += "\r";
          else if (esc !== undefined) value += esc;
          continue;
        }
        if (ch === quote) return value;
        value += ch;
      }
    }
    throw new PyError("SyntaxError", `string não fechada na linha ${line}`);
  };

  while (i < source.length) {
    if (atLineStart && parenDepth === 0) {
      let spaces = 0;
      while (i < source.length && (source[i] === " " || source[i] === "\t")) {
        spaces += source[i] === "\t" ? 4 : 1;
        i++;
      }
      if (i >= source.length) break;
      if (source[i] === "\r") {
        i++;
        continue;
      }
      if (source[i] === "\n") {
        i++;
        line++;
        continue;
      }
      if (source[i] === "#") {
        while (i < source.length && source[i] !== "\n") i++;
        continue;
      }

      const top = indentStack[indentStack.length - 1];
      if (spaces > top) {
        indentStack.push(spaces);
        tokens.push({ type: "INDENT", value: spaces, line });
      } else if (spaces < top) {
        while (indentStack.length > 1 && indentStack[indentStack.length - 1] > spaces) {
          indentStack.pop();
          tokens.push({ type: "DEDENT", value: spaces, line });
        }
        if (indentStack[indentStack.length - 1] !== spaces) {
          throw new PyError("IndentationError", `indentação inconsistente na linha ${line}`);
        }
      }
      atLineStart = false;
    }

    const ch = source[i];
    if (ch === " " || ch === "\t" || ch === "\r") {
      i++;
      continue;
    }
    if (ch === "#") {
      while (i < source.length && source[i] !== "\n") i++;
      continue;
    }
    if (ch === "\n") {
      i++;
      line++;
      if (parenDepth === 0) {
        if (tokens.length && tokens[tokens.length - 1].type !== "NEWLINE") {
          tokens.push({ type: "NEWLINE", value: "\n", line });
        }
        atLineStart = true;
      }
      continue;
    }

    if ((ch === "f" || ch === "F") && (source[i + 1] === '"' || source[i + 1] === "'")) {
      i++;
      const q = source[i];
      const triple = source.slice(i, i + 3) === q.repeat(3);
      i += triple ? 3 : 1;
      tokens.push({ type: "FSTRING", value: readString(q, triple), line });
      continue;
    }

    if (ch === '"' || ch === "'") {
      const triple = source.slice(i, i + 3) === ch.repeat(3);
      i += triple ? 3 : 1;
      tokens.push({ type: "STRING", value: readString(ch, triple), line });
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let num = "";
      while (i < source.length && /[0-9_]/.test(source[i])) num += source[i++];
      if (source[i] === "." && /[0-9]/.test(source[i + 1] || "")) {
        num += source[i++];
        while (i < source.length && /[0-9_]/.test(source[i])) num += source[i++];
      }
      tokens.push({ type: "NUMBER", value: Number(num.replace(/_/g, "")), line });
      continue;
    }

    if (/[A-Za-z_]/.test(ch)) {
      let ident = "";
      while (i < source.length && /[A-Za-z0-9_]/.test(source[i])) ident += source[i++];
      tokens.push({
        type: KEYWORDS.has(ident) ? "KEYWORD" : "IDENT",
        value: ident,
        line,
      });
      continue;
    }

    const tri = source.slice(i, i + 3);
    if (tri === "//=" || tri === "**=") {
      tokens.push({ type: "OP", value: tri, line });
      i += 3;
      continue;
    }
    const di = source.slice(i, i + 2);
    if (["**", "//", "==", "!=", "<=", ">=", "+=", "-=", "*=", "/=", "%="].includes(di)) {
      tokens.push({ type: "OP", value: di, line });
      i += 2;
      continue;
    }

    if ("([{".includes(ch)) parenDepth++;
    else if (")]}".includes(ch)) parenDepth = Math.max(0, parenDepth - 1);
    tokens.push({ type: "OP", value: ch, line });
    i++;
  }

  if (tokens.length && !["NEWLINE", "INDENT", "DEDENT"].includes(tokens[tokens.length - 1].type)) {
    tokens.push({ type: "NEWLINE", value: "\n", line });
  }
  while (indentStack.length > 1) {
    indentStack.pop();
    tokens.push({ type: "DEDENT", value: 0, line });
  }
  tokens.push({ type: "EOF", value: null, line });
  return tokens;
}

type Stmt =
  | { type: "Pass" }
  | { type: "Break" }
  | { type: "Continue" }
  | { type: "Return"; value: Expr | null }
  | { type: "Assign"; targets: Expr[]; op: string; value: Expr }
  | { type: "ExprStmt"; expr: Expr }
  | { type: "If"; branches: { test: Expr | null; body: Stmt[] }[] }
  | { type: "While"; test: Expr; body: Stmt[] }
  | { type: "For"; targets: string[]; iter: Expr; body: Stmt[] }
  | { type: "Def"; name: string; params: { name: string; defaultExpr: Expr | null }[]; body: Stmt[] }
  | { type: "Try"; body: Stmt[]; handler: Stmt[] };

type Expr =
  | { type: "Literal"; value: PyVal }
  | { type: "Ident"; name: string }
  | { type: "FString"; template: string }
  | { type: "List"; elements: Expr[] }
  | { type: "Tuple"; items: Expr[] }
  | { type: "Set"; elements: Expr[] }
  | { type: "Dict"; entries: { key: Expr; val: Expr }[] }
  | { type: "ListComp"; elt: Expr; targets: string[]; iter: Expr; cond: Expr | null }
  | { type: "Lambda"; params: string[]; body: Expr }
  | { type: "Unary"; op: string; arg: Expr }
  | { type: "Binary"; op: string; left: Expr; right: Expr }
  | { type: "BoolOp"; op: "and" | "or"; left: Expr; right: Expr }
  | { type: "Ternary"; test: Expr; consequent: Expr; alternate: Expr }
  | { type: "Compare"; first: Expr; ops: { op: string; right: Expr }[] }
  | { type: "Member"; obj: Expr; prop: string }
  | { type: "Subscript"; obj: Expr; index: Expr }
  | { type: "Slice"; obj: Expr; start: Expr | null; stop: Expr | null; step: Expr | null }
  | { type: "Call"; callee: Expr; args: { kwName: string | null; value: Expr }[] };

class PythonParser {
  tokens: Token[];
  pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  peek(offset = 0): Token {
    return this.tokens[this.pos + offset] || { type: "EOF", value: null, line: 0 };
  }

  advance(): Token {
    const t = this.peek();
    this.pos++;
    return t;
  }

  match(type: Token["type"], value: string | number | null = null): boolean {
    const t = this.peek();
    if (t.type !== type) return false;
    if (value !== null && t.value !== value) return false;
    this.pos++;
    return true;
  }

  expect(type: Token["type"], value: string | number | null = null, label?: string): Token {
    const t = this.peek();
    if (t.type !== type || (value !== null && t.value !== value)) {
      throw new PyError(
        "SyntaxError",
        `esperado ${label || value || type} na linha ${t.line}, encontrado '${t.value ?? t.type}'`
      );
    }
    this.pos++;
    return t;
  }

  skipNewlines(): void {
    while (this.peek().type === "NEWLINE") this.pos++;
  }

  parseProgram(): Stmt[] {
    const body: Stmt[] = [];
    this.skipNewlines();
    while (this.peek().type !== "EOF") {
      body.push(this.parseStatement());
      this.skipNewlines();
    }
    return body;
  }

  parseBlock(): Stmt[] {
    this.expect("OP", ":", "':'");
    if (this.peek().type !== "NEWLINE") {
      const single = this.parseSimpleStatement();
      this.match("NEWLINE");
      return [single];
    }
    this.expect("NEWLINE");
    this.expect("INDENT", null, "bloco indentado");
    const stmts: Stmt[] = [];
    while (this.peek().type !== "DEDENT" && this.peek().type !== "EOF") {
      this.skipNewlines();
      if (this.peek().type === "DEDENT" || this.peek().type === "EOF") break;
      stmts.push(this.parseStatement());
      this.skipNewlines();
    }
    this.match("DEDENT");
    return stmts;
  }

  parseStatement(): Stmt {
    const t = this.peek();
    if (t.type === "KEYWORD") {
      if (t.value === "if") return this.parseIf();
      if (t.value === "while") return this.parseWhile();
      if (t.value === "for") return this.parseFor();
      if (t.value === "def") return this.parseDef();
      if (t.value === "try") return this.parseTry();
    }
    const stmt = this.parseSimpleStatement();
    if (this.peek().type === "NEWLINE") this.advance();
    return stmt;
  }

  parseSimpleStatement(): Stmt {
    const t = this.peek();
    if (t.type === "KEYWORD") {
      if (t.value === "pass") {
        this.advance();
        return { type: "Pass" };
      }
      if (t.value === "break") {
        this.advance();
        return { type: "Break" };
      }
      if (t.value === "continue") {
        this.advance();
        return { type: "Continue" };
      }
      if (t.value === "return") {
        this.advance();
        if (this.peek().type === "NEWLINE" || this.peek().type === "EOF") {
          return { type: "Return", value: null };
        }
        return { type: "Return", value: this.parseTupleOrExpr() };
      }
    }

    const first = this.parseTupleOrExpr();
    const tok = this.peek();
    if (
      tok.type === "OP" &&
      ["=", "+=", "-=", "*=", "/=", "//=", "%=", "**="].includes(String(tok.value))
    ) {
      const op = String(this.advance().value);
      const rhs = this.parseTupleOrExpr();
      const targets = first.type === "Tuple" ? first.items : [first];
      return { type: "Assign", targets, op, value: rhs };
    }
    return { type: "ExprStmt", expr: first };
  }

  parseIf(): Stmt {
    this.expect("KEYWORD", "if");
    const branches: { test: Expr | null; body: Stmt[] }[] = [];
    const test = this.parseExpr();
    branches.push({ test, body: this.parseBlock() });
    this.skipNewlines();
    while (this.match("KEYWORD", "elif")) {
      const elifTest = this.parseExpr();
      branches.push({ test: elifTest, body: this.parseBlock() });
      this.skipNewlines();
    }
    if (this.match("KEYWORD", "else")) {
      branches.push({ test: null, body: this.parseBlock() });
    }
    return { type: "If", branches };
  }

  parseWhile(): Stmt {
    this.expect("KEYWORD", "while");
    const test = this.parseExpr();
    const body = this.parseBlock();
    return { type: "While", test, body };
  }

  parseFor(): Stmt {
    this.expect("KEYWORD", "for");
    const targets: string[] = [];
    targets.push(String(this.expect("IDENT", null, "variável do laço").value));
    while (this.match("OP", ",")) {
      if (this.peek().type === "KEYWORD" && this.peek().value === "in") break;
      targets.push(String(this.expect("IDENT", null, "variável do laço").value));
    }
    this.expect("KEYWORD", "in", "'in'");
    const iter = this.parseTupleOrExpr();
    const body = this.parseBlock();
    return { type: "For", targets, iter, body };
  }

  parseDef(): Stmt {
    this.expect("KEYWORD", "def");
    const name = String(this.expect("IDENT", null, "nome da função").value);
    this.expect("OP", "(");
    const params: { name: string; defaultExpr: Expr | null }[] = [];
    if (!this.match("OP", ")")) {
      do {
        const pName = String(this.expect("IDENT", null, "parâmetro").value);
        let defaultExpr: Expr | null = null;
        if (this.match("OP", "=")) defaultExpr = this.parseExpr();
        params.push({ name: pName, defaultExpr });
      } while (this.match("OP", ","));
      this.expect("OP", ")");
    }
    const body = this.parseBlock();
    return { type: "Def", name, params, body };
  }

  parseTry(): Stmt {
    this.expect("KEYWORD", "try");
    const body = this.parseBlock();
    this.skipNewlines();
    this.expect("KEYWORD", "except", "'except'");
    while (this.peek().type !== "OP" || this.peek().value !== ":") {
      if (this.peek().type === "EOF" || this.peek().type === "NEWLINE") break;
      this.advance();
    }
    const handler = this.parseBlock();
    return { type: "Try", body, handler };
  }

  parseTupleOrExpr(): Expr {
    const first = this.parseExpr();
    if (!this.match("OP", ",")) return first;
    const items = [first];
    while (
      this.peek().type !== "NEWLINE" &&
      this.peek().type !== "EOF" &&
      !(this.peek().type === "OP" && ["=", "+=", "-=", "*=", "/=", "//=", "%=", "**=", ")", "]", ":"].includes(String(this.peek().value)))
    ) {
      items.push(this.parseExpr());
      if (!this.match("OP", ",")) break;
    }
    return { type: "Tuple", items };
  }

  parseExpr(): Expr {
    if (this.match("KEYWORD", "lambda")) {
      const params: string[] = [];
      if (!(this.peek().type === "OP" && this.peek().value === ":")) {
        do {
          params.push(String(this.expect("IDENT", null, "parâmetro lambda").value));
        } while (this.match("OP", ","));
      }
      this.expect("OP", ":");
      const body = this.parseExpr();
      return { type: "Lambda", params, body };
    }
    const expr = this.parseOr();
    if (this.match("KEYWORD", "if")) {
      const test = this.parseOr();
      this.expect("KEYWORD", "else", "'else'");
      const alternate = this.parseExpr();
      return { type: "Ternary", test, consequent: expr, alternate };
    }
    return expr;
  }

  parseOr(): Expr {
    let left = this.parseAnd();
    while (this.match("KEYWORD", "or")) {
      left = { type: "BoolOp", op: "or", left, right: this.parseAnd() };
    }
    return left;
  }

  parseAnd(): Expr {
    let left = this.parseNot();
    while (this.match("KEYWORD", "and")) {
      left = { type: "BoolOp", op: "and", left, right: this.parseNot() };
    }
    return left;
  }

  parseNot(): Expr {
    if (this.match("KEYWORD", "not")) {
      return { type: "Unary", op: "not", arg: this.parseNot() };
    }
    return this.parseComparison();
  }

  parseComparison(): Expr {
    const first = this.parseAddSub();
    const ops: { op: string; right: Expr }[] = [];
    while (true) {
      const t = this.peek();
      if (t.type === "OP" && ["==", "!=", "<", "<=", ">", ">="].includes(String(t.value))) {
        const op = String(this.advance().value);
        ops.push({ op, right: this.parseAddSub() });
      } else if (t.type === "KEYWORD" && t.value === "in") {
        this.advance();
        ops.push({ op: "in", right: this.parseAddSub() });
      } else if (t.type === "KEYWORD" && t.value === "not" && this.peek(1).value === "in") {
        this.advance();
        this.advance();
        ops.push({ op: "not in", right: this.parseAddSub() });
      } else if (t.type === "KEYWORD" && t.value === "is") {
        this.advance();
        if (this.match("KEYWORD", "not")) ops.push({ op: "is not", right: this.parseAddSub() });
        else ops.push({ op: "is", right: this.parseAddSub() });
      } else {
        break;
      }
    }
    if (ops.length === 0) return first;
    return { type: "Compare", first, ops };
  }

  parseAddSub(): Expr {
    let left = this.parseMulDiv();
    while (this.peek().type === "OP" && (this.peek().value === "+" || this.peek().value === "-")) {
      const op = String(this.advance().value);
      left = { type: "Binary", op, left, right: this.parseMulDiv() };
    }
    return left;
  }

  parseMulDiv(): Expr {
    let left = this.parseUnary();
    while (
      this.peek().type === "OP" &&
      ["*", "/", "//", "%"].includes(String(this.peek().value))
    ) {
      const op = String(this.advance().value);
      left = { type: "Binary", op, left, right: this.parseUnary() };
    }
    return left;
  }

  parseUnary(): Expr {
    if (this.peek().type === "OP" && (this.peek().value === "-" || this.peek().value === "+")) {
      const op = String(this.advance().value);
      return { type: "Unary", op, arg: this.parseUnary() };
    }
    return this.parsePower();
  }

  parsePower(): Expr {
    const left = this.parsePostfix();
    if (this.match("OP", "**")) {
      return { type: "Binary", op: "**", left, right: this.parseUnary() };
    }
    return left;
  }

  parsePostfix(): Expr {
    let expr = this.parseAtom();
    while (true) {
      if (this.match("OP", "(")) {
        const args: { kwName: string | null; value: Expr }[] = [];
        if (!this.match("OP", ")")) {
          do {
            if (this.peek().type === "IDENT" && this.peek(1).type === "OP" && this.peek(1).value === "=") {
              const kwName = String(this.advance().value);
              this.advance();
              args.push({ kwName, value: this.parseExpr() });
            } else {
              args.push({ kwName: null, value: this.parseExpr() });
            }
          } while (this.match("OP", ","));
          this.expect("OP", ")");
        }
        expr = { type: "Call", callee: expr, args };
      } else if (this.match("OP", ".")) {
        const prop = String(this.expect("IDENT", null, "atributo ou método").value);
        expr = { type: "Member", obj: expr, prop };
      } else if (this.match("OP", "[")) {
        let start: Expr | null = null;
        if (!(this.peek().type === "OP" && this.peek().value === ":")) {
          start = this.parseExpr();
        }
        if (this.match("OP", ":")) {
          let stop: Expr | null = null;
          let step: Expr | null = null;
          if (!(this.peek().type === "OP" && (this.peek().value === ":" || this.peek().value === "]"))) {
            stop = this.parseExpr();
          }
          if (this.match("OP", ":")) {
            if (!(this.peek().type === "OP" && this.peek().value === "]")) {
              step = this.parseExpr();
            }
          }
          this.expect("OP", "]");
          expr = { type: "Slice", obj: expr, start, stop, step };
        } else {
          this.expect("OP", "]");
          expr = { type: "Subscript", obj: expr, index: start! };
        }
      } else {
        break;
      }
    }
    return expr;
  }

  parseAtom(): Expr {
    const t = this.peek();
    if (t.type === "NUMBER") {
      this.advance();
      return { type: "Literal", value: t.value };
    }
    if (t.type === "STRING") {
      this.advance();
      return { type: "Literal", value: t.value };
    }
    if (t.type === "FSTRING") {
      this.advance();
      return { type: "FString", template: String(t.value) };
    }
    if (t.type === "KEYWORD") {
      if (t.value === "True") {
        this.advance();
        return { type: "Literal", value: true };
      }
      if (t.value === "False") {
        this.advance();
        return { type: "Literal", value: false };
      }
      if (t.value === "None") {
        this.advance();
        return { type: "Literal", value: null };
      }
    }
    if (t.type === "IDENT") {
      this.advance();
      return { type: "Ident", name: String(t.value) };
    }
    if (this.match("OP", "(")) {
      if (this.match("OP", ")")) return { type: "Tuple", items: [] };
      const first = this.parseExpr();
      if (this.match("OP", ",")) {
        const items = [first];
        while (!this.match("OP", ")")) {
          items.push(this.parseExpr());
          if (!this.match("OP", ",")) {
            this.expect("OP", ")");
            break;
          }
        }
        return { type: "Tuple", items };
      }
      this.expect("OP", ")");
      return first;
    }
    if (this.match("OP", "[")) {
      if (this.match("OP", "]")) return { type: "List", elements: [] };
      const first = this.parseExpr();
      if (this.match("KEYWORD", "for")) {
        const targets = [String(this.expect("IDENT", null, "variável").value)];
        while (this.match("OP", ",")) {
          if (this.peek().type === "KEYWORD" && this.peek().value === "in") break;
          targets.push(String(this.expect("IDENT").value));
        }
        this.expect("KEYWORD", "in", "'in'");
        const iter = this.parseOr();
        let cond: Expr | null = null;
        if (this.match("KEYWORD", "if")) cond = this.parseOr();
        this.expect("OP", "]");
        return { type: "ListComp", elt: first, targets, iter, cond };
      }
      const elements = [first];
      while (this.match("OP", ",")) {
        if (this.peek().type === "OP" && this.peek().value === "]") break;
        elements.push(this.parseExpr());
      }
      this.expect("OP", "]");
      return { type: "List", elements };
    }
    if (this.match("OP", "{")) {
      if (this.match("OP", "}")) return { type: "Dict", entries: [] };
      const firstKey = this.parseExpr();
      if (this.match("OP", ":")) {
        const firstVal = this.parseExpr();
        const entries = [{ key: firstKey, val: firstVal }];
        while (this.match("OP", ",")) {
          if (this.peek().type === "OP" && this.peek().value === "}") break;
          const k = this.parseExpr();
          this.expect("OP", ":");
          const v = this.parseExpr();
          entries.push({ key: k, val: v });
        }
        this.expect("OP", "}");
        return { type: "Dict", entries };
      }
      const elements = [firstKey];
      while (this.match("OP", ",")) {
        if (this.peek().type === "OP" && this.peek().value === "}") break;
        elements.push(this.parseExpr());
      }
      this.expect("OP", "}");
      return { type: "Set", elements };
    }
    throw new PyError("SyntaxError", `expressão inesperada '${t.value ?? t.type}' na linha ${t.line}`);
  }
}

class PythonRuntime {
  globalEnv = new PyEnv();
  output: string[] = [];
  stdinLines: string[];
  stdinIdx = 0;
  ticks = 0;

  constructor(stdinText = "") {
    this.stdinLines = String(stdinText || "").replace(/\r\n/g, "\n").split("\n");
    this.installBuiltins();
  }

  tick(): void {
    this.ticks++;
    if (this.ticks > 50000) {
      throw new PyError("RuntimeError", "execução ultrapassou 50.000 iterações (loop protegido)");
    }
  }

  installBuiltins(): void {
    const g = this.globalEnv;
    g.set("print", (args: PyVal[], kwargs: Record<string, PyVal>) => {
      const sep = kwargs.sep !== undefined ? String(kwargs.sep) : " ";
      const line = args.map(a => pyStr(a)).join(sep);
      for (const part of line.split("\n")) {
        this.output.push(part);
      }
      return null;
    });
    g.set("input", (args: PyVal[]) => {
      if (args.length > 0 && args[0]) {
        this.output.push(String(args[0]));
      }
      if (this.stdinIdx < this.stdinLines.length) {
        return this.stdinLines[this.stdinIdx++];
      }
      return "";
    });
    g.set("len", ([x]: PyVal[]) => {
      if (typeof x === "string" || Array.isArray(x)) return x.length;
      if (x instanceof PyTuple || x instanceof PySet) return x.items.length;
      if (x instanceof Map) return x.size;
      if (x instanceof PyRange) return x.length;
      throw new PyError("TypeError", `objeto do tipo '${pyTypeName(x)}' não possui len()`);
    });
    g.set("type", ([x]: PyVal[]) => `<class '${pyTypeName(x)}'>`);
    g.set("range", (args: PyVal[]) => {
      if (args.length === 1) return new PyRange(0, Number(args[0]), 1);
      if (args.length === 2) return new PyRange(Number(args[0]), Number(args[1]), 1);
      if (args.length === 3) return new PyRange(Number(args[0]), Number(args[1]), Number(args[2]));
      throw new PyError("TypeError", "range() espera 1 a 3 argumentos");
    });
    g.set("enumerate", (args: PyVal[]) => {
      const items = pyIterableToArray(args[0]);
      const start = args[1] !== undefined ? Number(args[1]) : 0;
      return items.map((v, idx) => new PyTuple([start + idx, v]));
    });
    g.set("zip", (args: PyVal[]) => {
      const arrays = args.map(pyIterableToArray);
      const minLen = arrays.length ? Math.min(...arrays.map(a => a.length)) : 0;
      const out: PyTuple[] = [];
      for (let i = 0; i < minLen; i++) {
        out.push(new PyTuple(arrays.map(a => a[i])));
      }
      return out;
    });
    g.set("int", ([x]: PyVal[]) => {
      if (typeof x === "number") return Math.trunc(x);
      if (typeof x === "boolean") return x ? 1 : 0;
      const n = parseInt(String(x).trim(), 10);
      if (Number.isNaN(n)) throw new PyError("ValueError", `não foi possível converter ${pyRepr(x)} em int`);
      return n;
    });
    g.set("float", ([x]: PyVal[]) => {
      const n = Number(String(x).trim().replace(",", "."));
      if (Number.isNaN(n)) throw new PyError("ValueError", `não foi possível converter ${pyRepr(x)} em float`);
      return n;
    });
    g.set("str", ([x]: PyVal[]) => (x === undefined ? "" : pyStr(x)));
    g.set("bool", ([x]: PyVal[]) => pyTruthiness(x));
    g.set("list", (args: PyVal[]) => (args.length === 0 ? [] : [...pyIterableToArray(args[0])]));
    g.set("tuple", (args: PyVal[]) => new PyTuple(args.length === 0 ? [] : [...pyIterableToArray(args[0])]));
    g.set("set", (args: PyVal[]) => new PySet(args.length === 0 ? [] : pyIterableToArray(args[0])));
    g.set("dict", () => new Map());
    g.set("abs", ([x]: PyVal[]) => Math.abs(Number(x)));
    g.set("round", ([x, nd]: PyVal[]) => {
      const num = Number(x);
      if (nd === undefined) return Math.round(num);
      const factor = 10 ** Number(nd);
      return Math.round(num * factor) / factor;
    });
    g.set("sum", ([iter, start]: PyVal[]) => {
      const items = pyIterableToArray(iter);
      return items.reduce((acc: number, v) => acc + Number(v), start !== undefined ? Number(start) : 0);
    });
    g.set("min", (args: PyVal[]) => {
      const items = args.length === 1 ? pyIterableToArray(args[0]) : args;
      return items.reduce((a, b) => ((a as number) < (b as number) ? a : b));
    });
    g.set("max", (args: PyVal[]) => {
      const items = args.length === 1 ? pyIterableToArray(args[0]) : args;
      return items.reduce((a, b) => ((a as number) > (b as number) ? a : b));
    });
    g.set("sorted", (args: PyVal[], kwargs: Record<string, PyVal>) => {
      const items = [...pyIterableToArray(args[0])];
      const reverse = Boolean(kwargs.reverse);
      items.sort((a, b) => {
        if (typeof a === "number" && typeof b === "number") return a - b;
        return String(a).localeCompare(String(b));
      });
      if (reverse) items.reverse();
      return items;
    });
    g.set("reversed", ([x]: PyVal[]) => [...pyIterableToArray(x)].reverse());
    g.set("any", ([x]: PyVal[]) => pyIterableToArray(x).some(pyTruthiness));
    g.set("all", ([x]: PyVal[]) => pyIterableToArray(x).every(pyTruthiness));
    g.set("isinstance", ([obj, cls]: PyVal[]) => {
      if (cls === g.get("int")) return typeof obj === "number" && Number.isInteger(obj);
      if (cls === g.get("float")) return typeof obj === "number";
      if (cls === g.get("str")) return typeof obj === "string";
      if (cls === g.get("bool")) return typeof obj === "boolean";
      if (cls === g.get("list")) return Array.isArray(obj);
      if (cls === g.get("dict")) return obj instanceof Map;
      return false;
    });
  }

  execBlock(stmts: Stmt[], env: PyEnv): PyVal {
    let last: PyVal = null;
    for (const s of stmts) {
      last = this.execStmt(s, env);
    }
    return last;
  }

  execStmt(stmt: Stmt, env: PyEnv): PyVal {
    this.tick();
    switch (stmt.type) {
      case "Pass":
        return null;
      case "Break":
        throw new BreakSignal();
      case "Continue":
        throw new ContinueSignal();
      case "Return":
        throw new ReturnSignal(stmt.value ? this.evalExpr(stmt.value, env) : null);
      case "ExprStmt":
        return this.evalExpr(stmt.expr, env);
      case "Assign": {
        const val = this.evalExpr(stmt.value, env);
        if (stmt.op !== "=") {
          const target = stmt.targets[0];
          const binOp = stmt.op.slice(0, -1);
          if (target.type === "Ident") {
            const cur = env.get(target.name);
            env.set(target.name, this.applyBinaryOp(binOp, cur, val));
            return null;
          }
          if (target.type === "Subscript") {
            const container = this.evalExpr(target.obj, env);
            const idx = this.evalExpr(target.index, env);
            if (Array.isArray(container)) {
              const i = Number(idx) < 0 ? container.length + Number(idx) : Number(idx);
              container[i] = this.applyBinaryOp(binOp, container[i], val);
            } else if (container instanceof Map) {
              container.set(idx, this.applyBinaryOp(binOp, container.get(idx), val));
            }
            return null;
          }
        }
        if (stmt.targets.length === 1) {
          this.assignTarget(stmt.targets[0], val, env);
        } else {
          const parts = pyIterableToArray(val);
          if (parts.length !== stmt.targets.length) {
            throw new PyError("ValueError", "quantidade de valores incompatível no desempacotamento");
          }
          stmt.targets.forEach((t, idx) => this.assignTarget(t, parts[idx], env));
        }
        return null;
      }
      case "If": {
        for (const b of stmt.branches) {
          if (b.test === null || pyTruthiness(this.evalExpr(b.test, env))) {
            return this.execBlock(b.body, env);
          }
        }
        return null;
      }
      case "While": {
        while (pyTruthiness(this.evalExpr(stmt.test, env))) {
          this.tick();
          try {
            this.execBlock(stmt.body, env);
          } catch (sig) {
            if (sig instanceof BreakSignal) break;
            if (sig instanceof ContinueSignal) continue;
            throw sig;
          }
        }
        return null;
      }
      case "For": {
        const items = pyIterableToArray(this.evalExpr(stmt.iter, env));
        for (const item of items) {
          this.tick();
          if (stmt.targets.length === 1) {
            env.set(stmt.targets[0], item);
          } else {
            const parts = pyIterableToArray(item);
            stmt.targets.forEach((name, idx) => env.set(name, parts[idx]));
          }
          try {
            this.execBlock(stmt.body, env);
          } catch (sig) {
            if (sig instanceof BreakSignal) break;
            if (sig instanceof ContinueSignal) continue;
            throw sig;
          }
        }
        return null;
      }
      case "Def": {
        const defaults = stmt.params.map(p => (p.defaultExpr ? this.evalExpr(p.defaultExpr, env) : undefined));
        const fn = new PyFunction(
          stmt.name,
          stmt.params.map(p => p.name),
          defaults,
          stmt.body,
          env
        );
        env.set(stmt.name, fn);
        return null;
      }
      case "Try": {
        try {
          return this.execBlock(stmt.body, env);
        } catch (err) {
          if (err instanceof ReturnSignal || err instanceof BreakSignal || err instanceof ContinueSignal) {
            throw err;
          }
          return this.execBlock(stmt.handler, env);
        }
      }
    }
  }

  assignTarget(target: Expr, val: PyVal, env: PyEnv): void {
    if (target.type === "Ident") {
      env.set(target.name, val);
      return;
    }
    if (target.type === "Subscript") {
      const container = this.evalExpr(target.obj, env);
      const key = this.evalExpr(target.index, env);
      if (Array.isArray(container)) {
        const idx = Number(key) < 0 ? container.length + Number(key) : Number(key);
        if (idx < 0 || idx >= container.length) throw new PyError("IndexError", "índice fora dos limites");
        container[idx] = val;
        return;
      }
      if (container instanceof Map) {
        container.set(key, val);
        return;
      }
    }
    throw new PyError("SyntaxError", "destino de atribuição inválido");
  }

  applyBinaryOp(op: string, l: PyVal, r: PyVal): PyVal {
    if (op === "+") {
      if (typeof l === "number" && typeof r === "number") return l + r;
      if (typeof l === "string" && typeof r === "string") return l + r;
      if (Array.isArray(l) && Array.isArray(r)) return [...l, ...r];
      throw new PyError("TypeError", `operador '+' inválido para ${pyTypeName(l)} e ${pyTypeName(r)}`);
    }
    if (op === "-") return Number(l) - Number(r);
    if (op === "*") {
      if (typeof l === "number" && typeof r === "number") return l * r;
      if (typeof l === "string" && typeof r === "number") return l.repeat(Math.max(0, Math.trunc(r)));
      if (typeof l === "number" && typeof r === "string") return r.repeat(Math.max(0, Math.trunc(l)));
      if (Array.isArray(l) && typeof r === "number") {
        const out: PyVal[] = [];
        for (let i = 0; i < Math.trunc(r); i++) out.push(...l);
        return out;
      }
      throw new PyError("TypeError", `operador '*' inválido para ${pyTypeName(l)} e ${pyTypeName(r)}`);
    }
    if (op === "/") {
      if (Number(r) === 0) throw new PyError("ZeroDivisionError", "divisão por zero");
      return Number(l) / Number(r);
    }
    if (op === "//") {
      if (Number(r) === 0) throw new PyError("ZeroDivisionError", "divisão inteira por zero");
      return Math.floor(Number(l) / Number(r));
    }
    if (op === "%") {
      if (Number(r) === 0) throw new PyError("ZeroDivisionError", "módulo por zero");
      const n = Number(l);
      const d = Number(r);
      return ((n % d) + d) % d;
    }
    if (op === "**") return Number(l) ** Number(r);
    throw new PyError("TypeError", `operador desconhecido '${op}'`);
  }

  evalFString(template: string, env: PyEnv): string {
    let out = "";
    let i = 0;
    while (i < template.length) {
      const ch = template[i];
      if (ch === "{" && template[i + 1] === "{") {
        out += "{";
        i += 2;
        continue;
      }
      if (ch === "}" && template[i + 1] === "}") {
        out += "}";
        i += 2;
        continue;
      }
      if (ch === "{") {
        let depth = 1;
        let j = i + 1;
        let quote: string | null = null;
        while (j < template.length && depth > 0) {
          const c = template[j];
          if (quote) {
            if (c === quote && template[j - 1] !== "\\") quote = null;
          } else {
            if (c === "'" || c === '"') quote = c;
            else if (c === "{") depth++;
            else if (c === "}") depth--;
          }
          j++;
        }
        const inner = template.slice(i + 1, j - 1);
        const colonIdx = inner.indexOf(":");
        const exprSrc = (colonIdx >= 0 ? inner.slice(0, colonIdx) : inner).trim();
        const spec = colonIdx >= 0 ? inner.slice(colonIdx + 1).trim() : "";
        const val = this.evalInlineExpr(exprSrc, env);
        if (spec) {
          const fixedMatch = spec.match(/^\.(\d+)f$/);
          if (fixedMatch && typeof val === "number") {
            out += val.toFixed(Number(fixedMatch[1]));
          } else {
            out += pyStr(val);
          }
        } else {
          out += pyStr(val);
        }
        i = j;
        continue;
      }
      out += ch;
      i++;
    }
    return out;
  }

  evalInlineExpr(src: string, env: PyEnv): PyVal {
    const tokens = tokenizePython(src);
    const expr = new PythonParser(tokens).parseTupleOrExpr();
    return this.evalExpr(expr, env);
  }

  evalMember(obj: PyVal, prop: string): PyVal {
    if (typeof obj === "string") {
      const strMethods: Record<string, (args: PyVal[]) => PyVal> = {
        strip: () => obj.trim(),
        lstrip: () => obj.trimStart(),
        rstrip: () => obj.trimEnd(),
        upper: () => obj.toUpperCase(),
        lower: () => obj.toLowerCase(),
        title: () => obj.replace(/\b\w/g, c => c.toUpperCase()),
        replace: ([a, b]) => obj.split(String(a)).join(String(b)),
        split: ([sep]) => (sep === undefined ? obj.trim().split(/\s+/).filter(Boolean) : obj.split(String(sep))),
        join: ([iter]) => pyIterableToArray(iter).map(x => pyStr(x)).join(obj),
        startswith: ([p]) => obj.startsWith(String(p)),
        endswith: ([s]) => obj.endsWith(String(s)),
        find: ([sub]) => obj.indexOf(String(sub)),
        count: ([sub]) => (String(sub) ? obj.split(String(sub)).length - 1 : obj.length + 1),
        isdigit: () => /^\d+$/.test(obj),
      };
      if (strMethods[prop]) return strMethods[prop];
    }
    if (Array.isArray(obj)) {
      const listMethods: Record<string, (args: PyVal[]) => PyVal> = {
        append: ([item]) => {
          obj.push(item);
          return null;
        },
        extend: ([iter]) => {
          obj.push(...pyIterableToArray(iter));
          return null;
        },
        insert: ([idx, item]) => {
          obj.splice(Number(idx), 0, item);
          return null;
        },
        pop: ([idx]) => {
          if (obj.length === 0) throw new PyError("IndexError", "pop de lista vazia");
          if (idx === undefined) return obj.pop() ?? null;
          const i = Number(idx) < 0 ? obj.length + Number(idx) : Number(idx);
          return obj.splice(i, 1)[0];
        },
        remove: ([val]) => {
          const i = obj.findIndex(x => pyEquals(x, val));
          if (i < 0) throw new PyError("ValueError", "valor não encontrado na lista");
          obj.splice(i, 1);
          return null;
        },
        sort: (_args, kwargs?: Record<string, PyVal>) => {
          obj.sort((a, b) => (typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b))));
          if (kwargs?.reverse) obj.reverse();
          return null;
        },
        reverse: () => {
          obj.reverse();
          return null;
        },
        index: ([val]) => {
          const i = obj.findIndex(x => pyEquals(x, val));
          if (i < 0) throw new PyError("ValueError", "valor não encontrado na lista");
          return i;
        },
        count: ([val]) => obj.filter(x => pyEquals(x, val)).length,
        copy: () => [...obj],
        clear: () => {
          obj.length = 0;
          return null;
        },
      };
      if (listMethods[prop]) return listMethods[prop];
    }
    if (obj instanceof PySet) {
      if (prop === "add") {
        return ([v]: PyVal[]) => {
          obj.add(v);
          return null;
        };
      }
    }
    if (obj instanceof Map) {
      const dictMethods: Record<string, (args: PyVal[]) => PyVal> = {
        keys: () => Array.from(obj.keys()),
        values: () => Array.from(obj.values()),
        items: () => Array.from(obj.entries()).map(([k, v]) => new PyTuple([k, v])),
        get: ([k, def]) => (obj.has(k) ? obj.get(k) : def ?? null),
        pop: ([k, def]) => {
          if (obj.has(k)) {
            const v = obj.get(k);
            obj.delete(k);
            return v;
          }
          if (def !== undefined) return def;
          throw new PyError("KeyError", pyRepr(k));
        },
        update: ([other]) => {
          if (other instanceof Map) {
            for (const [k, v] of other.entries()) obj.set(k, v);
          }
          return null;
        },
        clear: () => {
          obj.clear();
          return null;
        },
        copy: () => new Map(obj),
      };
      if (dictMethods[prop]) return dictMethods[prop];
    }
    throw new PyError("AttributeError", `'${pyTypeName(obj)}' não possui atributo '${prop}'`);
  }

  callCallable(fn: PyVal, posArgs: PyVal[], kwargs: Record<string, PyVal>): PyVal {
    if (typeof fn === "function") {
      return fn(posArgs, kwargs);
    }
    if (fn instanceof PyFunction) {
      const localEnv = new PyEnv(fn.closure);
      fn.params.forEach((pName, idx) => {
        if (idx < posArgs.length) {
          localEnv.set(pName, posArgs[idx]);
        } else if (Object.prototype.hasOwnProperty.call(kwargs, pName)) {
          localEnv.set(pName, kwargs[pName]);
        } else if (fn.defaults[idx] !== undefined) {
          localEnv.set(pName, fn.defaults[idx]);
        } else {
          throw new PyError("TypeError", `${fn.name}() faltando argumento '${pName}'`);
        }
      });
      try {
        this.execBlock(fn.body, localEnv);
      } catch (sig) {
        if (sig instanceof ReturnSignal) return sig.value;
        throw sig;
      }
      return null;
    }
    throw new PyError("TypeError", `'${pyTypeName(fn)}' não é chamável`);
  }

  evalCompareOp(op: string, left: PyVal, right: PyVal): boolean {
    switch (op) {
      case "==":
        return pyEquals(left, right);
      case "!=":
        return !pyEquals(left, right);
      case "<":
        return (left as number) < (right as number);
      case "<=":
        return (left as number) <= (right as number);
      case ">":
        return (left as number) > (right as number);
      case ">=":
        return (left as number) >= (right as number);
      case "is":
        return left === right;
      case "is not":
        return left !== right;
      case "in":
        if (typeof right === "string") return right.includes(String(left));
        if (Array.isArray(right)) return right.some(v => pyEquals(v, left));
        if (right instanceof PyTuple || right instanceof PySet) return right.items.some(v => pyEquals(v, left));
        if (right instanceof Map) return right.has(left);
        if (right instanceof PyRange) return right.includes(left);
        throw new PyError("TypeError", `'${pyTypeName(right)}' não é iterável`);
      case "not in":
        return !this.evalCompareOp("in", left, right);
      default:
        return false;
    }
  }

  evalExpr(expr: Expr, env: PyEnv): PyVal {
    switch (expr.type) {
      case "Literal":
        return expr.value;
      case "Ident":
        return env.get(expr.name);
      case "FString":
        return this.evalFString(expr.template, env);
      case "List":
        return expr.elements.map(e => this.evalExpr(e, env));
      case "Tuple":
        return new PyTuple(expr.items.map(e => this.evalExpr(e, env)));
      case "Set":
        return new PySet(expr.elements.map(e => this.evalExpr(e, env)));
      case "Dict": {
        const m = new Map();
        for (const { key, val } of expr.entries) m.set(this.evalExpr(key, env), this.evalExpr(val, env));
        return m;
      }
      case "ListComp": {
        const items = pyIterableToArray(this.evalExpr(expr.iter, env));
        const compEnv = new PyEnv(env);
        const out: PyVal[] = [];
        for (const item of items) {
          this.tick();
          if (expr.targets.length === 1) {
            compEnv.set(expr.targets[0], item);
          } else {
            const parts = pyIterableToArray(item);
            expr.targets.forEach((t, idx) => compEnv.set(t, parts[idx]));
          }
          if (!expr.cond || pyTruthiness(this.evalExpr(expr.cond, compEnv))) {
            out.push(this.evalExpr(expr.elt, compEnv));
          }
        }
        return out;
      }
      case "Lambda":
        return new PyFunction("<lambda>", expr.params, [], [{ type: "Return", value: expr.body }], env);
      case "Unary": {
        const val = this.evalExpr(expr.arg, env);
        if (expr.op === "not") return !pyTruthiness(val);
        if (expr.op === "-") return -Number(val);
        return +Number(val);
      }
      case "Binary":
        return this.applyBinaryOp(expr.op, this.evalExpr(expr.left, env), this.evalExpr(expr.right, env));
      case "BoolOp": {
        const left = this.evalExpr(expr.left, env);
        if (expr.op === "and") return pyTruthiness(left) ? this.evalExpr(expr.right, env) : left;
        return pyTruthiness(left) ? left : this.evalExpr(expr.right, env);
      }
      case "Ternary":
        return pyTruthiness(this.evalExpr(expr.test, env))
          ? this.evalExpr(expr.consequent, env)
          : this.evalExpr(expr.alternate, env);
      case "Compare": {
        let left = this.evalExpr(expr.first, env);
        for (const step of expr.ops) {
          const right = this.evalExpr(step.right, env);
          if (!this.evalCompareOp(step.op, left, right)) return false;
          left = right;
        }
        return true;
      }
      case "Member":
        return this.evalMember(this.evalExpr(expr.obj, env), expr.prop);
      case "Subscript": {
        const container = this.evalExpr(expr.obj, env);
        const key = this.evalExpr(expr.index, env);
        if (typeof container === "string" || Array.isArray(container)) {
          const idx = Number(key) < 0 ? container.length + Number(key) : Number(key);
          if (idx < 0 || idx >= container.length) throw new PyError("IndexError", "índice fora dos limites");
          return container[idx];
        }
        if (container instanceof PyTuple) {
          const idx = Number(key) < 0 ? container.items.length + Number(key) : Number(key);
          if (idx < 0 || idx >= container.items.length) throw new PyError("IndexError", "índice fora dos limites");
          return container.items[idx];
        }
        if (container instanceof PyRange) return container.at(Number(key));
        if (container instanceof Map) {
          if (!container.has(key)) throw new PyError("KeyError", `chave ${pyRepr(key)} não encontrada`);
          return container.get(key);
        }
        throw new PyError("TypeError", `'${pyTypeName(container)}' não suporta indexação`);
      }
      case "Slice":
        return pySliceSeq(
          this.evalExpr(expr.obj, env),
          expr.start ? this.evalExpr(expr.start, env) : null,
          expr.stop ? this.evalExpr(expr.stop, env) : null,
          expr.step ? this.evalExpr(expr.step, env) : null
        );
      case "Call": {
        const callee = this.evalExpr(expr.callee, env);
        const posArgs: PyVal[] = [];
        const kwargs: Record<string, PyVal> = {};
        for (const a of expr.args) {
          const val = this.evalExpr(a.value, env);
          if (a.kwName) kwargs[a.kwName] = val;
          else posArgs.push(val);
        }
        return this.callCallable(callee, posArgs, kwargs);
      }
    }
  }
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

const BUILTIN_NAMES = new Set([
  "print", "input", "len", "type", "range", "enumerate", "zip", "int", "float",
  "str", "bool", "list", "tuple", "set", "dict", "abs", "round", "sum", "min",
  "max", "sorted", "reversed", "any", "all", "isinstance",
]);

export function executePythonCode(
  code: string,
  stdin = "",
  testCases: TestCaseSpec[] = []
): CodeRunResponse {
  const startedAt = performance.now();
  const source = String(code ?? "");

  if (!source.trim()) {
    return {
      success: false,
      output: [],
      outputText: "",
      error: "Escreva algum código Python antes de executar.",
      variables: [],
      scope: {},
      varTypes: {},
      testResults: [],
      durationMs: 0,
    };
  }

  const runtime = new PythonRuntime(stdin);

  try {
    const tokens = tokenizePython(source);
    const ast = new PythonParser(tokens).parseProgram();
    runtime.execBlock(ast, runtime.globalEnv);

    const variables: VariableEntry[] = [];
    const cleanScope: Record<string, unknown> = {};
    const varTypes: Record<string, string> = {};

    for (const [k, v] of Object.entries(runtime.globalEnv.vars)) {
      if (BUILTIN_NAMES.has(k) && typeof v === "function") continue;
      const tName = pyTypeName(v);
      varTypes[k] = tName;
      variables.push({
        name: k,
        value: pyRepr(v),
        type: tName,
      });
      cleanScope[k] = toJsValue(v);
    }

    const outputText = runtime.output.join("\n");
    const testResults: TestCaseResult[] = testCases.map(tc => {
      try {
        if (tc.stdin !== undefined) {
          const subRt = new PythonRuntime(tc.stdin);
          const subTokens = tokenizePython(source);
          const subAst = new PythonParser(subTokens).parseProgram();
          subRt.execBlock(subAst, subRt.globalEnv);
          const subOut = subRt.output.join("\n");
          if (tc.assertOutputIncludes !== undefined) {
            return {
              id: tc.id,
              label: tc.label,
              passed: subOut.includes(tc.assertOutputIncludes),
              expected: `conter "${tc.assertOutputIncludes}"`,
              actual: subOut || "(sem saída)",
            };
          }
          if (tc.assertOutputEquals !== undefined) {
            return {
              id: tc.id,
              label: tc.label,
              passed: subOut.trim() === tc.assertOutputEquals.trim(),
              expected: tc.assertOutputEquals.trim(),
              actual: subOut.trim(),
            };
          }
        }
        if (tc.expression) {
          const resVal = toJsValue(runtime.evalInlineExpr(tc.expression, runtime.globalEnv));
          if ("assertReturnEquals" in tc && tc.assertReturnEquals !== undefined) {
            return {
              id: tc.id,
              label: tc.label,
              passed: deepEqual(resVal, toJsValue(toPyValue(tc.assertReturnEquals))),
              expected: JSON.stringify(tc.assertReturnEquals),
              actual: JSON.stringify(resVal),
            };
          }
          return { id: tc.id, label: tc.label, passed: Boolean(resVal) };
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
        return { id: tc.id, label: tc.label, passed: true };
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
      success: true,
      output: runtime.output,
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
      output: runtime.output,
      outputText: runtime.output.join("\n"),
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
