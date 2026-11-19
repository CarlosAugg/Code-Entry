import { ipInCidr, isValidIpv4 } from "./subnetMath";

export interface NetworkNodeSpec {
  id: string;
  label: string;
  kind: "pc" | "switch" | "router" | "firewall" | "server";
  ip: string;
  cidr: string;
  gateway: string;
  zone: "LAN" | "CORE" | "DMZ";
  hostname: string;
  services?: number[];
  x: number;
  y: number;
}

export interface RouteEntry {
  id: string;
  destination: string;
  nextHop: string;
  iface: string;
  enabled: boolean;
}

export interface AclRule {
  id: string;
  action: "ALLOW" | "DENY";
  srcCidr: string;
  dstCidr: string;
  protocol: "ANY" | "ICMP" | "TCP" | "UDP";
  port: number | "*";
  description: string;
}

export interface TopologyState {
  nodes: NetworkNodeSpec[];
  routes: RouteEntry[];
  aclRules: AclRule[];
  sourceNodeId: string;
}

export interface PacketTraceResult {
  success: boolean;
  outputLines: string[];
  hopPath: string[];
  delivered: boolean;
  blockedBy?: string;
  targetIp?: string;
  aclBlocked?: boolean;
}

export const DEFAULT_TOPOLOGY_NODES: NetworkNodeSpec[] = [
  {
    id: "pc-adm",
    label: "PC-Admin",
    kind: "pc",
    ip: "192.168.10.10",
    cidr: "192.168.10.10/24",
    gateway: "192.168.10.1",
    zone: "LAN",
    hostname: "pc-adm.empresa.local",
    x: 90,
    y: 78,
  },
  {
    id: "pc-dev",
    label: "PC-Dev",
    kind: "pc",
    ip: "192.168.10.20",
    cidr: "192.168.10.20/24",
    gateway: "192.168.10.1",
    zone: "LAN",
    hostname: "pc-dev.empresa.local",
    x: 90,
    y: 222,
  },
  {
    id: "sw-core",
    label: "Switch-L2",
    kind: "switch",
    ip: "192.168.10.2",
    cidr: "192.168.10.2/24",
    gateway: "192.168.10.1",
    zone: "LAN",
    hostname: "sw-core.empresa.local",
    x: 255,
    y: 150,
  },
  {
    id: "rtr-edge",
    label: "Roteador-Core",
    kind: "router",
    ip: "192.168.10.1",
    cidr: "192.168.10.1/24",
    gateway: "10.0.20.1",
    zone: "CORE",
    hostname: "rtr-core.empresa.local",
    x: 430,
    y: 150,
  },
  {
    id: "fw-dmz",
    label: "Firewall-DMZ",
    kind: "firewall",
    ip: "10.0.20.1",
    cidr: "10.0.20.1/24",
    gateway: "10.0.20.1",
    zone: "CORE",
    hostname: "fw-dmz.empresa.local",
    x: 600,
    y: 150,
  },
  {
    id: "srv-web",
    label: "Srv-Web",
    kind: "server",
    ip: "10.0.20.10",
    cidr: "10.0.20.10/24",
    gateway: "10.0.20.1",
    zone: "DMZ",
    hostname: "web.empresa.local",
    services: [80, 443, 22],
    x: 775,
    y: 78,
  },
  {
    id: "srv-db",
    label: "Srv-Banco",
    kind: "server",
    ip: "10.0.20.50",
    cidr: "10.0.20.50/24",
    gateway: "10.0.20.1",
    zone: "DMZ",
    hostname: "db.empresa.local",
    services: [5432],
    x: 775,
    y: 222,
  },
];

