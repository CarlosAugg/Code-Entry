import type { WebInspectionSpec, WebProjectFiles } from "../../types/curriculum";

/**
 * MODELO DE ISOLAMENTO E LIMITAÇÕES CONHECIDAS DA PRÉ-VISUALIZAÇÃO WEB:
 *
 * 1. Isolamento por iframe com origem opaca:
 *    O atributo `sandbox` usa apenas `allow-scripts allow-forms` (SEM `allow-same-origin`,
 *    `allow-top-navigation`, `allow-popups` ou `allow-modals`). Por ter origem opaca (`null`),
 *    o código do aluno não consegue ler o DOM do Code Entry (`window.parent.document`),
 *    IndexedDB, localStorage/sessionStorage nem cookies da plataforma principal.
 *
 * 2. Content Security Policy (CSP) restritiva via `<meta>`:
 *    Bloqueia requisições externas (`connect-src 'none'`, `default-src 'none'`), mídias/objetos
 *    e frames aninhados (`frame-src 'none'`), permitindo apenas scripts/estilos inline gerados
 *    pelo próprio ambiente e imagens `data:` / `blob:` (ex.: SVGs inline didáticos).
 *
 * 3. Sanitização e instrumentação de código:
 *    - `index.html`: remove tags ativas perigosas (`<script>`, `<iframe>`, `<object>`, `<embed>`,
 *      `<base>`, `<link>`, `<meta http-equiv="refresh">`), atributos `on*=` inline e URLs `javascript:`.
 *    - `style.css`: neutraliza fechamentos `</style>` e remove `@import` externos.
 *    - `script.js`: neutraliza `</script>` e `<!--`, além de injetar contador de iterações
 *      (`__ceTick`) em laços `for`/`while`/`do` para interromper loops infinitos síncronos.
 *
 * 4. Limitações conhecidas (por que não afirmar proteção absoluta):
 *    - Embora isolado por origem opaca, o iframe roda no mesmo processo de renderização de abas
 *      que compartilha origem/site quando o navegador não aplica out-of-process subframes para `srcdoc`.
 *    - A instrumentação lexical de loops cobre laços síncronos com bloco `{ }`; chamadas recursivas
 *      infinitas ou timers contínuos podem ainda consumir CPU até o watchdog (2.500 ms) desmontar/resetar
 *      a execução.
 *    - Recursos externos de rede (CDNs, APIs externas) ficam intencionalmente bloqueados por padrão.
 */

export const WEB_SANDBOX_ATTR = "allow-scripts allow-forms";

export const WEB_SANDBOX_CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none';";

export const WEB_MAX_CONSOLE_MESSAGES = 80;
export const WEB_MAX_CONSOLE_CHARS = 600;
export const WEB_WATCHDOG_MS = 2500;
export const WEB_MAX_LOOP_TICKS = 50_000;

