import React, { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronUp, Moon, Palette, Sun, X } from "lucide-react";
import { usePlatform } from "../../context/PlatformContext";
import { resolvePalette, type ThemeMode } from "../../data/themes";
import { ThemeModeSwitch, ThemePaletteCards } from "../shared/ThemePalettePicker";

export const ThemeDock: React.FC = () => {
  const {
    data,
    themeDockOpen,
    themeDockMinimized,
    setThemeDockMinimized,
    closeThemeDock,
    toggleTheme,
  } = usePlatform();

  const activeMode: ThemeMode = data.settings.theme === "light" ? "light" : "dark";
  const activePalette = resolvePalette(activeMode, data.settings.themePalette);
  const sw = activePalette.swatches;

  useEffect(() => {
    if (!themeDockOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (document.querySelector('[aria-modal="true"]')) return;
      closeThemeDock();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [themeDockOpen, closeThemeDock]);

  return (
    <AnimatePresence>
      {themeDockOpen && (
        <div
          className={`ce-theme-dock-layer ${themeDockMinimized ? "is-minimized" : ""}`}
          role="region"
          aria-label="Seletor flutuante de temas"
        >
          {themeDockMinimized ? (
            <motion.div
              key="dock-pill"
              className="ce-theme-dock-pill"
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.94 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                className="ce-theme-pill-main"
                onClick={() => setThemeDockMinimized(false)}
                title="Expandir barra de temas"
              >
                <span className="ce-theme-pill-dots" aria-hidden="true">
                  <span style={{ background: sw.primary }} />
                  <span style={{ background: sw.secondary }} />
                  <span style={{ background: sw.tertiary }} />
                </span>
                <span className="ce-theme-pill-name">{activePalette.name}</span>
                <ChevronUp size={14} />
              </button>

              <span className="ce-theme-pill-sep" aria-hidden="true" />

              <button
                type="button"
                className="ce-theme-pill-icon"
                onClick={() => {
                  toggleTheme().catch(() => {});
                }}
                title={activeMode === "dark" ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
                aria-label={activeMode === "dark" ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
              >
                {activeMode === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              <button
                type="button"
                className="ce-theme-pill-icon"
                onClick={closeThemeDock}
                title="Fechar barra de temas"
                aria-label="Fechar barra de temas"
              >
                <X size={14} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="dock-panel"
              className="ce-theme-dock-panel"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="ce-theme-dock-head">
                <div className="ce-theme-dock-title">
                  <span className="ce-theme-dock-icon">
                    <Palette size={14} />
                  </span>
                  <div className="ce-theme-dock-labels">
                    <strong>Modo e paleta de cores</strong>
                  </div>
                </div>

                <div className="ce-theme-dock-switchwrap">
                  <ThemeModeSwitch compact />
                </div>

                <div className="ce-theme-dock-actions">
                  <button
                    type="button"
                    className="ce-theme-dock-btn"
                    onClick={() => setThemeDockMinimized(true)}
                    title="Recolher para pílula discreta"
                    aria-label="Recolher para pílula discreta"
                  >
                    <ChevronDown size={15} />
                    <span className="ce-theme-dock-btn-label">Recolher</span>
                  </button>

                  <button
                    type="button"
                    className="ce-theme-dock-btn is-close"
                    onClick={closeThemeDock}
                    title="Fechar seletor de tema"
                    aria-label="Fechar seletor de tema"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <ThemePaletteCards variant="dock" />
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};
