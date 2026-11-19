import React from "react";
import { Check, Moon, Palette, Sun } from "lucide-react";
import { usePlatform } from "../../context/PlatformContext";
import { getPalettesByMode, resolvePalette, type ThemeMode } from "../../data/themes";

interface ThemePalettePickerProps {
  variant?: "onboarding" | "compact";
}

export const ThemePalettePicker: React.FC<ThemePalettePickerProps> = ({ variant = "onboarding" }) => {
  const { data, setThemeMode, setThemePalette } = usePlatform();
  const activeMode: ThemeMode = data.settings.theme === "light" ? "light" : "dark";
  const activePalette = resolvePalette(activeMode, data.settings.themePalette);
  const palettes = getPalettesByMode(activeMode);
  const isCompact = variant === "compact";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isCompact ? 8 : 12 }}>
      {/* Passo 1: Escolha entre Modo Escuro e Modo Claro */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: isCompact ? 12 : 12.5,
            fontWeight: 600,
            color: "var(--text-secondary)",
            marginBottom: 6,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Palette size={13} style={{ color: "var(--accent-secondary)" }} />
            <span>{isCompact ? "Modo e paleta de cores" : "1. Escolha o modo de aparência"}</span>
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
            {activePalette.name}
          </span>
        </div>

        <div
          className={`ce-theme-mode-switch ${isCompact ? "is-compact" : ""}`}
          role="radiogroup"
          aria-label="Modo de aparência"
        >
          <button
            type="button"
            role="radio"
            aria-checked={activeMode === "dark"}
            data-theme-mode="dark"
            className={`ce-theme-mode-btn ${activeMode === "dark" ? "is-active" : ""}`}
            onClick={() => {
              setThemeMode("dark").catch(() => {});
            }}
          >
            <Moon size={isCompact ? 13 : 15} />
            <span>Modo Escuro</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={activeMode === "light"}
            data-theme-mode="light"
            className={`ce-theme-mode-btn ${activeMode === "light" ? "is-active" : ""}`}
            onClick={() => {
              setThemeMode("light").catch(() => {});
            }}
          >
            <Sun size={isCompact ? 13 : 15} />
            <span>Modo Claro</span>
          </button>
        </div>
      </div>

      {/* Passo 2: 4 Paletas do modo selecionado com prévia visual */}
      <div>
        {!isCompact && (
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginBottom: 6,
            }}
          >
            2. Escolha uma das 4 paletas do {activeMode === "dark" ? "modo escuro" : "modo claro"}
          </div>
        )}

        <div
          className={`ce-theme-palette-grid ${isCompact ? "is-compact" : "is-onboarding"}`}
          role="radiogroup"
          aria-label="Paletas de cores"
        >
          {palettes.map(palette => {
            const selected = activePalette.id === palette.id;
            const sw = palette.swatches;
            return (
              <button
                key={palette.id}
                type="button"
                role="radio"
                aria-checked={selected}
                data-palette-choice={palette.id}
                className={`ce-theme-swatch-card ${isCompact ? "is-compact" : ""} ${selected ? "is-selected" : ""}`}
                onClick={() => {
                  setThemePalette(palette.id).catch(() => {});
                }}
              >
                {/* Prévia visual estilo mini-interface (Opera GX) */}
                <div className="ce-theme-preview" style={{ background: sw.bg }} aria-hidden="true">
                  <div className="ce-theme-preview-sidebar" style={{ background: sw.sidebar }}>
                    <span
                      style={{
                        height: isCompact ? 5 : 6,
                        width: "82%",
                        borderRadius: 4,
                        background: sw.primary,
                      }}
                    />
                    <span
                      style={{
                        height: 3,
                        width: "65%",
                        borderRadius: 3,
                        background: sw.text,
                        opacity: 0.25,
                      }}
                    />
                    <span
                      style={{
                        height: 3,
                        width: "75%",
                        borderRadius: 3,
                        background: sw.text,
                        opacity: 0.16,
                      }}
                    />
                  </div>
                  <div className="ce-theme-preview-main">
                    <div
                      style={{
                        height: isCompact ? 12 : 16,
                        borderRadius: 5,
                        background: sw.surface,
                        border: `1px solid ${sw.primary}44`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 5px",
                      }}
                    >
                      <span
                        style={{
                          width: "46%",
                          height: 4,
                          borderRadius: 3,
                          background: sw.text,
                          opacity: 0.65,
                        }}
                      />
                      <span
                        style={{
                          width: 14,
                          height: 5,
                          borderRadius: 99,
                          background: sw.primary,
                        }}
                      />
                    </div>
                    <div className="ce-theme-dot-row">
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: sw.primary }} />
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: sw.secondary }} />
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: sw.tertiary }} />
                    </div>
                  </div>
                </div>

                {/* Nome + indicador de seleção */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <div style={{ minWidth: 0 }}>
                    <strong
                      style={{
                        display: "block",
                        fontSize: isCompact ? 12 : 13,
                        color: "var(--text-primary)",
                        lineHeight: 1.2,
                      }}
                    >
                      {palette.name}
                    </strong>
                    {!isCompact && (
                      <span
                        style={{
                          display: "block",
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 2,
                        }}
                      >
                        {palette.tagline}
                      </span>
                    )}
                  </div>
                  {selected && (
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "var(--accent-primary)",
                        color: "#ffffff",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
