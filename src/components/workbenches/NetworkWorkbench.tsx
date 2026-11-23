import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Cpu,
  Network,
  Play,
  Router,
  Server,
  Shield,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { calculateSubnet, calculateVlsm } from "../../engines/networks/subnetMath";
import {
  createDefaultTopologyState,
  executeNetworkCommand,
  type TopologyState,
} from "../../engines/networks/topologySim";
import type { EvaluationContext, NetworkWorkbenchMode } from "../../types/curriculum";

interface NetworkWorkbenchProps {
  mode: NetworkWorkbenchMode;
  preset?: Record<string, unknown>;
  quickCommands?: { label: string; command: string }[];
  allowModeSwitch?: boolean;
  onChangeMode?: (next: NetworkWorkbenchMode) => void;
  onEvaluate?: (ctx: EvaluationContext, durationMs: number) => void;
}

const OSI_QUESTIONS_LAYERS = [
  { id: "q1", item: "Switch Ethernet (MAC)", options: ["Camada 2 - Enlace", "Camada 3 - Rede", "Camada 4 - Transporte", "Camada 7 - Aplicação"], answer: "Camada 2 - Enlace" },
  { id: "q2", item: "Roteador e IPv4", options: ["Camada 2 - Enlace", "Camada 3 - Rede", "Camada 4 - Transporte", "Camada 7 - Aplicação"], answer: "Camada 3 - Rede" },
  { id: "q3", item: "Segmentos TCP e UDP", options: ["Camada 2 - Enlace", "Camada 3 - Rede", "Camada 4 - Transporte", "Camada 7 - Aplicação"], answer: "Camada 4 - Transporte" },
  { id: "q4", item: "Protocolo HTTP / HTTPS", options: ["Camada 2 - Enlace", "Camada 3 - Rede", "Camada 4 - Transporte", "Camada 7 - Aplicação"], answer: "Camada 7 - Aplicação" },
  { id: "q5", item: "Protocolo ICMP (ping)", options: ["Camada 2 - Enlace", "Camada 3 - Rede", "Camada 4 - Transporte", "Camada 7 - Aplicação"], answer: "Camada 3 - Rede" },
];

const OSI_QUESTIONS_PORTS = [
  { id: "p1", item: "SSH (Acesso remoto seguro)", options: ["22 / TCP", "53 / UDP", "80 / TCP", "443 / TCP", "5432 / TCP"], answer: "22 / TCP" },
  { id: "p2", item: "DNS (Resolução de nomes)", options: ["22 / TCP", "53 / UDP", "80 / TCP", "443 / TCP", "5432 / TCP"], answer: "53 / UDP" },
  { id: "p3", item: "HTTPS (Web criptografada)", options: ["22 / TCP", "53 / UDP", "80 / TCP", "443 / TCP", "5432 / TCP"], answer: "443 / TCP" },
  { id: "p4", item: "HTTP (Web sem TLS)", options: ["22 / TCP", "53 / UDP", "80 / TCP", "443 / TCP", "5432 / TCP"], answer: "80 / TCP" },
  { id: "p5", item: "PostgreSQL (Banco relacional)", options: ["22 / TCP", "53 / UDP", "80 / TCP", "443 / TCP", "5432 / TCP"], answer: "5432 / TCP" },
];

