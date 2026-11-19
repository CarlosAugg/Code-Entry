import type { Lesson } from "../../types/curriculum";

export const DATABASE_LESSONS: Lesson[] = [
  {
    id: "db-01",
    trackId: "database",
    moduleId: "db-m1",
    moduleTitle: "Módulo 1 — Consultas Essenciais",
    order: 1,
    title: "SELECT, Colunas e Ordenação",
    subtitle: "Projeção explícita e ORDER BY",
    difficulty: "Muito fácil",
    estimatedMinutes: 8,
    xp: 45,
    workbench: "sql",
    sqlDatasetId: "ecommerce",
    summary: "Consulte colunas específicas de uma tabela SQL real e ordene resultados por preço.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Evite SELECT * em produção",
        content:
          "Selecionar apenas as colunas necessárias reduz tráfego e torna a consulta legível. Com ORDER BY coluna DESC ordenamos do maior para o menor.",
      },
    ],
    examples: [
      {
        title: "Listando clientes ordenados",
        description: "Retorna nome e cidade em ordem alfabética.",
        code: `SELECT nome, cidade\nFROM clientes\nORDER BY nome ASC;`,
      },
    ],
    prompt:
      "Consulte as colunas 'nome', 'categoria' e 'preco' da tabela 'produtos', ordenando do maior preço para o menor (ORDER BY preco DESC).",
    starterCode: `-- Escreva sua consulta SQL abaixo usando o dataset TechStore\n-- Selecione nome, categoria, preco da tabela produtos\n`,
    hints: [
      "Comece com SELECT nome, categoria, preco FROM produtos.",
      "Adicione ORDER BY preco DESC no final antes do ponto e vírgula.",
      "Consulta completa:\nSELECT nome, categoria, preco\nFROM produtos\nORDER BY preco DESC;",
    ],
    objectives: [
      {
        id: "db01-cols",
        label: "Selecionar exatamente as colunas nome, categoria e preco",
        test: ctx => {
          const cols = (ctx.sql?.columns || []).map(c => c.toLowerCase());
          return (
            ctx.success &&
            cols.length === 3 &&
            cols.includes("nome") &&
            cols.includes("categoria") &&
            cols.includes("preco")
          );
        },
      },
      {
        id: "db01-order",
        label: "Ordenar do maior preço para o menor (primeiro: Monitor 27\" IPS 144Hz)",
        test: ctx =>
          ctx.success &&
          (ctx.sql?.rows.length || 0) === 10 &&
          Number(ctx.sql?.rows[0]?.preco) === 1490,
      },
    ],
    referenceSolution: "SELECT nome, categoria, preco FROM produtos ORDER BY preco DESC;",
  },
  {
    id: "db-02",
    trackId: "database",
    moduleId: "db-m1",
    moduleTitle: "Módulo 1 — Consultas Essenciais",
    order: 2,
    title: "Filtros Compostos com WHERE",
    subtitle: "AND, OR, IN e operadores de comparação",
    difficulty: "Fácil",
    estimatedMinutes: 10,
    xp: 55,
    workbench: "sql",
    sqlDatasetId: "ecommerce",
    summary: "Filtre registros com múltiplas condições combinadas na cláusula WHERE.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Filtragem precisa",
        content:
          "A cláusula WHERE filtra linhas antes da ordenação. Podemos combinar condições usando AND (todas verdadeiras), OR (pelo menos uma) e comparações numéricas (>=, <=, <>).",
      },
    ],
    examples: [
      {
        title: "Clientes corporativos de SP",
        description: "Combina duas condições com AND.",
        code: `SELECT nome, email\nFROM clientes\nWHERE estado = 'SP' AND segmento = 'Corporativo';`,
      },
    ],
    prompt:
      "Liste 'nome', 'categoria' e 'preco' dos produtos da categoria 'Redes' que estejam ativos (ativo = 1) e custem mais de 100 (preco > 100).",
    starterCode: `-- Filtre produtos ativos da categoria 'Redes' com preco > 100\n`,
    hints: [
      "Use SELECT nome, categoria, preco FROM produtos WHERE ...",
      "Combine as 3 condições com AND: categoria = 'Redes' AND ativo = 1 AND preco > 100.",
      "Não use aspas duplas em textos SQL; use aspas simples ('Redes').",
    ],
    objectives: [
      {
        id: "db02-filter",
        label: "Retornar exatamente os 2 produtos de Redes acima de 100 (Switch e Roteador)",
        test: ctx => {
          const rows = ctx.sql?.rows || [];
          return (
            ctx.success &&
            rows.length === 2 &&
            rows.every(r => r.categoria === "Redes" && Number(r.preco) > 100)
          );
        },
      },
    ],
    referenceSolution:
      "SELECT nome, categoria, preco FROM produtos WHERE categoria = 'Redes' AND ativo = 1 AND preco > 100;",
  },
  {
    id: "db-03",
    trackId: "database",
    moduleId: "db-m2",
    moduleTitle: "Módulo 2 — Agregações e Agrupamentos",
    order: 3,
    title: "Funções de Agregação e GROUP BY",
    subtitle: "COUNT, SUM, AVG e aliases AS",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 70,
    workbench: "sql",
    sqlDatasetId: "ecommerce",
    summary: "Agrupe pedidos por status para calcular quantidade e faturamento total por grupo.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Resumindo dados com GROUP BY",
        content:
          "Funções agregadas como COUNT(*), SUM(coluna) e ROUND(AVG(coluna), 2) resumem conjuntos de linhas. Ao combinar com GROUP BY coluna, obtemos um resumo para cada valor distinto.",
      },
    ],
    examples: [
      {
        title: "Produtos por categoria",
        description: "Conta produtos e calcula preço médio.",
        code: `SELECT categoria, COUNT(*) AS qtd, ROUND(AVG(preco), 2) AS media_preco\nFROM produtos\nGROUP BY categoria;`,
      },
    ],
    prompt:
      "Agrupe a tabela 'pedidos' por 'status' exibindo as colunas: status, total_pedidos (COUNT(*)) e soma_total (ROUND(SUM(total), 2)), ordenado por soma_total DESC.",
    starterCode: `-- Agrupe pedidos por status calculando total_pedidos e soma_total\n`,
    hints: [
      "Use SELECT status, COUNT(*) AS total_pedidos, ROUND(SUM(total), 2) AS soma_total FROM pedidos.",
      "Agrupe com GROUP BY status e ordene com ORDER BY soma_total DESC.",
      "O status 'pago' deve aparecer no topo com total_pedidos = 6.",
    ],
    objectives: [
      {
        id: "db03-group",
        label: "Usar GROUP BY status com aliases total_pedidos e soma_total",
        test: ctx => {
          const rows = ctx.sql?.rows || [];
          const pago = rows.find(r => r.status === "pago");
          return (
            ctx.success &&
            rows.length === 4 &&
            Number(pago?.total_pedidos) === 6 &&
            Math.abs(Number(pago?.soma_total) - 5570.7) < 0.1
          );
        },
      },
    ],
    referenceSolution:
      "SELECT status, COUNT(*) AS total_pedidos, ROUND(SUM(total), 2) AS soma_total FROM pedidos GROUP BY status ORDER BY soma_total DESC;",
  },
  {
    id: "db-04",
    trackId: "database",
    moduleId: "db-m2",
    moduleTitle: "Módulo 2 — Agregações e Agrupamentos",
    order: 4,
    title: "Filtrando Grupos com HAVING",
    subtitle: "Diferença entre WHERE e HAVING",
    difficulty: "Intermediário",
    estimatedMinutes: 14,
    xp: 85,
    workbench: "sql",
    sqlDatasetId: "empresa",
    summary: "Use HAVING para filtrar departamentos somente após calcular folha salarial agregada.",
    theoryBlocks: [
      {
        kind: "text",
        title: "WHERE antes, HAVING depois",
        content:
          "WHERE filtra linhas individuais antes do agrupamento. HAVING filtra grupos já agregados (ex.: HAVING COUNT(*) >= 2 ou HAVING SUM(salario) > 25000).",
      },
    ],
    examples: [
      {
        title: "Cargos com mais de 1 pessoa",
        description: "Filtra agregações com HAVING.",
        code: `SELECT departamento_id, COUNT(*) AS equipe\nFROM funcionarios\nGROUP BY departamento_id\nHAVING COUNT(*) >= 2;`,
      },
    ],
    prompt:
      "No banco Corporação NexusRH, consulte na tabela 'funcionarios' o 'departamento_id' e a soma dos salários como 'folha' (SUM(salario)), agrupando por departamento_id e mostrando apenas departamentos cuja folha ultrapassa 25000.",
    starterCode: `-- Dataset: Corporação NexusRH (tabela funcionarios)\n-- Calcule departamento_id e folha = SUM(salario) com HAVING\n`,
    hints: [
      "Selecione SELECT departamento_id, SUM(salario) AS folha FROM funcionarios.",
      "Agrupe por departamento_id e filtre com HAVING SUM(salario) > 25000.",
      "Apenas os departamentos 1 (30200) e 3 (25200) têm folha acima de 25000.",
    ],
    objectives: [
      {
        id: "db04-having",
        label: "Utilizar GROUP BY e HAVING retornando os 2 departamentos com folha > 25000",
        test: ctx => {
          const rows = ctx.sql?.rows || [];
          return (
            ctx.success &&
            /\bhaving\b/i.test(ctx.code) &&
            rows.length === 2 &&
            rows.every(r => Number(r.folha) > 25000)
          );
        },
      },
    ],
    referenceSolution:
      "SELECT departamento_id, SUM(salario) AS folha FROM funcionarios GROUP BY departamento_id HAVING SUM(salario) > 25000;",
  },
  {
    id: "db-05",
    trackId: "database",
    moduleId: "db-m3",
    moduleTitle: "Módulo 3 — Relacionamentos, Subconsultas e DML",
    order: 5,
    title: "INNER JOIN entre Tabelas",
    subtitle: "Conectando chaves primárias e estrangeiras",
    difficulty: "Intermediário",
    estimatedMinutes: 15,
    xp: 95,
    workbench: "sql",
    sqlDatasetId: "ecommerce",
    summary: "Combine pedidos e clientes usando INNER JOIN para exibir o nome do comprador em cada venda.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Relacionando tabelas normalizadas",
        content:
          "A tabela pedidos guarda apenas cliente_id para evitar repetição de dados cadastrais. Com INNER JOIN clientes c ON c.id = p.cliente_id unimos as duas tabelas.",
      },
    ],
    examples: [
      {
        title: "Funcionários e seus departamentos",
        description: "Usa aliases curtos (f e d) para clareza.",
        code: `SELECT f.nome, d.nome AS departamento\nFROM funcionarios f\nINNER JOIN departamentos d ON d.id = f.departamento_id;`,
      },
    ],
    prompt:
      "Faça um JOIN entre 'pedidos' (p) e 'clientes' (c) para listar: p.id AS pedido_id, c.nome AS cliente, p.status e p.total apenas dos pedidos com p.status = 'pago', ordenados por p.id ASC.",
    starterCode: `-- Una pedidos p com clientes c onde p.status = 'pago'\n`,
    hints: [
      "Use FROM pedidos p INNER JOIN clientes c ON c.id = p.cliente_id.",
      "Filtre com WHERE p.status = 'pago' e ordene com ORDER BY p.id ASC.",
      "Selecione exatamente as colunas: p.id AS pedido_id, c.nome AS cliente, p.status, p.total.",
    ],
    objectives: [
      {
        id: "db05-join",
        label: "Combinar pedidos e clientes via JOIN retornando os 6 pedidos pagos",
        test: ctx => {
          const rows = ctx.sql?.rows || [];
          return (
            ctx.success &&
            /\bjoin\b/i.test(ctx.code) &&
            rows.length === 6 &&
            rows[0]?.cliente === "Ana Carolina" &&
            Number(rows[0]?.pedido_id) === 101
          );
        },
      },
    ],
    referenceSolution:
      "SELECT p.id AS pedido_id, c.nome AS cliente, p.status, p.total FROM pedidos p INNER JOIN clientes c ON c.id = p.cliente_id WHERE p.status = 'pago' ORDER BY p.id ASC;",
  },
  {
    id: "db-06",
    trackId: "database",
    moduleId: "db-m3",
    moduleTitle: "Módulo 3 — Relacionamentos, Subconsultas e DML",
    order: 6,
    title: "LEFT JOIN e Registros Sem Correspondência",
    subtitle: "Encontrando clientes sem compras",
    difficulty: "Intermediário",
    estimatedMinutes: 15,
    xp: 100,
    workbench: "sql",
    sqlDatasetId: "ecommerce",
    summary: "Use LEFT JOIN + IS NULL para identificar clientes que ainda não realizaram nenhum pedido.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Por que LEFT JOIN?",
        content:
          "Ao contrário do INNER JOIN (que descarta quem não tem par), o LEFT JOIN preserva todas as linhas da tabela à esquerda preenchendo com NULL as colunas da tabela à direita quando não há correspondência.",
      },
    ],
    examples: [
      {
        title: "Contagem inclusive zeros",
        description: "Preserva clientes mesmo sem pedidos.",
        code: `SELECT c.nome, COUNT(p.id) AS qtd_pedidos\nFROM clientes c\nLEFT JOIN pedidos p ON p.cliente_id = c.id\nGROUP BY c.id;`,
      },
    ],
    prompt:
      "Use LEFT JOIN entre 'clientes' (c) e 'pedidos' (p) para listar 'c.nome' e 'c.email' apenas dos clientes que NÃO possuem nenhum pedido (WHERE p.id IS NULL).",
    starterCode: `-- Encontre clientes que nunca fizeram pedidos usando LEFT JOIN e IS NULL\n`,
    hints: [
      "Comece por FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id.",
      "Adicione WHERE p.id IS NULL para manter apenas quem não tem pedido.",
      "Henrique Dias (id 8) é o cliente sem pedidos no dataset.",
    ],
    objectives: [
      {
        id: "db06-left",
        label: "Utilizar LEFT JOIN e IS NULL retornando Henrique Dias",
        test: ctx => {
          const rows = ctx.sql?.rows || [];
          return (
            ctx.success &&
            /\bleft\s+(?:outer\s+)?join\b/i.test(ctx.code) &&
            rows.length === 1 &&
            rows[0]?.nome === "Henrique Dias"
          );
        },
      },
    ],
    referenceSolution:
      "SELECT c.nome, c.email FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.id IS NULL;",
  },
  {
    id: "db-07",
    trackId: "database",
    moduleId: "db-m3",
    moduleTitle: "Módulo 3 — Relacionamentos, Subconsultas e DML",
    order: 7,
    title: "Subconsultas (Subqueries)",
    subtitle: "Comparando com métricas dinâmicas",
    difficulty: "Difícil",
    estimatedMinutes: 16,
    xp: 110,
    workbench: "sql",
    sqlDatasetId: "empresa",
    summary: "Escreva uma subconsulta no WHERE para encontrar colaboradores acima da média salarial.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Consultas aninhadas",
        content:
          "Como funções agregadas (como AVG) não podem ir direto no WHERE, colocamos uma subconsulta entre parênteses: WHERE salario > (SELECT AVG(salario) FROM funcionarios).",
      },
    ],
    examples: [
      {
        title: "Produtos acima da média",
        description: "Compara o preço de cada linha com a média global.",
        code: `SELECT nome, preco FROM produtos\nWHERE preco > (SELECT AVG(preco) FROM produtos);`,
      },
    ],
    prompt:
      "Na tabela 'funcionarios', liste 'nome', 'cargo' e 'salario' daqueles que ganham acima da média salarial da empresa, ordenados por salario DESC.",
    starterCode: `-- Liste funcionários com salario > média salarial usando subconsulta\n`,
    hints: [
      "Calcule a média dentro de parênteses: (SELECT AVG(salario) FROM funcionarios).",
      "Use esse bloco no WHERE salario > (...).",
      "Ordene ao final com ORDER BY salario DESC.",
    ],
    objectives: [
      {
        id: "db07-subq",
        label: "Utilizar subconsulta com AVG(salario) retornando os 4 salários acima da média",
        test: ctx => {
          const rows = ctx.sql?.rows || [];
          return (
            ctx.success &&
            /\(\s*select\b/i.test(ctx.code) &&
            rows.length === 4 &&
            Number(rows[0]?.salario) === 15200
          );
        },
      },
    ],
    referenceSolution:
      "SELECT nome, cargo, salario FROM funcionarios WHERE salario > (SELECT AVG(salario) FROM funcionarios) ORDER BY salario DESC;",
  },
  {
    id: "db-08",
    trackId: "database",
    moduleId: "db-m3",
    moduleTitle: "Módulo 3 — Relacionamentos, Subconsultas e DML",
    order: 8,
    title: "DDL e DML: Criando e Consultando Tabelas",
    subtitle: "CREATE TABLE, INSERT INTO e SELECT",
    difficulty: "Difícil",
    estimatedMinutes: 18,
    xp: 125,
    workbench: "sql",
    sqlDatasetId: "ecommerce",
    summary: "Crie uma nova tabela de auditoria com chaves, insira registros e consulte o resultado na mesma sessão.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Múltiplas instruções na sandbox isolada",
        content:
          "Como a sandbox SQL do Code Entry cria um SQLite em memória limpo a cada execução, você pode testar CREATE TABLE, INSERT INTO, UPDATE e SELECT à vontade sem risco.",
      },
    ],
    examples: [
      {
        title: "Criando e populando tabela",
        description: "Define PRIMARY KEY e insere dois registros.",
        code: `CREATE TABLE cupons (codigo TEXT PRIMARY KEY, desconto INTEGER);\nINSERT INTO cupons VALUES ('BEMVINDO', 10), ('PRO20', 20);\nSELECT * FROM cupons;`,
      },
    ],
    prompt:
      "Crie uma tabela chamada 'auditoria_acessos' com colunas (id INTEGER PRIMARY KEY, usuario TEXT NOT NULL, acao TEXT NOT NULL), insira pelo menos 2 registros com INSERT INTO e finalize com SELECT * FROM auditoria_acessos;.",
    starterCode: `-- 1. CREATE TABLE auditoria_acessos (...)\n\n-- 2. INSERT INTO auditoria_acessos ...\n\n-- 3. SELECT * FROM auditoria_acessos;\n`,
    hints: [
      "Separe as instruções SQL com ponto e vírgula (;).",
      "Após o CREATE TABLE auditoria_acessos (...); insira 2 linhas com INSERT INTO auditoria_acessos (usuario, acao) VALUES (...), (...);.",
      "Termine sempre com SELECT * FROM auditoria_acessos; para visualizar os dados inseridos.",
    ],
    objectives: [
      {
        id: "db08-ddl",
        label: "Criar tabela auditoria_acessos e inserir >= 2 linhas retornando-as no SELECT",
        test: ctx => {
          const rows = ctx.sql?.rows || [];
          return (
            ctx.success &&
            /\bcreate\s+table\b/i.test(ctx.code) &&
            /\binsert\s+into\b/i.test(ctx.code) &&
            rows.length >= 2 &&
            "usuario" in rows[0] &&
            "acao" in rows[0]
          );
        },
      },
    ],
    referenceSolution: `CREATE TABLE auditoria_acessos (id INTEGER PRIMARY KEY, usuario TEXT NOT NULL, acao TEXT NOT NULL);\nINSERT INTO auditoria_acessos (usuario, acao) VALUES ('ana', 'login'), ('bruno', 'export_relatorio');\nSELECT * FROM auditoria_acessos;`,
  },
];
