import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Copy, Play, X } from "lucide-react";
import {
  findGlossaryEntryForCodeToken,
  tokenizeGlossaryProse,
  type GlossaryCodeLanguage,
  type GlossaryEntry,
} from "../../data/glossary";

const GLOSSARY_OPEN_EVENT = "ce-glossary-open";

interface GlossaryTermProps {
  entry: GlossaryEntry;
  children: React.ReactNode;
  variant?: "prose" | "code" | "pill";
}

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({
  entry,
  children,
  variant = "prose",
}) => {
  const instanceId = useId();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: "bottom" | "top" }>({
    top: 0,
    left: 12,
    placement: "bottom",
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closePopover = useCallback(
    (restoreFocus = false) => {
      clearTimers();
      setOpen(false);
      setPinned(false);
      if (restoreFocus) {
        triggerRef.current?.focus();
      }
    },
    [clearTimers]
  );

  const announceOpen = useCallback(() => {
    window.dispatchEvent(new CustomEvent(GLOSSARY_OPEN_EVENT, { detail: instanceId }));
  }, [instanceId]);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el || typeof window === "undefined") return;
    const rect = el.getBoundingClientRect();
    const popWidth = Math.min(330, window.innerWidth - 16);
    const estHeight = popoverRef.current?.offsetHeight || 190;
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const placeTop = spaceBelow < estHeight && spaceAbove > spaceBelow;
    const rawTop = placeTop ? rect.top - estHeight - 8 : rect.bottom + 8;
    const clampedTop = Math.max(8, Math.min(window.innerHeight - estHeight - 8, rawTop));
    const preferredLeft = rect.left + rect.width / 2 - popWidth / 2;
    const clampedLeft = Math.max(8, Math.min(window.innerWidth - popWidth - 8, preferredLeft));
    setCoords({
      top: clampedTop,
      left: clampedLeft,
      placement: placeTop ? "top" : "bottom",
    });
  }, []);

  useEffect(() => {
    const onOtherOpen = (ev: Event) => {
      const custom = ev as CustomEvent<string>;
      if (custom.detail !== instanceId) {
        clearTimers();
        setOpen(false);
        setPinned(false);
      }
    };
    window.addEventListener(GLOSSARY_OPEN_EVENT, onOtherOpen);
    return () => {
      window.removeEventListener(GLOSSARY_OPEN_EVENT, onOtherOpen);
      clearTimers();
    };
  }, [instanceId, clearTimers]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        target &&
        (triggerRef.current?.contains(target) || popoverRef.current?.contains(target))
      ) {
        return;
      }
      closePopover(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePopover(true);
      }
    };
    const onReposition = () => updatePosition();

    document.addEventListener("pointerdown", onDocDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("pointerdown", onDocDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, closePopover, updatePosition]);

  const handleMouseEnter = () => {
    clearTimers();
    if (open) return;
    openTimerRef.current = window.setTimeout(() => {
      announceOpen();
      setOpen(true);
    }, 130);
  };

  const handleMouseLeave = () => {
    clearTimers();
    if (pinned) return;
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 180);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    clearTimers();
    if (open && pinned) {
      closePopover(false);
    } else {
      announceOpen();
      setOpen(true);
      setPinned(true);
    }
  };

  const handleFocus = () => {
    clearTimers();
    announceOpen();
    setOpen(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (pinned) return;
    const next = e.relatedTarget as Node | null;
    if (next && (triggerRef.current?.contains(next) || popoverRef.current?.contains(next))) {
      return;
    }
    closePopover(false);
  };

  const triggerClass =
    variant === "pill"
      ? `ce-glossary-pill ${open ? "is-open" : ""}`
      : variant === "code"
        ? `ce-glossary-code-token ${open ? "is-open" : ""}`
        : `ce-glossary-trigger ${open ? "is-open" : ""}`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? `ce-glossary-pop-${instanceId}` : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
      >
        {children}
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            id={`ce-glossary-pop-${instanceId}`}
            role="dialog"
            aria-label={`Explicação de ${entry.term}`}
            className={`ce-glossary-popover is-${coords.placement}`}
            style={{ top: coords.top, left: coords.left }}
            onMouseEnter={() => {
              if (closeTimerRef.current !== null) {
                window.clearTimeout(closeTimerRef.current);
                closeTimerRef.current = null;
              }
            }}
            onMouseLeave={handleMouseLeave}
            onBlur={handleBlur}
          >
            <div className="ce-glossary-popover-head">
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <BookOpen size={13} style={{ color: "var(--accent-secondary)", flexShrink: 0 }} />
                  <strong style={{ fontSize: 13.5, color: "var(--text-primary)" }}>{entry.term}</strong>
                </div>
                {entry.translation && (
                  <span className="ce-glossary-translation">{entry.translation}</span>
                )}
              </div>
              <button
                type="button"
                className="ce-glossary-close"
                onClick={() => closePopover(true)}
                aria-label="Fechar explicação"
                title="Fechar (Esc)"
              >
                <X size={13} />
              </button>
            </div>

            <p className="ce-glossary-body">{entry.shortExplanation}</p>

            {entry.exampleContext && (
              <div className="ce-glossary-example">
                <span>Uso típico:</span>
                <code>{entry.exampleContext}</code>
              </div>
            )}

            {entry.roadmapTopicRef && (
              <Link
                to={`/roadmaps/${entry.roadmapTopicRef.roadmapId}?topico=${entry.roadmapTopicRef.nodeId}`}
                className="ce-glossary-roadmap-link"
                onClick={() => closePopover(false)}
              >
                <span>{entry.roadmapTopicRef.label}</span>
                <ArrowRight size={12} />
              </Link>
            )}
          </div>,
          document.body
        )}
    </>
  );
};

