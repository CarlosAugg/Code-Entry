import type { Lesson } from "../../types/curriculum";

export const LOGIC_LESSONS: Lesson[] = [
  {
    id: "logic-01",
    trackId: "logic",
    moduleId: "logic-m1",
    moduleTitle: "Módulo 1 — Fundamentos de Lógica",
    order: 1,
    title: "Variáveis e Saída",
    subtitle: "Guardar dados e exibir com escreva()",
    difficulty: "Muito fácil",
    estimatedMinutes: 8,
    xp: 40,
    workbench: "code",
    summary: "Armazene texto e números na memória utilizando variáveis e exiba mensagens no console com escreva().",
    theoryBlocks: [
      {
        kind: "text",
        title: "Variáveis são caixas rotuladas na memória",
        content:
          "Todo algoritmo manipula dados na memória. Declarar uma variável (com var ou let) dá um nome legível a um valor para que possamos reutilizá-lo, combiná-lo e imprimi-lo na tela com escreva().",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Portugol flexível",
        content:
          "Você pode escrever usando var, inteiro, texto ou logico em português e imprimir vários valores separados por vírgula dentro de escreva(...).",
      },
    ],
    examples: [
      {
        title: "Declarando e exibindo dados",
        description: "Cria duas variáveis e as imprime na mesma linha.",
        code: `var curso = "Lógica de Programação"\nvar modulo = 1\nescreva("Iniciando:", curso, "| Módulo:", modulo)`,
        output: "Iniciando: Lógica de Programação | Módulo: 1",
      },
    ],
    prompt:
      "Crie duas variáveis na memória: 'nome' (um texto não vazio) e 'idade' (um número). Em seguida, exiba ambos na tela usando escreva().",
    starterCode: `// Declare as variáveis 'nome' (texto) e 'idade' (número)\n\n// Exiba os valores usando escreva()\n`,
    hints: [
      "Em Portugol, textos ficam entre aspas duplas e números vão sem aspas.",
      'Declare: var nome = "Ana" e var idade = 20.',
      'Código completo:\nvar nome = "Ana"\nvar idade = 20\nescreva("Olá,", nome, "Idade:", idade)',
    ],
    objectives: [
      {
        id: "lg01-nome",
        label: "Criar a variável de texto 'nome'",
        test: ctx => typeof ctx.scope.nome === "string" && String(ctx.scope.nome).trim().length > 0,
      },
      {
        id: "lg01-idade",
        label: "Criar a variável numérica 'idade'",
        test: ctx => typeof ctx.scope.idade === "number" && !Number.isNaN(ctx.scope.idade),
      },
      {
        id: "lg01-out",
        label: "Exibir saída no console usando escreva()",
        test: ctx =>
          ctx.success &&
          /(escreva|escreval|mostrar|imprima)/i.test(ctx.code) &&
          ctx.output.length > 0,
      },
    ],
    referenceSolution: `var nome = "Ana"\nvar idade = 20\nescreva("Olá,", nome, "Idade:", idade)`,
  },
  {
    id: "logic-02",
    trackId: "logic",
    moduleId: "logic-m1",
    moduleTitle: "Módulo 1 — Fundamentos de Lógica",
    order: 2,
    title: "Expressões e Média",
    subtitle: "Operadores aritméticos e precedência",
    difficulty: "Muito fácil",
    estimatedMinutes: 10,
    xp: 50,
    workbench: "code",
    summary: "Combine soma, divisão e parênteses para calcular médias sem erros de precedência.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Ordem de precedência importa",
        content:
          "Multiplicação (*) e divisão (/) têm prioridade sobre adição (+) e subtração (-). Escrever nota1 + nota2 + nota3 / 3 divide apenas a última nota; os parênteses garantem que a soma aconteça antes.",
      },
    ],
    examples: [
      {
        title: "Calculando média de duas notas",
        description: "Usa parênteses para agrupar o numerador.",
        code: `var p1 = 7\nvar p2 = 9\nvar media = (p1 + p2) / 2\nescreva("Média:", media)`,
        output: "Média: 8",
      },
    ],
    prompt:
      "Defina nota1 = 8, nota2 = 7 e nota3 = 9. Calcule a média aritmética correta na variável 'media' e exiba o resultado com escreva().",
    starterCode: `var nota1 = 8\nvar nota2 = 7\nvar nota3 = 9\n\n// Calcule a média na variável 'media' usando parênteses\n\n// Exiba 'media' com escreva()\n`,
    hints: [
      "Sem parênteses, a divisão acontece antes da soma.",
      "Escreva: var media = (nota1 + nota2 + nota3) / 3",
      "Por fim imprima com escreva(media) — o resultado esperado é 8.",
    ],
    objectives: [
      {
        id: "lg02-notas",
        label: "Definir nota1, nota2 e nota3 como números",
        test: ctx =>
          typeof ctx.scope.nota1 === "number" &&
          typeof ctx.scope.nota2 === "number" &&
          typeof ctx.scope.nota3 === "number",
      },
      {
        id: "lg02-media",
        label: "Calcular 'media' corretamente",
        test: ctx =>
          typeof ctx.scope.media === "number" &&
          Math.abs(
            Number(ctx.scope.media) -
              (Number(ctx.scope.nota1) + Number(ctx.scope.nota2) + Number(ctx.scope.nota3)) / 3
          ) < 0.01,
      },
      {
        id: "lg02-out",
        label: "Exibir resultado com escreva()",
        test: ctx => ctx.success && ctx.output.length > 0,
      },
    ],
    referenceSolution: `var nota1 = 8\nvar nota2 = 7\nvar nota3 = 9\nvar media = (nota1 + nota2 + nota3) / 3\nescreva(media)`,
  },
  {
    id: "logic-03",
    trackId: "logic",
    moduleId: "logic-m1",
    moduleTitle: "Módulo 1 — Fundamentos de Lógica",
    order: 3,
    title: "Lógica Booleana",
    subtitle: "verdadeiro, falso, e, ou, nao",
    difficulty: "Fácil",
    estimatedMinutes: 10,
    xp: 60,
    workbench: "code",
    summary: "Construa expressões booleanas que combinam múltiplas condições com operadores lógicos.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Álgebra booleana na base das decisões",
        content:
          "O operador E exige que todas as condições sejam verdadeiras. O operador OU exige apenas uma verdadeira. O operador NAO inverte o valor lógico (verdadeiro vira falso).",
      },
    ],
    examples: [
      {
        title: "Validando acesso a um laboratório",
        description: "Combina permissão booleana e comparação numérica.",
        code: `var crachaAtivo = verdadeiro\nvar nivel = 2\nvar acesso = crachaAtivo e nivel >= 2\nescreva(acesso)`,
        output: "verdadeiro",
      },
    ],
    prompt:
      "Um evento exige que o participante tenha ingresso E idade >= 18. Crie 'temIngresso' (lógico), 'idade' (número) e calcule 'podeEntrar' usando o operador 'e'. Exiba 'podeEntrar'.",
    starterCode: `var temIngresso = verdadeiro\nvar idade = 19\n\n// Calcule 'podeEntrar' combinando temIngresso e idade >= 18\n\n// Imprima 'podeEntrar' com escreva()\n`,
    hints: [
      "Use o operador lógico 'e' entre duas expressões booleanas.",
      "Escreva: var podeEntrar = temIngresso e idade >= 18.",
      "Imprima com escreva(podeEntrar).",
    ],
    objectives: [
      {
        id: "lg03-bool",
        label: "Definir 'temIngresso' como valor lógico",
        test: ctx => typeof ctx.scope.temIngresso === "boolean",
      },
      {
        id: "lg03-expr",
        label: "Calcular 'podeEntrar' com operador lógico e exibir",
        test: ctx =>
          ctx.success &&
          typeof ctx.scope.podeEntrar === "boolean" &&
          ctx.scope.podeEntrar === (Boolean(ctx.scope.temIngresso) && Number(ctx.scope.idade) >= 18) &&
          /(?:^|\W)(e|ou|nao|não|&&|\|\||!)(?:\W|$)/i.test(ctx.code) &&
          ctx.output.length > 0,
      },
    ],
    referenceSolution: `var temIngresso = verdadeiro\nvar idade = 19\nvar podeEntrar = temIngresso e idade >= 18\nescreva(podeEntrar)`,
  },
  {
    id: "logic-04",
    trackId: "logic",
    moduleId: "logic-m2",
    moduleTitle: "Módulo 2 — Decisões",
    order: 4,
    title: "Condicional se / senao",
    subtitle: "Desvios de fluxo por condição",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 70,
    workbench: "code",
    summary: "Ensine o algoritmo a escolher entre dois caminhos distintos conforme o valor de uma condição.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Ramificação condicional",
        content:
          "Com se / senao o algoritmo avalia uma expressão booleana e decide qual bloco executar. Você pode usar chaves { ... } ou blocos Portugol se ... entao ... senao ... fimse.",
      },
    ],
    examples: [
      {
        title: "Verificando maioridade",
        description: "Atribui resultado conforme a idade.",
        code: `var idade = 20\nse (idade >= 18) {\n  escreva("Maior de idade")\n} senao {\n  escreva("Menor de idade")\n}`,
        output: "Maior de idade",
      },
    ],
    prompt:
      "Defina uma variável numérica 'media'. Use 'se' e 'senao' para guardar em 'situacao' o texto \"Aprovado\" (quando media >= 7) ou \"Reprovado\" (< 7), e imprima 'situacao'.",
    starterCode: `var media = 7.5\nvar situacao = ""\n\n// Use se (media >= 7) { ... } senao { ... } para definir situacao\n\nescreva(situacao)\n`,
    hints: [
      "Compare se (media >= 7) para o caminho de aprovação.",
      'No bloco se, atribua situacao = "Aprovado"; no senao, situacao = "Reprovado".',
      'se (media >= 7) {\n  situacao = "Aprovado"\n} senao {\n  situacao = "Reprovado"\n}',
    ],
    objectives: [
      {
        id: "lg04-cond",
        label: "Utilizar estrutura condicional se / senao",
        test: ctx => /\b(se|if)\b/i.test(ctx.code) && /\b(senao|senão|else)\b/i.test(ctx.code),
      },
      {
        id: "lg04-res",
        label: "Definir 'situacao' corretamente e exibir",
        test: ctx =>
          ctx.success &&
          typeof ctx.scope.media === "number" &&
          ctx.scope.situacao === (Number(ctx.scope.media) >= 7 ? "Aprovado" : "Reprovado") &&
          ctx.output.length > 0,
      },
    ],
    referenceSolution: `var media = 7.5\nvar situacao = ""\nse (media >= 7) {\n  situacao = "Aprovado"\n} senao {\n  situacao = "Reprovado"\n}\nescreva(situacao)`,
  },
  {
    id: "logic-05",
    trackId: "logic",
    moduleId: "logic-m2",
    moduleTitle: "Módulo 2 — Decisões",
    order: 5,
    title: "Classificador de Conceitos",
    subtitle: "Decisões encadeadas em função",
    difficulty: "Intermediário",
    estimatedMinutes: 14,
    xp: 85,
    workbench: "code",
    summary: "Encadeie múltiplas faixas de decisão em ordem lógica dentro de uma função testável.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Ordem decrescente evita brechas",
        content:
          "Ao classificar faixas com senao se, avalie do limite mais alto para o mais baixo (>= 9, >= 7, >= 5) para que um valor maior não caia na regra errada.",
      },
    ],
    examples: [
      {
        title: "Classificador em função",
        description: "Devolve o conceito com retorne.",
        code: `funcao faixa(v) {\n  se (v >= 100) { retorne "Alto" }\n  senao se (v >= 50) { retorne "Médio" }\n  senao { retorne "Baixo" }\n}`,
      },
    ],
    prompt:
      "Implemente a função 'classificarNota(nota)' que retorne \"A\" (>= 9), \"B\" (>= 7), \"C\" (>= 5) ou \"D\" (< 5). Exiba classificarNota(8.5) no console.",
    starterCode: `funcao classificarNota(nota) {\n  // Retorne "A", "B", "C" ou "D" usando se / senao se / senao\n  \n}\n\nescreva(classificarNota(8.5))\n`,
    hints: [
      'Comece testando se (nota >= 9) { retorne "A" }.',
      'Continue com senao se (nota >= 7) { retorne "B" } e senao se (nota >= 5) { retorne "C" }.',
      'Finalize com senao { retorne "D" }.',
    ],
    objectives: [
      {
        id: "lg05-fn",
        label: "Definir função classificarNota(nota)",
        test: ctx => ctx.success && /\bclassificarNota\b/.test(ctx.code) && ctx.output.length > 0,
      },
    ],
    testCases: [
      { id: "tc-lg05-1", label: "classificarNota(9.5) == 'A'", expression: "classificarNota(9.5)", assertReturnEquals: "A" },
      { id: "tc-lg05-2", label: "classificarNota(7.5) == 'B'", expression: "classificarNota(7.5)", assertReturnEquals: "B" },
      { id: "tc-lg05-3", label: "classificarNota(5.5) == 'C'", expression: "classificarNota(5.5)", assertReturnEquals: "C" },
      { id: "tc-lg05-4", label: "classificarNota(3.0) == 'D'", expression: "classificarNota(3.0)", assertReturnEquals: "D" },
    ],
    referenceSolution: `funcao classificarNota(nota) {\n  se (nota >= 9) {\n    retorne "A"\n  } senao se (nota >= 7) {\n    retorne "B"\n  } senao se (nota >= 5) {\n    retorne "C"\n  } senao {\n    retorne "D"\n  }\n}\n\nescreva(classificarNota(8.5))`,
  },
  {
    id: "logic-06",
    trackId: "logic",
    moduleId: "logic-m3",
    moduleTitle: "Módulo 3 — Repetições e Listas",
    order: 6,
    title: "Laço enquanto e Acumulador",
    subtitle: "Soma progressiva de 1 a 10",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 80,
    workbench: "code",
    summary: "Combine contador e acumulador dentro de um laço enquanto até atingir a condição de parada.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Todo laço precisa convergir para o fim",
        content:
          "No laço enquanto (condicao), se você esquecer de atualizar o contador dentro do bloco, a condição continua verdadeira para sempre (loop infinito).",
      },
    ],
    examples: [
      {
        title: "Contando até 5",
        description: "Incrementa contador a cada volta.",
        code: `var i = 1\nenquanto (i <= 5) {\n  escreva(i)\n  i++\n}`,
      },
    ],
    prompt:
      "Some todos os inteiros de 1 até 10 usando um laço 'enquanto' e guarde o total na variável 'soma' (resultado 55). Exiba 'soma' com escreva().",
    starterCode: `var contador = 1\nvar soma = 0\n\n// Use enquanto (contador <= 10) para acumular em soma e avançar contador\n\nescreva("Soma:", soma)\n`,
    hints: [
      "Dentro do bloco enquanto (contador <= 10), adicione contador em soma.",
      "Faça soma = soma + contador e depois contador = contador + 1 (ou contador++).",
      "Ao final, escreva(soma) deve imprimir 55.",
    ],
    objectives: [
      {
        id: "lg06-loop",
        label: "Utilizar laço enquanto",
        test: ctx => /\b(enquanto|while)\b/i.test(ctx.code),
      },
      {
        id: "lg06-soma",
        label: "Calcular soma === 55 e exibir no console",
        test: ctx => ctx.success && ctx.scope.soma === 55 && ctx.outputText.includes("55"),
      },
    ],
    referenceSolution: `var contador = 1\nvar soma = 0\nenquanto (contador <= 10) {\n  soma += contador\n  contador++\n}\nescreva("Soma:", soma)`,
  },
  {
    id: "logic-07",
    trackId: "logic",
    moduleId: "logic-m3",
    moduleTitle: "Módulo 3 — Repetições e Listas",
    order: 7,
    title: "Laço para (Contagem Controlada)",
    subtitle: "Múltiplos de 3 em lista",
    difficulty: "Intermediário",
    estimatedMinutes: 14,
    xp: 90,
    workbench: "code",
    summary: "Gere sequências determinísticas com o laço para preenchendo uma lista dinâmica.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Inicialização, critério e passo em um só lugar",
        content:
          "O laço para (var i = 1; i <= 5; i++) (ou Portugol 'para i de 1 ate 5 faca ... fimpara') é ideal quando você sabe exatamente quantas repetições precisa.",
      },
    ],
    examples: [
      {
        title: "Populando uma lista com múltiplos",
        description: "Adiciona valores com .push().",
        code: `var pares = []\npara (var i = 1; i <= 4; i++) {\n  pares.push(i * 2)\n}\nescreva(pares)`,
        output: "[2, 4, 6, 8]",
      },
    ],
    prompt:
      "Gere os 5 primeiros múltiplos positivos de 3 ([3, 6, 9, 12, 15]) usando um laço 'para' e armazene-os na lista 'multiplos'. Exiba 'multiplos'.",
    starterCode: `var multiplos = []\n\n// Use para (var i = 1; i <= 5; i++) e multiplos.push(...)\n\nescreva(multiplos)\n`,
    hints: [
      "Percorra i de 1 até 5 dentro do laço para.",
      "Em cada iteração, adicione i * 3 na lista com multiplos.push(i * 3).",
      "Verifique se o console imprime [3, 6, 9, 12, 15].",
    ],
    objectives: [
      {
        id: "lg07-for",
        label: "Utilizar laço para",
        test: ctx => /\b(para|for)\b/i.test(ctx.code),
      },
      {
        id: "lg07-list",
        label: "Preencher 'multiplos' com [3, 6, 9, 12, 15]",
        test: ctx =>
          ctx.success &&
          JSON.stringify(ctx.scope.multiplos) === JSON.stringify([3, 6, 9, 12, 15]),
      },
    ],
    referenceSolution: `var multiplos = []\npara (var i = 1; i <= 5; i++) {\n  multiplos.push(i * 3)\n}\nescreva(multiplos)`,
  },
  {
    id: "logic-08",
    trackId: "logic",
    moduleId: "logic-m3",
    moduleTitle: "Módulo 3 — Repetições e Listas",
    order: 8,
    title: "Encontrando o Maior Valor",
    subtitle: "Percorrendo listas com tamanho()",
    difficulty: "Intermediário",
    estimatedMinutes: 14,
    xp: 100,
    workbench: "code",
    summary: "Percorra uma lista mantendo o maior elemento visto até o momento.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Padrão de redução manual",
        content:
          "Assumimos o primeiro item da lista (numeros[0]) como candidato inicial para 'maior'. Em seguida, percorremos os demais elementos com tamanho(numeros) e atualizamos 'maior' sempre que acharmos um número maior.",
      },
    ],
    examples: [
      {
        title: "Buscando o menor valor",
        description: "Inicia com o índice 0 e compara os seguintes.",
        code: `var vals = [9, 3, 12]\nvar menor = vals[0]\npara (var i = 1; i < tamanho(vals); i++) {\n  se (vals[i] < menor) { menor = vals[i] }\n}`,
      },
    ],
    prompt:
      "A partir de 'numeros = [4, 15, 8, 23, 16]', percorra a lista usando um laço e guarde o maior valor encontrado na variável 'maior' (23). Exiba 'maior'.",
    starterCode: `var numeros = [4, 15, 8, 23, 16]\nvar maior = numeros[0]\n\n// Percorra de i = 1 até tamanho(numeros) - 1 atualizando 'maior'\n\nescreva("Maior:", maior)\n`,
    hints: [
      "Use para (var i = 1; i < tamanho(numeros); i++).",
      "Dentro do laço: se (numeros[i] > maior) { maior = numeros[i] }.",
      "Ao final, escreva(maior) exibirá 23.",
    ],
    objectives: [
      {
        id: "lg08-loop",
        label: "Percorrer a lista usando laço",
        test: ctx => /\b(para|for|enquanto|while)\b/i.test(ctx.code),
      },
      {
        id: "lg08-max",
        label: "Calcular 'maior' igual ao maior item de 'numeros'",
        test: ctx =>
          ctx.success &&
          Array.isArray(ctx.scope.numeros) &&
          ctx.scope.numeros.length >= 5 &&
          ctx.scope.maior === Math.max(...(ctx.scope.numeros as number[])) &&
          ctx.output.length > 0,
      },
    ],
    referenceSolution: `var numeros = [4, 15, 8, 23, 16]\nvar maior = numeros[0]\npara (var i = 1; i < tamanho(numeros); i++) {\n  se (numeros[i] > maior) {\n    maior = numeros[i]\n  }\n}\nescreva("Maior:", maior)`,
  },
  {
    id: "logic-09",
    trackId: "logic",
    moduleId: "logic-m4",
    moduleTitle: "Módulo 4 — Funções e Projeto Integrador",
    order: 9,
    title: "Funções Reutilizáveis",
    subtitle: "Parâmetros, mod e retorne",
    difficulty: "Intermediário",
    estimatedMinutes: 14,
    xp: 110,
    workbench: "code",
    summary: "Encapsule regras lógicas em funções puras com retorne e valide casos positivos, zero e negativos.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Entrada -> Processamento -> Retorno",
        content:
          "Uma função recebe parâmetros, aplica uma regra e devolve um resultado com retorne. O operador mod (ou %) calcula o resto da divisão inteira.",
      },
    ],
    examples: [
      {
        title: "Função de cálculo simples",
        description: "Recebe um número e devolve o dobro.",
        code: `funcao dobrar(x) {\n  retorne x * 2\n}`,
      },
    ],
    prompt:
      "Implemente a função 'ehPar(n)' que retorne verdadeiro quando n for divisível por 2 e falso caso contrário. Imprima ehPar(4) e ehPar(7).",
    starterCode: `funcao ehPar(n) {\n  // Use (n mod 2) == 0 com retorne\n  \n}\n\nescreva(ehPar(4), ehPar(7))\n`,
    hints: [
      "Um número é par quando o resto da divisão por 2 é zero.",
      "Em Portugol você pode escrever (n mod 2) == 0.",
      "Escreva dentro da função: retorne (n mod 2) == 0.",
    ],
    objectives: [
      {
        id: "lg09-fn",
        label: "Definir função ehPar(n) e exibir teste no console",
        test: ctx => ctx.success && /\behPar\b/.test(ctx.code) && ctx.output.length > 0,
      },
    ],
    testCases: [
      { id: "tc-lg09-1", label: "ehPar(4) == verdadeiro", expression: "ehPar(4)", assertReturnEquals: true },
      { id: "tc-lg09-2", label: "ehPar(7) == falso", expression: "ehPar(7)", assertReturnEquals: false },
      { id: "tc-lg09-3", label: "ehPar(0) == verdadeiro", expression: "ehPar(0)", assertReturnEquals: true },
      { id: "tc-lg09-4", label: "ehPar(-2) == verdadeiro", expression: "ehPar(-2)", assertReturnEquals: true },
    ],
    referenceSolution: `funcao ehPar(n) {\n  retorne (n mod 2) == 0\n}\n\nescreva(ehPar(4), ehPar(7))`,
  },
  {
    id: "logic-10",
    trackId: "logic",
    moduleId: "logic-m4",
    moduleTitle: "Módulo 4 — Funções e Projeto Integrador",
    order: 10,
    title: "Projeto: Analisador de Turma",
    subtitle: "Listas, laços, decisões e retorno estruturado",
    difficulty: "Difícil",
    estimatedMinutes: 18,
    xp: 150,
    workbench: "code",
    summary: "Integre variáveis, iteração, condicionais e objetos de retorno para analisar notas de uma turma.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Combinando blocos fundamentais",
        content:
          "Algoritmos completos combinam acumuladores, contadores condicionais e retorno estruturado ({ media, aprovados }) em uma função testável.",
      },
    ],
    examples: [
      {
        title: "Retornando um registro estruturado",
        description: "Devolve duas métricas no mesmo retorno.",
        code: `funcao resumo(itens) {\n  retorne { total: tamanho(itens), primeiro: itens[0] }\n}`,
      },
    ],
    prompt:
      "Implemente 'analisarNotas(notas)' recebendo uma lista de números, calculando a média geral e contando quantas notas são >= 7. Retorne { media: mediaCalculada, aprovados: qtdAprovados }.",
    starterCode: `funcao analisarNotas(notas) {\n  var soma = 0\n  var aprovados = 0\n\n  // Percorra notas, some valores e conte notas >= 7\n\n  // Retorne { media: ..., aprovados: ... }\n}\n\nescreva(analisarNotas([8, 6, 9, 7]))\n`,
    hints: [
      "Use para (var i = 0; i < tamanho(notas); i++) para percorrer todas as notas.",
      "Acumule soma += notas[i] e faça se (notas[i] >= 7) { aprovados++ }.",
      "Ao final: retorne { media: soma / tamanho(notas), aprovados: aprovados }.",
    ],
    objectives: [
      {
        id: "lg10-fn",
        label: "Definir função analisarNotas(notas)",
        test: ctx => ctx.success && /\banalisarNotas\b/.test(ctx.code) && ctx.output.length > 0,
      },
    ],
    testCases: [
      {
        id: "tc-lg10-1",
        label: "analisarNotas([8, 6, 9, 7]) -> { media: 7.5, aprovados: 3 }",
        expression: "analisarNotas([8, 6, 9, 7])",
        assertReturnEquals: { media: 7.5, aprovados: 3 },
      },
      {
        id: "tc-lg10-2",
        label: "analisarNotas([5, 4, 6]) -> { media: 5, aprovados: 0 }",
        expression: "analisarNotas([5, 4, 6])",
        assertReturnEquals: { media: 5, aprovados: 0 },
      },
      {
        id: "tc-lg10-3",
        label: "analisarNotas([10, 10]) -> { media: 10, aprovados: 2 }",
        expression: "analisarNotas([10, 10])",
        assertReturnEquals: { media: 10, aprovados: 2 },
      },
    ],
    referenceSolution: `funcao analisarNotas(notas) {\n  var soma = 0\n  var aprovados = 0\n  para (var i = 0; i < tamanho(notas); i++) {\n    soma += notas[i]\n    se (notas[i] >= 7) {\n      aprovados++\n    }\n  }\n  retorne { media: soma / tamanho(notas), aprovados: aprovados }\n}\n\nescreva(analisarNotas([8, 6, 9, 7]))`,
  },
];
