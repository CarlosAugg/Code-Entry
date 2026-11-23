import type { Lesson } from "../../types/curriculum";
import { serializeWebFiles } from "../../engines/web/webFiles";

const m1 = { id: "web-m1", title: "Módulo 1 — HTML5 Semântico e Acessibilidade" };
const m2 = { id: "web-m2", title: "Módulo 2 — CSS: Cores, Tipografia e Box Model" };
const m3 = { id: "web-m3", title: "Módulo 3 — Layout Moderno com Flexbox, Grid e Responsividade" };
const m4 = { id: "web-m4", title: "Módulo 4 — JavaScript no Navegador, DOM e Eventos" };

export const WEB_LESSONS: Lesson[] = [
  {
    id: "web-01",
    trackId: "web",
    moduleId: m1.id,
    moduleTitle: m1.title,
    order: 1,
    title: "Estrutura HTML5 e Conteúdo Semântico",
    subtitle: "Organize páginas reais com header, main, section, listas e footer",
    difficulty: "Muito fácil",
    estimatedMinutes: 10,
    xp: 40,
    workbench: "web",
    summary:
      "Aprenda a dar significado estrutural ao conteúdo usando tags semânticas do HTML5 em vez de apenas blocos genéricos.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Por que usar HTML semântico?",
        content:
          "HTML não serve apenas para colocar texto na tela: cada tag informa ao navegador, aos leitores de tela e aos mecanismos de busca qual é o papel daquela informação. Usar <header>, <main>, <section> e <footer> deixa o código claro e acessível.",
      },
      {
        kind: "table",
        headers: ["Elemento", "Papel na página"],
        rows: [
          ["<header>", "Cabeçalho introdutório com título principal e identidade da página"],
          ["<main>", "Conteúdo principal e único da página (um por documento)"],
          ["<section>", "Bloco temático de conteúdo com subtítulo (ex.: <h2>)"],
          ["<ul> e <li>", "Lista não ordenada de itens relacionados"],
          ["<footer>", "Rodapé com autoria, créditos ou informações complementares"],
        ],
      },
      {
        kind: "callout",
        tone: "info",
        title: "Arquivo separado para cada responsabilidade",
        content:
          "Neste ambiente, index.html cuida da estrutura, style.css define a aparência e script.js controla o comportamento. Não é necessário repetir <link> ou <script> no HTML.",
      },
    ],
    examples: [
      {
        title: "Página de apresentação semântica",
        description: "Estrutura limpa com hierarquia de títulos h1 -> h2 e regiões bem definidas.",
        code: `<header>\n  <h1>Guia de Estudos</h1>\n</header>\n<main>\n  <section>\n    <h2>Temas da semana</h2>\n    <ul>\n      <li>HTML semântico</li>\n      <li>CSS moderno</li>\n    </ul>\n  </section>\n</main>\n<footer>Feito no Code Entry</footer>`,
      },
      {
        title: "Parágrafos e listas ordenadas",
        description: "Combine texto introdutório <p> com tópicos em lista <ul>.",
        code: `<section>\n  <h2>Objetivos</h2>\n  <p>Pratique criando marcas claras.</p>\n  <ul>\n    <li>Um único h1 por página</li>\n    <li>Seções bem organizadas</li>\n  </ul>\n</section>`,
      },
    ],
    prompt:
      "Em index.html, construa uma página de portfólio simples com <header> contendo um <h1> com seu título, um <main> contendo pelo menos uma <section> com <h2>, um parágrafo <p> e uma lista <ul> com no mínimo 3 itens <li>, e um <footer> ao final.",
    starterCode: serializeWebFiles({
      html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Meu Portfólio Web</title>
</head>
<body>
  <!-- Monte aqui o <header>, <main> (com <section>, <h2>, <p>, <ul>) e <footer> -->
  <h1>Meu Portfólio</h1>
</body>
</html>`,
      css: `body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}`,
      js: "",
    }),
    hints: [
      "Envolva o <h1> dentro da tag <header>...</header>.",
      "Abaixo do <header>, abra <main> e crie uma <section> com <h2>, <p> e uma lista <ul> contendo 3 tags <li>.",
      "Finalize o documento com <footer>Feito no Code Entry</footer> antes de fechar </body>.",
    ],
    webInspection: {
      selectors: ["header h1", "main", "main section", "main section h2", "main p", "ul li", "footer"],
    },
    objectives: [
      {
        id: "w01-header-h1",
        label: "Incluir um <header> com título principal <h1> preenchido",
        test: ctx => Boolean(ctx.web?.queries["header h1"]?.count && ctx.web.queries["header h1"].text.length > 0),
      },
      {
        id: "w01-main-section",
        label: "Criar região <main> com <section>, subtítulo <h2> e parágrafo <p>",
        test: ctx =>
          Boolean(
            ctx.web?.queries["main section"]?.count &&
              ctx.web?.queries["main section h2"]?.count &&
              ctx.web?.queries["main p"]?.count
          ),
      },
      {
        id: "w01-list",
        label: "Adicionar lista <ul> com pelo menos 3 itens <li>",
        test: ctx => (ctx.web?.queries["ul li"]?.count ?? 0) >= 3,
      },
      {
        id: "w01-footer",
        label: "Finalizar a página com um rodapé <footer> visível",
        test: ctx => Boolean(ctx.web?.queries["footer"]?.count && ctx.web.queries["footer"].text.length > 0),
      },
    ],
    referenceSolution: serializeWebFiles({
      html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Meu Portfólio Web</title>
</head>
<body>
  <header>
    <h1>Portfólio de Desenvolvimento Web</h1>
  </header>
  <main>
    <section>
      <h2>Habilidades em construção</h2>
      <p>Estou estruturando páginas acessíveis com HTML5 semântico.</p>
      <ul>
        <li>HTML5 Semântico</li>
        <li>CSS3 Responsivo</li>
        <li>JavaScript e DOM</li>
      </ul>
    </section>
  </main>
  <footer>Publicado no Code Entry</footer>
</body>
</html>`,
      css: `body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}`,
      js: "",
    }),
  },
  {
    id: "web-02",
    trackId: "web",
    moduleId: m1.id,
    moduleTitle: m1.title,
    order: 2,
    title: "Links, Imagens e Acessibilidade Básica",
    subtitle: "Use lang, alt descritivo, aria-label e formulários rotulados",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 50,
    workbench: "web",
    summary:
      "Garanta que todas as pessoas consigam navegar pela sua página aplicando idioma do documento, textos alternativos e rótulos em campos.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Acessibilidade começa no HTML",
        content:
          "Boas práticas de acessibilidade ajudam leitores de tela, navegação por teclado e manutenção do código. Sempre defina lang=\"pt-BR\" no <html>, descreva imagens no atributo alt, nomeie blocos <nav> com aria-label e vincule cada <input> a um <label for=\"...\">.",
      },
      {
        kind: "code",
        code: `<nav aria-label="Menu principal">\n  <a href="#sobre">Sobre</a>\n  <a href="#contato">Contato</a>\n</nav>\n\n<label for="email-aluno">E-mail:</label>\n<input id="email-aluno" type="email" placeholder="voce@exemplo.com" />`,
      },
    ],
    examples: [
      {
        title: "Imagem SVG embutida com texto alternativo",
        description: "Neste sandbox isolado, imagens funcionam via data:image/svg+xml sem depender de internet.",
        code: `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='12' fill='%23f97316'/%3E%3C/svg%3E" alt="Selo laranja do projeto" />`,
      },
      {
        title: "Navegação acessível e formulário rotulado",
        description: "O valor de 'for' no label deve ser exatamente igual ao 'id' do input.",
        code: `<nav aria-label="Navegação da página">\n  <a href="#projetos">Projetos</a>\n</nav>\n<label for="nome">Seu nome</label>\n<input id="nome" type="text" />\n<button type="submit">Enviar</button>`,
      },
    ],
    prompt:
      'Atualize index.html mantendo lang="pt-BR" no <html>. Crie uma <nav aria-label="..."> com pelo menos 2 links <a>, exiba a imagem <img> com atributo alt descritivo (não vazio), e adicione um formulário acessível contendo <label for="email"> vinculado ao <input id="email"> e um <button>.',
    starterCode: serializeWebFiles({
      html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Página Acessível</title>
</head>
<body>
  <nav>
    <a href="#perfil">Perfil</a>
  </nav>
  <main>
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Crect width='72' height='72' rx='16' fill='%23f97316'/%3E%3Ctext x='36' y='42' text-anchor='middle' fill='white' font-size='24' font-family='sans-serif'%3EWeb%3C/text%3E%3C/svg%3E" />
    <form>
      <!-- Associe um <label for="email"> ao <input id="email"> e inclua um <button> -->
      <input type="email" placeholder="aluno@codeentry.dev" />
    </form>
  </main>
</body>
</html>`,
      css: `body { font-family: system-ui, sans-serif; color: #0f172a; }
nav { display: flex; gap: 12px; margin-bottom: 16px; }
form { display: flex; flex-direction: column; gap: 8px; max-width: 280px; margin-top: 12px; }`,
      js: "",
    }),
    hints: [
      'Adicione aria-label="Menu principal" na tag <nav> e crie um segundo link <a> dentro dela.',
      'Na tag <img>, adicione alt="Logo do projeto Web" (ou outra descrição clara).',
      'No <form>, coloque <label for="email">E-mail de contato</label>, adicione id="email" no <input> e inclua um <button type="submit">Inscrever</button>.',
    ],
    webInspection: {
      selectors: ["nav", "nav a", "img", "label[for='email']", "input#email", "form button"],
    },
    objectives: [
      {
        id: "w02-nav",
        label: 'Definir <nav aria-label="..."> com pelo menos 2 links <a>',
        test: ctx =>
          Boolean(ctx.web?.queries["nav"]?.attrs["aria-label"]?.trim()) &&
          (ctx.web?.queries["nav a"]?.count ?? 0) >= 2,
      },
      {
        id: "w02-img-alt",
        label: "Incluir <img> com texto alternativo alt descritivo",
        test: ctx => Boolean(ctx.web?.queries["img"]?.count && ctx.web.queries["img"].attrs.alt?.trim().length),
      },
      {
        id: "w02-label-input",
        label: 'Vincular <label for="email"> a <input id="email"> junto de um <button>',
        test: ctx =>
          Boolean(
            ctx.web?.lang &&
              ctx.web?.queries["label[for='email']"]?.count &&
              ctx.web?.queries["input#email"]?.count &&
              ctx.web?.queries["form button"]?.count
          ),
      },
    ],
    referenceSolution: serializeWebFiles({
      html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Página Acessível</title>
</head>
<body>
  <nav aria-label="Menu principal">
    <a href="#perfil">Perfil</a>
    <a href="#contato">Contato</a>
  </nav>
  <main>
    <img
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Crect width='72' height='72' rx='16' fill='%23f97316'/%3E%3Ctext x='36' y='42' text-anchor='middle' fill='white' font-size='24' font-family='sans-serif'%3EWeb%3C/text%3E%3C/svg%3E"
      alt="Selo laranja com o texto Web"
    />
    <form>
      <label for="email">E-mail de contato</label>
      <input id="email" type="email" placeholder="aluno@codeentry.dev" />
      <button type="submit">Enviar</button>
    </form>
  </main>
</body>
</html>`,
      css: `body { font-family: system-ui, sans-serif; color: #0f172a; }
nav { display: flex; gap: 12px; margin-bottom: 16px; }
form { display: flex; flex-direction: column; gap: 8px; max-width: 280px; margin-top: 12px; }`,
      js: "",
    }),
  },
  {
    id: "web-03",
    trackId: "web",
    moduleId: m2.id,
    moduleTitle: m2.title,
    order: 3,
    title: "CSS: Seletores, Cascata, Cores e Tipografia",
    subtitle: "Estilize elementos por tag, classe (.destaque) e identificador (#titulo-principal)",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 55,
    workbench: "web",
    summary:
      "Aplique regras em style.css combinando seletores de elemento, classe e ID para definir cores contrastantes e tipografia legível.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Como funciona a especificidade e cascata?",
        content:
          "No CSS, seletores diferentes têm pesos distintos: um seletor por identificador (#id) tem mais especificidade do que uma classe (.classe), que por sua vez vence um seletor de tag (p ou h1). Quando duas regras têm a mesma força, vence a última declarada.",
      },
      {
        kind: "table",
        headers: ["Seletor", "Exemplo", "Uso indicado"],
        rows: [
          ["Elemento", "body { ... }", "Estilos base globais (fonte, cor padrão de texto e fundo)"],
          ["Classe", ".destaque { ... }", "Estilos reutilizáveis aplicáveis a vários elementos"],
          ["ID", "#titulo-principal { ... }", "Elemento único e específico na página"],
        ],
      },
    ],
    examples: [
      {
        title: "Fundo escuro com destaque em laranja",
        description: "Configure contraste alto entre texto e fundo.",
        code: `body {\n  background-color: #0f172a;\n  color: #e2e8f0;\n  font-family: Georgia, serif;\n  line-height: 1.6;\n}\n\n.destaque {\n  color: #fb923c;\n  font-weight: 700;\n}`,
      },
    ],
    prompt:
      "Sem alterar index.html, vá para a aba style.css e: (1) defina background-color e font-family no seletor body; (2) crie a regra #titulo-principal alterando color e font-size (ex.: 28px); (3) estilize .destaque com uma cor própria e font-weight em negrito; (4) ajuste line-height nos parágrafos p.",
    starterCode: serializeWebFiles({
      html: `<article class="artigo">
  <h1 id="titulo-principal">Tipografia e Cores na Web</h1>
  <p>A cascata define qual estilo vence quando há mais de uma regra.</p>
  <p class="destaque">Use contrastes confortáveis para facilitar a leitura!</p>
</article>`,
      css: `/* Escreva aqui suas regras para body, #titulo-principal, .destaque e p */
`,
      js: "",
    }),
    hints: [
      "Comece com body { background-color: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; }.",
      "Estilize #titulo-principal { color: #fb923c; font-size: 28px; } para destacar o título.",
      "Adicione .destaque { color: #38bdf8; font-weight: 700; } e p { line-height: 1.7; }.",
    ],
    webInspection: {
      selectors: ["body", "#titulo-principal", ".destaque", "p"],
      styleProps: ["background-color", "color", "font-family", "font-size", "font-weight", "line-height"],
    },
    objectives: [
      {
        id: "w03-body-style",
        label: "Estilizar body com background-color e font-family personalizados",
        test: ctx => {
          const css = ctx.web?.files.css || "";
          const bg = ctx.web?.queries["body"]?.styles["background-color"] || "";
          return /body\s*\{[\s\S]*background(-color)?\s*:/i.test(css) && /font-family\s*:/i.test(css) && Boolean(bg);
        },
      },
      {
        id: "w03-id-title",
        label: "Aplicar seletor #titulo-principal definindo color e font-size",
        test: ctx => {
          const css = ctx.web?.files.css || "";
          const q = ctx.web?.queries["#titulo-principal"];
          return Boolean(q?.count && /#titulo-principal/.test(css) && q.styles.color && q.styles["font-size"]);
        },
      },
      {
        id: "w03-class-highlight",
        label: "Criar regra .destaque com color e ajustar line-height dos parágrafos",
        test: ctx => {
          const css = ctx.web?.files.css || "";
          const q = ctx.web?.queries[".destaque"];
          const pLh = ctx.web?.queries["p"]?.styles["line-height"] || "";
          return Boolean(q?.count && /\.destaque/.test(css) && q.styles.color && pLh);
        },
      },
    ],
    referenceSolution: serializeWebFiles({
      html: `<article class="artigo">
  <h1 id="titulo-principal">Tipografia e Cores na Web</h1>
  <p>A cascata define qual estilo vence quando há mais de uma regra.</p>
  <p class="destaque">Use contrastes confortáveis para facilitar a leitura!</p>
</article>`,
      css: `body {
  background-color: #0f172a;
  color: #f8fafc;
  font-family: system-ui, -apple-system, sans-serif;
}

#titulo-principal {
  color: #fb923c;
  font-size: 28px;
}

.destaque {
  color: #38bdf8;
  font-weight: 700;
}

p {
  line-height: 1.7;
}`,
      js: "",
    }),
  },
  {
    id: "web-04",
    trackId: "web",
    moduleId: m2.id,
    moduleTitle: m2.title,
    order: 4,
    title: "Box Model: Padding, Border, Margin e Cartões",
    subtitle: "Controle espaçamento interno, bordas e largura previsível com border-box",
    difficulty: "Fácil",
    estimatedMinutes: 14,
    xp: 60,
    workbench: "web",
    summary:
      "Domine as 4 camadas do Box Model (content, padding, border, margin) criando um cartão estilizado bem espaçado.",
    theoryBlocks: [
      {
        kind: "text",
        title: "O Modelo de Caixa do CSS",
        content:
          "Todo elemento HTML é renderizado como uma caixa retangular composta por conteúdo, espaçamento interno (padding), borda (border) e margem externa (margin). Com box-sizing: border-box, padding e border ficam incluídos na largura declarada.",
      },
      {
        kind: "code",
        code: `.card {\n  box-sizing: border-box;\n  max-width: 360px;\n  padding: 20px;\n  margin: 16px auto;\n  border: 2px solid #cbd5e1;\n  border-radius: 14px;\n}`,
      },
    ],
    examples: [
      {
        title: "Cartão de aviso elegante",
        description: "Cantos arredondados e respiro interno criam leitura imediata.",
        code: `.card {\n  box-sizing: border-box;\n  padding: 18px;\n  border: 1px solid #f97316;\n  border-radius: 12px;\n  margin: 12px 0;\n  background-color: #fff7ed;\n}`,
      },
    ],
    prompt:
      "Na aba style.css, transforme o elemento .card em um cartão estilizado aplicando: box-sizing: border-box, max-width, padding de 20px, margin de 16px, border visível, border-radius de 12px e background-color.",
    starterCode: serializeWebFiles({
      html: `<section class="card">
  <h2>Plano de Prática</h2>
  <p>30 minutos por dia combinando HTML semântico e CSS limpo.</p>
</section>`,
      css: `.card {
  /* Aplique aqui box-sizing, padding, border, border-radius e margin */
}
`,
      js: "",
    }),
    hints: [
      "Comece declarando box-sizing: border-box; e max-width: 380px; dentro de .card { ... }.",
      "Adicione padding: 20px; e margin: 16px; para dar espaçamento interno e externo.",
      "Complete com border: 2px solid #f97316; border-radius: 12px; background-color: #fff7ed;.",
    ],
    webInspection: {
      selectors: [".card"],
      styleProps: ["box-sizing", "padding", "padding-top", "margin", "margin-top", "border-radius", "border-top-width", "background-color", "max-width"],
    },
    objectives: [
      {
        id: "w04-border-box",
        label: "Aplicar box-sizing: border-box em .card",
        test: ctx => ctx.web?.queries[".card"]?.styles["box-sizing"] === "border-box",
      },
      {
        id: "w04-spacing",
        label: "Definir padding (>= 16px) e margin em .card",
        test: ctx => {
          const css = ctx.web?.files.css || "";
          const s = ctx.web?.queries[".card"]?.styles;
          const pad = parseFloat(s?.["padding-top"] || s?.padding || "0");
          return Boolean(/margin\s*:/i.test(css) && pad >= 12);
        },
      },
      {
        id: "w04-border-radius",
        label: "Configurar border e border-radius em .card",
        test: ctx => {
          const css = ctx.web?.files.css || "";
          const s = ctx.web?.queries[".card"]?.styles;
          const rad = parseFloat(s?.["border-radius"] || s?.["border-top-left-radius"] || "0");
          return Boolean(/border\s*:/i.test(css) && rad > 0);
        },
      },
    ],
    referenceSolution: serializeWebFiles({
      html: `<section class="card">
  <h2>Plano de Prática</h2>
  <p>30 minutos por dia combinando HTML semântico e CSS limpo.</p>
</section>`,
      css: `.card {
  box-sizing: border-box;
  max-width: 380px;
  padding: 20px;
  margin: 16px;
  border: 2px solid #f97316;
  border-radius: 12px;
  background-color: #fff7ed;
}`,
      js: "",
    }),
  },
  {
    id: "web-05",
    trackId: "web",
    moduleId: m3.id,
    moduleTitle: m3.title,
    order: 5,
    title: "Flexbox, CSS Grid e Layout Responsivo",
    subtitle: "Alinhe cabeçalhos com Flex e crie grades adaptáveis com @media",
    difficulty: "Intermediário",
    estimatedMinutes: 16,
    xp: 75,
    workbench: "web",
    summary:
      "Combine display: flex para barras horizontais, display: grid para catálogos em colunas e media queries para adaptar em celulares.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Flexbox x CSS Grid",
        content:
          "Use Flexbox (display: flex) para alinhar itens em uma linha ou coluna (como menus e cabeçalhos). Use CSS Grid (display: grid) para organizar cartões em duas dimensões com linhas e colunas proporcionais (grid-template-columns: repeat(3, 1fr)).",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Teste no toggle Mobile (375px)!",
        content:
          "No cabeçalho da pré-visualização você pode alternar entre Desktop e Mobile para ver sua @media query entrando em ação em tempo real.",
      },
    ],
    examples: [
      {
        title: "Cabeçalho Flex + Grade responsiva",
        description: "Em telas menores que 600px, a grade muda para 1 coluna.",
        code: `.topo {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.grade {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 12px;\n}\n\n@media (max-width: 600px) {\n  .grade { grid-template-columns: 1fr; }\n}`,
      },
    ],
    prompt:
      "Em style.css: (1) torne .topo um contêiner Flexbox (display: flex) com align-items: center e justify-content: space-between; (2) configure .grade-cursos como CSS Grid (display: grid) com 3 colunas em desktop e gap de 12px; (3) inclua uma regra @media (max-width: 600px) reduzindo .grade-cursos para 1 coluna.",
    starterCode: serializeWebFiles({
      html: `<header class="topo">
  <strong>Code Entry Web</strong>
  <span>3 módulos</span>
</header>
<main class="grade-cursos">
  <article class="curso">HTML5</article>
  <article class="curso">CSS3</article>
  <article class="curso">DOM JS</article>
</main>`,
      css: `.topo {
  padding: 12px 16px;
  background-color: #f1f5f9;
  border-radius: 10px;
  margin-bottom: 14px;
}

.curso {
  padding: 16px;
  border-radius: 10px;
  background-color: #ffedd5;
  border: 1px solid #fb923c;
  font-weight: 600;
}
`,
      js: "",
    }),
    hints: [
      "Adicione display: flex; justify-content: space-between; align-items: center; dentro de .topo.",
      "Crie .grade-cursos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }.",
      "Ao final de style.css, inclua @media (max-width: 600px) { .grade-cursos { grid-template-columns: 1fr; } }.",
    ],
    webInspection: {
      selectors: [".topo", ".grade-cursos"],
      styleProps: ["display", "justify-content", "align-items", "gap", "grid-template-columns"],
    },
    objectives: [
      {
        id: "w05-flex",
        label: "Configurar .topo com display: flex e justify-content: space-between",
        test: ctx => {
          const s = ctx.web?.queries[".topo"]?.styles;
          return s?.display === "flex" && /space-between/i.test(ctx.web?.files.css || "");
        },
      },
      {
        id: "w05-grid",
        label: "Transformar .grade-cursos em display: grid com gap e colunas",
        test: ctx => {
          const s = ctx.web?.queries[".grade-cursos"]?.styles;
          return s?.display === "grid" && Boolean(s?.gap) && /grid-template-columns\s*:/i.test(ctx.web?.files.css || "");
        },
      },
      {
        id: "w05-media",
        label: "Adicionar regra responsiva @media adaptando .grade-cursos",
        test: ctx => /@media\s*\(/i.test(ctx.web?.files.css || "") && /1fr/i.test(ctx.web?.files.css || ""),
      },
    ],
    referenceSolution: serializeWebFiles({
      html: `<header class="topo">
  <strong>Code Entry Web</strong>
  <span>3 módulos</span>
</header>
<main class="grade-cursos">
  <article class="curso">HTML5</article>
  <article class="curso">CSS3</article>
  <article class="curso">DOM JS</article>
</main>`,
      css: `.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f1f5f9;
  border-radius: 10px;
  margin-bottom: 14px;
}

.grade-cursos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.curso {
  padding: 16px;
  border-radius: 10px;
  background-color: #ffedd5;
  border: 1px solid #fb923c;
  font-weight: 600;
}

@media (max-width: 600px) {
  .grade-cursos {
    grid-template-columns: 1fr;
  }
}`,
      js: "",
    }),
  },
  {
    id: "web-06",
    trackId: "web",
    moduleId: m4.id,
    moduleTitle: m4.title,
    order: 6,
    title: "JavaScript no Navegador: Variáveis, Funções e DOM",
    subtitle: "Selecione elementos, altere textos com textContent e alterne classes CSS",
    difficulty: "Intermediário",
    estimatedMinutes: 15,
    xp: 80,
    workbench: "web",
    summary:
      "Conecte o script.js à página HTML usando document.querySelector, textContent e classList para modificar elementos dinamicamente.",
    theoryBlocks: [
      {
        kind: "text",
        title: "O que é o DOM?",
        content:
          "Quando o navegador lê seu HTML, ele cria uma árvore de objetos chamada DOM (Document Object Model). Pelo JavaScript, podemos localizar qualquer nó com document.querySelector('#id') e atualizar texto (.textContent) ou classes visuais (.classList.add).",
      },
      {
        kind: "code",
        code: `function saudar(nome) {\n  return \`Bem-vindo(a), \${nome}!\`;\n}\n\nconst titulo = document.querySelector("#saudacao");\ntitulo.textContent = saudar("Marina");\ntitulo.classList.add("ativo");`,
      },
    ],
    examples: [
      {
        title: "Atualizando cartão de status pelo DOM",
        description: "Sempre prefira textContent para inserir texto puro sem riscos de HTML inesperado.",
        code: `const badge = document.querySelector("#status");\nbadge.textContent = "Conectado";\nbadge.classList.add("ativo");\nconsole.log("DOM atualizado:", badge.textContent);`,
      },
    ],
    prompt:
      'Em script.js: (1) declare a função formatarBoasVindas(nome) retornando uma saudação; (2) atualize #saudacao via document.querySelector para conter "Desenvolvimento Web"; (3) atualize #status para "Ativo no navegador" e adicione a classe CSS "ativo" usando classList.add; (4) registre no console.log o status atualizado.',
    starterCode: serializeWebFiles({
      html: `<section class="painel">
  <h1 id="saudacao">Aguardando script...</h1>
  <p id="status">Inativo</p>
</section>`,
      css: `.painel { padding: 18px; border-radius: 12px; border: 1px solid #cbd5e1; }
#status { display: inline-block; padding: 6px 12px; border-radius: 999px; background-color: #e2e8f0; font-weight: 600; }
#status.ativo { background-color: #dcfce7; color: #166534; }`,
      js: `// Selecione #saudacao e #status via document.querySelector
`,
    }),
    hints: [
      "Crie function formatarBoasVindas(curso) { return `Trilha: ${curso}`; }.",
      'Use const saudacaoEl = document.querySelector("#saudacao"); e saudacaoEl.textContent = formatarBoasVindas("Desenvolvimento Web");.',
      'Use const statusEl = document.querySelector("#status"); statusEl.textContent = "Ativo no navegador"; statusEl.classList.add("ativo"); console.log(statusEl.textContent);.',
    ],
    webInspection: {
      selectors: ["#saudacao", "#status"],
    },
    objectives: [
      {
        id: "w06-saudacao",
        label: 'Atualizar o texto de #saudacao via DOM para mencionar "Desenvolvimento Web"',
        test: ctx =>
          Boolean(
            ctx.web?.queries["#saudacao"]?.text.includes("Desenvolvimento Web") &&
              /querySelector|getElementById/.test(ctx.web?.files.js || "")
          ),
      },
      {
        id: "w06-status-class",
        label: 'Alterar #status para "Ativo no navegador" e aplicar a classe "ativo"',
        test: ctx =>
          Boolean(
            ctx.web?.queries["#status"]?.text === "Ativo no navegador" &&
              ctx.web.queries["#status"]?.classes.includes("ativo")
          ),
      },
      {
        id: "w06-console",
        label: "Registrar mensagem no console usando console.log",
        test: ctx => (ctx.web?.consoleEntries.filter(c => c.level === "log").length ?? 0) >= 1,
      },
    ],
    referenceSolution: serializeWebFiles({
      html: `<section class="painel">
  <h1 id="saudacao">Aguardando script...</h1>
  <p id="status">Inativo</p>
</section>`,
      css: `.painel { padding: 18px; border-radius: 12px; border: 1px solid #cbd5e1; }
#status { display: inline-block; padding: 6px 12px; border-radius: 999px; background-color: #e2e8f0; font-weight: 600; }
#status.ativo { background-color: #dcfce7; color: #166534; }`,
      js: `function formatarBoasVindas(curso) {
  return \`Bem-vindo(a) à trilha \${curso}!\`;
}

const saudacaoEl = document.querySelector("#saudacao");
const statusEl = document.querySelector("#status");

saudacaoEl.textContent = formatarBoasVindas("Desenvolvimento Web");
statusEl.textContent = "Ativo no navegador";
statusEl.classList.add("ativo");

console.log("Status atualizado:", statusEl.textContent);`,
    }),
  },
  {
    id: "web-07",
    trackId: "web",
    moduleId: m4.id,
    moduleTitle: m4.title,
    order: 7,
    title: "Eventos de Clique e Formulário Interativo",
    subtitle: "Reaja a ações reais com addEventListener e event.preventDefault()",
    difficulty: "Intermediário",
    estimatedMinutes: 18,
    xp: 90,
    workbench: "web",
    summary:
      "Escute eventos de clique e envio de formulário para atualizar a interface em resposta imediata ao usuário.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Escutando interações com addEventListener",
        content:
          "Em vez de executar tudo apenas quando a página carrega, registramos ouvintes (listeners) que disparam quando o usuário clica em um botão ('click') ou envia um formulário ('submit').",
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Por que usar event.preventDefault() em formulários?",
        content:
          "Por padrão, enviar um <form> tenta recarregar a página. Chamar event.preventDefault() dentro do listener de 'submit' cancela esse recarregamento para tratarmos os dados diretamente em JavaScript.",
      },
    ],
    examples: [
      {
        title: "Contador reativo + leitura de input no submit",
        description: "Combinação clássica de clique e formulário sem recarregar.",
        code: `let total = 0;\nconst btn = document.querySelector("#btn-somar");\nconst span = document.querySelector("#contador");\n\nbtn.addEventListener("click", () => {\n  total++;\n  span.textContent = String(total);\n});`,
      },
    ],
    prompt:
      'Em script.js: (1) ao clicar em #btn-somar, incremente uma variável de contagem e atualize o texto de #contador (que inicia em 0); (2) no evento "submit" de #form-saudacao, chame event.preventDefault(), leia o valor digitado em #campo-nome e exiba uma saudação contendo o nome em #resultado-saudacao.',
    starterCode: serializeWebFiles({
      html: `<section class="caixa">
  <div class="contador-box">
    <span>Cliques: <strong id="contador">0</strong></span>
    <button id="btn-somar" type="button">+1 Clique</button>
  </div>

  <form id="form-saudacao">
    <label for="campo-nome">Seu nome</label>
    <input id="campo-nome" type="text" placeholder="Digite seu nome..." />
    <button type="submit">Saudar</button>
  </form>
  <p id="resultado-saudacao"></p>
</section>`,
      css: `.caixa { display: flex; flex-direction: column; gap: 14px; max-width: 340px; }
.contador-box { display: flex; align-items: center; justify-content: space-between; padding: 12px; border-radius: 10px; background: #f8fafc; border: 1px solid #cbd5e1; }
form { display: flex; flex-direction: column; gap: 8px; }
button { padding: 8px 12px; border-radius: 8px; border: 0; background: #f97316; color: #fff; font-weight: 600; cursor: pointer; }
input { padding: 8px 10px; border-radius: 8px; border: 1px solid #cbd5e1; }`,
      js: `// Conecte addEventListener("click") em #btn-somar e addEventListener("submit") em #form-saudacao
`,
    }),
    hints: [
      'Crie let cliques = 0; e dentro de btnSomar.addEventListener("click", ...) faça cliques++; contadorEl.textContent = String(cliques);.',
      'No form.addEventListener("submit", event => { event.preventDefault(); ... }), leia campoNome.value.trim().',
      'Atualize resultadoEl.textContent = `Olá, ${nome}!`; quando o formulário for enviado.',
    ],
    webInspection: {
      selectors: ["#contador", "#btn-somar", "#form-saudacao", "#resultado-saudacao"],
      interactions: [
        { id: "somar", clickSelector: "#btn-somar", times: 2, observeSelector: "#contador" },
        {
          id: "enviar",
          fillSelector: "#campo-nome",
          fillValue: "Ana",
          submitSelector: "#form-saudacao",
          observeSelector: "#resultado-saudacao",
        },
      ],
    },
    objectives: [
      {
        id: "w07-click-counter",
        label: "Incrementar #contador ao clicar em #btn-somar (2 cliques -> resultado 2)",
        test: ctx => ctx.web?.interactions.somar?.ok === true && ctx.web.interactions.somar.text === "2",
      },
      {
        id: "w07-form-submit",
        label: 'Ao enviar #form-saudacao com "Ana", exibir mensagem com "Ana" em #resultado-saudacao',
        test: ctx =>
          Boolean(
            ctx.web?.interactions.enviar?.ok &&
              ctx.web.interactions.enviar.text?.includes("Ana") &&
              /preventDefault/.test(ctx.web?.files.js || "")
          ),
      },
      {
        id: "w07-no-runtime-error",
        label: "Executar sem erros de JavaScript no console",
        test: ctx => (ctx.web?.runtimeErrors.length ?? 1) === 0,
      },
    ],
    referenceSolution: serializeWebFiles({
      html: `<section class="caixa">
  <div class="contador-box">
    <span>Cliques: <strong id="contador">0</strong></span>
    <button id="btn-somar" type="button">+1 Clique</button>
  </div>

  <form id="form-saudacao">
    <label for="campo-nome">Seu nome</label>
    <input id="campo-nome" type="text" placeholder="Digite seu nome..." />
    <button type="submit">Saudar</button>
  </form>
  <p id="resultado-saudacao"></p>
</section>`,
      css: `.caixa { display: flex; flex-direction: column; gap: 14px; max-width: 340px; }
.contador-box { display: flex; align-items: center; justify-content: space-between; padding: 12px; border-radius: 10px; background: #f8fafc; border: 1px solid #cbd5e1; }
form { display: flex; flex-direction: column; gap: 8px; }
button { padding: 8px 12px; border-radius: 8px; border: 0; background: #f97316; color: #fff; font-weight: 600; cursor: pointer; }
input { padding: 8px 10px; border-radius: 8px; border: 1px solid #cbd5e1; }`,
      js: `let cliques = 0;
const btnSomar = document.querySelector("#btn-somar");
const contadorEl = document.querySelector("#contador");
const form = document.querySelector("#form-saudacao");
const campoNome = document.querySelector("#campo-nome");
const resultadoEl = document.querySelector("#resultado-saudacao");

btnSomar.addEventListener("click", () => {
  cliques++;
  contadorEl.textContent = String(cliques);
});

form.addEventListener("submit", event => {
  event.preventDefault();
  const nome = campoNome.value.trim() || "Estudante";
  resultadoEl.textContent = \`Olá, \${nome}! Evento processado sem recarregar a página.\`;
});`,
    }),
  },
  {
    id: "web-08",
    trackId: "web",
    moduleId: m4.id,
    moduleTitle: m4.title,
    order: 8,
    title: "Projeto Final: Lista de Estudos Interativa",
    subtitle: "Integre HTML5 semântico, CSS responsivo e JavaScript com criação de elementos DOM",
    difficulty: "Difícil",
    estimatedMinutes: 22,
    xp: 120,
    workbench: "web",
    summary:
      "Construa uma mini aplicação web completa integrando index.html, style.css e script.js com criação dinâmica de itens e marcação de conclusão.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Unindo estrutura, estilo e comportamento",
        content:
          "Neste projeto final você combina tudo o que aprendeu: estrutura semântica e formulário acessível em index.html, layout Flexbox/Box Model responsivo em style.css (incluindo estado .concluida), e criação dinâmica de nós com document.createElement('li') + eventos em script.js.",
      },
      {
        kind: "code",
        code: `const item = document.createElement("li");\nitem.textContent = texto;\nitem.addEventListener("click", () => {\n  item.classList.toggle("concluida");\n});\nlista.appendChild(item);`,
      },
    ],
    examples: [
      {
        title: "Criando e atualizando itens com segurança",
        description: "Limpe o campo após adicionar e recalcule o contador de tarefas.",
        code: `form.addEventListener("submit", e => {\n  e.preventDefault();\n  const valor = input.value.trim();\n  if (!valor) return;\n  const li = document.createElement("li");\n  li.textContent = valor;\n  lista.appendChild(li);\n  input.value = "";\n  contador.textContent = String(lista.querySelectorAll("li").length);\n});`,
      },
    ],
    prompt:
      'Complete os 3 arquivos do projeto: (1) em index.html, garanta <header>, <main>, <form id="form-tarefa"> com <label for="campo-tarefa">, <input id="campo-tarefa">, botão submit, contador <span id="contador">0</span> e lista <ul id="lista-tarefas"></ul>; (2) em style.css, estilize .app, .concluida (ex.: line-through) e adicione @media responsivo; (3) em script.js, adicione cada tarefa como <li> em #lista-tarefas, atualize #contador e alterne a classe "concluida" ao clicar no item.',
    starterCode: serializeWebFiles({
      html: `<header class="topo">
  <h1>Minha Lista de Estudos</h1>
</header>
<main class="app">
  <form id="form-tarefa">
    <label for="campo-tarefa">Nova tarefa</label>
    <input id="campo-tarefa" type="text" placeholder="Ex.: Revisar Flexbox" />
    <button type="submit">Adicionar</button>
  </form>
  <p>Total: <span id="contador">0</span></p>
  <ul id="lista-tarefas"></ul>
</main>`,
      css: `.app {
  max-width: 440px;
}
`,
      js: `// Implemente em #form-tarefa a adição de <li> em #lista-tarefas, atualização de #contador e toggle da classe "concluida" ao clicar no <li>
`,
    }),
    hints: [
      "Em style.css, defina .app com box-sizing: border-box; padding: 18px;, crie a classe .concluida { text-decoration: line-through; opacity: 0.65; } e adicione @media (max-width: 600px).",
      "Em script.js, escute 'submit' em #form-tarefa com event.preventDefault(). Ignore texto vazio com if (!texto) return;.",
      "Para cada tarefa válida, crie const li = document.createElement('li'), adicione listener click fazendo li.classList.toggle('concluida'), anexe com appendChild(li), limpe input.value e atualize #contador.",
    ],
    webInspection: {
      selectors: ["header", "main.app", "#form-tarefa", "label[for='campo-tarefa']", "#lista-tarefas", "#contador"],
      styleProps: ["box-sizing", "padding", "display"],
      interactions: [
        {
          id: "add1",
          fillSelector: "#campo-tarefa",
          fillValue: "Estudar HTML",
          submitSelector: "#form-tarefa",
          observeSelector: "#lista-tarefas li",
        },
        {
          id: "toggle1",
          clickSelector: "#lista-tarefas li",
          observeSelector: "#lista-tarefas li",
        },
        {
          id: "add2",
          fillSelector: "#campo-tarefa",
          fillValue: "Praticar CSS",
          submitSelector: "#form-tarefa",
          observeSelector: "#contador",
        },
      ],
    },
    objectives: [
      {
        id: "w08-structure",
        label: "Manter estrutura semântica (<header>, <main>) e rótulo acessível para #campo-tarefa",
        test: ctx =>
          Boolean(
            ctx.web?.queries["header"]?.count &&
              ctx.web?.queries["main.app"]?.count &&
              ctx.web?.queries["label[for='campo-tarefa']"]?.count
          ),
      },
      {
        id: "w08-css-responsive",
        label: "Estilizar .concluida e regra responsiva @media em style.css",
        test: ctx => {
          const css = ctx.web?.files.css || "";
          return /\.concluida\b/.test(css) && /@media\s*\(/i.test(css);
        },
      },
      {
        id: "w08-add-items",
        label: "Adicionar tarefas dinâmicas (<li>) e atualizar #contador ao enviar formulário",
        test: ctx =>
          Boolean(
            ctx.web?.interactions.add1?.ok &&
              ctx.web.interactions.add1.text?.includes("Estudar HTML") &&
              ctx.web?.interactions.add2?.ok &&
              ctx.web.interactions.add2.text === "2"
          ),
      },
      {
        id: "w08-toggle-done",
        label: 'Alternar a classe "concluida" ao clicar sobre um item da lista',
        test: ctx => Boolean(ctx.web?.interactions.toggle1?.ok && ctx.web.interactions.toggle1.classes?.includes("concluida")),
      },
    ],
    referenceSolution: serializeWebFiles({
      html: `<header class="topo">
  <h1>Minha Lista de Estudos</h1>
</header>
<main class="app">
  <form id="form-tarefa">
    <label for="campo-tarefa">Nova tarefa</label>
    <input id="campo-tarefa" type="text" placeholder="Ex.: Revisar Flexbox" />
    <button type="submit">Adicionar</button>
  </form>
  <p>Total: <span id="contador">0</span></p>
  <ul id="lista-tarefas"></ul>
</main>`,
      css: `* {
  box-sizing: border-box;
}

.topo {
  margin-bottom: 12px;
}

.app {
  max-width: 440px;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
  background-color: #f8fafc;
}

#form-tarefa {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

#lista-tarefas li {
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
}

#lista-tarefas li.concluida {
  text-decoration: line-through;
  opacity: 0.65;
}

@media (max-width: 600px) {
  .app {
    padding: 14px;
  }
  #form-tarefa {
    flex-direction: column;
    align-items: stretch;
  }
}`,
      js: `const form = document.querySelector("#form-tarefa");
const input = document.querySelector("#campo-tarefa");
const lista = document.querySelector("#lista-tarefas");
const contador = document.querySelector("#contador");

function atualizarContador() {
  contador.textContent = String(lista.querySelectorAll("li").length);
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const texto = input.value.trim();
  if (!texto) return;

  const li = document.createElement("li");
  li.textContent = texto;
  li.addEventListener("click", () => {
    li.classList.toggle("concluida");
  });
  lista.appendChild(li);
  input.value = "";
  atualizarContador();
});`,
    }),
  },
];
