import React, { useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { AlertCircle, Award, Download, Info, RefreshCw, RotateCcw, Upload, X } from "lucide-react";
import { usePlatform } from "../../context/PlatformContext";
import { AmbientAurora } from "../motion/AmbientAurora";
import { ClickSpark } from "../motion/ClickSpark";
import { InteractiveBackground } from "../motion/InteractiveBackground";
import { PersonalizationModal } from "../onboarding/PersonalizationModal";
import { ProductTour } from "../onboarding/ProductTour";
import { CompletionCelebration } from "../shared/CompletionCelebration";
import { LiaAmbientCameos } from "../shared/LiaAmbientCameos";
import { DashboardSkeleton } from "../shared/Skeleton";
import { MobileBottomNav } from "./MobileBottomNav";
import { ReferenceModal } from "./ReferenceModal";
import { Sidebar } from "./Sidebar";
import { ThemeDock } from "./ThemeDock";
import { Topbar } from "./Topbar";

export const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmStorageReset, setConfirmStorageReset] = useState(false);
  const [recoveryNotice, setRecoveryNotice] = useState<string | null>(null);
  const recoveryFileRef = useRef<HTMLInputElement>(null);
  const {
    data,
    loading,
    error,
    storageError,
    resetEpoch,
    retryBootstrap,
    downloadRawRecoveryCopy,
    restoreFromBackup,
    resetProgress,
    personalizationOpen,
    tourOpen,
    sidebarCollapsed,
    toasts,
    dismissToast,
  } = usePlatform();
  const location = useLocation();

  if (personalizationOpen && !error) {
    return (
      <MotionConfig reducedMotion={data.settings.reducedMotion ? "always" : "user"}>
        <ClickSpark paletteId={data.settings.themePalette} />
        <PersonalizationModal />
      </MotionConfig>
    );
  }

  if (loading && !error && !data.settings.profileSetupCompleted) {
    return (
      <MotionConfig reducedMotion={data.settings.reducedMotion ? "always" : "user"}>
        <div className="ce-welcome-screen" aria-busy="true" aria-label="Carregando Code Entry">
          <AmbientAurora speed={0.5} />
        </div>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion={data.settings.reducedMotion ? "always" : "user"}>
      <div className={`ce-shell ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
        <InteractiveBackground
          reducedMotion={Boolean(data.settings.reducedMotion)}
          theme={data.settings.theme}
          paletteId={data.settings.themePalette}
        />
        <ClickSpark paletteId={data.settings.themePalette} />
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

        <div className="ce-main-col">
          <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
          <main className="ce-page-body">
            {error ? (
              <div
                className="ce-panel"
                style={{
                  maxWidth: 620,
                  margin: "36px auto",
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  borderColor: "rgba(248, 113, 113, 0.35)",
                }}
                role="alert"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AlertCircle size={20} style={{ color: "var(--accent-danger)", flexShrink: 0 }} />
                  <strong style={{ fontSize: 16 }}>Não foi possível carregar seus dados salvos</strong>
                </div>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
                  {storageError?.message || error}
                </p>
                {storageError?.canDownloadRawBackup && (
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                    Seus registros não foram descartados automaticamente. Você pode baixar uma cópia preservada do arquivo local, importar um backup `.json` ou, se preferir, escolher o reset explícito para começar do zero.
                  </p>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button
                    type="button"
                    className="ce-btn ce-btn-primary ce-btn-sm"
                    onClick={() => {
                      setConfirmStorageReset(false);
                      setRecoveryNotice(null);
                      retryBootstrap();
                    }}
                  >
                    <RefreshCw size={14} />
                    <span>Tentar novamente</span>
                  </button>

                  {storageError?.canDownloadRawBackup && (
                    <button
                      type="button"
                      className="ce-btn ce-btn-ghost ce-btn-sm"
                      onClick={async () => {
                        const ok = await downloadRawRecoveryCopy();
                        setRecoveryNotice(
                          ok
                            ? "Cópia preservada (.sqlite) baixada para este dispositivo."
                            : "Nenhuma cópia binária disponível para download."
                        );
                      }}
                    >
                      <Download size={14} />
                      <span>Baixar cópia preservada (.sqlite)</span>
                    </button>
                  )}

                  {storageError?.canImportJson && (
                    <>
                      <button
                        type="button"
                        className="ce-btn ce-btn-ghost ce-btn-sm"
                        onClick={() => recoveryFileRef.current?.click()}
                      >
                        <Upload size={14} />
                        <span>Importar backup (.json)</span>
                      </button>
                      <input
                        ref={recoveryFileRef}
                        type="file"
                        accept="application/json"
                        hidden
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const parsed = JSON.parse(await file.text());
                            await restoreFromBackup(parsed);
                            setConfirmStorageReset(false);
                            setRecoveryNotice(null);
                          } catch (err) {
                            setRecoveryNotice(
                              err instanceof Error ? err.message : "Erro ao importar backup JSON."
                            );
                          } finally {
                            e.target.value = "";
                          }
                        }}
                      />
                    </>
                  )}
                </div>

                {storageError?.canResetLocal && (
                  <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 12 }}>
                    {!confirmStorageReset ? (
                      <button
                        type="button"
                        className="ce-btn ce-btn-ghost ce-btn-sm"
                        style={{ color: "var(--accent-danger)" }}
                        onClick={() => setConfirmStorageReset(true)}
                      >
                        <RotateCcw size={14} />
                        <span>Resetar dados locais (começar do zero)</span>
                      </button>
                    ) : (
                      <div className="ce-reset-confirm-box" role="alertdialog" aria-label="Confirmar limpeza após erro">
                        <span style={{ fontSize: 12.5, lineHeight: 1.45 }}>
                          Confirmar a remoção completa dos dados locais do Code Entry neste navegador? Outros sites não serão afetados.
                        </span>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            className="ce-btn ce-btn-sm ce-btn-danger"
                            onClick={async () => {
                              await resetProgress();
                              setConfirmStorageReset(false);
                              setRecoveryNotice(null);
                            }}
                          >
                            Sim, apagar dados do Code Entry e recomeçar
                          </button>
                          <button
                            type="button"
                            className="ce-btn ce-btn-ghost ce-btn-sm"
                            onClick={() => setConfirmStorageReset(false)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {recoveryNotice && (
                  <div style={{ fontSize: 12.5, color: "var(--accent-secondary)" }}>{recoveryNotice}</div>
                )}
              </div>
            ) : loading ? (
              <DashboardSkeleton />
            ) : (
              <motion.div
                key={`${resetEpoch}:${location.pathname}`}
                initial={{ opacity: 0, y: tourOpen ? 14 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: tourOpen ? 1.04 : 0.22,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Outlet />
              </motion.div>
            )}
          </main>
        </div>

        <MobileBottomNav onOpenDrawer={() => setMobileOpen(true)} />
        <ReferenceModal />
        <ThemeDock />
        <PersonalizationModal />
        <ProductTour />
        <LiaAmbientCameos />
        <CompletionCelebration />

        <div className="ce-toast-stack" aria-live="polite">
          <AnimatePresence>
            {toasts.map(t => (
              <motion.div
                key={t.id}
                className={`ce-toast is-${t.kind || "success"}`}
                initial={{ opacity: 0, x: 20, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {t.kind === "info" ? (
                  <Info size={19} style={{ color: "var(--accent-blue)", flexShrink: 0 }} />
                ) : t.kind === "error" ? (
                  <AlertCircle size={19} style={{ color: "var(--accent-danger)", flexShrink: 0 }} />
                ) : (
                  <Award size={20} style={{ color: "#FACC15", flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t.subtitle}</div>
                </div>
                <button
                  type="button"
                  style={{ border: 0, background: "transparent", color: "var(--text-muted)" }}
                  onClick={() => dismissToast(t.id)}
                  aria-label="Fechar notificação"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
};
