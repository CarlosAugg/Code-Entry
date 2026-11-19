import type { Lesson } from "../../types/curriculum";

export const NETWORK_LESSONS: Lesson[] = [
  {
    id: "net-01",
    trackId: "networks",
    moduleId: "net-m1",
    moduleTitle: "Módulo 1 — Arquitetura OSI e TCP/IP",
    order: 1,
    title: "Modelo OSI e Encapsulamento",
    subtitle: "As 7 camadas e suas PDUs",
    difficulty: "Muito fácil",
    estimatedMinutes: 10,
    xp: 45,
    workbench: "networks",
    networkMode: "osi",
    networkPreset: { focus: "osi-layers" },
    summary: "Compreenda a função de cada camada do modelo OSI e associe protocolos e equipamentos reais.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Por que dividir redes em camadas?",
        content:
          "O modelo OSI organiza a comunicação em 7 camadas independentes: Física (bits), Enlace (quadros/MAC/Switch), Rede (pacotes/IP/Roteador), Transporte (segmentos/TCP/UDP), Sessão, Apresentação e Aplicação (HTTP, DNS, SSH).",
      },
      {
        kind: "table",
        headers: ["Camada", "PDU", "Exemplos Reais"],
        rows: [
          ["7. Aplicação", "Dados", "HTTP, HTTPS, DNS, SSH"],
          ["4. Transporte", "Segmento / Datagrama", "TCP (confiável), UDP (rápido)"],
          ["3. Rede", "Pacote", "IPv4, IPv6, ICMP, Roteador"],
          ["2. Enlace", "Quadro (Frame)", "Ethernet, MAC, Switch L2"],
        ],
      },
    ],
    examples: [
      {
        title: "Caminho de uma requisição HTTPS",
        description: "Do navegador até o cabo de rede.",
        code: `Aplicação (HTTPS :443) -> Transporte (TCP) -> Rede (IPv4) -> Enlace (Ethernet MAC) -> Física (Sinal)`,
      },
    ],
    prompt:
      "No Inspetor OSI ao lado, associe corretamente os protocolos e dispositivos às suas respectivas camadas (mínimo 80% de acertos) e clique em 'Validar Mapeamento'.",
    starterCode: "osi-quiz",
    hints: [
      "Lembre-se: Roteadores e endereços IP operam na Camada 3 (Rede); Switches e endereços MAC operam na Camada 2 (Enlace).",
      "TCP e UDP cuidam de portas e confiabilidade na Camada 4 (Transporte). HTTP e DNS ficam na Camada 7 (Aplicação).",
      "Revise os 6 pares no painel ao lado: Switch->Camada 2, IPv4/Roteador->Camada 3, TCP/UDP->Camada 4, HTTP/DNS->Camada 7.",
    ],
    objectives: [
      {
        id: "net01-osi",
        label: "Concluir o mapeamento OSI com pontuação >= 80%",
        test: ctx => Boolean(ctx.network?.osiCompleted && (ctx.network?.osiScore ?? 0) >= 80),
      },
    ],
    referenceSolution: "osi-pass",
  },
  {
    id: "net-02",
    trackId: "networks",
    moduleId: "net-m1",
    moduleTitle: "Módulo 1 — Arquitetura OSI e TCP/IP",
    order: 2,
    title: "Portas TCP, UDP e Protocolos",
    subtitle: "Serviços conhecidos e portas padrão",
    difficulty: "Fácil",
    estimatedMinutes: 10,
    xp: 55,
    workbench: "networks",
    networkMode: "osi",
    networkPreset: { focus: "ports" },
    summary: "Identifique portas padrão de infraestrutura (HTTP, HTTPS, SSH, DNS, PostgreSQL) e diferenças entre TCP e UDP.",
    theoryBlocks: [
      {
        kind: "text",
        title: "TCP vs UDP na prática",
        content:
          "TCP realiza handshake em 3 vias (SYN, SYN-ACK, ACK) garantindo entrega ordenada — ideal para Web (80/443), SSH (22) e bancos (5432). UDP não mantém conexão e tem menor latência — ideal para DNS (53), streaming e VoIP.",
      },
    ],
    examples: [
      {
        title: "Socket completo",
        description: "IP identifica a máquina; porta identifica o serviço.",
        code: `10.0.20.10:443 (TCP/HTTPS)\n10.0.20.50:5432 (TCP/PostgreSQL)`,
      },
    ],
    prompt:
      "Complete o desafio de Portas & Protocolos no Inspetor ao lado associando cada serviço à sua porta e camada de transporte correta (>= 80%).",
    starterCode: "ports-quiz",
    hints: [
      "SSH usa porta 22 (TCP); HTTP usa 80 e HTTPS usa 443.",
      "DNS tradicional utiliza UDP na porta 53; PostgreSQL escuta na porta 5432 (TCP).",
      "Selecione as correspondências corretas no painel e clique em 'Validar Mapeamento'.",
    ],
    objectives: [
      {
        id: "net02-ports",
        label: "Validar associação de portas e protocolos (>= 80%)",
        test: ctx => Boolean(ctx.network?.osiCompleted && (ctx.network?.osiScore ?? 0) >= 80),
      },
    ],
    referenceSolution: "osi-pass",
  },
  {
    id: "net-03",
    trackId: "networks",
    moduleId: "net-m2",
    moduleTitle: "Módulo 2 — Endereçamento IPv4 e Sub-redes",
    order: 3,
    title: "Anatomia IPv4, Binário e Máscara CIDR",
    subtitle: "Separando porção de rede e host",
    difficulty: "Fácil",
    estimatedMinutes: 14,
    xp: 70,
    workbench: "networks",
    networkMode: "subnet",
    networkPreset: { targetCidr: "192.168.10.25/24" },
    summary: "Converta endereços IPv4 para binário de 32 bits e determine rede, broadcast e faixa útil em /24.",
    theoryBlocks: [
      {
        kind: "text",
        title: "O que significa /24?",
        content:
          "Um endereço IPv4 possui 32 bits divididos em 4 octetos. O prefixo /24 indica que os primeiros 24 bits identificam a rede (máscara 255.255.255.0) e os últimos 8 bits identificam os hosts (2^8 - 2 = 254 hosts utilizáveis).",
      },
    ],
    examples: [
      {
        title: "Bloco 192.168.1.0/24",
        description: "Primeiro endereço é a rede; último é o broadcast.",
        code: `Rede: 192.168.1.0 | Primeiro host: .1 | Último host: .254 | Broadcast: .255`,
      },
    ],
    prompt:
      "Na Calculadora/Validador de Sub-redes, analise o endereço 192.168.10.25/24, preencha manualmente o Endereço de Rede, Máscara, Broadcast e Hosts Úteis e clique em 'Validar Cálculo'.",
    starterCode: "192.168.10.25/24",
    hints: [
      "Em /24, os três primeiros octetos permanecem fixos e o último octeto vai de 0 a 255.",
      "Rede = 192.168.10.0, Máscara = 255.255.255.0, Broadcast = 192.168.10.255.",
      "Hosts utilizáveis = 2^8 - 2 = 254.",
    ],
    objectives: [
      {
        id: "net03-sub",
        label: "Validar cálculo completo de 192.168.10.25/24",
        test: ctx =>
          Boolean(
            ctx.network?.subnetValidation?.isValidUserAttempt &&
              ctx.network?.subnetValidation?.ipCidr === "192.168.10.25/24"
          ),
      },
    ],
    referenceSolution: "192.168.10.25/24",
  },
  {
    id: "net-04",
    trackId: "networks",
    moduleId: "net-m2",
    moduleTitle: "Módulo 2 — Endereçamento IPv4 e Sub-redes",
    order: 4,
    title: "Segmentação com Prefixos /26 e /27",
    subtitle: "Sub-redes menores sem desperdício",
    difficulty: "Intermediário",
    estimatedMinutes: 16,
    xp: 85,
    workbench: "networks",
    networkMode: "subnet",
    networkPreset: { targetCidr: "10.0.20.75/26" },
    summary: "Calcule blocos não alinhados a octeto completo (ex.: /26 com saltos de 64 endereços).",
    theoryBlocks: [
      {
        kind: "text",
        title: "Operação AND bit a bit",
        content:
          "Em /26 restam 6 bits para hosts (2^6 = 64 endereços por bloco, 62 utilizáveis). Os blocos no último octeto iniciam em 0, 64, 128 e 192. Como 75 está entre 64 e 127, a rede é .64 e o broadcast é .127!",
      },
    ],
    examples: [
      {
        title: "Máscara /26 em binário",
        description: "Último octeto 11000000 = 128 + 64 = 192.",
        code: `Máscara: 255.255.255.192 | Bloco: 64 | Hosts úteis: 62`,
      },
    ],
    prompt:
      "Resolva a sub-rede para o IP 10.0.20.75/26: informe Rede, Máscara, Broadcast e Hosts Úteis no validador e confirme.",
    starterCode: "10.0.20.75/26",
    hints: [
      "Em /26 o tamanho do bloco é 64 e a máscara termina em .192 (255.255.255.192).",
      "75 pertence ao segundo bloco de 64: de 10.0.20.64 até 10.0.20.127.",
      "Rede: 10.0.20.64 | Broadcast: 10.0.20.127 | Hosts úteis: 62.",
    ],
    objectives: [
      {
        id: "net04-sub",
        label: "Validar cálculo de 10.0.20.75/26",
        test: ctx =>
          Boolean(
            ctx.network?.subnetValidation?.isValidUserAttempt &&
              ctx.network?.subnetValidation?.ipCidr === "10.0.20.75/26"
          ),
      },
    ],
    referenceSolution: "10.0.20.75/26",
  },
  {
    id: "net-05",
    trackId: "networks",
    moduleId: "net-m2",
    moduleTitle: "Módulo 2 — Endereçamento IPv4 e Sub-redes",
    order: 5,
    title: "Planejamento VLSM para Enlaces",
    subtitle: "Sub-rede ponto a ponto /30",
    difficulty: "Intermediário",
    estimatedMinutes: 16,
    xp: 95,
    workbench: "networks",
    networkMode: "subnet",
    networkPreset: { targetCidr: "172.16.5.13/30" },
    summary: "Aplique VLSM calculando um link ponto a ponto /30 com exatamente 2 hosts utilizáveis.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Por que usar /30 entre roteadores?",
        content:
          "Um enlace direto entre dois roteadores precisa de apenas 2 IPs. Usar /24 desperdiçaria 252 IPs. Com /30 temos 2^2 = 4 endereços (1 rede + 2 hosts + 1 broadcast) e máscara 255.255.255.252.",
      },
    ],
    examples: [
      {
        title: "Blocos de 4 em /30",
        description: "Cada bloco avança de 4 em 4: .0, .4, .8, .12, .16...",
        code: `172.16.5.12/30 -> Rede .12 | Hosts .13 e .14 | Broadcast .15`,
      },
    ],
    prompt:
      "Valide no painel os parâmetros exatos da sub-rede ponto a ponto 172.16.5.13/30 (Rede, Máscara, Broadcast e Hosts Úteis).",
    starterCode: "172.16.5.13/30",
    hints: [
      "Com 2 bits de host, o bloco tem tamanho 4. O múltiplo de 4 menor ou igual a 13 é 12.",
      "Máscara /30 = 255.255.255.252. Rede = 172.16.5.12. Broadcast = 172.16.5.15.",
      "Hosts úteis = 2 (.13 e .14).",
    ],
    objectives: [
      {
        id: "net05-vlsm",
        label: "Validar cálculo exato de 172.16.5.13/30",
        test: ctx =>
          Boolean(
            ctx.network?.subnetValidation?.isValidUserAttempt &&
              ctx.network?.subnetValidation?.ipCidr === "172.16.5.13/30"
          ),
      },
    ],
    referenceSolution: "172.16.5.13/30",
  },
  {
    id: "net-06",
    trackId: "networks",
    moduleId: "net-m3",
    moduleTitle: "Módulo 3 — Roteamento, DNS e Firewall",
    order: 6,
    title: "Diagnóstico de Roteamento Estático",
    subtitle: "ip route, ping e traceroute",
    difficulty: "Intermediário",
    estimatedMinutes: 16,
    xp: 100,
    workbench: "networks",
    networkMode: "topology",
    networkPreset: { topologyPreset: "broken-route" },
    summary: "Identifique uma rota desativada no Roteador-Core e restaure a conectividade entre LAN e DMZ.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Quando o pacote não encontra rota",
        content:
          "Se um roteador não possui rota para a rede destino (ex.: 10.0.20.0/24), ele descarta o pacote e devolve ICMP 'Destination Net Unreachable'.",
      },
    ],
    examples: [
      {
        title: "Diagnosticando salto a salto",
        description: "Inspecione a tabela e teste a conectividade.",
        code: `ip route\nping 10.0.20.10\ntraceroute web.empresa.local`,
      },
    ],
    prompt:
      "Nesta topologia, a LAN (192.168.10.0/24) perdeu acesso à DMZ (10.0.20.0/24). Execute 'ip route' ou 'ping 10.0.20.10' para diagnosticar, ative a rota de 10.0.20.0/24 no painel de Rotas e confirme com 'ping 10.0.20.10'.",
    starterCode: "broken-route",
    quickCommands: [
      { label: "ip route", command: "ip route" },
      { label: "ping 10.0.20.10", command: "ping 10.0.20.10" },
      { label: "traceroute 10.0.20.10", command: "traceroute 10.0.20.10" },
    ],
    hints: [
      "Rode 'ip route' no console de rede para ver qual rota está marcada como DESATIVADA.",
      "Na aba 'Rotas' abaixo do diagrama, ative a rota para 10.0.20.0/24.",
      "Depois rode 'ping 10.0.20.10' e veja os 5 saltos da animação chegando ao Srv-Web!",
    ],
    objectives: [
      {
        id: "net06-diag",
        label: "Inspecionar rotas ou executar traceroute",
        test: ctx =>
          Boolean(
            ctx.network?.topologyCommands?.some(c => c.startsWith("ip route") || c.startsWith("traceroute") || c.startsWith("ping"))
          ),
      },
      {
        id: "net06-fix",
        label: "Restaurar conectividade com ping bem-sucedido até 10.0.20.10",
        test: ctx => Boolean(ctx.network?.lastPingSuccess && ctx.network?.lastPingTarget === "10.0.20.10"),
      },
    ],
    referenceSolution: "enable-route:10.0.20.0/24 && ping 10.0.20.10",
  },
  {
    id: "net-07",
    trackId: "networks",
    moduleId: "net-m3",
    moduleTitle: "Módulo 3 — Roteamento, DNS e Firewall",
    order: 7,
    title: "Resolução DNS e Serviços na DMZ",
    subtitle: "nslookup e comunicação por nome",
    difficulty: "Intermediário",
    estimatedMinutes: 14,
    xp: 100,
    workbench: "networks",
    networkMode: "topology",
    networkPreset: { topologyPreset: "healthy" },
    summary: "Consulte registros DNS internos e verifique conectividade até os servidores da DMZ.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Do nome legível ao endereço IP",
        content:
          "Servidores DNS traduzem nomes como web.empresa.local em endereços IPv4 (10.0.20.10). Com nslookup testamos essa resolução antes de depurar conexões.",
      },
    ],
    examples: [
      {
        title: "Consultando DNS e rastreando rota",
        description: "Resolve o nome e traça os saltos.",
        code: `nslookup web.empresa.local\ntraceroute web.empresa.local`,
      },
    ],
    prompt:
      "Execute 'nslookup web.empresa.local' para descobrir seu IP, depois execute 'traceroute web.empresa.local' e 'test-acl 10.0.20.10 TCP 443'.",
    starterCode: "healthy",
    quickCommands: [
      { label: "nslookup web.empresa.local", command: "nslookup web.empresa.local" },
      { label: "traceroute web.empresa.local", command: "traceroute web.empresa.local" },
      { label: "test-acl 10.0.20.10 TCP 443", command: "test-acl 10.0.20.10 TCP 443" },
    ],
    hints: [
      "Execute os três comandos no console de diagnóstico do simulador.",
      "Observe na topologia como o pacote atravessa PC-Admin -> Switch-L2 -> Roteador-Core -> Firewall-DMZ -> Srv-Web.",
      "Certifique-se de rodar nslookup, traceroute e test-acl 10.0.20.10 TCP 443.",
    ],
    objectives: [
      {
        id: "net07-dns",
        label: "Resolver nome com nslookup web.empresa.local",
        test: ctx => Boolean(ctx.network?.topologyCommands?.some(c => c.includes("nslookup"))),
      },
      {
        id: "net07-trace",
        label: "Executar traceroute e test-acl TCP 443 com sucesso",
        test: ctx =>
          Boolean(
            ctx.network?.topologyCommands?.some(c => c.includes("traceroute")) &&
              ctx.network?.topologyCommands?.some(c => c.includes("test-acl")) &&
              ctx.network?.lastPingSuccess
          ),
      },
    ],
    referenceSolution: "nslookup web.empresa.local && traceroute web.empresa.local && test-acl 10.0.20.10 TCP 443",
  },
  {
    id: "net-08",
    trackId: "networks",
    moduleId: "net-m3",
    moduleTitle: "Módulo 3 — Roteamento, DNS e Firewall",
    order: 8,
    title: "Políticas de Firewall e Regras ACL",
    subtitle: "Liberando HTTPS com menor privilégio",
    difficulty: "Difícil",
    estimatedMinutes: 18,
    xp: 125,
    workbench: "networks",
    networkMode: "topology",
    networkPreset: { topologyPreset: "blocked-web" },
    summary: "Investigue um bloqueio no Firewall-DMZ e ajuste a regra ACL correta para liberar HTTPS (TCP/443).",
    theoryBlocks: [
      {
        kind: "text",
        title: "Avaliação sequencial de ACLs",
        content:
          "Firewalls leem regras ACL de cima para baixo (First-Match Wins) e aplicam DENY implícito ao final. Ao corrigir um bloqueio, libere apenas a porta e o protocolo necessários.",
      },
    ],
    examples: [
      {
        title: "Testando fluxo específico",
        description: "Simula uma requisição HTTPS (TCP 443).",
        code: `test-acl 10.0.20.10 TCP 443`,
      },
    ],
    prompt:
      "O acesso HTTPS (TCP 443) ao Srv-Web (10.0.20.10) está sendo barrado pelo Firewall-DMZ. Rode 'test-acl 10.0.20.10 TCP 443', altere a regra correspondente para ALLOW no painel de Firewall e valide novamente com 'test-acl 10.0.20.10 TCP 443'.",
    starterCode: "blocked-web",
    quickCommands: [
      { label: "test-acl 10.0.20.10 TCP 443", command: "test-acl 10.0.20.10 TCP 443" },
      { label: "ping 10.0.20.10", command: "ping 10.0.20.10" },
    ],
    hints: [
      "Primeiro teste com 'test-acl 10.0.20.10 TCP 443' e veja que o pacote para no nó Firewall-DMZ.",
      "Na aba 'Firewall ACL', altere a primeira regra (TCP porta 443 para 10.0.20.10/32) de DENY para ALLOW.",
      "Execute 'test-acl 10.0.20.10 TCP 443' novamente para confirmar [ALLOW].",
    ],
    objectives: [
      {
        id: "net08-allow",
        label: "Permitir fluxo TCP:443 até 10.0.20.10 pelo Firewall-DMZ",
        test: ctx =>
          Boolean(
            ctx.network?.topologyCommands?.some(c => c.includes("test-acl") && c.includes("443")) &&
              ctx.network?.lastPingSuccess &&
              ctx.network?.lastAclBlocked === false
          ),
      },
    ],
    referenceSolution: "allow-acl:acl-1 && test-acl 10.0.20.10 TCP 443",
  },
];
