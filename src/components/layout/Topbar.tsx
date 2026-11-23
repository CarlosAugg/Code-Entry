import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Maximize2, Menu, Minimize2, Search, X } from "lucide-react";
import { CHALLENGES } from "../../data/challenges";
import { ALL_LESSONS } from "../../data/lessons";
import { ROADMAPS, getAllRoadmapProjects } from "../../data/roadmaps";
import { TRACK_MAP, TRACKS } from "../../data/tracks";
import { usePlatform } from "../../context/PlatformContext";
import { UserMenuPopover } from "./UserMenuPopover";

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

interface SearchHit {
  kind: "Trilha" | "Aula" | "Desafio" | "Roadmap" | "Projeto" | "Tópico";
  title: string;
  subtitle: string;
  to: string;
  accent: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const { data, openReferenceFor } = usePlatform();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const userWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (userWrapRef.current && !userWrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, []);

  const searchHits = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const hits: SearchHit[] = [];

    for (const t of TRACKS) {
      if (`${t.name} ${t.tagline} ${t.category}`.toLowerCase().includes(q)) {
        hits.push({
          kind: "Trilha",
          title: t.name,
          subtitle: t.tagline,
          to: `/trilhas/${t.id}`,
          accent: t.accentColor,
        });
      }
    }

    for (const { node, roadmap } of getAllRoadmapProjects()) {
      const projHay = `${node.title} ${node.summary} ${node.keyConcepts.join(" ")} ${(node.projectIdeas || []).join(" ")}`.toLowerCase();
      if (projHay.includes(q)) {
        hits.push({
          kind: "Projeto",
          title: node.title,
          subtitle: `Projeto · Roadmap ${roadmap.shortTitle}`,
          to: `/projetos?destaque=${node.id}`,
          accent: roadmap.accentColor,
        });
      }
    }

    for (const l of ALL_LESSONS) {
      if (`${l.title} ${l.subtitle} ${l.moduleTitle}`.toLowerCase().includes(q)) {
        const track = TRACK_MAP[l.trackId];
        hits.push({
          kind: "Aula",
          title: l.title,
          subtitle: `${track.name} · ${l.subtitle}`,
          to: `/trilhas/${l.trackId}/aula/${l.id}`,
          accent: track.accentColor,
        });
      }
    }
    for (const c of CHALLENGES) {
      if (`${c.title} ${c.topic} ${c.difficulty}`.toLowerCase().includes(q)) {
        const track = TRACK_MAP[c.trackId];
        hits.push({
          kind: "Desafio",
          title: c.title,
          subtitle: `${track.name} · ${c.topic} (${c.difficulty})`,
          to: `/desafios/${c.id}`,
          accent: track.accentColor,
        });
      }
    }

    for (const rm of ROADMAPS) {
      if (`${rm.title} ${rm.shortTitle} ${rm.summary} ${rm.scopeLabel}`.toLowerCase().includes(q)) {
        hits.push({
          kind: "Roadmap",
          title: rm.title,
          subtitle: `Roadmap · ${rm.scopeLabel} · ${rm.nodes.length} tópicos`,
          to: `/roadmaps/${rm.id}`,
          accent: rm.accentColor,
        });
      }

      for (const node of rm.nodes) {
        if (node.kind === "project" || node.kind === "checkpoint") continue;
        const nodeHay = `${node.title} ${node.summary} ${node.keyConcepts.join(" ")}`.toLowerCase();
        if (nodeHay.includes(q)) {
          hits.push({
            kind: "Tópico",
            title: node.title,
            subtitle: `Roadmap ${rm.shortTitle} · ${
              node.priority === "required"
                ? "Obrigatório"
                : node.priority === "optional"
                  ? "Opcional"
                  : "Recomendado"
            }`,
            to: `/roadmaps/${rm.id}?topico=${node.id}`,
            accent: rm.accentColor,
          });
        }
      }
    }

    return hits.slice(0, 10);
  }, [query]);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignora em ambientes sem suporte a fullscreen
    }
  };

  const initial = (data.settings.displayName || "E").trim().charAt(0).toUpperCase();

  return (
    <header className="ce-topbar">
      <div className="ce-topbar-left">
        <button
          type="button"
          data-tour="mobile-menu-btn"
          className="ce-icon-btn ce-mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Abrir menu lateral"
        >
          <Menu size={18} />
        </button>
      </div>

      <div className="ce-search-box" data-tour="topbar-search" ref={searchWrapRef}>
        <div className="ce-search-input-wrap">
          <Search size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} aria-hidden="true" />
          <input
            type="search"
            className="ce-search-input"
            placeholder="Buscar trilhas, roadmaps, projetos, aulas ou conceitos..."
            value={query}
            onFocus={() => setSearchFocused(true)}
            onChange={e => {
              setQuery(e.target.value);
              setSearchFocused(true);
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && searchHits.length > 0) {
                navigate(searchHits[0].to);
                setSearchFocused(false);
              } else if (e.key === "Escape") {
                setSearchFocused(false);
              }
            }}
            aria-label="Buscar conteúdo na plataforma"
          />
          {query && (
            <button
              type="button"
              style={{ border: 0, background: "transparent", color: "var(--text-muted)", padding: 2 }}
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {searchFocused && query.trim().length > 0 && (
          <div className="ce-search-results" role="listbox" aria-label="Resultados da busca">
            {searchHits.length === 0 ? (
              <div style={{ padding: "12px 14px", fontSize: 13, color: "var(--text-muted)" }}>
                Nenhum resultado encontrado para "{query}".
              </div>
            ) : (
              searchHits.map(hit => (
                <button
                  key={`${hit.kind}-${hit.to}`}
                  type="button"
                  className="ce-search-item"
                  onClick={() => {
                    navigate(hit.to);
                    setSearchFocused(false);
                    setQuery("");
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                      {hit.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{hit.subtitle}</div>
                  </div>
                  <span
                    className="ce-badge"
                    style={{ borderColor: hit.accent, color: hit.accent, flexShrink: 0 }}
                  >
                    {hit.kind}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="ce-topbar-actions">
        <button
          type="button"
          data-tour="topbar-reference"
          className="ce-pill-btn"
          onClick={() => openReferenceFor(data.settings.activeTrackId || "logic")}
          title="Abrir manual rápido de sintaxe e atalhos"
          aria-label="Manual rápido"
        >
          <BookOpen size={15} style={{ color: "var(--accent-secondary)" }} aria-hidden="true" />
          <span className="ce-hide-mobile">Manual</span>
        </button>

        <button
          type="button"
          className="ce-icon-btn ce-hide-mobile"
          onClick={handleToggleFullscreen}
          title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          aria-label="Alternar tela cheia"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        <div className="ce-user-menu-wrap" ref={userWrapRef}>
          <button
            type="button"
            data-tour="topbar-profile"
            className="ce-avatar-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-expanded={menuOpen}
            aria-label="Menu do estudante e configurações"
            title={`Perfil e preferências (${data.settings.displayName})`}
          >
            {initial}
          </button>
          {menuOpen && <UserMenuPopover onClose={() => setMenuOpen(false)} />}
        </div>
      </div>
    </header>
  );
};
