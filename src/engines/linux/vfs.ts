export interface VfsNode {
  type: "dir" | "file";
  permissions: string;
  executable?: boolean;
  content?: string;
  children?: Record<string, VfsNode>;
  size?: number;
  modifiedAt?: string;
}

export interface VfsTreeItem {
  name: string;
  path: string;
  type: "dir" | "file";
  permissions: string;
  executable: boolean;
  size: number;
  children?: VfsTreeItem[];
}

export class VirtualFileSystem {
  root!: VfsNode;

  constructor(snapshot?: VfsNode | null) {
    if (snapshot && snapshot.type === "dir" && snapshot.children) {
      this.root = this.cloneNode(snapshot);
    } else {
      this.reset();
    }
  }

  dir(children: Record<string, VfsNode> = {}, permissions = "drwxr-xr-x"): VfsNode {
    return {
      type: "dir",
      permissions,
      children,
      modifiedAt: "2026-11-19 10:00",
    };
  }

  file(content = "", opts: { executable?: boolean; permissions?: string; size?: number } = {}): VfsNode {
    const executable = Boolean(opts.executable);
    return {
      type: "file",
      content,
      executable,
      permissions: opts.permissions || (executable ? "-rwxr-xr-x" : "-rw-r--r--"),
      size: opts.size ?? content.length,
      modifiedAt: "2026-11-19 10:00",
    };
  }

  cloneNode(node: VfsNode): VfsNode {
    return JSON.parse(JSON.stringify(node)) as VfsNode;
  }

  reset(): void {
    this.root = this.dir({
      home: this.dir({
        aluno: this.dir({
          documentos: this.dir({
            "boas-vindas.txt": this.file(
              "Bem-vindo ao terminal Linux do Code Entry!\n\nUse 'help' para listar comandos e 'tree' para inspecionar pastas.\n"
            ),
            "guia-linux.txt": this.file(
              [
                "Linux diferencia letras maiúsculas de minúsculas.",
                "Caminhos absolutos começam na raiz (/).",
                "Pipelines (|) conectam a saída de um comando à entrada do próximo.",
                "Permissões rwx controlam leitura, escrita e execução.",
                "Logs do sistema geralmente ficam em /var/log.",
              ].join("\n")
            ),
          }),
          dados: this.dir({
            "usuarios.csv": this.file(
              "nome,setor,status\nana,redes,ativo\nbruno,suporte,ativo\nana,redes,ativo\ncarla,dev,inativo\ndiego,redes,ativo\n"
            ),
            "acessos.log": this.file(
              [
                "08:00 ana login sucesso",
                "08:03 bruno login sucesso",
                "08:05 carla login falha",
                "08:09 diego login sucesso",
                "08:12 ana abriu terminal",
                "08:20 bruno executou backup",
                "08:25 diego encerrou sessao",
              ].join("\n")
            ),
          }),
          scripts: this.dir({
            "diagnostico.sh": this.file(
              "#!/bin/bash\necho 'Diagnóstico concluído.'\necho 'Rede: OK'\necho 'Disco: OK'",
              { executable: false }
            ),
            "backup.sh": this.file(
              "#!/bin/bash\necho 'Backup iniciado...'",
              { executable: false }
            ),
          }),
          ".perfil": this.file("USUARIO=aluno\nEDITOR=nano\nSHELL=/bin/bash\n"),
        }),
      }),
      etc: this.dir({
        hostname: this.file("code-entry-srv\n"),
        hosts: this.file("127.0.0.1 localhost\n127.0.1.1 code-entry-srv\n10.0.20.10 api-interna\n"),
        "os-release": this.file(
          'NAME="CodeEntry Linux"\nVERSION="24.04 LTS"\nID=codeentry\nPRETTY_NAME="CodeEntry Linux 24.04 LTS"\n'
        ),
      }),
      var: this.dir({
        log: this.dir({
          "auth.log": this.file(
            [
              "Nov 19 09:10:01 srv sshd[1210]: Accepted publickey for aluno from 192.168.10.25",
              "Nov 19 09:12:44 srv sshd[1288]: Failed password for admin from 192.168.10.77",
              "Nov 19 09:12:49 srv sshd[1288]: Failed password for admin from 192.168.10.77",
              "Nov 19 09:13:03 srv sshd[1288]: Failed password for root from 192.168.10.77",
              "Nov 19 09:15:12 srv sudo[1320]: aluno : TTY=pts/0 ; COMMAND=/usr/bin/apt update",
            ].join("\n")
          ),
          nginx: this.dir({
            "access.log": this.file(
              [
                "192.168.10.25 - GET / 200 1240",
                "192.168.10.31 - GET /app.css 200 842",
                "192.168.10.77 - GET /admin 404 153",
                "192.168.10.77 - GET /login 404 153",
                "192.168.10.25 - GET /api/status 200 512",
              ].join("\n")
            ),
          }),
        }),
      }),
      srv: this.dir({
        www: this.dir({
          "index.html": this.file("<h1>Code Entry Web Server</h1>\n<p>Status: Online</p>\n"),
        }),
      }),
      tmp: this.dir({}),
    });
  }

