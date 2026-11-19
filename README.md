# Code Entry

Plataforma educacional interativa e local-first para aprendizagem prática de lógica de programação, linguagens compiladas e interpretadas, sistemas operacionais Linux, bancos de dados SQL e redes de computadores.

## Destaques da Plataforma

- **7 Trilhas Completas & 58 Aulas + 21 Desafios:** Lógica/Portugol, C++17, JavaScript ES2024, Python 3, Linux Bash virtual, SQLite 3 e Redes IPv4/VLSM.
- **Execução Segura e Isolada:** Web Workers dedicados para Portugol, JavaScript, Python e C++ com proteção contra loops infinitos, VFS Linux persistente com mais de 40 comandos, sandbox SQLite em memória e simulador interativo de topologia de rede + firewall ACL.
- **Sistema de Temas Estilo Opera GX (8 Paletas):** 4 paletas para Modo Escuro (*Nebula Violet*, *GX Crimson*, *Cyber Matrix*, *Solar Forge*) e 4 para Modo Claro (*Arctic Violet*, *Nordic Ocean*, *Matcha Studio*, *Paper Sunset*), centralizadas em tokens CSS (`src/styles/tokens.css`), com prévia visual ao vivo, cache anti-flash e persistência automática em SQLite, preservando a identidade cromática individual de cada trilha.
- **Onboarding & Tour Interativo por Cliques Reais:** Configuração inicial em 3 etapas (nome/apelido, modo + paleta de cores e meta diária flexível) seguida por roteiro guiado em 8 passos onde o estudante clica diretamente nos elementos destacados da interface.
- **Motion Design e Celebração Não Intrusiva:** Fundos interativos em HTML5 Canvas 2D (*DotGrid*, *Particles* e *AmbientAurora*), `ClickSpark`, `SpotlightCard`, `BlurText`, `ShinyText` e notificações flutuantes (*Toast Notification*) com `canvas-confetti` respeitando `prefers-reduced-motion` e a opção **Reduzir animações**.
- **Inicialização 1 Clique no Windows:** Script `Iniciar Code Entry.bat` que valida o ambiente, instala dependências na primeira execução se necessário, aguarda o servidor responder na porta livre detectada, abre o navegador automaticamente e previne instâncias duplicadas.

---

## Requisitos

- **Node.js `v22.5.0` ou superior** (utiliza o módulo nativo `node:sqlite`; testado com `Node v26.13.0`).
- **Windows 10/11** para o inicializador `.bat` (ou qualquer sistema com Node.js `v22.5+` via terminal).

---

## Como Executar

### 1. Inicialização Rápida no Windows (Duplo Clique)

Dê um duplo clique no arquivo **`Iniciar Code Entry.bat`** na raiz do projeto.

O inicializador executa automaticamente os seguintes passos via `scripts/launch-windows.ps1`:
1. Verifica se `Node.js >= 22.5` e `npm` estão disponíveis.
2. Detecta se o Code Entry já está em execução para evitar múltiplas instâncias duplicadas.
3. Instala as dependências (`npm install`) e gera o build de produção (`npm run build`) automaticamente quando necessário.
4. Sobe o servidor local escolhendo a porta `3000` ou outra porta livre disponível caso `3000` esteja ocupada.
5. Aguarda a resposta real de `/api/health` antes de abrir seu navegador padrão na URL correta.
6. Mantém o servidor ativo até você pressionar `Q` ou `Ctrl+C` na janela do inicializador.

### 2. Execução Manual via Terminal

```bash
# Instalar dependências
npm install

# Modo desenvolvimento (API na porta 3001 + Vite HMR na porta 5173)
npm run dev

# Build de produção + servidor integrado (porta 3000 ou próxima porta livre)
npm run build
npm start

# Suíte completa de verificações automatizadas (86 checagens)
npm run verify
```

---

## Arquitetura e Estrutura do Projeto

```text
Code Entry/
├── Iniciar Code Entry.bat        # Inicializador 1 clique para Windows
├── index.html                    # Entrada Vite + script síncrono anti-flash de tema
├── package.json                  # Dependências, scripts e engines (Node >= 22.5.0)
├── public/icons/tech/            # Ícones oficiais Devicon das tecnologias
├── scripts/
│   ├── dev.mjs                   # Orquestrador dev (API + Vite HMR)
│   └── launch-windows.ps1        # Lógica PowerShell do inicializador Windows
├── server/
│   ├── index.mjs                 # Servidor HTTP + resolução dinâmica de porta
│   ├── routes.mjs                # API REST (/api/health, /api/bootstrap, /api/settings, /api/sql/*...)
│   ├── db.mjs                    # Persistência SQLite (node:sqlite, schema v4, migrações, backup/restore)
│   └── sqlSandbox.mjs            # Sandbox SQLite isolado com datasets educacionais
├── src/
│   ├── components/
│   │   ├── editor/               # CodeMirror 6 adaptado aos 8 temas
│   │   ├── layout/               # AppLayout, Sidebar, Topbar, UserMenuPopover, MobileBottomNav, ReferenceModal
│   │   ├── motion/               # InteractiveBackground, AmbientAurora, ClickSpark, SpotlightCard, BlurText, ShinyText
│   │   ├── onboarding/           # PersonalizationModal (3 etapas) e ProductTour interativo
│   │   ├── shared/               # ThemePalettePicker, CompletionCelebration, ProgressRing, TechIcon, Tooltip
│   │   └── workbenches/          # Workbenches (Código, Linux VFS, SQLite e Redes/VLSM)
│   ├── context/                  # PlatformContext (estado global, tema, metas, progresso e conquistas)
│   ├── data/                     # Currículo (58 aulas, 21 desafios), 8 paletas (themes.ts) e tour (onboardingSteps.ts)
│   ├── engines/                  # Interpretadores/compiladores isolados em Web Workers + VFS + Topologia IP
│   ├── pages/                    # Dashboard, Trilhas, Detalhe da Trilha, Aula, Roadmaps, Desafios, Labs, Conquistas, Histórico
│   └── styles/                   # tokens.css (8 paletas), base.css, components.css, motion.css
└── tests/
    └── verify-all.mjs            # 86 verificações automatizadas (infra, SQLite v4, motores, 58 aulas, 21 desafios)
```

---

## Privacidade e Armazenamento Local

Todos os dados do estudante (nome, paleta selecionada, meta diária, código salvo, progresso, histórico e conquistas) são armazenados localmente em `data/code-entry.db` (ignorado no controle de versão) e podem ser exportados ou importados em JSON pelo menu do perfil.
