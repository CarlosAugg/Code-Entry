import React, { useMemo, useState } from "react";
import { CheckCircle2, History, Info, Search, XCircle } from "lucide-react";
import { TRACK_MAP, TRACKS } from "../data/tracks";
import { usePlatform } from "../context/PlatformContext";
import type { TrackId } from "../types/curriculum";
import { AmbientAurora } from "../components/motion/AmbientAurora";
import { ShinyText } from "../components/motion/ShinyText";
import { TechIcon } from "../components/shared/TechIcon";
import { Tooltip } from "../components/shared/Tooltip";

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const HistoryPage: React.FC = () => {
  const { data } = usePlatform();
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState<"all" | TrackId>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return data.history.filter(item => {
      if (trackFilter !== "all" && item.trackId !== trackFilter) return false;
      if (typeFilter !== "all" && item.eventType !== typeFilter) return false;
      if (search.trim()) {
        const hay = `${item.title} ${item.detail}`.toLowerCase();
        if (!hay.includes(search.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [data.history, search, trackFilter, typeFilter]);

  // Gráfico real dos últimos 7 dias a partir de data.history (calendário local)
  const last7Days = useMemo(() => {
    const countsByDay = new Map<string, number>();
    for (const h of data.history) {
      if (!h.createdAt) continue;
      const parsed = new Date(h.createdAt);
      const key = Number.isNaN(parsed.getTime()) ? h.createdAt.slice(0, 10) : toLocalDateStr(parsed);
      countsByDay.set(key, (countsByDay.get(key) || 0) + 1);
    }

    const days: { dateStr: string; label: string; fullDate: string; count: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = toLocalDateStr(d);
      const label = d.toLocaleDateString("pt-BR", { weekday: "short" });
      const fullDate = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      const count = countsByDay.get(dateStr) || 0;
      days.push({ dateStr, label, fullDate, count });
    }
    return days;
  }, [data.history]);

  const maxDayCount = Math.max(1, ...last7Days.map(d => d.count));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <section className="ce-hero-banner" style={{ gridTemplateColumns: "1fr auto" }}>
        <AmbientAurora />
        <div>
          <span className="ce-badge" style={{ borderColor: "var(--border-accent)", color: "var(--accent-secondary)" }}>
            <History size={12} />
            <ShinyText text="Registro Real de Evolução" />
          </span>
          <h1 className="ce-hero-title" style={{ marginTop: 10 }}>
            Histórico de Atividades
          </h1>
          <p className="ce-hero-sub" style={{ marginBottom: 0 }}>
            Acompanhe cada execução, tentativa, aula concluída, desafio resolvido e experimento nos laboratórios.
          </p>
        </div>

        <div className="ce-metric-tile" style={{ minWidth: 140 }}>
          <span>Registros salvos</span>
          <strong>{data.history.length}</strong>
        </div>
      </section>

      {/* Gráfico real dos últimos 7 dias */}
      <section className="ce-panel">
        <h2 className="ce-section-title" style={{ fontSize: 15, marginBottom: 14 }}>
          Frequência nos últimos 7 dias
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 10, alignItems: "end", height: 110 }}>
          {last7Days.map(d => {
            const hPct = d.count === 0 ? 6 : Math.max(16, Math.round((d.count / maxDayCount) * 86));
            return (
              <Tooltip
                key={d.dateStr}
                content={`${d.fullDate}: ${d.count} ${d.count === 1 ? "atividade" : "atividades"}`}
                side="top"
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end", width: "100%" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.count}</span>
                  <div
                    className="ce-bar-fill"
                    style={{
                      width: "100%",
                      maxWidth: 42,
                      height: `${hPct}%`,
                      borderRadius: 8,
                      background: d.count > 0 ? "linear-gradient(180deg, var(--accent-secondary), var(--accent-primary))" : "rgba(148,163,184,0.14)",
                    }}
                  />
                  <span style={{ fontSize: 11.5, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                    {d.label}
                  </span>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </section>

      {/* Filtros */}
      <section
        className="ce-surface"
        style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}
      >
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 340 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
          <input
            className="ce-input"
            style={{ width: "100%", paddingLeft: 34 }}
            placeholder="Filtrar histórico..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Filtrar histórico"
          />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            className="ce-select"
            style={{ height: 34, fontSize: 12.5 }}
            value={trackFilter}
            onChange={e => setTrackFilter(e.target.value as "all" | TrackId)}
            aria-label="Filtrar por trilha"
          >
            <option value="all">Trilha: Todas</option>
            {TRACKS.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select
            className="ce-select"
            style={{ height: 34, fontSize: 12.5 }}
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            aria-label="Filtrar por tipo de evento"
          >
            <option value="all">Tipo: Todos</option>
            <option value="lesson_completed">Aulas concluídas</option>
            <option value="lesson_attempt">Tentativas em aulas</option>
            <option value="challenge_completed">Desafios concluídos</option>
            <option value="challenge_attempt">Tentativas em desafios</option>
            <option value="lab_run">Laboratórios</option>
          </select>
        </div>
      </section>

      {/* Lista cronológica */}
      <section className="ce-surface" style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 28, textAlign: "center", color: "var(--text-muted)" }}>
            {data.history.length === 0
              ? "Nenhuma atividade registrada até o momento. Inicie uma aula ou laboratório!"
              : "Nenhum registro corresponde aos filtros aplicados."}
          </div>
        ) : (
          filtered.map(item => {
            const track = item.trackId ? TRACK_MAP[item.trackId] : null;
            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  padding: "13px 18px",
                  borderBottom: "1px solid var(--border-subtle)",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  {track ? <TechIcon trackId={track.id} size={22} boxed /> : null}
                  <div>
                    <strong style={{ fontSize: 13.5, display: "block" }}>{item.title}</strong>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {item.detail || item.eventType}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {item.xpDelta > 0 && (
                    <span className="ce-badge ce-badge-diff-easy">+{item.xpDelta} XP</span>
                  )}
                  {item.status === "success" ? (
                    <CheckCircle2 size={16} style={{ color: "var(--accent-success)" }} />
                  ) : item.status === "error" ? (
                    <XCircle size={16} style={{ color: "var(--accent-danger)" }} />
                  ) : (
                    <Info size={16} style={{ color: "var(--accent-blue)" }} />
                  )}
                  <span style={{ fontSize: 11.5, color: "var(--text-muted)", minWidth: 115, textAlign: "right" }}>
                    {new Date(item.createdAt).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