export function sanitizeCssForStyleTag(css: string): string {
  const raw = typeof css === "string" ? css : "";
  return raw
    .replace(/<\/\s*style/gi, "/* fechamento style bloqueado */")
    .replace(
      /@import\s+(?:url\s*\(\s*)?["']?(?:https?:)?\/\/[^;]+;?/gi,
      "/* @import externo bloqueado neste ambiente isolado */"
    );
}

export function sanitizeHtmlForSandbox(html: string): {
  bodyHtml: string;
  title: string;
  lang: string;
  warnings: string[];
} {
  const warnings: string[] = [];
  let source = typeof html === "string" ? html : "";

  const langMatch = source.match(/<html\b[^>]*\blang\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const lang = (langMatch?.[1] || langMatch?.[2] || langMatch?.[3] || "").trim();

  const titleMatch = source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = (titleMatch?.[1] || "").replace(/\s+/g, " ").trim();

  const bodyMatch = source.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    source = bodyMatch[1];
  } else {
    source = source
      .replace(/<!DOCTYPE\b[^>]*>/gi, "")
      .replace(/<\/?(?:html|head)\b[^>]*>/gi, "")
      .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
      .replace(/<meta\b[^>]*>/gi, "");
  }

  let warnedExternal = false;
  let warnedInlineScript = false;

  source = source.replace(/<link\b([^>]*)>/gi, (_full, attrs: string) => {
    const isExternal = /(?:https?:)?\/\//i.test(attrs);
    if (isExternal && !warnedExternal) {
      warnedExternal = true;
      warnings.push("Links externos em <link> foram ignorados: o CSS da lição já é carregado pelo arquivo style.css.");
    }
    return "";
  });

  source = source.replace(/<script\b([^>]*)>[\s\S]*?<\/script\s*>/gi, (_full, attrs: string) => {
    if (/(?:https?:)?\/\//i.test(attrs)) {
      if (!warnedExternal) {
        warnedExternal = true;
        warnings.push("Scripts externos em <script src> são bloqueados neste ambiente isolado.");
      }
    } else if (!/\bsrc\s*=\s*["']?\s*(?:\.\/)?script\.js/i.test(attrs) && !warnedInlineScript) {
      warnedInlineScript = true;
      warnings.push("Tags <script> dentro do HTML foram removidas: escreva seu JavaScript na aba script.js.");
    }
    return "";
  });

  source = source
    .replace(/<\/?script\b[^>]*>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi, "")
    .replace(/<(?:iframe|object|embed|applet|base)\b[^>]*\/?>/gi, "")
    .replace(/<meta\b[^>]*http-equiv\s*=\s*["']?refresh[^>]*>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, () => {
      if (!warnedInlineScript) {
        warnedInlineScript = true;
        warnings.push("Atributos inline de evento (on*) foram removidos: use addEventListener() em script.js.");
      }
      return "";
    })
    .replace(
      /\b(href|src|action)\s*=\s*(?:"\s*(?:javascript|vbscript):[^"]*"|'\s*(?:javascript|vbscript):[^']*'|(?:javascript|vbscript):[^\s>]+)/gi,
      '$1="#"'
    );

  return {
    bodyHtml: source.trim(),
    title,
    lang,
    warnings,
  };
}

export function instrumentStudentJs(js: string): string {
  const source = typeof js === "string" ? js : "";
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

    const slice = source.slice(i);
    const isWordBoundary = i === 0 || !/[A-Za-z0-9_$]/.test(source[i - 1]);

    if (isWordBoundary) {
      const doMatch = slice.match(/^do\b\s*\{/);
      if (doMatch) {
        out += doMatch[0] + " __ceTick();";
        i += doMatch[0].length;
        continue;
      }

      const loopMatch = slice.match(/^(?:for|while)\s*\(/);
      if (loopMatch) {
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
            out += source.slice(i, k + 1) + " __ceTick();";
            i = k + 1;
            continue;
          }
          if (source[k] === ";") {
            out += source.slice(i, j + 1) + " { __ceTick(); }";
            i = k + 1;
            continue;
          }
        }
      }
    }

    out += ch;
    i++;
  }

  return out
    .replace(/<\/(?=script)/gi, "<\\/")
    .replace(/<!--/g, "<\\!--");
}

function escapeJsonForScriptTag(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function buildSandboxedSrcDoc(opts: {
  files: WebProjectFiles;
  runId: number;
  token: string;
  inspection?: WebInspectionSpec;
  runInteractions?: boolean;
}): string {
  const { files, runId, token, inspection, runInteractions = false } = opts;
  const htmlSan = sanitizeHtmlForSandbox(files.html);
  const safeCss = sanitizeCssForStyleTag(files.css);
  const safeJs = instrumentStudentJs(files.js);
  const hasExternalImportInCss = /@import\s+(?:url\s*\(\s*)?["']?(?:https?:)?\/\//i.test(files.css || "");
  const initialWarnings = [...htmlSan.warnings];
  if (hasExternalImportInCss) {
    initialWarnings.push("Importação externa (@import) em style.css foi bloqueada pelo modo isolado.");
  }

  const bootstrapPayload = escapeJsonForScriptTag({
    runId,
    token,
    title: htmlSan.title,
    lang: htmlSan.lang,
    maxMsgs: WEB_MAX_CONSOLE_MESSAGES,
    maxChars: WEB_MAX_CONSOLE_CHARS,
    maxTicks: WEB_MAX_LOOP_TICKS,
    warnings: initialWarnings,
    inspection: inspection || { selectors: [], styleProps: [], interactions: [] },
    runInteractions,
  });

  return `<!DOCTYPE html>
<html${htmlSan.lang ? ` lang="${htmlSan.lang.replace(/"/g, "")}"` : ' lang="pt-BR"'}>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="${WEB_SANDBOX_CSP}" />
  <title>${htmlSan.title.replace(/</g, "&lt;") || "Pré-visualização Web"}</title>
  <style id="ce-base-style">
    html, body {
      margin: 0;
      padding: 0;
      min-height: 100%;
      background: #ffffff;
      color: #111827;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }
    body {
      padding: 16px;
    }
  </style>
  <style id="ce-student-style">
${safeCss}
  </style>
</head>
<body>
${htmlSan.bodyHtml}
<script>
(function () {
  var cfg = ${bootstrapPayload};
  var msgCount = 0;
  var ticks = 0;
  var runtimeErrors = [];
  var consoleEntries = [];

  function clampText(text) {
    var s = String(text == null ? "" : text);
    if (s.length > cfg.maxChars) {
      return s.slice(0, cfg.maxChars) + "... [mensagem resumida]";
    }
    return s;
  }

  function friendlyErrorMessage(raw) {
    var msg = String(raw || "Erro ao executar script.");
    if (msg.indexOf("__CE_LOOP_LIMIT__") !== -1) {
      return "Execução interrompida: laço de repetição ultrapassou 50.000 iterações (possível loop infinito).";
    }
    if (/SecurityError|cross-origin|localStorage|sessionStorage|indexedDB|cookie/i.test(msg)) {
      return "Acesso bloqueado: a página em pré-visualização roda isolada e não pode ler dados do Code Entry.";
    }
    if (/ReferenceError:/i.test(msg)) {
      return "Erro de referência: " + msg.replace(/^ReferenceError:\s*/i, "") + " (verifique nomes de variáveis ou seletores).";
    }
    if (/SyntaxError:/i.test(msg)) {
      return "Erro de sintaxe JavaScript: " + msg.replace(/^SyntaxError:\s*/i, "") + " (confira parênteses, chaves e aspas).";
    }
    if (/TypeError:/i.test(msg)) {
      return "Erro de tipo: " + msg.replace(/^TypeError:\s*/i, "") + " (verifique se o elemento encontrado no DOM não é null).";
    }
    return clampText(msg);
  }

  function formatArg(val, depth) {
    if (val === null) return "null";
    if (val === undefined) return "undefined";
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    if (typeof val === "function") return "[Função " + (val.name || "anônima") + "]";
    if (depth > 2) return "[Objeto]";
    try {
      if (typeof HTMLElement !== "undefined" && val instanceof HTMLElement) {
        return "<" + val.tagName.toLowerCase() + (val.id ? "#" + val.id : "") + ">";
      }
      if (Array.isArray(val)) {
        return "[" + val.slice(0, 20).map(function (item) { return formatArg(item, depth + 1); }).join(", ") + "]";
      }
      return JSON.stringify(val);
    } catch (e) {
      return String(val);
    }
  }

  function post(kind, payload) {
    try {
      window.parent.postMessage({
        channel: "code-entry-web-sandbox",
        token: cfg.token,
        runId: cfg.runId,
        kind: kind,
        payload: payload
      }, "*");
    } catch (e) {}
  }

  function emitConsole(level, text) {
    if (msgCount >= cfg.maxMsgs) {
      if (msgCount === cfg.maxMsgs) {
        msgCount++;
        var notice = { level: "warn", text: "Limite de " + cfg.maxMsgs + " mensagens no console atingido.", timestamp: Date.now() };
        consoleEntries.push(notice);
        post("console", notice);
      }
      return;
    }
    msgCount++;
    var entry = { level: level, text: clampText(text), timestamp: Date.now() };
    consoleEntries.push(entry);
    post("console", entry);
  }

  window.__ceTick = function () {
    ticks++;
    if (ticks > cfg.maxTicks) {
      throw new Error("__CE_LOOP_LIMIT__");
    }
  };

  window.__ceReportState = function (extraErrors) {
    if (Array.isArray(extraErrors)) {
      for (var i = 0; i < extraErrors.length; i++) {
        runtimeErrors.push(extraErrors[i]);
      }
    }
    var queries = {};
    var selectors = (cfg.inspection && cfg.inspection.selectors) || [];
    var styleProps = (cfg.inspection && cfg.inspection.styleProps) || [
      "display",
      "color",
      "background-color",
      "font-size",
      "padding",
      "margin",
      "border",
      "border-radius",
      "gap",
      "grid-template-columns",
      "flex-direction",
      "box-sizing"
    ];

    for (var s = 0; s < selectors.length; s++) {
      var sel = selectors[s];
      try {
        var found = document.querySelectorAll(sel);
        var first = found[0] || null;
        var attrs = {};
        var styles = {};
        if (first) {
          for (var a = 0; a < first.attributes.length; a++) {
            var attr = first.attributes[a];
            attrs[attr.name] = attr.value;
          }
          var cs = window.getComputedStyle(first);
          for (var p = 0; p < styleProps.length; p++) {
            var prop = styleProps[p];
            styles[prop] = cs.getPropertyValue(prop);
          }
        }
        queries[sel] = {
          count: found.length,
          text: first ? (first.textContent || "").trim() : "",
          html: first ? (first.innerHTML || "").trim() : "",
          attrs: attrs,
          classes: first ? Array.prototype.slice.call(first.classList || []) : [],
          styles: styles,
          value: first && "value" in first ? String(first.value || "") : undefined
        };
      } catch (err) {
        queries[sel] = { count: 0, text: "", html: "", attrs: {}, classes: [], styles: {} };
      }
    }

    var interactions = {};
    var interSpecs = (cfg.runInteractions && cfg.inspection && cfg.inspection.interactions) || [];
    for (var idx = 0; idx < interSpecs.length; idx++) {
      var spec = interSpecs[idx];
      try {
        if (spec.fillSelector) {
          var inputEl = document.querySelector(spec.fillSelector);
          if (!inputEl) {
            interactions[spec.id] = { ok: false, error: "Campo não encontrado: " + spec.fillSelector };
            continue;
          }
          inputEl.value = spec.fillValue || "";
          inputEl.dispatchEvent(new Event("input", { bubbles: true }));
          inputEl.dispatchEvent(new Event("change", { bubbles: true }));
        }
        if (spec.clickSelector) {
          var clickEl = document.querySelector(spec.clickSelector);
          if (!clickEl) {
            interactions[spec.id] = { ok: false, error: "Elemento de clique não encontrado: " + spec.clickSelector };
            continue;
          }
          var times = spec.times || 1;
          for (var t = 0; t < times; t++) {
            clickEl.click();
          }
        }
        if (spec.submitSelector) {
          var formEl = document.querySelector(spec.submitSelector);
          if (!formEl) {
            interactions[spec.id] = { ok: false, error: "Formulário não encontrado: " + spec.submitSelector };
            continue;
          }
          formEl.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        }
        var obsAll = document.querySelectorAll(spec.observeSelector);
        var obsFirst = obsAll[0] || null;
        interactions[spec.id] = {
          ok: Boolean(obsFirst),
          text: obsFirst ? (obsFirst.textContent || "").trim() : "",
          count: obsAll.length,
          classes: obsFirst ? Array.prototype.slice.call(obsFirst.classList || []) : [],
          value: obsFirst && "value" in obsFirst ? String(obsFirst.value || "") : undefined
        };
      } catch (errInter) {
        interactions[spec.id] = { ok: false, error: friendlyErrorMessage(errInter && errInter.message ? errInter.message : errInter) };
      }
    }

    post("report", {
      title: cfg.title || document.title || "",
      lang: cfg.lang || document.documentElement.getAttribute("lang") || "",
      bodyText: (document.body ? document.body.textContent || "" : "").trim(),
      elementCount: document.body ? document.body.querySelectorAll("*").length : 0,
      consoleEntries: consoleEntries,
      runtimeErrors: runtimeErrors,
      queries: queries,
      interactions: interactions
    });
  };

  var origLog = console.log ? console.log.bind(console) : function () {};
  var origWarn = console.warn ? console.warn.bind(console) : origLog;
  var origErr = console.error ? console.error.bind(console) : origLog;
  var origInfo = console.info ? console.info.bind(console) : origLog;

  function makeConsoleHandler(level, fallbackFn) {
    return function () {
      var parts = [];
      for (var i = 0; i < arguments.length; i++) {
        parts.push(formatArg(arguments[i], 0));
      }
      var joined = parts.join(" ");
      emitConsole(level, joined);
      try { fallbackFn.apply(console, arguments); } catch (e) {}
    };
  }

  console.log = makeConsoleHandler("log", origLog);
  console.info = makeConsoleHandler("info", origInfo);
  console.warn = makeConsoleHandler("warn", origWarn);
  console.error = makeConsoleHandler("error", origErr);

  window.alert = function (m) { emitConsole("info", "[alert] " + formatArg(m, 0)); };
  window.confirm = function (m) { emitConsole("info", "[confirm bloqueado] " + formatArg(m, 0)); return false; };
  window.prompt = function (m) { emitConsole("info", "[prompt bloqueado] " + formatArg(m, 0)); return null; };

  window.addEventListener("error", function (ev) {
    var msg = friendlyErrorMessage((ev && ev.message) || (ev && ev.error && ev.error.message) || "Erro no código JavaScript.");
    runtimeErrors.push(msg);
    emitConsole("error", msg);
  });

  window.addEventListener("unhandledrejection", function (ev) {
    var reason = ev && ev.reason ? (ev.reason.message || String(ev.reason)) : "Promessa rejeitada sem tratamento.";
    var msg = friendlyErrorMessage(reason);
    runtimeErrors.push(msg);
    emitConsole("error", msg);
  });

  for (var w = 0; w < cfg.warnings.length; w++) {
    emitConsole("warn", cfg.warnings[w]);
  }
})();
</script>
<script>
${safeJs}
</script>
<script>
(function () {
  function runAfterLoad() {
    window.setTimeout(function () {
      if (typeof window.__ceReportState === "function") {
        window.__ceReportState();
      }
    }, 35);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runAfterLoad);
  } else {
    runAfterLoad();
  }
})();
</script>
</body>
</html>`;
}
