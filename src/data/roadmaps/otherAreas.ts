import type { RoadmapDefinition } from "../../types/roadmap";

export const SYSTEMS_NETWORKS_ROADMAP: RoadmapDefinition = {
  id: "systems-networks",
  title: "Linux, Sistemas e Redes de Computadores",
  shortTitle: "Sistemas & Redes",
  categoryId: "infra-systems",
  kind: "skill",
  scopeLabel: "Fundamentos → Operação",
  accentColor: "#F59E0B",
  accentSecondary: "#38BDF8",
  accentSoft: "rgba(245, 158, 11, 0.14)",
  accentBorder: "rgba(245, 158, 11, 0.42)",
  summary:
    "Domine linha de comando Linux, permissões, processos, endereçamento IPv4/CIDR, roteamento, DNS, proxy reverso e políticas de firewall.",
  audience:
    "Quem quer entender como servidores, redes corporativas e infraestrutura em nuvem funcionam por baixo dos panos.",
  featured: false,
  relatedTrackIds: ["linux", "networks"],
  relatedRoadmapIds: ["backend", "full-stack"],
  pathways: [
    {
      id: "sn-linux-cli",
      label: "Domínio do Terminal Linux",
      audience: "Produtividade e automação em servidores",
      description: "Navegação, arquivos, pipes com grep, permissões, systemd e análise de logs.",
      nodeIds: [
        "sn-shell-files",
        "sn-pipes-scripts",
        "sn-processes-systemd",
        "sn-monitoring-logs",
        "sn-cp-hardening",
      ],
    },
    {
      id: "sn-net-sec",
      label: "Redes, Endereçamento e Segurança",
      audience: "Conectividade e proteção de infraestrutura",
      description: "Modelo OSI, TCP/UDP, sub-redes CIDR/VLSM, DNS, proxy TLS e regras de firewall.",
      nodeIds: [
        "sn-osi-ports",
        "sn-ipv4-subnet",
        "sn-dns-routing",
        "sn-firewall-acl",
        "sn-reverse-proxy",
        "sn-ops-project",
      ],
    },
  ],
  stages: [
    {
      id: "sn-s1",
      order: 1,
      label: "Etapa 01",
      title: "Fundamentos de Linux & Redes",
      subtitle: "Terminal, arquivos, modelo OSI e portas TCP/UDP.",
    },
    {
      id: "sn-s2",
      order: 2,
      label: "Etapa 02",
      title: "Automação, Processos & Sub-redes",
      subtitle: "Pipelines, serviços, CIDR/VLSM e roteamento.",
    },
    {
      id: "sn-s3",
      order: 3,
      label: "Etapa 03",
      title: "Segurança, Proxy & Diagnóstico",
      subtitle: "Firewall/ACL, proxy TLS, logs e entrega operacional.",
    },
  ],
  nodes: [
    // ETAPA 01
    {
      id: "sn-shell-files",
      roadmapId: "systems-networks",
      stageId: "sn-s1",
      column: 0,
      title: "Shell Linux, Navegação e Arquivos",
      shortTitle: "Shell & Arquivos",
      kind: "foundation",
      priority: "required",
      summary:
        "Navegue pela árvore de diretórios (`ls`, `cd`, `pwd`), crie, copie, mova e inspecione arquivos no terminal.",
      whyItMatters:
        "Toda operação em servidores Linux começa pelo domínio seguro do sistema de arquivos.",
      keyConcepts: ["Diretórios", "Permissões", "Redirecionamento"],
      glossaryIds: ["linux-cli"],
      prerequisites: [],
      nextIds: ["sn-pipes-scripts", "sn-osi-ports"],
      studyLinks: [
        { kind: "lesson", id: "linux-01", trackId: "linux", label: "Linux 01: Reconhecimento" },
        { kind: "lesson", id: "linux-03", trackId: "linux", label: "Linux 03: Arquivos" },
      ],
    },
    {
      id: "sn-pipes-scripts",
      roadmapId: "systems-networks",
      stageId: "sn-s1",
      column: 1,
      title: "Pipelines, grep, Permissões (chmod) e Shell Scripts",
      shortTitle: "Pipes & Shell Scripts",
      kind: "concept",
      priority: "required",
      summary:
        "Combine comandos com `|`, filtre logs com `grep`, ajuste permissões com `chmod` e automatize rotinas em scripts.",
      whyItMatters:
        "Transforma tarefas manuais repetitivas em verificações rápidas e reproduzíveis.",
      keyConcepts: ["Pipes", "grep", "chmod", "Scripts .sh"],
      glossaryIds: ["linux-pipes", "linux-cli"],
      prerequisites: ["sn-shell-files"],
      nextIds: ["sn-processes-systemd"],
      studyLinks: [
        { kind: "lesson", id: "linux-05", trackId: "linux", label: "Linux 05: Pipelines e grep" },
        { kind: "lesson", id: "linux-06", trackId: "linux", label: "Linux 06: chmod e Scripts" },
      ],
    },
    {
      id: "sn-processes-systemd",
      roadmapId: "systems-networks",
      stageId: "sn-s1",
      column: 2,
      title: "Processos, Sinais, SSH e Serviços (systemd)",
      shortTitle: "Processos & Serviços",
      kind: "concept",
      priority: "required",
      summary:
        "Inspecione CPU/memória (`ps`, `top`), envie sinais (`kill`), acesse máquinas via SSH e gerencie daemons.",
      whyItMatters:
        "Mantém aplicações rodando em background com reinício automático e acesso remoto seguro.",
      keyConcepts: ["PID & Sinais", "SSH", "systemd"],
      glossaryIds: ["linux-cli"],
      prerequisites: ["sn-pipes-scripts"],
      nextIds: ["sn-cp-hardening", "sn-osi-ports"],
      studyLinks: [
        { kind: "lesson", id: "linux-07", trackId: "linux", label: "Linux 07: Processos e Sinais" },
      ],
    },
    {
      id: "sn-cp-hardening",
      roadmapId: "systems-networks",
      stageId: "sn-s1",
      column: 2,
      title: "Checkpoint: Servidor Linux Organizado",
      shortTitle: "Checkpoint Linux",
      kind: "checkpoint",
      priority: "recommended",
      summary:
        "Crie um script automatizado de verificação de usuários, permissões e backup compactado (`tar`).",
      whyItMatters:
        "Valida autonomia real na administração básica de um servidor Linux.",
      keyConcepts: ["Scripts", "Backup tar"],
      glossaryIds: ["linux-pipes"],
      prerequisites: ["sn-processes-systemd"],
      nextIds: ["sn-osi-ports"],
      projectIdeas: [
        "Script de auditoria de usuários, permissões e backup automático em tar.gz.",
      ],
      studyLinks: [
        { kind: "challenge", id: "ch-lx-2", trackId: "linux", label: "Desafio Linux: Script" },
      ],
    },

    // ETAPA 02
    {
      id: "sn-osi-ports",
      roadmapId: "systems-networks",
      stageId: "sn-s2",
      column: 0,
      title: "Modelo OSI, TCP, UDP e Portas",
      shortTitle: "OSI, TCP & UDP",
      kind: "foundation",
      priority: "required",
      summary:
        "Compreenda camadas de rede, encapsulamento, diferenças entre TCP e UDP e portas padrão (HTTP, HTTPS, SSH, DNS, SQL).",
      whyItMatters:
        "Ajuda a isolar rapidamente se uma falha é física, de transporte ou de aplicação.",
      keyConcepts: ["Modelo OSI", "TCP vs UDP", "Portas"],
      glossaryIds: ["tcp-udp-ports", "http-protocol"],
      prerequisites: ["sn-cp-hardening"],
      nextIds: ["sn-ipv4-subnet"],
      studyLinks: [
        { kind: "lesson", id: "net-01", trackId: "networks", label: "Redes 01: Modelo OSI" },
        { kind: "lesson", id: "net-02", trackId: "networks", label: "Redes 02: Portas TCP/UDP" },
      ],
    },
    {
      id: "sn-ipv4-subnet",
      roadmapId: "systems-networks",
      stageId: "sn-s2",
      column: 1,
      title: "Endereçamento IPv4, CIDR e Sub-redes VLSM",
      shortTitle: "Sub-redes CIDR & VLSM",
      kind: "concept",
      priority: "required",
      summary:
        "Calcule máscaras CIDR, endereço de rede, broadcast, faixa de hosts válidos e planejamento eficiente com VLSM.",
      whyItMatters:
        "Base para segmentar redes corporativas, VPCs na nuvem e enlaces ponto a ponto.",
      keyConcepts: ["CIDR", "Máscara", "VLSM"],
      glossaryIds: ["cidr-subnet"],
      prerequisites: ["sn-osi-ports"],
      nextIds: ["sn-dns-routing"],
      studyLinks: [
        { kind: "lesson", id: "net-03", trackId: "networks", label: "Redes 03: IPv4 e CIDR" },
        { kind: "lesson", id: "net-05", trackId: "networks", label: "Redes 05: VLSM" },
      ],
    },
    {
      id: "sn-dns-routing",
      roadmapId: "systems-networks",
      stageId: "sn-s2",
      column: 2,
      title: "DNS, Roteamento Estático e Diagnóstico",
      shortTitle: "DNS & Roteamento",
      kind: "concept",
      priority: "required",
      summary:
        "Analise tabelas de rotas, gateway padrão, registros DNS (`A`, `CNAME`, `MX`) e serviços expostos em DMZ.",
      whyItMatters:
        "Sem rotas corretas e DNS funcionando, serviços ativos continuam inacessíveis.",
      keyConcepts: ["Rotas estáticas", "DNS", "DMZ"],
      glossaryIds: ["dns-resolution"],
      prerequisites: ["sn-ipv4-subnet"],
      nextIds: ["sn-firewall-acl"],
      studyLinks: [
        { kind: "lesson", id: "net-06", trackId: "networks", label: "Redes 06: Roteamento" },
        { kind: "lesson", id: "net-07", trackId: "networks", label: "Redes 07: DNS e DMZ" },
      ],
    },

    // ETAPA 03
    {
      id: "sn-firewall-acl",
      roadmapId: "systems-networks",
      stageId: "sn-s3",
      column: 0,
      title: "Firewall, Regras ACL e Segurança de Borda",
      shortTitle: "Firewall & ACL",
      kind: "concept",
      priority: "required",
      summary:
        "Defina regras de entrada/saída por porta e origem, princípio do menor privilégio e isolamento de segmentos.",
      whyItMatters:
        "Reduz drasticamente a superfície de ataque de servidores expostos.",
      keyConcepts: ["ACLs", "Menor Privilégio", "DMZ"],
      glossaryIds: ["firewall-acl"],
      prerequisites: ["sn-dns-routing"],
      nextIds: ["sn-reverse-proxy"],
      studyLinks: [
        { kind: "lesson", id: "net-08", trackId: "networks", label: "Redes 08: Firewall e ACL" },
      ],
    },
    {
      id: "sn-reverse-proxy",
      roadmapId: "systems-networks",
      stageId: "sn-s3",
      column: 1,
      title: "Proxy Reverso, TLS/HTTPS & Portas Seguras",
      shortTitle: "Proxy Reverso & TLS",
      kind: "technology",
      priority: "recommended",
      summary:
        "Termine conexões HTTPS na borda com Nginx/Caddy, redirecione tráfego para portas internas e gerencie certificados.",
      whyItMatters:
        "Padroniza criptografia em trânsito e protege serviços internos de acesso direto.",
      keyConcepts: ["HTTPS/TLS", "Nginx", "Proxy Reverso"],
      glossaryIds: ["http-protocol", "firewall-acl"],
      prerequisites: ["sn-firewall-acl"],
      nextIds: ["sn-monitoring-logs"],
      studyLinks: [],
    },
    {
      id: "sn-monitoring-logs",
      roadmapId: "systems-networks",
      stageId: "sn-s3",
      column: 2,
      title: "Diagnóstico de Incidentes & Análise de Logs",
      shortTitle: "Logs & Diagnóstico",
      kind: "concept",
      priority: "recommended",
      summary:
        "Correlacione logs de sistema, rede e aplicação para identificar falhas de disco, porta bloqueada ou queda de serviço.",
      whyItMatters:
        "Acelera a recuperação quando algo falha em produção.",
      keyConcepts: ["Logs", "Troubleshooting", "Saúde do Sistema"],
      glossaryIds: ["linux-cli"],
      prerequisites: ["sn-reverse-proxy"],
      nextIds: ["sn-ops-project"],
      studyLinks: [
        { kind: "lesson", id: "linux-08", trackId: "linux", label: "Linux 08: Incidentes" },
      ],
    },
    {
      id: "sn-ops-project",
      roadmapId: "systems-networks",
      stageId: "sn-s3",
      column: 1,
      title: "Checkpoint: Topologia, ACL & Auditoria",
      shortTitle: "Checkpoint Infra",
      kind: "project",
      priority: "required",
      summary:
        "Integre cálculo de sub-rede, conectividade entre segmentos, firewall e auditoria de logs em um cenário completo.",
      whyItMatters:
        "Valida a capacidade de operar e depurar infraestrutura real de ponta a ponta.",
      keyConcepts: ["Conectividade", "ACL", "Auditoria"],
      glossaryIds: ["cidr-subnet", "firewall-acl"],
      prerequisites: ["sn-monitoring-logs"],
      nextIds: [],
      projectIdeas: [
        "Restaurar conectividade entre sub-redes com DNS, ACLs e auditoria de logs.",
      ],
      studyLinks: [
        { kind: "challenge", id: "ch-net-3", trackId: "networks", label: "Desafio Redes: Conectividade" },
        { kind: "challenge", id: "ch-lx-3", trackId: "linux", label: "Desafio Linux: Auditoria" },
      ],
    },
  ],
};