interface AnnotatedTextProps {
  text?: string;
  categories?: string[];
}

export const AnnotatedText: React.FC<AnnotatedTextProps> = ({ text = "", categories }) => {
  if (!text) return null;
  const segments = tokenizeGlossaryProse(text, categories);
  return (
    <>
      {segments.map((seg, idx) =>
        seg.kind === "text" ? (
          <React.Fragment key={idx}>{seg.text}</React.Fragment>
        ) : (
          <GlossaryTerm key={`${seg.entry.id}-${idx}`} entry={seg.entry}>
            {seg.text}
          </GlossaryTerm>
        )
      )}
    </>
  );
};

const VALID_CODE_LANGS = new Set<GlossaryCodeLanguage>([
  "logic",
  "cpp",
  "js",
  "python",
  "sql",
  "html",
  "css",
]);

function normalizeCodeLanguage(lang?: string): GlossaryCodeLanguage | undefined {
  if (!lang) return undefined;
  const low = lang.toLowerCase();
  if (low === "javascript") return "js";
  if (low === "portugol") return "logic";
  if (VALID_CODE_LANGS.has(low as GlossaryCodeLanguage)) {
    return low as GlossaryCodeLanguage;
  }
  return undefined;
}

function renderAnnotatedCodeLine(line: string, lang?: GlossaryCodeLanguage): React.ReactNode {
  if (!line) return " ";
  const tokenRx =
    /(<\/?[a-zA-Z][a-zA-Z0-9-]*>|@media|\b(?:document\.querySelectorAll|document\.querySelector|document\.getElementById|console\.log|event\.preventDefault|INNER\s+JOIN|LEFT\s+JOIN|GROUP\s+BY|ORDER\s+BY|PRIMARY\s+KEY|FOREIGN\s+KEY|aria-label)\b|=>|#include|\b[A-Za-z_][A-Za-z0-9_-]*\b)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let tokenCounter = 0;

  while ((m = tokenRx.exec(line)) !== null) {
    if (m.index > lastIndex) {
      parts.push(line.slice(lastIndex, m.index));
    }
    const rawToken = m[0];
    const cleanForLookup =
      rawToken.startsWith("<") && rawToken.endsWith(">") ? rawToken : rawToken.replace(/\s+/g, " ");
    const entry = findGlossaryEntryForCodeToken(cleanForLookup, lang, line);

    if (entry) {
      parts.push(
        <GlossaryTerm key={`ct-${tokenCounter++}-${m.index}`} entry={entry} variant="code">
          {rawToken}
        </GlossaryTerm>
      );
    } else {
      parts.push(rawToken);
    }
    lastIndex = m.index + rawToken.length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }
  return parts.length > 0 ? parts : line;
}

interface AnnotatedCodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  onCopy?: () => void;
  copied?: boolean;
  onTryInEditor?: () => void;
}

export const AnnotatedCodeBlock: React.FC<AnnotatedCodeBlockProps> = ({
  code,
  language,
  title,
  onCopy,
  copied,
  onTryInEditor,
}) => {
  const normLang = normalizeCodeLanguage(language);
  const lines = code.replace(/\r\n/g, "\n").split("\n");

  return (
    <div className="ce-annotated-code">
      {(title || normLang || onCopy || onTryInEditor) && (
        <div className="ce-annotated-code-head">
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            {normLang && <span className="ce-badge">{normLang.toUpperCase()}</span>}
            {title && (
              <strong style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{title}</strong>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {onTryInEditor && (
              <button
                type="button"
                className="ce-btn ce-btn-ghost ce-btn-sm"
                style={{ height: 26, fontSize: 11.5 }}
                onClick={onTryInEditor}
              >
                <Play size={11} />
                <span>Testar no editor</span>
              </button>
            )}
            {onCopy && (
              <button
                type="button"
                className="ce-btn ce-btn-ghost ce-btn-sm"
                style={{ height: 26, fontSize: 11.5 }}
                onClick={onCopy}
              >
                <Copy size={11} />
                <span>{copied ? "Copiado!" : "Copiar"}</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="ce-annotated-code-body">
        {lines.map((line, idx) => (
          <div key={idx} className="ce-annotated-code-line">
            <span className="ce-annotated-code-ln" aria-hidden="true">
              {idx + 1}
            </span>
            <code className="ce-annotated-code-text">{renderAnnotatedCodeLine(line, normLang)}</code>
          </div>
        ))}
      </div>
    </div>
  );
};
