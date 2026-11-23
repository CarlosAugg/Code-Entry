import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, X } from "lucide-react";
import { EditorSelection, EditorState, Compartment, Prec } from "@codemirror/state";
import {
  EditorView,
  hoverTooltip,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, defaultHighlightStyle, HighlightStyle, indentUnit, syntaxHighlighting } from "@codemirror/language";
import { autocompletion, completeFromList } from "@codemirror/autocomplete";
import { linter, lintGutter, type Diagnostic } from "@codemirror/lint";
import { searchKeymap } from "@codemirror/search";
import { cpp } from "@codemirror/lang-cpp";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { sql, SQLite } from "@codemirror/lang-sql";
import { tags } from "@lezer/highlight";
import { usePlatform } from "../../context/PlatformContext";
import { findGlossaryEntryForCodeToken, type GlossaryEntry } from "../../data/glossary";

export type EditorLanguage = "logic" | "cpp" | "js" | "python" | "sql" | "html" | "css";

interface CodeEditorProps {
  language: EditorLanguage;
  value: string;
  onChange: (next: string) => void;
  onRun?: () => void;
  minHeight?: number;
  ariaLabel?: string;
}

const DARK_HIGHLIGHT = HighlightStyle.define([
  { tag: tags.keyword, color: "#c084fc", fontWeight: "600" },
  { tag: tags.typeName, color: "#67e8f9" },
  { tag: tags.tagName, color: "#fb7185", fontWeight: "600" },
  { tag: tags.attributeName, color: "#38bdf8" },
  { tag: tags.attributeValue, color: "#fbbf24" },
  { tag: tags.propertyName, color: "#67e8f9" },
  { tag: tags.className, color: "#facc15" },
  { tag: tags.color, color: "#fb923c" },
  { tag: tags.unit, color: "#f472b6" },
  { tag: tags.angleBracket, color: "#94a3b8" },
  { tag: tags.string, color: "#fbbf24" },
  { tag: tags.number, color: "#fb923c" },
  { tag: tags.bool, color: "#f472b6" },
  { tag: tags.comment, color: "#64748b", fontStyle: "italic" },
  { tag: tags.function(tags.variableName), color: "#60a5fa" },
  { tag: tags.operator, color: "#94a3b8" },
  { tag: tags.meta, color: "#fda4af" },
]);

const LIGHT_HIGHLIGHT = HighlightStyle.define([
  { tag: tags.keyword, color: "#7c3aed", fontWeight: "600" },
  { tag: tags.typeName, color: "#0369a1" },
  { tag: tags.tagName, color: "#e11d48", fontWeight: "600" },
  { tag: tags.attributeName, color: "#0284c7" },
  { tag: tags.attributeValue, color: "#b45309" },
  { tag: tags.propertyName, color: "#0369a1" },
  { tag: tags.className, color: "#a16207" },
  { tag: tags.color, color: "#c2410c" },
  { tag: tags.unit, color: "#be185d" },
  { tag: tags.angleBracket, color: "#64748b" },
  { tag: tags.string, color: "#b45309" },
  { tag: tags.number, color: "#c2410c" },
  { tag: tags.bool, color: "#db2777" },
  { tag: tags.comment, color: "#94a3b8", fontStyle: "italic" },
  { tag: tags.function(tags.variableName), color: "#1d4ed8" },
  { tag: tags.operator, color: "#475569" },
  { tag: tags.meta, color: "#be123c" },
]);

function createTheme(isDark: boolean) {
  return EditorView.theme(
    {
      "&": {
        backgroundColor: "var(--bg-editor)",
        color: "var(--text-primary)",
        fontSize: "13px",
        fontFamily: "var(--font-mono)",
      },
      ".cm-content": {
        padding: "12px 0",
        caretColor: "var(--accent-secondary)",
      },
      ".cm-gutters": {
        backgroundColor: "var(--bg-input)",
        color: "var(--text-muted)",
        borderRight: "1px solid var(--border-subtle)",
        paddingRight: "6px",
      },
      ".cm-activeLine": {
        backgroundColor: "rgba(var(--accent-rgb), 0.08)",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "rgba(var(--accent-rgb), 0.14)",
        color: "var(--text-primary)",
      },
      ".cm-lineNumbers .cm-gutterElement": {
        cursor: "pointer",
        userSelect: "none",
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
        backgroundColor: isDark ? "rgba(var(--accent-rgb), 0.28)" : "rgba(var(--accent-rgb), 0.18)",
      },
    },
    { dark: isDark }
  );
}

