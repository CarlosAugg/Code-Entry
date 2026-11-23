export type GlossaryCodeLanguage =
  | "logic"
  | "cpp"
  | "js"
  | "python"
  | "sql"
  | "html"
  | "css";

export interface GlossaryEntry {
  id: string;
  term: string;
  aliases: string[];
  translation?: string;
  category: "web" | "js" | "sql" | "python" | "cpp" | "logic" | "infra" | "architecture";
  languages?: GlossaryCodeLanguage[];
  shortExplanation: string;
  exampleContext?: string;
  roadmapTopicRef?: {
    roadmapId: string;
    nodeId: string;
    label: string;
  };
  matchInProse?: boolean;
  caseSensitive?: boolean;
}

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  // Web, HTML & CSS
  {
    id: "html5-semantic",
    term: "HTML semântico",
    aliases: ["HTML semântico", "HTML5", "tags semânticas", "elementos semânticos"],
    translation: "Marcação com significado estrutural",
    category: "web",
    languages: ["html"],
    shortExplanation:
      "Uso de elementos como <header>, <nav>, <main>, <section> e <footer> que informam ao navegador e a leitores de tela o papel de cada bloco.",
    exampleContext: "Substituir vários <div> genéricos por <main> e <section> melhora SEO e acessibilidade.",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-html-css", label: "HTML & CSS no Roadmap Frontend" },
  },
  {
    id: "html-header-tag",
    term: "<header>",
    aliases: ["<header>", "</header>", "header"],
    translation: "Cabeçalho introdutório",
    category: "web",
    languages: ["html"],
    matchInProse: false,
    shortExplanation:
      "Define a área de abertura de uma página ou seção, normalmente com título principal (<h1>), marca ou navegação inicial.",
    exampleContext: "<header><h1>Meu Portfólio</h1></header>",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-html-css", label: "HTML & CSS Semântico" },
  },
  {
    id: "html-main-tag",
    term: "<main>",
    aliases: ["<main>", "</main>", "main"],
    translation: "Conteúdo principal",
    category: "web",
    languages: ["html"],
    matchInProse: false,
    shortExplanation:
      "Marca o conteúdo central e único do documento, ajudando leitores de tela a pular direto para o que importa.",
    exampleContext: "Deve existir apenas um <main> visível por página.",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-html-css", label: "HTML & CSS Semântico" },
  },
  {
    id: "html-section-tag",
    term: "<section> / <article>",
    aliases: ["<section>", "<article>", "section", "article"],
    translation: "Seção temática / Artigo independente",
    category: "web",
    languages: ["html"],
    matchInProse: false,
    shortExplanation:
      "<section> agrupa blocos relacionados de um tema; <article> representa conteúdo autocontido que faria sentido isolado (ex.: card ou post).",
    exampleContext: "<main><section><h2>Projetos</h2>...</section></main>",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-html-css", label: "HTML & CSS Semântico" },
  },
  {
    id: "html-footer-tag",
    term: "<footer>",
    aliases: ["<footer>", "</footer>", "footer"],
    translation: "Rodapé",
    category: "web",
    languages: ["html"],
    matchInProse: false,
    shortExplanation:
      "Representa o fechamento de uma página ou seção, com autoria, links complementares ou créditos.",
    exampleContext: "<footer>Desenvolvido no Code Entry</footer>",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-html-css", label: "HTML & CSS Semântico" },
  },
  {
    id: "aria-label",
    term: "aria-label / WAI-ARIA",
    aliases: ["aria-label", "ARIA", "WAI-ARIA", "leitores de tela"],
    translation: "Rótulo de acessibilidade",
    category: "web",
    languages: ["html"],
    shortExplanation:
      "Atributo HTML que fornece um nome acessível lido por tecnologias assistivas quando o controle não tem texto visível completo.",
    exampleContext: '<button aria-label="Fechar janela">×</button>',
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-a11y-perf", label: "Acessibilidade & Performance" },
  },
  {
    id: "viewport",
    term: "Viewport",
    aliases: ["viewport"],
    translation: "Área visível da janela",
    category: "web",
    languages: ["html", "css"],
    shortExplanation:
      "É a região da tela onde a página web está sendo exibida no momento. Em celulares, a meta tag viewport evita redução artificial do layout.",
    exampleContext: '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-html-css", label: "Layout Responsivo" },
  },
  {
    id: "box-model",
    term: "Box Model",
    aliases: ["Box Model", "modelo de caixa"],
    translation: "Modelo de caixa do CSS",
    category: "web",
    languages: ["css"],
    shortExplanation:
      "Todo elemento HTML é renderizado como uma caixa composta por conteúdo interno, padding (preenchimento), border (borda) e margin (espaço externo).",
    exampleContext: "Usar box-sizing: border-box faz width incluir padding e border sem estourar o card.",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-html-css", label: "HTML & CSS" },
  },
  {
    id: "css-padding",
    term: "padding",
    aliases: ["padding"],
    translation: "Preenchimento interno",
    category: "web",
    languages: ["css"],
    shortExplanation:
      "Espaçamento interno entre o conteúdo do elemento e sua borda, deixando botões e cartões respirarem por dentro.",
    exampleContext: ".card { padding: 16px 20px; }",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-html-css", label: "Estilização no Roadmap" },
  },
  {
    id: "css-margin",
    term: "margin",
    aliases: ["margin"],
    translation: "Margem externa",
    category: "web",
    languages: ["css"],
    shortExplanation:
      "Espaçamento externo ao redor da borda de um elemento, afastando-o dos elementos vizinhos.",
    exampleContext: "h2 { margin-bottom: 12px; }",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-html-css", label: "Estilização no Roadmap" },
  },
  {
    id: "css-flexbox",
    term: "Flexbox",
    aliases: ["Flexbox", "display: flex", "flex"],
    translation: "Caixa flexível unidimensional",
    category: "web",
    languages: ["css"],
    shortExplanation:
      "Sistema de layout CSS para alinhar e distribuir itens em uma única dimensão (linha ou coluna) com controle fácil de eixo e espaçamento (gap).",
    exampleContext: ".toolbar { display: flex; align-items: center; gap: 12px; }",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-html-css", label: "HTML & CSS no Roadmap" },
  },
  {
    id: "css-grid",
    term: "CSS Grid",
    aliases: ["CSS Grid", "display: grid", "grid-template-columns"],
    translation: "Grade bidimensional",
    category: "web",
    languages: ["css"],
    shortExplanation:
      "Sistema de layout CSS bidimensional que controla linhas e colunas ao mesmo tempo — ideal para galerias, dashboards e grades responsivas.",
    exampleContext: "grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-html-css", label: "HTML & CSS no Roadmap" },
  },
  {
    id: "css-cascade",
    term: "Cascata e Especificidade",
    aliases: ["cascata", "especificidade"],
    translation: "Regra de desempate do CSS",
    category: "web",
    languages: ["css"],
    shortExplanation:
      "Mecanismo pelo qual o navegador decide qual estilo vence quando várias regras miram o mesmo elemento: ID (#) vence classe (.), que vence tag.",
    exampleContext: "Prefira classes reutilizáveis em vez de abusar de #id ou !important.",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-html-css", label: "HTML & CSS" },
  },
  {
    id: "css-media",
    term: "@media (Media Query)",
    aliases: ["@media", "media query", "media queries", "layout responsivo"],
    translation: "Consulta de mídia",
    category: "web",
    languages: ["css"],
    shortExplanation:
      "Regra CSS que aplica estilos condicionalmente conforme a largura da tela (viewport) ou preferências como redução de movimento.",
    exampleContext: "@media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-html-css", label: "Responsividade" },
  },
  {
    id: "dom",
    term: "DOM",
    aliases: ["DOM", "Document Object Model"],
    translation: "Modelo de Objeto do Documento",
    category: "js",
    languages: ["js", "html"],
    caseSensitive: true,
    shortExplanation:
      "Representação em árvore viva do HTML criada pelo navegador na memória, permitindo ao JavaScript ler textos, classes e responder a cliques.",
    exampleContext: "document.querySelector('h1') acessa um nó da árvore do DOM.",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-js-dom", label: "JavaScript & DOM no Roadmap" },
  },
  {
    id: "sandbox-web",
    term: "Sandbox isolado",
    aliases: ["sandbox", "CSP", "Content Security Policy"],
    translation: "Caixa de areia / Política de segurança",
    category: "web",
    languages: ["html", "js"],
    shortExplanation:
      "Ambiente isolado que executa código sem permissão para acessar dados sensíveis da página principal nem abrir conexões externas não autorizadas.",
    exampleContext: 'Um <iframe sandbox="allow-scripts"> sem allow-same-origin isola o código do aluno.',
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-web-security", label: "Segurança Web no Roadmap" },
  },

  // JavaScript & Browser APIs
  {
    id: "js-const",
    term: "const",
    aliases: ["const"],
    translation: "Referência constante",
    category: "js",
    languages: ["js", "logic"],
    matchInProse: false,
    shortExplanation:
      "Declara uma variável cuja referência não pode ser reatribuída depois da inicialização — é a escolha padrão para valores fixos ou objetos/elementos do DOM.",
    exampleContext: 'const titulo = document.querySelector("h1");',
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-js-dom", label: "JavaScript Moderno" },
  },
  {
    id: "js-let",
    term: "let",
    aliases: ["let"],
    translation: "Variável mutável em bloco",
    category: "js",
    languages: ["js"],
    matchInProse: false,
    shortExplanation:
      "Declara uma variável com escopo de bloco cujo valor pode mudar ao longo da execução, como contadores ou acumuladores.",
    exampleContext: "let cliques = 0; cliques += 1;",
    roadmapTopicRef: { roadmapId: "cs-foundations", nodeId: "cs-vars-control", label: "Variáveis e Controle" },
  },
  {
    id: "js-query-selector",
    term: "querySelector() / querySelectorAll()",
    aliases: ["document.querySelector", "document.querySelectorAll", "querySelector", "querySelectorAll", "getElementById"],
    translation: "Selecionar elemento(s) por seletor CSS",
    category: "js",
    languages: ["js"],
    shortExplanation:
      "Busca no DOM o primeiro elemento (querySelector) ou todos os elementos (querySelectorAll) que correspondem a um seletor CSS como #id ou .classe.",
    exampleContext: 'const botao = document.querySelector("#btn-somar");',
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-js-dom", label: "DOM no Roadmap Frontend" },
  },
  {
    id: "js-add-event-listener",
    term: "addEventListener()",
    aliases: ["addEventListener", "event listener", "evento de clique"],
    translation: "Ouvinte de evento",
    category: "js",
    languages: ["js"],
    shortExplanation:
      "Registra uma função (callback) para ser executada sempre que um evento acontecer em um elemento, como 'click', 'input' ou 'submit'.",
    exampleContext: 'botao.addEventListener("click", () => { /* responde ao clique */ });',
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-js-dom", label: "Eventos no Roadmap Frontend" },
  },
  {
    id: "js-prevent-default",
    term: "preventDefault()",
    aliases: ["event.preventDefault", "preventDefault"],
    translation: "Evitar comportamento padrão",
    category: "js",
    languages: ["js"],
    shortExplanation:
      "Cancela a ação automática do navegador para um evento — essencial no evento 'submit' de formulários para impedir que a página recarregue.",
    exampleContext: 'form.addEventListener("submit", (e) => { e.preventDefault(); });',
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-js-dom", label: "Interatividade no DOM" },
  },
  {
    id: "js-text-content",
    term: "textContent",
    aliases: ["textContent"],
    translation: "Conteúdo textual seguro",
    category: "js",
    languages: ["js"],
    shortExplanation:
      "Lê ou substitui apenas o texto visível dentro de um elemento do DOM, sem interpretar tags HTML (o que evita riscos de XSS).",
    exampleContext: 'contadorEl.textContent = String(total);',
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-js-dom", label: "Manipulação de DOM" },
  },
  {
    id: "js-class-list",
    term: "classList",
    aliases: ["classList"],
    translation: "Lista de classes CSS",
    category: "js",
    languages: ["js"],
    shortExplanation:
      "Propriedade do elemento HTML com métodos práticos como add(), remove() e toggle() para alternar estilos visuais pelo JavaScript.",
    exampleContext: 'card.classList.toggle("is-active");',
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-js-dom", label: "DOM & Estilos" },
  },
  {
    id: "js-console-log",
    term: "console.log()",
    aliases: ["console.log"],
    translation: "Registrar saída no console",
    category: "js",
    languages: ["js"],
    shortExplanation:
      "Exibe valores, objetos ou mensagens no console do navegador para inspecionar o fluxo do programa e depurar resultados.",
    exampleContext: 'console.log("Total calculado:", total);',
  },
  {
    id: "js-arrow-function",
    term: "Arrow Function",
    aliases: ["Arrow Function", "arrow functions", "=>"],
    translation: "Função de seta",
    category: "js",
    languages: ["js"],
    shortExplanation:
      "Sintaxe concisa para declarar funções em JavaScript: `(param) => expressão`. Muito usada em callbacks de arrays e listeners de eventos.",
    exampleContext: "const dobrados = numeros.map((n) => n * 2);",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-js-dom", label: "JavaScript Moderno" },
  },
  {
    id: "js-callback",
    term: "Callback",
    aliases: ["callback", "callbacks"],
    translation: "Função passada como argumento",
    category: "js",
    languages: ["js"],
    shortExplanation:
      "Uma função entregue a outra função ou método para ser chamada depois — por exemplo, a função executada pelo .filter() para cada item ou ao ocorrer um clique.",
    exampleContext: "itens.filter((item) => item.ativo)",
  },
  {
    id: "js-array",
    term: "Array",
    aliases: ["Array", "arrays"],
    translation: "Lista ordenada indexada",
    category: "js",
    languages: ["js", "logic"],
    shortExplanation:
      "Estrutura de dados que armazena múltiplos elementos em sequência, acessados por índice começando em 0 e manipulados por métodos como map, filter e reduce.",
    exampleContext: 'const linguagens = ["HTML", "CSS", "JS"];',
    roadmapTopicRef: { roadmapId: "cs-foundations", nodeId: "cs-data-structures", label: "Estruturas de Dados" },
  },
  {
    id: "js-filter",
    term: ".filter()",
    aliases: ["filter", ".filter("],
    translation: "Filtrar elementos por condição",
    category: "js",
    languages: ["js"],
    matchInProse: false,
    shortExplanation:
      "Cria um novo array contendo apenas os itens para os quais a função callback retornar verdadeiro, sem alterar o array original.",
    exampleContext: "const aprovados = alunos.filter((a) => a.nota >= 7);",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-js-dom", label: "JS Funcional" },
  },
  {
    id: "js-map",
    term: ".map()",
    aliases: ["map", ".map("],
    translation: "Transformar cada item em um novo array",
    category: "js",
    languages: ["js"],
    matchInProse: false,
    shortExplanation:
      "Percorre um array aplicando uma transformação em cada item e devolve um novo array com o mesmo tamanho.",
    exampleContext: "const nomes = usuarios.map((u) => u.nome);",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-js-dom", label: "JS Funcional" },
  },
  {
    id: "js-reduce",
    term: ".reduce()",
    aliases: ["reduce", ".reduce("],
    translation: "Reduzir coleção a um único valor",
    category: "js",
    languages: ["js"],
    matchInProse: false,
    shortExplanation:
      "Percorre o array mantendo um acumulador para consolidar todos os itens em um total, média, objeto ou resumo final.",
    exampleContext: "const soma = valores.reduce((acc, v) => acc + v, 0);",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-js-dom", label: "Agregação em JS" },
  },
  {
    id: "js-destructuring",
    term: "Desestruturação",
    aliases: ["desestruturação", "destructuring"],
    translation: "Extração direta de propriedades/itens",
    category: "js",
    languages: ["js"],
    shortExplanation:
      "Sintaxe que extrai propriedades de objetos ou posições de arrays diretamente para variáveis com menos repetição.",
    exampleContext: "const { nome, cidade } = usuario;",
  },
  {
    id: "js-template-string",
    term: "Template String",
    aliases: ["Template String", "template strings", "template literal"],
    translation: "Texto interpolado com crases",
    category: "js",
    languages: ["js"],
    shortExplanation:
      "String delimitada por crases (`...`) que permite embutir expressões com `${...}` e escrever texto em múltiplas linhas.",
    exampleContext: 'const msg = `Olá, ${nome}!`;',
  },
  {
    id: "js-async-await",
    term: "Promise / async & await",
    aliases: ["async/await", "async", "await", "Promise", "Promises", "assíncrono"],
    translation: "Código assíncrono legível",
    category: "js",
    languages: ["js"],
    shortExplanation:
      "Uma Promise representa uma operação que termina no futuro (como fetch). async/await permite esperar esse resultado sem travar a interface.",
    exampleContext: "const resp = await fetch('/api/dados');",
    roadmapTopicRef: { roadmapId: "full-stack", nodeId: "fs-js-interactivity", label: "Interatividade & Fetch" },
  },
  {
    id: "web-fetch-api",
    term: "API & fetch()",
    aliases: ["fetch", "API", "APIs"],
    translation: "Interface de Programação / Requisição HTTP",
    category: "architecture",
    languages: ["js"],
    shortExplanation:
      "API é o contrato de comunicação entre sistemas (ex.: frontend pedindo dados ao backend). No navegador, fetch() envia requisições HTTP assíncronas.",
    exampleContext: "fetch() retorna uma Promise com a resposta do servidor.",
    roadmapTopicRef: { roadmapId: "backend", nodeId: "be-apis", label: "APIs no Roadmap Backend" },
  },
  {
    id: "json",
    term: "JSON",
    aliases: ["JSON"],
    translation: "JavaScript Object Notation",
    category: "architecture",
    languages: ["js", "python"],
    caseSensitive: true,
    shortExplanation:
      "Formato leve e legível baseado em pares chave-valor e listas, usado como padrão universal para trocar dados entre APIs e guardar estados.",
    exampleContext: '{"nome": "Ada", "concluido": true}',
    roadmapTopicRef: { roadmapId: "backend", nodeId: "be-apis", label: "APIs JSON & REST" },
  },

  // SQL & Databases
  {
    id: "sql-select",
    term: "SELECT",
    aliases: ["SELECT"],
    translation: "Selecionar colunas",
    category: "sql",
    languages: ["sql"],
    caseSensitive: true,
    shortExplanation:
      "Comando inicial de uma consulta SQL para escolher quais colunas ou cálculos (como COUNT e SUM) devem aparecer no resultado.",
    exampleContext: "SELECT nome, preco FROM produtos;",
    roadmapTopicRef: { roadmapId: "data-sql", nodeId: "ds-sql-queries", label: "Consultas SQL" },
  },
  {
    id: "sql-where",
    term: "WHERE",
    aliases: ["WHERE"],
    translation: "Filtrar linhas",
    category: "sql",
    languages: ["sql"],
    caseSensitive: true,
    shortExplanation:
      "Filtra registros individuais da tabela antes de qualquer agrupamento (GROUP BY), mantendo apenas o que atende à condição.",
    exampleContext: "WHERE ativo = 1 AND preco > 50",
    roadmapTopicRef: { roadmapId: "data-sql", nodeId: "ds-sql-queries", label: "Filtros WHERE" },
  },
  {
    id: "sql-join",
    term: "INNER JOIN / LEFT JOIN",
    aliases: ["INNER JOIN", "LEFT JOIN", "JOIN"],
    translation: "Junção entre tabelas",
    category: "sql",
    languages: ["sql"],
    caseSensitive: true,
    shortExplanation:
      "INNER JOIN retorna apenas linhas com correspondência nos dois lados; LEFT JOIN mantém todas as linhas da tabela à esquerda mesmo sem par à direita.",
    exampleContext: "FROM pedidos p INNER JOIN clientes c ON c.id = p.cliente_id",
    roadmapTopicRef: { roadmapId: "data-sql", nodeId: "ds-modeling", label: "Modelagem e JOINs" },
  },
  {
    id: "sql-group-by",
    term: "GROUP BY / HAVING",
    aliases: ["GROUP BY", "HAVING"],
    translation: "Agrupamento e filtro de grupos",
    category: "sql",
    languages: ["sql"],
    caseSensitive: true,
    shortExplanation:
      "GROUP BY reúne linhas com o mesmo valor para aplicar funções como COUNT() ou SUM(); HAVING filtra os grupos já agregados.",
    exampleContext: "GROUP BY categoria HAVING COUNT(*) >= 2",
    roadmapTopicRef: { roadmapId: "data-sql", nodeId: "ds-sql-queries", label: "Agregação em SQL" },
  },
  {
    id: "sql-order-by",
    term: "ORDER BY",
    aliases: ["ORDER BY"],
    translation: "Ordenar resultados",
    category: "sql",
    languages: ["sql"],
    caseSensitive: true,
    shortExplanation:
      "Ordena as linhas retornadas por uma ou mais colunas em ordem crescente (ASC) ou decrescente (DESC).",
    exampleContext: "ORDER BY preco DESC LIMIT 5",
  },
  {
    id: "db-keys",
    term: "PRIMARY KEY / FOREIGN KEY",
    aliases: ["PRIMARY KEY", "FOREIGN KEY", "chave primária", "chave estrangeira"],
    translation: "Chave primária / Chave estrangeira",
    category: "sql",
    languages: ["sql"],
    shortExplanation:
      "PRIMARY KEY identifica unicamente cada registro na tabela; FOREIGN KEY referencia a chave primária de outra tabela para garantir integridade.",
    exampleContext: "cliente_id INTEGER REFERENCES clientes(id)",
    roadmapTopicRef: { roadmapId: "backend", nodeId: "be-relational-db", label: "Bancos Relacionais" },
  },
  {
    id: "db-acid",
    term: "ACID",
    aliases: ["ACID"],
    translation: "Atomicidade, Consistência, Isolamento, Durabilidade",
    category: "sql",
    caseSensitive: true,
    shortExplanation:
      "Conjunto de propriedades que garante transações confiáveis em bancos relacionais: ou todas as operações da transação concluem juntas, ou nenhuma permanece.",
    exampleContext: "Essencial em transferências bancárias ou fechamento de pedidos com estoque.",
    roadmapTopicRef: { roadmapId: "backend", nodeId: "be-db-internals", label: "Índices, Transações e ACID" },
  },
  {
    id: "db-subquery",
    term: "Subquery (Subconsulta)",
    aliases: ["subconsulta", "subconsultas", "subquery"],
    translation: "Consulta aninhada",
    category: "sql",
    languages: ["sql"],
    shortExplanation:
      "Uma instrução SELECT colocada dentro de outra consulta (no WHERE ou FROM) para comparar valores contra médias ou conjuntos dinâmicos.",
    exampleContext: "WHERE preco > (SELECT AVG(preco) FROM produtos)",
    roadmapTopicRef: { roadmapId: "data-sql", nodeId: "ds-sql-queries", label: "Subconsultas SQL" },
  },

  // Python, C++ & Logic
  {
    id: "py-print",
    term: "print() & f-string",
    aliases: ["f-string", "f-strings", "print"],
    translation: "Exibir no terminal / String formatada",
    category: "python",
    languages: ["python"],
    matchInProse: false,
    shortExplanation:
      "print() escreve valores na saída padrão; prefixar uma string com `f\"...\"` permite interpolar variáveis e formatação decimal (`{media:.1f}`).",
    exampleContext: 'print(f"Média: {media:.2f}")',
    roadmapTopicRef: { roadmapId: "cs-foundations", nodeId: "cs-syntax-track", label: "Fundamentos em Python" },
  },
  {
    id: "py-def",
    term: "def / return",
    aliases: ["def"],
    translation: "Definir função",
    category: "python",
    languages: ["python"],
    matchInProse: false,
    shortExplanation:
      "Palavra-chave em Python para criar uma função reutilizável com parâmetros e bloco indentado.",
    exampleContext: "def calcular_media(notas): return sum(notas) / len(notas)",
    roadmapTopicRef: { roadmapId: "cs-foundations", nodeId: "cs-functions", label: "Funções Modulares" },
  },
  {
    id: "py-range-len",
    term: "range() / len()",
    aliases: ["range", "len", "enumerate"],
    translation: "Sequência numérica / Comprimento",
    category: "python",
    languages: ["python"],
    matchInProse: false,
    shortExplanation:
      "len() retorna quantos itens existem em uma coleção; range(inicio, fim) gera uma sequência inteira para percorrer em laços `for`.",
    exampleContext: "for i in range(len(lista)):",
  },
  {
    id: "py-list-comp",
    term: "List Comprehension",
    aliases: ["List Comprehension", "list comprehensions"],
    translation: "Compreensão de lista",
    category: "python",
    languages: ["python"],
    shortExplanation:
      "Expressão pythônica para construir ou filtrar listas em uma linha legível (`[expr for item in colecao if condicao]`).",
    exampleContext: "pares = [n for n in numeros if n % 2 == 0]",
    roadmapTopicRef: { roadmapId: "data-sql", nodeId: "ds-python-analysis", label: "Python para Análise" },
  },
  {
    id: "cpp-cout-cin",
    term: "cout / cin / endl",
    aliases: ["cout", "cin", "getline", "endl"],
    translation: "Fluxos de saída e entrada C++",
    category: "cpp",
    languages: ["cpp"],
    matchInProse: false,
    shortExplanation:
      "std::cout envia dados formatados para a saída (<<) e std::cin / getline leem dados da entrada padrão (>> ou linha inteira).",
    exampleContext: 'cout << "Resultado: " << valor << endl;',
    roadmapTopicRef: { roadmapId: "cs-foundations", nodeId: "cs-syntax-track", label: "Linguagem Tipada (C++)" },
  },
  {
    id: "cpp-vector",
    term: "std::vector / push_back",
    aliases: ["vector", "push_back", "#include", "namespace"],
    translation: "Vetor dinâmico em C++",
    category: "cpp",
    languages: ["cpp"],
    matchInProse: false,
    shortExplanation:
      "std::vector<T> é uma lista dinâmica tipada da biblioteca padrão (<vector>) que cresce conforme você adiciona elementos com push_back().",
    exampleContext: "vector<int> notas; notas.push_back(9);",
    roadmapTopicRef: { roadmapId: "cs-foundations", nodeId: "cs-data-structures", label: "Estruturas em C++" },
  },
  {
    id: "logic-var",
    term: "var / inteiro / texto / logico",
    aliases: ["var", "inteiro", "texto", "logico"],
    translation: "Declarar variável na memória",
    category: "logic",
    languages: ["logic", "js"],
    matchInProse: false,
    shortExplanation:
      "Reserva uma 'caixa' rotulada na memória para guardar um texto, número ou valor lógico e reutilizá-lo pelo nome ao longo do algoritmo.",
    exampleContext: 'var curso = "Lógica de Programação"',
    roadmapTopicRef: { roadmapId: "cs-foundations", nodeId: "cs-vars-control", label: "Variáveis & Memória" },
  },
  {
    id: "logic-keywords",
    term: "escreva() / se / para / enquanto",
    aliases: ["escreva", "senao", "enquanto", "para", "retorne"],
    translation: "Comandos base do Portugol",
    category: "logic",
    languages: ["logic"],
    matchInProse: false,
    shortExplanation:
      "Estruturas essenciais da lógica algorítmica: saída (`escreva`), decisão condicional (`se`/`senao`), repetição (`para`/`enquanto`) e retorno de função.",
    exampleContext: 'se (nota >= 7) { escreva("Aprovado"); }',
    roadmapTopicRef: { roadmapId: "cs-foundations", nodeId: "cs-vars-control", label: "Lógica & Fluxo" },
  },
  {
    id: "prog-scope",
    term: "Escopo",
    aliases: ["escopo", "scope"],
    translation: "Área de visibilidade de uma variável",
    category: "logic",
    languages: ["js", "python", "cpp", "logic"],
    shortExplanation:
      "Define em quais partes do programa uma variável existe e pode ser acessada (ex.: dentro de uma função ou de um bloco `{ }`).",
    exampleContext: "Variáveis declaradas dentro de uma função não vazam para fora dela.",
    roadmapTopicRef: { roadmapId: "cs-foundations", nodeId: "cs-functions", label: "Funções e Escopo" },
  },

  // Infra, Security, Network & Architecture
  {
    id: "git-vcs",
    term: "Git & Branch",
    aliases: ["Git", "branch", "branches", "controle de versão"],
    translation: "Controle de versão / Ramificação",
    category: "architecture",
    caseSensitive: false,
    shortExplanation:
      "Git registra o histórico de alterações do código; uma branch cria uma linha paralela segura para desenvolver recursos antes de integrar na principal.",
    exampleContext: "Essencial para trabalhar em equipe sem sobrescrever código de colegas.",
    roadmapTopicRef: { roadmapId: "full-stack", nodeId: "fs-git", label: "Git & Versionamento" },
  },
  {
    id: "rest-graphql-grpc",
    term: "REST / GraphQL / gRPC",
    aliases: ["REST", "RESTful", "GraphQL", "gRPC"],
    translation: "Estilos e contratos de APIs",
    category: "architecture",
    shortExplanation:
      "Modelos de comunicação entre sistemas: REST usa recursos HTTP e JSON; GraphQL deixa o cliente escolher os campos exatos; gRPC usa Protobuf binário de alta velocidade.",
    exampleContext: "REST com JSON cobre a maioria das APIs web iniciais.",
    roadmapTopicRef: { roadmapId: "backend", nodeId: "be-apis", label: "APIs no Roadmap Backend" },
  },
  {
    id: "http-https",
    term: "HTTP / HTTPS",
    aliases: ["HTTP", "HTTPS", "TLS", "SSL"],
    translation: "Protocolo de transferência Web (Seguro)",
    category: "infra",
    caseSensitive: true,
    shortExplanation:
      "Protocolo cliente-servidor da Web baseado em requisições (GET, POST) e códigos de status (200, 404, 500). O HTTPS criptografa a troca com TLS.",
    exampleContext: "Todo tráfego de autenticação precisa rodar sobre HTTPS.",
    roadmapTopicRef: { roadmapId: "backend", nodeId: "be-internet-http", label: "Internet & HTTP" },
  },
  {
    id: "cors",
    term: "CORS",
    aliases: ["CORS"],
    translation: "Cross-Origin Resource Sharing",
    category: "web",
    caseSensitive: true,
    shortExplanation:
      "Política do navegador que controla se uma página em um domínio pode ler respostas de uma API hospedada em outra origem.",
    exampleContext: "Configure Access-Control-Allow-Origin apenas para origens confiáveis.",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-web-security", label: "Segurança Web" },
  },
  {
    id: "jwt-oauth",
    term: "JWT / OAuth",
    aliases: ["JWT", "OAuth", "autenticação"],
    translation: "JSON Web Token / Autorização delegada",
    category: "architecture",
    shortExplanation:
      "JWT representa declarações assinadas em formato compacto para validar sessões em APIs stateless; OAuth delega acesso seguro sem expor senhas.",
    exampleContext: "Tokens JWT devem ter expiração curta e assinatura verificada no backend.",
    roadmapTopicRef: { roadmapId: "backend", nodeId: "be-auth-security", label: "Autenticação & Segurança" },
  },
  {
    id: "ssr-ssg-pwa",
    term: "SSR / SSG / PWA",
    aliases: ["SSR", "SSG", "PWA", "PWAs"],
    translation: "Renderização no servidor / Estática / App Web Progressivo",
    category: "web",
    caseSensitive: true,
    shortExplanation:
      "SSR gera HTML no servidor por requisição; SSG pré-gera no build; PWA adiciona manifesto e service worker para experiência instalável e offline.",
    exampleContext: "Sites estáticos (SSG) como GitHub Pages carregam rápido sem backend próprio.",
    roadmapTopicRef: { roadmapId: "frontend", nodeId: "fe-ssr-meta", label: "SSR, SSG & Meta-frameworks" },
  },
  {
    id: "ci-cd",
    term: "CI / CD",
    aliases: ["CI/CD", "CI / CD", "integração contínua"],
    translation: "Integração e Entrega Contínuas",
    category: "infra",
    shortExplanation:
      "Automação que valida tipos, testes e build a cada alteração (CI) e publica a versão validada automaticamente em produção (CD).",
    exampleContext: "O Code Entry usa GitHub Actions para checar e publicar no GitHub Pages.",
    roadmapTopicRef: { roadmapId: "full-stack", nodeId: "fs-cicd-automation", label: "Automação CI/CD" },
  },
  {
    id: "linux-pipeline",
    term: "Pipeline / Pipe (|)",
    aliases: ["pipeline", "grep", "chmod", "stdout", "stdin"],
    translation: "Encadeamento de fluxos no terminal",
    category: "infra",
    shortExplanation:
      "Em Linux/Unix, o pipe (`|`) envia a saída padrão (stdout) de um comando para a entrada (stdin) do próximo (ex.: filtrar logs com `grep`). `chmod` ajusta permissões.",
    exampleContext: "cat app.log | grep ERROR | wc -l",
    roadmapTopicRef: { roadmapId: "systems-networks", nodeId: "sn-pipes-scripts", label: "Pipelines & Automação Shell" },
  },
  {
    id: "network-cidr-vlsm",
    term: "CIDR / Sub-rede / VLSM",
    aliases: ["CIDR", "VLSM", "sub-rede", "sub-redes", "máscara de rede"],
    translation: "Roteamento sem classes / Máscara de tamanho variável",
    category: "infra",
    shortExplanation:
      "Notação como `/24` ou `/26` que define quantos bits pertencem à rede vs. hosts; VLSM divide blocos de IP em tamanhos sob medida para evitar desperdício.",
    exampleContext: "192.168.10.0/26 suporta até 62 hosts utilizáveis.",
    roadmapTopicRef: { roadmapId: "systems-networks", nodeId: "sn-ipv4-subnet", label: "Sub-redes & VLSM" },
  },
  {
    id: "tcp-udp",
    term: "TCP / UDP",
    aliases: ["TCP", "UDP", "Modelo OSI"],
    translation: "Protocolos de transporte",
    category: "infra",
    caseSensitive: true,
    shortExplanation:
      "TCP garante entrega ordenada e confirmação (web, bancos, SSH); UDP prioriza baixa latência sem handshake pesado (DNS, vídeo ao vivo).",
    exampleContext: "HTTPS utiliza TCP na porta 443; consultas DNS comuns usam UDP na porta 53.",
    roadmapTopicRef: { roadmapId: "systems-networks", nodeId: "sn-osi-ports", label: "OSI, TCP/UDP & Portas" },
  },
  {
    id: "firewall-acl",
    term: "Firewall & ACL",
    aliases: ["ACL", "ACLs", "firewall"],
    translation: "Lista de Controle de Acesso",
    category: "infra",
    shortExplanation:
      "Regras ordenadas que permitem ou bloqueiam tráfego de rede por IP de origem/destino, protocolo e porta — avaliadas normalmente de cima para baixo.",
    exampleContext: "PERMIT TCP 10.0.0.0/24 -> DMZ:443 antes de um DENY ANY final.",
    roadmapTopicRef: { roadmapId: "systems-networks", nodeId: "sn-firewall-acl", label: "Firewall & Regras ACL" },
  },
  {
    id: "dns",
    term: "DNS",
    aliases: ["DNS"],
    translation: "Sistema de Nomes de Domínio",
    category: "infra",
    caseSensitive: true,
    shortExplanation:
      "Agenda da internet que traduz nomes legíveis (ex.: api.codeentry.dev) nos endereços IP reais dos servidores de destino.",
    exampleContext: "Registros A/AAAA apontam para IPs; CNAME aponta para outro domínio.",
    roadmapTopicRef: { roadmapId: "systems-networks", nodeId: "sn-dns-routing", label: "DNS & Roteamento" },
  },
  {
    id: "cache-latency",
    term: "Cache & Latência",
    aliases: ["cache", "caching", "latência"],
    translation: "Memória rápida intermediária",
    category: "architecture",
    shortExplanation:
      "Latência é o tempo de espera de uma resposta; cache guarda resultados recentes na memória (ex.: Redis ou cache HTTP) para responder muito mais rápido.",
    exampleContext: "Cache bem aplicado alivia consultas repetidas ao banco de dados.",
    roadmapTopicRef: { roadmapId: "backend", nodeId: "be-nosql-cache", label: "Cache & NoSQL no Roadmap" },
  },
];

