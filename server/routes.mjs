import { executeSql, getDatasetSchema, listDatasets } from "./sqlSandbox.mjs";

const MAX_BODY_BYTES = 2 * 1024 * 1024;

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Payload excedeu o limite de 2MB."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("JSON inválido no corpo da requisição."));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, data) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

export async function handleApiRequest(req, res, db) {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  const pathname = url.pathname;
  const method = (req.method || "GET").toUpperCase();

  try {
    if (method === "GET" && pathname === "/api/health") {
      return sendJson(res, 200, {
        ok: true,
        service: "code-entry-api",
        app: "code-entry",
        pid: process.pid,
      });
    }

    if (method === "GET" && pathname === "/api/bootstrap") {
      return sendJson(res, 200, db.getBootstrap());
    }

    if (method === "PUT" && pathname === "/api/settings") {
      const body = await readJsonBody(req);
      return sendJson(res, 200, { settings: db.updateSettings(body) });
    }

    if (method === "POST" && pathname === "/api/study-time") {
      const body = await readJsonBody(req);
      const settings = db.addStudySeconds(body.seconds, body.date);
      return sendJson(res, 200, { settings, dailyStudyLog: db.getDailyStudyLogMap() });
    }

    if (method === "POST" && pathname === "/api/progress/lesson") {
      const body = await readJsonBody(req);
      if (!body.lessonId || !body.trackId) {
        return sendJson(res, 400, { error: "lessonId e trackId são obrigatórios." });
      }
      const result = db.recordLessonAttempt(body);
      return sendJson(res, 200, result);
    }

    if (method === "POST" && pathname === "/api/progress/challenge") {
      const body = await readJsonBody(req);
      if (!body.challengeId || !body.trackId) {
        return sendJson(res, 400, { error: "challengeId e trackId são obrigatórios." });
      }
      const result = db.recordChallengeAttempt(body);
      return sendJson(res, 200, result);
    }

    if (method === "PUT" && pathname.startsWith("/api/drafts/")) {
      const draftKey = decodeURIComponent(pathname.slice("/api/drafts/".length));
      const body = await readJsonBody(req);
      return sendJson(res, 200, db.saveDraft(draftKey, body.code || "", body.stdin || ""));
    }

    if (method === "DELETE" && pathname.startsWith("/api/drafts/")) {
      const draftKey = decodeURIComponent(pathname.slice("/api/drafts/".length));
      return sendJson(res, 200, db.deleteDraft(draftKey));
    }

    if (method === "POST" && pathname === "/api/history") {
      const body = await readJsonBody(req);
      const item = db.addHistoryEvent(body);
      return sendJson(res, 201, { item });
    }

    if (method === "POST" && pathname === "/api/achievements/unlock") {
      const body = await readJsonBody(req);
      const newlyUnlocked = db.unlockAchievements(Array.isArray(body.ids) ? body.ids : []);
      return sendJson(res, 200, { newlyUnlocked, achievements: db.getAchievementsMap() });
    }

    if (method === "PUT" && pathname.startsWith("/api/workspace/")) {
      const key = decodeURIComponent(pathname.slice("/api/workspace/".length));
      const body = await readJsonBody(req);
      return sendJson(res, 200, db.saveWorkspaceState(key, body.state ?? body));
    }

    if (method === "GET" && pathname === "/api/sql/datasets") {
      return sendJson(res, 200, { datasets: listDatasets() });
    }

    if (method === "GET" && pathname === "/api/sql/schema") {
      const datasetId = url.searchParams.get("dataset") || "ecommerce";
      return sendJson(res, 200, getDatasetSchema(datasetId));
    }

    if (method === "POST" && pathname === "/api/sql/execute") {
      const body = await readJsonBody(req);
      const result = executeSql(body);
      return sendJson(res, 200, result);
    }

    if (method === "GET" && pathname === "/api/backup") {
      return sendJson(res, 200, db.exportBackup());
    }

    if (method === "POST" && pathname === "/api/restore") {
      const body = await readJsonBody(req);
      const restored = db.restoreBackup(body);
      return sendJson(res, 200, restored);
    }

    if (method === "POST" && pathname === "/api/reset") {
      const body = await readJsonBody(req);
      const next = db.resetAll({ preserveSettings: body?.preserveSettings !== false });
      return sendJson(res, 200, next);
    }

    return sendJson(res, 404, { error: "Endpoint não encontrado." });
  } catch (err) {
    return sendJson(res, 500, { error: err?.message || "Erro interno do servidor." });
  }
}