export function createDefaultTopologyState(preset?: "healthy" | "broken-route" | "blocked-web"): TopologyState {
  const routes: RouteEntry[] = [
    { id: "r1", destination: "192.168.10.0/24", nextHop: "direct", iface: "eth0", enabled: true },
    {
      id: "r2",
      destination: "10.0.20.0/24",
      nextHop: "10.0.20.1",
      iface: "eth1",
      enabled: preset !== "broken-route",
    },
    { id: "r3", destination: "0.0.0.0/0", nextHop: "203.0.113.2", iface: "wan0", enabled: true },
  ];

  const aclRules: AclRule[] = [
    {
      id: "acl-1",
      action: preset === "blocked-web" ? "DENY" : "ALLOW",
      srcCidr: "192.168.10.0/24",
      dstCidr: "10.0.20.10/32",
      protocol: "TCP",
      port: 443,
      description: "Acesso HTTPS da LAN ao Srv-Web",
    },
    {
      id: "acl-2",
      action: "ALLOW",
      srcCidr: "192.168.10.0/24",
      dstCidr: "10.0.20.0/24",
      protocol: "ICMP",
      port: "*",
      description: "Permitir diagnóstico ICMP (ping) para DMZ",
    },
    {
      id: "acl-3",
      action: "DENY",
      srcCidr: "192.168.10.20/32",
      dstCidr: "10.0.20.50/32",
      protocol: "TCP",
      port: 5432,
      description: "Bloquear acesso direto de PC-Dev ao banco PostgreSQL",
    },
    {
      id: "acl-4",
      action: "ALLOW",
      srcCidr: "192.168.10.10/32",
      dstCidr: "10.0.20.50/32",
      protocol: "TCP",
      port: 5432,
      description: "Permitir administração do Srv-Banco via PC-Admin",
    },
  ];

  return {
    nodes: DEFAULT_TOPOLOGY_NODES.map(n => ({ ...n })),
    routes,
    aclRules,
    sourceNodeId: "pc-adm",
  };
}

export function evaluateAcl(
  rules: AclRule[],
  srcIp: string,
  dstIp: string,
  protocol: "ICMP" | "TCP" | "UDP",
  port: number | "*"
): { allowed: boolean; matchedRule?: AclRule } {
  for (const rule of rules) {
    const srcMatch = ipInCidr(srcIp, rule.srcCidr);
    const dstMatch = ipInCidr(dstIp, rule.dstCidr);
    const protoMatch = rule.protocol === "ANY" || rule.protocol === protocol;
    const portMatch = rule.port === "*" || port === "*" || rule.port === port;
    if (srcMatch && dstMatch && protoMatch && portMatch) {
      return { allowed: rule.action === "ALLOW", matchedRule: rule };
    }
  }
  return { allowed: false };
}

function resolveHost(state: TopologyState, target: string): NetworkNodeSpec | undefined {
  const clean = target.trim().toLowerCase();
  return state.nodes.find(
    n => n.ip === clean || n.hostname.toLowerCase() === clean || n.id.toLowerCase() === clean || n.label.toLowerCase() === clean
  );
}

