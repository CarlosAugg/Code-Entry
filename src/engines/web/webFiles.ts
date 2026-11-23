import type { WebProjectFiles } from "../../types/curriculum";

export const MAX_WEB_FILE_CHARS = 30_000;
export const MAX_WEB_TOTAL_CHARS = 65_000;

export const EMPTY_WEB_FILES: WebProjectFiles = {
  html: "",
  css: "",
  js: "",
};

export function serializeWebFiles(files: WebProjectFiles): string {
  return JSON.stringify({
    __ceWebProject: 1,
    html: typeof files.html === "string" ? files.html : "",
    css: typeof files.css === "string" ? files.css : "",
    js: typeof files.js === "string" ? files.js : "",
  });
}

export function parseWebFiles(
  raw: string | undefined | null,
  fallback: WebProjectFiles = EMPTY_WEB_FILES
): WebProjectFiles {
  if (!raw || typeof raw !== "string") {
    return {
      html: fallback.html,
      css: fallback.css,
      js: fallback.js,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<WebProjectFiles> & { __ceWebProject?: number };
    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed.__ceWebProject === 1 ||
        ("html" in parsed && "css" in parsed && "js" in parsed))
    ) {
      return {
        html: typeof parsed.html === "string" ? parsed.html : fallback.html,
        css: typeof parsed.css === "string" ? parsed.css : fallback.css,
        js: typeof parsed.js === "string" ? parsed.js : fallback.js,
      };
    }
  } catch {
    // Fallback controlado quando o rascunho ainda estiver vazio ou em formato legado
  }

  return {
    html: fallback.html,
    css: fallback.css,
    js: fallback.js,
  };
}

export function isWebProjectEmpty(files: WebProjectFiles): boolean {
  return !files.html.trim() && !files.css.trim() && !files.js.trim();
}

export function validateWebFilesSize(
  files: WebProjectFiles
): { ok: true } | { ok: false; error: string } {
  const entries: { label: string; content: string }[] = [
    { label: "index.html", content: files.html || "" },
    { label: "style.css", content: files.css || "" },
    { label: "script.js", content: files.js || "" },
  ];

  for (const item of entries) {
    if (item.content.length > MAX_WEB_FILE_CHARS) {
      return {
        ok: false,
        error: `O arquivo ${item.label} excedeu o limite de ${MAX_WEB_FILE_CHARS.toLocaleString("pt-BR")} caracteres neste ambiente de prática.`,
      };
    }
  }

  const totalChars = entries.reduce((acc, item) => acc + item.content.length, 0);
  if (totalChars > MAX_WEB_TOTAL_CHARS) {
    return {
      ok: false,
      error: `O projeto Web excedeu o limite combinado de ${MAX_WEB_TOTAL_CHARS.toLocaleString("pt-BR")} caracteres.`,
    };
  }

  return { ok: true };
}
