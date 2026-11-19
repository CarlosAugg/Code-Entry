import type { Lesson } from "../../types/curriculum";

export const JS_LESSONS: Lesson[] = [
  {
    id: "js-01",
    trackId: "js",
    moduleId: "js-m1",
    moduleTitle: "Módulo 1 — Fundamentos ES2024",
    order: 1,
    title: "Variáveis, const e console.log",
    subtitle: "Declaração segura e tipos primitivos",
    difficulty: "Muito fácil",
    estimatedMinutes: 8,
    xp: 40,
    workbench: "code",
    summary: "Declare variáveis mutáveis e imutáveis em JavaScript moderno e exiba valores no console.",
    theoryBlocks: [
      {
        kind: "text",
        title: "const por padrão, let quando mudar",
        content:
          "Em JavaScript moderno evitamos var. Usamos const para referências que não serão reatribuídas e let quando o valor precisa evoluir ao longo do programa.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Boas práticas",
        content: "Usar const evita reatribuições acidentais e deixa explícita a intenção do código.",
      },
    ],
    examples: [
      {
        title: "Declarando e imprimindo",
        description: "Define uma constante de texto e um contador mutável.",
        code: `const plataforma = "Code Entry";\nlet exercicios = 1;\nexercicios = exercicios + 1;\nconsole.log(plataforma, exercicios);`,
        output: "Code Entry 2",
      },
    ],
    prompt:
      "Declare uma constante 'linguagem' com valor string (ex: \"JavaScript\"), uma variável let 'nivel' numérica (ex: 1) e imprima ambos usando console.log().",
    starterCode: `// Declare 'linguagem' usando const\n\n// Declare 'nivel' usando let\n\n// Exiba ambos com console.log()\n`,
    hints: [
      "Use const linguagem = \"JavaScript\" e let nivel = 1.",
      "Chame console.log(linguagem, nivel) para imprimir os dois valores na mesma linha.",
      'Código esperado:\nconst linguagem = "JavaScript";\nlet nivel = 1;\nconsole.log(linguagem, nivel);',
    ],
    objectives: [
      {
        id: "js01-const",
        label: "Declarar 'linguagem' com const (string)",
        test: ctx => /\bconst\s+linguagem\b/.test(ctx.code) && typeof ctx.scope.linguagem === "string" && String(ctx.scope.linguagem).length > 0,
      },
      {
        id: "js01-let",
        label: "Declarar 'nivel' com let (number)",
        test: ctx => /\blet\s+nivel\b/.test(ctx.code) && typeof ctx.scope.nivel === "number",
      },
      {
        id: "js01-log",
        label: "Exibir os valores com console.log()",
        test: ctx => ctx.success && /console\.log\s*\(/.test(ctx.code) && ctx.output.length > 0,
      },
    ],
    referenceSolution: `const linguagem = "JavaScript";\nlet nivel = 1;\nconsole.log(linguagem, nivel);`,
  },
  {
    id: "js-02",
    trackId: "js",
    moduleId: "js-m1",
    moduleTitle: "Módulo 1 — Fundamentos ES2024",
    order: 2,
    title: "Template Strings e Métodos de Texto",
    subtitle: "Crases `...${}`, .trim() e .toUpperCase()",
    difficulty: "Muito fácil",
    estimatedMinutes: 10,
    xp: 50,
    workbench: "code",
    summary: "Normalize strings sujas e construa frases limpas com interpolação de template literals.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Interpolação sem concatenação confusa",
        content:
          "Template strings usam crases (`) e permitem injetar expressões JavaScript diretamente com ${expressao}. Métodos como .trim() removem espaços das extremidades.",
      },
    ],
    examples: [
      {
        title: "Normalizando entrada de usuário",
        description: "Encadeia trim() e toLowerCase() antes de interpolar.",
        code: `const emailBruto = "  Dev@CodeEntry.IO  ";\nconst email = emailBruto.trim().toLowerCase();\nconsole.log(\`Contato: \${email}\`);`,
        output: "Contato: dev@codeentry.io",
      },
    ],
    prompt:
      "A partir de bruto = \"  ana silva  \", gere 'nomeLimpo' sem espaços nas pontas e em MAIÚSCULAS (.trim().toUpperCase()), crie 'mensagem' usando template string `${...}` contendo nomeLimpo e imprima 'mensagem'.",
    starterCode: `const bruto = "  ana silva  ";\n\n// 1. Gere nomeLimpo com .trim() e .toUpperCase()\n\n// 2. Monte mensagem usando crases e \${nomeLimpo}\n\n// 3. Imprima mensagem\n`,
    hints: [
      "Encadeie os métodos: const nomeLimpo = bruto.trim().toUpperCase();",
      "Use crases para montar a string: const mensagem = `Olá, ${nomeLimpo}!`;",
      "Por fim, adicione console.log(mensagem); para gerar saída no console.",
    ],
    objectives: [
      {
        id: "js02-clean",
        label: "Criar 'nomeLimpo' igual a \"ANA SILVA\"",
        test: ctx => ctx.code.includes(".trim") && ctx.code.includes(".toUpperCase") && ctx.scope.nomeLimpo === "ANA SILVA",
      },
      {
        id: "js02-tpl",
        label: "Construir 'mensagem' com template string `${...}` e imprimir",
        test: ctx =>
          ctx.success &&
          /`[^`]*\$\{[^}]+\}[^`]*`/.test(ctx.code) &&
          typeof ctx.scope.mensagem === "string" &&
          String(ctx.scope.mensagem).includes("ANA SILVA") &&
          ctx.outputText.includes("ANA SILVA"),
      },
    ],
    referenceSolution: `const bruto = "  ana silva  ";\nconst nomeLimpo = bruto.trim().toUpperCase();\nconst mensagem = \`Bem-vinda, \${nomeLimpo}!\`;\nconsole.log(mensagem);`,
  },
  {
    id: "js-03",
    trackId: "js",
    moduleId: "js-m1",
    moduleTitle: "Módulo 1 — Fundamentos ES2024",
    order: 3,
    title: "Condicionais e Operador Ternário",
    subtitle: "===, if/else e expressão ternária",
    difficulty: "Fácil",
    estimatedMinutes: 10,
    xp: 60,
    workbench: "code",
    summary: "Compare valores com igualdade estrita (===) e escreva regras condicionais concisas.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Por que usar === em vez de ==?",
        content:
          "O operador === compara valor E tipo sem coerção implícita ('5' === 5 é false). Já o operador ternário (cond ? A : B) funciona como um if/else em expressão única.",
      },
    ],
    examples: [
      {
        title: "Ternário em ação",
        description: "Define acesso conforme a permissão.",
        code: `const role = "admin";\nconst acesso = role === "admin" ? "Total" : "Restrito";\nconsole.log(acesso);`,
        output: "Total",
      },
    ],
    prompt:
      "Crie a função 'avaliarPontuacao(pontos)' que retorne \"Aprovado\" se pontos >= 70 ou \"Revisar\" caso contrário. Exiba o resultado para avaliarPontuacao(85).",
    starterCode: `function avaliarPontuacao(pontos) {\n  // Retorne "Aprovado" (>= 70) ou "Revisar"\n}\n\n// Chame avaliarPontuacao(85) e imprima com console.log()\n`,
    hints: [
      "Dentro de avaliarPontuacao(pontos), use if (pontos >= 70) return 'Aprovado'; else return 'Revisar';.",
      "Ou com ternário: return pontos >= 70 ? \"Aprovado\" : \"Revisar\";",
      "Lembre-se de chamar console.log(avaliarPontuacao(85)) no final.",
    ],
    objectives: [
      {
        id: "js03-fn",
        label: "Definir função avaliarPontuacao(pontos) e imprimir retorno",
        test: ctx => ctx.success && /\bevaluar|avaliarPontuacao\b/.test(ctx.code) && ctx.output.length > 0,
      },
    ],
    testCases: [
      { id: "tc-js03-1", label: "avaliarPontuacao(85) === 'Aprovado'", expression: "avaliarPontuacao(85)", assertReturnEquals: "Aprovado" },
      { id: "tc-js03-2", label: "avaliarPontuacao(70) === 'Aprovado'", expression: "avaliarPontuacao(70)", assertReturnEquals: "Aprovado" },
      { id: "tc-js03-3", label: "avaliarPontuacao(69) === 'Revisar'", expression: "avaliarPontuacao(69)", assertReturnEquals: "Revisar" },
    ],
    referenceSolution: `function avaliarPontuacao(pontos) {\n  return pontos >= 70 ? "Aprovado" : "Revisar";\n}\nconsole.log(avaliarPontuacao(85));`,
  },
  {
    id: "js-04",
    trackId: "js",
    moduleId: "js-m2",
    moduleTitle: "Módulo 2 — Estruturas e Laços",
    order: 4,
    title: "Arrays e Iteração com for...of",
    subtitle: "Coleções ordenadas e somatório",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 70,
    workbench: "code",
    summary: "Crie arrays dinâmicos, adicione itens com .push() e acumule valores com for...of.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Arrays mutáveis com referência const",
        content:
          "Declarar const lista = [] impede reatribuir a variável, mas permite modificar o array com .push(), .pop() e percorrer seus elementos diretamente com for (const item of lista).",
      },
    ],
    examples: [
      {
        title: "Somando itens de um array",
        description: "Percorre um array de latências em ms.",
        code: `const tempos = [12, 18, 10];\nlet soma = 0;\nfor (const t of tempos) {\n  soma += t;\n}\nconsole.log("Total:", soma);`,
        output: "Total: 40",
      },
    ],
    prompt:
      "Dado const valores = [15, 25, 10], adicione o número 50 usando .push(), calcule a soma total na variável 'soma' usando for...of e imprima 'soma'.",
    starterCode: `const valores = [15, 25, 10];\n// 1. Adicione 50 ao array valores usando .push()\n\nlet soma = 0;\n// 2. Percorra valores com for (const v of valores) acumulando em soma\n\n// 3. Imprima soma\n`,
    hints: [
      "Comece adicionando o elemento: valores.push(50);",
      "Use for (const v of valores) { soma += v; } para somar todos os números.",
      "Finalize com console.log(soma); — o resultado deve ser 100.",
    ],
    objectives: [
      {
        id: "js04-push",
        label: "Usar .push() e for...of sobre valores",
        test: ctx => ctx.code.includes(".push") && /\bfor\s*\([^)]*\bof\b/.test(ctx.code),
      },
      {
        id: "js04-sum",
        label: "Calcular soma === 100 e exibir",
        test: ctx => ctx.success && ctx.scope.soma === 100 && ctx.outputText.includes("100"),
      },
    ],
    referenceSolution: `const valores = [15, 25, 10];\nvalores.push(50);\nlet soma = 0;\nfor (const v of valores) {\n  soma += v;\n}\nconsole.log(soma);`,
  },
  {
    id: "js-05",
    trackId: "js",
    moduleId: "js-m2",
    moduleTitle: "Módulo 2 — Estruturas e Laços",
    order: 5,
    title: "Objetos e Desestruturação",
    subtitle: "Chave-valor e extração limpa",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 75,
    workbench: "code",
    summary: "Modele entidades em objetos JavaScript e extraia propriedades usando destructuring.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Desestruturação de objetos",
        content:
          "Em vez de repetir produto.nome e produto.preco várias vezes, extraímos propriedades em variáveis locais com const { nome, preco } = produto.",
      },
    ],
    examples: [
      {
        title: "Extraindo propriedades",
        description: "Desestrutura servidor e imprime resumo.",
        code: `const servidor = { host: "api-01", porta: 8080 };\nconst { host, porta } = servidor;\nconsole.log(\`\${host}:\${porta}\`);`,
        output: "api-01:8080",
      },
    ],
    prompt:
      "Use o objeto 'curso' abaixo, faça a desestruturação para extrair 'titulo' e 'cargaHoraria', crie 'resumo' com `${titulo} (${cargaHoraria}h)` e imprima 'resumo'.",
    starterCode: `const curso = {\n  titulo: "JavaScript Moderno",\n  cargaHoraria: 40,\n  ativo: true\n};\n\n// Desestruture titulo e cargaHoraria de curso\n\n// Monte resumo e imprima\n`,
    hints: [
      "A sintaxe de desestruturação é: const { titulo, cargaHoraria } = curso;",
      "Monte const resumo = `${titulo} (${cargaHoraria}h)`;",
      "Chame console.log(resumo); no final.",
    ],
    objectives: [
      {
        id: "js05-dest",
        label: "Usar desestruturação { titulo, cargaHoraria }",
        test: ctx => /const\s*\{[^}]*titulo[^}]*cargaHoraria[^}]*\}\s*=\s*curso/.test(ctx.code) || /const\s*\{[^}]*cargaHoraria[^}]*titulo[^}]*\}\s*=\s*curso/.test(ctx.code),
      },
      {
        id: "js05-out",
        label: "Gerar e imprimir resumo === 'JavaScript Moderno (40h)'",
        test: ctx => ctx.success && ctx.scope.resumo === "JavaScript Moderno (40h)" && ctx.outputText.includes("JavaScript Moderno (40h)"),
      },
    ],
    referenceSolution: `const curso = {\n  titulo: "JavaScript Moderno",\n  cargaHoraria: 40,\n  ativo: true\n};\nconst { titulo, cargaHoraria } = curso;\nconst resumo = \`\${titulo} (\${cargaHoraria}h)\`;\nconsole.log(resumo);`,
  },
  {
    id: "js-06",
    trackId: "js",
    moduleId: "js-m3",
    moduleTitle: "Módulo 3 — Funções Modernas e Pipelines",
    order: 6,
    title: "Arrow Functions Puras",
    subtitle: "Sintaxe => e retorno implícito",
    difficulty: "Intermediário",
    estimatedMinutes: 12,
    xp: 85,
    workbench: "code",
    summary: "Escreva arrow functions puras com retorno implícito e valide múltiplos cenários.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Funções curtas e previsíveis",
        content:
          "Arrow functions (params => expressão) permitem retorno implícito quando não usamos chaves. Funções puras sempre devolvem o mesmo resultado para as mesmas entradas sem efeitos colaterais.",
      },
    ],
    examples: [
      {
        title: "Arrow function de conversão",
        description: "Converte Celsius para Fahrenheit.",
        code: `const paraFahrenheit = c => (c * 9) / 5 + 32;\nconsole.log(paraFahrenheit(25));`,
        output: "77",
      },
    ],
    prompt:
      "Crie uma arrow function chamada 'calcularDesconto' que receba (preco, percentual) e retorne o preço com desconto arredondado em 2 casas (Number((preco * (1 - percentual / 100)).toFixed(2))). Imprima calcularDesconto(200, 15).",
    starterCode: `// Crie a arrow function: const calcularDesconto = (preco, percentual) => ...\n\n// Teste no console:\n`,
    hints: [
      "Use const calcularDesconto = (preco, percentual) => ...",
      "Multiplique preco * (1 - percentual / 100) e converta .toFixed(2) com Number(...) para retornar número.",
      "const calcularDesconto = (preco, percentual) => Number((preco * (1 - percentual / 100)).toFixed(2));",
    ],
    objectives: [
      {
        id: "js06-arrow",
        label: "Definir calcularDesconto usando arrow function (=>)",
        test: ctx => ctx.success && /\bconst\s+calcularDesconto\s*=.*=>/.test(ctx.code),
      },
    ],
    testCases: [
      { id: "tc-js06-1", label: "calcularDesconto(200, 15) === 170", expression: "calcularDesconto(200, 15)", assertReturnEquals: 170 },
      { id: "tc-js06-2", label: "calcularDesconto(99.9, 10) === 89.91", expression: "calcularDesconto(99.9, 10)", assertReturnEquals: 89.91 },
    ],
    referenceSolution: `const calcularDesconto = (preco, percentual) => Number((preco * (1 - percentual / 100)).toFixed(2));\nconsole.log(calcularDesconto(200, 15));`,
  },
  {
    id: "js-07",
    trackId: "js",
    moduleId: "js-m3",
    moduleTitle: "Módulo 3 — Funções Modernas e Pipelines",
    order: 7,
    title: "Pipeline Funcional: filter e map",
    subtitle: "Transformação declarativa de listas",
    difficulty: "Intermediário",
    estimatedMinutes: 14,
    xp: 95,
    workbench: "code",
    summary: "Filtre itens com .filter() e transforme dados com .map() sem alterar o array original.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Imutabilidade com filter e map",
        content:
          ".filter(fn) retorna um novo array apenas com itens que retornam true. .map(fn) transforma cada item mantendo o tamanho do array. Encadear ambos cria pipelines legíveis.",
      },
    ],
    examples: [
      {
        title: "Filtrando usuários ativos",
        description: "Extrai somente os nomes dos usuários ativos.",
        code: `const ativos = usuarios.filter(u => u.ativo).map(u => u.nome);`,
      },
    ],
    prompt:
      "A partir de 'produtos', gere o array 'nomesDisponiveis' contendo apenas o nome (string) dos produtos com estoque > 0, e gere 'precosComTaxa' aplicando +10% (preco * 1.1) nesses produtos disponíveis. Imprima ambos.",
    starterCode: `const produtos = [\n  { nome: "Mouse", preco: 100, estoque: 5 },\n  { nome: "Webcam", preco: 200, estoque: 0 },\n  { nome: "Teclado", preco: 300, estoque: 3 }\n];\n\n// 1. Filtre estoque > 0 e mapeie para obter os nomes em nomesDisponiveis\n\n// 2. Filtre estoque > 0 e mapeie para Math.round(p.preco * 1.1) em precosComTaxa\n\n// 3. Imprima os resultados\n`,
    hints: [
      "Primeiro filtre: const disponiveis = produtos.filter(p => p.estoque > 0);",
      "Depois use .map(p => p.nome) para nomesDisponiveis e .map(p => Math.round(p.preco * 1.1)) para precosComTaxa.",
      "Imprima com console.log(nomesDisponiveis, precosComTaxa).",
    ],
    objectives: [
      {
        id: "js07-methods",
        label: "Utilizar .filter() e .map()",
        test: ctx => ctx.code.includes(".filter") && ctx.code.includes(".map"),
      },
      {
        id: "js07-vals",
        label: "nomesDisponiveis = ['Mouse', 'Teclado'] e precosComTaxa = [110, 330]",
        test: ctx =>
          ctx.success &&
          JSON.stringify(ctx.scope.nomesDisponiveis) === JSON.stringify(["Mouse", "Teclado"]) &&
          JSON.stringify(ctx.scope.precosComTaxa) === JSON.stringify([110, 330]),
      },
    ],
    referenceSolution: `const produtos = [\n  { nome: "Mouse", preco: 100, estoque: 5 },\n  { nome: "Webcam", preco: 200, estoque: 0 },\n  { nome: "Teclado", preco: 300, estoque: 3 }\n];\nconst disponiveis = produtos.filter(p => p.estoque > 0);\nconst nomesDisponiveis = disponiveis.map(p => p.nome);\nconst precosComTaxa = disponiveis.map(p => Math.round(p.preco * 1.1));\nconsole.log(nomesDisponiveis, precosComTaxa);`,
  },
  {
    id: "js-08",
    trackId: "js",
    moduleId: "js-m3",
    moduleTitle: "Módulo 3 — Funções Modernas e Pipelines",
    order: 8,
    title: "Agregação com reduce()",
    subtitle: "Resumo financeiro de vendas",
    difficulty: "Difícil",
    estimatedMinutes: 16,
    xp: 115,
    workbench: "code",
    summary: "Combine filter() e reduce() em uma função testada para consolidar transações.",
    theoryBlocks: [
      {
        kind: "text",
        title: "O poder do reduce()",
        content:
          "array.reduce((acumulador, item) => ..., valorInicial) reduz uma coleção inteira a um único valor — seja uma soma, contagem ou um objeto de resumo.",
      },
    ],
    examples: [
      {
        title: "Somando totais",
        description: "Sempre passe o valor inicial (0) como segundo argumento.",
        code: `const total = itens.reduce((acc, item) => acc + item.valor, 0);`,
      },
    ],
    prompt:
      "Implemente a função 'resumirPedidos(pedidos)' que receba uma lista de { valor, pago } e retorne { quantidadePagos, totalPago }, considerando somente os itens onde pago === true.",
    starterCode: `function resumirPedidos(pedidos) {\n  // Filtre os pedidos pagos e use .reduce() para somar os valores\n  \n}\n\nconst amostra = [\n  { valor: 120, pago: true },\n  { valor: 80, pago: false },\n  { valor: 230, pago: true }\n];\nconsole.log(resumirPedidos(amostra));\n`,
    hints: [
      "Filtre os pedidos pagos com const pagos = pedidos.filter(p => p.pago === true);",
      "Some com const totalPago = pagos.reduce((acc, p) => acc + p.valor, 0);",
      "Retorne { quantidadePagos: pagos.length, totalPago }.",
    ],
    objectives: [
      {
        id: "js08-reduce",
        label: "Utilizar .reduce() dentro de resumirPedidos",
        test: ctx => ctx.success && ctx.code.includes(".reduce"),
      },
    ],
    testCases: [
      {
        id: "tc-js08-1",
        label: "Amostra [120 pago, 80 não, 230 pago] -> { quantidadePagos: 2, totalPago: 350 }",
        expression: "resumirPedidos([{ valor: 120, pago: true }, { valor: 80, pago: false }, { valor: 230, pago: true }])",
        assertReturnEquals: { quantidadePagos: 2, totalPago: 350 },
      },
      {
        id: "tc-js08-2",
        label: "Nenhum pedido pago -> { quantidadePagos: 0, totalPago: 0 }",
        expression: "resumirPedidos([{ valor: 50, pago: false }])",
        assertReturnEquals: { quantidadePagos: 0, totalPago: 0 },
      },
    ],
    referenceSolution: `function resumirPedidos(pedidos) {\n  const pagos = pedidos.filter(p => p.pago === true);\n  const totalPago = pagos.reduce((acc, p) => acc + p.valor, 0);\n  return { quantidadePagos: pagos.length, totalPago };\n}\nconsole.log(resumirPedidos([{ valor: 120, pago: true }, { valor: 80, pago: false }, { valor: 230, pago: true }]));`,
  },
];
