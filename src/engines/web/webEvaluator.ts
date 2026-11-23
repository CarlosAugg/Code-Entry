import type {
  WebConsoleEntry,
  WebElementReport,
  WebEvaluationState,
  WebInspectionSpec,
  WebInteractionReport,
  WebProjectFiles,
} from "../../types/curriculum";
import {
  instrumentStudentJs,
  sanitizeCssForStyleTag,
  sanitizeHtmlForSandbox,
  WEB_MAX_CONSOLE_CHARS,
  WEB_MAX_CONSOLE_MESSAGES,
  WEB_MAX_LOOP_TICKS,
} from "./webSandbox";

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

class MiniNode {
  tagName: string;
  attrs: Record<string, string> = {};
  children: MiniNode[] = [];
  textParts: string[] = [];
  parent: MiniNode | null = null;
  valueProp = "";
  listeners: Record<string, ((ev: MiniEvent) => void)[]> = {};

  constructor(tagName: string, attrs: Record<string, string> = {}) {
    this.tagName = tagName.toLowerCase();
    this.attrs = { ...attrs };
    if (typeof attrs.value === "string") {
      this.valueProp = attrs.value;
    }
  }

  get id(): string {
    return this.attrs.id || "";
  }
  set id(val: string) {
    this.attrs.id = String(val);
  }

  get className(): string {
    return this.attrs.class || "";
  }
  set className(val: string) {
    this.attrs.class = String(val);
  }

  get value(): string {
    return this.valueProp;
  }
  set value(val: string) {
    this.valueProp = String(val ?? "");
    this.attrs.value = this.valueProp;
  }

  get classList() {
    const getList = () =>
      (this.attrs.class || "")
        .split(/\s+/)
        .map(s => s.trim())
        .filter(Boolean);
    const setList = (arr: string[]) => {
      this.attrs.class = Array.from(new Set(arr)).join(" ");
    };
    return {
      add: (...tokens: string[]) => {
        setList([...getList(), ...tokens.filter(Boolean)]);
      },
      remove: (...tokens: string[]) => {
        const drop = new Set(tokens);
        setList(getList().filter(c => !drop.has(c)));
      },
      toggle: (token: string, force?: boolean) => {
        const cur = getList();
        const has = cur.includes(token);
        const shouldHave = force !== undefined ? force : !has;
        if (shouldHave && !has) setList([...cur, token]);
        else if (!shouldHave && has) setList(cur.filter(c => c !== token));
        return shouldHave;
      },
      contains: (token: string) => getList().includes(token),
    };
  }

  get textContent(): string {
    if (this.children.length === 0) return this.textParts.join("");
    let acc = this.textParts.join("");
    for (const c of this.children) acc += c.textContent;
    return acc;
  }

  set textContent(val: string) {
    this.children = [];
    this.textParts = [String(val ?? "")];
  }

  get innerHTML(): string {
    if (this.children.length === 0) return this.textParts.join("");
    return (
      this.textParts.join("") +
      this.children.map(c => c.outerHTML).join("")
    );
  }

  set innerHTML(html: string) {
    this.children = [];
    this.textParts = [];
    const parsed = parseHtmlFragment(String(html ?? ""));
    for (const child of parsed.children) {
      this.appendChild(child);
    }
    if (parsed.textParts.length > 0 && parsed.children.length === 0) {
      this.textParts = parsed.textParts;
    }
  }

  get outerHTML(): string {
    const attrStr = Object.entries(this.attrs)
      .map(([k, v]) => ` ${k}="${v.replace(/"/g, "&quot;")}"`)
      .join("");
    if (VOID_TAGS.has(this.tagName)) return `<${this.tagName}${attrStr}>`;
    return `<${this.tagName}${attrStr}>${this.innerHTML}</${this.tagName}>`;
  }

