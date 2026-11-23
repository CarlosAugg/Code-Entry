import React, { useEffect, useRef, useState } from "react";
import { FlaskConical } from "lucide-react";
import { TRACK_MAP, TRACKS } from "../data/tracks";
import { usePlatform } from "../context/PlatformContext";
import type { NetworkWorkbenchMode, TrackId } from "../types/curriculum";
import { serializeWebFiles } from "../engines/web/webFiles";
import { AmbientAurora } from "../components/motion/AmbientAurora";
import { ShinyText } from "../components/motion/ShinyText";
import { TechIcon } from "../components/shared/TechIcon";
import { HeroIllustration } from "../components/shared/HeroIllustration";
import { CodeWorkbench } from "../components/workbenches/CodeWorkbench";
import { WebWorkbench } from "../components/workbenches/WebWorkbench";
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
  web: serializeWebFiles({
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Laboratório Web</title>
</head>
<body>
  <main class="card">
    <header>
      <span class="tag">Sandbox Web</span>
      <h1>Cartão Interativo</h1>
    </header>
    <p>Edite <strong>index.html</strong>, <strong>style.css</strong> e <strong>script.js</strong> e teste em Desktop ou Mobile.</p>
    <div class="actions">
      <button id="btn-contar" type="button">Cliquei <span id="contador">0</span>x</button>
    </div>
  </main>
</body>
</html>`,
    css: `:root {
  --cor-primaria: #f97316;
  --cor-fundo: #f8fafc;
}

body {
  background: var(--cor-fundo);
  display: flex;
  justify-content: center;
  padding: 24px;
}

.card {
  width: min(440px, 100%);
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: #c2410c;
  background: #ffedd5;
  padding: 3px 10px;
  border-radius: 999px;
}

.actions {
  margin-top: 16px;
}

button {
  background: var(--cor-primaria);
  color: #ffffff;
  border: 0;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}`,
    js: `const btn = document.getElementById("btn-contar");
const visor = document.getElementById("contador");
let total = 0;

if (btn && visor) {
  btn.addEventListener("click", () => {
    total += 1;
    visor.textContent = String(total);
    console.log("Cliques no laboratório:", total);
  });
}`,
  }),
  linux: "",
  networks: "",
  database: `-- Laboratório de Banco de Dados SQL\nSELECT p.nome, p.categoria, p.preco, p.estoque\nFROM produtos p\nWHERE p.ativo = 1\nORDER BY p.preco DESC\nLIMIT 6;`,
};

export const LabsPage: React.FC = () => {
  const { data, resetEpoch, saveDraft, saveWorkspace, logLabActivity } = usePlatform();
  const [activeLab, setActiveLab] = useState<TrackId>("js");
  const [sqlDataset, setSqlDataset] = useState<"ecommerce" | "empresa">("ecommerce");
  const [netMode, setNetMode] = useState<NetworkWorkbenchMode>("topology");
  const draftTimers = useRef<Record<string, number>>({});
  const pendingLabDraftsRef = useRef<Record<string, { code: string; stdin: string }>>({});
  const saveDraftRef = useRef(saveDraft);
  saveDraftRef.current = saveDraft;
  const mountedEpochRef = useRef(resetEpoch);
  const resetEpochRef = useRef(resetEpoch);
  resetEpochRef.current = resetEpoch;

  const [saveStatusByLab, setSaveStatusByLab] = useState<
    Record<string, "idle" | "saving" | "saved" | "error">
  >(() => {
    const init: Record<string, "idle" | "saving" | "saved" | "error"> = {};
    for (const t of TRACKS) {
      init[t.id] = data.drafts[`lab:${t.id}`] ? "saved" : "idle";
    }
    return init;
  });
  const [saveErrorByLab, setSaveErrorByLab] = useState<Record<string, string | null>>({});

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

  useEffect(() => {
    return () => {
      for (const id of Object.keys(draftTimers.current)) {
        window.clearTimeout(draftTimers.current[id]);
      }
      draftTimers.current = {};
      if (resetEpochRef.current !== mountedEpochRef.current) {
        pendingLabDraftsRef.current = {};
        return;
      }
      for (const [id, pending] of Object.entries(pendingLabDraftsRef.current)) {
        saveDraftRef.current(`lab:${id}`, pending.code, pending.stdin).catch(() => {});
      }
      pendingLabDraftsRef.current = {};
    };
  }, []);

  const scheduleLabSave = (id: TrackId, codeVal: string, stdinVal: string) => {
    setSaveStatusByLab(prev => ({ ...prev, [id]: "saving" }));
    setSaveErrorByLab(prev => ({ ...prev, [id]: null }));
    pendingLabDraftsRef.current[id] = { code: codeVal, stdin: stdinVal };
    if (draftTimers.current[id]) window.clearTimeout(draftTimers.current[id]);
    draftTimers.current[id] = window.setTimeout(() => {
      const pending = pendingLabDraftsRef.current[id];
      delete pendingLabDraftsRef.current[id];
      delete draftTimers.current[id];
      if (!pending) return;
      saveDraftRef
        .current(`lab:${id}`, pending.code, pending.stdin)
        .then(() => {
          setSaveStatusByLab(prev => ({ ...prev, [id]: "saved" }));
        })
        .catch(err => {
          setSaveStatusByLab(prev => ({ ...prev, [id]: "error" }));
          setSaveErrorByLab(prev => ({
            ...prev,
            [id]: err instanceof Error ? err.message : "Erro ao salvar rascunho localmente.",
          }));
        });
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
      <section className="ce-hero-banner ce-hero-with-art">
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
        <div className="ce-hero-art-slot" aria-hidden="true">
          <HeroIllustration variant="labs" />
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

      {activeLab === "web" && (
        <WebWorkbench
          mode="lab"
          projectKey="lab:web"
          value={labCodes.web ?? LAB_STARTERS.web}
          starterValue={LAB_STARTERS.web}
          saveStatus={saveStatusByLab.web ?? "idle"}
          saveError={saveErrorByLab.web ?? null}
          onChangeValue={next => {
            setLabCodes(prev => ({ ...prev, web: next }));
            scheduleLabSave("web", next, "");
          }}
          onEvaluate={(ctx, durationMs) => {
            logLabActivity(
              "web",
              "Laboratório Desenvolvimento Web",
              ctx.success
                ? `Prévia executada (${ctx.web?.elementCount ?? 0} elementos em ${durationMs}ms)`
                : ctx.error || "Erro no script",
              ctx.success ? "success" : "error"
            ).catch(() => {});
          }}
          accentColor={track.accentColor}
          darkTextOnAccent={track.darkTextOnAccent}
        />
      )}
    </div>
  );
};
