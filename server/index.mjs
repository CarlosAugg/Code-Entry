import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CodeEntryDatabase } from "./db.mjs";
import { handleApiRequest } from "./routes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
export const RUNTIME_FILE_PATH = path.join(ROOT_DIR, "data", ".server-runtime.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

function serveStatic(req, res) {
  if (!fs.existsSync(DIST_DIR)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Frontend ainda não compilado. Execute 'npm run build' ou 'npm run dev'.");
    return;
  }

  const reqPath = new URL(req.url || "/", "http://127.0.0.1").pathname;
  const cleanRel = reqPath === "/" ? "index.html" : reqPath.replace(/^\/+/, "");
  let targetPath = path.resolve(DIST_DIR, cleanRel);

  // Protege contra path traversal fora de dist/
  if (!targetPath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(targetPath) || fs.statSync(targetPath).isDirectory()) {
    // Fallback SPA para rotas do React Router
    targetPath = path.join(DIST_DIR, "index.html");
  }

  const ext = path.extname(targetPath).toLowerCase();
  const mime = MIME_TYPES[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": mime });
  fs.createReadStream(targetPath).pipe(res);
}

export function createServer({ port = Number(process.env.PORT) || 3000, dbPath } = {}) {
  const db = new CodeEntryDatabase(dbPath);
  const server = http.createServer(async (req, res) => {
    const pathname = new URL(req.url || "/", "http://127.0.0.1").pathname;
    if (pathname.startsWith("/api/")) {
      await handleApiRequest(req, res, db);
      return;
    }
    serveStatic(req, res);
  });

  server.on("close", () => {
    db.close();
  });

  return { server, db, port };
}

function tryListenOnce(server, host, port) {
  return new Promise((resolve, reject) => {
    const onError = err => {
      server.off("listening", onListening);
      reject(err);
    };
    const onListening = () => {
      server.off("error", onError);
      const addr = server.address();
      resolve(typeof addr === "object" && addr ? addr.port : port);
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, host);
  });
}

export async function listenWithFallback(
  server,
  { host = "127.0.0.1", preferredPort = 3000, strictPort = false, maxAttempts = 50 } = {}
) {
  if (strictPort) {
    return tryListenOnce(server, host, preferredPort);
  }

  for (let offset = 0; offset <= maxAttempts; offset++) {
    const candidate = preferredPort + offset;
    try {
      return await tryListenOnce(server, host, candidate);
    } catch (err) {
      if (err?.code !== "EADDRINUSE") {
        throw err;
      }
    }
  }

  // Fallback final: solicita porta livre efêmera ao sistema operacional
  return tryListenOnce(server, host, 0);
}

function writeRuntimeFile(port) {
  try {
    fs.mkdirSync(path.dirname(RUNTIME_FILE_PATH), { recursive: true });
    fs.writeFileSync(
      RUNTIME_FILE_PATH,
      JSON.stringify(
        {
          pid: process.pid,
          port,
          url: `http://127.0.0.1:${port}`,
          startedAt: new Date().toISOString(),
        },
        null,
        2
      ),
      "utf8"
    );
  } catch {
    // Não interrompe inicialização se falhar gravação auxiliar
  }
}

function removeOwnRuntimeFile() {
  try {
    if (!fs.existsSync(RUNTIME_FILE_PATH)) return;
    const raw = JSON.parse(fs.readFileSync(RUNTIME_FILE_PATH, "utf8"));
    if (raw?.pid === process.pid) {
      fs.unlinkSync(RUNTIME_FILE_PATH);
    }
  } catch {
    // Ignora falha na limpeza do runtime file
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const hasExplicitPort = Boolean(process.env.PORT && String(process.env.PORT).trim());
  const isApiOnly = process.env.API_ONLY === "1";
  const preferredPort = hasExplicitPort ? Number(process.env.PORT) : isApiOnly ? 3001 : 3000;
  const dbPath = process.env.CODE_ENTRY_DB_PATH || undefined;
  const { server } = createServer({ port: preferredPort, dbPath });

  listenWithFallback(server, {
    host: "127.0.0.1",
    preferredPort,
    strictPort: hasExplicitPort || isApiOnly,
  })
    .then(actualPort => {
      if (!isApiOnly && process.env.CODE_ENTRY_NO_RUNTIME_FILE !== "1") {
        writeRuntimeFile(actualPort);
      }
      console.log(`[Code Entry] Servidor rodando em http://127.0.0.1:${actualPort}`);
    })
    .catch(err => {
      console.error(`[Code Entry] Erro ao iniciar servidor:`, err?.message || err);
      process.exit(1);
    });

  const gracefulShutdown = () => {
    removeOwnRuntimeFile();
    server.close(() => {
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 1500).unref();
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
  process.on("exit", removeOwnRuntimeFile);
}