  get style(): Record<string, string> {
    const self = this;
    return new Proxy(
      {},
      {
        set(_t, prop, val) {
          const cssProp = String(prop).replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
          const prev = (self.attrs.style || "")
            .split(";")
            .map(s => s.trim())
            .filter(Boolean)
            .filter(item => !item.toLowerCase().startsWith(cssProp + ":"));
          if (val !== "" && val != null) {
            prev.push(`${cssProp}: ${String(val)}`);
          }
          self.attrs.style = prev.join("; ");
          return true;
        },
        get(_t, prop) {
          const cssProp = String(prop).replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
          const pairs = (self.attrs.style || "").split(";").map(s => s.trim());
          for (const pair of pairs) {
            const idx = pair.indexOf(":");
            if (idx > 0 && pair.slice(0, idx).trim().toLowerCase() === cssProp) {
              return pair.slice(idx + 1).trim();
            }
          }
          return "";
        },
      }
    );
  }

  getAttribute(name: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.attrs, name) ? this.attrs[name] : null;
  }

  setAttribute(name: string, val: string): void {
    this.attrs[name] = String(val);
    if (name === "value") this.valueProp = String(val);
  }

  removeAttribute(name: string): void {
    delete this.attrs[name];
  }

  appendChild(node: MiniNode): MiniNode {
    node.parent = this;
    this.children.push(node);
    return node;
  }

  remove(): void {
    if (!this.parent) return;
    this.parent.children = this.parent.children.filter(c => c !== this);
    this.parent = null;
  }

  addEventListener(type: string, fn: (ev: MiniEvent) => void): void {
    if (typeof fn !== "function") return;
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }

  dispatchEvent(ev: MiniEvent): boolean {
    let cur: MiniNode | null = this;
    ev.target = this;
    while (cur) {
      ev.currentTarget = cur;
      const list = cur.listeners[ev.type] || [];
      for (const fn of list) {
        fn(ev);
      }
      if (!ev.bubbles || ev.propagationStopped) break;
      cur = cur.parent;
    }
    return !ev.defaultPrevented;
  }

  click(): void {
    this.dispatchEvent(new MiniEvent("click", { bubbles: true, cancelable: true }));
  }

  matches(selector: string): boolean {
    return matchesSelectorList(this, selector);
  }

  closest(selector: string): MiniNode | null {
    let cur: MiniNode | null = this;
    while (cur && cur.tagName !== "#root") {
      if (matchesSelectorList(cur, selector)) return cur;
      cur = cur.parent;
    }
    return null;
  }

  querySelector(selector: string): MiniNode | null {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector: string): MiniNode[] {
    const out: MiniNode[] = [];
    const walk = (node: MiniNode) => {
      for (const child of node.children) {
        if (matchesSelectorList(child, selector)) out.push(child);
        walk(child);
      }
    };
    walk(this);
    return out;
  }
}

class MiniEvent {
  type: string;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented = false;
  propagationStopped = false;
  target: MiniNode | null = null;
  currentTarget: MiniNode | null = null;

  constructor(type: string, init?: { bubbles?: boolean; cancelable?: boolean }) {
    this.type = type;
    this.bubbles = Boolean(init?.bubbles);
    this.cancelable = Boolean(init?.cancelable);
  }

  preventDefault(): void {
    if (this.cancelable) this.defaultPrevented = true;
  }

  stopPropagation(): void {
    this.propagationStopped = true;
  }
}

function parseAttributes(attrText: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const rx = /([:@a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(attrText)) !== null) {
    const key = m[1].toLowerCase();
    const val = m[2] ?? m[3] ?? m[4] ?? "";
    attrs[key] = val;
  }
  return attrs;
}

