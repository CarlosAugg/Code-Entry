import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutGroup, motion } from "motion/react";
import {
  Award,
  BookOpen,
  Code2,
  Compass,
  FlaskConical,
  FolderKanban,
  History,
  Home,
  Layers,
  Map as MapIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Rocket,
  Swords,
  TrendingUp,
} from "lucide-react";
import { usePlatform } from "../../context/PlatformContext";
import { Tooltip } from "../shared/Tooltip";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { to: "/", label: "Início", tourKey: "home", icon: Home, end: true },
  { to: "/trilhas", label: "Trilhas", tourKey: "tracks", icon: Layers, end: false },
  { to: "/roadmaps", label: "Roadmaps", tourKey: "roadmaps", icon: MapIcon, end: false },
  { to: "/projetos", label: "Projetos", tourKey: "projects", icon: FolderKanban, end: false },
  { to: "/plano-de-estudos", label: "Plano de Estudos", tourKey: "study-plan", icon: BookOpen, end: false },
  { to: "/desafios", label: "Desafios", tourKey: "challenges", icon: Swords, end: false },
  { to: "/laboratorios", label: "Laboratórios", tourKey: "labs", icon: FlaskConical, end: false },
  { to: "/conquistas", label: "Conquistas", tourKey: "achievements", icon: Award, end: false },
  { to: "/historico", label: "Histórico", tourKey: "history", icon: History, end: false },
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { stats, sidebarCollapsed, toggleSidebarCollapsed } = usePlatform();
  const navigate = useNavigate();

  return (
    <>
      <div
        className={`ce-sidebar-backdrop ${mobileOpen ? "is-open" : ""}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside
        className={`ce-sidebar ${mobileOpen ? "is-open" : ""} ${sidebarCollapsed ? "is-collapsed" : ""}`}
        aria-label="Navegação principal"
      >
        <div className="ce-sidebar-header-row">
          <NavLink to="/" className="ce-brand" onClick={onCloseMobile}>
            <div className="ce-brand-mark" aria-hidden="true">
              <Code2 size={21} strokeWidth={2.3} />
            </div>
            <div className="ce-brand-copy">
              <span className="ce-brand-name">Code Entry</span>
              <span className="ce-brand-tagline">Aprenda. Pratique. Evolua.</span>
            </div>
          </NavLink>

          <Tooltip
            content={sidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
            side="right"
          >
            <button
              type="button"
              className="ce-icon-btn ce-sidebar-collapse-btn"
              onClick={toggleSidebarCollapsed}
              aria-label={sidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </button>
          </Tooltip>
        </div>

        <LayoutGroup id="ce-sidebar-nav">
          <nav className="ce-nav">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <Tooltip
                  key={item.to}
                  content={item.label}
                  side="right"
                  fullWidth
                  disabled={!sidebarCollapsed || mobileOpen}
                >
                  <NavLink
                    to={item.to}
                    end={item.end}
                    data-tour={`nav-${item.tourKey}`}
                    onClick={onCloseMobile}
                    className={({ isActive }) => `ce-nav-link ${isActive ? "is-active" : ""}`}
                    style={{ width: "100%", position: "relative" }}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="ce-sidebar-active-pill"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                            style={{
                              position: "absolute",
                              inset: -1,
                              borderRadius: 11,
                              background: "var(--gradient-nav-active)",
                              border: "1px solid var(--border-accent)",
                              boxShadow: "0 6px 18px rgba(var(--accent-rgb), 0.28)",
                              pointerEvents: "none",
                              zIndex: 0,
                            }}
                            aria-hidden="true"
                          />
                        )}
                        <Icon size={17} strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0, position: "relative", zIndex: 1 }} />
                        <span className="ce-nav-label" style={{ position: "relative", zIndex: 1 }}>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </Tooltip>
              );
            })}
          </nav>
        </LayoutGroup>

        {!stats.hasStartedAnyTrack ? (
          <section className="ce-sidebar-cta-card" aria-label="Começar jornada">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Rocket size={18} style={{ color: "var(--accent-secondary)" }} aria-hidden="true" />
              <strong>Comece sua jornada</strong>
            </div>
            <p>
              Escolha uma Trilha guiada ou explore um Roadmap para dar o primeiro passo prático.
            </p>
            <button
              type="button"
              className="ce-btn ce-btn-primary ce-btn-sm"
              onClick={() => {
                onCloseMobile();
                navigate("/trilhas");
              }}
            >
              <Compass size={14} aria-hidden="true" />
              <span>Explorar trilhas</span>
            </button>
          </section>
        ) : (
          <section className="ce-sidebar-progress" aria-label="Progresso geral">
            <div className="ce-sidebar-prog-head">
              <span>Seu progresso</span>
              <TrendingUp size={15} style={{ color: "var(--accent-secondary)" }} aria-hidden="true" />
            </div>
            <div className="ce-sidebar-prog-value">
              <strong>{stats.overallPercent}%</strong>
              <span>
                {stats.completedActivities} / {stats.totalActivities} concluídas
              </span>
            </div>
            <div
              className="ce-progress-track"
              role="progressbar"
              aria-valuenow={stats.overallPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="ce-progress-fill" style={{ width: `${stats.overallPercent}%` }} />
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 6 }}>
              {stats.totalXp} XP · {stats.activeTracks.length} trilha(s) iniciada(s)
            </div>
          </section>
        )}
      </aside>
    </>
  );
};
