import { DatabaseSync } from "node:sqlite";

const DATASETS = {
  ecommerce: {
    id: "ecommerce",
    name: "E-commerce TechStore",
    description: "Catálogo de hardware, clientes, pedidos e itens vendidos.",
    seedSql: `
      CREATE TABLE clientes (
        id INTEGER PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        cidade TEXT NOT NULL,
        estado TEXT NOT NULL,
        segmento TEXT NOT NULL,
        criado_em TEXT NOT NULL
      );

      CREATE TABLE produtos (
        id INTEGER PRIMARY KEY,
        nome TEXT NOT NULL,
        categoria TEXT NOT NULL,
        preco REAL NOT NULL,
        estoque INTEGER NOT NULL,
        ativo INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE pedidos (
        id INTEGER PRIMARY KEY,
        cliente_id INTEGER NOT NULL REFERENCES clientes(id),
        status TEXT NOT NULL,
        data_pedido TEXT NOT NULL,
        frete REAL NOT NULL,
        total REAL NOT NULL
      );

      CREATE TABLE itens_pedido (
        id INTEGER PRIMARY KEY,
        pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
        produto_id INTEGER NOT NULL REFERENCES produtos(id),
        quantidade INTEGER NOT NULL,
        preco_unitario REAL NOT NULL
      );

      INSERT INTO clientes VALUES
        (1, 'Ana Carolina', 'ana@techstore.dev', 'São Paulo', 'SP', 'Varejo', '2026-01-12'),
        (2, 'Bruno Mendes', 'bruno@redes.io', 'Campinas', 'SP', 'Corporativo', '2026-01-19'),
        (3, 'Carla Souza', 'carla@cloud.com.br', 'Belo Horizonte', 'MG', 'Varejo', '2026-02-03'),
        (4, 'Diego Lima', 'diego@devhub.org', 'Curitiba', 'PR', 'Corporativo', '2026-02-14'),
        (5, 'Elena Rocha', 'elena@data.dev', 'Rio de Janeiro', 'RJ', 'Varejo', '2026-03-01'),
        (6, 'Felipe Costa', 'felipe@infra.net', 'Porto Alegre', 'RS', 'Corporativo', '2026-03-11'),
        (7, 'Gabriela Alves', 'gabi@labs.dev', 'São Paulo', 'SP', 'Varejo', '2026-04-02'),
        (8, 'Henrique Dias', 'henrique@sys.br', 'Florianópolis', 'SC', 'Varejo', '2026-04-18');

      INSERT INTO produtos VALUES
        (1, 'Teclado Mecânico RGB', 'Periféricos', 349.90, 24, 1),
        (2, 'Mouse Gamer Óptico', 'Periféricos', 189.00, 42, 1),
        (3, 'Monitor 27" IPS 144Hz', 'Monitores', 1490.00, 11, 1),
        (4, 'SSD NVMe 1TB', 'Armazenamento', 459.00, 30, 1),
        (5, 'Switch Gigabit 8 Portas', 'Redes', 229.90, 18, 1),
        (6, 'Roteador Wi-Fi 6 AX3000', 'Redes', 499.00, 9, 1),
        (7, 'Headset Studio USB', 'Áudio', 279.00, 15, 1),
        (8, 'Webcam Full HD 1080p', 'Periféricos', 219.50, 0, 0),
        (9, 'Cabo Cat6 10m', 'Redes', 45.00, 85, 1),
        (10, 'Hub USB-C 7 em 1', 'Acessórios', 165.00, 20, 1);

      INSERT INTO pedidos VALUES
        (101, 1, 'pago', '2026-05-01', 20.00, 558.90),
        (102, 2, 'pago', '2026-05-03', 0.00, 1949.00),
        (103, 3, 'enviado', '2026-05-05', 25.00, 484.00),
        (104, 1, 'pago', '2026-05-08', 15.00, 474.00),
        (105, 4, 'pendente', '2026-05-10', 30.00, 1028.00),
        (106, 5, 'pago', '2026-05-11', 20.00, 369.90),
        (107, 6, 'cancelado', '2026-05-12', 25.00, 254.90),
        (108, 2, 'pago', '2026-05-14', 0.00, 728.90),
        (109, 7, 'enviado', '2026-05-16', 18.00, 297.00),
        (110, 4, 'pago', '2026-05-18', 0.00, 1490.00);

      INSERT INTO itens_pedido VALUES
        (1, 101, 1, 1, 349.90),
        (2, 101, 2, 1, 189.00),
        (3, 102, 3, 1, 1490.00),
        (4, 102, 4, 1, 459.00),
        (5, 103, 4, 1, 459.00),
        (6, 104, 4, 1, 459.00),
        (7, 105, 6, 2, 499.00),
        (8, 106, 1, 1, 349.90),
        (9, 107, 5, 1, 229.90),
        (10, 108, 6, 1, 499.00),
        (11, 108, 5, 1, 229.90),
        (12, 109, 7, 1, 279.00),
        (13, 110, 3, 1, 1490.00);
    `,
  },
  empresa: {
    id: "empresa",
    name: "Corporação NexusRH",
    description: "Departamentos, colaboradores, salários e projetos internos.",
    seedSql: `
      CREATE TABLE departamentos (
        id INTEGER PRIMARY KEY,
        nome TEXT NOT NULL,
        andar INTEGER NOT NULL,
        orcamento REAL NOT NULL
      );

      CREATE TABLE funcionarios (
        id INTEGER PRIMARY KEY,
        nome TEXT NOT NULL,
        cargo TEXT NOT NULL,
        departamento_id INTEGER NOT NULL REFERENCES departamentos(id),
        salario REAL NOT NULL,
        contratado_em TEXT NOT NULL,
        ativo INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE projetos (
        id INTEGER PRIMARY KEY,
        nome TEXT NOT NULL,
        departamento_id INTEGER NOT NULL REFERENCES departamentos(id),
        status TEXT NOT NULL,
        orcamento REAL NOT NULL
      );

      INSERT INTO departamentos VALUES
        (1, 'Engenharia de Software', 4, 480000),
        (2, 'Infraestrutura & Redes', 3, 320000),
        (3, 'Dados & Analytics', 5, 390000),
        (4, 'Segurança da Informação', 6, 290000);

      INSERT INTO funcionarios VALUES
        (1, 'Mariana Silva', 'Engenheira Sênior', 1, 14500, '2023-03-10', 1),
        (2, 'Lucas Ferreira', 'Desenvolvedor Pleno', 1, 9800, '2024-01-15', 1),
        (3, 'Rafael Oliveira', 'Arquiteto de Redes', 2, 13200, '2022-08-01', 1),
        (4, 'Camila Santos', 'Analista Linux', 2, 8600, '2024-06-20', 1),
        (5, 'Beatriz Almeida', 'Cientista de Dados', 3, 13800, '2023-09-04', 1),
        (6, 'Thiago Ribeiro', 'Engenheiro de Dados', 3, 11400, '2024-02-12', 1),
        (7, 'Juliana Rocha', 'Especialista AppSec', 4, 15200, '2022-11-08', 1),
        (8, 'Pedro Henrique', 'Desenvolvedor Júnior', 1, 5900, '2025-04-01', 1);

      INSERT INTO projetos VALUES
        (1, 'Migração Cloud Native', 2, 'em_andamento', 180000),
        (2, 'Portal Code Entry', 1, 'em_andamento', 240000),
        (3, 'Data Warehouse SQL', 3, 'concluido', 150000),
        (4, 'Auditoria Zero Trust', 4, 'em_andamento', 195000);
    `,
  },
};