function parseHtmlFragment(html: string): MiniNode {
  const root = new MiniNode("body");
  const stack: MiniNode[] = [root];
  const clean = html.replace(/<!--[\s\S]*?-->/g, "");
  let idx = 0;

  while (idx < clean.length) {
    const lt = clean.indexOf("<", idx);
    if (lt === -1) {
      const tail = clean.slice(idx);
      if (tail) stack[stack.length - 1].textParts.push(tail);
      break;
    }
    if (lt > idx) {
      stack[stack.length - 1].textParts.push(clean.slice(idx, lt));
    }
    const gt = clean.indexOf(">", lt);
    if (gt === -1) {
      stack[stack.length - 1].textParts.push(clean.slice(lt));
      break;
    }
    const token = clean.slice(lt + 1, gt).trim();
    idx = gt + 1;
    if (!token) continue;

    if (token.startsWith("/")) {
      const closeTag = token.slice(1).trim().toLowerCase();
      for (let s = stack.length - 1; s >= 1; s--) {
        if (stack[s].tagName === closeTag) {
          stack.length = s;
          break;
        }
      }
      continue;
    }

    const selfClosing = token.endsWith("/");
    const inner = selfClosing ? token.slice(0, -1).trim() : token;
    const spaceIdx = inner.search(/\s/);
    const tag = (spaceIdx === -1 ? inner : inner.slice(0, spaceIdx)).toLowerCase();
    const attrPart = spaceIdx === -1 ? "" : inner.slice(spaceIdx + 1);
    const el = new MiniNode(tag, parseAttributes(attrPart));
    stack[stack.length - 1].appendChild(el);
    if (!selfClosing && !VOID_TAGS.has(tag)) {
      stack.push(el);
    }
  }

  return root;
}

function matchesSimpleSelector(node: MiniNode, part: string): boolean {
  if (!part || node.tagName === "#root") return false;
  let rest = part.trim();
  if (rest === "*") return true;

  // Attribute selectors [attr] ou [attr="val"]
  while (true) {
    const attrMatch = rest.match(/\[([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\]]*)))?\]/);
    if (!attrMatch) break;
    const key = attrMatch[1].toLowerCase();
    const expected = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4];
    const actual = node.getAttribute(key);
    if (actual === null) return false;
    if (expected !== undefined && actual !== expected) return false;
    rest = rest.replace(attrMatch[0], "");
  }

  // Strip pseudo-classes like :hover or :focus for structural matching
  rest = rest.replace(/:[a-zA-Z0-9_-]+(?:\([^)]*\))?/g, "");

  const tagMatch = rest.match(/^([a-zA-Z][a-zA-Z0-9-]*)/);
  if (tagMatch) {
    if (node.tagName !== tagMatch[1].toLowerCase()) return false;
    rest = rest.slice(tagMatch[0].length);
  }

  const idMatches = rest.match(/#[a-zA-Z0-9_-]+/g) || [];
  for (const idSel of idMatches) {
    if (node.id !== idSel.slice(1)) return false;
  }

  const classMatches = rest.match(/\.[a-zA-Z0-9_-]+/g) || [];
  const nodeClasses = new Set(node.className.split(/\s+/).filter(Boolean));
  for (const clsSel of classMatches) {
    if (!nodeClasses.has(clsSel.slice(1))) return false;
  }

  return Boolean(tagMatch || idMatches.length || classMatches.length || part.includes("["));
}

function matchesSingleChain(node: MiniNode, selector: string): boolean {
  const normalized = selector.replace(/\s*>\s*/g, " > ").trim();
  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  if (!matchesSimpleSelector(node, tokens[tokens.length - 1])) return false;

  let cur: MiniNode | null = node;
  for (let i = tokens.length - 2; i >= 0; i--) {
    if (tokens[i] === ">") {
      const parentSel = tokens[--i];
      cur = cur?.parent || null;
      if (!cur || !matchesSimpleSelector(cur, parentSel)) return false;
    } else {
      let anc: MiniNode | null = cur?.parent || null;
      let found: MiniNode | null = null;
      while (anc && anc.tagName !== "#root") {
        if (matchesSimpleSelector(anc, tokens[i])) {
          found = anc;
          break;
        }
        anc = anc.parent;
      }
      if (!found) return false;
      cur = found;
    }
  }
  return true;
}

function matchesSelectorList(node: MiniNode, selectorList: string): boolean {
  return selectorList
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .some(sel => matchesSingleChain(node, sel));
}

interface ParsedCssRule {
  selector: string;
  decls: Record<string, string>;
}