export const GLOSSARY_MAP: Record<string, GlossaryEntry> = Object.fromEntries(
  GLOSSARY_ENTRIES.map(entry => [entry.id, entry])
);

export type ProseSegment =
  | { kind: "text"; text: string }
  | { kind: "term"; text: string; entry: GlossaryEntry };

interface CompiledAlias {
  alias: string;
  entry: GlossaryEntry;
}

const PROSE_ALIASES: CompiledAlias[] = (() => {
  const list: CompiledAlias[] = [];
  for (const entry of GLOSSARY_ENTRIES) {
    if (entry.matchInProse === false) continue;
    for (const alias of entry.aliases) {
      if (alias.trim().length >= 2) {
        list.push({ alias: alias.trim(), entry });
      }
    }
  }
  list.sort((a, b) => b.alias.length - a.alias.length);
  return list;
})();

function isWordBoundaryChar(ch: string | undefined): boolean {
  if (!ch) return true;
  return !/[A-Za-zÀ-ÿ0-9_$]/.test(ch);
}

/**
 * Quebra um bloco de texto didático em trechos normais e termos explicáveis do glossário.
 * Cada termo curado aparece no máximo uma vez por bloco (máx. 6 por parágrafo) para manter leitura limpa.
 */
export function tokenizeGlossaryProse(
  text: string,
  preferredCategories?: string[]
): ProseSegment[] {
  if (!text || text.length < 3) return [{ kind: "text", text }];

  const lowerText = text.toLowerCase();
  const seenEntries = new Set<string>();
  const matches: { start: number; end: number; entry: GlossaryEntry }[] = [];
  const maxMatches = 6;

  // Evita destacar palavras dentro de URLs completas
  const urlRanges: { start: number; end: number }[] = [];
  const urlRx = /https?:\/\/[^\s)]+/gi;
  let um: RegExpExecArray | null;
  while ((um = urlRx.exec(text)) !== null) {
    urlRanges.push({ start: um.index, end: um.index + um[0].length });
  }

  const orderedAliases = preferredCategories?.length
    ? [
        ...PROSE_ALIASES.filter(a => preferredCategories.includes(a.entry.category)),
        ...PROSE_ALIASES.filter(a => !preferredCategories.includes(a.entry.category)),
      ]
    : PROSE_ALIASES;

  for (const item of orderedAliases) {
    if (matches.length >= maxMatches) break;
    if (seenEntries.has(item.entry.id)) continue;

    const needle = item.entry.caseSensitive ? item.alias : item.alias.toLowerCase();
    const haystack = item.entry.caseSensitive ? text : lowerText;

    let searchFrom = 0;
    while (searchFrom < haystack.length) {
      const idx = haystack.indexOf(needle, searchFrom);
      if (idx === -1) break;
      const end = idx + item.alias.length;
      searchFrom = idx + 1;

      const startsWithWord = /[A-Za-zÀ-ÿ0-9_$]/.test(item.alias[0]);
      const endsWithWord = /[A-Za-zÀ-ÿ0-9_$]/.test(item.alias[item.alias.length - 1]);
      if (startsWithWord && !isWordBoundaryChar(text[idx - 1])) continue;
      if (endsWithWord && !isWordBoundaryChar(text[end])) continue;

      if (urlRanges.some(r => idx < r.end && end > r.start)) continue;
      if (matches.some(m => idx < m.end && end > m.start)) continue;

      matches.push({ start: idx, end, entry: item.entry });
      seenEntries.add(item.entry.id);
      break;
    }
  }

  if (matches.length === 0) return [{ kind: "text", text }];

  matches.sort((a, b) => a.start - b.start);
  const segments: ProseSegment[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start > cursor) {
      segments.push({ kind: "text", text: text.slice(cursor, m.start) });
    }
    segments.push({ kind: "term", text: text.slice(m.start, m.end), entry: m.entry });
    cursor = m.end;
  }
  if (cursor < text.length) {
    segments.push({ kind: "text", text: text.slice(cursor) });
  }
  return segments;
}