export const DATA_SQL_ROADMAP: RoadmapDefinition = {
  id: "data-sql",
  title: "Dados, SQL e Análise com Python",
  shortTitle: "Dados & SQL",
  categoryId: "data-analytics",
  kind: "skill",
  scopeLabel: "Consultas → Insights",
  accentColor: "#A855F7",
  accentSecondary: "#38BDF8",
  accentSoft: "rgba(168, 85, 247, 0.14)",
  accentBorder: "rgba(168, 85, 247, 0.42)",
  summary:
    "Aprenda a consultar, modelar, cruzar e transformar dados com SQL profissional e scripts analíticos em Python.",
  audience:
    "Aspirantes a Analista de Dados, BI, Engenharia de Dados e devs que trabalham fortemente com SQL.",
  featured: false,
  relatedTrackIds: ["database", "python"],
  relatedRoadmapIds: ["backend", "cs-foundations"],
  pathways: [
    {
      id: "ds-analista",
      label: "SQL Analítico para Negócios",
      audience: "BI, Produto e Relatórios",
      description: "SELECT, WHERE, GROUP BY, HAVING, JOINs, subqueries e modelagem relacional.",
      nodeIds: [
        "ds-sql-queries",
        "ds-modeling",
        "ds-subqueries-cte",
        "ds-ddl-dml",
        "ds-window-perf",
      ],
    },
    {
      id: "ds-python",
      label: "Dados + Automação em Python",
      audience: "Análise programática e pipelines",
      description: "Limpeza de dados, dicionários, métricas em Python e projeto analítico.",
      nodeIds: [
        "ds-python-analysis",
        "ds-etl-cleaning",
        "ds-viz-kpis",
        "ds-checkpoint-report",
        "ds-project-bi",
      ],
    },
  ],
  stages: [
    {
      id: "ds-s1",
      order: 1,
      label: "Etapa 01",
      title: "SQL Fundamental & Modelagem",
      subtitle: "Consultas, filtros, agregações e relacionamento entre tabelas.",
    },
    {
      id: "ds-s2",
      order: 2,
      label: "Etapa 02",
      title: "SQL Avançado & Otimização",
      subtitle: "Subqueries, CTEs, DDL/DML e índices de leitura.",
    },
    {
      id: "ds-s3",
      order: 3,
      label: "Etapa 03",
      title: "Python Analítico, KPIs & Entrega",
      subtitle: "Limpeza de dados, métricas de negócio e relatórios.",
    },
  ],
  nodes: [
    // ETAPA 01
    {
      id: "ds-sql-queries",
      roadmapId: "data-sql",
      stageId: "ds-s1",
      column: 0,
      title: "SELECT, WHERE, Ordenação e Agregações",
      shortTitle: "Consultas & Agregação",
      kind: "foundation",
      priority: "required",
      summary:
        "Extraia dados com `SELECT`, filtre com `WHERE`, ordene resultados e calcule métricas com `COUNT`, `SUM`, `AVG`, `GROUP BY` e `HAVING`.",
      whyItMatters:
        "Responder perguntas de negócio diretamente no banco evita planilhas manuais lentas.",
      keyConcepts: ["SELECT & WHERE", "GROUP BY", "HAVING"],
      glossaryIds: ["sql-relational", "sql-where", "sql-groupby"],
      prerequisites: [],
      nextIds: ["ds-modeling"],
      studyLinks: [
        { kind: "lesson", id: "db-01", trackId: "database", label: "SQL 01: SELECT" },
        { kind: "lesson", id: "db-03", trackId: "database", label: "SQL 03: GROUP BY" },
      ],
    },
    {
      id: "ds-modeling",
      roadmapId: "data-sql",
      stageId: "ds-s1",
      column: 1,
      title: "Modelagem Relacional, Chaves e JOINs",
      shortTitle: "Modelagem & JOINs",
      kind: "concept",
      priority: "required",
      summary:
        "Conecte múltiplas tabelas com `INNER JOIN` e `LEFT JOIN`, preservando integridade referencial.",
      whyItMatters:
        "Dados corporativos ficam distribuídos em tabelas — cruzar pedidos, clientes e produtos é rotina diária.",
      keyConcepts: ["INNER JOIN", "LEFT JOIN", "Chaves"],
      glossaryIds: ["sql-join", "sql-relational"],
      prerequisites: ["ds-sql-queries"],
      nextIds: ["ds-subqueries-cte"],
      studyLinks: [
        { kind: "lesson", id: "db-05", trackId: "database", label: "SQL 05: INNER JOIN" },
        { kind: "lesson", id: "db-06", trackId: "database", label: "SQL 06: LEFT JOIN" },
      ],
    },
    {
      id: "ds-subqueries-cte",
      roadmapId: "data-sql",
      stageId: "ds-s2",
      column: 2,
      title: "Subqueries, CTEs (WITH) e Rankings",
      shortTitle: "Subqueries & CTEs",
      kind: "concept",
      priority: "required",
      summary:
        "Quebre consultas complexas em etapas legíveis usando subconsultas e Common Table Expressions (`WITH`).",
      whyItMatters:
        "Facilita análises em múltiplas camadas como ticket médio acima da média geral e coortes.",
      keyConcepts: ["Subqueries", "CTEs", "Rankings"],
      glossaryIds: ["sql-subquery"],
      prerequisites: ["ds-modeling"],
      nextIds: ["ds-ddl-dml"],
      studyLinks: [
        { kind: "lesson", id: "db-07", trackId: "database", label: "SQL 07: Subqueries" },
      ],
    },
    {
      id: "ds-ddl-dml",
      roadmapId: "data-sql",
      stageId: "ds-s2",
      column: 2,
      title: "DDL, DML e Integridade de Dados",
      shortTitle: "DDL & Integridade",
      kind: "concept",
      priority: "recommended",
      summary:
        "Crie tabelas tipadas (`CREATE TABLE`), defina restrições (`NOT NULL`, `UNIQUE`, `FOREIGN KEY`) e manipule registros com segurança.",
      whyItMatters:
        "Evita dados sujos ou inconsistentes antes mesmo de chegarem aos relatórios.",
      keyConcepts: ["CREATE TABLE", "Constraints", "INSERT/UPDATE"],
      glossaryIds: ["sql-relational"],
      prerequisites: ["ds-subqueries-cte"],
      nextIds: ["ds-window-perf"],
      studyLinks: [
        { kind: "lesson", id: "db-08", trackId: "database", label: "SQL 08: DDL e DML" },
      ],
    },
    {
      id: "ds-window-perf",
      roadmapId: "data-sql",
      stageId: "ds-s2",
      column: 1,
      title: "Índices, Planos de Execução & Performance",
      shortTitle: "Índices & Performance",
      kind: "concept",
      priority: "recommended",
      summary:
        "Analise `EXPLAIN`, crie índices em colunas filtradas/agrupadas e otimize queries pesadas.",
      whyItMatters:
        "Reduz relatórios que levavam minutos para poucos milissegundos.",
      keyConcepts: ["Índices", "EXPLAIN", "Otimização"],
      glossaryIds: ["sql-acid-index"],
      prerequisites: ["ds-ddl-dml"],
      nextIds: ["ds-python-analysis"],
      studyLinks: [],
    },

    // ETAPA 03
    {
      id: "ds-python-analysis",
      roadmapId: "data-sql",
      stageId: "ds-s3",
      column: 0,
      title: "Python para Análise: Listas & Dicionários",
      shortTitle: "Análise em Python",
      kind: "technology",
      priority: "recommended",
      summary:
        "Processe coleções, dicionários, list comprehensions e funções agregadoras em Python.",
      whyItMatters:
        "Python complementa o SQL quando é preciso limpar textos, cruzar APIs e automatizar relatórios.",
      keyConcepts: ["Dicionários", "Comprehensions", "Agregação"],
      glossaryIds: ["python-programming", "python-comprehension"],
      prerequisites: ["ds-window-perf"],
      nextIds: ["ds-etl-cleaning"],
      studyLinks: [
        { kind: "lesson", id: "py-06", trackId: "python", label: "Python 06: Dicionários" },
        { kind: "lesson", id: "py-07", trackId: "python", label: "Python 07: Comprehensions" },
      ],
    },
    {
      id: "ds-etl-cleaning",
      roadmapId: "data-sql",
      stageId: "ds-s3",
      column: 1,
      title: "Limpeza de Dados & Fluxos ETL",
      shortTitle: "Limpeza & ETL",
      kind: "concept",
      priority: "recommended",
      summary:
        "Padronize formatos, trate nulos/duplicados e estruture fluxos de Extração, Transformação e Carga (ETL).",
      whyItMatters:
        "Grande parte do trabalho real em dados é garantir confiabilidade antes de gerar gráficos.",
      keyConcepts: ["ETL", "Deduplicação", "Normalização"],
      glossaryIds: ["python-programming"],
      prerequisites: ["ds-python-analysis"],
      nextIds: ["ds-viz-kpis"],
      studyLinks: [
        { kind: "lesson", id: "py-08", trackId: "python", label: "Python 08: Funções Analisadoras" },
      ],
    },
    {
      id: "ds-viz-kpis",
      roadmapId: "data-sql",
      stageId: "ds-s3",
      column: 2,
      title: "KPIs, Métricas & Storytelling de Dados",
      shortTitle: "KPIs & Dashboards",
      kind: "concept",
      priority: "recommended",
      summary:
        "Defina indicadores acionáveis (conversão, retenção, ticket médio) e escolha visualizações claras.",
      whyItMatters:
        "Dados só geram valor quando respondem claramente a decisões de produto ou negócio.",
      keyConcepts: ["KPIs", "Visualização", "Storytelling"],
      glossaryIds: ["sql-groupby"],
      prerequisites: ["ds-etl-cleaning"],
      nextIds: ["ds-checkpoint-report"],
      studyLinks: [],
    },
    {
      id: "ds-checkpoint-report",
      roadmapId: "data-sql",
      stageId: "ds-s3",
      column: 2,
      title: "Checkpoint: Relatório Executivo SQL + Python",
      shortTitle: "Checkpoint Analítico",
      kind: "checkpoint",
      priority: "required",
      summary:
        "Responda perguntas complexas de faturamento e ranking cruzando 3+ tabelas em SQL e consolidando indicadores.",
      whyItMatters:
        "Une modelagem relacional, agregação e leitura estratégica de métricas.",
      keyConcepts: ["JOIN Triplo", "Ranking", "Métricas"],
      glossaryIds: ["sql-join", "sql-groupby"],
      prerequisites: ["ds-viz-kpis"],
      nextIds: [],
      projectIdeas: [
        "Relatório de faturamento por cliente e ranking de produtos mais vendidos em SQL.",
      ],
      studyLinks: [
        { kind: "challenge", id: "ch-db-2", trackId: "database", label: "Desafio SQL: Ranking" },
        { kind: "challenge", id: "ch-db-3", trackId: "database", label: "Desafio SQL: JOIN Triplo" },
      ],
    },
  ],
};

