import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { AlertCircle, Award, Info, RefreshCw, X } from "lucide-react";
import { usePlatform } from "../../context/PlatformContext";
import { ClickSpark } from "../motion/ClickSpark";
import { InteractiveBackground } from "../motion/InteractiveBackground";
import { PersonalizationModal } from "../onboarding/PersonalizationModal";
import { ProductTour } from "../onboarding/ProductTour";
import { CompletionCelebration } from "../shared/CompletionCelebration";
import { DashboardSkeleton } from "../shared/Skeleton";
import { MobileBottomNav } from "./MobileBottomNav";
import { ReferenceModal } from "./ReferenceModal";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data, loading, error, retryBootstrap, sidebarCollapsed, toasts, dismissToast } = usePlatform();
  const location = useLocation();

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
                  maxWidth: 560,
                  margin: "36px auto",
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  borderColor: "rgba(248, 113, 113, 0.35)",
                }}
                role="alert"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AlertCircle size={20} style={{ color: "var(--accent-danger)", flexShrink: 0 }} />
                  <strong style={{ fontSize: 16 }}>Não foi possível carregar seus dados salvos</strong>
                </div>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: 0 }}>{error}</p>
                <div>
                  <button type="button" className="ce-btn ce-btn-primary ce-btn-sm" onClick={retryBootstrap}>
                    <RefreshCw size={14} />
                    <span>Tentar novamente</span>
                  </button>
                </div>
              </div>
            ) : loading ? (
              <DashboardSkeleton />
            ) : (
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <Outlet />
              </motion.div>
            )}
          </main>
        </div>

        <MobileBottomNav onOpenDrawer={() => setMobileOpen(true)} />
        <ReferenceModal />
        <PersonalizationModal />
        <ProductTour />
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