export function executeNetworkCommand(state: TopologyState, rawCommand: string): PacketTraceResult {
  const trimmed = String(rawCommand || "").trim();
  const srcNode = state.nodes.find(n => n.id === state.sourceNodeId) || state.nodes[0];

  if (!trimmed) {
    return { success: true, outputLines: [], hopPath: [], delivered: false };
  }

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();

  if (cmd === "help") {
    return {
      success: true,
      delivered: false,
      hopPath: [],
      outputLines: [
        "Comandos do Console de Rede Code Entry:",
        "  ip a                       Mostra interfaces do host selecionado",
        "  ip route                   Mostra tabela de roteamento do Roteador-Core",
        "  arp                        Exibe tabela ARP local",
        "  nslookup <host>            Resolve nome DNS interno",
        "  ping <ip|host>             Testa conectividade ICMP passo a passo",
        "  traceroute <ip|host>       Rastreia os saltos de rede até o destino",
        "  test-acl <ip> <proto> <porta>  Testa fluxo TCP/UDP/ICMP no Firewall-DMZ",
      ],
    };
  }

  if (cmd === "ip" && (parts[1] === "a" || parts[1] === "addr")) {
    return {
      success: true,
      delivered: false,
      hopPath: [srcNode.id],
      outputLines: [
        `Host selecionado: ${srcNode.label} (${srcNode.hostname})`,
        `  1: lo: <LOOPBACK,UP> 127.0.0.1/8`,
        `  2: eth0: <UP,LOWER_UP> inet ${srcNode.cidr} gateway ${srcNode.gateway} [${srcNode.zone}]`,
      ],
    };
  }

  if (cmd === "ip" && (parts[1] === "route" || parts[1] === "r")) {
    return {
      success: true,
      delivered: false,
      hopPath: ["rtr-edge"],
      outputLines: [
        "Tabela de roteamento (Roteador-Core):",
        ...state.routes.map(
          r =>
            `  ${r.destination.padEnd(18, " ")} via ${r.nextHop.padEnd(14, " ")} dev ${r.iface} [${r.enabled ? "ATIVA" : "DESATIVADA"}]`
        ),
      ],
    };
  }

  if (cmd === "arp") {
    return {
      success: true,
      delivered: false,
      hopPath: [srcNode.id, "sw-core"],
      outputLines: [
        "Endereço IP       HWaddress           Iface",
        "192.168.10.1      00:1a:2b:3c:4d:01   eth0",
        "192.168.10.20     00:1a:2b:3c:4d:20   eth0",
      ],
    };
  }

  if (cmd === "nslookup") {
    const query = parts[1] || "";
    const found = resolveHost(state, query);
    if (!found) {
      return {
        success: false,
        delivered: false,
        hopPath: [],
        outputLines: [`Server: 10.0.20.1`, `** server can't find ${query}: NXDOMAIN`],
      };
    }
    return {
      success: true,
      delivered: true,
      hopPath: [srcNode.id],
      targetIp: found.ip,
      outputLines: [`Server: 10.0.20.1`, `Name:   ${found.hostname}`, `Address: ${found.ip}`],
    };
  }

  if (cmd === "ping" || cmd === "traceroute") {
    const rawTarget = parts[1] || "";
    const targetNode = resolveHost(state, rawTarget);
    const targetIp = targetNode ? targetNode.ip : rawTarget;
    if (!isValidIpv4(targetIp)) {
      return {
        success: false,
        delivered: false,
        hopPath: [],
        outputLines: [`${cmd}: destino '${rawTarget}' desconhecido ou IPv4 inválido.`],
      };
    }

    if (targetNode && targetNode.id === srcNode.id) {
      return {
        success: true,
        delivered: true,
        hopPath: [srcNode.id],
        targetIp,
        outputLines: [`64 bytes from ${targetIp}: icmp_seq=1 ttl=64 time=0.05 ms`],
      };
    }

    // Mesma sub-rede LAN (sem passar pelo roteador)
    if (srcNode.zone === "LAN" && targetNode?.zone === "LAN") {
      const hops = [srcNode.id, "sw-core", targetNode.id];
      return {
        success: true,
        delivered: true,
        hopPath: hops,
        targetIp,
        outputLines:
          cmd === "ping"
            ? [
                `PING ${targetIp} a partir de ${srcNode.ip}:`,
                `64 bytes from ${targetIp}: icmp_seq=1 ttl=64 time=0.42 ms`,
                `64 bytes from ${targetIp}: icmp_seq=2 ttl=64 time=0.39 ms`,
                `--- 2 pacotes enviados, 2 recebidos, 0% perda ---`,
              ]
            : [
                `traceroute to ${targetIp}, 30 hops max:`,
                ` 1  ${targetNode.hostname} (${targetIp})  0.42 ms`,
              ],
      };
    }

    // Tráfego inter-redes (LAN -> DMZ) passa pelo Switch -> Roteador -> Firewall
    const routeToDmz = state.routes.find(
      r => r.enabled && (r.destination === "10.0.20.0/24" || ipInCidr(targetIp, r.destination)) && r.destination !== "0.0.0.0/0"
    );

    if (!routeToDmz) {
      return {
        success: false,
        delivered: false,
        blockedBy: "rtr-edge",
        hopPath: [srcNode.id, "sw-core", "rtr-edge"],
        targetIp,
        outputLines: [
          `Destino ${targetIp} via Roteador-Core (${srcNode.gateway}):`,
          `From 192.168.10.1 icmp_seq=1 Destination Net Unreachable`,
          `Falha: nenhuma rota ativa encontrada para 10.0.20.0/24 no Roteador-Core.`,
        ],
      };
    }

    const aclCheck = evaluateAcl(state.aclRules, srcNode.ip, targetIp, "ICMP", "*");
    if (!aclCheck.allowed) {
      return {
        success: false,
        delivered: false,
        aclBlocked: true,
        blockedBy: "fw-dmz",
        hopPath: [srcNode.id, "sw-core", "rtr-edge", "fw-dmz"],
        targetIp,
        outputLines: [
          `Pacote ICMP ${srcNode.ip} -> ${targetIp} bloqueado no Firewall-DMZ.`,
          aclCheck.matchedRule
            ? `Regra aplicada: [${aclCheck.matchedRule.action}] ${aclCheck.matchedRule.description}`
            : "Regra aplicada: Política padrão DENY (nenhuma regra ALLOW correspondente).",
        ],
      };
    }

    if (!targetNode) {
      return {
        success: false,
        delivered: false,
        blockedBy: "fw-dmz",
        hopPath: [srcNode.id, "sw-core", "rtr-edge", "fw-dmz"],
        targetIp,
        outputLines: [`Request timeout for icmp_seq 1: host ${targetIp} não respondeu.`],
      };
    }

    const hops = [srcNode.id, "sw-core", "rtr-edge", "fw-dmz", targetNode.id];
    return {
      success: true,
      delivered: true,
      hopPath: hops,
      targetIp,
      outputLines:
        cmd === "ping"
          ? [
              `PING ${targetNode.hostname} (${targetIp}) a partir de ${srcNode.ip}:`,
              `64 bytes from ${targetIp}: icmp_seq=1 ttl=61 time=1.84 ms`,
              `64 bytes from ${targetIp}: icmp_seq=2 ttl=61 time=1.76 ms`,
              `--- 2 pacotes enviados, 2 recebidos, 0% perda ---`,
            ]
          : [
              `traceroute to ${targetNode.hostname} (${targetIp}), 30 hops max:`,
              ` 1  sw-core (192.168.10.2)         0.35 ms`,
              ` 2  rtr-core (192.168.10.1)        0.82 ms`,
              ` 3  fw-dmz (10.0.20.1)             1.24 ms`,
              ` 4  ${targetNode.hostname} (${targetIp})  1.84 ms`,
            ],
    };
  }

  if (cmd === "test-acl") {
    const targetRaw = parts[1] || "10.0.20.10";
    const proto = (parts[2] || "TCP").toUpperCase() as "ICMP" | "TCP" | "UDP";
    const port = parts[3] === "*" ? "*" : Number(parts[3] || 443);
    const targetNode = resolveHost(state, targetRaw);
    const dstIp = targetNode ? targetNode.ip : targetRaw;
    if (!isValidIpv4(dstIp)) {
      return { success: false, delivered: false, hopPath: [], outputLines: [`IP destino inválido: ${targetRaw}`] };
    }

    const routeActive = state.routes.some(r => r.enabled && r.destination === "10.0.20.0/24");
    if (!routeActive) {
      return {
        success: false,
        delivered: false,
        blockedBy: "rtr-edge",
        hopPath: [srcNode.id, "sw-core", "rtr-edge"],
        targetIp: dstIp,
        outputLines: [`Roteador-Core sem rota para ${dstIp}. Habilite a rota 10.0.20.0/24 antes de testar a ACL.`],
      };
    }

    const acl = evaluateAcl(state.aclRules, srcNode.ip, dstIp, proto, port);
    if (!acl.allowed) {
      return {
        success: false,
        delivered: false,
        aclBlocked: true,
        blockedBy: "fw-dmz",
        hopPath: [srcNode.id, "sw-core", "rtr-edge", "fw-dmz"],
        targetIp: dstIp,
        outputLines: [
          `[DENY] Tráfego ${proto}:${port} de ${srcNode.ip} para ${dstIp} bloqueado pelo Firewall-DMZ.`,
          acl.matchedRule ? `Motivo: ${acl.matchedRule.description}` : "Motivo: Política padrão DENY.",
        ],
      };
    }

    return {
      success: true,
      delivered: true,
      hopPath: [srcNode.id, "sw-core", "rtr-edge", "fw-dmz", targetNode?.id || "srv-web"],
      targetIp: dstIp,
      outputLines: [
        `[ALLOW] Tráfego ${proto}:${port} de ${srcNode.ip} para ${dstIp} permitido pelo Firewall-DMZ.`,
        acl.matchedRule ? `Regra: ${acl.matchedRule.description}` : "",
      ].filter(Boolean),
    };
  }

  return {
    success: false,
    delivered: false,
    hopPath: [],
    outputLines: [`Comando desconhecido '${cmd}'. Digite 'help' para ver opções.`],
  };
}