const FORBIDDEN_PATTERNS = [
  /\battach\b/i,
  /\bdetach\b/i,
  /\bload_extension\b/i,
  /\bvacuum\b/i,
];

function splitSqlStatements(sql) {
  const statements = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      current += ch;
      if (ch === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      current += ch;
      if (ch === "*" && next === "/") {
        current += "/";
        i++;
        inBlockComment = false;
      }
      continue;
    }

    if (!inSingle && !inDouble) {
      if (ch === "-" && next === "-") {
        current += ch;
        inLineComment = true;
        continue;
      }
      if (ch === "/" && next === "*") {
        current += "/*";
        i++;
        inBlockComment = true;
        continue;
      }
    }

    if (ch === "'" && !inDouble) {
      current += ch;
      if (inSingle && next === "'") {
        current += "'";
        i++;
      } else {
        inSingle = !inSingle;
      }
      continue;
    }

    if (ch === '"' && !inSingle) {
      current += ch;
      inDouble = !inDouble;
      continue;
    }

    if (ch === ";" && !inSingle && !inDouble) {
      if (current.trim()) statements.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  if (current.trim()) statements.push(current.trim());
  return statements;
}

function inspectSchema(db) {
  const tables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    )
    .all();

  return tables.map(({ name }) => {
    const columns = db.prepare(`PRAGMA table_info("${name.replace(/"/g, '""')}")`).all();
    const fks = db.prepare(`PRAGMA foreign_key_list("${name.replace(/"/g, '""')}")`).all();
    const countRow = db.prepare(`SELECT COUNT(*) AS total FROM "${name.replace(/"/g, '""')}"`).get();
    return {
      name,
      rowCount: Number(countRow?.total || 0),
      columns: columns.map(col => ({
        name: col.name,
        type: col.type || "TEXT",
        notnull: Boolean(col.notnull),
        pk: Boolean(col.pk),
        fk: fks.find(f => f.from === col.name)
          ? `${fks.find(f => f.from === col.name).table}.${fks.find(f => f.from === col.name).to}`
          : null,
      })),
    };
  });
}