export const CS_FOUNDATIONS_ROADMAP: RoadmapDefinition = {
  id: "cs-foundations",
  title: "Ciência da Computação & Lógica",
  shortTitle: "Algoritmos & Base",
  categoryId: "cs-algorithms",
  kind: "foundation",
  scopeLabel: "Zero → Estruturas",
  accentColor: "#EC4899",
  accentSecondary: "#8B5CF6",
  accentSoft: "rgba(236, 72, 153, 0.14)",
  accentBorder: "rgba(236, 72, 153, 0.42)",
  summary:
    "Construa pensamento computacional sólido: variáveis, condicionais, laços, funções, recursão, complexidade Big-O e estruturas de dados.",
  audience:
    "Iniciantes absolutos ou devs que querem fortalecer base algorítmica para entrevistas e projetos complexos.",
  featured: false,
  relatedTrackIds: ["logic", "python", "cpp"],
  relatedRoadmapIds: ["full-stack", "backend"],
  pathways: [
    {
      id: "cs-first-steps",
      label: "Do Zero aos Primeiros Algoritmos",
      audience: "Primeira linguagem de programação",
      description:
        "Lógica em Portugol, decisões booleanas, laços, funções, escolha de linguagem e vetores.",
      nodeIds: [
        "cs-vars-control",
        "cs-boolean-decisions",
        "cs-loops-accum",
        "cs-functions",
        "cs-syntax-track",
      ],
    },
    {
      id: "cs-algorithms-core",
      label: "Estruturas, Recursão & Big-O",
      audience: "Resolução de problemas e entrevistas",
      description:
        "Vetores, matrizes, recursão, análise Big-O, busca binária e ordenação.",
      nodeIds: [
        "cs-data-structures",
        "cs-recursion",
        "cs-complexity-bigo",
        "cs-searching-sorting",
        "cs-checkpoint-algo",
      ],
    },
  ],
  stages: [
    {
      id: "cs-s1",
      order: 1,
      label: "Etapa 01",
      title: "Pensamento Lógico & Controle de Fluxo",
      subtitle: "Variáveis, lógica booleana, condicionais e laços.",
    },
    {
      id: "cs-s2",
      order: 2,
      label: "Etapa 02",
      title: "Modularização & Linguagem Real",
      subtitle: "Funções reutilizáveis e transição para Python ou C++.",
    },
    {
      id: "cs-s3",
      order: 3,
      label: "Etapa 03",
      title: "Estruturas, Recursão & Algoritmos",
      subtitle: "Vetores, recursão, Big-O, busca e ordenação.",
    },
  ],
  nodes: [
    // ETAPA 01
    {
      id: "cs-vars-control",
      roadmapId: "cs-foundations",
      stageId: "cs-s1",
      column: 0,
      title: "Variáveis, Tipos e Expressões",
      shortTitle: "Variáveis & Expressões",
      kind: "foundation",
      priority: "required",
      summary:
        "Guarde valores em variáveis tipadas, respeite precedência aritmética e exiba saídas claras.",
      whyItMatters:
        "Todo algoritmo manipula dados em memória antes de tomar decisões ou repetir passos.",
      keyConcepts: ["Variáveis", "Tipos", "Precedência"],
      glossaryIds: ["variable-declaration", "conditional-if"],
      prerequisites: [],
      nextIds: ["cs-boolean-decisions"],
      studyLinks: [
        { kind: "lesson", id: "logic-01", trackId: "logic", label: "Lógica 01: Variáveis" },
        { kind: "lesson", id: "logic-02", trackId: "logic", label: "Lógica 02: Expressões" },
      ],
    },
    {
      id: "cs-boolean-decisions",
      roadmapId: "cs-foundations",
      stageId: "cs-s1",
      column: 1,
      title: "Lógica Booleana & Condicionais (se / senao)",
      shortTitle: "Booleanos & Condições",
      kind: "foundation",
      priority: "required",
      summary:
        "Combine comparações com `e`, `ou`, `nao` e ramifique caminhos de execução com `se/senao`.",
      whyItMatters:
        "Permite que programas reajam a regras de negócio, limites e entradas diferentes.",
      keyConcepts: ["Booleanos", "se / senao", "Casos de fronteira"],
      glossaryIds: ["conditional-if"],
      prerequisites: ["cs-vars-control"],
      nextIds: ["cs-loops-accum"],
      studyLinks: [
        { kind: "lesson", id: "logic-03", trackId: "logic", label: "Lógica 03: Booleana" },
        { kind: "lesson", id: "logic-04", trackId: "logic", label: "Lógica 04: se / senao" },
      ],
    },
    {
      id: "cs-loops-accum",
      roadmapId: "cs-foundations",
      stageId: "cs-s1",
      column: 2,
      title: "Laços de Repetição & Acumuladores",
      shortTitle: "Laços & Acumuladores",
      kind: "foundation",
      priority: "required",
      summary:
        "Automatize repetições com `enquanto` e `para`, usando contadores, sentinelas e acumuladores.",
      whyItMatters:
        "Processar listas, somatórios e entradas contínuas depende de controle seguro de laços.",
      keyConcepts: ["enquanto / para", "Acumuladores", "Condição de parada"],
      glossaryIds: ["loop-iteration"],
      prerequisites: ["cs-boolean-decisions"],
      nextIds: ["cs-functions"],
      studyLinks: [
        { kind: "lesson", id: "logic-06", trackId: "logic", label: "Lógica 06: enquanto" },
        { kind: "lesson", id: "logic-07", trackId: "logic", label: "Lógica 07: para" },
      ],
    },

    // ETAPA 02
    {
      id: "cs-functions",
      roadmapId: "cs-foundations",
      stageId: "cs-s2",
      column: 0,
      title: "Funções, Parâmetros, Retorno e Escopo",
      shortTitle: "Funções & Escopo",
      kind: "concept",
      priority: "required",
      summary:
        "Quebre problemas grandes em funções pequenas e reutilizáveis, isolando escopo local e retorno.",
      whyItMatters:
        "Código modular é muito mais fácil de testar, ler e reutilizar em qualquer projeto.",
      keyConcepts: ["Funções", "Parâmetros", "Escopo"],
      glossaryIds: ["function-scope", "python-def"],
      prerequisites: ["cs-loops-accum"],
      nextIds: ["cs-syntax-track"],
      studyLinks: [
        { kind: "lesson", id: "logic-09", trackId: "logic", label: "Lógica 09: Funções" },
        { kind: "lesson", id: "logic-10", trackId: "logic", label: "Lógica 10: Analisador" },
      ],
    },
    {
      id: "cs-syntax-track",
      roadmapId: "cs-foundations",
      stageId: "cs-s2",
      column: 1,
      title: "Escolha sua Linguagem (Python ou C++)",
      shortTitle: "Python",
      kind: "alternative-group",
      priority: "required",
      summary:
        "Transfira sua base lógica para uma linguagem real: sintaxe ágil em Python ou tipagem e memória em C++.",
      whyItMatters:
        "Os conceitos lógicos são universais — praticar em uma linguagem real consolida tudo.",
      keyConcepts: ["Python", "C++", "Sintaxe real"],
      glossaryIds: ["python-programming", "cpp-language"],
      alternatives: [
        {
          id: "alt-cs-python",
          name: "Python",
          priority: "required",
          summary: "Leitura limpa e produtividade imediata para algoritmos, dados e backend.",
          whenToChoose: "Ideal para primeira linguagem real.",
        },
        {
          id: "alt-cs-cpp",
          name: "C++",
          priority: "recommended",
          summary: "Tipos estáticos, ponteiros/referências e máxima velocidade em competições.",
          whenToChoose: "Para entender memória de perto e performance.",
        },
      ],
      prerequisites: ["cs-functions"],
      nextIds: ["cs-data-structures"],
      studyLinks: [
        { kind: "track", id: "python", trackId: "python", label: "Trilha Python" },
        { kind: "track", id: "cpp", trackId: "cpp", label: "Trilha C++" },
      ],
    },

    // ETAPA 03
    {
      id: "cs-data-structures",
      roadmapId: "cs-foundations",
      stageId: "cs-s3",
      column: 0,
      title: "Vetores, Listas, Pilhas e Dicionários (Hash)",
      shortTitle: "Estruturas de Dados",
      kind: "concept",
      priority: "required",
      summary:
        "Armazene e consulte coleções com arrays/vetores, pilhas (LIFO), filas (FIFO) e tabelas hash/dicionários.",
      whyItMatters:
        "Escolher a estrutura certa reduz código e transforma buscas lentas em acesso instantâneo.",
      keyConcepts: ["Arrays / Vetores", "Pilhas & Filas", "Hash Maps"],
      glossaryIds: ["array-vector", "cpp-vector"],
      prerequisites: ["cs-syntax-track"],
      nextIds: ["cs-recursion"],
      studyLinks: [
        { kind: "lesson", id: "cpp-08", trackId: "cpp", label: "C++ 08: std::vector" },
        { kind: "lesson", id: "py-06", trackId: "python", label: "Python 06: Dicionários" },
      ],
    },
    {
      id: "cs-recursion",
      roadmapId: "cs-foundations",
      stageId: "cs-s3",
      column: 1,
      title: "Recursão & Dividir para Conquistar",
      shortTitle: "Recursão",
      kind: "concept",
      priority: "recommended",
      summary:
        "Resolva problemas que se quebram em subproblemas menores definindo caso base e passo recursivo.",
      whyItMatters:
        "Essencial para percorrer árvores, grafos e algoritmos de ordenação eficientes.",
      keyConcepts: ["Caso base", "Pilha de chamadas", "Divisão e conquista"],
      glossaryIds: ["function-scope"],
      prerequisites: ["cs-data-structures"],
      nextIds: ["cs-complexity-bigo"],
      studyLinks: [
        { kind: "challenge", id: "ch-lg-1", trackId: "logic", label: "Desafio: Fatorial" },
      ],
    },
    {
      id: "cs-complexity-bigo",
      roadmapId: "cs-foundations",
      stageId: "cs-s3",
      column: 2,
      title: "Análise de Complexidade (Notação Big-O)",
      shortTitle: "Complexidade Big-O",
      kind: "concept",
      priority: "recommended",
      summary:
        "Avalie como tempo e memória crescem com a entrada: $O(1)$, $O(\\log n)$, $O(n)$ e $O(n^2)$.",
      whyItMatters:
        "Evita algoritmos lentos que travam quando a lista passa de 100 para 1 milhão de itens.",
      keyConcepts: ["Big-O", "Tempo vs Espaço", "Escalabilidade"],
      glossaryIds: ["array-vector"],
      prerequisites: ["cs-recursion"],
      nextIds: ["cs-searching-sorting"],
      studyLinks: [],
    },
    {
      id: "cs-searching-sorting",
      roadmapId: "cs-foundations",
      stageId: "cs-s3",
      column: 1,
      title: "Busca Binária & Algoritmos de Ordenação",
      shortTitle: "Busca & Ordenação",
      kind: "concept",
      priority: "required",
      summary:
        "Compare busca linear vs busca binária e entenda ordenação eficiente.",
      whyItMatters:
        "São os blocos clássicos mais cobrados em testes técnicos e otimização de sistemas.",
      keyConcepts: ["Busca Binária", "Ordenação", "Comparação"],
      glossaryIds: ["array-vector"],
      prerequisites: ["cs-complexity-bigo"],
      nextIds: ["cs-checkpoint-algo"],
      studyLinks: [
        { kind: "challenge", id: "ch-py-3", trackId: "python", label: "Desafio: Busca Binária" },
      ],
    },
    {
      id: "cs-checkpoint-algo",
      roadmapId: "cs-foundations",
      stageId: "cs-s3",
      column: 0,
      title: "Checkpoint: Desafios Clássicos de Algoritmos",
      shortTitle: "Checkpoint Algoritmos",
      kind: "checkpoint",
      priority: "required",
      summary:
        "Resolva algoritmos clássicos de busca, contagem, validação de parênteses e sequências numéricas.",
      whyItMatters:
        "Consolida lógica, estruturas de dados e análise de complexidade na prática.",
      keyConcepts: ["Algoritmos", "Testes de borda"],
      glossaryIds: ["array-vector", "loop-iteration"],
      prerequisites: ["cs-searching-sorting"],
      nextIds: [],
      projectIdeas: [
        "Suíte de desafios com busca binária, validador de parênteses e números primos.",
      ],
      studyLinks: [
        { kind: "challenge", id: "ch-js-3", trackId: "js", label: "Desafio: Parênteses" },
        { kind: "challenge", id: "ch-cpp-3", trackId: "cpp", label: "Desafio: Número Primo" },
      ],
    },
  ],
};
