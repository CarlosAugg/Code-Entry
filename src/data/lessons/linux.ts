import type { Lesson } from "../../types/curriculum";

export const LINUX_LESSONS: Lesson[] = [
  {
    id: "linux-01",
    trackId: "linux",
    moduleId: "linux-m1",
    moduleTitle: "Módulo 1 — Identidade e Navegação",
    order: 1,
    title: "Reconhecimento do Sistema",
    subtitle: "whoami, hostname, pwd e uname",
    difficulty: "Muito fácil",
    estimatedMinutes: 8,
    xp: 40,
    workbench: "linux",
    summary: "Identifique o usuário conectado, o nome do host, o diretório atual e o kernel Linux.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Antes de agir, reconheça o ambiente",
        content:
          "Administradores Linux sempre confirmam em qual servidor e diretório estão antes de alterar configurações. Isso evita executar comandos no diretório errado.",
      },
      {
        kind: "table",
        headers: ["Comando", "Função"],
        rows: [
          ["whoami", "Exibe o nome do usuário atual"],
          ["hostname", "Exibe o nome da máquina na rede"],
          ["pwd", "Mostra o caminho absoluto do diretório atual"],
          ["uname -a", "Exibe detalhes completos do kernel e arquitetura"],
        ],
      },
    ],
    examples: [
      {
        title: "Sessão inicial de inspeção",
        description: "Sequência clássica ao acessar um servidor via SSH.",
        code: `whoami\npwd\nuname -a`,
        output: "aluno\n/home/aluno\nLinux code-entry-srv 6.8.0-codeentry #1 SMP x86_64 GNU/Linux",
      },
    ],
    prompt:
      "Execute os 4 comandos de reconhecimento no terminal: whoami, hostname, pwd e uname -a.",
    starterCode: "",
    quickCommands: [
      { label: "whoami", command: "whoami" },
      { label: "hostname", command: "hostname" },
      { label: "pwd", command: "pwd" },
      { label: "uname -a", command: "uname -a" },
    ],
    hints: [
      "Execute um comando por vez pressionando Enter no terminal à direita.",
      "Para uname, lembre-se da flag -a (all) para mostrar todas as informações do sistema.",
      "Comandos exatos: whoami -> hostname -> pwd -> uname -a",
    ],
    objectives: [
      {
        id: "lx01-whoami",
        label: "Consultar usuário com whoami",
        test: ctx => Boolean(ctx.linux?.stages.some(s => s.command === "whoami")),
      },
      {
        id: "lx01-host",
        label: "Consultar máquina com hostname",
        test: ctx => Boolean(ctx.linux?.stages.some(s => s.command === "hostname")),
      },
      {
        id: "lx01-pwd",
        label: "Confirmar diretório atual com pwd",
        test: ctx => Boolean(ctx.linux?.stages.some(s => s.command === "pwd")),
      },
      {
        id: "lx01-uname",
        label: "Consultar kernel completo com uname -a",
        test: ctx => Boolean(ctx.linux?.stages.some(s => s.command === "uname" && s.flags.includes("a"))),
      },
    ],
    referenceSolution: "whoami && hostname && pwd && uname -a",
  },
  {
    id: "linux-02",
    trackId: "linux",
    moduleId: "linux-m1",
    moduleTitle: "Módulo 1 — Identidade e Navegação",
    order: 2,
    title: "Listagem, Pastas e Leitura",
    subtitle: "ls, cd, cat e atalho ~",
    difficulty: "Muito fácil",
    estimatedMinutes: 10,
    xp: 50,
    workbench: "linux",
    summary: "Navegue até a pasta ~/documentos, leia um arquivo de texto e retorne ao diretório inicial.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Árvore hierárquica de diretórios",
        content:
          "No Linux tudo parte da raiz '/'. Sua pasta pessoal fica em /home/aluno (abreviada como ~). Use cd para mudar de pasta, ls para listar e cat para ler arquivos.",
      },
    ],
    examples: [
      {
        title: "Entrando e lendo um arquivo",
        description: "Usa caminho relativo e depois volta um nível com ..",
        code: `ls\ncd documentos\ncat boas-vindas.txt\ncd ..`,
      },
    ],
    prompt:
      "Liste a pasta atual (ls), entre em documentos (cd documentos), leia o arquivo guia-linux.txt com cat e retorne à pasta pessoal (~).",
    starterCode: "",
    quickCommands: [
      { label: "ls", command: "ls" },
      { label: "cd documentos", command: "cd documentos" },
      { label: "cat guia-linux.txt", command: "cat guia-linux.txt" },
      { label: "cd ~", command: "cd ~" },
    ],
    hints: [
      "Comece com ls para ver a pasta documentos.",
      "Use cd documentos e depois cat guia-linux.txt.",
      "Volte para /home/aluno usando cd ~ ou cd ...",
    ],
    objectives: [
      {
        id: "lx02-ls",
        label: "Listar conteúdo com ls",
        test: ctx => Boolean(ctx.linux?.stages.some(s => s.command === "ls")),
      },
      {
        id: "lx02-cd-doc",
        label: "Acessar /home/aluno/documentos",
        test: ctx => ctx.linux?.cwd === "/home/aluno/documentos",
      },
      {
        id: "lx02-cat",
        label: "Ler guia-linux.txt com cat",
        test: ctx =>
          ctx.success &&
          Boolean(ctx.linux?.stages.some(s => s.command === "cat" && s.args.some(a => a.includes("guia-linux.txt")))),
      },
      {
        id: "lx02-back",
        label: "Retornar para /home/aluno",
        test: ctx => ctx.linux?.cwd === "/home/aluno" && Boolean(ctx.linux?.stages.some(s => s.command === "cd")),
      },
    ],
    referenceSolution: "ls && cd documentos && cat guia-linux.txt && cd ~",
  },
  {
    id: "linux-03",
    trackId: "linux",
    moduleId: "linux-m2",
    moduleTitle: "Módulo 2 — Arquivos e Redirecionamento",
    order: 3,
    title: "Criando Estruturas e Gravando Arquivos",
    subtitle: "mkdir -p, touch e echo >",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 60,
    workbench: "linux",
    summary: "Crie pastas aninhadas de uma só vez com mkdir -p e redirecione texto para arquivos.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Redirecionamento > vs >>",
        content:
          "O operador > sobrescreve (ou cria) um arquivo com a saída do comando. O operador >> adiciona novas linhas ao final sem apagar o conteúdo anterior.",
      },
    ],
    examples: [
      {
        title: "Criando projeto organizado",
        description: "Usa -p para criar pastas intermediárias automaticamente.",
        code: `mkdir -p ~/projetos/app\necho "Versao 1.0" > ~/projetos/app/versao.txt`,
      },
    ],
    prompt:
      "Crie o diretório ~/estudos/linux usando mkdir -p e grave a frase 'Linux na pratica' dentro de ~/estudos/linux/notas.txt usando redirecionamento (>).",
    starterCode: "",
    quickCommands: [
      { label: "mkdir -p ~/estudos/linux", command: "mkdir -p ~/estudos/linux" },
      { label: "tree ~/estudos", command: "tree ~/estudos" },
    ],
    hints: [
      "Primeiro crie toda a hierarquia: mkdir -p ~/estudos/linux.",
      "Depois grave o texto: echo \"Linux na pratica\" > ~/estudos/linux/notas.txt.",
      "Confira o resultado com cat ~/estudos/linux/notas.txt e observe o Explorador de Arquivos ao lado.",
    ],
    objectives: [
      {
        id: "lx03-dir",
        label: "Criar diretório ~/estudos/linux com mkdir -p",
        test: ctx => Boolean(ctx.linux?.exists("/home/aluno/estudos/linux")),
      },
      {
        id: "lx03-file",
        label: "Criar ~/estudos/linux/notas.txt com texto gravado",
        test: ctx => {
          const content = ctx.linux?.read("/home/aluno/estudos/linux/notas.txt") || "";
          return content.trim().length > 0;
        },
      },
    ],
    referenceSolution: 'mkdir -p ~/estudos/linux && echo "Linux na pratica" > ~/estudos/linux/notas.txt',
  },
  {
    id: "linux-04",
    trackId: "linux",
    moduleId: "linux-m2",
    moduleTitle: "Módulo 2 — Arquivos e Redirecionamento",
    order: 4,
    title: "Cópia, Renomeação e Limpeza",
    subtitle: "cp, mv e rm",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 65,
    workbench: "linux",
    summary: "Copie arquivos de configuração, renomeie backups com mv e remova arquivos temporários.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Manipulação segura de arquivos",
        content:
          "cp duplica arquivos (com -r para diretórios). mv move ou renomeia um item. rm remove permanentemente (não há lixeira no terminal!).",
      },
    ],
    examples: [
      {
        title: "Backup e limpeza",
        description: "Cria uma cópia antes de editar e remove o temporário.",
        code: `cp /etc/hosts ~/hosts.bak\nmv ~/hosts.bak ~/hosts.backup`,
      },
    ],
    prompt:
      "Copie /etc/hosts para ~/hosts-copia.txt usando cp, depois renomeie ~/hosts-copia.txt para ~/hosts-final.txt usando mv. Confirme com ls ~.",
    starterCode: "",
    quickCommands: [
      { label: "cp /etc/hosts ~/hosts-copia.txt", command: "cp /etc/hosts ~/hosts-copia.txt" },
      { label: "mv ~/hosts-copia.txt ~/hosts-final.txt", command: "mv ~/hosts-copia.txt ~/hosts-final.txt" },
    ],
    hints: [
      "Use cp /etc/hosts ~/hosts-copia.txt para copiar o arquivo.",
      "Em seguida execute mv ~/hosts-copia.txt ~/hosts-final.txt para renomear.",
      "Se precisar conferir, digite ls ~.",
    ],
    objectives: [
      {
        id: "lx04-cp",
        label: "Usar cp para copiar /etc/hosts",
        test: ctx => Boolean(ctx.linux?.stages.some(s => s.command === "cp")),
      },
      {
        id: "lx04-mv",
        label: "Ter ~/hosts-final.txt existente e ~/hosts-copia.txt removido via mv",
        test: ctx =>
          Boolean(
            ctx.linux?.exists("/home/aluno/hosts-final.txt") &&
              !ctx.linux?.exists("/home/aluno/hosts-copia.txt")
          ),
      },
    ],
    referenceSolution: "cp /etc/hosts ~/hosts-copia.txt && mv ~/hosts-copia.txt ~/hosts-final.txt",
  },
  {
    id: "linux-05",
    trackId: "linux",
    moduleId: "linux-m2",
    moduleTitle: "Módulo 2 — Arquivos e Redirecionamento",
    order: 5,
    title: "Pipelines e Filtros com grep",
    subtitle: "Conectando comandos com |",
    difficulty: "Intermediário",
    estimatedMinutes: 14,
    xp: 80,
    workbench: "linux",
    summary: "Encadeie cat, grep, sort, uniq e wc -l para extrair inteligência de logs e CSVs.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Filosofia Unix: faça uma coisa e encadeie",
        content:
          "O operador pipe (|) pega a saída padrão de um comando à esquerda e entrega como entrada ao comando à direita. Assim combinamos cat, grep -i, cut, sort, uniq e wc -l.",
      },
    ],
    examples: [
      {
        title: "Contando linhas únicas em CSV",
        description: "Extrai a primeira coluna, ordena, deduplica e conta.",
        code: `cat ~/dados/usuarios.csv | cut -d"," -f1 | sort | uniq | wc -l`,
      },
    ],
    prompt:
      "Busque ignorando maiúsculas/minúsculas (-i) a palavra 'failed' em /var/log/auth.log e salve o resultado em ~/falhas-ssh.log.",
    starterCode: "",
    quickCommands: [
      { label: "cat /var/log/auth.log", command: "cat /var/log/auth.log" },
      { label: "grep -i failed /var/log/auth.log", command: "grep -i failed /var/log/auth.log" },
    ],
    hints: [
      "Use grep -i failed /var/log/auth.log (ou com pipeline cat /var/log/auth.log | grep -i failed).",
      "Adicione > ~/falhas-ssh.log ao final do comando para gravar as linhas filtradas.",
      "Comando completo: grep -i failed /var/log/auth.log > ~/falhas-ssh.log",
    ],
    objectives: [
      {
        id: "lx05-grep",
        label: "Executar grep com flag -i",
        test: ctx => Boolean(ctx.linux?.stages.some(s => s.command === "grep" && s.flags.includes("i"))),
      },
      {
        id: "lx05-saved",
        label: "Salvar linhas contendo 'Failed' em ~/falhas-ssh.log",
        test: ctx => {
          const text = ctx.linux?.read("/home/aluno/falhas-ssh.log") || "";
          return text.includes("Failed") && !text.includes("Accepted");
        },
      },
    ],
    referenceSolution: "grep -i failed /var/log/auth.log > ~/falhas-ssh.log",
  },
  {
    id: "linux-06",
    trackId: "linux",
    moduleId: "linux-m3",
    moduleTitle: "Módulo 3 — Permissões, Scripts e Administração",
    order: 6,
    title: "Permissões com chmod e Scripts",
    subtitle: "chmod +x e execução de scripts Bash",
    difficulty: "Intermediário",
    estimatedMinutes: 14,
    xp: 90,
    workbench: "linux",
    summary: "Torne um script executável usando chmod +x e execute-o diretamente no terminal.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Permissões rwx",
        content:
          "No Linux, um arquivo recém-criado não tem permissão de execução (x). Ao tentar rodá-lo com ./script.sh recebemos 'Permissão negada' até conceder +x via chmod +x arquivo.",
      },
    ],
    examples: [
      {
        title: "Liberando execução de script",
        description: "Verifica permissões antes e depois.",
        code: `ls -l ~/scripts\nchmod +x ~/scripts/diagnostico.sh\n~/scripts/diagnostico.sh`,
      },
    ],
    prompt:
      "Entre em ~/scripts, adicione permissão de execução ao arquivo diagnostico.sh usando chmod +x e execute ./diagnostico.sh.",
    starterCode: "",
    quickCommands: [
      { label: "cd ~/scripts && ls -l", command: "cd ~/scripts && ls -l" },
      { label: "chmod +x diagnostico.sh", command: "chmod +x diagnostico.sh" },
      { label: "./diagnostico.sh", command: "./diagnostico.sh" },
    ],
    hints: [
      "Primeiro entre na pasta com cd ~/scripts.",
      "Dê permissão com chmod +x diagnostico.sh.",
      "Execute com ./diagnostico.sh e observe a saída de diagnóstico.",
    ],
    objectives: [
      {
        id: "lx06-chmod",
        label: "Tornar /home/aluno/scripts/diagnostico.sh executável",
        test: ctx => Boolean(ctx.linux?.isExecutable("/home/aluno/scripts/diagnostico.sh")),
      },
      {
        id: "lx06-run",
        label: "Executar o script e obter saída 'Diagnóstico concluído.'",
        test: ctx => ctx.success && ctx.outputText.includes("Diagnóstico concluído"),
      },
    ],
    referenceSolution: "cd ~/scripts && chmod +x diagnostico.sh && ./diagnostico.sh",
  },
  {
    id: "linux-07",
    trackId: "linux",
    moduleId: "linux-m3",
    moduleTitle: "Módulo 3 — Permissões, Scripts e Administração",
    order: 7,
    title: "Monitoramento de Processos e Sinais",
    subtitle: "ps aux e kill",
    difficulty: "Intermediário",
    estimatedMinutes: 14,
    xp: 95,
    workbench: "linux",
    summary: "Identifique um processo com uso elevado de CPU via ps aux e encerre-o pelo PID.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Gerenciamento de processos",
        content:
          "Todo programa em execução recebe um PID único. Com ps aux listamos usuário, %CPU, %MEM e comando. Com kill <PID> encerramos processos travados.",
      },
    ],
    examples: [
      {
        title: "Encontrando e encerrando PID",
        description: "Lista processos detalhados e encerra o PID 3301.",
        code: `ps aux\nkill 3301`,
      },
    ],
    prompt:
      "Liste todos os processos com ps aux, identifique o PID do processo 'python3 worker_travado.py' (consumindo alta CPU) e encerre-o com kill <PID>.",
    starterCode: "",
    quickCommands: [
      { label: "ps aux", command: "ps aux" },
      { label: "ps", command: "ps" },
    ],
    hints: [
      "Digite ps aux para enxergar a tabela de processos com PID e %CPU.",
      "Observe qual linha mostra 'worker_travado.py' (PID 3301).",
      "Execute kill 3301 para encerrar o processo.",
    ],
    objectives: [
      {
        id: "lx07-ps",
        label: "Inspecionar processos com ps aux",
        test: ctx => Boolean(ctx.linux?.stages.some(s => s.command === "ps" && s.flags.includes("a"))),
      },
      {
        id: "lx07-kill",
        label: "Encerrar o processo travado (PID 3301) com kill",
        test: ctx =>
          ctx.success &&
          Boolean(ctx.linux?.stages.some(s => s.command === "kill" && s.args.includes("3301"))),
      },
    ],
    referenceSolution: "ps aux && kill 3301",
  },
  {
    id: "linux-08",
    trackId: "linux",
    moduleId: "linux-m3",
    moduleTitle: "Módulo 3 — Permissões, Scripts e Administração",
    order: 8,
    title: "Diagnóstico de Incidentes e Backup tar",
    subtitle: "Investigação + compactação .tar.gz",
    difficulty: "Difícil",
    estimatedMinutes: 18,
    xp: 125,
    workbench: "linux",
    summary: "Extraia evidências de erros 404 do nginx e gere um arquivo compactado .tar.gz.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Empacotando artefatos com tar",
        content:
          "O comando tar -czf arquivo.tar.gz pasta/ cria (-c) um arquivo compactado com gzip (-z) com o nome informado (-f). Para listar o conteúdo sem extrair, usamos tar -tf.",
      },
    ],
    examples: [
      {
        title: "Criando pacote de backup",
        description: "Compacta diretório de logs.",
        code: `tar -czf ~/backup-logs.tar.gz ~/relatorio`,
      },
    ],
    prompt:
      "Crie a pasta ~/incidente, filtre as requisições '404' de /var/log/nginx/access.log para ~/incidente/erros404.log e gere o backup ~/incidente.tar.gz usando tar -czf.",
    starterCode: "",
    quickCommands: [
      { label: "mkdir -p ~/incidente", command: "mkdir -p ~/incidente" },
      { label: "grep 404 /var/log/nginx/access.log", command: "grep 404 /var/log/nginx/access.log" },
    ],
    hints: [
      "Primeiro crie a pasta com mkdir -p ~/incidente.",
      "Extraia os erros com grep 404 /var/log/nginx/access.log > ~/incidente/erros404.log.",
      "Compacte com tar -czf ~/incidente.tar.gz ~/incidente.",
    ],
    objectives: [
      {
        id: "lx08-log",
        label: "Salvar erros 404 em ~/incidente/erros404.log",
        test: ctx => {
          const content = ctx.linux?.read("/home/aluno/incidente/erros404.log") || "";
          return content.includes("404") && !content.includes("200");
        },
      },
      {
        id: "lx08-tar",
        label: "Gerar pacote ~/incidente.tar.gz com tar",
        test: ctx => Boolean(ctx.linux?.exists("/home/aluno/incidente.tar.gz")),
      },
    ],
    referenceSolution: "mkdir -p ~/incidente && grep 404 /var/log/nginx/access.log > ~/incidente/erros404.log && tar -czf ~/incidente.tar.gz ~/incidente",
  },
];
