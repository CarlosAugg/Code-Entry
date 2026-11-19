import React, { useRef, useState } from "react";
import { Check, Compass, Download, RotateCcw, Sparkles, Upload, User } from "lucide-react";
import { usePlatform } from "../../context/PlatformContext";
import { api } from "../../services/api";
import { ThemePalettePicker } from "../shared/ThemePalettePicker";

interface UserMenuPopoverProps {
  onClose: () => void;
}

export const UserMenuPopover: React.FC<UserMenuPopoverProps> = ({ onClose }) => {
  const { data, stats, updateSettings, startTour, resetProgress, restoreFromBackup } = usePlatform();
  const [name, setName] = useState(data.settings.displayName);
  const [goal, setGoal] = useState(String(data.settings.dailyGoalMinutes));
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        displayName: name.trim() || "Estudante",
        dailyGoalMinutes: Number(goal) || 30,
      });
      setFeedback("Preferências salvas neste dispositivo.");
      setTimeout(() => setFeedback(null), 2500);
    } finally {
      setSaving(false);
    }
  };

  const quickGoals = [15, 30, 45, 60, 90];

  const handleExport = async () => {
    const backup = await api.exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code-entry-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await restoreFromBackup(JSON.parse(text));
      onClose();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Erro ao importar backup.");
    }
  };

  return (
    <div className="ce-popover" role="dialog" aria-label="Preferências do estudante">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <User size={16} style={{ color: "var(--accent-secondary)" }} />
          <strong style={{ fontSize: 13.5 }}>Perfil &amp; Preferências</strong>
        </div>
        <span className="ce-badge">{stats.totalXp} XP</span>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-secondary)" }}>
          Seu nome no painel
          <input
            className="ce-input"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={48}
            placeholder="Estudante"
          />
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
          <span>Meta diária (minutos)</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {quickGoals.map(mins => {
              const selected = Number(goal) === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  className={`ce-btn ce-btn-sm ${selected ? "ce-btn-primary" : "ce-btn-ghost"}`}
                  style={{ height: 26, padding: "0 9px", fontSize: 11.5 }}
                  onClick={() => setGoal(String(mins))}
                >
                  {mins}m
                </button>
              );
            })}
          </div>
          <input
            className="ce-input"
            type="number"
            min={5}
            max={240}
            value={goal}
            onChange={e => setGoal(e.target.value)}
            aria-label="Meta diária em minutos"
          />
        </div>

        <button className="ce-btn ce-btn-primary ce-btn-sm" type="submit" disabled={saving}>
          <Check size={14} />
          <span>{saving ? "Salvando..." : "Salvar preferências"}</span>
        </button>
      </form>

      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
        <ThemePalettePicker variant="compact" />
      </div>

      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 10,
            background: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5 }}>
            <Sparkles size={14} style={{ color: "var(--accent-secondary)" }} />
            <span>Reduzir animações</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(data.settings.reducedMotion)}
            onClick={() => updateSettings({ reducedMotion: !data.settings.reducedMotion })}
            style={{
              width: 40,
              height: 22,
              borderRadius: 999,
              border: "1px solid var(--border-soft)",
              background: data.settings.reducedMotion ? "var(--accent-primary)" : "rgba(148,163,184,0.2)",
              padding: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: data.settings.reducedMotion ? "flex-end" : "flex-start",
              transition: "background 180ms ease",
            }}
            aria-label="Alternar redução de animações"
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            />
          </button>
        </div>

        <button
          type="button"
          className="ce-btn ce-btn-ghost ce-btn-sm"
          onClick={() => {
            onClose();
            startTour();
          }}
        >
          <Compass size={13} />
          <span>Refazer tour guiado</span>
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button type="button" className="ce-btn ce-btn-ghost ce-btn-sm" onClick={handleExport}>
            <Download size={13} />
            <span>Exportar</span>
          </button>
          <button
            type="button"
            className="ce-btn ce-btn-ghost ce-btn-sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={13} />
            <span>Importar</span>
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={handleImportFile}
        />

        {!confirmReset ? (
          <button
            type="button"
            className="ce-btn ce-btn-ghost ce-btn-sm"
            style={{ color: "var(--accent-danger)" }}
            onClick={() => setConfirmReset(true)}
          >
            <RotateCcw size={13} />
            <span>Zerar progresso local</span>
          </button>
        ) : (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="ce-btn ce-btn-sm"
              style={{ flex: 1, background: "rgba(248,113,113,0.18)", color: "#fca5a5", borderColor: "rgba(248,113,113,0.4)" }}
              onClick={async () => {
                await resetProgress();
                setConfirmReset(false);
                onClose();
              }}
            >
              Confirmar
            </button>
            <button
              type="button"
              className="ce-btn ce-btn-ghost ce-btn-sm"
              onClick={() => setConfirmReset(false)}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {feedback && (
        <div style={{ fontSize: 12, color: "var(--accent-success)" }}>{feedback}</div>
      )}
    </div>
  );
};