  serialize(): VfsNode {
    return this.cloneNode(this.root);
  }

  deserialize(snapshot: unknown): boolean {
    if (snapshot && typeof snapshot === "object" && (snapshot as VfsNode).type === "dir") {
      this.root = this.cloneNode(snapshot as VfsNode);
      return true;
    }
    this.reset();
    return false;
  }

  normalizePath(rawPath: string, cwd = "/home/aluno", home = "/home/aluno"): string {
    let p = String(rawPath || "").trim();
    if (!p) return cwd;
    if (p === "~") p = home;
    else if (p.startsWith("~/")) p = `${home}/${p.slice(2)}`;
    const base = p.startsWith("/") ? [] : cwd.split("/").filter(Boolean);
    const parts = p.split("/").filter(Boolean);
    for (const part of parts) {
      if (part === ".") continue;
      if (part === "..") base.pop();
      else base.push(part);
    }
    return "/" + base.join("/");
  }

  getNode(absPath: string): VfsNode | null {
    if (absPath === "/") return this.root;
    const parts = absPath.split("/").filter(Boolean);
    let curr: VfsNode | undefined = this.root;
    for (const part of parts) {
      if (!curr || curr.type !== "dir" || !curr.children) return null;
      curr = curr.children[part];
    }
    return curr || null;
  }

  getParentAndName(absPath: string): { parent: VfsNode | null; name: string } {
    const parts = absPath.split("/").filter(Boolean);
    const name = parts.pop() || "";
    const parentPath = "/" + parts.join("/");
    const parent = this.getNode(parentPath);
    return { parent: parent && parent.type === "dir" ? parent : null, name };
  }

  exists(absPath: string, cwd = "/home/aluno"): boolean {
    const norm = this.normalizePath(absPath, cwd);
    return this.getNode(norm) !== null;
  }

  readFile(absPath: string, cwd = "/home/aluno"): string | null {
    const norm = this.normalizePath(absPath, cwd);
    const node = this.getNode(norm);
    return node && node.type === "file" ? node.content ?? "" : null;
  }

  isExecutable(absPath: string, cwd = "/home/aluno"): boolean {
    const norm = this.normalizePath(absPath, cwd);
    const node = this.getNode(norm);
    return Boolean(node && node.type === "file" && node.executable);
  }

  toTree(startPath = "/home/aluno"): VfsTreeItem | null {
    const node = this.getNode(startPath);
    if (!node) return null;
    const name = startPath === "/" ? "/" : startPath.split("/").filter(Boolean).pop() || "/";
    const build = (n: VfsNode, p: string, label: string): VfsTreeItem => {
      if (n.type === "file") {
        return {
          name: label,
          path: p,
          type: "file",
          permissions: n.permissions,
          executable: Boolean(n.executable),
          size: n.size ?? (n.content?.length || 0),
        };
      }
      const entries = Object.entries(n.children || {}).sort(([a, na], [b, nb]) => {
        if (na.type !== nb.type) return na.type === "dir" ? -1 : 1;
        return a.localeCompare(b);
      });
      return {
        name: label,
        path: p,
        type: "dir",
        permissions: n.permissions,
        executable: false,
        size: entries.length,
        children: entries.map(([k, child]) =>
          build(child, p === "/" ? `/${k}` : `${p}/${k}`, k)
        ),
      };
    };
    return build(node, startPath, name);
  }
}