const COMPLETIONS: Record<EditorLanguage, { label: string; type: string; apply?: string }[]> = {
  logic: [
    { label: "escreva", type: "function", apply: 'escreva()' },
    { label: "var", type: "keyword" },
    { label: "se", type: "keyword", apply: "se () {\n  \n}" },
    { label: "senao", type: "keyword" },
    { label: "enquanto", type: "keyword", apply: "enquanto () {\n  \n}" },
    { label: "para", type: "keyword", apply: "para (var i = 1; i <= 5; i++) {\n  \n}" },
    { label: "funcao", type: "keyword", apply: "funcao nome() {\n  retorne \n}" },
    { label: "retorne", type: "keyword" },
    { label: "verdadeiro", type: "keyword" },
    { label: "falso", type: "keyword" },
    { label: "tamanho(", type: "function" },
  ],
  cpp: [
    { label: "cout", type: "keyword", apply: 'cout << "" << endl;' },
    { label: "cin", type: "keyword", apply: "cin >> " },
    { label: "getline", type: "function", apply: "getline(cin, );" },
    { label: "cin.ignore()", type: "function" },
    { label: "setprecision(2)", type: "function" },
    { label: "vector<int>", type: "type" },
    { label: "push_back", type: "method" },
    { label: "#include <iostream>", type: "keyword" },
    { label: "using namespace std;", type: "keyword" },
  ],
  js: [
    { label: "console.log", type: "function", apply: "console.log();" },
    { label: "const", type: "keyword" },
    { label: "let", type: "keyword" },
    { label: "function", type: "keyword" },
    { label: ".filter(", type: "method" },
    { label: ".map(", type: "method" },
    { label: ".reduce(", type: "method" },
    { label: ".trim()", type: "method" },
    { label: ".toUpperCase()", type: "method" },
  ],
  python: [
    { label: "print(", type: "function" },
    { label: "range(", type: "function" },
    { label: "len(", type: "function" },
    { label: "enumerate(", type: "function" },
    { label: "input()", type: "function" },
    { label: "def ", type: "keyword" },
    { label: "elif ", type: "keyword" },
    { label: "return ", type: "keyword" },
    { label: ".append(", type: "method" },
    { label: ".strip()", type: "method" },
  ],
  sql: [
    { label: "SELECT", type: "keyword" },
    { label: "FROM", type: "keyword" },
    { label: "WHERE", type: "keyword" },
    { label: "ORDER BY", type: "keyword" },
    { label: "GROUP BY", type: "keyword" },
    { label: "HAVING", type: "keyword" },
    { label: "INNER JOIN", type: "keyword" },
    { label: "LEFT JOIN", type: "keyword" },
    { label: "COUNT(*)", type: "function" },
    { label: "ROUND(SUM(), 2)", type: "function" },
    { label: "CREATE TABLE", type: "keyword" },
    { label: "INSERT INTO", type: "keyword" },
  ],
  html: [
    { label: "<!DOCTYPE html>", type: "keyword" },
    { label: "<main>", type: "keyword", apply: "<main>\n  \n</main>" },
    { label: "<header>", type: "keyword", apply: "<header>\n  \n</header>" },
    { label: "<section>", type: "keyword", apply: "<section>\n  \n</section>" },
    { label: "<article>", type: "keyword", apply: "<article>\n  \n</article>" },
    { label: "<footer>", type: "keyword", apply: "<footer>\n  \n</footer>" },
    { label: "<nav>", type: "keyword", apply: "<nav>\n  \n</nav>" },
    { label: "<button>", type: "keyword", apply: '<button type="button"></button>' },
    { label: "<label>", type: "keyword", apply: '<label for=""></label>' },
    { label: "<input>", type: "keyword", apply: '<input id="" type="text" />' },
    { label: 'aria-label=""', type: "property" },
  ],
  css: [
    { label: "display: flex;", type: "property" },
    { label: "display: grid;", type: "property" },
    { label: "flex-direction: column;", type: "property" },
    { label: "justify-content: space-between;", type: "property" },
    { label: "align-items: center;", type: "property" },
    { label: "grid-template-columns:", type: "property", apply: "grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));" },
    { label: "gap:", type: "property", apply: "gap: 16px;" },
    { label: "padding:", type: "property", apply: "padding: 16px;" },
    { label: "border-radius:", type: "property", apply: "border-radius: 12px;" },
    { label: "@media (max-width: 640px)", type: "keyword", apply: "@media (max-width: 640px) {\n  \n}" },
  ],
};

