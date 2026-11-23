import type { Lesson, TrackId } from "../types/curriculum";

export interface LessonRecallQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const LESSON_SPECIFIC_RECALL: Record<string, LessonRecallQuestion[]> = {
  "logic-01": [
    {
      id: "lr-logic01-1",
      prompt: "Por que declarar variáveis com nomes descritivos facilita algoritmos maiores?",
      options: [
        "Porque o programa executa duas vezes mais rápido automaticamente",
        "Porque deixa explícito qual dado está guardado na memória e evita erros de leitura",
        "Porque elimina a necessidade de usar estruturas condicionais",
      ],
      correctIndex: 1,
      explanation:
        "Nomes claros documentam a intenção de cada valor armazenado, reduzindo bugs quando o algoritmo cresce.",
    },
    {
      id: "lr-logic01-2",
      prompt: "Ao executar `x = 10` e depois `x = x + 5`, qual valor `x` passa a guardar?",
      options: ["10", "15", "5"],
      correctIndex: 1,
      explanation:
        "A atribuição primeiro calcula o lado direito (`10 + 5 = 15`) e depois sobrescreve o conteúdo de `x`.",
    },
  ],
  "cpp-01": [
    {
      id: "lr-cpp01-1",
      prompt: "Qual é a função obrigatória que marca o ponto de entrada de um programa em C++?",
      options: ["start()", "main()", "program()"],
      correctIndex: 1,
      explanation:
        "Todo executável C++ inicia sua execução dentro da função `int main()`, retornando `0` quando termina sem erro.",
    },
    {
      id: "lr-cpp01-2",
      prompt: "O que faz `endl` ou `\\n` ao final de uma instrução com `std::cout`?",
      options: [
        "Encerra o programa imediatamente",
        "Insere uma quebra de linha na saída padrão",
        "Declara uma nova variável inteira",
      ],
      correctIndex: 1,
      explanation:
        "Ambos quebram a linha no console; `endl` também força o descarregamento (flush) do buffer de saída.",
    },
  ],
  "cpp-04": [
    {
      id: "lr-cpp04-1",
      prompt: "Por que `std::getline(cin, nome)` costuma falhar logo após ler um número com `cin >>` se não limparmos o buffer?",
      options: [
        "Porque `cin >>` deixa a quebra de linha (`\\n`) pendente no buffer de entrada",
        "Porque `getline` aceita apenas números decimais",
        "Porque strings em C++ não suportam espaços",
      ],
      correctIndex: 0,
      explanation:
        "O operador `>>` para no espaço/Enter sem consumir o `\\n`. Usar `cin.ignore()` descarta essa quebra antes do `getline`.",
    },
  ],
  "js-01": [
    {
      id: "lr-js01-1",
      prompt: "Quando você deve preferir `const` em vez de `let` em JavaScript moderno?",
      options: [
        "Apenas quando o valor for um número inteiro",
        "Sempre que a referência da variável não precisar ser reatribuída depois",
        "Somente fora de funções",
      ],
      correctIndex: 1,
      explanation:
        "`const` evita reatribuições acidentais e deixa claro para quem lê o código que aquela ligação permanece estável.",
    },
  ],
  "web-01": [
    {
      id: "lr-web01-1",
      prompt: "Qual é a principal vantagem prática de usar `<header>`, `<main>` e `<section>` em vez de dezenas de `<div>`?",
      options: [
        "Permite dispensar totalmente arquivos CSS",
        "Dá significado estrutural para leitores de tela, acessibilidade e indexação",
        "Faz o navegador pular a análise do documento",
      ],
      correctIndex: 1,
      explanation:
        "HTML semântico comunica o papel de cada bloco da página para tecnologias assistivas e mecanismos de busca.",
    },
  ],
  "web-03": [
    {
      id: "lr-web03-1",
      prompt: "Na cascata do CSS, qual seletor possui maior especificidade entre estes três?",
      options: ["p (seletor de tag)", ".destaque (classe)", "#titulo-principal (id)"],
      correctIndex: 2,
      explanation:
        "Em CSS, um identificador (`#id`) tem especificidade maior que uma classe (`.classe`), que por sua vez supera uma tag simples.",
    },
  ],
  "web-04": [
    {
      id: "lr-web04-1",
      prompt: "O que muda quando aplicamos `box-sizing: border-box;` a um cartão CSS?",
      options: [
        "Padding e borda passam a ser incluídos dentro da largura/altura definida (`width`)",
        "A margem externa desaparece automaticamente",
        "O elemento deixa de aceitar bordas arredondadas",
      ],
      correctIndex: 0,
      explanation:
        "Com `border-box`, definir `width: 300px` mantém a caixa exatamente com 300px totais mesmo com `padding` e `border`.",
    },
  ],
  "web-05": [
    {
      id: "lr-web05-1",
      prompt: "Quando vale mais a pena combinar Flexbox e CSS Grid na mesma página?",
      options: [
        "Flexbox para alinhar eixos em linha/coluna (ex: navbar) e Grid para grades bidimensionais de cards",
        "Grid apenas para cores e Flexbox apenas para fontes",
        "Nunca — os dois não podem coexistir no mesmo CSS",
      ],
      correctIndex: 0,
      explanation:
        "Flexbox brilha em alinhamentos unidimensionais (1D), enquanto CSS Grid organiza linhas e colunas simultaneamente (2D).",
    },
  ],
  "web-06": [
    {
      id: "lr-web06-1",
      prompt: "Qual é a diferença de segurança e comportamento entre `.textContent` e `.innerHTML` ao atualizar um elemento do DOM?",
      options: [
        "Não há diferença; ambos interpretam HTML",
        "`.textContent` insere texto puro com segurança contra injeção de tags/scripts",
        "`.textContent` funciona apenas em títulos `<h1>`",
      ],
      correctIndex: 1,
      explanation:
        "`.textContent` trata o conteúdo apenas como texto literal, evitando interpretar HTML inesperado vindo de entrada externa.",
    },
  ],
  "web-07": [
    {
      id: "lr-web07-1",
      prompt: "Por que chamamos `event.preventDefault()` dentro de um listener de `submit` em formulários SPA?",
      options: [
        "Para impedir o navegador de recarregar a página e perder o estado atual em JavaScript",
        "Para apagar todos os inputs do formulário automaticamente",
        "Para bloquear cliques em qualquer outro botão da tela",
      ],
      correctIndex: 0,
      explanation:
        "O comportamento padrão do `<form>` é enviar uma requisição e recarregar a página; `preventDefault()` mantém o fluxo sob controle do JS.",
    },
  ],
  "web-08": [
    {
      id: "lr-web08-1",
      prompt: "Como HTML, CSS e JavaScript dividem responsabilidades em uma interface sustentável?",
      options: [
        "HTML estrutura o conteúdo, CSS controla aparência/layout e JS coordena estado, eventos e DOM",
        "JS substitui todo o HTML e CSS em todos os projetos",
        "CSS gerencia banco de dados e autenticação de usuários",
      ],
      correctIndex: 0,
      explanation:
        "Separar estrutura (HTML), apresentação (CSS) e comportamento (JS) deixa o projeto mais acessível e fácil de evoluir.",
    },
  ],
  "py-01": [
    {
      id: "lr-py01-1",
      prompt: "Como Python delimita blocos de código dentro de condicionais, laços e funções?",
      options: [
        "Por indentação consistente (geralmente 4 espaços) após `:`",
        "Por chaves obrigatórias `{ }` em todos os casos",
        "Por ponto e vírgula `;` no início da linha",
      ],
      correctIndex: 0,
      explanation:
        "Em Python, a indentação faz parte da sintaxe e define exatamente quais instruções pertencem a cada bloco.",
    },
  ],
  "linux-01": [
    {
      id: "lr-linux01-1",
      prompt: "O que indica um caminho iniciado por `/` versus um caminho relativo no terminal Linux?",
      options: [
        "Iniciado por `/` é absoluto a partir da raiz do sistema; sem `/` parte do diretório atual (`pwd`)",
        "Caminhos com `/` só funcionam para arquivos de imagem",
        "Não há diferença entre caminhos absolutos e relativos",
      ],
      correctIndex: 0,
      explanation:
        "Um caminho absoluto começa na raiz `/` e funciona de qualquer pasta; o relativo depende do diretório onde você está.",
    },
  ],
  "net-01": [
    {
      id: "lr-net01-1",
      prompt: "Qual é a responsabilidade da camada de Transporte (TCP/UDP) antes de os dados chegarem à aplicação HTTP?",
      options: [
        "Endereçar portas de origem/destino e controlar entrega confiável (TCP) ou rápida (UDP)",
        "Renderizar tags HTML e aplicar CSS na tela",
        "Armazenar senhas diretamente no roteador",
      ],
      correctIndex: 0,
      explanation:
        "TCP e UDP identificam qual processo/porta recebe os segmentos e, no caso do TCP, garantem ordem e retransmissão.",
    },
  ],
  "db-01": [
    {
      id: "lr-db01-1",
      prompt: "Em consultas SQL (`SELECT ... FROM ... WHERE ... ORDER BY`), qual cláusula filtra linhas antes de ordenar?",
      options: ["WHERE", "ORDER BY", "CREATE TABLE"],
      correctIndex: 0,
      explanation:
        "`WHERE` filtra quais registros entram no resultado; depois `ORDER BY` organiza a apresentação final.",
    },
  ],
};

