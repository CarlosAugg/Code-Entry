import type { LinuxSnapshotData } from "../../types/curriculum";
import { VirtualFileSystem, type VfsNode } from "./vfs";

export interface LinuxLine {
  text: string;
  tone: "normal" | "accent" | "muted" | "error" | "success" | "cmd";
}

export interface LinuxExecResult {
  success: boolean;
  lines: LinuxLine[];
  outputText: string;
  clearRequested?: boolean;
  snapshot: LinuxSnapshotData;
}

interface ParsedStage {
  command: string;
  args: string[];
  flags: string[];
  redirectOut?: { path: string; append: boolean };
}

const KNOWN_COMMANDS = [
  "help", "clear", "pwd", "ls", "cd", "mkdir", "rmdir", "touch", "cat", "echo",
  "cp", "mv", "rm", "tree", "find", "grep", "head", "tail", "wc", "sort", "uniq",
  "cut", "chmod", "stat", "env", "export", "alias", "history", "whoami", "id",
  "hostname", "uname", "date", "du", "df", "ps", "kill", "ip", "ping", "curl",
  "tar", "man",
];

function tokenizeShell(raw: string): { value: string; singleQuoted: boolean }[] {
  const tokens: { value: string; singleQuoted: boolean }[] = [];
  let cur = "";
  let inTok = false;
  let quote: "'" | '"' | null = null;
  let hadSingle = false;
  let hadDouble = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (quote === "'") {
      if (ch === "'") quote = null;
      else cur += ch;
      inTok = true;
      hadSingle = true;
      continue;
    }
    if (quote === '"') {
      if (ch === "\\" && i + 1 < raw.length) {
        const next = raw[i + 1];
        if (next === '"' || next === "\\" || next === "$") {
          cur += next;
          i++;
        } else {
          cur += ch + next;
          i++;
        }
      } else if (ch === '"') {
        quote = null;
      } else {
        cur += ch;
      }
      inTok = true;
      hadDouble = true;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      inTok = true;
      if (ch === "'") hadSingle = true;
      else hadDouble = true;
      continue;
    }
    if (/\s/.test(ch)) {
      if (inTok) {
        tokens.push({ value: cur, singleQuoted: hadSingle && !hadDouble });
        cur = "";
        inTok = false;
        hadSingle = false;
        hadDouble = false;
      }
      continue;
    }
    cur += ch;
    inTok = true;
  }
  if (inTok) tokens.push({ value: cur, singleQuoted: hadSingle && !hadDouble });
  return tokens;
}

function expandBraces(token: string): string[] {
  const m = token.match(/^(.*)\{([^{}]+)\}(.*)$/);
  if (!m) return [token];
  const [, pre, body, post] = m;
  if (!body.includes(",")) return [token];
  return body.split(",").flatMap(part => expandBraces(`${pre}${part.trim()}${post}`));
}