function parseCssRules(cssText: string): ParsedCssRule[] {
  const cleaned = sanitizeCssForStyleTag(cssText).replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: ParsedCssRule[] = [];

  const extractBlockDecls = (body: string): Record<string, string> => {
    const decls: Record<string, string> = {};
    for (const item of body.split(";")) {
      const colon = item.indexOf(":");
      if (colon <= 0) continue;
      const prop = item.slice(0, colon).trim().toLowerCase();
      const val = item.slice(colon + 1).trim();
      if (prop && val) {
        decls[prop] = val;
        if (prop === "background" && !decls["background-color"] && !val.includes("gradient")) {
          decls["background-color"] = val;
        }
      }
    }
    return decls;
  };

  let i = 0;
  while (i < cleaned.length) {
    const open = cleaned.indexOf("{", i);
    if (open === -1) break;
    const header = cleaned.slice(i, open).trim();

    let depth = 1;
    let j = open + 1;
    while (j < cleaned.length && depth > 0) {
      if (cleaned[j] === "{") depth++;
      else if (cleaned[j] === "}") depth--;
      j++;
    }
    const blockBody = cleaned.slice(open + 1, j - 1);
    i = j;

    if (header.startsWith("@media")) {
      rules.push(...parseCssRules(blockBody));
    } else if (!header.startsWith("@")) {
      const decls = extractBlockDecls(blockBody);
      for (const sel of header.split(",").map(s => s.trim()).filter(Boolean)) {
        rules.push({ selector: sel, decls });
      }
    }
  }

  return rules;
}

function computeHeadlessStyles(node: MiniNode, rules: ParsedCssRule[]): Record<string, string> {
  const styles: Record<string, string> = {};
  for (const rule of rules) {
    if (matchesSelectorList(node, rule.selector)) {
      Object.assign(styles, rule.decls);
    }
  }
  const inline = (node.attrs.style || "").split(";").map(s => s.trim()).filter(Boolean);
  for (const item of inline) {
    const colon = item.indexOf(":");
    if (colon > 0) {
      styles[item.slice(0, colon).trim().toLowerCase()] = item.slice(colon + 1).trim();
    }
  }
  return styles;
}

const BLOCKED_GLOBALS = [
  "window",
  "globalThis",
  "self",
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "importScripts",
  "Function",
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "postMessage",
  "process",
  "require",
];