const TRACK_FALLBACK_RECALL: Record<TrackId, LessonRecallQuestion[]> = {
  logic: [
    {
      id: "rf-logic-1",
      prompt: "Qual prática reduz erros ao transformar um problema do mundo real em algoritmo?",
      options: [
        "Quebrar em entradas, processamento passo a passo e saídas verificáveis",
        "Escrever todas as instruções sem testar casos de borda",
        "Evitar funções para manter tudo em uma única linha",
      ],
      correctIndex: 0,
      explanation:
        "Separar entradas, transformações intermediárias e saídas facilita rastrear desvios lógicos em qualquer linguagem.",
    },
    {
      id: "rf-logic-2",
      prompt: "Quando uma condição booleana usa o operador lógico `E` (`&&`), quando ela é verdadeira?",
      options: [
        "Apenas quando ambas as expressões avaliam como verdadeiras",
        "Sempre que pelo menos uma das expressões for falsa",
        "Quando qualquer uma delas for verdadeira",
      ],
      correctIndex: 0,
      explanation:
        "Na conjunção lógica (`E`), todas as condições envolvidas precisam ser verdadeiras ao mesmo tempo.",
    },
  ],
  cpp: [
    {
      id: "rf-cpp-1",
      prompt: "Qual é o benefício prático da tipagem estática em C++ (`int`, `double`, `string`)?",
      options: [
        "O compilador verifica compatibilidade de tipos antes de executar e otimiza o uso de memória",
        "Elimina a necessidade de compilar o programa",
        "Converte automaticamente texto livre em operações matemáticas",
      ],
      correctIndex: 0,
      explanation:
        "Checar tipos em tempo de compilação captura inconsistências cedo e garante representação previsível em memória.",
    },
    {
      id: "rf-cpp-2",
      prompt: "Ao dividir dois números inteiros em C++ (`5 / 2`), o que acontece se você não usar ponto flutuante?",
      options: [
        "Ocorre divisão inteira, resultando em `2` (a fração é descartada)",
        "Sempre resulta em `2.5` automaticamente",
        "Gera erro de sintaxe obrigatório",
      ],
      correctIndex: 0,
      explanation:
        "Para obter `2.5`, pelo menos um operando precisa ser `double` (como `5.0 / 2` ou conversão explícita).",
    },
  ],
  js: [
    {
      id: "rf-js-1",
      prompt: "Por que comparar com `===` em vez de `==` evita surpresas em JavaScript?",
      options: [
        "Porque `===` verifica valor e tipo sem conversão implícita (coerção)",
        "Porque `===` funciona apenas com arrays",
        "Porque `==` é inválido no navegador",
      ],
      correctIndex: 0,
      explanation:
        "`===` exige igualdade estrita de tipo e valor, prevenindo casos confusos como `'0' == 0` retornar verdadeiro.",
    },
    {
      id: "rf-js-2",
      prompt: "O que torna funções puras e pequenas mais fáceis de manter em JavaScript?",
      options: [
        "Recebem parâmetros claros, produzem resultado previsível e podem ser testadas isoladamente",
        "Dependem sempre de variáveis globais mutáveis",
        "Só podem ser executadas uma única vez por arquivo",
      ],
      correctIndex: 0,
      explanation:
        "Isolar responsabilidade em funções bem nomeadas facilita depuração e reuso tanto no Node quanto no navegador.",
    },
  ],
  web: [
    {
      id: "rf-web-1",
      prompt: "Por que testar layouts tanto no modo Desktop quanto Mobile durante o desenvolvimento Web?",
      options: [
        "Para garantir leitura confortável, botões acessíveis e ausência de quebra/estouro horizontal",
        "Porque navegadores móveis ignoram arquivos HTML",
        "Porque JavaScript não executa abaixo de 500px",
      ],
      correctIndex: 0,
      explanation:
        "Design responsivo adapta colunas, espaçamento e alvos de toque para diferentes tamanhos de viewport.",
    },
    {
      id: "rf-web-2",
      prompt: "Ao inspecionar elementos no DOM com `document.querySelector`, o que a função retorna?",
      options: [
        "O primeiro elemento que corresponde ao seletor CSS (ou `null` se não encontrar)",
        "Sempre uma string com todo o CSS da página",
        "Um novo arquivo HTML salvo em disco",
      ],
      correctIndex: 0,
      explanation:
        "Verificar se o retorno de `querySelector` não é `null` evita erros em tempo de execução ao alterar propriedades.",
    },
  ],
  python: [
    {
      id: "rf-py-1",
      prompt: "Por que `f-strings` (`f\"Total: {valor:.2f}\"`) são recomendadas em Python moderno?",
      options: [
        "Tornam a formatação de texto legível e direta dentro das chaves `{}`",
        "Transformam listas automaticamente em dicionários",
        "Substituem a necessidade de laços `for`",
      ],
      correctIndex: 0,
      explanation:
        "F-strings avaliam expressões direto dentro da string com leitura limpa e controle fino de casas decimais.",
    },
    {
      id: "rf-py-2",
      prompt: "Qual estrutura Python associa chaves únicas a valores para busca rápida (`cliente[\"nome\"]`)?",
      options: ["Dicionário (`dict`)", "Inteiro (`int`)", "Comentário (`#`)"],
      correctIndex: 0,
      explanation:
        "Dicionários armazenam pares `chave: valor`, ideais para representar registros e respostas no formato JSON.",
    },
  ],
  linux: [
    {
      id: "rf-lx-1",
      prompt: "Qual é o papel do operador pipe (`|`) ao encadear comandos no terminal Linux?",
      options: [
        "Enviar a saída padrão (`stdout`) do comando anterior como entrada (`stdin`) do próximo",
        "Desligar a máquina após executar o comando",
        "Apagar arquivos ocultos sem confirmação",
      ],
      correctIndex: 0,
      explanation:
        "Pipes permitem compor ferramentas pequenas e focadas (`ls | grep`, `cat | sort | uniq`) em pipelines poderosos.",
    },
    {
      id: "rf-lx-2",
      prompt: "Por que permissões (`chmod`, r/w/x) são essenciais em servidores Linux?",
      options: [
        "Controlam quem pode ler, modificar ou executar arquivos, limitando danos por erro ou invasão",
        "Apenas mudam a cor do texto no terminal",
        "Servem somente para compactar pastas",
      ],
      correctIndex: 0,
      explanation:
        "Princípio do menor privilégio: dar apenas as permissões necessárias reduz drasticamente riscos operacionais.",
    },
  ],
  networks: [
    {
      id: "rf-net-1",
      prompt: "Por que dividir redes com máscaras CIDR (`/24`, `/26`) melhora organização e segurança?",
      options: [
        "Separa domínios de broadcast, isola segmentos e otimiza o aproveitamento de endereços IP",
        "Remove a necessidade de cabeamento ou Wi-Fi",
        "Transforma automaticamente HTTP em SQL",
      ],
      correctIndex: 0,
      explanation:
        "Sub-redes menores contêm tráfego local, facilitam políticas de firewall entre áreas e evitam desperdício de IPs.",
    },
    {
      id: "rf-net-2",
      prompt: "Qual é a função de uma regra de firewall / ACL bem configurada entre sub-redes?",
      options: [
        "Permitir somente portas e origens necessárias, bloqueando tráfego não autorizado",
        "Aumentar o brilho da interface gráfica",
        "Substituir backups do banco de dados",
      ],
      correctIndex: 0,
      explanation:
        "Regras explícitas reduzem superfície de ataque mantendo apenas fluxos previstos de aplicação.",
    },
  ],
  database: [
    {
      id: "rf-db-1",
      prompt: "Por que ligar tabelas com chave estrangeira (`FOREIGN KEY`) em vez de repetir texto em toda linha?",
      options: [
        "Evita duplicidade inconsistente e garante integridade referencial entre entidades",
        "Impede a tabela de ter mais de 10 linhas",
        "Dispensa totalmente o uso de índices e chaves primárias",
      ],
      correctIndex: 0,
      explanation:
        "Relacionar por ID único impede pedidos apontarem para clientes inexistentes e evita ter que atualizar nomes em mil lugares.",
    },
    {
      id: "rf-db-2",
      prompt: "Qual é a diferença entre `WHERE` e `HAVING` em consultas SQL agregadas?",
      options: [
        "`WHERE` filtra linhas antes do `GROUP BY`; `HAVING` filtra grupos depois das agregações (`COUNT`, `SUM`)",
        "São exatamente iguais e podem ser trocados livremente após `ORDER BY`",
        "`HAVING` funciona apenas ao criar tabelas",
      ],
      correctIndex: 0,
      explanation:
        "Lembrar a ordem lógica (`FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY`) resolve quase toda dúvida SQL.",
    },
  ],
};

export function getRecallQuestionsForLesson(lesson: Lesson): LessonRecallQuestion[] {
  const specific = LESSON_SPECIFIC_RECALL[lesson.id] || [];
  const fallback = TRACK_FALLBACK_RECALL[lesson.trackId] || [];

  const merged = [...specific];
  for (const item of fallback) {
    if (merged.length >= 3) break;
    if (!merged.some(q => q.id === item.id)) {
      merged.push(item);
    }
  }
  return merged;
}
