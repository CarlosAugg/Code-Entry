import type { Lesson } from "../../types/curriculum";

export const PYTHON_LESSONS: Lesson[] = [
  {
    id: "py-01",
    trackId: "python",
    moduleId: "py-m1",
    moduleTitle: "Módulo 1 — Primeiros Passos",
    order: 1,
    title: "print(), Variáveis e f-strings",
    subtitle: "Saída clara e interpolação",
    difficulty: "Muito fácil",
    estimatedMinutes: 8,
    xp: 40,
    workbench: "code",
    summary: "Crie variáveis dinâmicas em Python 3 e formate mensagens limpas com f-strings.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Tipagem dinâmica e f-strings",
        content:
          "Em Python, não declaramos o tipo antes da variável. Basta atribuir um valor. Para montar textos dinâmicos, colocamos a letra f antes das aspas e inserimos expressões entre chaves { }.",
      },
    ],
    examples: [
      {
        title: "Interpolando valores",
        description: "Usa f-string para combinar nome e potência.",
        code: `curso = "Python 3"\nversao = 3.12\nprint(f"Estudando {curso} ({versao})")`,
        output: "Estudando Python 3 (3.12)",
      },
    ],
    prompt:
      "Crie as variáveis 'linguagem' (str), 'ano' (int) e imprima uma frase usando f-string (f\"...\") que mostre os dois valores na tela.",
    starterCode: `# Crie as variáveis 'linguagem' e 'ano'\n\n# Imprima usando print(f"...")\n`,
    hints: [
      'Atribua linguagem = "Python" e ano = 2026.',
      'Use print(f"Aprendendo {linguagem} em {ano}") para interpolar.',
      'Exemplo completo:\nlinguagem = "Python"\nano = 2026\nprint(f"{linguagem} - {ano}")',
    ],
    objectives: [
      {
        id: "py01-vars",
        label: "Criar 'linguagem' (str) e 'ano' (int)",
        test: ctx => typeof ctx.scope.linguagem === "string" && typeof ctx.scope.ano === "number",
      },
      {
        id: "py01-fstr",
        label: "Usar print() com f-string e exibir os dois valores",
        test: ctx =>
          ctx.success &&
          /f["']/.test(ctx.code) &&
          ctx.outputText.includes(String(ctx.scope.linguagem)) &&
          ctx.outputText.includes(String(ctx.scope.ano)),
      },
    ],
    referenceSolution: `linguagem = "Python"\nano = 2026\nprint(f"Estudando {linguagem} em {ano}")`,
  },
  {
    id: "py-02",
    trackId: "python",
    moduleId: "py-m1",
    moduleTitle: "Módulo 1 — Primeiros Passos",
    order: 2,
    title: "Métodos de String e Fatiamento",
    subtitle: ".strip(), .upper(), len() e slicing",
    difficulty: "Muito fácil",
    estimatedMinutes: 10,
    xp: 50,
    workbench: "code",
    summary: "Limpe textos de entrada e extraia prefixos usando fatiamento [inicio:fim].",
    theoryBlocks: [
      {
        kind: "text",
        title: "Strings como sequências imutáveis",
        content:
          "Strings suportam métodos como .strip() e .upper(), além de fatiamento: texto[:4] pega os 4 primeiros caracteres e texto[::-1] inverte a string.",
      },
    ],
    examples: [
      {
        title: "Limpando e fatiando",
        description: "Extrai as 3 primeiras letras em maiúsculas.",
        code: `codigo = "  net-404  ".strip().upper()\nprint(codigo[:3])`,
        output: "NET",
      },
    ],
    prompt:
      "Dada frase = \"  code entry python  \", crie 'limpa' com .strip(), 'maiuscula' em maiúsculas, 'prefixo' contendo os 4 primeiros caracteres de 'limpa' (limpa[:4]) e imprima os resultados.",
    starterCode: `frase = "  code entry python  "\n# 1. Crie 'limpa' removendo espaços das pontas\n\n# 2. Crie 'maiuscula' em letras maiúsculas\n\n# 3. Crie 'prefixo' com os 4 primeiros caracteres de 'limpa'\n\n# 4. Imprima prefixo e maiuscula\n`,
    hints: [
      "Use limpa = frase.strip() e maiuscula = limpa.upper().",
      "Para os 4 primeiros caracteres use fatiamento: prefixo = limpa[:4].",
      "Por fim chame print(prefixo, maiuscula).",
    ],
    objectives: [
      {
        id: "py02-limpa",
        label: "limpa == 'code entry python' e maiuscula == 'CODE ENTRY PYTHON'",
        test: ctx => ctx.scope.limpa === "code entry python" && ctx.scope.maiuscula === "CODE ENTRY PYTHON",
      },
      {
        id: "py02-slice",
        label: "prefixo == 'code' e imprimir na saída",
        test: ctx => ctx.success && ctx.scope.prefixo === "code" && ctx.outputText.includes("code"),
      },
    ],
    referenceSolution: `frase = "  code entry python  "\nlimpa = frase.strip()\nmaiuscula = limpa.upper()\nprefixo = limpa[:4]\nprint(prefixo, maiuscula)`,
  },
  {
    id: "py-03",
    trackId: "python",
    moduleId: "py-m2",
    moduleTitle: "Módulo 2 — Fluxo e Coleções",
    order: 3,
    title: "Decisões com if / elif / else",
    subtitle: "Indentação e classificação",
    difficulty: "Fácil",
    estimatedMinutes: 10,
    xp: 60,
    workbench: "code",
    summary: "Estruture blocos condicionais baseados em indentação de 4 espaços.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Indentação define blocos",
        content:
          "Em Python, não há chaves { }. Dois pontos (:) abrem um bloco e todas as linhas pertencentes a ele devem ter o mesmo recuo (4 espaços).",
      },
    ],
    examples: [
      {
        title: "Classificação de status HTTP",
        description: "Usa elif para testar faixas.",
        code: `status = 404\nif status < 300:\n    tipo = "Sucesso"\nelif status < 500:\n    tipo = "Erro do Cliente"\nelse:\n    tipo = "Erro do Servidor"`,
      },
    ],
    prompt:
      "Defina uma função 'classificar_latencia(ms)' que retorne \"Excelente\" se ms < 50, \"Moderada\" se ms <= 150, ou \"Alta\" se ms > 150. Imprima classificar_latencia(35).",
    starterCode: `def classificar_latencia(ms):\n    # Use if / elif / else para retornar "Excelente", "Moderada" ou "Alta"\n    pass\n\n# Imprima classificar_latencia(35)\n`,
    hints: [
      "Teste primeiro if ms < 50: return 'Excelente'.",
      "Depois elif ms <= 150: return 'Moderada' e else: return 'Alta'.",
      "Substitua 'pass' pela lógica e adicione print(classificar_latencia(35)).",
    ],
    objectives: [
      {
        id: "py03-if",
        label: "Utilizar if / elif / else na função",
        test: ctx => ctx.success && /\bif\b/.test(ctx.code) && /\belif\b/.test(ctx.code) && /\belse\b/.test(ctx.code),
      },
    ],
    testCases: [
      { id: "tc-py03-1", label: "classificar_latencia(35) == 'Excelente'", expression: "classificar_latencia(35)", assertReturnEquals: "Excelente" },
      { id: "tc-py03-2", label: "classificar_latencia(120) == 'Moderada'", expression: "classificar_latencia(120)", assertReturnEquals: "Moderada" },
      { id: "tc-py03-3", label: "classificar_latencia(220) == 'Alta'", expression: "classificar_latencia(220)", assertReturnEquals: "Alta" },
    ],
    referenceSolution: `def classificar_latencia(ms):\n    if ms < 50:\n        return "Excelente"\n    elif ms <= 150:\n        return "Moderada"\n    else:\n        return "Alta"\n\nprint(classificar_latencia(35))`,
  },
  {
    id: "py-04",
    trackId: "python",
    moduleId: "py-m2",
    moduleTitle: "Módulo 2 — Fluxo e Coleções",
    order: 4,
    title: "Laços for e range()",
    subtitle: "Iteração e filtro em intervalos",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 70,
    workbench: "code",
    summary: "Gere sequências numéricas com range() e acumule múltiplos dentro de um laço for.",
    theoryBlocks: [
      {
        kind: "text",
        title: "range(inicio, fim, passo)",
        content:
          "A função range(inicio, fim) inclui o início e exclui o fim. Por exemplo, range(1, 6) gera 1, 2, 3, 4, 5.",
      },
    ],
    examples: [
      {
        title: "Contagem de 2 em 2",
        description: "Usa passo 2 no range.",
        code: `pares = []\nfor n in range(2, 11, 2):\n    pares.append(n)\nprint(pares)`,
        output: "[2, 4, 6, 8, 10]",
      },
    ],
    prompt:
      "Crie uma lista vazia 'multiplos' e use um laço for com range(1, 21) para adicionar todos os números divisíveis por 3 (n % 3 == 0). Imprima 'multiplos'.",
    starterCode: `multiplos = []\n# Use for n in range(1, 21) e verifique se n % 3 == 0\n\nprint(multiplos)\n`,
    hints: [
      "Escreva for n in range(1, 21): para percorrer de 1 a 20.",
      "Dentro do laço: if n % 3 == 0: multiplos.append(n).",
      "O resultado impresso será [3, 6, 9, 12, 15, 18].",
    ],
    objectives: [
      {
        id: "py04-range",
        label: "Utilizar for e range() no código",
        test: ctx => /\bfor\b/.test(ctx.code) && /\brange\s*\(/.test(ctx.code),
      },
      {
        id: "py04-res",
        label: "multiplos == [3, 6, 9, 12, 15, 18]",
        test: ctx =>
          ctx.success &&
          JSON.stringify(ctx.scope.multiplos) === JSON.stringify([3, 6, 9, 12, 15, 18]),
      },
    ],
    referenceSolution: `multiplos = []\nfor n in range(1, 21):\n    if n % 3 == 0:\n        multiplos.append(n)\nprint(multiplos)`,
  },
  {
    id: "py-05",
    trackId: "python",
    moduleId: "py-m2",
    moduleTitle: "Módulo 2 — Fluxo e Coleções",
    order: 5,
    title: "Laço while e Sentinela",
    subtitle: "Repetição controlada por condição",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 75,
    workbench: "code",
    requiresStdin: true,
    defaultStdin: "10\n20\n15\n0",
    summary: "Leia valores consecutivos com input() até encontrar o valor sentinela 0 usando while.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Quando usar while",
        content:
          "Use while quando não souber antecipadamente quantas repetições ocorrerão — por exemplo, lendo entradas até o usuário digitar 0.",
      },
    ],
    examples: [
      {
        title: "Lendo números até 0",
        description: "Converte input() com int() e acumula.",
        code: `total = 0\nvalor = int(input())\nwhile valor != 0:\n    total += valor\n    valor = int(input())\nprint(total)`,
      },
    ],
    prompt:
      "Leia números inteiros usando int(input()) em um laço while até que seja lido 0. Calcule em 'soma' o total dos números digitados (excluindo 0) e imprima 'soma'.",
    starterCode: `soma = 0\n# Leia o primeiro valor com int(input())\n\n# Enquanto o valor for != 0, some e leia o próximo\n\nprint(soma)\n`,
    hints: [
      "Antes do while, leia: n = int(input()).",
      "Faça while n != 0: soma += n e dentro do bloco leia n = int(input()) novamente.",
      "Não esqueça de atualizar n dentro do while para evitar loop infinito!",
    ],
    objectives: [
      {
        id: "py05-while",
        label: "Usar laço while com input()",
        test: ctx => /\bwhile\b/.test(ctx.code) && /\binput\s*\(/.test(ctx.code),
      },
    ],
    testCases: [
      { id: "tc-py05-1", label: "Entradas 10, 20, 15, 0 -> 45", stdin: "10\n20\n15\n0", assertOutputEquals: "45" },
      { id: "tc-py05-2", label: "Entrada imediata 0 -> 0", stdin: "0", assertOutputEquals: "0" },
    ],
    referenceSolution: `soma = 0\nn = int(input())\nwhile n != 0:\n    soma += n\n    n = int(input())\nprint(soma)`,
  },
  {
    id: "py-06",
    trackId: "python",
    moduleId: "py-m3",
    moduleTitle: "Módulo 3 — Dicionários e Python Idiomático",
    order: 6,
    title: "Dicionários e Agregação",
    subtitle: "Chave-valor, .get() e listas aninhadas",
    difficulty: "Intermediário",
    estimatedMinutes: 14,
    xp: 85,
    workbench: "code",
    summary: "Manipule estruturas chave-valor e calcule métricas a partir de dados aninhados.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Modelando registros com dict",
        content:
          "Dicionários associam chaves únicas a valores. Podemos ler com registro['chave'] ou registro.get('chave', padrao) para evitar KeyError.",
      },
    ],
    examples: [
      {
        title: "Acessando e atualizando um dicionário",
        description: "Calcula média de notas e adiciona chave booleana.",
        code: `aluno = {"nome": "Lucas", "notas": [8, 9]}\nmedia = sum(aluno["notas"]) / len(aluno["notas"])\naluno["aprovado"] = media >= 7`,
      },
    ],
    prompt:
      "Dado o dicionário 'aluno', calcule 'media' com sum(aluno[\"notas\"]) / len(aluno[\"notas\"]), adicione aluno[\"aprovado\"] = media >= 7 e imprima f\"{aluno['nome']}: {media:.1f}\".",
    starterCode: `aluno = {\n    "nome": "Carla",\n    "notas": [8.0, 9.0, 10.0]\n}\n\n# Calcule media, salve aluno["aprovado"] e imprima formatado\n`,
    hints: [
      'Calcule media = sum(aluno["notas"]) / len(aluno["notas"]).',
      'Atribua aluno["aprovado"] = media >= 7.',
      'Imprima com print(f"{aluno[\'nome\']}: {media:.1f}").',
    ],
    objectives: [
      {
        id: "py06-calc",
        label: "Calcular media == 9 e definir aluno['aprovado'] == True",
        test: ctx => {
          const al = ctx.scope.aluno as Record<string, unknown> | undefined;
          return ctx.scope.media === 9 && Boolean(al?.aprovado) === true;
        },
      },
      {
        id: "py06-out",
        label: "Imprimir 'Carla: 9.0' na saída",
        test: ctx => ctx.success && ctx.outputText.includes("Carla: 9.0"),
      },
    ],
    referenceSolution: `aluno = {\n    "nome": "Carla",\n    "notas": [8.0, 9.0, 10.0]\n}\nmedia = sum(aluno["notas"]) / len(aluno["notas"])\naluno["aprovado"] = media >= 7\nprint(f"{aluno['nome']}: {media:.1f}")`,
  },
  {
    id: "py-07",
    trackId: "python",
    moduleId: "py-m3",
    moduleTitle: "Módulo 3 — Dicionários e Python Idiomático",
    order: 7,
    title: "List Comprehensions",
    subtitle: "Transformação e filtro em uma linha",
    difficulty: "Intermediário",
    estimatedMinutes: 14,
    xp: 95,
    workbench: "code",
    summary: "Substitua laços verbosos por list comprehensions expressivas e legíveis.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Sintaxe de List Comprehension",
        content:
          "[expressao for item in iteravel if condicao] cria uma nova lista filtrando e transformando elementos de forma pythônica.",
      },
    ],
    examples: [
      {
        title: "Quadrado dos ímpares",
        description: "Filtra ímpares e eleva ao quadrado.",
        code: `quadrados = [x ** 2 for x in range(1, 6) if x % 2 != 0]\nprint(quadrados)`,
        output: "[1, 9, 25]",
      },
    ],
    prompt:
      "A partir de 'precos = [45, 120, 80, 250, 30, 150]', crie usando list comprehension a lista 'caros_com_desconto' contendo round(p * 0.9, 2) apenas para os preços >= 100. Imprima o resultado.",
    starterCode: `precos = [45, 120, 80, 250, 30, 150]\n\n# Use list comprehension: [ ... for p in precos if ... ]\ncaros_com_desconto = []\n\nprint(caros_com_desconto)\n`,
    hints: [
      "A condição vai no final da comprehension: if p >= 100.",
      "A expressão de transformação vai no início: round(p * 0.9, 2).",
      "caros_com_desconto = [round(p * 0.9, 2) for p in precos if p >= 100]",
    ],
    objectives: [
      {
        id: "py07-comp",
        label: "Utilizar sintaxe de list comprehension [... for ... in ...]",
        test: ctx => /\[[^\]]*\bfor\b[^\]]*\bin\b[^\]]*\]/.test(ctx.code),
      },
      {
        id: "py07-res",
        label: "caros_com_desconto == [108, 225, 135]",
        test: ctx =>
          ctx.success &&
          JSON.stringify(ctx.scope.caros_com_desconto) === JSON.stringify([108, 225, 135]),
      },
    ],
    referenceSolution: `precos = [45, 120, 80, 250, 30, 150]\ncaros_com_desconto = [round(p * 0.9, 2) for p in precos if p >= 100]\nprint(caros_com_desconto)`,
  },
  {
    id: "py-08",
    trackId: "python",
    moduleId: "py-m3",
    moduleTitle: "Módulo 3 — Dicionários e Python Idiomático",
    order: 8,
    title: "Funções Analisadoras de Dados",
    subtitle: "Consolidação de coleções e retorno estruturado",
    difficulty: "Difícil",
    estimatedMinutes: 18,
    xp: 120,
    workbench: "code",
    summary: "Escreva uma função reutilizável que recebe uma lista de dicionários e retorna um resumo consolidado.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Combinando comprehensions, sum() e dict",
        content:
          "Ao processar APIs ou planilhas em Python, é comum receber uma lista de dicionários e retornar um dicionário agregado com contagem, soma e extração de nomes.",
      },
    ],
    examples: [
      {
        title: "Contagem de itens",
        description: "Extrai nomes e soma valores.",
        code: `def resumir(lista):\n    return {"qtd": len(lista), "soma": sum([x["v"] for x in lista])}`,
      },
    ],
    prompt:
      "Implemente 'resumo_carrinho(itens)' recebendo uma lista de {\"nome\": ..., \"preco\": ...} e retornando {\"quantidade\": len(itens), \"total\": round(soma_precos, 2), \"nomes\": lista_de_nomes}.",
    starterCode: `def resumo_carrinho(itens):\n    # Extraia os nomes, calcule o total arredondado em 2 casas e retorne o dict\n    pass\n\namostra = [{"nome": "Mouse", "preco": 99.5}, {"nome": "Cabo", "preco": 25.0}]\nprint(resumo_carrinho(amostra))\n`,
    hints: [
      'Para os nomes: nomes = [item["nome"] for item in itens].',
      'Para o total: total = round(sum([item["preco"] for item in itens]), 2).',
      'Retorne {"quantidade": len(itens), "total": total, "nomes": nomes}.',
    ],
    objectives: [
      {
        id: "py08-def",
        label: "Definir função resumo_carrinho(itens)",
        test: ctx => ctx.success && /\bdef\s+resumo_carrinho\s*\(/.test(ctx.code),
      },
    ],
    testCases: [
      {
        id: "tc-py08-1",
        label: "2 itens -> quantidade: 2, total: 124.5, nomes: ['Mouse', 'Cabo']",
        expression: 'resumo_carrinho([{"nome": "Mouse", "preco": 99.5}, {"nome": "Cabo", "preco": 25.0}])',
        assertReturnEquals: { quantidade: 2, total: 124.5, nomes: ["Mouse", "Cabo"] },
      },
      {
        id: "tc-py08-2",
        label: "Lista vazia -> quantidade: 0, total: 0, nomes: []",
        expression: "resumo_carrinho([])",
        assertReturnEquals: { quantidade: 0, total: 0, nomes: [] },
      },
    ],
    referenceSolution: `def resumo_carrinho(itens):\n    nomes = [item["nome"] for item in itens]\n    total = round(sum([item["preco"] for item in itens]), 2)\n    return {"quantidade": len(itens), "total": total, "nomes": nomes}\n\namostra = [{"nome": "Mouse", "preco": 99.5}, {"nome": "Cabo", "preco": 25.0}]\nprint(resumo_carrinho(amostra))`,
  },
];