export const NetworkWorkbench: React.FC<NetworkWorkbenchProps> = ({
  mode,
  preset,
  quickCommands = [],
  allowModeSwitch = false,
  onChangeMode,
  onEvaluate,
}) => {
  // ---------------- OSI / Ports state ----------------
  const osiFocus = preset?.focus === "ports" ? "ports" : "osi-layers";
  const questions = osiFocus === "ports" ? OSI_QUESTIONS_PORTS : OSI_QUESTIONS_LAYERS;
  const [osiAnswers, setOsiAnswers] = useState<Record<string, string>>({});
  const [osiFeedback, setOsiFeedback] = useState<{ score: number; completed: boolean } | null>(null);

  // ---------------- Subnet state ----------------
  const presetCidr = typeof preset?.targetCidr === "string" ? preset.targetCidr : "192.168.10.25/24";
  const [cidrInput, setCidrInput] = useState(presetCidr);
  const [ansNetwork, setAnsNetwork] = useState("");
  const [ansMask, setAnsMask] = useState("");
  const [ansBroadcast, setAnsBroadcast] = useState("");
  const [ansUsable, setAnsUsable] = useState("");
  const [subnetCheckMsg, setSubnetCheckMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [vlsmBase, setVlsmBase] = useState("192.168.0.0/24");
  const [showVlsm, setShowVlsm] = useState(false);

  // ---------------- Topology state ----------------
  const topoPreset = (preset?.topologyPreset as "healthy" | "broken-route" | "blocked-web") || "healthy";
  const [topology, setTopology] = useState<TopologyState>(() => createDefaultTopologyState(topoPreset));
  const [topoTab, setTopoTab] = useState<"console" | "routes" | "acl">("console");
  const [netCmd, setNetCmd] = useState("");
  const [netLogs, setNetLogs] = useState<string[]>([
    "Simulador de Rede Code Entry pronto. Digite 'help' ou use os atalhos.",
  ]);
  const [activeHops, setActiveHops] = useState<string[]>([]);
  const [blockedNode, setBlockedNode] = useState<string | undefined>(undefined);
  const [cmdHistoryList, setCmdHistoryList] = useState<string[]>([]);

  useEffect(() => {
    setOsiAnswers({});
    setOsiFeedback(null);
    setCidrInput(typeof preset?.targetCidr === "string" ? preset.targetCidr : "192.168.10.25/24");
    setAnsNetwork("");
    setAnsMask("");
    setAnsBroadcast("");
    setAnsUsable("");
    setSubnetCheckMsg(null);
    setTopology(
      createDefaultTopologyState(
        (preset?.topologyPreset as "healthy" | "broken-route" | "blocked-web") || "healthy"
      )
    );
    setActiveHops([]);
    setBlockedNode(undefined);
    setCmdHistoryList([]);
    setNetLogs(["Topologia inicializada. Execute um comando de diagnóstico (ex: ip route, ping 10.0.20.10)."]);
  }, [preset, mode]);

  const parsedSubnet = useMemo(() => {
    try {
      return { ok: true as const, info: calculateSubnet(cidrInput) };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "CIDR inválido" };
    }
  }, [cidrInput]);

  const vlsmPlan = useMemo(() => {
    try {
      return {
        ok: true as const,
        rows: calculateVlsm(vlsmBase, [
          { name: "LAN Corporativa", hosts: 50 },
          { name: "DMZ Servidores", hosts: 20 },
          { name: "Enlace WAN", hosts: 2 },
        ]),
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Erro VLSM" };
    }
  }, [vlsmBase]);

  const handleValidateOsi = () => {
    const correctCount = questions.filter(q => osiAnswers[q.id] === q.answer).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const completed = score >= 80;
    setOsiFeedback({ score, completed });

    onEvaluate?.(
      {
        trackId: "networks",
        code: JSON.stringify(osiAnswers),
        stdin: "",
        success: completed,
        output: [`Pontuação OSI: ${score}%`],
        outputText: `Pontuação OSI: ${score}%`,
        variables: [],
        scope: {},
        varTypes: {},
        testResults: [],
        network: {
          mode: "osi",
          osiScore: score,
          osiCompleted: completed,
        },
      },
      2
    );
  };

  const handleValidateSubnet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedSubnet.ok) {
      setSubnetCheckMsg({ ok: false, text: parsedSubnet.error });
      return;
    }
    const info = parsedSubnet.info;
    const okNet = ansNetwork.trim() === info.networkAddress;
    const okMask = ansMask.trim() === info.subnetMask;
    const okBcast = ansBroadcast.trim() === info.broadcastAddress;
    const okHosts = Number(ansUsable.trim()) === info.usableHosts;
    const isValidUserAttempt = okNet && okMask && okBcast && okHosts;

    if (isValidUserAttempt) {
      setSubnetCheckMsg({
        ok: true,
        text: `Cálculo exato! Rede ${info.networkAddress}/${info.prefix} possui ${info.usableHosts} hosts úteis (${info.firstHost} – ${info.lastHost}).`,
      });
    } else {
      const errs = [
        !okNet ? "Endereço de Rede" : null,
        !okMask ? "Máscara" : null,
        !okBcast ? "Broadcast" : null,
        !okHosts ? "Hosts Úteis" : null,
      ].filter(Boolean);
      setSubnetCheckMsg({
        ok: false,
        text: `Verifique os campos: ${errs.join(", ")}. Confira os bits de rede vs host na barra binária.`,
      });
    }

    onEvaluate?.(
      {
        trackId: "networks",
        code: cidrInput,
        stdin: "",
        success: isValidUserAttempt,
        output: [],
        outputText: "",
        variables: [],
        scope: {},
        varTypes: {},
        testResults: [],
        network: {
          mode: "subnet",
          subnetValidation: {
            ipCidr: cidrInput.trim(),
            networkAddress: info.networkAddress,
            broadcastAddress: info.broadcastAddress,
            firstHost: info.firstHost,
            lastHost: info.lastHost,
            usableHosts: info.usableHosts,
            subnetMask: info.subnetMask,
            isValidUserAttempt,
            checkedCount: 1,
          },
        },
      },
      2
    );
  };

  const runTopoCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    const res = executeNetworkCommand(topology, cmd);
    const nextHistory = [...cmdHistoryList, cmd];
    setCmdHistoryList(nextHistory);
    setNetLogs(prev => [...prev, `> ${cmd}`, ...res.outputLines]);
    setActiveHops(res.hopPath);
    setBlockedNode(res.blockedBy);
    setNetCmd("");

    onEvaluate?.(
      {
        trackId: "networks",
        code: cmd,
        stdin: "",
        success: res.success,
        output: res.outputLines,
        outputText: res.outputLines.join("\n"),
        variables: [],
        scope: {},
        varTypes: {},
        testResults: [],
        network: {
          mode: "topology",
          topologyCommands: nextHistory,
          lastPingSuccess: res.delivered,
          lastPingTarget: res.targetIp,
          lastAclBlocked: Boolean(res.aclBlocked),
          activeRoutesCount: topology.routes.filter(r => r.enabled).length,
          aclRulesCount: topology.aclRules.length,
        },
      },
      4
    );
  };

  const renderNodeIcon = (kind: string) => {
    switch (kind) {
      case "router":
        return <Router size={18} />;
      case "firewall":
        return <Shield size={18} />;
      case "server":
        return <Server size={18} />;
      case "switch":
        return <Network size={18} />;
      default:
        return <Cpu size={18} />;
    }
  };

  return (
    <div className="ce-workbench">
      <div className="ce-wb-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Network size={15} style={{ color: "#06B6D4" }} />
          <strong style={{ fontSize: 13 }}>
            {mode === "osi"
              ? "Inspetor OSI & Protocolos"
              : mode === "subnet"
              ? "Calculadora & Validador IPv4 / CIDR"
              : "Simulador Interativo de Topologia"}
          </strong>
        </div>

        {allowModeSwitch && onChangeMode && (
          <div className="ce-wb-actions">
            {(
              [
                { id: "osi", label: "OSI & Portas" },
                { id: "subnet", label: "Sub-redes CIDR/VLSM" },
                { id: "topology", label: "Topologia & ACL" },
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`ce-btn ce-btn-sm ${mode === tab.id ? "ce-btn-primary" : "ce-btn-ghost"}`}
                onClick={() => onChangeMode(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ======================== MODO 1: OSI & PORTAS ======================== */}
      {mode === "osi" && (
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Selecione a correspondência correta para cada elemento da pilha de redes:
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {questions.map(q => {
              const selected = osiAnswers[q.id] || "";
              const isCorrect = selected === q.answer;
              return (
                <div
                  key={q.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "var(--bg-surface-elevated)",
                    border: `1px solid ${
                      osiFeedback
                        ? isCorrect
                          ? "rgba(34,197,94,0.45)"
                          : "rgba(248,113,113,0.45)"
                        : "var(--border-subtle)"
                    }`,
                    flexWrap: "wrap",
                  }}
                >
                  <strong style={{ fontSize: 13 }}>{q.item}</strong>
                  <select
                    className="ce-select"
                    value={selected}
                    onChange={e => setOsiAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    aria-label={q.item}
                  >
                    <option value="">Selecione...</option>
                    {q.options.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              className="ce-btn ce-btn-track"
              style={{ background: "#06B6D4", color: "#083344" }}
              onClick={handleValidateOsi}
            >
              <CheckCircle2 size={15} />
              <span>Validar Mapeamento</span>
            </button>

            {osiFeedback && (
              <span className={`ce-badge ${osiFeedback.completed ? "ce-badge-diff-easy" : "ce-badge-diff-hard"}`}>
                Pontuação: {osiFeedback.score}% {osiFeedback.completed ? "(Aprovado!)" : "(Mínimo 80%)"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ======================== MODO 2: SUB-REDES CIDR/VLSM ======================== */}
      {mode === "subnet" && (
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Endereço IPv4 / CIDR:</span>
              <input
                className="ce-input"
                style={{ fontFamily: "var(--font-mono)", width: 190 }}
                value={cidrInput}
                onChange={e => setCidrInput(e.target.value)}
                readOnly={!allowModeSwitch && Boolean(preset?.targetCidr)}
              />
            </label>

            {allowModeSwitch && (
              <button
                type="button"
                className="ce-btn ce-btn-ghost ce-btn-sm"
                onClick={() => setShowVlsm(v => !v)}
              >
                {showVlsm ? "Voltar ao Validador" : "Planejador VLSM"}
              </button>
            )}
          </div>

          {parsedSubnet.ok && (
            <div
              style={{
                padding: 12,
                borderRadius: 12,
                background: "var(--bg-editor)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--text-secondary)" }}>
                <span>Representação Binária de 32 bits (/{parsedSubnet.info.prefix})</span>
                <span>
                  <strong style={{ color: "#22d3ee" }}>{parsedSubnet.info.prefix} bits Rede</strong> ·{" "}
                  <strong style={{ color: "#34d399" }}>{32 - parsedSubnet.info.prefix} bits Host</strong>
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 2, fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
                {parsedSubnet.info.binaryIp
                  .replace(/\./g, "")
                  .split("")
                  .map((bit, idx) => {
                    const isNetworkBit = idx < parsedSubnet.info.prefix;
                    return (
                      <React.Fragment key={idx}>
                        {idx > 0 && idx % 8 === 0 && (
                          <span style={{ color: "var(--text-muted)", margin: "0 4px" }}>.</span>
                        )}
                        <span
                          style={{
                            padding: "2px 4px",
                            borderRadius: 4,
                            background: isNetworkBit
                              ? "rgba(6, 182, 212, 0.16)"
                              : "rgba(34, 197, 94, 0.16)",
                            color: isNetworkBit ? "#22d3ee" : "#4ade80",
                            fontWeight: 600,
                          }}
                        >
                          {bit}
                        </span>
                      </React.Fragment>
                    );
                  })}
              </div>
            </div>
          )}

          {!showVlsm ? (
            <form onSubmit={handleValidateSubnet} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-secondary)" }}>
                  Endereço de Rede
                  <input
                    className="ce-input"
                    style={{ fontFamily: "var(--font-mono)" }}
                    placeholder="ex: 192.168.10.0"
                    value={ansNetwork}
                    onChange={e => setAnsNetwork(e.target.value)}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-secondary)" }}>
                  Máscara de Sub-rede
                  <input
                    className="ce-input"
                    style={{ fontFamily: "var(--font-mono)" }}
                    placeholder="ex: 255.255.255.0"
                    value={ansMask}
                    onChange={e => setAnsMask(e.target.value)}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-secondary)" }}>
                  Endereço de Broadcast
                  <input
                    className="ce-input"
                    style={{ fontFamily: "var(--font-mono)" }}
                    placeholder="ex: 192.168.10.255"
                    value={ansBroadcast}
                    onChange={e => setAnsBroadcast(e.target.value)}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-secondary)" }}>
                  Hosts Úteis
                  <input
                    className="ce-input"
                    style={{ fontFamily: "var(--font-mono)" }}
                    placeholder="ex: 254"
                    value={ansUsable}
                    onChange={e => setAnsUsable(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <button
                  type="submit"
                  className="ce-btn ce-btn-track"
                  style={{ background: "#06B6D4", color: "#083344" }}
                >
                  <CheckCircle2 size={15} />
                  <span>Validar Cálculo</span>
                </button>
                {allowModeSwitch && parsedSubnet.ok && (
                  <button
                    type="button"
                    className="ce-btn ce-btn-ghost ce-btn-sm"
                    onClick={() => {
                      setAnsNetwork(parsedSubnet.info.networkAddress);
                      setAnsMask(parsedSubnet.info.subnetMask);
                      setAnsBroadcast(parsedSubnet.info.broadcastAddress);
                      setAnsUsable(String(parsedSubnet.info.usableHosts));
                    }}
                  >
                    Calcular no Laboratório
                  </button>
                )}
              </div>

              {subnetCheckMsg && (
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: subnetCheckMsg.ok ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)",
                    border: `1px solid ${subnetCheckMsg.ok ? "rgba(34,197,94,0.35)" : "rgba(248,113,113,0.35)"}`,
                    color: subnetCheckMsg.ok ? "#4ade80" : "#fca5a5",
                  }}
                >
                  {subnetCheckMsg.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  <span>{subnetCheckMsg.text}</span>
                </div>
              )}
            </form>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                <span>Bloco Base VLSM:</span>
                <input
                  className="ce-input"
                  style={{ fontFamily: "var(--font-mono)", width: 170 }}
                  value={vlsmBase}
                  onChange={e => setVlsmBase(e.target.value)}
                />
              </label>
              {vlsmPlan.ok ? (
                <div className="ce-table-scroll">
                  <table className="ce-table">
                    <thead>
                      <tr>
                        <th>Segmento</th>
                        <th>CIDR</th>
                        <th>Máscara</th>
                        <th>Faixa Útil</th>
                        <th>Broadcast</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vlsmPlan.rows.map(r => (
                        <tr key={r.name}>
                          <td>{r.name}</td>
                          <td><code>{r.networkAddress}/{r.prefix}</code></td>
                          <td><code>{r.subnetMask}</code></td>
                          <td><code>{r.firstHost} – {r.lastHost}</code></td>
                          <td><code>{r.broadcastAddress}</code></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ color: "var(--accent-danger)", fontSize: 12.5 }}>{vlsmPlan.error}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================== MODO 3: TOPOLOGIA INTERATIVA ======================== */}
      {mode === "topology" && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", background: "#060b16", borderBottom: "1px solid var(--border-subtle)" }}>
            <svg viewBox="0 0 880 285" style={{ width: "100%", height: "auto", maxHeight: 255, display: "block" }}>
              {/* Zonas */}
              <rect x="16" y="16" width="315" height="254" rx="14" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.22)" />
              <text x="28" y="36" fill="#60a5fa" fontSize="11" fontWeight="700">LAN 192.168.10.0/24</text>

              <rect x="352" y="16" width="310" height="254" rx="14" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.22)" />
              <text x="364" y="36" fill="#22d3ee" fontSize="11" fontWeight="700">Núcleo &amp; Firewall</text>

              <rect x="684" y="16" width="180" height="254" rx="14" fill="rgba(20,184,166,0.06)" stroke="rgba(20,184,166,0.24)" />
              <text x="696" y="36" fill="#2dd4bf" fontSize="11" fontWeight="700">DMZ 10.0.20.0/24</text>

              {/* Links */}
              {[
                ["pc-adm", "sw-core"],
                ["pc-dev", "sw-core"],
                ["sw-core", "rtr-edge"],
                ["rtr-edge", "fw-dmz"],
                ["fw-dmz", "srv-web"],
                ["fw-dmz", "srv-db"],
              ].map(([aId, bId]) => {
                const a = topology.nodes.find(n => n.id === aId)!;
                const b = topology.nodes.find(n => n.id === bId)!;
                const activeLink = activeHops.includes(aId) && activeHops.includes(bId);
                return (
                  <line
                    key={`${aId}-${bId}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={activeLink ? (blockedNode ? "#f59e0b" : "#22d3ee") : "rgba(148,163,184,0.28)"}
                    strokeWidth={activeLink ? 3 : 1.8}
                    strokeDasharray={activeLink ? "6 4" : undefined}
                  />
                );
              })}

              {/* Nodes */}
              {topology.nodes.map(node => {
                const isSource = topology.sourceNodeId === node.id;
                const isHop = activeHops.includes(node.id);
                const isBlocked = blockedNode === node.id;
                const strokeColor = isBlocked
                  ? "#f87171"
                  : isSource
                  ? "#9b65ff"
                  : isHop
                  ? "#22d3ee"
                  : "rgba(148,163,184,0.3)";

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    style={{ cursor: node.kind === "pc" ? "pointer" : "default" }}
                    onClick={() => {
                      if (node.kind === "pc") {
                        setTopology(prev => ({ ...prev, sourceNodeId: node.id }));
                      }
                    }}
                  >
                    <rect
                      x="-48"
                      y="-28"
                      width="96"
                      height="56"
                      rx="11"
                      fill="#0f172a"
                      stroke={strokeColor}
                      strokeWidth={isHop || isSource ? 2.2 : 1.3}
                    />
                    <text y="-6" textAnchor="middle" fill="#f1f5fb" fontSize="11.5" fontWeight="700">
                      {node.label}
                    </text>
                    <text y="12" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono, monospace">
                      {node.ip}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Subtabs do Simulador */}
          <div className="ce-tabs-bar" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <button
                type="button"
                className={`ce-tab-btn ${topoTab === "console" ? "is-active" : ""}`}
                onClick={() => setTopoTab("console")}
              >
                <Activity size={13} />
                <span>Console de Diagnóstico</span>
              </button>
              <button
                type="button"
                className={`ce-tab-btn ${topoTab === "routes" ? "is-active" : ""}`}
                onClick={() => setTopoTab("routes")}
              >
                <Router size={13} />
                <span>Rotas ({topology.routes.filter(r => r.enabled).length}/{topology.routes.length})</span>
              </button>
              <button
                type="button"
                className={`ce-tab-btn ${topoTab === "acl" ? "is-active" : ""}`}
                onClick={() => setTopoTab("acl")}
              >
                <ShieldAlert size={13} />
                <span>Firewall ACL ({topology.aclRules.length})</span>
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--text-secondary)", flexShrink: 0 }}>
              <span>Origem:</span>
              <select
                className="ce-select"
                style={{ height: 28, fontSize: 11.5, minWidth: 165 }}
                value={topology.sourceNodeId}
                onChange={e => setTopology(prev => ({ ...prev, sourceNodeId: e.target.value }))}
                aria-label="Selecionar host de origem"
              >
                {topology.nodes
                  .filter(n => n.kind === "pc" || n.kind === "server")
                  .map(n => (
                    <option key={n.id} value={n.id}>
                      {n.label} ({n.ip})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {topoTab === "console" && (
            <div style={{ display: "flex", flexDirection: "column", background: "#060913" }}>
              {quickCommands.length > 0 && (
                <div style={{ display: "flex", gap: 6, padding: "8px 12px", flexWrap: "wrap", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
                  {quickCommands.map(qc => (
                    <button
                      key={qc.command}
                      type="button"
                      className="ce-btn ce-btn-ghost ce-btn-sm"
                      onClick={() => runTopoCommand(qc.command)}
                    >
                      <code>{qc.label}</code>
                    </button>
                  ))}
                </div>
              )}

              <div style={{ padding: 12, maxHeight: 190, overflowY: "auto", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.55 }}>
                {netLogs.map((l, idx) => (
                  <div
                    key={idx}
                    style={{
                      color: l.startsWith(">")
                        ? "#22d3ee"
                        : l.includes("[DENY]") || l.includes("Falha") || l.includes("Unreachable") || l.includes("bloqueado")
                        ? "#f87171"
                        : l.includes("[ALLOW]") || l.includes("0% perda")
                        ? "#4ade80"
                        : "#cbd5e1",
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>

              <div className="ce-terminal-prompt-row">
                <span style={{ color: "#22d3ee", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>net&gt;</span>
                <input
                  className="ce-terminal-input"
                  value={netCmd}
                  onChange={e => setNetCmd(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      runTopoCommand(netCmd);
                    }
                  }}
                  placeholder="Ex: ip route, ping 10.0.20.10, test-acl 10.0.20.10 TCP 443..."
                  aria-label="Comando de diagnóstico de rede"
                />
                <button
                  type="button"
                  className="ce-btn ce-btn-sm ce-btn-track"
                  style={{ background: "#06B6D4", color: "#083344" }}
                  onClick={() => runTopoCommand(netCmd)}
                >
                  <Play size={12} fill="currentColor" />
                </button>
              </div>
            </div>
          )}

          {topoTab === "routes" && (
            <div className="ce-table-scroll" style={{ padding: 14 }}>
              <table className="ce-table">
                <thead>
                  <tr>
                    <th>Destino</th>
                    <th>Next-Hop</th>
                    <th>Interface</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topology.routes.map(route => (
                    <tr key={route.id}>
                      <td><code>{route.destination}</code></td>
                      <td><code>{route.nextHop}</code></td>
                      <td><code>{route.iface}</code></td>
                      <td>
                        <button
                          type="button"
                          className={`ce-btn ce-btn-sm ${route.enabled ? "ce-btn-primary" : "ce-btn-ghost"}`}
                          style={{
                            height: 26,
                            background: route.enabled ? "rgba(34,197,94,0.2)" : "rgba(248,113,113,0.16)",
                            color: route.enabled ? "#4ade80" : "#fca5a5",
                            borderColor: route.enabled ? "rgba(34,197,94,0.4)" : "rgba(248,113,113,0.4)",
                          }}
                          onClick={() =>
                            setTopology(prev => ({
                              ...prev,
                              routes: prev.routes.map(r =>
                                r.id === route.id ? { ...r, enabled: !r.enabled } : r
                              ),
                            }))
                          }
                        >
                          {route.enabled ? "Ativa (Desativar)" : "Desativada (Ativar)"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {topoTab === "acl" && (
            <div className="ce-table-scroll" style={{ padding: 14 }}>
              <table className="ce-table">
                <thead>
                  <tr>
                    <th>Origem</th>
                    <th>Destino</th>
                    <th>Proto/Porta</th>
                    <th>Descrição</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {topology.aclRules.map(rule => (
                    <tr key={rule.id}>
                      <td><code>{rule.srcCidr}</code></td>
                      <td><code>{rule.dstCidr}</code></td>
                      <td><code>{rule.protocol}:{rule.port}</code></td>
                      <td style={{ fontSize: 12 }}>{rule.description}</td>
                      <td>
                        <button
                          type="button"
                          className="ce-btn ce-btn-sm ce-btn-ghost"
                          style={{
                            height: 26,
                            background: rule.action === "ALLOW" ? "rgba(34,197,94,0.2)" : "rgba(248,113,113,0.16)",
                            color: rule.action === "ALLOW" ? "#4ade80" : "#fca5a5",
                            borderColor: rule.action === "ALLOW" ? "rgba(34,197,94,0.4)" : "rgba(248,113,113,0.4)",
                          }}
                          onClick={() =>
                            setTopology(prev => ({
                              ...prev,
                              aclRules: prev.aclRules.map(r =>
                                r.id === rule.id
                                  ? { ...r, action: r.action === "ALLOW" ? "DENY" : "ALLOW" }
                                  : r
                              ),
                            }))
                          }
                        >
                          {rule.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ padding: "8px 14px", fontSize: 11.5, color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 10, alignItems: "center" }}>
            {renderNodeIcon("router")}
            <span>Dica: clique em PC-Admin ou PC-Dev no diagrama para trocar o host de origem.</span>
          </div>
        </div>
      )}
    </div>
  );
};
