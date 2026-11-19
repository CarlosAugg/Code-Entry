import type { Challenge } from "../types/curriculum";

export const CHALLENGES: Challenge[] = [
  // ===================== Lógica de Programação (3) =====================
  {
    id: "ch-lg-1",
    trackId: "logic",
    title: "Calculadora de Fatorial",
    topic: "Laços & Acumuladores",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 90,
    workbench: "code",
    summary: "Implemente o algoritmo clássico de fatorial (N!) utilizando Portugol e laço de repetição.",
    prompt:
      "Crie a função 'fatorial(n)' que retorne n * (n - 1) * ... * 1 (sendo fatorial(0) == 1). Imprima fatorial(5).",
    starterCode: `funcao fatorial(n) {\n  // Inicie resultado = 1 e multiplique de 2 até n\n  \n}\n\nescreva(fatorial(5))\n`,
    hints: [
      "Comece com var res = 1;.",
      "Use para (var i = 2; i <= n; i++) { res = res * i }.",
      "Retorne res no final da função.",
    ],
    objectives: [
      {
        id: "ch-lg1-fn",
        label: "Definir função fatorial(n) e exibir resultado",
        test: ctx => ctx.success && /\bfatorial\b/.test(ctx.code) && ctx.output.length > 0,
      },
    ],
    testCases: [
      { id: "tc-l1-1", label: "fatorial(0) == 1", expression: "fatorial(0)", assertReturnEquals: 1 },
      { id: "tc-l1-2", label: "fatorial(5) == 120", expression: "fatorial(5)", assertReturnEquals: 120 },
      { id: "tc-l1-3", label: "fatorial(6) == 720", expression: "fatorial(6)", assertReturnEquals: 720 },
    ],
    referenceSolution: `funcao fatorial(n) {\n  var res = 1\n  para (var i = 2; i <= n; i++) {\n    res = res * i\n  }\n  retorne res\n}\n\nescreva(fatorial(5))`,
  },
  {
    id: "ch-lg-2",
    trackId: "logic",
    title: "Contador de Vogais",
    topic: "Strings & Iteração",
    difficulty: "Intermediário",
    estimatedMinutes: 15,
    xp: 120,
    workbench: "code",
    summary: "Percorra caractere por caractere de um texto para contar quantas vogais ele possui.",
    prompt:
      "Implemente 'contarVogais(texto)' que receba uma string e retorne o total de vogais (a, e, i, o, u), ignorando maiúsculas/minúsculas. Teste com escreva(contarVogais(\"Code Entry\")).",
    starterCode: `funcao contarVogais(texto) {\n  var total = 0\n  // Converta com texto.toLowerCase() e percorra cada caractere com tamanho()\n  \n  retorne total\n}\n\nescreva(contarVogais("Code Entry"))\n`,
    hints: [
      "Padronize com var min = texto.toLowerCase().",
      "Use var vogais = \"aeiou\" e verifique se vogais.includes(min[i]).",
      "Se incluir, incremente total++ dentro do laço para.",
    ],
    objectives: [
      {
        id: "ch-lg2-fn",
        label: "Definir contarVogais(texto)",
        test: ctx => ctx.success && /\bcontarVogais\b/.test(ctx.code) && ctx.output.length > 0,
      },
    ],
    testCases: [
      { id: "tc-l2-1", label: "'Code Entry' -> 3 vogais", expression: 'contarVogais("Code Entry")', assertReturnEquals: 3 },
      { id: "tc-l2-2", label: "'Algoritmo' -> 4 vogais", expression: 'contarVogais("Algoritmo")', assertReturnEquals: 4 },
    ],
    referenceSolution: `funcao contarVogais(texto) {\n  var min = texto.toLowerCase()\n  var total = 0\n  var vogais = "aeiou"\n  para (var i = 0; i < tamanho(min); i++) {\n    se (vogais.includes(min[i])) {\n      total++\n    }\n  }\n  retorne total\n}\n\nescreva(contarVogais("Code Entry"))`,
  },
  {
    id: "ch-lg-3",
    trackId: "logic",
    title: "Inversor de Lista Sem reverse()",
    topic: "Algoritmos com Listas",
    difficulty: "Difícil",
    estimatedMinutes: 18,
    xp: 150,
    workbench: "code",
    summary: "Construa uma nova lista invertida manualmente percorrendo os índices de trás para frente.",
    prompt:
      "Implemente 'inverterLista(lista)' sem usar .reverse(), retornando um novo array com os elementos na ordem inversa.",
    starterCode: `funcao inverterLista(lista) {\n  var nova = []\n  // Percorra do índice tamanho(lista) - 1 até 0 inserindo em nova\n  retorne nova\n}\n\nescreva(inverterLista([10, 20, 30]))\n`,
    hints: [
      "Comece o laço em var i = tamanho(lista) - 1 e decremente com i-- enquanto i >= 0.",
      "Em cada passo faça nova.push(lista[i]).",
      "Não utilize o método .reverse() nesta implementação.",
    ],
    objectives: [
      {
        id: "ch-lg3-fn",
        label: "Implementar inverterLista(lista) manualmente sem .reverse()",
        test: ctx => ctx.success && !ctx.code.includes(".reverse(") && /\binverterLista\b/.test(ctx.code),
      },
    ],
    testCases: [
      { id: "tc-l3-1", label: "[10, 20, 30] -> [30, 20, 10]", expression: "inverterLista([10, 20, 30])", assertReturnEquals: [30, 20, 10] },
      { id: "tc-l3-2", label: "['a', 'b'] -> ['b', 'a']", expression: 'inverterLista(["a", "b"])', assertReturnEquals: ["b", "a"] },
    ],
    referenceSolution: `funcao inverterLista(lista) {\n  var nova = []\n  para (var i = tamanho(lista) - 1; i >= 0; i--) {\n    nova.push(lista[i])\n  }\n  retorne nova\n}\n\nescreva(inverterLista([10, 20, 30]))`,
  },

  // ===================== C++ (3) =====================
  {
    id: "ch-cpp-1",
    trackId: "cpp",
    title: "Detector de Ano Bissexto",
    topic: "Condicionais & Módulo",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 90,
    workbench: "code",
    requiresStdin: true,
    defaultStdin: "2024",
    summary: "Determine se um ano lido via cin é bissexto segundo o calendário gregoriano.",
    prompt:
      "Leia um ano (int) via cin. Imprima 'Bissexto' se for divisível por 4 e não por 100, OU se for divisível por 400. Caso contrário, imprima 'Comum'.",
    starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int ano;\n    cin >> ano;\n    // Verifique ((ano % 4 == 0 && ano % 100 != 0) || (ano % 400 == 0))\n    \n    return 0;\n}`,
    hints: [
      "Um ano é bissexto se (ano % 4 == 0 && ano % 100 != 0) ou (ano % 400 == 0).",
      "Use um bloco if / else para imprimir exatamente 'Bissexto' ou 'Comum'.",
      'if ((ano % 4 == 0 && ano % 100 != 0) || (ano % 400 == 0)) { cout << "Bissexto" << endl; } else { cout << "Comum" << endl; }',
    ],
    objectives: [
      {
        id: "ch-cpp1-op",
        label: "Usar operador módulo (%) e condicionais",
        test: ctx => ctx.success && ctx.code.includes("%") && /\bif\b/.test(ctx.code),
      },
    ],
    testCases: [
      { id: "tc-c1-1", label: "2024 -> Bissexto", stdin: "2024", assertOutputEquals: "Bissexto" },
      { id: "tc-c1-2", label: "1900 -> Comum", stdin: "1900", assertOutputEquals: "Comum" },
      { id: "tc-c1-3", label: "2000 -> Bissexto", stdin: "2000", assertOutputEquals: "Bissexto" },
    ],
    referenceSolution: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int ano;\n    cin >> ano;\n    if ((ano % 4 == 0 && ano % 100 != 0) || (ano % 400 == 0)) {\n        cout << "Bissexto" << endl;\n    } else {\n        cout << "Comum" << endl;\n    }\n    return 0;\n}`,
  },
  {
    id: "ch-cpp-2",
    trackId: "cpp",
    title: "Sequência de Fibonacci",
    topic: "Laços & Lógica Iterativa",
    difficulty: "Intermediário",
    estimatedMinutes: 16,
    xp: 120,
    workbench: "code",
    summary: "Implemente uma função C++ que calcula o N-ésimo termo de Fibonacci de forma iterativa.",
    prompt:
      "Crie a função 'int fibonacci(int n)' antes do main() onde fib(0)=0, fib(1)=1 e fib(n)=fib(n-1)+fib(n-2). Imprima fibonacci(7) no main().",
    starterCode: `#include <iostream>\nusing namespace std;\n\nint fibonacci(int n) {\n    // Implemente de forma iterativa (ou recursiva)\n    return 0;\n}\n\nint main() {\n    cout << fibonacci(7) << endl;\n    return 0;\n}`,
    hints: [
      "Se n <= 1 retorne n. Para n >= 2, use duas variáveis a = 0 e b = 1.",
      "Em um laço for (int i = 2; i <= n; i++), calcule prox = a + b; a = b; b = prox;.",
      "Ao final do laço retorne b.",
    ],
    objectives: [
      {
        id: "ch-cpp2-fn",
        label: "Implementar fibonacci(int n) e imprimir resultado",
        test: ctx => ctx.success && /\bint\s+fibonacci\s*\(/.test(ctx.code) && ctx.output.length > 0,
      },
    ],
    testCases: [
      { id: "tc-c2-1", label: "fibonacci(0) == 0", expression: "fibonacci(0)", assertReturnEquals: 0 },
      { id: "tc-c2-2", label: "fibonacci(7) == 13", expression: "fibonacci(7)", assertReturnEquals: 13 },
      { id: "tc-c2-3", label: "fibonacci(10) == 55", expression: "fibonacci(10)", assertReturnEquals: 55 },
    ],
    referenceSolution: `#include <iostream>\nusing namespace std;\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    int a = 0, b = 1;\n    for (int i = 2; i <= n; i++) {\n        int prox = a + b;\n        a = b;\n        b = prox;\n    }\n    return b;\n}\n\nint main() {\n    cout << fibonacci(7) << endl;\n    return 0;\n}`,
  },
  {
    id: "ch-cpp-3",
    trackId: "cpp",
    title: "Verificador de Número Primo",
    topic: "Algoritmos Numéricos",
    difficulty: "Difícil",
    estimatedMinutes: 18,
    xp: 150,
    workbench: "code",
    requiresStdin: true,
    defaultStdin: "29",
    summary: "Valide se um inteiro positivo lido do teclado é primo e imprima 'Primo' ou 'Nao primo'.",
    prompt:
      "Leia um inteiro N. Imprima exatamente 'Primo' se N > 1 e não tiver divisores além de 1 e ele mesmo; caso contrário imprima 'Nao primo'.",
    starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // Verifique divisores de 2 ate i * i <= n\n    \n    return 0;\n}`,
    hints: [
      "Números menores ou iguais a 1 nunca são primos.",
      "Crie bool ehPrimo = true; e faça um for (int i = 2; i * i <= n; i++) verificando if (n % i == 0).",
      "Se encontrar divisor, marque ehPrimo = false e dê break.",
    ],
    objectives: [
      {
        id: "ch-cpp3-loop",
        label: "Testar divisibilidade em laço e imprimir resultado",
        test: ctx => ctx.success && (/\bfor\b/.test(ctx.code) || /\bwhile\b/.test(ctx.code)),
      },
    ],
    testCases: [
      { id: "tc-c3-1", label: "29 -> Primo", stdin: "29", assertOutputEquals: "Primo" },
      { id: "tc-c3-2", label: "15 -> Nao primo", stdin: "15", assertOutputEquals: "Nao primo" },
      { id: "tc-c3-3", label: "1 -> Nao primo", stdin: "1", assertOutputEquals: "Nao primo" },
    ],
    referenceSolution: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    bool ehPrimo = n > 1;\n    for (int i = 2; i * i <= n; i++) {\n        if (n % i == 0) {\n            ehPrimo = false;\n            break;\n        }\n    }\n    cout << (ehPrimo ? "Primo" : "Nao primo") << endl;\n    return 0;\n}`,
  },

  // ===================== JavaScript (3) =====================
  {
    id: "ch-js-1",
    trackId: "js",
    title: "Formatador de Slugs de URL",
    topic: "Strings & Regex",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 90,
    workbench: "code",
    summary: "Converta títulos de artigos em slugs limpos e amigáveis para URLs.",
    prompt:
      "Implemente 'criarSlug(titulo)' que converta o texto para minúsculas, remova espaços das extremidades, substitua espaços internos por '-' e remova acentos comuns. Teste com console.log(criarSlug('  Redes e Sub-redes IPv4  ')).",
    starterCode: `function criarSlug(titulo) {\n  // Normalize acentos (NFD), converta para minúsculas e troque espaços por '-'\n}\n\nconsole.log(criarSlug("  Redes e Sub-redes IPv4  "));\n`,
    hints: [
      "Use titulo.trim().toLowerCase() para padronizar.",
      "Para remover acentos use .normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').",
      "Substitua sequências de espaços por hífen com .replace(/\\s+/g, '-').",
    ],
    objectives: [
      {
        id: "ch-js1-fn",
        label: "Definir função criarSlug(titulo)",
        test: ctx => ctx.success && /\bcriarSlug\b/.test(ctx.code),
      },
    ],
    testCases: [
      { id: "tc-j1-1", label: "'  Code Entry JS  ' -> 'code-entry-js'", expression: 'criarSlug("  Code Entry JS  ")', assertReturnEquals: "code-entry-js" },
      { id: "tc-j1-2", label: "'Lógica de Programação' -> 'logica-de-programacao'", expression: 'criarSlug("Lógica de Programação")', assertReturnEquals: "logica-de-programacao" },
    ],
    referenceSolution: `function criarSlug(titulo) {\n  return titulo\n    .trim()\n    .toLowerCase()\n    .normalize("NFD")\n    .replace(/[\\u0300-\\u036f]/g, "")\n    .replace(/\\s+/g, "-");\n}\nconsole.log(criarSlug("  Redes e Sub-redes IPv4  "));`,
  },
  {
    id: "ch-js-2",
    trackId: "js",
    title: "Agrupamento de Dados por Categoria",
    topic: "Arrays, Reduce & Objetos",
    difficulty: "Intermediário",
    estimatedMinutes: 16,
    xp: 125,
    workbench: "code",
    summary: "Agrupe uma lista de logs ou transações calculando o total por chave.",
    prompt:
      "Implemente 'agruparPorCategoria(itens)' recebendo array de { categoria, valor } e retornando um objeto onde cada chave é a categoria e o valor é a soma dos valores daquela categoria.",
    starterCode: `function agruparPorCategoria(itens) {\n  // Retorne um objeto { categoria: somaValores }\n}\n\nconsole.log(agruparPorCategoria([{ categoria: "rede", valor: 10 }, { categoria: "cpu", valor: 30 }, { categoria: "rede", valor: 15 }]));\n`,
    hints: [
      "Use .reduce((acc, item) => { ... }, {}) iniciando com objeto vazio.",
      "Para cada item: acc[item.categoria] = (acc[item.categoria] || 0) + item.valor; return acc;.",
      "Lembre de retornar acc em toda iteração do reduce.",
    ],
    objectives: [
      {
        id: "ch-js2-fn",
        label: "Definir agruparPorCategoria(itens)",
        test: ctx => ctx.success && /\bagruparPorCategoria\b/.test(ctx.code),
      },
    ],
    testCases: [
      {
        id: "tc-j2-1",
        label: "Soma correta por categoria",
        expression: 'agruparPorCategoria([{ categoria: "rede", valor: 10 }, { categoria: "cpu", valor: 30 }, { categoria: "rede", valor: 15 }])',
        assertReturnEquals: { rede: 25, cpu: 30 },
      },
      {
        id: "tc-j2-2",
        label: "Array vazio -> {}",
        expression: "agruparPorCategoria([])",
        assertReturnEquals: {},
      },
    ],
    referenceSolution: `function agruparPorCategoria(itens) {\n  return itens.reduce((acc, item) => {\n    acc[item.categoria] = (acc[item.categoria] || 0) + item.valor;\n    return acc;\n  }, {});\n}\nconsole.log(agruparPorCategoria([{ categoria: "rede", valor: 10 }, { categoria: "cpu", valor: 30 }, { categoria: "rede", valor: 15 }]));`,
  },
  {
    id: "ch-js-3",
    trackId: "js",
    title: "Validador de Parênteses Balanceados",
    topic: "Estruturas de Dados (Pilha)",
    difficulty: "Avançado",
    estimatedMinutes: 20,
    xp: 160,
    workbench: "code",
    summary: "Aplique o conceito de pilha (stack) para validar expressões com (), [] e {}.",
    prompt:
      "Implemente 'estaBalanceado(expr)' que retorne true se todos os delimitadores (), [] e {} estiverem abertos e fechados na ordem correta, ou false caso contrário.",
    starterCode: `function estaBalanceado(expr) {\n  // Use um array como pilha (.push e .pop) e um mapa de pares\n}\n\nconsole.log(estaBalanceado("{[()]}"));\n`,
    hints: [
      "Crie uma pilha vazia const stack = [] e um objeto pares = { ')': '(', ']': '[', '}': '{' }.",
      "Ao ler '(', '[' ou '{', dê stack.push(ch). Ao ler um fechamento, verifique se stack.pop() === pares[ch].",
      "No final, só está balanceado se stack.length === 0.",
    ],
    objectives: [
      {
        id: "ch-js3-fn",
        label: "Implementar estaBalanceado(expr) com algoritmo de pilha",
        test: ctx => ctx.success && /\bestaBalanceado\b/.test(ctx.code),
      },
    ],
    testCases: [
      { id: "tc-j3-1", label: "'{[()]}' -> true", expression: 'estaBalanceado("{[()]}")', assertReturnEquals: true },
      { id: "tc-j3-2", label: "'([)]' -> false", expression: 'estaBalanceado("([)]")', assertReturnEquals: false },
      { id: "tc-j3-3", label: "'(()' -> false", expression: 'estaBalanceado("(()")', assertReturnEquals: false },
    ],
    referenceSolution: `function estaBalanceado(expr) {\n  const stack = [];\n  const pares = { ")": "(", "]": "[", "}": "{" };\n  for (const ch of expr) {\n    if (ch === "(" || ch === "[" || ch === "{") {\n      stack.push(ch);\n    } else if (ch in pares) {\n      if (stack.pop() !== pares[ch]) return false;\n    }\n  }\n  return stack.length === 0;\n}\nconsole.log(estaBalanceado("{[()]}"));`,
  },

  // ===================== Python (3) =====================
  {
    id: "ch-py-1",
    trackId: "python",
    title: "Contador de Frequência de Palavras",
    topic: "Dicionários & Strings",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 90,
    workbench: "code",
    summary: "Conte quantas vezes cada palavra aparece em uma frase ignorando maiúsculas/minúsculas.",
    prompt:
      "Defina 'contar_palavras(texto)' que retorne um dicionário mapeando cada palavra em minúsculas para sua quantidade de ocorrências.",
    starterCode: `def contar_palavras(texto):\n    # Converta para minúsculas, divida com .split() e acumule no dicionário\n    pass\n\nprint(contar_palavras("Python e python na pratica"))\n`,
    hints: [
      "Use texto.lower().split() para obter a lista de palavras normalizadas.",
      "Para cada palavra p: freq[p] = freq.get(p, 0) + 1.",
      "Retorne o dicionário freq ao final.",
    ],
    objectives: [
      {
        id: "ch-py1-fn",
        label: "Definir contar_palavras(texto)",
        test: ctx => ctx.success && /\bdef\s+contar_palavras\b/.test(ctx.code),
      },
    ],
    testCases: [
      {
        id: "tc-p1-1",
        label: "'Python e python' -> {'python': 2, 'e': 1}",
        expression: 'contar_palavras("Python e python")',
        assertReturnEquals: { python: 2, e: 1 },
      },
    ],
    referenceSolution: `def contar_palavras(texto):\n    freq = {}\n    for palavra in texto.lower().split():\n        freq[palavra] = freq.get(palavra, 0) + 1\n    return freq\n\nprint(contar_palavras("Python e python na pratica"))`,
  },
  {
    id: "ch-py-2",
    trackId: "python",
    title: "Verificador de Palíndromos",
    topic: "Slicing & Normalização",
    difficulty: "Intermediário",
    estimatedMinutes: 14,
    xp: 120,
    workbench: "code",
    summary: "Verifique se uma frase ou palavra é palíndroma ignorando espaços e maiúsculas.",
    prompt:
      "Implemente 'eh_palindromo(texto)' que retorne True se o texto (sem espaços e em minúsculas) for igual ao seu inverso, ou False caso contrário.",
    starterCode: `def eh_palindromo(texto):\n    # Remova espaços, deixe em minúsculas e compare com [::-1]\n    pass\n\nprint(eh_palindromo("A base do teto desaba"))\n`,
    hints: [
      "Use limpo = texto.lower().replace(' ', '').",
      "Em Python, limpo[::-1] retorna a string invertida.",
      "Retorne limpo == limpo[::-1].",
    ],
    objectives: [
      {
        id: "ch-py2-fn",
        label: "Implementar eh_palindromo(texto)",
        test: ctx => ctx.success && /\bdef\s+eh_palindromo\b/.test(ctx.code),
      },
    ],
    testCases: [
      { id: "tc-p2-1", label: "'Radar' -> True", expression: 'eh_palindromo("Radar")', assertReturnEquals: true },
      { id: "tc-p2-2", label: "'A base do teto desaba' -> True", expression: 'eh_palindromo("A base do teto desaba")', assertReturnEquals: true },
      { id: "tc-p2-3", label: "'Python' -> False", expression: 'eh_palindromo("Python")', assertReturnEquals: false },
    ],
    referenceSolution: `def eh_palindromo(texto):\n    limpo = texto.lower().replace(" ", "")\n    return limpo == limpo[::-1]\n\nprint(eh_palindromo("A base do teto desaba"))`,
  },
  {
    id: "ch-py-3",
    trackId: "python",
    title: "Busca Binária em Lista Ordenada",
    topic: "Algoritmos O(log n)",
    difficulty: "Avançado",
    estimatedMinutes: 20,
    xp: 160,
    workbench: "code",
    summary: "Implemente busca binária retornando o índice do elemento ou -1 se não existir.",
    prompt:
      "Implemente 'busca_binaria(lista, alvo)' usando dois ponteiros (inicio e fim) sem usar lista.index(). Retorne o índice se encontrar ou -1 caso não exista.",
    starterCode: `def busca_binaria(lista, alvo):\n    inicio = 0\n    fim = len(lista) - 1\n    # Divida o espaço de busca ao meio enquanto inicio <= fim\n    return -1\n\nprint(busca_binaria([2, 5, 8, 12, 16, 23, 38], 16))\n`,
    hints: [
      "Calcule meio = (inicio + fim) // 2 dentro de while inicio <= fim:.",
      "Se lista[meio] == alvo: return meio. Se lista[meio] < alvo: inicio = meio + 1.",
      "Caso contrário: fim = meio - 1.",
    ],
    objectives: [
      {
        id: "ch-py3-impl",
        label: "Implementar busca_binaria sem usar .index()",
        test: ctx => ctx.success && !ctx.code.includes(".index(") && /\bwhile\b/.test(ctx.code),
      },
    ],
    testCases: [
      { id: "tc-p3-1", label: "Alvo 16 em [2,5,8,12,16,23,38] -> índice 4", expression: "busca_binaria([2, 5, 8, 12, 16, 23, 38], 16)", assertReturnEquals: 4 },
      { id: "tc-p3-2", label: "Alvo 99 ausente -> -1", expression: "busca_binaria([2, 5, 8, 12, 16], 99)", assertReturnEquals: -1 },
    ],
    referenceSolution: `def busca_binaria(lista, alvo):\n    inicio = 0\n    fim = len(lista) - 1\n    while inicio <= fim:\n        meio = (inicio + fim) // 2\n        if lista[meio] == alvo:\n            return meio\n        elif lista[meio] < alvo:\n            inicio = meio + 1\n        else:\n            fim = meio - 1\n    return -1\n\nprint(busca_binaria([2, 5, 8, 12, 16, 23, 38], 16))`,
  },

  // ===================== Linux (3) =====================
  {
    id: "ch-lx-1",
    trackId: "linux",
    title: "Pipeline de Usuários Únicos",
    topic: "Processamento de Texto",
    difficulty: "Fácil",
    estimatedMinutes: 10,
    xp: 90,
    workbench: "linux",
    summary: "Extraia a lista ordenada e sem duplicatas dos nomes em ~/dados/usuarios.csv.",
    prompt:
      "Use um pipeline com cut, sort e uniq em ~/dados/usuarios.csv para salvar os nomes únicos da 1ª coluna em ~/nomes-unicos.txt.",
    starterCode: "",
    hints: [
      'Use cut -d"," -f1 ~/dados/usuarios.csv para pegar a primeira coluna.',
      "Encadeie | sort | uniq para ordenar e remover duplicatas.",
      'Salve em arquivo: cat ~/dados/usuarios.csv | cut -d"," -f1 | sort | uniq > ~/nomes-unicos.txt',
    ],
    objectives: [
      {
        id: "ch-lx1-pipe",
        label: "Utilizar pipeline com cut, sort e uniq",
        test: ctx =>
          Boolean(
            ctx.linux?.stages.some(s => s.command === "cut") &&
              ctx.linux?.stages.some(s => s.command === "sort") &&
              ctx.linux?.stages.some(s => s.command === "uniq")
          ),
      },
      {
        id: "ch-lx1-file",
        label: "Gerar ~/nomes-unicos.txt com nomes deduplicados",
        test: ctx => {
          const text = ctx.linux?.read("/home/aluno/nomes-unicos.txt") || "";
          const lines = text.trim().split("\n").filter(Boolean);
          return lines.includes("ana") && lines.filter(l => l === "ana").length === 1;
        },
      },
    ],
    referenceSolution: 'cat ~/dados/usuarios.csv | cut -d"," -f1 | sort | uniq > ~/nomes-unicos.txt',
  },
  {
    id: "ch-lx-2",
    trackId: "linux",
    title: "Script Automatizado de Verificação",
    topic: "Shell Script & Permissões",
    difficulty: "Intermediário",
    estimatedMinutes: 15,
    xp: 125,
    workbench: "linux",
    summary: "Crie um shell script executável do zero e execute-o com sucesso.",
    prompt:
      "Crie o arquivo ~/check-sistema.sh contendo `echo 'Sistema Saudavel'`, conceda permissão executável com chmod +x e execute ~/check-sistema.sh.",
    starterCode: "",
    hints: [
      "Grave o comando dentro do arquivo com echo \"echo 'Sistema Saudavel'\" > ~/check-sistema.sh.",
      "Dê permissão executável usando chmod +x ~/check-sistema.sh.",
      "Execute diretamente com ~/check-sistema.sh.",
    ],
    objectives: [
      {
        id: "ch-lx2-exec",
        label: "Criar ~/check-sistema.sh com permissão +x",
        test: ctx => Boolean(ctx.linux?.isExecutable("/home/aluno/check-sistema.sh")),
      },
      {
        id: "ch-lx2-out",
        label: "Executar o script imprimindo 'Sistema Saudavel'",
        test: ctx => ctx.success && ctx.outputText.includes("Sistema Saudavel"),
      },
    ],
    referenceSolution: `echo "echo 'Sistema Saudavel'" > ~/check-sistema.sh && chmod +x ~/check-sistema.sh && ~/check-sistema.sh`,
  },
  {
    id: "ch-lx-3",
    trackId: "linux",
    title: "Auditoria Completa de Logs e Backup",
    topic: "Administração & Segurança",
    difficulty: "Difícil",
    estimatedMinutes: 18,
    xp: 155,
    workbench: "linux",
    summary: "Isole IPs suspeitos em auth.log e empacote a evidência em um arquivo .tar.gz.",
    prompt:
      "Crie ~/auditoria/suspeitos.log com todas as ocorrências do IP '192.168.10.77' encontradas em /var/log/auth.log, e compacte ~/auditoria em ~/auditoria-evidencia.tar.gz.",
    starterCode: "",
    hints: [
      "Primeiro execute mkdir -p ~/auditoria.",
      "Filtre com grep 192.168.10.77 /var/log/auth.log > ~/auditoria/suspeitos.log.",
      "Compacte com tar -czf ~/auditoria-evidencia.tar.gz ~/auditoria.",
    ],
    objectives: [
      {
        id: "ch-lx3-grep",
        label: "Registrar ocorrências de 192.168.10.77 em ~/auditoria/suspeitos.log",
        test: ctx => {
          const t = ctx.linux?.read("/home/aluno/auditoria/suspeitos.log") || "";
          return t.includes("192.168.10.77") && !t.includes("192.168.10.25");
        },
      },
      {
        id: "ch-lx3-tar",
        label: "Criar pacote ~/auditoria-evidencia.tar.gz",
        test: ctx => Boolean(ctx.linux?.exists("/home/aluno/auditoria-evidencia.tar.gz")),
      },
    ],
    referenceSolution: "mkdir -p ~/auditoria && grep 192.168.10.77 /var/log/auth.log > ~/auditoria/suspeitos.log && tar -czf ~/auditoria-evidencia.tar.gz ~/auditoria",
  },

  // ===================== Redes (3) =====================
  {
    id: "ch-net-1",
    trackId: "networks",
    title: "Cálculo de Sub-rede /25",
    topic: "CIDR & Endereçamento",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 95,
    workbench: "networks",
    networkMode: "subnet",
    networkPreset: { targetCidr: "192.168.50.200/25" },
    summary: "Divida uma rede Classe C ao meio usando máscara /25 e determine onde cai o IP .200.",
    prompt:
      "Valide no painel os valores exatos do bloco para 192.168.50.200/25 (Rede, Máscara, Broadcast e Hosts Úteis).",
    starterCode: "192.168.50.200/25",
    hints: [
      "/25 tem máscara 255.255.255.128 e divide o /24 em dois blocos de 128 endereços (0..127 e 128..255).",
      "Como 200 >= 128, o IP pertence ao segundo bloco.",
      "Rede: 192.168.50.128 | Broadcast: 192.168.50.255 | Hosts úteis: 126.",
    ],
    objectives: [
      {
        id: "ch-net1-ok",
        label: "Validar sub-rede 192.168.50.200/25",
        test: ctx =>
          Boolean(
            ctx.network?.subnetValidation?.isValidUserAttempt &&
              ctx.network?.subnetValidation?.ipCidr === "192.168.50.200/25"
          ),
      },
    ],
    referenceSolution: "192.168.50.200/25",
  },
  {
    id: "ch-net-2",
    trackId: "networks",
    title: "Sub-rede Corporativa /28",
    topic: "VLSM & Máscara Binária",
    difficulty: "Intermediário",
    estimatedMinutes: 15,
    xp: 125,
    workbench: "networks",
    networkMode: "subnet",
    networkPreset: { targetCidr: "10.10.4.52/28" },
    summary: "Calcule uma sub-rede compacta /28 com saltos de 16 endereços para um segmento DMZ.",
    prompt:
      "Determine e valide Rede, Máscara, Broadcast e Hosts Úteis para 10.10.4.52/28.",
    starterCode: "10.10.4.52/28",
    hints: [
      "Em /28 restam 4 bits de host: tamanho do bloco = 16; máscara = 255.255.255.240.",
      "Os múltiplos de 16 são 0, 16, 32, 48, 64... Logo 52 está no bloco 48..63.",
      "Rede: 10.10.4.48 | Broadcast: 10.10.4.63 | Hosts úteis: 14.",
    ],
    objectives: [
      {
        id: "ch-net2-ok",
        label: "Validar sub-rede 10.10.4.52/28",
        test: ctx =>
          Boolean(
            ctx.network?.subnetValidation?.isValidUserAttempt &&
              ctx.network?.subnetValidation?.ipCidr === "10.10.4.52/28"
          ),
      },
    ],
    referenceSolution: "10.10.4.52/28",
  },
  {
    id: "ch-net-3",
    trackId: "networks",
    title: "Restauração Completa de Conectividade",
    topic: "Troubleshooting L3 + Firewall",
    difficulty: "Difícil",
    estimatedMinutes: 18,
    xp: 155,
    workbench: "networks",
    networkMode: "topology",
    networkPreset: { topologyPreset: "broken-route" },
    summary: "Corrija a rota da DMZ, valide o DNS interno e confirme alcance ICMP até o Srv-Banco (10.0.20.50).",
    prompt:
      "Restaure a rota para 10.0.20.0/24 no Roteador-Core, execute 'nslookup db.empresa.local' e faça um 'ping 10.0.20.50' bem-sucedido partindo do PC-Admin.",
    starterCode: "broken-route",
    hints: [
      "Ative a rota 10.0.20.0/24 na aba 'Rotas'.",
      "Rode 'nslookup db.empresa.local' para confirmar o IP 10.0.20.50.",
      "Rode 'ping 10.0.20.50' e observe a entrega ao Srv-Banco.",
    ],
    objectives: [
      {
        id: "ch-net3-ok",
        label: "Resolver db.empresa.local e completar ping até 10.0.20.50",
        test: ctx =>
          Boolean(
            ctx.network?.topologyCommands?.some(c => c.includes("nslookup")) &&
              ctx.network?.lastPingSuccess &&
              ctx.network?.lastPingTarget === "10.0.20.50"
          ),
      },
    ],
    referenceSolution: "enable-route:10.0.20.0/24 && nslookup db.empresa.local && ping 10.0.20.50",
  },

  // ===================== Banco de Dados (3) =====================
  {
    id: "ch-db-1",
    trackId: "database",
    title: "Top 3 Produtos Mais Caros em Estoque",
    topic: "Filtragem, Ordenação & LIMIT",
    difficulty: "Fácil",
    estimatedMinutes: 10,
    xp: 90,
    workbench: "sql",
    sqlDatasetId: "ecommerce",
    summary: "Combine WHERE, ORDER BY e LIMIT para listar os 3 itens mais caros disponíveis.",
    prompt:
      "Liste 'nome' e 'preco' dos 3 produtos mais caros da tabela 'produtos' que possuam estoque > 0, ordenados do maior preço para o menor.",
    starterCode: `-- Retorne nome e preco dos 3 produtos com maior preco e estoque > 0\n`,
    hints: [
      "Filtre com WHERE estoque > 0.",
      "Ordene com ORDER BY preco DESC.",
      "Limite o resultado com LIMIT 3 no final da consulta.",
    ],
    objectives: [
      {
        id: "ch-db1-ok",
        label: "Retornar exatamente os 3 produtos esperados em ordem decrescente de preço",
        test: ctx => {
          const rows = ctx.sql?.rows || [];
          return (
            ctx.success &&
            /\blimit\s+3\b/i.test(ctx.code) &&
            rows.length === 3 &&
            Number(rows[0]?.preco) === 1490 &&
            Number(rows[1]?.preco) === 499 &&
            Number(rows[2]?.preco) === 459
          );
        },
      },
    ],
    referenceSolution: "SELECT nome, preco FROM produtos WHERE estoque > 0 ORDER BY preco DESC LIMIT 3;",
  },
  {
    id: "ch-db-2",
    trackId: "database",
    title: "Ranking de Faturamento por Cliente",
    topic: "JOIN + Agregação",
    difficulty: "Intermediário",
    estimatedMinutes: 15,
    xp: 125,
    workbench: "sql",
    sqlDatasetId: "ecommerce",
    summary: "Calcule quanto cada cliente já gastou em pedidos pagos ordenando do maior para o menor.",
    prompt:
      "Una 'clientes' (c) e 'pedidos' (p) filtrando p.status = 'pago', exiba c.nome AS cliente e ROUND(SUM(p.total), 2) AS total_gasto agrupados por c.id e ordenados por total_gasto DESC.",
    starterCode: `-- Ranking de gasto total por cliente em pedidos pagos\n`,
    hints: [
      "Use INNER JOIN pedidos p ON p.cliente_id = c.id WHERE p.status = 'pago'.",
      "Agrupe com GROUP BY c.id, c.nome.",
      "Ordene com ORDER BY total_gasto DESC (Bruno Mendes deve liderar com 2677.9).",
    ],
    objectives: [
      {
        id: "ch-db2-ok",
        label: "Gerar ranking de 4 clientes pagos liderado por Bruno Mendes",
        test: ctx => {
          const rows = ctx.sql?.rows || [];
          return (
            ctx.success &&
            /\bjoin\b/i.test(ctx.code) &&
            rows.length === 4 &&
            rows[0]?.cliente === "Bruno Mendes" &&
            Math.abs(Number(rows[0]?.total_gasto) - 2677.9) < 0.1
          );
        },
      },
    ],
    referenceSolution:
      "SELECT c.nome AS cliente, ROUND(SUM(p.total), 2) AS total_gasto FROM clientes c INNER JOIN pedidos p ON p.cliente_id = c.id WHERE p.status = 'pago' GROUP BY c.id, c.nome ORDER BY total_gasto DESC;",
  },
  {
    id: "ch-db-3",
    trackId: "database",
    title: "Produtos Mais Vendidos (JOIN Triplo)",
    topic: "Relacionamento N:N & Quantidades",
    difficulty: "Avançado",
    estimatedMinutes: 18,
    xp: 160,
    workbench: "sql",
    sqlDatasetId: "ecommerce",
    summary: "Cruze itens_pedido, pedidos e produtos para somar unidades vendidas apenas em pedidos não cancelados.",
    prompt:
      "Liste 'pr.nome AS produto' e 'SUM(ip.quantidade) AS unidades' cruzando 'itens_pedido' (ip), 'produtos' (pr) e 'pedidos' (pe) onde pe.status <> 'cancelado', agrupado por pr.id e ordenado por unidades DESC.",
    starterCode: `-- JOIN entre itens_pedido, produtos e pedidos excluindo cancelados\n`,
    hints: [
      "Faça INNER JOIN produtos pr ON pr.id = ip.produto_id e INNER JOIN pedidos pe ON pe.id = ip.pedido_id.",
      "Exclua cancelados com WHERE pe.status <> 'cancelado' (ou != 'cancelado').",
      "Agrupe por pr.id, pr.nome e ordene por unidades DESC (Roteador Wi-Fi 6 AX3000 e SSD NVMe 1TB empatam no topo com 3 unidades).",
    ],
    objectives: [
      {
        id: "ch-db3-ok",
        label: "Consolidar unidades vendidas excluindo cancelados (líderes com 3 unidades no topo)",
        test: ctx => {
          const rows = ctx.sql?.rows || [];
          const sw = rows.find(r => r.produto === "Switch Gigabit 8 Portas");
          return (
            ctx.success &&
            rows.length === 7 &&
            Number(rows[0]?.unidades) === 3 &&
            Number(sw?.unidades) === 1
          );
        },
      },
    ],
    referenceSolution:
      "SELECT pr.nome AS produto, SUM(ip.quantidade) AS unidades FROM itens_pedido ip INNER JOIN produtos pr ON pr.id = ip.produto_id INNER JOIN pedidos pe ON pe.id = ip.pedido_id WHERE pe.status <> 'cancelado' GROUP BY pr.id, pr.nome ORDER BY unidades DESC, pr.nome ASC;",
  },
];

export const CHALLENGE_MAP: Record<string, Challenge> = CHALLENGES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<string, Challenge>
);