function createSimpleLinter(language: EditorLanguage) {
  return linter(view => {
    const text = view.state.doc.toString();
    const diagnostics: Diagnostic[] = [];

    // Checa balanceamento básico de parênteses e chaves fora de strings
    const pairs: { open: string; close: string }[] = [
      { open: "(", close: ")" },
      { open: "[", close: "]" },
      { open: "{", close: "}" },
    ];
    if (language !== "python" && language !== "html") {
      const stack: { ch: string; pos: number }[] = [];
      let quote: string | null = null;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if ((ch === '"' || ch === "'" || ch === "`") && text[i - 1] !== "\\") {
          quote = quote === ch ? null : quote || ch;
          continue;
        }
        if (quote) continue;
        if (ch === "(" || ch === "[" || ch === "{") {
          stack.push({ ch, pos: i });
        } else {
          const pair = pairs.find(p => p.close === ch);
          if (pair) {
            const top = stack.pop();
            if (!top || top.ch !== pair.open) {
              diagnostics.push({
                from: i,
                to: i + 1,
                severity: "error",
                message: `Delimitador '${ch}' sem abertura correspondente.`,
              });
            }
          }
        }
      }
      for (const unclosed of stack) {
        diagnostics.push({
          from: unclosed.pos,
          to: unclosed.pos + 1,
          severity: "warning",
          message: `Faltou fechar '${unclosed.ch}'.`,
        });
      }
    }
    return diagnostics;
  });
}

function extractCodeGlossaryAt(
  view: EditorView,
  pos: number,
  language: EditorLanguage
): { entry: GlossaryEntry; from: number; to: number } | null {
  const doc = view.state.doc;
  const safePos = Math.max(0, Math.min(doc.length, pos));
  const line = doc.lineAt(safePos);
  const text = line.text;
  if (!text) return null;

  const col = safePos - line.from;

  const compoundRx =
    /(<\/?[a-zA-Z][a-zA-Z0-9-]*>|@media|\b(?:document\.querySelectorAll|document\.querySelector|document\.getElementById|console\.log|event\.preventDefault|INNER\s+JOIN|LEFT\s+JOIN|GROUP\s+BY|ORDER\s+BY|PRIMARY\s+KEY|FOREIGN\s+KEY|aria-label)\b|=>|#include)/g;
  let cm: RegExpExecArray | null;
  while ((cm = compoundRx.exec(text)) !== null) {
    const start = cm.index;
    const end = cm.index + cm[0].length;
    if (col >= start && col <= end) {
      const normalized =
        cm[0].startsWith("<") && cm[0].endsWith(">") ? cm[0] : cm[0].replace(/\s+/g, " ");
      const entry = findGlossaryEntryForCodeToken(normalized, language, text);
      if (entry) {
        return { entry, from: line.from + start, to: line.from + end };
      }
    }
  }

  let start = col;
  let end = col;
  const wordChar = /[A-Za-z0-9_-]/;
  if (start > 0 && !wordChar.test(text[start] || "") && wordChar.test(text[start - 1] || "")) {
    start -= 1;
    end = start;
  }
  while (start > 0 && wordChar.test(text[start - 1] || "")) start -= 1;
  while (end < text.length && wordChar.test(text[end] || "")) end += 1;
  if (end <= start) return null;

  const token = text.slice(start, end);
  const entry = findGlossaryEntryForCodeToken(token, language, text);
  if (!entry) return null;
  return { entry, from: line.from + start, to: line.from + end };
}

function createCodeHoverTooltip(language: EditorLanguage) {
  return hoverTooltip(
    (view, pos) => {
      const hit = extractCodeGlossaryAt(view, pos, language);
      if (!hit) return null;
      const { entry, from, to } = hit;

      return {
        pos: from,
        end: to,
        above: true,
        create() {
          const dom = document.createElement("div");
          dom.className = "ce-cm-glossary-tip";

          const head = document.createElement("div");
          head.className = "ce-cm-glossary-head";

          const title = document.createElement("strong");
          title.textContent = entry.term;
          head.appendChild(title);

          if (entry.translation) {
            const sub = document.createElement("span");
            sub.className = "ce-cm-glossary-trans";
            sub.textContent = entry.translation;
            head.appendChild(sub);
          }

          const body = document.createElement("p");
          body.className = "ce-cm-glossary-body";
          body.textContent = entry.shortExplanation;

          dom.appendChild(head);
          dom.appendChild(body);

          if (entry.exampleContext) {
            const ex = document.createElement("code");
            ex.className = "ce-cm-glossary-ex";
            ex.textContent = entry.exampleContext;
            dom.appendChild(ex);
          }

          return { dom };
        },
      };
    },
    { hoverTime: 340 }
  );
}

function createLineNumberSelection(
  cleanupDragRef: React.MutableRefObject<(() => void) | null>
) {
  return lineNumbers({
    domEventHandlers: {
      mousedown(view, line, event) {
        const mouseEvent = event as MouseEvent;
        if (mouseEvent.button !== 0) return false;
        mouseEvent.preventDefault();
        cleanupDragRef.current?.();

        const doc = view.state.doc;
        const clickedLine = doc.lineAt(line.from);
        const anchorLine = mouseEvent.shiftKey
          ? doc.lineAt(view.state.selection.main.anchor)
          : clickedLine;

        const applyLineSelection = (
          fromLine: ReturnType<typeof doc.lineAt>,
          toLine: ReturnType<typeof doc.lineAt>
        ) => {
          const forward = toLine.number >= fromLine.number;
          const anchor = forward ? fromLine.from : fromLine.to;
          const head = forward ? toLine.to : toLine.from;
          view.dispatch({
            selection: EditorSelection.single(anchor, head),
            scrollIntoView: true,
          });
        };

        applyLineSelection(anchorLine, clickedLine);
        view.focus();

        const onMouseMove = (moveEv: MouseEvent) => {
          const targetBlock = view.lineBlockAtHeight(moveEv.clientY - view.documentTop);
          const targetLine = view.state.doc.lineAt(targetBlock.from);
          applyLineSelection(anchorLine, targetLine);
        };

        const cleanup = () => {
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);
          if (cleanupDragRef.current === cleanup) {
            cleanupDragRef.current = null;
          }
        };

        const onMouseUp = () => cleanup();

        cleanupDragRef.current = cleanup;
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        return true;
      },
    },
  });
}