export function listDatasets() {
  return Object.values(DATASETS).map(ds => {
    const db = new DatabaseSync(":memory:");
    try {
      db.exec(ds.seedSql);
      return {
        id: ds.id,
        name: ds.name,
        description: ds.description,
        tables: inspectSchema(db),
      };
    } finally {
      db.close();
    }
  });
}

export function getDatasetSchema(datasetId = "ecommerce") {
  const ds = DATASETS[datasetId] || DATASETS.ecommerce;
  const db = new DatabaseSync(":memory:");
  try {
    db.exec(ds.seedSql);
    return {
      datasetId: ds.id,
      name: ds.name,
      description: ds.description,
      tables: inspectSchema(db),
    };
  } finally {
    db.close();
  }
}

export function executeSql({ datasetId = "ecommerce", query = "", setupSql = "" } = {}) {
  const ds = DATASETS[datasetId] || DATASETS.ecommerce;
  const rawQuery = String(query || "").trim();

  if (!rawQuery) {
    return {
      success: false,
      error: "Digite uma consulta SQL para executar.",
      columns: [],
      rows: [],
      rowCount: 0,
      changes: 0,
      executionTimeMs: 0,
      schema: getDatasetSchema(ds.id).tables,
    };
  }

  for (const pat of FORBIDDEN_PATTERNS) {
    if (pat.test(rawQuery)) {
      return {
        success: false,
        error: "Instrução bloqueada pela sandbox educacional (ATTACH, DETACH, LOAD_EXTENSION ou VACUUM não são permitidos).",
        columns: [],
        rows: [],
        rowCount: 0,
        changes: 0,
        executionTimeMs: 0,
        schema: getDatasetSchema(ds.id).tables,
      };
    }
  }

  const db = new DatabaseSync(":memory:");
  const startedAt = performance.now();

  try {
    db.exec(ds.seedSql);
    if (setupSql && String(setupSql).trim()) {
      db.exec(String(setupSql));
    }

    const statements = splitSqlStatements(rawQuery);
    if (statements.length === 0) {
      throw new Error("Nenhuma instrução SQL válida encontrada.");
    }

    let finalColumns = [];
    let finalRows = [];
    let totalChanges = 0;
    let truncated = false;
    const messages = [];

    for (const stmtText of statements) {
      if (/^\s*pragma\b/i.test(stmtText) && !/^\s*pragma\s+table_info/i.test(stmtText)) {
        throw new Error("Apenas PRAGMA table_info é permitido na sandbox.");
      }

      const stmt = db.prepare(stmtText);
      const isRead =
        /^\s*(select|with|explain|pragma)\b/i.test(stmtText) ||
        /\breturning\b/i.test(stmtText);

      if (isRead) {
        const allRows = stmt.all();
        const cols = allRows.length > 0 ? Object.keys(allRows[0]) : stmt.columns().map(c => c.name);
        finalColumns = cols;
        if (allRows.length > 500) {
          finalRows = allRows.slice(0, 500);
          truncated = true;
        } else {
          finalRows = allRows;
        }
        messages.push(`${allRows.length} linha(s) retornada(s).`);
      } else {
        const info = stmt.run();
        const ch = Number(info?.changes || 0);
        totalChanges += ch;
        messages.push(`Instrução executada (${ch} linha(s) afetada(s)).`);
      }
    }

    const elapsed = Number((performance.now() - startedAt).toFixed(2));
    const schema = inspectSchema(db);

    return {
      success: true,
      columns: finalColumns,
      rows: finalRows,
      rowCount: finalRows.length,
      changes: totalChanges,
      truncated,
      messages,
      executionTimeMs: elapsed,
      schema,
    };
  } catch (err) {
    const elapsed = Number((performance.now() - startedAt).toFixed(2));
    let schema = [];
    try {
      schema = inspectSchema(db);
    } catch {
      schema = [];
    }
    return {
      success: false,
      error: err?.message || String(err),
      columns: [],
      rows: [],
      rowCount: 0,
      changes: 0,
      executionTimeMs: elapsed,
      schema,
    };
  } finally {
    db.close();
  }
}
