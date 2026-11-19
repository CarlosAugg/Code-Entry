import React from "react";
import { NavLink } from "react-router-dom";
import { FlaskConical, Home, Layers, Menu, Swords } from "lucide-react";

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
      <NavLink to="/desafios" data-tour="mobile-nav-challenges" className={({ isActive }) => `ce-mobile-tab ${isActive ? "is-active" : ""}`}>
        <Swords size={18} aria-hidden="true" />
        <span>Desafios</span>
      </NavLink>
      <NavLink to="/laboratorios" data-tour="mobile-nav-labs" className={({ isActive }) => `ce-mobile-tab ${isActive ? "is-active" : ""}`}>
        <FlaskConical size={18} aria-hidden="true" />
        <span>Labs</span>
      </NavLink>
      <button type="button" className="ce-mobile-tab" onClick={onOpenDrawer} aria-label="Mais páginas e menu">
        <Menu size={18} aria-hidden="true" />
        <span>Menu</span>
      </button>
    </nav>
  );
};