function getLangExtension(language: EditorLanguage) {
  switch (language) {
    case "cpp":
      return cpp();
    case "logic":
    case "js":
      return javascript();
    case "python":
      return python();
    case "sql":
      return sql({ dialect: SQLite });
    case "html":
      return html();
    case "css":
      return css();
  }
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  value,
  onChange,
  onRun,
  minHeight = 290,
  ariaLabel = "Editor de código",
}) => {
  const { data } = usePlatform();
  const isDark = data.settings.theme !== "light";

  const [activeGlossary, setActiveGlossary] = useState<GlossaryEntry | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  const activeLangRef = useRef<EditorLanguage>(language);
  const gutterDragCleanupRef = useRef<(() => void) | null>(null);
  const toggleInspectorRef = useRef<() => void>(() => {});
  onChangeRef.current = onChange;
  onRunRef.current = onRun;
  activeLangRef.current = language;
  toggleInspectorRef.current = () => setInspectorOpen(prev => !prev);

  const themeCompRef = useRef(new Compartment());
  const highlightCompRef = useRef(new Compartment());
  const langCompRef = useRef(new Compartment());

  useEffect(() => {
    if (!containerRef.current) return;

    const runShortcut = Prec.highest(
      keymap.of([
        {
          key: "Mod-Enter",
          run: () => {
            onRunRef.current?.();
            return true;
          },
        },
        {
          key: "Alt-i",
          run: () => {
            toggleInspectorRef.current();
            return true;
          },
        },
      ])
    );

    const state = EditorState.create({
      doc: value,
      extensions: [
        createLineNumberSelection(gutterDragCleanupRef),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        EditorView.lineWrapping,
        history(),
        bracketMatching(),
        indentUnit.of(language === "python" || language === "cpp" ? "    " : "  "),
        lintGutter(),
        langCompRef.current.of([
          getLangExtension(language),
          createSimpleLinter(language),
          autocompletion({
            override: [completeFromList(COMPLETIONS[language] || [])],
          }),
          createCodeHoverTooltip(language),
        ]),
        themeCompRef.current.of(createTheme(isDark)),
        highlightCompRef.current.of(
          syntaxHighlighting(isDark ? DARK_HIGHLIGHT : LIGHT_HIGHLIGHT, { fallback: true })
        ),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        runShortcut,
        keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
          if (update.selectionSet || update.docChanged) {
            const hit = extractCodeGlossaryAt(
              update.view,
              update.state.selection.main.head,
              activeLangRef.current
            );
            setActiveGlossary(hit ? hit.entry : null);
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });
    viewRef.current = view;

    const initialHit = extractCodeGlossaryAt(view, view.state.selection.main.head, activeLangRef.current);
    setActiveGlossary(initialHit ? initialHit.entry : null);

    return () => {
      gutterDragCleanupRef.current?.();
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincroniza mudança externa de valor (ex: restaurar modelo ou trocar de aula)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  // Atualiza tema dinamicamente
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: [
        themeCompRef.current.reconfigure(createTheme(isDark)),
        highlightCompRef.current.reconfigure(
          syntaxHighlighting(isDark ? DARK_HIGHLIGHT : LIGHT_HIGHLIGHT, { fallback: true })
        ),
      ],
    });
  }, [isDark]);

  // Atualiza linguagem, autocompletar e explicações contextuais dinamicamente
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: langCompRef.current.reconfigure([
        getLangExtension(language),
        createSimpleLinter(language),
        autocompletion({
          override: [completeFromList(COMPLETIONS[language] || [])],
        }),
        createCodeHoverTooltip(language),
      ]),
    });
    const hit = extractCodeGlossaryAt(view, view.state.selection.main.head, language);
    setActiveGlossary(hit ? hit.entry : null);
  }, [language]);

  useEffect(() => {
    if (!activeGlossary && inspectorOpen) {
      setInspectorOpen(false);
    }
  }, [activeGlossary, inspectorOpen]);

  useEffect(() => {
    if (!inspectorOpen) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        setInspectorOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inspectorOpen]);

  return (
    <div className="ce-editor-shell">
      <div
        ref={containerRef}
        className="ce-editor-box"
        style={{ minHeight }}
      />

      <div className="ce-editor-glossary-bar">
        {activeGlossary ? (
          <button
            type="button"
            className={`ce-editor-glossary-btn ${inspectorOpen ? "is-open" : ""}`}
            onClick={() => setInspectorOpen(prev => !prev)}
            aria-expanded={inspectorOpen}
          >
            <BookOpen size={12} />
            <span>Conceito no cursor:</span>
            <strong>{activeGlossary.term}</strong>
            <kbd>Alt+I</kbd>
          </button>
        ) : (
          <span className="ce-editor-glossary-tip">
            Clique em um número de linha para selecionar a linha inteira · Passe o mouse ou use{" "}
            <kbd>Alt+I</kbd> sobre termos do código
          </span>
        )}
      </div>

      {inspectorOpen && activeGlossary && (
        <div className="ce-editor-glossary-card" role="region" aria-label="Explicação do código">
          <div className="ce-editor-glossary-card-head">
            <div>
              <strong>{activeGlossary.term}</strong>
              {activeGlossary.translation && (
                <span className="ce-glossary-translation">{activeGlossary.translation}</span>
              )}
            </div>
            <button
              type="button"
              className="ce-glossary-close"
              onClick={() => setInspectorOpen(false)}
              aria-label="Fechar explicação"
            >
              <X size={13} />
            </button>
          </div>
          <p className="ce-glossary-body">{activeGlossary.shortExplanation}</p>
          {activeGlossary.exampleContext && (
            <div className="ce-glossary-example">
              <span>Uso típico:</span>
              <code>{activeGlossary.exampleContext}</code>
            </div>
          )}
          {activeGlossary.roadmapTopicRef && (
            <Link
              to={`/roadmaps/${activeGlossary.roadmapTopicRef.roadmapId}?topico=${activeGlossary.roadmapTopicRef.nodeId}`}
              className="ce-glossary-roadmap-link"
            >
              <span>{activeGlossary.roadmapTopicRef.label}</span>
              <ArrowRight size={12} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