const COMPOUND_CODE_PATTERNS: { pattern: RegExp; entryId: string; langs: GlossaryCodeLanguage[] }[] = [
  { pattern: /\bdocument\.querySelectorAll\b/g, entryId: "js-query-selector", langs: ["js"] },
  { pattern: /\bdocument\.querySelector\b/g, entryId: "js-query-selector", langs: ["js"] },
  { pattern: /\bdocument\.getElementById\b/g, entryId: "js-query-selector", langs: ["js"] },
  { pattern: /\bconsole\.log\b/g, entryId: "js-console-log", langs: ["js"] },
  { pattern: /\bevent\.preventDefault\b/g, entryId: "js-prevent-default", langs: ["js"] },
  { pattern: /\bINNER\s+JOIN\b/g, entryId: "sql-join", langs: ["sql"] },
  { pattern: /\bLEFT\s+JOIN\b/g, entryId: "sql-join", langs: ["sql"] },
  { pattern: /\bGROUP\s+BY\b/g, entryId: "sql-group-by", langs: ["sql"] },
  { pattern: /\bORDER\s+BY\b/g, entryId: "sql-order-by", langs: ["sql"] },
  { pattern: /\bPRIMARY\s+KEY\b/g, entryId: "db-keys", langs: ["sql"] },
  { pattern: /\bFOREIGN\s+KEY\b/g, entryId: "db-keys", langs: ["sql"] },
  { pattern: /display\s*:\s*flex\b/g, entryId: "css-flexbox", langs: ["css"] },
  { pattern: /display\s*:\s*grid\b/g, entryId: "css-grid", langs: ["css"] },
];

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findGlossaryEntryForCodeToken(
  token: string,
  language?: GlossaryCodeLanguage,
  surroundingLine?: string
): GlossaryEntry | null {
  const clean = token.trim();
  if (!clean) return null;

  if (surroundingLine && clean.length >= 2) {
    const tokenWordRx = new RegExp(`(?:^|[^A-Za-z0-9_$])${escapeRegex(clean)}(?:$|[^A-Za-z0-9_$])`, "i");
    for (const comp of COMPOUND_CODE_PATTERNS) {
      if (language && !comp.langs.includes(language)) continue;
      comp.pattern.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = comp.pattern.exec(surroundingLine)) !== null) {
        if (
          m[0].toLowerCase() === clean.toLowerCase() ||
          tokenWordRx.test(m[0])
        ) {
          return GLOSSARY_MAP[comp.entryId] || null;
        }
      }
    }
  }

  for (const entry of GLOSSARY_ENTRIES) {
    if (language && entry.languages && !entry.languages.includes(language)) {
      continue;
    }
    if (!entry.languages) continue;
    for (const alias of entry.aliases) {
      const same = entry.caseSensitive
        ? alias === clean
        : alias.toLowerCase() === clean.toLowerCase();
      if (same) return entry;
    }
  }
  return null;
}

export function extractGlossaryTermsFromText(
  text: string,
  preferredCategories?: string[]
): GlossaryEntry[] {
  const seen = new Set<string>();
  const result: GlossaryEntry[] = [];
  for (const seg of tokenizeGlossaryProse(text, preferredCategories)) {
    if (seg.kind === "term" && !seen.has(seg.entry.id)) {
      seen.add(seg.entry.id);
      result.push(seg.entry);
    }
  }
  return result;
}