export function evaluateWebProjectHeadless(
  files: WebProjectFiles,
  inspection?: WebInspectionSpec
): WebEvaluationState {
  const htmlSan = sanitizeHtmlForSandbox(files.html);
  const body = parseHtmlFragment(htmlSan.bodyHtml);
  const docRoot = new MiniNode("#root");
  const htmlNode = new MiniNode("html", htmlSan.lang ? { lang: htmlSan.lang } : {});
  docRoot.appendChild(htmlNode);
  htmlNode.appendChild(body);
  const cssRules = parseCssRules(files.css);
  const consoleEntries: WebConsoleEntry[] = [];
  const runtimeErrors: string[] = [];
  const docListeners: Record<string, ((ev: MiniEvent) => void)[]> = {};
  let ticks = 0;

  const pushConsole = (level: WebConsoleEntry["level"], args: unknown[]) => {
    if (consoleEntries.length >= WEB_MAX_CONSOLE_MESSAGES) return;
    const text = args
      .map(a => (typeof a === "object" && a !== null ? JSON.stringify(a) : String(a)))
      .join(" ")
      .slice(0, WEB_MAX_CONSOLE_CHARS);
    consoleEntries.push({ level, text, timestamp: Date.now() });
  };

  for (const warn of htmlSan.warnings) {
    pushConsole("warn", [warn]);
  }

  const miniConsole = {
    log: (...args: unknown[]) => pushConsole("log", args),
    info: (...args: unknown[]) => pushConsole("info", args),
    warn: (...args: unknown[]) => pushConsole("warn", args),
    error: (...args: unknown[]) => pushConsole("error", args),
  };

  const docObj = {
    title: htmlSan.title,
    documentElement: htmlNode,
    body,
    querySelector: (sel: string) => docRoot.querySelector(sel),
    querySelectorAll: (sel: string) => docRoot.querySelectorAll(sel),
    getElementById: (id: string) => docRoot.querySelector(`#${id}`),
    createElement: (tag: string) => new MiniNode(tag),
    addEventListener: (type: string, fn: (ev: MiniEvent) => void) => {
      if (!docListeners[type]) docListeners[type] = [];
      docListeners[type].push(fn);
    },
  };

  const tickFn = () => {
    ticks++;
    if (ticks > WEB_MAX_LOOP_TICKS) {
      throw new Error("Execução interrompida: laço ultrapassou 50.000 iterações.");
    }
  };

  let timedOut = false;
  const instrumented = instrumentStudentJs(files.js || "");
  if (instrumented.trim()) {
    try {
      const fn = new Function(
        "__ceTick",
        "document",
        "console",
        "Event",
        ...BLOCKED_GLOBALS,
        `"use strict";\n${instrumented}`
      );
      fn(
        tickFn,
        docObj,
        miniConsole,
        MiniEvent,
        ...BLOCKED_GLOBALS.map(() => undefined)
      );
      for (const cb of docListeners.DOMContentLoaded || []) {
        cb(new MiniEvent("DOMContentLoaded"));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("50.000")) timedOut = true;
      runtimeErrors.push(msg);
      pushConsole("error", [msg]);
    }
  }

  const queries: Record<string, WebElementReport> = {};
  for (const sel of inspection?.selectors || []) {
    const matched = docRoot.querySelectorAll(sel);
    const first = matched[0] || null;
    queries[sel] = {
      count: matched.length,
      text: first ? first.textContent.trim() : "",
      html: first ? first.innerHTML.trim() : "",
      attrs: first ? { ...first.attrs } : {},
      classes: first ? first.className.split(/\s+/).filter(Boolean) : [],
      styles: first ? computeHeadlessStyles(first, cssRules) : {},
      value: first && (first.tagName === "input" || first.tagName === "textarea" || first.tagName === "select")
        ? first.value
        : undefined,
    };
  }

  const interactions: Record<string, WebInteractionReport> = {};
  for (const spec of inspection?.interactions || []) {
    try {
      if (spec.fillSelector) {
        const inputEl = docRoot.querySelector(spec.fillSelector);
        if (!inputEl) {
          interactions[spec.id] = { ok: false, error: `Campo não encontrado: ${spec.fillSelector}` };
          continue;
        }
        inputEl.value = spec.fillValue ?? "";
        inputEl.dispatchEvent(new MiniEvent("input", { bubbles: true }));
        inputEl.dispatchEvent(new MiniEvent("change", { bubbles: true }));
      }
      if (spec.clickSelector) {
        const clickEl = docRoot.querySelector(spec.clickSelector);
        if (!clickEl) {
          interactions[spec.id] = { ok: false, error: `Elemento não encontrado: ${spec.clickSelector}` };
          continue;
        }
        const times = spec.times || 1;
        for (let t = 0; t < times; t++) clickEl.click();
      }
      if (spec.submitSelector) {
        const formEl = docRoot.querySelector(spec.submitSelector);
        if (!formEl) {
          interactions[spec.id] = { ok: false, error: `Formulário não encontrado: ${spec.submitSelector}` };
          continue;
        }
        formEl.dispatchEvent(new MiniEvent("submit", { bubbles: true, cancelable: true }));
      }
      const obsAll = docRoot.querySelectorAll(spec.observeSelector);
      const obsFirst = obsAll[0] || null;
      interactions[spec.id] = {
        ok: Boolean(obsFirst),
        text: obsFirst ? obsFirst.textContent.trim() : "",
        count: obsAll.length,
        classes: obsFirst ? obsFirst.className.split(/\s+/).filter(Boolean) : [],
        value: obsFirst && (obsFirst.tagName === "input" || obsFirst.tagName === "textarea")
          ? obsFirst.value
          : undefined,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      runtimeErrors.push(msg);
      interactions[spec.id] = { ok: false, error: msg };
    }
  }

  return {
    files,
    title: docObj.title,
    lang: htmlSan.lang,
    bodyText: body.textContent.trim(),
    elementCount: body.querySelectorAll("*").length,
    consoleEntries,
    runtimeErrors,
    queries,
    interactions,
    timedOut,
  };
}
