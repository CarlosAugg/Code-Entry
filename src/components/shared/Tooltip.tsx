import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  side?: "top" | "bottom" | "right" | "left";
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  side = "top",
  disabled = false,
  fullWidth = false,
  children,
}) => {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; transform: string } | null>(null);

  const computeCoords = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;

    if (side === "right") {
      setCoords({
        top: rect.top + rect.height / 2,
        left: Math.min(window.innerWidth - 16, rect.right + gap),
        transform: "translateY(-50%)",
      });
    } else if (side === "left") {
      setCoords({
        top: rect.top + rect.height / 2,
        left: Math.max(16, rect.left - gap),
        transform: "translate(-100%, -50%)",
      });
    } else if (side === "bottom") {
      setCoords({
        top: Math.min(window.innerHeight - 16, rect.bottom + gap),
        left: Math.max(60, Math.min(window.innerWidth - 60, rect.left + rect.width / 2)),
        transform: "translateX(-50%)",
      });
    } else {
      setCoords({
        top: Math.max(16, rect.top - gap),
        left: Math.max(60, Math.min(window.innerWidth - 60, rect.left + rect.width / 2)),
        transform: "translate(-50%, -100%)",
      });
    }
  }, [side]);

  useEffect(() => {
    if (!open) return;
    computeCoords();
    const handleDismiss = () => setOpen(false);
    window.addEventListener("scroll", handleDismiss, true);
    window.addEventListener("resize", handleDismiss);
    return () => {
      window.removeEventListener("scroll", handleDismiss, true);
      window.removeEventListener("resize", handleDismiss);
    };
  }, [open, computeCoords]);

  if (disabled || !content) {
    return children;
  }

  return (
    <>
      <span
        ref={triggerRef}
        style={{
          display: "inline-flex",
          alignItems: "center",
          width: fullWidth ? "100%" : undefined,
          flexShrink: fullWidth ? undefined : 0,
        }}
        onMouseEnter={() => {
          computeCoords();
          setOpen(true);
        }}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => {
          computeCoords();
          setOpen(true);
        }}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>

      {open &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            className="ce-tooltip-portal"
            style={{
              top: coords.top,
              left: coords.left,
              transform: coords.transform,
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
};
