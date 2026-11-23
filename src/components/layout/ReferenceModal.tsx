import React, { useEffect, useState } from "react";
import { Keyboard, X } from "lucide-react";
import { KEYBOARD_SHORTCUTS, TRACK_REFERENCES } from "../../data/references";
import { TRACK_MAP, TRACKS } from "../../data/tracks";
import { usePlatform } from "../../context/PlatformContext";
import type { TrackId } from "../../types/curriculum";
import { TechIcon } from "../shared/TechIcon";

export const ReferenceModal: React.FC = () => {
  const { referenceOpen, setReferenceOpen, referenceTrackId, data } = usePlatform();
  const [selectedTrack, setSelectedTrack] = useState<TrackId>(
    referenceTrackId || data.settings.activeTrackId || "js"
  );

  useEffect(() => {
    if (referenceTrackId) setSelectedTrack(referenceTrackId);
  }, [referenceTrackId]);

  useEffect(() => {
    if (!referenceOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setReferenceOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [referenceOpen, setReferenceOpen]);

  if (!referenceOpen) return null;

  const track = TRACK_MAP[selectedTrack];
  const items = TRACK_REFERENCES[selectedTrack] || [];

  return (
    <div
      className="ce-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ref-modal-title"
      onClick={e => {
        if (e.target === e.currentTarget) setReferenceOpen(false);
      }}
    >
      <div className="ce-modal-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <TechIcon trackId={selectedTrack} size={24} boxed />
            <div>
              <h2 id="ref-modal-title" style={{ fontSize: 18 }}>
                Manual Rápido — {track.name}
              </h2>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                Sintaxe essencial, comandos e atalhos da plataforma
              </p>
            </div>
          </div>
          <button
            type="button"
            className="ce-icon-btn"
            onClick={() => setReferenceOpen(false)}
            aria-label="Fechar manual"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {TRACKS.map(t => (
            <button
              key={t.id}
              type="button"
              className={`ce-btn ce-btn-sm ${t.id === selectedTrack ? "ce-btn-primary" : "ce-btn-ghost"}`}
              onClick={() => setSelectedTrack(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 10 }}>
          {items.map(item => (
            <div
              key={item.syntax}
              style={{
                padding: "11px 13px",
                borderRadius: 12,
                background: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              <code style={{ fontSize: 12.5, color: track.accentSecondary, fontWeight: 600 }}>
                {item.syntax}
              </code>
              <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{item.description}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 18,
            paddingTop: 14,
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
            <Keyboard size={14} />
            <span>Atalhos:</span>
          </div>
          {KEYBOARD_SHORTCUTS.map(sc => (
            <div key={sc.action} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
              {sc.keys.map(k => (
                <kbd
                  key={k}
                  style={{
                    padding: "2px 6px",
                    borderRadius: 6,
                    background: "var(--bg-editor)",
                    border: "1px solid var(--border-soft)",
                    fontSize: 11,
                  }}
                >
                  {k}
                </kbd>
              ))}
              <span>{sc.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
