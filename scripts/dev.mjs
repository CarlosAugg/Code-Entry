import { spawn } from "node:child_process";

const isWin = process.platform === "win32";
const apiEnv = { ...process.env, PORT: "3001", API_ONLY: "1" };

const apiProc = spawn(process.execPath, ["server/index.mjs"], {
  stdio: "inherit",
  env: apiEnv,
});

const viteCmd = isWin ? "npx.cmd" : "npx";
const viteProc = spawn(viteCmd, ["vite", "--host", "127.0.0.1", "--port", "5173"], {
  stdio: "inherit",
  shell: isWin,
  env: process.env,
});

function shutdown(code = 0) {
  if (!apiProc.killed) apiProc.kill();
  if (!viteProc.killed) viteProc.kill();
  process.exit(code);
}

apiProc.on("exit", code => {
  if (code !== null && code !== 0) shutdown(code);
});

viteProc.on("exit", code => {
  if (code !== null && code !== 0) shutdown(code);
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
