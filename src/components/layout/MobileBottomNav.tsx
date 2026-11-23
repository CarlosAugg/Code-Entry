import React from "react";
import { NavLink } from "react-router-dom";
import { FolderKanban, Home, Layers, Map as MapIcon, Menu } from "lucide-react";

interface MobileBottomNavProps {
  onOpenDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenDrawer }) => {
  return (
    <nav className="ce-mobile-bottom-nav" aria-label="Navegação rápida mobile">
      <NavLink to="/" end data-tour="mobile-nav-home" className={({ isActive }) => `ce-mobile-tab ${isActive ? "is-active" : ""}`}>
        <Home size={18} aria-hidden="true" />
        <span>Início</span>
      </NavLink>
      <NavLink to="/trilhas" data-tour="mobile-nav-tracks" className={({ isActive }) => `ce-mobile-tab ${isActive ? "is-active" : ""}`}>
        <Layers size={18} aria-hidden="true" />
        <span>Trilhas</span>
      </NavLink>
      <NavLink to="/roadmaps" data-tour="mobile-nav-roadmaps" className={({ isActive }) => `ce-mobile-tab ${isActive ? "is-active" : ""}`}>
        <MapIcon size={18} aria-hidden="true" />
        <span>Roadmaps</span>
      </NavLink>
      <NavLink to="/projetos" data-tour="mobile-nav-projects" className={({ isActive }) => `ce-mobile-tab ${isActive ? "is-active" : ""}`}>
        <FolderKanban size={18} aria-hidden="true" />
        <span>Projetos</span>
      </NavLink>
      <button type="button" className="ce-mobile-tab" onClick={onOpenDrawer} aria-label="Mais páginas e menu">
        <Menu size={18} aria-hidden="true" />
        <span>Menu</span>
      </button>
    </nav>
  );
};
