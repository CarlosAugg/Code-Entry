import type { Lesson } from "../../types/curriculum";

export const CPP_LESSONS: Lesson[] = [
  {
    id: "cpp-01",
    trackId: "cpp",
    moduleId: "cpp-m1",
    moduleTitle: "Módulo 1 — Fundamentos e Saída",
    order: 1,
    title: "Primeiro Programa e cout",
    subtitle: "Estrutura mínima e saída padrão",
    difficulty: "Muito fácil",
    estimatedMinutes: 8,
    xp: 40,
    workbench: "code",
    summary: "Estruture um programa C++17 válido com #include <iostream>, int main() e exiba mensagens no console.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Anatomia de um programa C++",
        content:
          "Todo programa executável em C++ começa pela função int main(). Para exibir textos no terminal, importamos a biblioteca padrão <iostream> e utilizamos o fluxo cout com o operador de inserção <<.",
      },
      {
        kind: "callout",
        tone: "info",
        title: "Ponto e vírgula obrigatório",
        content:
          "Diferente de Python, cada instrução em C++ termina com ';'. Use endl ou '\\n' para quebrar a linha após imprimir.",
      },
    ],
    examples: [
      {
        title: "Exibindo duas linhas formatadas",
        description: "Importa iostream, habilita std e imprime duas mensagens.",
        code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Sistema iniciado" << endl;\n    cout << "Status: OK" << endl;\n    return 0;\n}`,
        output: "Sistema iniciado\nStatus: OK",
      },
    ],
    prompt:
      "Complete o programa abaixo usando cout << para exibir exatamente duas linhas: na primeira linha a palavra 'Code Entry' e na segunda linha a frase 'C++ em execucao'.",
    starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Imprima "Code Entry" na primeira linha\n    // Imprima "C++ em execucao" na segunda linha\n    \n    return 0;\n}`,
    hints: [
      "Você precisa usar o comando cout seguido do operador << e do texto entre aspas duplas.",
      "Para garantir que cada frase fique em uma linha separada, termine cada cout com << endl;.",
      'Exemplo completo:\ncout << "Code Entry" << endl;\ncout << "C++ em execucao" << endl;',
    ],
    objectives: [
      {
        id: "cpp01-valid",
        label: "Compilar programa válido com #include <iostream> e int main()",
        test: ctx => ctx.success && /\bcout\b/.test(ctx.code),
      },
      {
        id: "cpp01-line1",
        label: "Exibir 'Code Entry' na saída",
        test: ctx => ctx.success && ctx.output.some(l => l.includes("Code Entry")),
      },
      {
        id: "cpp01-line2",
        label: "Exibir 'C++ em execucao' em outra linha",
        test: ctx => ctx.success && ctx.output.length >= 2 && ctx.output.some(l => l.includes("C++ em execucao")),
      },
    ],
    referenceSolution: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Code Entry" << endl;\n    cout << "C++ em execucao" << endl;\n    return 0;\n}`,
  },
  {
    id: "cpp-02",
    trackId: "cpp",
    moduleId: "cpp-m1",
    moduleTitle: "Módulo 1 — Fundamentos e Saída",
    order: 2,
    title: "Variáveis e Tipos Estáticos",
    subtitle: "int, double, string e bool",
    difficulty: "Muito fácil",
    estimatedMinutes: 10,
    xp: 50,
    workbench: "code",
    summary: "Declare variáveis tipadas para representar um equipamento de rede e imprima seus dados.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Tipagem estática",
        content:
          "Em C++, você informa o tipo da variável antes do nome. Isso permite ao compilador validar operações e otimizar memória.",
      },
      {
        kind: "table",
        headers: ["Tipo", "Armazena", "Exemplo"],
        rows: [
          ["int", "Números inteiros", "int portas = 24;"],
          ["double", "Números decimais", "double preco = 499.90;"],
          ["string", "Cadeia de texto (#include <string>)", 'string modelo = "AX3000";'],
          ["bool", "Valor lógico (true / false)", "bool ativo = true;"],
        ],
      },
    ],
    examples: [
      {
        title: "Declarando e imprimindo dados",
        description: "Combina texto literal com variáveis em um único cout.",
        code: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string servidor = "srv-01";\n    int cpuCores = 8;\n    double carga = 1.45;\n    cout << servidor << " | Cores: " << cpuCores << " | Load: " << carga << endl;\n    return 0;\n}`,
        output: "srv-01 | Cores: 8 | Load: 1.45",
      },
    ],
    prompt:
      "Declare as variáveis: string produto, double preco e int estoque com valores de sua escolha (estoque > 0 e preco > 0), e imprima todas elas com cout.",
    starterCode: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    // 1. Declare string produto, double preco e int estoque\n    \n    // 2. Exiba os valores na tela com cout\n    \n    return 0;\n}`,
    hints: [
      "Lembre-se de declarar explicitamente os tipos: string, double e int antes dos nomes pedidos.",
      "Em double, use ponto decimal (ex.: 299.90) em vez de vírgula. Depois encadeie com << no cout.",
      'Exemplo:\nstring produto = "Switch";\ndouble preco = 299.90;\nint estoque = 12;\ncout << produto << " - " << preco << " - " << estoque << endl;',
    ],
    objectives: [
      {
        id: "cpp02-str",
        label: "Declarar variável string 'produto' não vazia",
        test: ctx => ctx.varTypes.produto === "string" && String(ctx.scope.produto || "").trim().length > 0,
      },
      {
        id: "cpp02-dbl",
        label: "Declarar variável decimal 'preco' (> 0)",
        test: ctx =>
          (ctx.varTypes.preco === "double" || ctx.varTypes.preco === "float") &&
          Number(ctx.scope.preco) > 0,
      },
      {
        id: "cpp02-int",
        label: "Declarar variável inteira 'estoque' (> 0) e imprimir tudo",
        test: ctx =>
          ctx.success &&
          ctx.varTypes.estoque === "int" &&
          Number(ctx.scope.estoque) > 0 &&
          ctx.outputText.includes(String(ctx.scope.produto)) &&
          ctx.outputText.includes(String(ctx.scope.estoque)),
      },
    ],
    referenceSolution: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string produto = "Roteador";\n    double preco = 349.9;\n    int estoque = 10;\n    cout << produto << " | " << preco << " | " << estoque << endl;\n    return 0;\n}`,
  },
  {
    id: "cpp-03",
    trackId: "cpp",
    moduleId: "cpp-m1",
    moduleTitle: "Módulo 1 — Fundamentos e Saída",
    order: 3,
    title: "Entrada com cin e Precisão Decimal",
    subtitle: "cin >>, cálculo e iomanip",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 60,
    workbench: "code",
    requiresStdin: true,
    defaultStdin: "1000\n15",
    summary: "Leia valores do teclado via cin >>, calcule um desconto percentual e formate a saída com 2 casas decimais.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Leitura e formatação profissional",
        content:
          "Enquanto cout envia dados para a tela (<<), cin lê tokens digitados pelo usuário (>>). Para exibir valores monetários sem casas decimais aleatórias, incluímos <iomanip> e aplicamos fixed << setprecision(2).",
      },
    ],
    examples: [
      {
        title: "Formatando valor monetário",
        description: "Usa fixed e setprecision(2) antes de imprimir.",
        code: `#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double total = 150.5;\n    cout << fixed << setprecision(2) << total << endl;\n    return 0;\n}`,
        output: "150.50",
      },
    ],
    prompt:
      "Leia dois valores double via cin: 'valor' e 'percentual'. Calcule o valor final com desconto em 'finalValor' e imprima apenas ou incluindo o resultado formatado com fixed e setprecision(2).",
    starterCode: `#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double valor, percentual;\n    // Leia valor e percentual com cin\n    \n    // Calcule: double finalValor = ...\n    \n    // Imprima finalValor usando fixed << setprecision(2)\n    \n    return 0;\n}`,
    hints: [
      "Use cin >> valor >> percentual; para ler ambos os números separados por espaço ou quebra de linha.",
      "O desconto é valor * (percentual / 100.0). Subtraia isso de valor para achar finalValor.",
      "Exemplo:\ncin >> valor >> percentual;\ndouble finalValor = valor - (valor * percentual / 100.0);\ncout << fixed << setprecision(2) << finalValor << endl;",
    ],
    objectives: [
      {
        id: "cpp03-cin",
        label: "Ler 'valor' e 'percentual' com cin",
        test: ctx => ctx.success && /\bcin\b/.test(ctx.code) && typeof ctx.scope.finalValor === "number",
      },
      {
        id: "cpp03-fmt",
        label: "Usar fixed e setprecision(2) na saída",
        test: ctx => /\bfixed\b/.test(ctx.code) && /setprecision\s*\(\s*2\s*\)/.test(ctx.code),
      },
    ],
    testCases: [
      { id: "tc-cpp03-1", label: "Entrada: 1000 e 15% -> 850.00", stdin: "1000\n15", assertOutputIncludes: "850.00" },
      { id: "tc-cpp03-2", label: "Entrada: 200 e 25% -> 150.00", stdin: "200\n25", assertOutputIncludes: "150.00" },
    ],
    referenceSolution: `#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double valor, percentual;\n    cin >> valor >> percentual;\n    double finalValor = valor * (1.0 - percentual / 100.0);\n    cout << fixed << setprecision(2) << finalValor << endl;\n    return 0;\n}`,
  },
  {
    id: "cpp-04",
    trackId: "cpp",
    moduleId: "cpp-m2",
    moduleTitle: "Módulo 2 — Fluxo e Decisões",
    order: 4,
    title: "Leitura de Texto com getline",
    subtitle: "getline(cin, ...) e cin.ignore()",
    difficulty: "Fácil",
    estimatedMinutes: 12,
    xp: 65,
    workbench: "code",
    requiresStdin: true,
    defaultStdin: "42\nServidores Linux",
    summary: "Combine leitura numérica com leitura de linhas contendo espaços sem perder texto no buffer.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Por que cin >> corta espaços?",
        content:
          "O operador >> para no primeiro espaço ou Enter. Para ler nomes completos ou frases, usamos getline(cin, variavel). Quando lemos um número com cin >> antes de um getline(), o caractere '\\n' fica no buffer — por isso chamamos cin.ignore() antes do getline.",
      },
    ],
    examples: [
      {
        title: "Lendo código e nome completo",
        description: "Limpa o buffer após cin >> codigo.",
        code: `int codigo;\nstring titulo;\ncin >> codigo;\ncin.ignore();\ngetline(cin, titulo);\ncout << "[" << codigo << "] " << titulo << endl;`,
      },
    ],
    prompt:
      "Leia um número inteiro 'turmaId' com cin >>, limpe o buffer com cin.ignore(), leia a linha 'curso' com getline(cin, curso) e exiba no formato 'Turma <turmaId>: <curso>'.",
    starterCode: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    int turmaId;\n    string curso;\n    // Leia turmaId, limpe o buffer e leia curso com getline\n    \n    return 0;\n}`,
    hints: [
      "Primeiro leia turmaId com cin >> turmaId; depois chame cin.ignore();.",
      "Em seguida leia a frase inteira com getline(cin, curso);.",
      'cout << "Turma " << turmaId << ": " << curso << endl;',
    ],
    objectives: [
      {
        id: "cpp04-getline",
        label: "Utilizar cin.ignore() e getline(cin, curso)",
        test: ctx => /cin\.ignore\s*\(/.test(ctx.code) && /getline\s*\(/.test(ctx.code),
      },
    ],
    testCases: [
      {
        id: "tc-cpp04-1",
        label: "Entrada: 42 / Servidores Linux",
        stdin: "42\nServidores Linux",
        assertOutputIncludes: "Turma 42: Servidores Linux",
      },
      {
        id: "tc-cpp04-2",
        label: "Entrada: 7 / Redes IPv4",
        stdin: "7\nRedes IPv4",
        assertOutputIncludes: "Turma 7: Redes IPv4",
      },
    ],
    referenceSolution: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    int turmaId;\n    string curso;\n    cin >> turmaId;\n    cin.ignore();\n    getline(cin, curso);\n    cout << "Turma " << turmaId << ": " << curso << endl;\n    return 0;\n}`,
  },
  {
    id: "cpp-05",
    trackId: "cpp",
    moduleId: "cpp-m2",
    moduleTitle: "Módulo 2 — Fluxo e Decisões",
    order: 5,
    title: "Condicionais Encadeadas",
    subtitle: "if, else if, else e operadores lógicos",
    difficulty: "Fácil",
    estimatedMinutes: 14,
    xp: 75,
    workbench: "code",
    requiresStdin: true,
    defaultStdin: "85",
    summary: "Classifique notas de 0 a 100 tratando intervalos inválidos com && e ||.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Validação de faixas",
        content:
          "Antes de classificar um número, valide limites impossíveis (ex.: nota < 0 || nota > 100). O operador || significa OU lógico; && significa E lógico.",
      },
    ],
    examples: [
      {
        title: "Classificador de temperatura",
        description: "Usa if / else if / else em ordem lógica.",
        code: `if (temp < 0 || temp > 60) {\n    cout << "Leitura invalida" << endl;\n} else if (temp >= 30) {\n    cout << "Alto" << endl;\n} else {\n    cout << "Normal" << endl;\n}`,
      },
    ],
    prompt:
      "Leia uma nota (double). Imprima exatamente: 'Invalida' se nota < 0 ou > 100; 'Aprovado' se >= 70; 'Recuperacao' se >= 50 e < 70; ou 'Reprovado' caso contrário.",
    starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    double nota;\n    cin >> nota;\n    // Escreva sua estrutura if / else if / else aqui\n    \n    return 0;\n}`,
    hints: [
      "Teste primeiro a condição inválida: if (nota < 0 || nota > 100).",
      "Depois teste em ordem decrescente: else if (nota >= 70), else if (nota >= 50), e por fim else.",
      'Use exatamente os textos sem acento pedidos: "Invalida", "Aprovado", "Recuperacao", "Reprovado".',
    ],
    objectives: [
      {
        id: "cpp05-if",
        label: "Usar estrutura condicional if / else if / else",
        test: ctx => ctx.success && /\bif\b/.test(ctx.code) && /\belse\b/.test(ctx.code),
      },
    ],
    testCases: [
      { id: "tc-cpp05-1", label: "Nota 110 -> Invalida", stdin: "110", assertOutputEquals: "Invalida" },
      { id: "tc-cpp05-2", label: "Nota 85 -> Aprovado", stdin: "85", assertOutputEquals: "Aprovado" },
      { id: "tc-cpp05-3", label: "Nota 60 -> Recuperacao", stdin: "60", assertOutputEquals: "Recuperacao" },
      { id: "tc-cpp05-4", label: "Nota 35 -> Reprovado", stdin: "35", assertOutputEquals: "Reprovado" },
    ],
    referenceSolution: `#include <iostream>\nusing namespace std;\n\nint main() {\n    double nota;\n    cin >> nota;\n    if (nota < 0 || nota > 100) {\n        cout << "Invalida" << endl;\n    } else if (nota >= 70) {\n        cout << "Aprovado" << endl;\n    } else if (nota >= 50) {\n        cout << "Recuperacao" << endl;\n    } else {\n        cout << "Reprovado" << endl;\n    }\n    return 0;\n}`,
  },
  {
    id: "cpp-06",
    trackId: "cpp",
    moduleId: "cpp-m3",
    moduleTitle: "Módulo 3 — Laços, Funções e Vetores",
    order: 6,
    title: "Laço for e Acumuladores",
    subtitle: "Repetição controlada por contador",
    difficulty: "Intermediário",
    estimatedMinutes: 15,
    xp: 85,
    workbench: "code",
    requiresStdin: true,
    defaultStdin: "5",
    summary: "Some todos os números inteiros pares de 1 até N usando o laço for.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Anatomia do laço for",
        content:
          "O laço for(inicialização; condição; incremento) concentra o controle do contador em uma única linha. É ideal quando sabemos quantas iterações ou qual intervalo percorrer.",
      },
    ],
    examples: [
      {
        title: "Somando de 1 até N",
        description: "Acumula valores na variável soma.",
        code: `int soma = 0;\nfor (int i = 1; i <= n; i++) {\n    soma += i;\n}\ncout << soma << endl;`,
      },
    ],
    prompt:
      "Leia um inteiro N via cin. Use um laço for para calcular em uma variável 'somaPares' a soma de todos os números pares de 1 até N (inclusive) e imprima apenas o resultado.",
    starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int somaPares = 0;\n    // Percorra de 1 ate n somando apenas quando i % 2 == 0\n    \n    cout << somaPares << endl;\n    return 0;\n}`,
    hints: [
      "Dentro do for (int i = 1; i <= n; i++), verifique se i % 2 == 0.",
      "Se for par, faça somaPares += i;.",
      "Exemplo: for (int i = 1; i <= n; i++) { if (i % 2 == 0) { somaPares += i; } }",
    ],
    objectives: [
      {
        id: "cpp06-for",
        label: "Utilizar laço for na resolução",
        test: ctx => ctx.success && /\bfor\s*\(/.test(ctx.code),
      },
    ],
    testCases: [
      { id: "tc-cpp06-1", label: "N = 5 -> 2 + 4 = 6", stdin: "5", assertOutputEquals: "6" },
      { id: "tc-cpp06-2", label: "N = 10 -> 2+4+6+8+10 = 30", stdin: "10", assertOutputEquals: "30" },
    ],
    referenceSolution: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int somaPares = 0;\n    for (int i = 1; i <= n; i++) {\n        if (i % 2 == 0) {\n            somaPares += i;\n        }\n    }\n    cout << somaPares << endl;\n    return 0;\n}`,
  },
  {
    id: "cpp-07",
    trackId: "cpp",
    moduleId: "cpp-m3",
    moduleTitle: "Módulo 3 — Laços, Funções e Vetores",
    order: 7,
    title: "Funções Auxiliares Tipadas",
    subtitle: "Modularização e retorno",
    difficulty: "Intermediário",
    estimatedMinutes: 15,
    xp: 95,
    workbench: "code",
    summary: "Crie funções reutilizáveis fora do main() com parâmetros tipados e retorno explícito.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Funções antes do main()",
        content:
          "Em C++, declaramos a função antes do main() especificando o tipo de retorno (int, double, bool) e o tipo de cada parâmetro.",
      },
    ],
    examples: [
      {
        title: "Função para área de retângulo",
        description: "Recebe dois doubles e retorna o produto.",
        code: `double calcularArea(double largura, double altura) {\n    return largura * altura;\n}`,
      },
    ],
    prompt:
      "Crie uma função chamada 'maiorDeTres(int a, int b, int c)' antes do int main() que retorne o maior dos três números inteiros. No main(), chame-a com valores de teste e imprima o resultado.",
    starterCode: `#include <iostream>\nusing namespace std;\n\n// Declare aqui: int maiorDeTres(int a, int b, int c) { ... }\n\nint main() {\n    // Chame maiorDeTres e imprima o resultado\n    return 0;\n}`,
    hints: [
      "Comece declarando int maior = a; dentro de maiorDeTres.",
      "Compare if (b > maior) maior = b; e if (c > maior) maior = c; depois return maior;.",
      "No main(), faça cout << maiorDeTres(10, 25, 14) << endl;",
    ],
    objectives: [
      {
        id: "cpp07-fn",
        label: "Definir função maiorDeTres antes do main()",
        test: ctx => ctx.success && /\bint\s+maiorDeTres\s*\(/.test(ctx.code) && ctx.output.length > 0,
      },
    ],
    testCases: [
      { id: "tc-cpp07-1", label: "maiorDeTres(4, 19, 8) == 19", expression: "maiorDeTres(4, 19, 8)", assertReturnEquals: 19 },
      { id: "tc-cpp07-2", label: "maiorDeTres(-5, -2, -9) == -2", expression: "maiorDeTres(-5, -2, -9)", assertReturnEquals: -2 },
    ],
    referenceSolution: `#include <iostream>\nusing namespace std;\n\nint maiorDeTres(int a, int b, int c) {\n    int maior = a;\n    if (b > maior) maior = b;\n    if (c > maior) maior = c;\n    return maior;\n}\n\nint main() {\n    cout << maiorDeTres(10, 25, 14) << endl;\n    return 0;\n}`,
  },
  {
    id: "cpp-08",
    trackId: "cpp",
    moduleId: "cpp-m3",
    moduleTitle: "Módulo 3 — Laços, Funções e Vetores",
    order: 8,
    title: "Vetores Dinâmicos (std::vector)",
    subtitle: "push_back, size() e agregação",
    difficulty: "Difícil",
    estimatedMinutes: 18,
    xp: 120,
    workbench: "code",
    requiresStdin: true,
    defaultStdin: "4\n10 25 15 30",
    summary: "Armazene uma sequência de medições em vector<int>, filtre valores e calcule estatísticas.",
    theoryBlocks: [
      {
        kind: "text",
        title: "Coleções com std::vector",
        content:
          "vector<T> é o container dinâmico padrão do C++. Com .push_back(valor) inserimos novos elementos e com .size() obtemos o tamanho atual.",
      },
    ],
    examples: [
      {
        title: "Preenchendo um vector",
        description: "Lê N elementos e os armazena no vetor.",
        code: `#include <vector>\nvector<int> dados;\ndados.push_back(10);\ncout << dados.size() << endl;`,
      },
    ],
    prompt:
      "Leia um inteiro N e depois leia N inteiros armazenando-os em um vector<int> chamado 'leituras'. Em seguida, conte quantos valores são >= 20 na variável 'acima20' e imprima esse contador.",
    starterCode: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> leituras;\n    // Leia n valores com cin e adicione em leituras com .push_back()\n    \n    int acima20 = 0;\n    // Percorra leituras usando i < leituras.size() e conte quantos >= 20\n    \n    cout << acima20 << endl;\n    return 0;\n}`,
    hints: [
      "Use um laço for (int i = 0; i < n; i++) lendo int x; cin >> x; leituras.push_back(x);.",
      "Em outro laço até leituras.size(), incremente acima20++ quando leituras[i] >= 20.",
      "Verifique se #include <vector> está no topo e se cout << acima20 << endl; aparece ao final.",
    ],
    objectives: [
      {
        id: "cpp08-vec",
        label: "Utilizar vector<int> e .push_back()",
        test: ctx => /vector\s*<\s*int\s*>/.test(ctx.code) && ctx.code.includes("push_back"),
      },
    ],
    testCases: [
      { id: "tc-cpp08-1", label: "Entrada [10, 25, 15, 30] -> 2", stdin: "4\n10 25 15 30", assertOutputEquals: "2" },
      { id: "tc-cpp08-2", label: "Entrada [5, 19, 20, 21, 50] -> 3", stdin: "5\n5 19 20 21 50", assertOutputEquals: "3" },
    ],
    referenceSolution: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> leituras;\n    for (int i = 0; i < n; i++) {\n        int v;\n        cin >> v;\n        leituras.push_back(v);\n    }\n    int acima20 = 0;\n    for (int i = 0; i < leituras.size(); i++) {\n        if (leituras[i] >= 20) {\n            acima20++;\n        }\n    }\n    cout << acima20 << endl;\n    return 0;\n}`,
  },
];
