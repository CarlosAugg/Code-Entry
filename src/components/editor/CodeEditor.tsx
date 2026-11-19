import React, { useEffect, useRef } from "react";
import { EditorState, Compartment, Prec } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, defaultHighlightStyle, HighlightStyle, indentUnit, syntaxHighlighting } from "@codemirror/language";
import { autocompletion, completeFromList } from "@codemirror/autocomplete";
import { linter, lintGutter, type Diagnostic } from "@codemirror/lint";
import { searchKeymap } from "@codemirror/search";
import { cpp } from "@codemirror/lang-cpp";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { sql, SQLite } from "@codemirror/lang-sql";
import { tags } from "@lezer/highlight";
import { usePlatform } from "../../context/PlatformContext";

export type EditorLanguage = "logic" | "cpp" | "js" | "python" | "sql";

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
    if (language !== "python") {
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

  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  onChangeRef.current = onChange;
  onRunRef.current = onRun;

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
      ])
    );

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        EditorView.lineWrapping,
        history(),
        bracketMatching(),
        indentUnit.of(language === "python" || language === "cpp" ? "    " : "  "),
        lintGutter(),
        autocompletion({
          override: [completeFromList(COMPLETIONS[language] || [])],
        }),
        langCompRef.current.of([getLangExtension(language), createSimpleLinter(language)]),
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
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });
    viewRef.current = view;

    return () => {
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

  // Atualiza linguagem dinamicamente
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: langCompRef.current.reconfigure([
        getLangExtension(language),
        createSimpleLinter(language),
      ]),
    });
  }, [language]);

  return (
    <div
      ref={containerRef}
      className="ce-editor-box"
      style={{ minHeight }}
    />
  );
};
