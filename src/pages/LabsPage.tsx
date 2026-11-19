import React, { useRef, useState } from "react";
import { FlaskConical } from "lucide-react";
import { TRACK_MAP, TRACKS } from "../data/tracks";
import { usePlatform } from "../context/PlatformContext";
import type { NetworkWorkbenchMode, TrackId } from "../types/curriculum";
import { AmbientAurora } from "../components/motion/AmbientAurora";
import { ShinyText } from "../components/motion/ShinyText";
import { TechIcon } from "../components/shared/TechIcon";
import { CodeWorkbench } from "../components/workbenches/CodeWorkbench";
import { LinuxWorkbench } from "../components/workbenches/LinuxWorkbench";
import { SqlWorkbench } from "../components/workbenches/SqlWorkbench";
import { NetworkWorkbench } from "../components/workbenches/NetworkWorkbench";

const LAB_STARTERS: Record<TrackId, string> = {
  logic: `// Laboratório de Lógica / Portugol
var valores = [12, 25, 18, 40, 31];
var soma = 0;

para (var i = 0; i < valores.length; i++) {
  soma = soma + valores[i];
}

var media = soma / valores.length;
escreva("Soma total:", soma);
escreva("Média aritmética:", media);`,
  js: `// Laboratório JavaScript ES2024\nconst servicos = [\n  { nome: "API", latencia: 42 },\n  { nome: "Auth", latencia: 19 },\n  { nome: "DB", latencia: 85 }\n];\n\nconst media = servicos.reduce((acc, s) => acc + s.latencia, 0) / servicos.length;\nconsole.log("Latência média:", media.toFixed(1), "ms");`,
  python: `# Laboratório Python 3\ndados = [12, 25, 18, 40, 31]\nmedia = sum(dados) / len(dados)\nacima = [x for x in dados if x > media]\n\nprint(f"Média: {media:.1f}")\nprint(f"Valores acima da média: {acima}")`,
  cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> portas = {22, 80, 443, 5432};\n    cout << "Portas monitoradas: " << portas.size() << endl;\n    for (int i = 0; i < portas.size(); i++) {\n        cout << "Porta aberta -> " << portas[i] << endl;\n    }\n    return 0;\n}`,
  linux: "",
  networks: "",
  database: `-- Laboratório de Banco de Dados SQL\nSELECT p.nome, p.categoria, p.preco, p.estoque\nFROM produtos p\nWHERE p.ativo = 1\nORDER BY p.preco DESC\nLIMIT 6;`,
};

export const LabsPage: React.FC = () => {
  const { data, saveDraft, saveWorkspace, logLabActivity } = usePlatform();
  const [activeLab, setActiveLab] = useState<TrackId>("js");
  const [sqlDataset, setSqlDataset] = useState<"ecommerce" | "empresa">("ecommerce");
  const [netMode, setNetMode] = useState<NetworkWorkbenchMode>("topology");
  const draftTimers = useRef<Record<string, number>>({});

  const [labCodes, setLabCodes] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const t of TRACKS) {
      init[t.id] = data.drafts[`lab:${t.id}`]?.code ?? LAB_STARTERS[t.id];
    }
    return init;
  });

  const [labStdins, setLabStdins] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const t of TRACKS) {
      init[t.id] = data.drafts[`lab:${t.id}`]?.stdin ?? "";
    }
    return init;
  });

  const track = TRACK_MAP[activeLab];

  const scheduleLabSave = (id: TrackId, codeVal: string, stdinVal: string) => {
    if (draftTimers.current[id]) window.clearTimeout(draftTimers.current[id]);
    draftTimers.current[id] = window.setTimeout(() => {
      saveDraft(`lab:${id}`, codeVal, stdinVal).catch(() => {});
    }, 650);
  };

  return (
    <div
      style={
        {
          "--track-accent": track.accentColor,
          "--track-secondary": track.accentSecondary,
          "--track-soft": track.accentSoft,
          "--track-border": track.accentBorder,
          "--track-glow": track.accentGlow,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        } as React.CSSProperties
      }
    >
      <section className="ce-hero-banner" style={{ gridTemplateColumns: "1fr" }}>
        <AmbientAurora accentColor={track.accentColor} secondaryColor={track.accentSecondary} />
        <div>
          <span className="ce-badge" style={{ borderColor: "var(--border-accent)", color: "var(--accent-secondary)" }}>
            <FlaskConical size={12} />
            <ShinyText text="Experimentação Livre" />
          </span>
          <h1 className="ce-hero-title" style={{ marginTop: 10 }}>
            Laboratórios Interativos
          </h1>
          <p className="ce-hero-sub" style={{ marginBottom: 0 }}>
            Teste algoritmos com feedback imediato, explore um terminal Linux completo, execute consultas SQL ou simule redes de computadores.
          </p>
        </div>
      </section>

      {/* Seletor de Laboratórios */}
      <div
        data-tour="labs-selector"
        style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
        role="tablist"
        aria-label="Selecionar laboratório"
      >
        {TRACKS.map(t => {
          const active = t.id === activeLab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              className="ce-btn ce-btn-ghost"
              style={{
                height: 44,
                borderColor: active ? t.accentBorder : "var(--border-subtle)",
                background: active ? t.accentSoft : "var(--bg-surface)",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
              }}
              onClick={() => setActiveLab(t.id)}
            >
              <TechIcon trackId={t.id} size={20} />
              <span>Lab {t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Área do Laboratório Ativo */}
      {(activeLab === "logic" || activeLab === "js" || activeLab === "python" || activeLab === "cpp") && (
        <CodeWorkbench
          trackId={activeLab}
          code={labCodes[activeLab] ?? LAB_STARTERS[activeLab]}
          stdin={labStdins[activeLab] ?? ""}
          starterCode={LAB_STARTERS[activeLab]}
          requiresStdin={activeLab === "cpp"}
          onChangeCode={next => {
            setLabCodes(prev => ({ ...prev, [activeLab]: next }));
            scheduleLabSave(activeLab, next, labStdins[activeLab] || "");
          }}
          onChangeStdin={next => {
            setLabStdins(prev => ({ ...prev, [activeLab]: next }));
            scheduleLabSave(activeLab, labCodes[activeLab] || "", next);
          }}
          onEvaluate={(ctx, durationMs) => {
            logLabActivity(
              activeLab,
              `Laboratório ${track.name}`,
              ctx.success ? `Executado em ${durationMs}ms` : ctx.error || "Erro",
              ctx.success ? "success" : "error"
            ).catch(() => {});
          }}
          accentColor={track.accentColor}
          darkTextOnAccent={track.darkTextOnAccent}
        />
      )}

      {activeLab === "linux" && (
        <LinuxWorkbench
          workspaceKey="lab:linux"
          initialSerialized={data.workspaces["lab:linux"]}
          onPersistState={state => saveWorkspace("lab:linux", state).catch(() => {})}
          onEvaluate={ctx => {
            logLabActivity(
              "linux",
              "Laboratório Linux",
              `Comando: ${ctx.code}`,
              ctx.success ? "success" : "error"
            ).catch(() => {});
          }}
        />
      )}

      {activeLab === "database" && (
        <SqlWorkbench
          datasetId={sqlDataset}
          allowDatasetSwitch
          onChangeDataset={setSqlDataset}
          code={labCodes.database ?? LAB_STARTERS.database}
          starterCode={LAB_STARTERS.database}
          onChangeCode={next => {
            setLabCodes(prev => ({ ...prev, database: next }));
            scheduleLabSave("database", next, "");
          }}
          onEvaluate={(ctx, durationMs) => {
            logLabActivity(
              "database",
              `Laboratório SQL (${sqlDataset})`,
              ctx.success ? `${ctx.sql?.rowCount ?? 0} linha(s) em ${durationMs}ms` : ctx.error || "Erro SQL",
              ctx.success ? "success" : "error"
            ).catch(() => {});
          }}
        />
      )}

      {activeLab === "networks" && (
        <NetworkWorkbench
          mode={netMode}
          allowModeSwitch
          onChangeMode={setNetMode}
          preset={{ topologyPreset: "healthy", targetCidr: "192.168.10.25/24" }}
          quickCommands={[
            { label: "ip a", command: "ip a" },
            { label: "ip route", command: "ip route" },
            { label: "ping 10.0.20.10", command: "ping 10.0.20.10" },
            { label: "traceroute web.empresa.local", command: "traceroute web.empresa.local" },
            { label: "test-acl 10.0.20.10 TCP 443", command: "test-acl 10.0.20.10 TCP 443" },
          ]}
          onEvaluate={ctx => {
            logLabActivity(
              "networks",
              `Laboratório Redes (${netMode})`,
              `Ação: ${ctx.code}`,
              ctx.success ? "success" : "info"
            ).catch(() => {});
          }}
        />
      )}
    </div>
  );
};