function splitOutsideQuotes(raw: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quote: string | null = null;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if ((ch === "'" || ch === '"') && raw[i - 1] !== "\\") {
      quote = quote === ch ? null : quote || ch;
      cur += ch;
      continue;
    }
    if (!quote && raw.slice(i, i + sep.length) === sep) {
      out.push(cur.trim());
      cur = "";
      i += sep.length - 1;
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function extractFlags(args: string[]): string[] {
  const flags: string[] = [];
  for (const a of args) {
    if (a.startsWith("--") && a.length > 2) {
      flags.push(a.slice(2));
    } else if (a.startsWith("-") && a.length > 1) {
      for (const ch of a.slice(1)) flags.push(ch);
    } else if (a === "aux") {
      flags.push("a", "u", "x");
    }
  }
  return flags;
}

export class LinuxShellEngine {
  fs: VirtualFileSystem;
  cwd = "/home/aluno";
  home = "/home/aluno";
  user = "aluno";
  host = "code-entry-srv";
  env: Record<string, string>;
  aliases: Record<string, string> = {};
  history: string[] = [];
  processes: { pid: number; user: string; cpu: string; mem: string; command: string }[];

  constructor(serializedState?: { fs?: VfsNode; cwd?: string; env?: Record<string, string> }) {
    this.fs = new VirtualFileSystem(serializedState?.fs || null);
    this.cwd = serializedState?.cwd || "/home/aluno";
    this.env = {
      USER: "aluno",
      HOME: "/home/aluno",
      SHELL: "/bin/bash",
      HOSTNAME: "code-entry-srv",
      LANG: "pt_BR.UTF-8",
      ...(serializedState?.env || {}),
    };
    this.processes = [
      { pid: 101, user: "root", cpu: "0.1", mem: "0.8", command: "/sbin/init" },
      { pid: 412, user: "root", cpu: "0.4", mem: "1.5", command: "/usr/sbin/sshd -D" },
      { pid: 880, user: "www-data", cpu: "0.9", mem: "2.2", command: "nginx: worker process" },
      { pid: 2140, user: "aluno", cpu: "0.2", mem: "0.6", command: "-bash" },
      { pid: 3301, user: "aluno", cpu: "14.2", mem: "3.4", command: "python3 worker_travado.py" },
    ];
  }

  reset(): void {
    this.fs.reset();
    this.cwd = "/home/aluno";
    this.aliases = {};
    this.history = [];
    this.env = {
      USER: "aluno",
      HOME: "/home/aluno",
      SHELL: "/bin/bash",
      HOSTNAME: "code-entry-srv",
      LANG: "pt_BR.UTF-8",
    };
  }

  serialize(): { fs: VfsNode; cwd: string; env: Record<string, string> } {
    return {
      fs: this.fs.serialize(),
      cwd: this.cwd,
      env: { ...this.env },
    };
  }

  prompt(): string {
    const shortCwd = this.cwd === this.home ? "~" : this.cwd.startsWith(`${this.home}/`) ? `~${this.cwd.slice(this.home.length)}` : this.cwd;
    return `${this.user}@${this.host}:${shortCwd}$`;
  }

  autocomplete(input: string): string | null {
    const parts = input.split(/\s+/);
    const last = parts[parts.length - 1] || "";
    if (!last) return null;
    if (parts.length === 1) {
      const hits = KNOWN_COMMANDS.filter(c => c.startsWith(last));
      if (hits.length === 1) return hits[0] + " ";
      return null;
    }
    const dirPart = last.includes("/") ? last.slice(0, last.lastIndexOf("/") + 1) : "";
    const prefix = last.includes("/") ? last.slice(last.lastIndexOf("/") + 1) : last;
    const baseDir = this.fs.normalizePath(dirPart || ".", this.cwd, this.home);
    const node = this.fs.getNode(baseDir);
    if (!node || node.type !== "dir" || !node.children) return null;
    const matches = Object.keys(node.children).filter(k => k.startsWith(prefix));
    if (matches.length === 1) {
      const m = matches[0];
      const suffix = node.children[m].type === "dir" ? "/" : "";
      parts[parts.length - 1] = `${dirPart}${m}${suffix}`;
      return parts.join(" ");
    }
    return null;
  }

  execute(rawCommand: string): LinuxExecResult {
    const trimmed = String(rawCommand || "").trim();
    const lines: LinuxLine[] = [];
    const allStages: { command: string; args: string[]; flags: string[] }[] = [];
    let clearRequested = false;
    let success = true;

    if (!trimmed) {
      return {
        success: true,
        lines: [],
        outputText: "",
        snapshot: this.makeSnapshot(trimmed, allStages),
      };
    }

    this.history.push(trimmed);

    // Divide por && ou ;
    const chain = splitOutsideQuotes(trimmed, "&&").flatMap(seg => splitOutsideQuotes(seg, ";"));

    for (const cmdLine of chain) {
      if (!cmdLine) continue;
      if (cmdLine === "clear") {
        clearRequested = true;
        continue;
      }
      const pipeSegments = splitOutsideQuotes(cmdLine, "|");
      let stdinPipe = "";
      let segSuccess = true;

      for (let sIdx = 0; sIdx < pipeSegments.length; sIdx++) {
        const parsed = this.parseStage(pipeSegments[sIdx]);
        if (!parsed) continue;
        allStages.push({ command: parsed.command, args: parsed.args, flags: parsed.flags });

        const stageRes = this.runStage(parsed, sIdx > 0 ? stdinPipe : null);
        if (!stageRes.ok) {
          segSuccess = false;
          success = false;
          lines.push({ text: stageRes.out, tone: "error" });
          break;
        }

        if (parsed.redirectOut) {
          const targetAbs = this.fs.normalizePath(parsed.redirectOut.path, this.cwd, this.home);
          const writeErr = this.writeToFile(targetAbs, stageRes.out, parsed.redirectOut.append);
          if (writeErr) {
            segSuccess = false;
            success = false;
            lines.push({ text: writeErr, tone: "error" });
            break;
          }
          stdinPipe = "";
        } else if (sIdx < pipeSegments.length - 1) {
          stdinPipe = stageRes.out;
        } else if (stageRes.out) {
          for (const l of stageRes.out.split("\n")) {
            lines.push({ text: l, tone: stageRes.tone || "normal" });
          }
        }
      }

      if (!segSuccess && cmdLine.includes("&&")) break;
    }

    const outputText = lines.map(l => l.text).join("\n");
    return {
      success,
      lines,
      outputText,
      clearRequested,
      snapshot: this.makeSnapshot(trimmed, allStages),
    };
  }

  private makeSnapshot(lastCommand: string, stages: { command: string; args: string[]; flags: string[] }[]): LinuxSnapshotData {
    return {
      cwd: this.cwd,
      lastCommand,
      stages,
      exists: (p: string) => this.fs.exists(p, this.cwd),
      read: (p: string) => this.fs.readFile(p, this.cwd),
      isExecutable: (p: string) => this.fs.isExecutable(p, this.cwd),
    };
  }

  private expandEnv(val: string): string {
    return val
      .replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, k) => this.env[k] ?? "")
      .replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, k) => this.env[k] ?? "");
  }

  private parseStage(rawStage: string): ParsedStage | null {
    const rawTokens = tokenizeShell(rawStage);
    if (rawTokens.length === 0) return null;

    // Resolve alias no primeiro token
    const firstVal = rawTokens[0].value;
    let expandedTokens = rawTokens;
    if (this.aliases[firstVal]) {
      expandedTokens = [...tokenizeShell(this.aliases[firstVal]), ...rawTokens.slice(1)];
    }

    const finalTokens: string[] = [];
    for (const tok of expandedTokens) {
      const val = tok.singleQuoted ? tok.value : this.expandEnv(tok.value);
      for (const b of expandBraces(val)) {
        finalTokens.push(b);
      }
    }

    let redirectOut: { path: string; append: boolean } | undefined;
    const cleaned: string[] = [];

    for (let i = 0; i < finalTokens.length; i++) {
      const t = finalTokens[i];
      if (t === ">" || t === ">>") {
        const next = finalTokens[i + 1];
        if (next) {
          redirectOut = { path: next, append: t === ">>" };
          i++;
        }
        continue;
      }
      if (t.startsWith(">>") && t.length > 2) {
        redirectOut = { path: t.slice(2), append: true };
        continue;
      }
      if (t.startsWith(">") && t.length > 1) {
        redirectOut = { path: t.slice(1), append: false };
        continue;
      }
      cleaned.push(t);
    }

    if (cleaned.length === 0) return null;
    const command = cleaned[0];
    const args = cleaned.slice(1);
    return {
      command,
      args,
      flags: extractFlags(args),
      redirectOut,
    };
  }

  private writeToFile(absPath: string, content: string, append: boolean): string | null {
    const { parent, name } = this.fs.getParentAndName(absPath);
    if (!parent || !parent.children || !name) {
      return `bash: ${absPath}: Diretório pai inexistente`;
    }
    const existing = parent.children[name];
    if (existing && existing.type === "dir") {
      return `bash: ${absPath}: É um diretório`;
    }
    const text = content.endsWith("\n") || content === "" ? content : `${content}\n`;
    if (append && existing) {
      existing.content = (existing.content || "") + text;
      existing.size = existing.content.length;
    } else {
      parent.children[name] = this.fs.file(text);
    }
    return null;
  }

  private runStage(stage: ParsedStage, stdin: string | null): { ok: boolean; out: string; tone?: LinuxLine["tone"] } {
    const { command, args, flags } = stage;
    const posArgs = args.filter(a => !a.startsWith("-"));
    const hasFlag = (f: string) => flags.includes(f);

    // Execução de script ./script.sh ou ~/.../script.sh
    if (command.startsWith("./") || command.startsWith("/") || command.startsWith("~/")) {
      const target = this.fs.normalizePath(command, this.cwd, this.home);
      const node = this.fs.getNode(target);
      if (!node || node.type !== "file") return { ok: false, out: `bash: ${command}: Arquivo ou diretório inexistente` };
      if (!node.executable) return { ok: false, out: `bash: ${command}: Permissão negada (use chmod +x)` };
      const scriptLines = (node.content || "").split("\n").filter(l => l.trim() && !l.trim().startsWith("#"));
      const outputs: string[] = [];
      for (const sl of scriptLines) {
        const sub = this.execute(sl);
        if (sub.outputText) outputs.push(sub.outputText);
      }
      return { ok: true, out: outputs.join("\n"), tone: "success" };
    }

    switch (command) {
      case "help":
        return {
          ok: true,
          tone: "accent",
          out: [
            "Comandos disponíveis no Code Entry Linux:",
            "  Navegação:    pwd, ls [-la], cd, tree, find",
            "  Arquivos:     mkdir [-p], touch, cat, echo, cp [-r], mv, rm [-r], chmod, stat",
            "  Filtros/Pipe: grep [-i -n], head [-n N], tail [-n N], wc [-l], sort, uniq, cut",
            "  Sistema:      whoami, id, hostname, uname [-a], date, env, export, alias, ps, kill",
            "  Rede/Backup:  ip [a|route], ping [-c N], curl [-I], tar [-czf|-tf], df -h, du -h",
          ].join("\n"),
        };

      case "pwd":
        return { ok: true, out: this.cwd };

      case "whoami":
        return { ok: true, out: this.user };

      case "id":
        return { ok: true, out: `uid=1000(${this.user}) gid=1000(${this.user}) grupos=1000(${this.user}),27(sudo)` };

      case "hostname":
        return { ok: true, out: this.host };

      case "uname":
        return {
          ok: true,
          out: hasFlag("a")
            ? `Linux ${this.host} 6.8.0-codeentry #1 SMP x86_64 GNU/Linux`
            : "Linux",
        };

      case "date":
        return { ok: true, out: new Date().toString() };

      case "cd": {
        const dest = posArgs[0] || "~";
        const target = this.fs.normalizePath(dest, this.cwd, this.home);
        const node = this.fs.getNode(target);
        if (!node) return { ok: false, out: `cd: ${dest}: Arquivo ou diretório inexistente` };
        if (node.type !== "dir") return { ok: false, out: `cd: ${dest}: Não é um diretório` };
        this.cwd = target;
        return { ok: true, out: "" };
      }

      case "ls": {
        const targetRaw = posArgs[0] || ".";
        const target = this.fs.normalizePath(targetRaw, this.cwd, this.home);
        const node = this.fs.getNode(target);
        if (!node) return { ok: false, out: `ls: não foi possível acessar '${targetRaw}': Arquivo ou diretório inexistente` };
        if (node.type === "file") return { ok: true, out: posArgs[0] || target };
        const entries = Object.entries(node.children || {}).filter(([name]) => hasFlag("a") || !name.startsWith("."));
        entries.sort(([a], [b]) => a.localeCompare(b));
        if (hasFlag("l")) {
          const rows = entries.map(([name, n]) => {
            const size = String(n.type === "dir" ? 4096 : n.size ?? (n.content?.length || 0)).padStart(5, " ");
            return `${n.permissions} 1 ${this.user} ${this.user} ${size} ${n.modifiedAt || "Nov 19 10:00"} ${name}${n.type === "dir" ? "/" : ""}`;
          });
          return { ok: true, out: rows.join("\n") };
        }
        return {
          ok: true,
          out: entries.map(([name, n]) => (n.type === "dir" ? `${name}/` : name)).join("  "),
        };
      }

      case "mkdir": {
        if (!posArgs.length) return { ok: false, out: "mkdir: falta operando" };
        for (const arg of posArgs) {
          const abs = this.fs.normalizePath(arg, this.cwd, this.home);
          if (hasFlag("p")) {
            const parts = abs.split("/").filter(Boolean);
            let cur: VfsNode = this.fs.root;
            for (const part of parts) {
              cur.children = cur.children || {};
              if (!cur.children[part]) cur.children[part] = this.fs.dir();
              else if (cur.children[part].type !== "dir") {
                return { ok: false, out: `mkdir: '${part}' já existe como arquivo` };
              }
              cur = cur.children[part];
            }
          } else {
            const { parent, name } = this.fs.getParentAndName(abs);
            if (!parent || !parent.children) return { ok: false, out: `mkdir: impossível criar '${arg}': Diretório pai inexistente` };
            if (parent.children[name]) return { ok: false, out: `mkdir: impossível criar '${arg}': Arquivo já existe` };
            parent.children[name] = this.fs.dir();
          }
        }
        return { ok: true, out: "" };
      }

      case "rmdir": {
        if (!posArgs.length) return { ok: false, out: "rmdir: falta operando" };
        const abs = this.fs.normalizePath(posArgs[0], this.cwd, this.home);
        const { parent, name } = this.fs.getParentAndName(abs);
        const node = parent?.children?.[name];
        if (!node || node.type !== "dir") return { ok: false, out: `rmdir: '${posArgs[0]}': Não é um diretório` };
        if (Object.keys(node.children || {}).length > 0) return { ok: false, out: `rmdir: '${posArgs[0]}': Diretório não está vazio` };
        delete parent!.children![name];
        return { ok: true, out: "" };
      }

      case "touch": {
        if (!posArgs.length) return { ok: false, out: "touch: falta operando de arquivo" };
        for (const arg of posArgs) {
          const abs = this.fs.normalizePath(arg, this.cwd, this.home);
          const { parent, name } = this.fs.getParentAndName(abs);
          if (!parent || !parent.children) return { ok: false, out: `touch: impossível tocar '${arg}': Diretório inexistente` };
          if (!parent.children[name]) parent.children[name] = this.fs.file("");
        }
        return { ok: true, out: "" };
      }

      case "echo":
        return { ok: true, out: args.join(" ") };

      case "cat": {
        if (!posArgs.length && stdin !== null) return { ok: true, out: stdin };
        if (!posArgs.length) return { ok: false, out: "cat: informe o arquivo" };
        const chunks: string[] = [];
        for (const arg of posArgs) {
          const abs = this.fs.normalizePath(arg, this.cwd, this.home);
          const node = this.fs.getNode(abs);
          if (!node) return { ok: false, out: `cat: ${arg}: Arquivo ou diretório inexistente` };
          if (node.type === "dir") return { ok: false, out: `cat: ${arg}: É um diretório` };
          chunks.push(node.content || "");
        }
        return { ok: true, out: chunks.join("\n").replace(/\n$/, "") };
      }

      case "cp": {
        if (posArgs.length < 2) return { ok: false, out: "cp: faltam origem e destino" };
        const srcAbs = this.fs.normalizePath(posArgs[0], this.cwd, this.home);
        const dstRaw = posArgs[1];
        const srcNode = this.fs.getNode(srcAbs);
        if (!srcNode) return { ok: false, out: `cp: '${posArgs[0]}': Arquivo inexistente` };
        if (srcNode.type === "dir" && !hasFlag("r")) return { ok: false, out: `cp: -r não especificado; omitindo diretório '${posArgs[0]}'` };

        const dstAbs = this.fs.normalizePath(dstRaw, this.cwd, this.home);
        const existingDst = this.fs.getNode(dstAbs);
        if (existingDst && existingDst.type === "dir") {
          const srcName = srcAbs.split("/").pop()!;
          existingDst.children = existingDst.children || {};
          existingDst.children[srcName] = this.fs.cloneNode(srcNode);
          return { ok: true, out: "" };
        }
        const { parent, name } = this.fs.getParentAndName(dstAbs);
        if (!parent || !parent.children) return { ok: false, out: `cp: diretório destino inválido` };
        parent.children[name] = this.fs.cloneNode(srcNode);
        return { ok: true, out: "" };
      }

      case "mv": {
        if (posArgs.length < 2) return { ok: false, out: "mv: faltam origem e destino" };
        const srcAbs = this.fs.normalizePath(posArgs[0], this.cwd, this.home);
        const dstAbs = this.fs.normalizePath(posArgs[1], this.cwd, this.home);
        const { parent: srcParent, name: srcName } = this.fs.getParentAndName(srcAbs);
        const srcNode = srcParent?.children?.[srcName];
        if (!srcNode) return { ok: false, out: `mv: '${posArgs[0]}': Arquivo inexistente` };

        const existingDst = this.fs.getNode(dstAbs);
        if (existingDst && existingDst.type === "dir") {
          existingDst.children = existingDst.children || {};
          existingDst.children[srcName] = srcNode;
        } else {
          const { parent: dstParent, name: dstName } = this.fs.getParentAndName(dstAbs);
          if (!dstParent || !dstParent.children) return { ok: false, out: `mv: destino inválido` };
          dstParent.children[dstName] = srcNode;
        }
        delete srcParent!.children![srcName];
        return { ok: true, out: "" };
      }

      case "rm": {
        if (!posArgs.length) return { ok: false, out: "rm: falta operando" };
        for (const arg of posArgs) {
          const abs = this.fs.normalizePath(arg, this.cwd, this.home);
          if (abs === "/" || abs === this.home) return { ok: false, out: `rm: operação protegida para '${abs}'` };
          const { parent, name } = this.fs.getParentAndName(abs);
          const node = parent?.children?.[name];
          if (!node) {
            if (hasFlag("f")) continue;
            return { ok: false, out: `rm: '${arg}': Arquivo inexistente` };
          }
          if (node.type === "dir" && !hasFlag("r")) {
            return { ok: false, out: `rm: não foi possível remover '${arg}': É um diretório (use -r)` };
          }
          delete parent!.children![name];
        }
        return { ok: true, out: "" };
      }

      case "tree": {
        const start = this.fs.normalizePath(posArgs[0] || ".", this.cwd, this.home);
        const root = this.fs.getNode(start);
        if (!root) return { ok: false, out: `tree: '${posArgs[0] || "."}' inexistente` };
        const linesOut = [posArgs[0] || "."];
        const walk = (n: VfsNode, prefix: string) => {
          const items = Object.entries(n.children || {}).sort(([a], [b]) => a.localeCompare(b));
          items.forEach(([k, child], idx) => {
            const isLast = idx === items.length - 1;
            linesOut.push(`${prefix}${isLast ? "└── " : "├── "}${k}${child.type === "dir" ? "/" : ""}`);
            if (child.type === "dir") walk(child, prefix + (isLast ? "    " : "│   "));
          });
        };
        if (root.type === "dir") walk(root, "");
        return { ok: true, out: linesOut.join("\n") };
      }

      case "find": {
        const baseRaw = posArgs[0] || ".";
        const base = this.fs.normalizePath(baseRaw, this.cwd, this.home);
        const root = this.fs.getNode(base);
        if (!root) return { ok: false, out: `find: '${baseRaw}': Arquivo ou diretório inexistente` };
        const nameIdx = args.indexOf("-name");
        const namePat = nameIdx >= 0 ? args[nameIdx + 1] : null;
        const typeIdx = args.indexOf("-type");
        const typeFilter = typeIdx >= 0 ? args[typeIdx + 1] : null;
        const regex = namePat ? new RegExp("^" + namePat.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$") : null;
        const hits: string[] = [];
        const walk = (n: VfsNode, curPath: string) => {
          const baseName = curPath.split("/").pop() || "";
          const matchType = !typeFilter || (typeFilter === "d" && n.type === "dir") || (typeFilter === "f" && n.type === "file");
          const matchName = !regex || regex.test(baseName);
          if (matchType && matchName) hits.push(curPath);
          if (n.type === "dir") {
            for (const [k, ch] of Object.entries(n.children || {})) {
              walk(ch, curPath === "/" ? `/${k}` : `${curPath}/${k}`);
            }
          }
        };
        walk(root, base);
        return { ok: true, out: hits.join("\n") };
      }

      case "grep": {
        if (!posArgs.length) return { ok: false, out: "grep: informe o padrão de busca" };
        const pattern = posArgs[0];
        let text = stdin ?? "";
        if (posArgs[1]) {
          const abs = this.fs.normalizePath(posArgs[1], this.cwd, this.home);
          const content = this.fs.readFile(abs, this.cwd);
          if (content === null) return { ok: false, out: `grep: ${posArgs[1]}: Arquivo inexistente` };
          text = content;
        }
        const re = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), hasFlag("i") ? "i" : "");
        const linesAll = text.split("\n");
        const matched: string[] = [];
        linesAll.forEach((l, idx) => {
          const isMatch = re.test(l);
          if (hasFlag("v") ? !isMatch : isMatch) {
            matched.push(hasFlag("n") ? `${idx + 1}:${l}` : l);
          }
        });
        if (hasFlag("c")) return { ok: true, out: String(matched.length) };
        return { ok: true, out: matched.join("\n") };
      }

      case "head":
      case "tail": {
        const nIdx = args.indexOf("-n");
        const count = nIdx >= 0 ? Math.max(1, Number(args[nIdx + 1]) || 10) : 10;
        const fileArg = posArgs.find(a => !/^\d+$/.test(a));
        let text = stdin ?? "";
        if (fileArg) {
          const content = this.fs.readFile(this.fs.normalizePath(fileArg, this.cwd, this.home));
          if (content === null) return { ok: false, out: `${command}: ${fileArg}: Arquivo inexistente` };
          text = content;
        }
        const arr = text.replace(/\n$/, "").split("\n");
        const sliced = command === "head" ? arr.slice(0, count) : arr.slice(-count);
        return { ok: true, out: sliced.join("\n") };
      }

      case "wc": {
        let text = stdin ?? "";
        if (posArgs[0]) {
          const content = this.fs.readFile(this.fs.normalizePath(posArgs[0], this.cwd, this.home));
          if (content === null) return { ok: false, out: `wc: ${posArgs[0]}: Arquivo inexistente` };
          text = content;
        }
        const clean = text.replace(/\n$/, "");
        const lineCount = clean === "" ? 0 : clean.split("\n").length;
        const wordCount = clean.trim() ? clean.trim().split(/\s+/).length : 0;
        const charCount = text.length;
        if (hasFlag("l")) return { ok: true, out: String(lineCount) };
        if (hasFlag("w")) return { ok: true, out: String(wordCount) };
        if (hasFlag("c")) return { ok: true, out: String(charCount) };
        return { ok: true, out: `${lineCount}  ${wordCount}  ${charCount}${posArgs[0] ? ` ${posArgs[0]}` : ""}` };
      }

      case "sort": {
        let text = stdin ?? "";
        if (posArgs[0]) {
          const content = this.fs.readFile(this.fs.normalizePath(posArgs[0], this.cwd, this.home));
          if (content === null) return { ok: false, out: `sort: ${posArgs[0]}: Arquivo inexistente` };
          text = content;
        }
        const arr = text.replace(/\n$/, "").split("\n").filter(Boolean);
        arr.sort((a, b) => a.localeCompare(b));
        if (hasFlag("r")) arr.reverse();
        return { ok: true, out: arr.join("\n") };
      }

      case "uniq": {
        const text = stdin ?? (posArgs[0] ? this.fs.readFile(this.fs.normalizePath(posArgs[0], this.cwd, this.home)) || "" : "");
        const arr = text.replace(/\n$/, "").split("\n").filter(Boolean);
        const res: string[] = [];
        for (const line of arr) {
          if (res[res.length - 1] !== line) res.push(line);
        }
        return { ok: true, out: res.join("\n") };
      }

      case "cut": {
        const dArg = args.find(a => a.startsWith("-d"));
        const dIdx = args.indexOf("-d");
        const delim = dArg && dArg.length > 2 ? dArg.slice(2) : dIdx >= 0 ? args[dIdx + 1] : "\t";
        const fArg = args.find(a => a.startsWith("-f"));
        const fIdx = args.indexOf("-f");
        const fieldNum = Number((fArg && fArg.length > 2 ? fArg.slice(2) : fIdx >= 0 ? args[fIdx + 1] : "1")) || 1;
        const fileArg = posArgs.find(a => a !== delim && a !== String(fieldNum));
        const text = stdin ?? (fileArg ? this.fs.readFile(this.fs.normalizePath(fileArg, this.cwd, this.home)) || "" : "");
        const outLines = text
          .replace(/\n$/, "")
          .split("\n")
          .filter(Boolean)
          .map(l => l.split(delim)[fieldNum - 1] ?? "");
        return { ok: true, out: outLines.join("\n") };
      }

      case "chmod": {
        if (posArgs.length < 2) return { ok: false, out: "chmod: informe o modo e o arquivo" };
        const mode = posArgs[0];
        const abs = this.fs.normalizePath(posArgs[1], this.cwd, this.home);
        const node = this.fs.getNode(abs);
        if (!node) return { ok: false, out: `chmod: '${posArgs[1]}': Arquivo inexistente` };
        if (mode === "+x" || mode === "755" || mode === "u+x") {
          node.executable = true;
          node.permissions = node.type === "dir" ? "drwxr-xr-x" : "-rwxr-xr-x";
        } else if (mode === "-x" || mode === "644") {
          node.executable = false;
          node.permissions = node.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--";
        }
        return { ok: true, out: "" };
      }

      case "stat": {
        if (!posArgs[0]) return { ok: false, out: "stat: falta arquivo" };
        const abs = this.fs.normalizePath(posArgs[0], this.cwd, this.home);
        const node = this.fs.getNode(abs);
        if (!node) return { ok: false, out: `stat: '${posArgs[0]}': Arquivo inexistente` };
        return {
          ok: true,
          out: [
            `  Arquivo: ${abs}`,
            `  Tamanho: ${node.type === "dir" ? 4096 : node.size ?? (node.content?.length || 0)}   Tipo: ${node.type === "dir" ? "diretório" : "arquivo regular"}`,
            `   Acesso: (${node.permissions})  Uid: (1000/aluno)  Gid: (1000/aluno)`,
          ].join("\n"),
        };
      }

      case "env":
        return { ok: true, out: Object.entries(this.env).map(([k, v]) => `${k}=${v}`).join("\n") };

      case "export": {
        for (const arg of args) {
          const eq = arg.indexOf("=");
          if (eq > 0) this.env[arg.slice(0, eq)] = arg.slice(eq + 1);
        }
        return { ok: true, out: "" };
      }

      case "alias": {
        if (!args.length) {
          return {
            ok: true,
            out: Object.entries(this.aliases).map(([k, v]) => `alias ${k}='${v}'`).join("\n"),
          };
        }
        for (const arg of args) {
          const eq = arg.indexOf("=");
          if (eq > 0) this.aliases[arg.slice(0, eq)] = arg.slice(eq + 1);
        }
        return { ok: true, out: "" };
      }

      case "history":
        return {
          ok: true,
          out: this.history.map((cmd, idx) => `  ${String(idx + 1).padStart(3, " ")}  ${cmd}`).join("\n"),
        };

      case "du":
        return { ok: true, out: `4.0K\t${posArgs[0] || "."}` };

      case "df":
        return {
          ok: true,
          out: [
            "Sist. Arq.     Tam. Usado Disp. Uso% Montado em",
            "/dev/sda1       40G  6.4G   34G  16% /",
            "tmpfs          2.0G     0  2.0G   0% /tmp",
          ].join("\n"),
        };

      case "ps":
        return {
          ok: true,
          out: [
            "  PID USER     %CPU %MEM COMMAND",
            ...this.processes.map(
              p => `${String(p.pid).padStart(5, " ")} ${p.user.padEnd(8, " ")} ${p.cpu.padStart(4, " ")} ${p.mem.padStart(4, " ")} ${p.command}`
            ),
          ].join("\n"),
        };

      case "kill": {
        const pid = Number(posArgs[posArgs.length - 1]);
        const idx = this.processes.findIndex(p => p.pid === pid);
        if (idx < 0) return { ok: false, out: `kill: (${pid}) - Processo inexistente` };
        this.processes.splice(idx, 1);
        return { ok: true, out: `Processo ${pid} encerrado.`, tone: "success" };
      }

      case "ip": {
        if (posArgs[0] === "route" || posArgs[0] === "r") {
          return {
            ok: true,
            out: "default via 192.168.10.1 dev eth0 proto static\n192.168.10.0/24 dev eth0 proto kernel scope link src 192.168.10.25",
          };
        }
        return {
          ok: true,
          out: [
            "1: lo: <LOOPBACK,UP> mtu 65536 state UNKNOWN",
            "    inet 127.0.0.1/8 scope host lo",
            "2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500 state UP",
            "    inet 192.168.10.25/24 brd 192.168.10.255 scope global eth0",
          ].join("\n"),
        };
      }

      case "ping": {
        const target = posArgs[posArgs.length - 1] || "8.8.8.8";
        return {
          ok: true,
          out: [
            `PING ${target} (${target}) 56(84) bytes of data.`,
            `64 bytes from ${target}: icmp_seq=1 ttl=64 time=1.42 ms`,
            `64 bytes from ${target}: icmp_seq=2 ttl=64 time=1.38 ms`,
            `--- ${target} ping statistics ---`,
            `2 packets transmitted, 2 received, 0% packet loss`,
          ].join("\n"),
        };
      }

      case "curl": {
        const target = posArgs[posArgs.length - 1] || "https://codeentry.local";
        if (hasFlag("I")) {
          return {
            ok: true,
            out: `HTTP/1.1 200 OK\nServer: nginx/1.24.0\nContent-Type: text/html; charset=utf-8\nX-Lab: ${target}`,
          };
        }
        return { ok: true, out: "<h1>Code Entry Web Server</h1>\n<p>Status: Online</p>" };
      }

      case "tar": {
        if (hasFlag("c") && hasFlag("f")) {
          const archiveArg = posArgs[0];
          const sources = posArgs.slice(1);
          if (!archiveArg || !sources.length) return { ok: false, out: "tar: especifique arquivo.tar.gz e origem" };
          const absArchive = this.fs.normalizePath(archiveArg, this.cwd, this.home);
          const err = this.writeToFile(absArchive, `[TAR.GZ ARCHIVE]\nSources: ${sources.join(", ")}`, false);
          if (err) return { ok: false, out: err };
          return { ok: true, out: `Arquivo compactado '${archiveArg}' criado com sucesso.`, tone: "success" };
        }
        if (hasFlag("t") && hasFlag("f")) {
          const absArchive = this.fs.normalizePath(posArgs[0] || "", this.cwd, this.home);
          const content = this.fs.readFile(absArchive);
          if (content === null) return { ok: false, out: `tar: ${posArgs[0]}: Arquivo não encontrado` };
          return { ok: true, out: content };
        }
        return { ok: true, out: "tar: use -czf <saida.tar.gz> <origem> ou -tf <arquivo>" };
      }

      case "man":
        return {
          ok: true,
          tone: "accent",
          out: posArgs[0]
            ? `MANUAL RESUMIDO — ${posArgs[0]}\nUse '${posArgs[0]}' com argumentos no terminal. Digite 'help' para ver a lista de comandos.`
            : "Qual manual você deseja consultar? Ex.: man grep",
        };

      default:
        return { ok: false, out: `bash: ${command}: comando não encontrado (digite 'help')` };
    }
  }
}
