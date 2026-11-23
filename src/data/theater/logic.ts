import {
  buildSyncedCues,
  type TheaterCodeLine,
  type TheaterLessonScript,
} from "../../types/theater";

/* ==========================================================================
   TRILHA 1 · LÓGICA DE PROGRAMAÇÃO (10 AULAS INDIVIDUAIS COM A LIA)
   Cada aula tem roteiro, metáfora visual, código ao vivo e interação próprios,
   com `buildSyncedCues` garantindo 100% de coerência entre legenda e áudio.
   ========================================================================== */

function logic01Lines(
  nameVal: string,
  ageVal: string,
  opts?: {
    typeL2?: number;
    typeL3?: number;
    typeL5?: number;
    focus?: "box1" | "box2" | "quotes" | "vars" | "none";
  }
): TheaterCodeLine[] {
  const focus = opts?.focus ?? "none";
  return [
    {
      lineNumber: 1,
      tokens: [{ text: "// Cria as caixas e guarda os valores", kind: "comment" }],
    },
    {
      lineNumber: 2,
      spotlight: focus === "box1" ? "violet" : undefined,
      pointerPill:
        focus === "box1" ? { text: "← Caixa 1 (texto com aspas)", tone: "violet" } : undefined,
      typeProgress: opts?.typeL2,
      tokens: [
        { text: "var ", kind: "kw" },
        { text: "nome", kind: "var-violet", pulse: focus === "vars" },
        { text: " = " },
        { text: `"${nameVal}"`, kind: "str", pulse: focus === "quotes" },
      ],
    },
    {
      lineNumber: 3,
      spotlight: focus === "box2" ? "cyan" : undefined,
      pointerPill:
        focus === "box2" ? { text: "← Caixa 2 (número sem aspas)", tone: "cyan" } : undefined,
      typeProgress: opts?.typeL3,
      tokens: [
        { text: "var ", kind: "kw" },
        { text: "idade", kind: "var-cyan", pulse: focus === "vars" },
        { text: " = " },
        { text: ageVal, kind: "num" },
      ],
    },
    {
      lineNumber: 4,
      tokens: [{ text: "// Lê as caixas e imprime no console", kind: "comment" }],
    },
    {
      lineNumber: 5,
      spotlight: focus === "quotes" || focus === "vars" ? "cyan" : undefined,
      pointerPill:
        focus === "quotes"
          ? { text: "Com aspas = texto fixo", tone: "amber" }
          : focus === "vars"
            ? { text: "Sem aspas = busca valor na caixa!", tone: "green" }
            : undefined,
      typeProgress: opts?.typeL5,
      tokens: [
        { text: "escreva", kind: "fn" },
        { text: "(" },
        { text: '"Olá,"', kind: "str", pulse: focus === "quotes" },
        { text: ", " },
        { text: "nome", kind: "var-violet", pulse: focus === "vars" },
        { text: ", " },
        { text: '"-"', kind: "str", pulse: focus === "quotes" },
        { text: ", " },
        { text: "idade", kind: "var-cyan", pulse: focus === "vars" },
        { text: ")" },
      ],
    },
  ];
}

const LOGIC_01: TheaterLessonScript = {
  lessonId: "logic-01",
  languageLabel: "Portugol",
  visualTitle: "Caixas na Memória",
  codeTitle: "Exemplo em Código · Portugol",
  initialValues: { nome: "Ana", idade: "20" },
  acts: [
    {
      id: "act-01",
      title: "A estante de caixas na memória",
      milestoneLabel: "Estante",
      themeVariant: "default",
      layout: "center-story",
      audioFile: "act-01.mp3",
      durationMs: 18500,
      cues: buildSyncedCues([
        { text: "Oi! Eu sou a **Lia**, sua mentora aqui no **Code Entry**." },
        {
          text: "Antes de digitar código, imagine a memória do computador como uma **estante cheia de caixas**.",
        },
        {
          text: "Criar uma **variável** é pegar uma caixa, colar uma **etiqueta** como **nome** ou **idade**, e guardar um **valor** lá dentro!",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.ratio < 0.35 ? "wink" : rt.ratio < 0.72 ? "happy" : "starry",
        pointing: rt.ratio >= 0.4 ? "right" : "none",
        placement: "corner-left",
        callout: rt.ratio >= 0.7 ? "Cada caixa guarda 1 valor!" : undefined,
      }),
      getVisual: rt => ({
        kind: "concept-hook",
        eyebrow: "Aula 01 · Variáveis e Saída",
        headline: "Como o computador lembra das informações?",
        tone: "violet",
        cards: [
          {
            badge: "1. Etiqueta",
            title: "nome",
            value: '"Ana" (texto)',
            state: "active",
            visible: rt.ratio >= 0.25,
          },
          {
            badge: "2. Etiqueta",
            title: "idade",
            value: "20 (número)",
            state: "good",
            visible: rt.ratio >= 0.52,
          },
        ],
        verdict: {
          text: "Texto usa aspas (\"Ana\") · Número vai direto (20)",
          tone: "info",
          visible: rt.ratio >= 0.78,
        },
        caption: "Tudo na memória tem um nome único e um valor guardado.",
      }),
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-02",
      title: "Abrindo e comparando as caixas",
      milestoneLabel: "Caixas",
      themeVariant: "default",
      layout: "visual-focus",
      audioFile: "act-02.mp3",
      durationMs: 15500,
      cues: buildSyncedCues([
        {
          text: "Veja as duas caixas lado a lado: a caixa **nome** guarda um **texto**, sempre protegido por aspas.",
        },
        {
          text: "Já a caixa **idade** guarda um **número** puro — sem aspas, pronto para fazer contas depois!",
        },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.55,
        expression: "explaining",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.55 ? "Número não usa aspas!" : undefined,
      }),
      getVisual: rt => ({
        kind: "memory-boxes",
        boxes: [
          {
            id: "nome",
            label: "nome",
            typeTag: "texto",
            value: '"Ana"',
            tone: "violet",
            focused: rt.ratio < 0.55,
            callout: rt.ratio < 0.55 ? { text: "Texto entre aspas", tone: "violet" } : undefined,
          },
          {
            id: "idade",
            label: "idade",
            typeTag: "número",
            value: "20",
            tone: "cyan",
            dimmed: rt.ratio < 0.42,
            focused: rt.ratio >= 0.55,
            callout: rt.ratio >= 0.55 ? { text: "Número puro, sem aspas!", tone: "cyan" } : undefined,
          },
        ],
      }),
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-03",
      title: "Declarando variáveis no código",
      milestoneLabel: "Código",
      themeVariant: "default",
      layout: "split",
      audioFile: "act-03.mp3",
      durationMs: 16500,
      cues: buildSyncedCues([
        { text: "Agora olhe para o **código Portugol** ao lado sendo escrito ao vivo." },
        {
          text: "Em **var nome igual a \"Ana\"**, as **aspas duplas** avisam que **\"Ana\"** é um **texto**.",
          spoken: "Em var nome igual a Ana entre aspas, as aspas duplas avisam que Ana é um texto.",
        },
        {
          text: "Já em **var idade igual a 20**, o número **20** entra direto, **sem aspas**!",
          spoken: "Já em var idade igual a vinte, o número vinte entra direto, sem aspas!",
        },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.55,
        expression: "happy",
        pointing: "right",
        placement: "corner-left",
      }),
      getVisual: rt => ({
        kind: "memory-boxes",
        boxes: [
          {
            id: "nome",
            label: "nome",
            typeTag: "texto",
            value: '"Ana"',
            tone: "violet",
            focused: rt.ratio < 0.62,
            callout: rt.ratio < 0.62 ? { text: "Texto sempre entre aspas", tone: "violet" } : undefined,
          },
          {
            id: "idade",
            label: "idade",
            typeTag: "número",
            value: "20",
            tone: "cyan",
            focused: rt.ratio >= 0.62,
            callout: rt.ratio >= 0.62 ? { text: "Número puro, sem aspas!", tone: "cyan" } : undefined,
          },
        ],
      }),
      getCodeLines: rt =>
        logic01Lines("Ana", "20", {
          typeL2: Math.min(1, rt.ratio / 0.45),
          typeL3: rt.ratio < 0.5 ? 0 : Math.min(1, (rt.ratio - 0.5) / 0.38),
          focus: rt.ratio < 0.62 ? "box1" : "box2",
        }),
      getConsoleOutput: () => null,
    },
    {
      id: "act-04",
      title: "O comando escreva() e as aspas",
      milestoneLabel: "escreva()",
      themeVariant: "default",
      layout: "split",
      audioFile: "act-04.mp3",
      durationMs: 17500,
      cues: buildSyncedCues([
        {
          text: "Para mostrar dados no console, usamos o comando **escreva()**.",
          spoken: "Para mostrar dados no console, usamos o comando escreva.",
        },
        {
          text: "O segredo: tudo **entre aspas** (**\"Olá,\"**) aparece exatamente como foi digitado.",
          spoken: "O segredo: tudo entre aspas, como Olá, aparece exatamente como foi digitado.",
        },
        {
          text: "E quando citamos **nome** e **idade** **sem aspas**, o programa **abre cada caixa** e lê seu **valor**!",
        },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.6,
        expression: "starry",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.64 ? "Sem aspas = lê a caixa!" : undefined,
      }),
      getVisual: rt => ({
        kind: "memory-boxes",
        boxes: [
          {
            id: "nome",
            label: "nome",
            typeTag: "texto",
            value: '"Ana"',
            tone: "violet",
            focused: rt.ratio >= 0.64,
            callout: rt.ratio >= 0.64 ? { text: 'escreva() lê "Ana" daqui!', tone: "read" } : undefined,
          },
          {
            id: "idade",
            label: "idade",
            typeTag: "número",
            value: "20",
            tone: "cyan",
            focused: rt.ratio >= 0.64,
            callout: rt.ratio >= 0.64 ? { text: "escreva() lê 20 daqui!", tone: "read" } : undefined,
          },
        ],
      }),
      getCodeLines: rt =>
        logic01Lines("Ana", "20", {
          typeL5: Math.min(1, rt.ratio / 0.35),
          focus: rt.ratio >= 0.28 && rt.ratio < 0.64 ? "quotes" : rt.ratio >= 0.64 ? "vars" : "none",
        }),
      getConsoleOutput: rt => (rt.ratio >= 0.8 ? "Olá, Ana - 20" : null),
    },
    {
      id: "act-05",
      title: "Desafio: O que vai sair no console?",
      milestoneLabel: "Desafio",
      themeVariant: "default",
      layout: "split",
      audioFile: "act-05-question.mp3",
      durationMs: 11000,
      cues: buildSyncedCues([
        {
          text: "Agora é **com você**! Olhe para a linha do **escreva()** iluminada acima...",
          spoken: "Agora é com você! Olhe para a linha do escreva iluminada acima.",
        },
        { text: "Qual será a **saída no console** quando apertarmos **executar**?" },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.quizSolved ? "starry" : rt.selectedOption ? "explaining" : "curious",
        pointing: rt.quizSolved ? "up" : "right",
        placement: "corner-left",
        callout: rt.quizSolved ? "Na mosca!" : rt.selectedOption ? "Veja as aspas!" : "Qual sai?",
      }),
      interaction: {
        kind: "quiz",
        prompt: 'Qual será a saída de escreva("Olá,", nome, "-", idade)?',
        options: [
          { id: "A", label: "Olá, nome - idade" },
          { id: "B", label: "Olá, Ana - 20" },
          { id: "C", label: '"Ana" 20' },
        ],
        correctId: "B",
        nextLabel: "Testar com meus dados",
        feedback: {
          A: {
            audioFile: "act-05-wrong-a.mp3",
            cue: "Quase! Como **nome** e **idade** estão **sem aspas**, ele lê o **valor dentro da caixa** (**Ana** e **20**), não a etiqueta!",
            durationMs: 9500,
          },
          B: {
            audioFile: "act-05-correct.mp3",
            cue: "**Na mosca!** Sem aspas, o programa abriu as caixas **nome** e **idade** e exibiu: **Olá, Ana - 20**!",
            durationMs: 8500,
          },
          C: {
            audioFile: "act-05-wrong-c.mp3",
            cue: "Passou perto! Mas repare que o **escreva()** começa com **\"Olá,\"** e tem um **traço** entre os valores!",
            spoken:
              "Passou perto! Mas repare que o comando escreva começa com Olá e tem um traço entre os valores!",
            durationMs: 8500,
          },
        },
      },
      getVisual: rt => ({
        kind: "memory-boxes",
        boxes: [
          {
            id: "nome",
            label: "nome",
            typeTag: "texto",
            value: '"Ana"',
            tone: "violet",
            focused: rt.selectedOption !== "C",
          },
          {
            id: "idade",
            label: "idade",
            typeTag: "número",
            value: "20",
            tone: "cyan",
            focused: rt.selectedOption !== "C",
          },
        ],
      }),
      getCodeLines: rt =>
        logic01Lines("Ana", "20", {
          focus: rt.selectedOption === "C" ? "quotes" : "vars",
        }),
      getConsoleOutput: rt => (rt.quizSolved ? "Olá, Ana - 20" : null),
    },
    {
      id: "act-06",
      title: "Laboratório ao vivo e resumo",
      milestoneLabel: "Lab",
      themeVariant: "default",
      layout: "split",
      audioFile: "act-06-sandbox.mp3",
      durationMs: 14500,
      cues: buildSyncedCues([
        { text: "Hora de **experimentar ao vivo**! Troque o **nome** e a **idade** abaixo e clique em **Executar na Memória**." },
        { text: "Resumo da aula: **var** cria a caixa, textos vão **com aspas**, números **sem aspas** e **escreva()** mostra na tela!" },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.sandboxRan ? "starry" : "happy",
        pointing: "right",
        placement: "corner-left",
        callout: rt.sandboxRan ? "Caixas atualizadas!" : "Teste seus valores!",
      }),
      interaction: {
        kind: "sandbox",
        fields: [
          { key: "nome", label: "nome:", type: "text", maxLength: 20 },
          { key: "idade", label: "idade:", type: "number", min: 1, max: 120, short: true },
        ],
        submitLabel: "Executar na Memória",
        feedback: {
          audioFile: "act-06-custom.mp3",
          cue: "**Olha que demais!** As caixas guardaram seus novos valores e o **escreva()** já atualizou o console!",
          spoken:
            "Olha que demais! As caixas guardaram seus novos valores e o comando escreva já atualizou o console!",
          durationMs: 7500,
        },
      },
      getVisual: rt => ({
        kind: "memory-boxes",
        boxes: [
          {
            id: "nome",
            label: "nome",
            typeTag: "texto",
            value: `"${rt.values.nome.trim() || "Ana"}"`,
            tone: "violet",
            focused: rt.sandboxRan,
          },
          {
            id: "idade",
            label: "idade",
            typeTag: "número",
            value: rt.values.idade.trim() || "20",
            tone: "cyan",
            focused: rt.sandboxRan,
          },
        ],
      }),
      getCodeLines: rt =>
        logic01Lines(rt.values.nome.trim() || "Ana", rt.values.idade.trim() || "20"),
      getConsoleOutput: rt =>
        `Olá, ${rt.executedValues.nome.trim() || "Ana"} - ${rt.executedValues.idade.trim() || "20"}`,
    },
  ],
};

/* ==========================================================================
   LOGIC-02 · EXPRESSÕES, PRECEDÊNCIA E MÉDIA (Descoberta Visual + Árvore + Lab)
   ========================================================================== */
const LOGIC_02: TheaterLessonScript = {
  lessonId: "logic-02",
  languageLabel: "Portugol",
  visualTitle: "Laboratório de Expressões",
  codeTitle: "Fórmula da Média · Portugol",
  initialValues: { nota1: "8", nota2: "7", nota3: "9", parenteses: "true" },
  acts: [
    {
      id: "act-01",
      title: "A conta da pizza que deu errado",
      milestoneLabel: "Gancho",
      themeVariant: "math-amber",
      layout: "center-story",
      audioFile: "act-01.mp3",
      durationMs: 26000,
      cues: buildSyncedCues([
        {
          text: "Imagina que você e um amigo pediram uma **pizza de 40 reais**...",
        },
        {
          text: "...e mais um **refrigerante de 20 reais** para dividir por dois.",
        },
        {
          text: "No bom senso, o total é **60**, então cada um paga **30 reais**, certo?",
        },
        {
          text: "Mas se você digitar **40 + 20 / 2** direto no código, o computador olha primeiro para a **divisão**...",
        },
        {
          text: "...faz **20 dividido por 2 igual a 10**, soma com 40 e cobra **50 reais** de cada um!",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.ratio < 0.38 ? "wink" : rt.ratio < 0.78 ? "curious" : "startled",
        pointing: rt.ratio >= 0.56 ? "right" : "none",
        placement: "corner-left",
        callout:
          rt.ratio >= 0.78
            ? "R$ 50?! Cadê meus R$ 20?!"
            : rt.ratio >= 0.56
              ? "Olha a divisão furando a fila!"
              : undefined,
      }),
      getVisual: rt => {
        const stage =
          rt.ratio < 0.18
            ? 0
            : rt.ratio < 0.36
              ? 1
              : rt.ratio < 0.55
                ? 2
                : rt.ratio < 0.72
                  ? 3
                  : rt.ratio < 0.86
                    ? 4
                    : 5;
        return {
          kind: "bill-discovery",
          eyebrow: "Aula 02 · Expressões e Média",
          headline: "Por que 40 + 20 / 2 virou R$ 50?!",
          stage,
          caption:
            stage >= 5
              ? "O computador não lê como um humano distraído — ele segue regras rígidas de prioridade!"
              : "Sem código ainda: observe o que acontece com a conta passo a passo.",
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-02",
      title: "Como o computador resolve passo a passo",
      milestoneLabel: "Precedência",
      themeVariant: "math-amber",
      layout: "visual-focus",
      audioFile: "act-02.mp3",
      durationMs: 32000,
      cues: buildSyncedCues([
        {
          text: "O nome desse mistério é **precedência de operadores**: uma fila de prioridade.",
        },
        {
          text: "Na regra do computador, **multiplicação e divisão** passam na frente da **soma e subtração**.",
        },
        {
          text: "Veja com duas notas de prova: **7** e **9**. Se escrevermos **7 + 9 / 2**...",
        },
        {
          text: "...o programa ignora o **7 +** no início e resolve **9 dividido por 2 = 4.5** primeiro!",
        },
        {
          text: "Só no final ele soma **7 + 4.5** e entrega uma média impossível de **11.5**!",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.ratio < 0.5 ? "explaining" : rt.ratio < 0.8 ? "curious" : "startled",
        pointing: rt.ratio >= 0.25 ? "right" : "up",
        placement: "corner-left",
        callout:
          rt.ratio >= 0.82
            ? "Nota 11.5 em prova que vale 10!"
            : rt.ratio >= 0.55
              ? "Ele dividiu só o 9!"
              : undefined,
      }),
      getVisual: rt => {
        const s1 = rt.ratio >= 0.54;
        const s2 = rt.ratio >= 0.78;
        const verdict = rt.ratio >= 0.88;
        return {
          kind: "expr-evaluator",
          mode: "single",
          showPriorityRuler: true,
          activeRule: rt.ratio < 0.2 ? null : rt.ratio < 0.78 ? "muldiv" : "addsub",
          items: [
            {
              id: "bug-expr",
              badge: "Sem parênteses · Execução passo a passo",
              tone: verdict ? "bad" : "neutral",
              focused: true,
              verdictStamp: "BUG: 11.5 > 10!",
              showVerdict: verdict,
              tokens: [
                { text: "7", kind: "num" },
                { text: "+", kind: "op" },
                { text: "9", kind: "num", active: rt.ratio >= 0.35 && rt.ratio < 0.78 },
                { text: "/", kind: "op", active: rt.ratio >= 0.22 && rt.ratio < 0.78 },
                { text: "2", kind: "num", active: rt.ratio >= 0.35 && rt.ratio < 0.78 },
              ],
              steps: [
                {
                  label: "1º passo (prioridade /)",
                  expr: "9 / 2  →  4.5",
                  visible: s1,
                  active: s1 && !s2,
                  tone: "bad",
                },
                {
                  label: "2º passo (soma restante)",
                  expr: "7 + 4.5  →  11.5",
                  visible: s2,
                  active: s2,
                  tone: "bad",
                },
              ],
              finalResult: s2 ? "11.5" : "calculando...",
              note: verdict
                ? "A divisão só pegou o 9 — a nota 7 ficou de fora da divisão!"
                : "Observe qual trecho da expressão acende primeiro.",
            },
          ],
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-03",
      title: "O resgate dos parênteses",
      milestoneLabel: "Parênteses",
      themeVariant: "math-amber",
      layout: "visual-focus",
      audioFile: "act-03.mp3",
      durationMs: 30000,
      cues: buildSyncedCues([
        {
          text: "Como obrigamos o computador a **somar tudo antes de dividir**?",
        },
        {
          text: "Colocando **parênteses**: **(7 + 9) / 2**. Os parênteses são o **nível 1** da fila!",
        },
        {
          text: "Agora compare os dois lados: à esquerda sem parênteses dá **11.5**; à direita, o grupo **(7 + 9)** vira **16** primeiro...",
        },
        {
          text: "...e **16 dividido por 2** dá exatamente **8** — a média real do aluno!",
        },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio < 0.35 || rt.ratio >= 0.8,
        expression: rt.ratio >= 0.8 ? "starry" : "happy",
        pointing: rt.ratio >= 0.8 ? "right" : "up",
        placement: "corner-left",
        callout: rt.ratio >= 0.8 ? "Agora sim: média 8!" : undefined,
      }),
      getVisual: rt => {
        const rightStep1 = rt.ratio >= 0.45;
        const rightStep2 = rt.ratio >= 0.74;
        return {
          kind: "expr-evaluator",
          mode: "compare",
          showPriorityRuler: true,
          activeRule: rt.ratio >= 0.24 ? "parens" : null,
          items: [
            {
              id: "left-bad",
              badge: "Sem parênteses",
              tone: "bad",
              dimmed: rt.ratio >= 0.45,
              verdictStamp: "ERRADO",
              showVerdict: rt.ratio >= 0.55,
              tokens: [
                { text: "7", kind: "num" },
                { text: "+", kind: "op" },
                { text: "9", kind: "num" },
                { text: "/", kind: "op" },
                { text: "2", kind: "num" },
              ],
              steps: [
                { label: "1º /", expr: "9 / 2 = 4.5", visible: true, tone: "bad" },
                { label: "2º +", expr: "7 + 4.5 = 11.5", visible: true, tone: "bad" },
              ],
              finalResult: "11.5",
            },
            {
              id: "right-good",
              badge: "Com parênteses (Área VIP)",
              tone: "good",
              focused: rt.ratio >= 0.25,
              verdictStamp: "MÉDIA REAL: 8",
              showVerdict: rightStep2,
              tokens: [
                { text: "(", kind: "paren", grouped: true },
                { text: "7", kind: "num", grouped: true, active: rt.ratio >= 0.25 && !rightStep2 },
                { text: "+", kind: "op", grouped: true, active: rt.ratio >= 0.25 && !rightStep2 },
                { text: "9", kind: "num", grouped: true, active: rt.ratio >= 0.25 && !rightStep2 },
                { text: ")", kind: "paren", grouped: true },
                { text: "/", kind: "op", active: rightStep2 },
                { text: "2", kind: "num", active: rightStep2 },
              ],
              steps: [
                {
                  label: "1º Área VIP ( )",
                  expr: "(7 + 9)  →  16",
                  visible: rightStep1,
                  active: rightStep1 && !rightStep2,
                  tone: "good",
                },
                {
                  label: "2º Divide o total",
                  expr: "16 / 2  →  8",
                  visible: rightStep2,
                  active: rightStep2,
                  tone: "good",
                },
              ],
              finalResult: rightStep2 ? "8" : "...",
            },
          ],
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-04",
      title: "E com 3 notas? O erro fica ainda maior!",
      milestoneLabel: "3 Notas",
      themeVariant: "math-amber",
      layout: "visual-focus",
      audioFile: "act-04.mp3",
      durationMs: 28000,
      cues: buildSyncedCues([
        {
          text: "Na prática desta aula, você vai calcular a média de **3 notas**: **8**, **7** e **9**.",
        },
        {
          text: "Sem parênteses, **8 + 7 + 9 / 3** divide só o **9 por 3** e soma **8 + 7 + 3 = 18**!",
        },
        {
          text: "Agrupando as três notas em **(8 + 7 + 9) / 3**, a soma dá **24** e **24 / 3** resulta em **8** certinho!",
        },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.38,
        expression: rt.ratio >= 0.72 ? "wink" : "startled",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.72 ? "Agrupe TODAS as notas!" : "Média 18?! Socorro!",
      }),
      getVisual: rt => {
        const showRight = rt.ratio >= 0.56;
        return {
          kind: "expr-evaluator",
          mode: "compare",
          showPriorityRuler: true,
          activeRule: showRight ? "parens" : "muldiv",
          items: [
            {
              id: "three-bad",
              badge: "Sem parênteses (3 notas)",
              tone: "bad",
              focused: !showRight,
              dimmed: showRight,
              verdictStamp: "18?! ABSURDO",
              showVerdict: rt.ratio >= 0.42,
              tokens: [
                { text: "8", kind: "num" },
                { text: "+", kind: "op" },
                { text: "7", kind: "num" },
                { text: "+", kind: "op" },
                { text: "9", kind: "num", active: !showRight },
                { text: "/", kind: "op", active: !showRight },
                { text: "3", kind: "num", active: !showRight },
              ],
              steps: [
                { label: "1º /", expr: "9 / 3 = 3", visible: rt.ratio >= 0.25, tone: "bad" },
                { label: "2º soma", expr: "8 + 7 + 3 = 18", visible: rt.ratio >= 0.42, tone: "bad" },
              ],
              finalResult: rt.ratio >= 0.42 ? "18" : "...",
            },
            {
              id: "three-good",
              badge: "Com parênteses (Prática!)",
              tone: "good",
              focused: showRight,
              verdictStamp: "PERFEITO: 8",
              showVerdict: rt.ratio >= 0.84,
              tokens: [
                { text: "(", kind: "paren", grouped: true },
                { text: "8 + 7 + 9", kind: "num", grouped: true, active: showRight && rt.ratio < 0.84 },
                { text: ")", kind: "paren", grouped: true },
                { text: "/", kind: "op" },
                { text: "3", kind: "num" },
              ],
              steps: [
                { label: "1º soma VIP", expr: "(8 + 7 + 9) = 24", visible: showRight, tone: "good" },
                { label: "2º divide por 3", expr: "24 / 3 = 8", visible: rt.ratio >= 0.78, tone: "good" },
              ],
              finalResult: rt.ratio >= 0.78 ? "8" : "...",
            },
          ],
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-05",
      title: "Escrevendo a fórmula no Portugol",
      milestoneLabel: "Portugol",
      themeVariant: "math-amber",
      layout: "split",
      audioFile: "act-05.mp3",
      durationMs: 28000,
      cues: buildSyncedCues([
        {
          text: "Agora sim: vamos traduzir exatamente esse raciocínio para o **código Portugol**!",
        },
        {
          text: "Primeiro criamos as três caixas: **nota1 = 8**, **nota2 = 7** e **nota3 = 9**.",
        },
        {
          text: "Na linha 4 está o segredo: **var media = (nota1 + nota2 + nota3) / 3**.",
        },
        {
          text: "Por fim, **escreva(media)** imprime **8** limpo no console!",
        },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.5,
        expression: rt.ratio >= 0.82 ? "starry" : "explaining",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.5 && rt.ratio < 0.82 ? "Olha os ( ) na linha 4!" : undefined,
      }),
      getVisual: rt => ({
        kind: "expr-evaluator",
        mode: "single",
        showPriorityRuler: true,
        activeRule: rt.ratio >= 0.48 && rt.ratio < 0.78 ? "parens" : rt.ratio >= 0.78 ? "muldiv" : null,
        items: [
          {
            id: "portugol-map",
            badge: "Traduzindo variáveis para o cálculo",
            tone: "good",
            focused: true,
            tokens: [
              { text: "(", kind: "paren", grouped: true },
              { text: "nota1", kind: "var", grouped: true },
              { text: "+", kind: "op", grouped: true },
              { text: "nota2", kind: "var", grouped: true },
              { text: "+", kind: "op", grouped: true },
              { text: "nota3", kind: "var", grouped: true },
              { text: ")", kind: "paren", grouped: true },
              { text: "/", kind: "op" },
              { text: "3", kind: "num" },
            ],
            steps: [
              { label: "Lê caixas", expr: "(8 + 7 + 9) / 3", visible: rt.ratio >= 0.45, tone: "neutral" },
              { label: "1º soma VIP", expr: "24 / 3", visible: rt.ratio >= 0.65, tone: "good" },
              { label: "2º divide", expr: "8", visible: rt.ratio >= 0.8, tone: "good" },
            ],
            finalResult: rt.ratio >= 0.8 ? "8" : "...",
          },
        ],
      }),
      getCodeLines: rt => [
        {
          lineNumber: 1,
          typeProgress: Math.min(1, rt.ratio / 0.25),
          tokens: [{ text: "var ", kind: "kw" }, { text: "nota1", kind: "var-violet" }, { text: " = " }, { text: "8", kind: "num" }],
        },
        {
          lineNumber: 2,
          typeProgress: rt.ratio < 0.16 ? 0 : Math.min(1, (rt.ratio - 0.16) / 0.2),
          tokens: [{ text: "var ", kind: "kw" }, { text: "nota2", kind: "var-cyan" }, { text: " = " }, { text: "7", kind: "num" }],
        },
        {
          lineNumber: 3,
          typeProgress: rt.ratio < 0.28 ? 0 : Math.min(1, (rt.ratio - 0.28) / 0.2),
          tokens: [{ text: "var ", kind: "kw" }, { text: "nota3", kind: "var-violet" }, { text: " = " }, { text: "9", kind: "num" }],
        },
        {
          lineNumber: 4,
          spotlight: rt.ratio >= 0.48 ? "green" : undefined,
          typeProgress: rt.ratio < 0.45 ? 0 : Math.min(1, (rt.ratio - 0.45) / 0.3),
          pointerPill: rt.ratio >= 0.52 ? { text: "Parênteses salvam a média!", tone: "green" } : undefined,
          tokens: [
            { text: "var ", kind: "kw" },
            { text: "media", kind: "var-cyan" },
            { text: " = (" },
            { text: "nota1 + nota2 + nota3", kind: "plain", pulse: rt.ratio >= 0.52 && rt.ratio < 0.82 },
            { text: ") / " },
            { text: "3", kind: "num" },
          ],
        },
        {
          lineNumber: 5,
          spotlight: rt.ratio >= 0.8 ? "cyan" : undefined,
          typeProgress: rt.ratio < 0.75 ? 0 : Math.min(1, (rt.ratio - 0.75) / 0.22),
          tokens: [
            { text: "escreva", kind: "fn" },
            { text: "(media)" },
          ],
        },
      ],
      getConsoleOutput: rt => (rt.ratio >= 0.82 ? "8" : null),
    },
    {
      id: "act-06",
      title: "Desafio: Preveja o bug sem parênteses",
      milestoneLabel: "Desafio",
      themeVariant: "math-amber",
      layout: "split",
      audioFile: "act-06-question.mp3",
      durationMs: 18000,
      cues: buildSyncedCues([
        {
          text: "Sua vez de prever antes do computador rodar!",
        },
        {
          text: "Se alguém escrever **6 + 8 / 2** e **esquecer os parênteses**, qual número vai aparecer no console?",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.quizSolved ? "starry" : rt.selectedOption ? "explaining" : "curious",
        pointing: rt.quizSolved ? "up" : "right",
        placement: "corner-left",
        callout: rt.quizSolved ? "Na mosca: 10!" : rt.selectedOption ? "Lembra da fila!" : "Qual sai primeiro?",
      }),
      interaction: {
        kind: "quiz",
        prompt: "Quanto o computador calcula em 6 + 8 / 2 (sem parênteses)?",
        options: [
          { id: "A", label: "7" },
          { id: "B", label: "10" },
          { id: "C", label: "14" },
        ],
        correctId: "B",
        nextLabel: "Abrir Laboratório de 3 Notas",
        feedback: {
          A: {
            audioFile: "act-06-wrong-a.mp3",
            cue: "**7** só sairia com **(6 + 8) / 2**! Sem parênteses, ele resolve **8 / 2 = 4** antes de somar **6**.",
            durationMs: 8500,
          },
          B: {
            audioFile: "act-06-correct.mp3",
            cue: "**Acertou em cheio! 10!** Primeiro divide **8 / 2 = 4**, depois soma **6 + 4**. Nunca mais você cai nessa!",
            durationMs: 8500,
          },
          C: {
            audioFile: "act-06-wrong-c.mp3",
            cue: "Quase! **14** é só **6 + 8**, mas a divisão **8 / 2** fura a fila antes da soma!",
            durationMs: 7500,
          },
        },
      },
      getVisual: rt => ({
        kind: "expr-evaluator",
        mode: "single",
        showPriorityRuler: true,
        activeRule: "muldiv",
        items: [
          {
            id: "quiz-expr",
            badge: "Previsão de execução",
            tone: rt.quizSolved ? "bad" : "neutral",
            focused: true,
            verdictStamp: "8 / 2 PRIMEIRO!",
            showVerdict: rt.quizSolved,
            tokens: [
              { text: "6", kind: "num" },
              { text: "+", kind: "op" },
              { text: "8", kind: "num", active: true },
              { text: "/", kind: "op", active: true },
              { text: "2", kind: "num", active: true },
            ],
            steps: [
              { label: "1º /", expr: rt.quizSolved ? "8 / 2 = 4" : "8 / 2 = ?", visible: true, tone: rt.quizSolved ? "bad" : "neutral" },
              { label: "2º +", expr: rt.quizSolved ? "6 + 4 = 10" : "6 + ? = ?", visible: true, tone: rt.quizSolved ? "bad" : "neutral" },
            ],
            finalResult: rt.quizSolved ? "10" : "?",
          },
        ],
      }),
      getCodeLines: () => [
        { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "p1", kind: "var-violet" }, { text: " = " }, { text: "6", kind: "num" }] },
        { lineNumber: 2, tokens: [{ text: "var ", kind: "kw" }, { text: "p2", kind: "var-cyan" }, { text: " = " }, { text: "8", kind: "num" }] },
        { lineNumber: 3, spotlight: "amber", tokens: [{ text: "escreva", kind: "fn" }, { text: "(p1 + p2 / 2)" }] },
      ],
      getConsoleOutput: rt => (rt.quizSolved ? "10" : null),
    },
    {
      id: "act-07",
      title: "Laboratório ao vivo e resumo",
      milestoneLabel: "Lab",
      themeVariant: "math-amber",
      layout: "split",
      audioFile: "act-07-sandbox.mp3",
      durationMs: 33000,
      cues: buildSyncedCues([
        {
          text: "Hora do **Laboratório ao vivo**! Teste **3 notas** abaixo e ligue ou desligue os **parênteses**.",
        },
        {
          text: "Repare como, sem parênteses, só a **nota3** é dividida por 3 — estragando a média na hora!",
        },
        {
          text: "Resumo da aula: **1º parênteses ( )**, **2º multiplicação e divisão**, **3º soma e subtração**.",
        },
        {
          text: "Quando estiver pronto, clique em **Praticar** à direita para resolver o desafio de 3 notas no editor!",
        },
      ]),
      getLiaStage: rt => {
        const parensOn = rt.values.parenteses !== "false";
        return {
          visible: true,
          expression: parensOn ? "starry" : "startled",
          pointing: "right",
          placement: "corner-left",
          callout: parensOn ? "Parênteses OK! Média certinha" : "Sem ( ) deu bug na média!",
        };
      },
      interaction: {
        kind: "sandbox",
        fields: [
          { key: "nota1", label: "nota1:", type: "number", min: 0, max: 10, short: true },
          { key: "nota2", label: "nota2:", type: "number", min: 0, max: 10, short: true },
          { key: "nota3", label: "nota3:", type: "number", min: 0, max: 10, short: true },
          { key: "parenteses", label: "parênteses:", type: "toggle" },
        ],
        submitLabel: "Executar Fórmula",
        feedback: {
          audioFile: "act-07-run.mp3",
          cue: "**Boa!** Compare o resultado com e sem parênteses — agora você domina a precedência!",
          durationMs: 6500,
        },
      },
      getVisual: rt => {
        const n1 = Number(rt.values.nota1) || 0;
        const n2 = Number(rt.values.nota2) || 0;
        const n3 = Number(rt.values.nota3) || 0;
        const parensOn = rt.values.parenteses !== "false";
        const soma = Number((n1 + n2 + n3).toFixed(2));
        const n3Div = Number((n3 / 3).toFixed(2));
        const sem = Number((n1 + n2 + n3 / 3).toFixed(2));
        const com = Number(((n1 + n2 + n3) / 3).toFixed(2));
        return {
          kind: "expr-evaluator",
          mode: "compare",
          showPriorityRuler: true,
          activeRule: parensOn ? "parens" : "muldiv",
          items: [
            {
              id: "lab-sem",
              badge: "Sem parênteses",
              tone: "bad",
              focused: !parensOn,
              dimmed: parensOn,
              tokens: [
                { text: String(n1), kind: "num" },
                { text: "+", kind: "op" },
                { text: String(n2), kind: "num" },
                { text: "+", kind: "op" },
                { text: String(n3), kind: "num", active: !parensOn },
                { text: "/", kind: "op", active: !parensOn },
                { text: "3", kind: "num", active: !parensOn },
              ],
              steps: [
                { label: "1º /", expr: `${n3} / 3 = ${n3Div}`, visible: true, tone: "bad" },
                { label: "2º +", expr: `${n1} + ${n2} + ${n3Div} = ${sem}`, visible: true, tone: "bad" },
              ],
              finalResult: String(sem),
            },
            {
              id: "lab-com",
              badge: "Com parênteses",
              tone: "good",
              focused: parensOn,
              dimmed: !parensOn,
              tokens: [
                { text: "(", kind: "paren", grouped: true },
                { text: `${n1} + ${n2} + ${n3}`, kind: "num", grouped: true },
                { text: ")", kind: "paren", grouped: true },
                { text: "/", kind: "op" },
                { text: "3", kind: "num" },
              ],
              steps: [
                { label: "1º ( )", expr: `(${n1} + ${n2} + ${n3}) = ${soma}`, visible: true, tone: "good" },
                { label: "2º /", expr: `${soma} / 3 = ${com}`, visible: true, tone: "good" },
              ],
              finalResult: String(com),
            },
          ],
        };
      },
      getCodeLines: rt => {
        const n1 = Number(rt.values.nota1) || 0;
        const n2 = Number(rt.values.nota2) || 0;
        const n3 = Number(rt.values.nota3) || 0;
        const parensOn = rt.values.parenteses !== "false";
        return [
          { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "nota1", kind: "var-violet" }, { text: " = " }, { text: String(n1), kind: "num" }] },
          { lineNumber: 2, tokens: [{ text: "var ", kind: "kw" }, { text: "nota2", kind: "var-cyan" }, { text: " = " }, { text: String(n2), kind: "num" }] },
          { lineNumber: 3, tokens: [{ text: "var ", kind: "kw" }, { text: "nota3", kind: "var-violet" }, { text: " = " }, { text: String(n3), kind: "num" }] },
          {
            lineNumber: 4,
            spotlight: parensOn ? "green" : "amber",
            pointerPill: {
              text: parensOn ? "Com ( ): média correta!" : "Sem ( ): bug de precedência!",
              tone: parensOn ? "green" : "amber",
            },
            tokens: parensOn
              ? [{ text: "var ", kind: "kw" }, { text: "media", kind: "var-cyan" }, { text: " = (nota1 + nota2 + nota3) / 3" }]
              : [{ text: "var ", kind: "kw" }, { text: "media", kind: "var-cyan" }, { text: " = nota1 + nota2 + nota3 / 3" }],
          },
          { lineNumber: 5, tokens: [{ text: "escreva", kind: "fn" }, { text: "(media)" }] },
        ];
      },
      getConsoleOutput: rt => {
        const n1 = Number(rt.executedValues.nota1) || 0;
        const n2 = Number(rt.executedValues.nota2) || 0;
        const n3 = Number(rt.executedValues.nota3) || 0;
        const parensOn = rt.executedValues.parenteses !== "false";
        const res = parensOn ? (n1 + n2 + n3) / 3 : n1 + n2 + n3 / 3;
        return String(Number(res.toFixed(2)));
      },
    },
  ],
};

/* ==========================================================================
   LOGIC-03 · LÓGICA BOOLEANA (Portaria do Show + Portas e / ou / nao)
   ========================================================================== */
const LOGIC_03: TheaterLessonScript = {
  lessonId: "logic-03",
  languageLabel: "Portugol",
  visualTitle: "Portas Lógicas (e / ou)",
  codeTitle: "Controle de Acesso · Portugol",
  initialValues: { ingresso: "true", idade: "19", operador: "e" },
  acts: [
    {
      id: "act-01",
      title: "A portaria do show: verdadeiro ou falso",
      milestoneLabel: "Cenário",
      themeVariant: "bool-cyan",
      layout: "center-story",
      audioFile: "act-01.mp3",
      durationMs: 22000,
      cues: buildSyncedCues([
        {
          text: "Imagine a portaria de um show: o segurança não faz contas — ele só responde **SIM** ou **NÃO**.",
        },
        {
          text: "Em programação, isso se chama **valor booleano**: só existem dois estados, **verdadeiro** ou **falso**.",
        },
        {
          text: "Aqui temos duas perguntas: **temIngresso** é verdadeiro? E **idade >= 18** também é verdadeiro?",
          spoken: "Aqui temos duas perguntas: tem ingresso é verdadeiro? E idade maior ou igual a 18 também é verdadeiro?",
        },
        {
          text: "Só entra no show quem passar nas regras que combinam essas duas respostas!",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.ratio < 0.4 ? "wink" : rt.ratio < 0.78 ? "curious" : "starry",
        pointing: rt.ratio >= 0.35 ? "right" : "none",
        placement: "corner-left",
        callout: rt.ratio >= 0.78 ? "Só verdadeiro ou falso!" : undefined,
      }),
      getVisual: rt => ({
        kind: "concept-hook",
        eyebrow: "Aula 03 · Lógica Booleana",
        headline: "Dois interruptores que decidem a entrada",
        tone: "cyan",
        cards: [
          {
            badge: "Condição 1",
            title: "temIngresso",
            value: "verdadeiro",
            state: "good",
            visible: rt.ratio >= 0.25,
          },
          {
            badge: "Condição 2",
            title: "idade >= 18",
            value: "19 >= 18 → verdadeiro",
            state: "good",
            visible: rt.ratio >= 0.52,
          },
        ],
        verdict: {
          text: "verdadeiro  e  verdadeiro  →  podeEntrar = verdadeiro!",
          tone: "good",
          visible: rt.ratio >= 0.78,
        },
        caption: "Comparações como idade >= 18 sempre devolvem um valor booleano.",
      }),
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-02",
      title: "O operador E: exigente ao extremo",
      milestoneLabel: "Operador E",
      themeVariant: "bool-cyan",
      layout: "visual-focus",
      audioFile: "act-02.mp3",
      durationMs: 24000,
      cues: buildSyncedCues([
        {
          text: "Quando ligamos duas condições com o operador **e**, **todas** precisam ser verdadeiras ao mesmo tempo.",
        },
        {
          text: "Com ingresso **verdadeiro** e idade **19**, os dois lados acendem e a saída é **verdadeiro**!",
        },
        {
          text: "Mas se o ingresso for **falso**, não adianta ter 19 anos: um único **falso** já bloqueia o operador **e**!",
        },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.55,
        expression: "startled",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.55 ? "1 falso já trava o E!" : undefined,
      }),
      getVisual: rt => {
        const failCase = rt.ratio >= 0.55;
        const stage: 1 | 2 | 3 = rt.ratio < 0.22 ? 1 : rt.ratio < 0.42 ? 2 : 3;
        return {
          kind: "logic-gates",
          stage,
          inputs: [
            { label: "temIngresso", value: failCase ? "falso" : "verdadeiro", truthy: !failCase, focused: failCase },
            { label: "idade >= 18", value: "19 >= 18", truthy: true, focused: !failCase },
          ],
          operator: "e",
          expression: failCase ? "falso e verdadeiro" : "verdadeiro e verdadeiro",
          result: !failCase,
          resultLabel: failCase ? "falso" : "verdadeiro",
          note: failCase ? "No operador E, basta 1 falso para bloquear tudo." : "Ambos verdadeiros → acesso liberado!",
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-03",
      title: "Operador OU e o inversor NAO",
      milestoneLabel: "OU e NAO",
      themeVariant: "bool-cyan",
      layout: "visual-focus",
      audioFile: "act-03.mp3",
      durationMs: 23000,
      cues: buildSyncedCues([
        {
          text: "Já o operador **ou** é bem mais flexível: basta **uma única condição** verdadeira para o resultado ser **verdadeiro**!",
        },
        {
          text: "Por exemplo: **temIngresso ou ehVIP**. Mesmo sem ingresso, se for VIP já passa!",
        },
        {
          text: "E o operador **nao** apenas inverte o sinal: **nao verdadeiro** vira **falso**, e **nao falso** vira **verdadeiro**.",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.ratio >= 0.68 ? "wink" : "explaining",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.68 ? "NAO inverte o valor!" : "Com OU, basta 1 sim!",
      }),
      getVisual: rt => {
        const showNao = rt.ratio >= 0.68;
        return {
          kind: "logic-gates",
          stage: 3,
          inputs: showNao
            ? [{ label: "bloqueado", value: "falso", truthy: false, focused: true }]
            : [
                { label: "temIngresso", value: "falso", truthy: false },
                { label: "ehVIP", value: "verdadeiro", truthy: true, focused: true },
              ],
          operator: showNao ? "nao" : "ou",
          expression: showNao ? "nao falso" : "falso ou verdadeiro",
          result: true,
          resultLabel: "verdadeiro",
          note: showNao ? "nao falso inverte para verdadeiro!" : "Com OU, 1 verdadeiro já basta!",
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-04",
      title: "Escrevendo no Portugol",
      milestoneLabel: "No Código",
      themeVariant: "bool-cyan",
      layout: "split",
      audioFile: "act-04.mp3",
      durationMs: 22000,
      cues: buildSyncedCues([
        {
          text: "Veja como isso fica no **Portugol** do exercício desta aula.",
        },
        {
          text: "Criamos **temIngresso = verdadeiro** e **idade = 19**.",
        },
        {
          text: "Na linha 3 combinamos os dois: **var podeEntrar = temIngresso e idade >= 18**, e exibimos **verdadeiro**!",
          spoken: "Na linha 3 combinamos os dois: var podeEntrar igual a temIngresso e idade maior ou igual a 18, e exibimos verdadeiro!",
        },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.5,
        expression: "happy",
        pointing: "right",
        placement: "corner-left",
      }),
      getVisual: () => ({
        kind: "logic-gates",
        stage: 3,
        inputs: [
          { label: "temIngresso", value: "verdadeiro", truthy: true, focused: true },
          { label: "idade >= 18", value: "19 >= 18", truthy: true, focused: true },
        ],
        operator: "e",
        expression: "temIngresso e idade >= 18",
        result: true,
        resultLabel: "verdadeiro",
      }),
      getCodeLines: rt => [
        {
          lineNumber: 1,
          typeProgress: Math.min(1, rt.ratio / 0.28),
          tokens: [{ text: "var ", kind: "kw" }, { text: "temIngresso", kind: "var-violet" }, { text: " = " }, { text: "verdadeiro", kind: "kw" }],
        },
        {
          lineNumber: 2,
          typeProgress: rt.ratio < 0.25 ? 0 : Math.min(1, (rt.ratio - 0.25) / 0.25),
          tokens: [{ text: "var ", kind: "kw" }, { text: "idade", kind: "var-cyan" }, { text: " = " }, { text: "19", kind: "num" }],
        },
        {
          lineNumber: 3,
          spotlight: rt.ratio >= 0.5 ? "green" : undefined,
          typeProgress: rt.ratio < 0.48 ? 0 : Math.min(1, (rt.ratio - 0.48) / 0.3),
          pointerPill: rt.ratio >= 0.55 ? { text: "Combina os 2 testes!", tone: "green" } : undefined,
          tokens: [{ text: "var ", kind: "kw" }, { text: "podeEntrar", kind: "var-cyan" }, { text: " = temIngresso " }, { text: "e", kind: "kw", pulse: true }, { text: " idade >= 18" }],
        },
        {
          lineNumber: 4,
          spotlight: rt.ratio >= 0.78 ? "cyan" : undefined,
          typeProgress: rt.ratio < 0.76 ? 0 : Math.min(1, (rt.ratio - 0.76) / 0.22),
          tokens: [{ text: "escreva", kind: "fn" }, { text: "(podeEntrar)" }],
        },
      ],
      getConsoleOutput: rt => (rt.ratio >= 0.8 ? "verdadeiro" : null),
    },
    {
      id: "act-05",
      title: "Desafio booleano rápido",
      milestoneLabel: "Desafio",
      themeVariant: "bool-cyan",
      layout: "split",
      audioFile: "act-05.mp3",
      durationMs: 12000,
      cues: buildSyncedCues([
        {
          text: "Se **temIngresso** for **verdadeiro**, mas a **idade** for **16**, o que sai em **temIngresso e idade >= 18**?",
          spoken: "Se temIngresso for verdadeiro, mas a idade for 16, o que sai em temIngresso e idade maior ou igual a 18?",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.quizSolved ? "starry" : rt.selectedOption ? "explaining" : "curious",
        pointing: rt.quizSolved ? "up" : "right",
        placement: "corner-left",
        callout: rt.quizSolved ? "16 < 18 bloqueia o E!" : "Passa ou bloqueia?",
      }),
      interaction: {
        kind: "quiz",
        prompt: "Com temIngresso = verdadeiro e idade = 16 usando E, qual o resultado?",
        options: [
          { id: "A", label: "verdadeiro" },
          { id: "B", label: "falso" },
          { id: "C", label: "16" },
        ],
        correctId: "B",
        nextLabel: "Simular portas lógicas",
        feedback: {
          A: {
            audioFile: "act-05-wrong-a.mp3",
            cue: "Quase! Só daria verdadeiro se usássemos **ou**. Como é **e**, **16 >= 18** dá **falso** e trava tudo!",
            spoken: "Quase! Só daria verdadeiro se usássemos ou. Como é e, 16 maior ou igual a 18 dá falso e trava tudo!",
            durationMs: 8000,
          },
          B: {
            audioFile: "act-05-correct.mp3",
            cue: "**Exato! Falso!** O operador **e** exige os dois verdadeiros, e idade 16 não chega a 18!",
            durationMs: 7500,
          },
          C: {
            audioFile: "act-05-wrong-c.mp3",
            cue: "Opa! Expressões lógicas nunca devolvem números — só **verdadeiro** ou **falso**!",
            durationMs: 6500,
          },
        },
      },
      getVisual: () => ({
        kind: "logic-gates",
        stage: 3,
        inputs: [
          { label: "temIngresso", value: "verdadeiro", truthy: true },
          { label: "idade >= 18", value: "16 >= 18", truthy: false, focused: true },
        ],
        operator: "e",
        expression: "verdadeiro e falso",
        result: false,
        resultLabel: "falso",
      }),
      getCodeLines: () => [
        { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "temIngresso", kind: "var-violet" }, { text: " = " }, { text: "verdadeiro", kind: "kw" }] },
        { lineNumber: 2, tokens: [{ text: "var ", kind: "kw" }, { text: "idade", kind: "var-cyan" }, { text: " = " }, { text: "16", kind: "num" }] },
        { lineNumber: 3, spotlight: "violet", tokens: [{ text: "escreva", kind: "fn" }, { text: "(temIngresso " }, { text: "e", kind: "kw" }, { text: " idade >= 18)" }] },
      ],
      getConsoleOutput: rt => (rt.quizSolved ? "falso" : null),
    },
    {
      id: "act-06",
      title: "Laboratório de Portas e resumo",
      milestoneLabel: "Lab",
      themeVariant: "bool-cyan",
      layout: "split",
      audioFile: "act-06.mp3",
      durationMs: 16000,
      cues: buildSyncedCues([
        {
          text: "Brinque com os interruptores abaixo: ative ou desative **temIngresso**, mude a **idade** e alterne entre **E** e **OU**.",
        },
        {
          text: "Resumo da aula: **e** exige tudo verdadeiro, **ou** precisa de só um verdadeiro, e **nao** inverte o resultado!",
        },
      ]),
      getLiaStage: rt => {
        const ing = rt.values.ingresso === "true";
        const idadeOk = (Number(rt.values.idade) || 0) >= 18;
        const op = rt.values.operador === "ou" ? "ou" : "e";
        const res = op === "ou" ? ing || idadeOk : ing && idadeOk;
        return {
          visible: true,
          expression: res ? "starry" : "explaining",
          pointing: "right",
          placement: "corner-left",
          callout: res ? "Entrada liberada!" : "Acesso bloqueado!",
        };
      },
      interaction: {
        kind: "sandbox",
        fields: [
          { key: "ingresso", label: "ingresso:", type: "toggle" },
          { key: "idade", label: "idade:", type: "number", min: 1, max: 100, short: true },
          {
            key: "operador",
            label: "porta:",
            type: "select",
            options: [
              { value: "e", label: "e (ambos)" },
              { value: "ou", label: "ou (ao menos 1)" },
            ],
          },
        ],
        submitLabel: "Testar Acesso",
        feedback: {
          audioFile: "act-06-run.mp3",
          cue: "**Boa!** É assim que sistemas de login, ingressos e permissões decidem quem pode passar!",
          durationMs: 6000,
        },
      },
      getVisual: rt => {
        const ing = rt.values.ingresso === "true";
        const idadeVal = Number(rt.values.idade) || 0;
        const idadeOk = idadeVal >= 18;
        const op = rt.values.operador === "ou" ? "ou" : "e";
        const res = op === "ou" ? ing || idadeOk : ing && idadeOk;
        return {
          kind: "logic-gates",
          stage: 3,
          inputs: [
            { label: "temIngresso", value: ing ? "verdadeiro" : "falso", truthy: ing },
            { label: "idade >= 18", value: `${idadeVal} >= 18`, truthy: idadeOk },
          ],
          operator: op,
          expression: `${ing ? "verdadeiro" : "falso"} ${op} ${idadeOk ? "verdadeiro" : "falso"}`,
          result: res,
          resultLabel: res ? "verdadeiro" : "falso",
        };
      },
      getCodeLines: rt => {
        const ing = rt.values.ingresso === "true";
        const idadeVal = Number(rt.values.idade) || 0;
        const op = rt.values.operador === "ou" ? "ou" : "e";
        return [
          { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "temIngresso", kind: "var-violet" }, { text: " = " }, { text: ing ? "verdadeiro" : "falso", kind: "kw" }] },
          { lineNumber: 2, tokens: [{ text: "var ", kind: "kw" }, { text: "idade", kind: "var-cyan" }, { text: " = " }, { text: String(idadeVal), kind: "num" }] },
          { lineNumber: 3, spotlight: "cyan", tokens: [{ text: "escreva", kind: "fn" }, { text: "(temIngresso " }, { text: op, kind: "kw" }, { text: " idade >= 18)" }] },
        ];
      },
      getConsoleOutput: rt => {
        const ing = rt.executedValues.ingresso === "true";
        const idadeOk = (Number(rt.executedValues.idade) || 0) >= 18;
        const op = rt.executedValues.operador === "ou" ? "ou" : "e";
        const res = op === "ou" ? ing || idadeOk : ing && idadeOk;
        return res ? "verdadeiro" : "falso";
      },
    },
  ],
};

/* ==========================================================================
   LOGIC-04 · CONDICIONAL SE / SENAO (Catraca + Fluxograma Vivo + Fronteira + Lab)
   ========================================================================== */
const LOGIC_04: TheaterLessonScript = {
  lessonId: "logic-04",
  languageLabel: "Portugol",
  visualTitle: "Estação de Decisão",
  codeTitle: "Condicional se / senao · Portugol",
  initialValues: { cenario: "media", valor: "7.5" },
  acts: [
    {
      id: "act-01",
      title: "A catraca de decisão do dia a dia",
      milestoneLabel: "Cenário",
      themeVariant: "flow-emerald",
      layout: "center-story",
      audioFile: "act-01.mp3",
      durationMs: 27000,
      cues: buildSyncedCues([
        {
          text: "Até agora, todo algoritmo seguia **em linha reta**, executando uma linha depois da outra sem escolher nada.",
        },
        {
          text: "Mas programas reais precisam decidir — como uma **catraca de evento** que faz uma pergunta antes de abrir!",
        },
        {
          text: "Se chegar alguém com **idade = 20**, o teste **20 >= 18** dá **VERDADEIRO** e abre a pista verde.",
        },
        {
          text: "Já se chegar alguém com **idade = 15**, o teste dá **FALSO** e desvia na hora para o caminho laranja.",
        },
        {
          text: "Regra de ouro: **uma pergunta, dois caminhos — e apenas um deles executa!**",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression:
          rt.ratio < 0.35
            ? "wink"
            : rt.ratio < 0.65
              ? "happy"
              : rt.ratio < 0.85
                ? "curious"
                : "starry",
        pointing: rt.ratio >= 0.2 ? "right" : "none",
        placement: "corner-left",
        callout:
          rt.ratio >= 0.82
            ? "Nunca entra nos dois!"
            : rt.ratio >= 0.62
              ? "15 anos: desvia pro SENAO"
              : rt.ratio >= 0.42
                ? "20 anos: pista livre!"
                : undefined,
      }),
      getVisual: rt => {
        const stage =
          rt.ratio < 0.2
            ? 0
            : rt.ratio < 0.4
              ? 1
              : rt.ratio < 0.62
                ? 2
                : rt.ratio < 0.82
                  ? 3
                  : 4;
        return {
          kind: "turnstile-scene",
          eyebrow: "Aula 04 · Condicional se / senao",
          headline: "Quando o código precisa escolher um caminho",
          stage,
          activeTest:
            stage === 2
              ? { label: "Visitante A", value: "idade = 20", allowed: true }
              : stage >= 3
                ? { label: "Visitante B", value: "idade = 15", allowed: false }
                : null,
          caption:
            stage >= 4
              ? "No código, essa catraca se chama se / senao: só o ramo escolhido roda!"
              : "Observe a catraca avaliando cada visitante em tempo real.",
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-02",
      title: "Acompanhando o fluxograma ao vivo",
      milestoneLabel: "Fluxograma",
      themeVariant: "flow-emerald",
      layout: "visual-focus",
      audioFile: "act-02.mp3",
      durationMs: 34000,
      cues: buildSyncedCues([
        {
          text: "Antes de escrever código, desenhamos a decisão num **fluxograma**.",
        },
        {
          text: "O dado entra no topo e encontra o **losango** — é lá dentro que mora a pergunta: **idade >= 18?**",
        },
        {
          text: "Com **idade = 20**, o fluxo acende **só o caminho SIM** à esquerda e exibe **Maior de idade**.",
          spoken: "Com idade igual a 20, o fluxo acende só o caminho sim à esquerda e exibe Maior de idade.",
        },
        {
          text: "Agora trocamos a entrada para **idade = 15**: o caminho verde apaga, e a bolinha desce **só pelo caminho NÃO**!",
        },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio < 0.24 || rt.ratio >= 0.7,
        expression: rt.ratio >= 0.7 ? "explaining" : "happy",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.72 ? "Veja a bolinha mudando de rota!" : undefined,
      }),
      getVisual: rt => {
        const revealStage: 1 | 2 | 3 | 4 =
          rt.ratio < 0.2 ? 1 : rt.ratio < 0.42 ? 2 : rt.ratio < 0.56 ? 3 : 4;
        const showFalse = rt.ratio >= 0.66;
        return {
          kind: "svg-flowchart",
          revealStage,
          startLabel: "Início do Fluxo",
          inputBadge: showFalse ? "idade = 15" : "idade = 20",
          decisionLabel: "idade >= 18 ?",
          isTrue: !showFalse,
          verdictBadge: showFalse ? "15 >= 18 → FALSO" : "20 >= 18 → VERDADEIRO",
          trueLabel: "SIM",
          trueAction: 'Exibe "Maior de idade"',
          falseLabel: "NÃO",
          falseAction: 'Exibe "Menor de idade"',
          endLabel: "Fim do Fluxo",
          note: showFalse
            ? "Com idade = 15, o caminho verde fica apagado e o fluxo segue só pelo NÃO."
            : "Com idade = 20, o fluxo ignora o caminho NÃO e segue só pelo SIM.",
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-03",
      title: "Conectando o fluxograma ao Portugol",
      milestoneLabel: "No Código",
      themeVariant: "flow-emerald",
      layout: "split",
      audioFile: "act-03.mp3",
      durationMs: 30000,
      cues: buildSyncedCues([
        {
          text: "Agora compare o desenho à esquerda com o **Portugol** à direita.",
        },
        {
          text: "O **losango** vira **se (idade >= 18)** — a condição sempre vai dentro dos parênteses.",
        },
        {
          text: "As chaves **{ }** do **se** guardam o bloco do caminho **SIM**. Como **20 >= 18** é verdadeiro, o **senao** nem é executado!",
        },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.55,
        expression: "explaining",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.55 ? "O senao fica apagadinho!" : undefined,
      }),
      getVisual: () => ({
        kind: "svg-flowchart",
        revealStage: 4,
        startLabel: "Entrada",
        inputBadge: "idade = 20",
        decisionLabel: "idade >= 18 ?",
        isTrue: true,
        verdictBadge: "VERDADEIRO",
        trueLabel: "SIM",
        trueAction: 'escreva("Maior de idade")',
        falseLabel: "NÃO",
        falseAction: 'escreva("Menor de idade")',
        endLabel: "Fim",
      }),
      getCodeLines: rt => [
        {
          lineNumber: 1,
          typeProgress: Math.min(1, rt.ratio / 0.25),
          tokens: [{ text: "var ", kind: "kw" }, { text: "idade", kind: "var-violet" }, { text: " = " }, { text: "20", kind: "num" }],
        },
        {
          lineNumber: 2,
          spotlight: rt.ratio >= 0.25 ? "green" : undefined,
          typeProgress: rt.ratio < 0.22 ? 0 : Math.min(1, (rt.ratio - 0.22) / 0.28),
          pointerPill: rt.ratio >= 0.28 ? { text: "Losango vira se (...)", tone: "green" } : undefined,
          tokens: [{ text: "se", kind: "kw" }, { text: " (idade >= 18) {" }],
        },
        {
          lineNumber: 3,
          spotlight: rt.ratio >= 0.45 ? "green" : undefined,
          typeProgress: rt.ratio < 0.45 ? 0 : Math.min(1, (rt.ratio - 0.45) / 0.25),
          tokens: [{ text: '  escreva("Maior de idade")', kind: "fn" }],
        },
        {
          lineNumber: 4,
          dimmed: rt.ratio >= 0.65,
          typeProgress: rt.ratio < 0.6 ? 0 : Math.min(1, (rt.ratio - 0.6) / 0.28),
          pointerPill: rt.ratio >= 0.7 ? { text: "Pulado quando dá SIM!", tone: "amber" } : undefined,
          tokens: [{ text: "} " }, { text: "senao", kind: "kw" }, { text: ' { escreva("Menor de idade") }' }],
        },
      ],
      getConsoleOutput: rt => (rt.ratio >= 0.65 ? "Maior de idade" : null),
    },
    {
      id: "act-04",
      title: "O caso de fronteira: > versus >=",
      milestoneLabel: "Fronteira",
      themeVariant: "flow-emerald",
      layout: "visual-focus",
      audioFile: "act-04.mp3",
      durationMs: 32000,
      cues: buildSyncedCues([
        {
          text: "Cuidado com um bug famoso de quem começa a programar: o **caso de fronteira**!",
        },
        {
          text: "Imagine que a pessoa tem **exatamente 18 anos** e você escreveu **idade > 18**, sem o sinal de igual.",
          spoken: "Imagine que a pessoa tem exatamente 18 anos e você escreveu idade maior que 18, sem o sinal de igual.",
        },
        {
          text: "Como **18 NÃO é maior que 18**, o teste dá **FALSO** e o maior de idade é jogado pro caminho errado!",
        },
        {
          text: "Trocando para **idade >= 18**, o próprio **18** é incluído na fronteira e segue feliz pelo caminho **SIM**!",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.ratio >= 0.62 ? "starry" : "startled",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.62 ? ">= inclui a fronteira!" : "18 > 18 é FALSO!!",
      }),
      getVisual: rt => {
        const fixed = rt.ratio >= 0.62;
        return {
          kind: "svg-flowchart",
          revealStage: 4,
          compareBanner: fixed
            ? { text: "CORRIGIDO: idade >= 18 inclui o 18 na fronteira!", tone: "good" }
            : { text: "BUG DE FRONTEIRA: idade > 18 exclui quem tem 18!", tone: "bad" },
          startLabel: fixed ? "Fronteira Incluída" : "Bug de Fronteira!",
          inputBadge: "idade = 18",
          decisionLabel: fixed ? "18 >= 18 ? (com =)" : "18 > 18 ? (sem =)",
          isTrue: fixed,
          verdictBadge: fixed ? "18 >= 18 → VERDADEIRO" : "18 > 18 → FALSO!",
          trueLabel: "SIM",
          trueAction: '"Maior de idade"',
          falseLabel: "NÃO",
          falseAction: fixed ? '"Menor de idade"' : '"Menor de idade" (BUG!)',
          endLabel: "Fim",
          note: fixed
            ? "Sempre pergunte: o valor exato do limite entra no SIM ou no NÃO?"
            : "Sem o '=', o número 18 fica de fora da condição!",
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-05",
      title: "Aplicando na prática: Aprovado ou Reprovado",
      milestoneLabel: "Aprovação",
      themeVariant: "flow-emerald",
      layout: "split",
      audioFile: "act-05.mp3",
      durationMs: 28000,
      cues: buildSyncedCues([
        {
          text: "Na prática desta aula, o problema muda de idade para **nota média escolar**!",
        },
        {
          text: "Temos **var media = 7.5** e uma caixa vazia **var situacao = \"\"**.",
          spoken: "Temos var media igual a 7.5 e uma caixa vazia var situacao.",
        },
        {
          text: "A regra é **se (media >= 7)**: se for verdadeiro, guardamos **\"Aprovado\"** em **situacao**; **senao**, guardamos **\"Reprovado\"**.",
        },
        {
          text: "No final, **escreva(situacao)** mostra **Aprovado** no console!",
        },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.48,
        expression: rt.ratio >= 0.8 ? "starry" : "happy",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.8 ? "Igualzinho ao exercício!" : undefined,
      }),
      getVisual: () => ({
        kind: "svg-flowchart",
        revealStage: 4,
        startLabel: "Boletim",
        inputBadge: "media = 7.5",
        decisionLabel: "media >= 7 ?",
        isTrue: true,
        verdictBadge: "7.5 >= 7 → SIM",
        trueLabel: "SIM",
        trueAction: 'situacao = "Aprovado"',
        falseLabel: "NÃO",
        falseAction: 'situacao = "Reprovado"',
        endLabel: "escreva(situacao)",
      }),
      getCodeLines: rt => [
        {
          lineNumber: 1,
          typeProgress: Math.min(1, rt.ratio / 0.25),
          tokens: [{ text: "var ", kind: "kw" }, { text: "media", kind: "var-violet" }, { text: " = " }, { text: "7.5", kind: "num" }],
        },
        {
          lineNumber: 2,
          typeProgress: rt.ratio < 0.18 ? 0 : Math.min(1, (rt.ratio - 0.18) / 0.25),
          tokens: [{ text: "var ", kind: "kw" }, { text: "situacao", kind: "var-cyan" }, { text: " = " }, { text: '""', kind: "str" }],
        },
        {
          lineNumber: 3,
          spotlight: rt.ratio >= 0.45 ? "green" : undefined,
          typeProgress: rt.ratio < 0.4 ? 0 : Math.min(1, (rt.ratio - 0.4) / 0.25),
          tokens: [{ text: "se", kind: "kw" }, { text: " (media >= 7) {" }],
        },
        {
          lineNumber: 4,
          spotlight: rt.ratio >= 0.55 ? "green" : undefined,
          typeProgress: rt.ratio < 0.52 ? 0 : Math.min(1, (rt.ratio - 0.52) / 0.25),
          pointerPill: rt.ratio >= 0.6 ? { text: "Preenche a caixa!", tone: "green" } : undefined,
          tokens: [{ text: "  situacao", kind: "var-cyan" }, { text: ' = "Aprovado"' }],
        },
        {
          lineNumber: 5,
          dimmed: rt.ratio >= 0.7,
          tokens: [{ text: "} " }, { text: "senao", kind: "kw" }, { text: ' { situacao = "Reprovado" }' }],
        },
        {
          lineNumber: 6,
          spotlight: rt.ratio >= 0.8 ? "cyan" : undefined,
          tokens: [{ text: "escreva", kind: "fn" }, { text: "(situacao)" }],
        },
      ],
      getConsoleOutput: rt => (rt.ratio >= 0.8 ? "Aprovado" : null),
    },
    {
      id: "act-06",
      title: "Desafio de fronteira na média",
      milestoneLabel: "Desafio",
      themeVariant: "flow-emerald",
      layout: "split",
      audioFile: "act-06-question.mp3",
      durationMs: 20000,
      cues: buildSyncedCues([
        {
          text: "Hora de testar seu olhar! O aluno tirou **exatamente 7** de média.",
        },
        {
          text: "Se o código usa **se (media >= 7)**, o que aparece no console?",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.quizSolved ? "starry" : rt.selectedOption ? "explaining" : "curious",
        pointing: rt.quizSolved ? "up" : "right",
        placement: "corner-left",
        callout: rt.quizSolved ? "7 >= 7 é VERDADEIRO!" : rt.selectedOption ? "Olha o '='!" : "Aprova ou reprova?",
      }),
      interaction: {
        kind: "quiz",
        prompt: "Com media = 7 e condição se (media >= 7), qual será a saída?",
        options: [
          { id: "A", label: "Aprovado" },
          { id: "B", label: "Reprovado" },
          { id: "C", label: "Aprovado e Reprovado" },
        ],
        correctId: "A",
        nextLabel: "Abrir Laboratório de Decisão",
        feedback: {
          A: {
            audioFile: "act-06-correct.mp3",
            cue: "**Mandou bem!** O sinal **>=** significa maior **ou igual**: como **7 é igual a 7**, entra no **se** e imprime **Aprovado**!",
            durationMs: 8500,
          },
          B: {
            audioFile: "act-06-wrong-b.mp3",
            cue: "Opa! Só daria **Reprovado** se fosse **media > 7** (sem o igual). Com **>=**, o **7** já garante a aprovação!",
            durationMs: 8500,
          },
          C: {
            audioFile: "act-06-wrong-c.mp3",
            cue: "Lembra da catraca? Em **se / senao**, **nunca** os dois blocos executam ao mesmo tempo — só um caminho é escolhido!",
            durationMs: 8000,
          },
        },
      },
      getVisual: rt => ({
        kind: "svg-flowchart",
        revealStage: 4,
        startLabel: "Teste na Fronteira",
        inputBadge: "media = 7",
        decisionLabel: "7 >= 7 ?",
        isTrue: true,
        verdictBadge: rt.quizSolved ? "7 >= 7 → SIM!" : "Qual caminho?",
        trueLabel: "SIM",
        trueAction: '"Aprovado"',
        falseLabel: "NÃO",
        falseAction: '"Reprovado"',
        endLabel: "Fim",
      }),
      getCodeLines: () => [
        { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "media", kind: "var-violet" }, { text: " = " }, { text: "7", kind: "num" }] },
        { lineNumber: 2, spotlight: "cyan", tokens: [{ text: "se", kind: "kw" }, { text: " (media >= 7) {" }] },
        { lineNumber: 3, tokens: [{ text: '  escreva("Aprovado")', kind: "fn" }] },
        { lineNumber: 4, tokens: [{ text: "} " }, { text: "senao", kind: "kw" }, { text: ' { escreva("Reprovado") }' }] },
      ],
      getConsoleOutput: rt => (rt.quizSolved ? "Aprovado" : null),
    },
    {
      id: "act-07",
      title: "Laboratório de Decisão e resumo",
      milestoneLabel: "Lab",
      themeVariant: "flow-emerald",
      layout: "split",
      audioFile: "act-07-sandbox.mp3",
      durationMs: 35000,
      cues: buildSyncedCues([
        {
          text: "Agora teste **valores seus**! Escolha o cenário (**Média escolar** ou **Idade**) e digite um número abaixo.",
        },
        {
          text: "Experimente valores bem na fronteira — como **6.9**, **7** ou **17** e **18** — e veja a bolinha do fluxograma e o código reagirem!",
        },
        {
          text: "Resumo da aula: **se (condição)** testa uma pergunta lógica; se der **verdadeiro**, roda o bloco **se**; caso contrário, desvia pro **senao**.",
        },
        {
          text: "Clique em **Praticar** à direita quando estiver pronto para programar a aprovação no editor!",
        },
      ]),
      getLiaStage: rt => {
        const isMedia = (rt.values.cenario ?? "media") === "media";
        const val = Number(rt.values.valor) || 0;
        const limit = isMedia ? 7 : 18;
        const ok = val >= limit;
        const onBorder = val === limit;
        return {
          visible: true,
          expression: onBorder ? "starry" : ok ? "happy" : "explaining",
          pointing: "right",
          placement: "corner-left",
          callout: onBorder
            ? `Na risca! ${val} >= ${limit}!`
            : ok
              ? "Seguiu pelo caminho SIM!"
              : "Desviou pro senao!",
        };
      },
      interaction: {
        kind: "sandbox",
        fields: [
          {
            key: "cenario",
            label: "cenário:",
            type: "select",
            options: [
              { value: "media", label: "Média >= 7 (Boletim)" },
              { value: "idade", label: "Idade >= 18 (Evento)" },
            ],
          },
          { key: "valor", label: "valor:", type: "number", min: 0, max: 120, short: true },
        ],
        submitLabel: "Rodar Fluxograma",
        feedback: {
          audioFile: "act-07-run.mp3",
          cue: "**Olha o fluxo reagindo na hora!** Cada valor só ilumina o ramo que realmente executou no código!",
          durationMs: 6500,
        },
      },
      getVisual: rt => {
        const isMedia = (rt.values.cenario ?? "media") === "media";
        const val = Number(rt.values.valor) || 0;
        const limit = isMedia ? 7 : 18;
        const ok = val >= limit;
        return {
          kind: "svg-flowchart",
          revealStage: 4,
          startLabel: isMedia ? "Boletim" : "Catraca",
          inputBadge: `${isMedia ? "media" : "idade"} = ${val}`,
          decisionLabel: `${val} >= ${limit} ?`,
          isTrue: ok,
          verdictBadge: ok ? "VERDADEIRO (se)" : "FALSO (senao)",
          trueLabel: "SIM",
          trueAction: isMedia ? '"Aprovado"' : '"Maior de idade"',
          falseLabel: "NÃO",
          falseAction: isMedia ? '"Reprovado"' : '"Menor de idade"',
          endLabel: "Fim",
        };
      },
      getCodeLines: rt => {
        const isMedia = (rt.values.cenario ?? "media") === "media";
        const val = Number(rt.values.valor) || 0;
        const limit = isMedia ? 7 : 18;
        const ok = val >= limit;
        const varName = isMedia ? "media" : "idade";
        const trueOut = isMedia ? "Aprovado" : "Maior de idade";
        const falseOut = isMedia ? "Reprovado" : "Menor de idade";
        return [
          { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: varName, kind: "var-violet" }, { text: " = " }, { text: String(val), kind: "num" }] },
          { lineNumber: 2, spotlight: ok ? "green" : undefined, tokens: [{ text: "se", kind: "kw" }, { text: ` (${varName} >= ${limit}) {` }] },
          { lineNumber: 3, spotlight: ok ? "green" : undefined, dimmed: !ok, tokens: [{ text: `  escreva("${trueOut}")`, kind: "fn" }] },
          { lineNumber: 4, spotlight: !ok ? "amber" : undefined, dimmed: ok, tokens: [{ text: "} " }, { text: "senao", kind: "kw" }, { text: ` { escreva("${falseOut}") }` }] },
        ];
      },
      getConsoleOutput: rt => {
        const isMedia = (rt.executedValues.cenario ?? "media") === "media";
        const val = Number(rt.executedValues.valor) || 0;
        if (isMedia) return val >= 7 ? "Aprovado" : "Reprovado";
        return val >= 18 ? "Maior de idade" : "Menor de idade";
      },
    },
  ],
};

/* ==========================================================================
   LOGIC-05 · CLASSIFICADOR DE CONCEITOS (Escada de prioridades se/senao se)
   ========================================================================== */
const LOGIC_05: TheaterLessonScript = {
  lessonId: "logic-05",
  languageLabel: "Portugol",
  visualTitle: "Escada de Decisões",
  codeTitle: "classificarNota(nota) · Portugol",
  initialValues: { nota: "8.5" },
  acts: [
    {
      id: "act-01",
      title: "Quando há mais de dois caminhos",
      milestoneLabel: "Cenário",
      themeVariant: "ladder-violet",
      layout: "center-story",
      audioFile: "act-01.mp3",
      durationMs: 22000,
      cues: buildSyncedCues([
        {
          text: "Com **se** e **senao**, você escolhe entre **dois** caminhos. Mas e um boletim com conceitos **A, B, C e D**?",
        },
        {
          text: "Quando existem várias faixas de nota, encadeamos **senao se** em formato de **escada de prioridades**.",
        },
        {
          text: "O programa testa do degrau mais alto para o mais baixo e **para na primeira regra verdadeira**!",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.ratio < 0.45 ? "wink" : "happy",
        pointing: rt.ratio >= 0.35 ? "right" : "none",
        placement: "corner-left",
        callout: rt.ratio >= 0.72 ? "Para no primeiro SIM!" : undefined,
      }),
      getVisual: rt => ({
        kind: "concept-hook",
        eyebrow: "Aula 05 · Decisões Encadeadas",
        headline: "4 faixas de nota em uma escada ordenada",
        tone: "violet",
        cards: [
          { badge: "Degrau 1", title: "nota >= 9", value: 'Conceito "A"', state: "good", visible: rt.ratio >= 0.2 },
          { badge: "Degrau 2", title: "nota >= 7", value: 'Conceito "B"', state: "active", visible: rt.ratio >= 0.38 },
          { badge: "Degrau 3", title: "nota >= 5", value: 'Conceito "C"', state: "neutral", visible: rt.ratio >= 0.56 },
          { badge: "Base", title: "senao (< 5)", value: 'Conceito "D"', state: "bad", visible: rt.ratio >= 0.72 },
        ],
        verdict: {
          text: "Ordem decrescente: >= 9 → >= 7 → >= 5 → senao",
          tone: "info",
          visible: rt.ratio >= 0.82,
        },
      }),
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-02",
      title: "Subindo e descendo a escada com nota 8.5",
      milestoneLabel: "A Escada",
      themeVariant: "ladder-violet",
      layout: "visual-focus",
      audioFile: "act-02.mp3",
      durationMs: 24000,
      cues: buildSyncedCues([
        {
          text: "Acompanhe **nota = 8.5** entrando na escada: primeiro testamos **nota >= 9**. Deu falso!",
          spoken: "Acompanhe nota igual a 8.5 entrando na escada: primeiro testamos nota maior ou igual a 9. Deu falso!",
        },
        {
          text: "Então descemos ao segundo degrau: **8.5 >= 7** dá **verdadeiro**!",
          spoken: "Então descemos ao segundo degrau: 8.5 maior ou igual a 7 dá verdadeiro!",
        },
        {
          text: "A função devolve **\"B\"** na hora e **pula** os degraus de baixo sem nem testar!",
        },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.55,
        expression: "starry",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.65 ? "Achou B e encerrou!" : undefined,
      }),
      getVisual: rt => {
        const activeRung = rt.ratio < 0.4 ? 0 : 1;
        const matchedB = rt.ratio >= 0.45;
        return {
          kind: "tier-ladder",
          inputLabel: "nota testada",
          inputValue: "8.5",
          activeRung,
          tiers: [
            { condition: "nota >= 9", result: '"A"', matched: false },
            { condition: "nota >= 7", result: '"B"', matched: matchedB },
            { condition: "nota >= 5", result: '"C"', matched: false, skipped: matchedB },
            { condition: "senao", result: '"D"', matched: false, skipped: matchedB },
          ],
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-03",
      title: "O perigo da ordem invertida",
      milestoneLabel: "Armadilha",
      themeVariant: "ladder-violet",
      layout: "visual-focus",
      audioFile: "act-03.mp3",
      durationMs: 23000,
      cues: buildSyncedCues([
        {
          text: "Cuidado! E se alguém colocar **nota >= 5** no topo da escada?",
          spoken: "Cuidado! E se alguém colocar nota maior ou igual a 5 no topo da escada?",
        },
        {
          text: "Para uma aluna com **nota = 9.5**, o programa testa **9.5 >= 5** — que é verdade! — devolve **\"C\"** e nunca chega no **\"A\"**!",
          spoken: "Para uma aluna com nota 9.5, o programa testa 9.5 maior ou igual a 5, que é verdade, devolve C e nunca chega no A!",
        },
        {
          text: "Por isso, em faixas numéricas, comece sempre do filtro **mais restritivo** para o mais amplo!",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.ratio < 0.7 ? "startled" : "explaining",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio < 0.7 ? "9.5 ganhou C?! Bug!" : "Comece pelo maior!",
      }),
      getVisual: () => ({
        kind: "tier-ladder",
        inputLabel: "nota = 9.5 (ordem invertida!)",
        inputValue: "9.5",
        activeRung: 0,
        warning: '9.5 caiu em "C" porque >= 5 veio no topo!',
        tiers: [
          { condition: "nota >= 5", result: '"C"', matched: true, wronglyCaught: true },
          { condition: "nota >= 7", result: '"B"', matched: false, skipped: true },
          { condition: "nota >= 9", result: '"A"', matched: false, skipped: true },
          { condition: "senao", result: '"D"', matched: false, skipped: true },
        ],
      }),
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-04",
      title: "Montando classificarNota(nota) no Portugol",
      milestoneLabel: "No Código",
      themeVariant: "ladder-violet",
      layout: "split",
      audioFile: "act-04.mp3",
      durationMs: 23000,
      cues: buildSyncedCues([
        {
          text: "Agora veja a função **classificarNota(nota)** exatamente como pede o exercício da aula.",
        },
        {
          text: "Usamos **se (nota >= 9)** para **\"A\"**, **senao se (nota >= 7)** para **\"B\"**, **senao se (nota >= 5)** para **\"C\"**...",
          spoken: "Usamos se nota maior ou igual a 9 para A, senao se nota maior ou igual a 7 para B, senao se nota maior ou igual a 5 para C...",
        },
        {
          text: "...e **senao** devolve **\"D\"**. Chamando com **8.5**, o console mostra **B**!",
        },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.55,
        expression: "happy",
        pointing: "right",
        placement: "corner-left",
      }),
      getVisual: () => ({
        kind: "tier-ladder",
        inputLabel: "classificarNota(8.5)",
        inputValue: "8.5",
        tiers: [
          { condition: "nota >= 9", result: '"A"', matched: false },
          { condition: "nota >= 7", result: '"B"', matched: true },
          { condition: "nota >= 5", result: '"C"', matched: false, skipped: true },
          { condition: "senao", result: '"D"', matched: false, skipped: true },
        ],
      }),
      getCodeLines: rt => [
        { lineNumber: 1, typeProgress: Math.min(1, rt.ratio / 0.25), tokens: [{ text: "funcao ", kind: "kw" }, { text: "classificarNota", kind: "fn" }, { text: "(nota) {" }] },
        { lineNumber: 2, typeProgress: rt.ratio < 0.22 ? 0 : Math.min(1, (rt.ratio - 0.22) / 0.22), tokens: [{ text: "  se ", kind: "kw" }, { text: '(nota >= 9) { retorne "A" }' }] },
        { lineNumber: 3, spotlight: rt.ratio >= 0.45 ? "green" : undefined, typeProgress: rt.ratio < 0.4 ? 0 : Math.min(1, (rt.ratio - 0.4) / 0.22), tokens: [{ text: "  senao se ", kind: "kw" }, { text: '(nota >= 7) { retorne "B" }' }] },
        { lineNumber: 4, dimmed: rt.ratio >= 0.65, typeProgress: rt.ratio < 0.58 ? 0 : Math.min(1, (rt.ratio - 0.58) / 0.22), tokens: [{ text: "  senao se ", kind: "kw" }, { text: '(nota >= 5) { retorne "C" }' }] },
        { lineNumber: 5, dimmed: rt.ratio >= 0.65, tokens: [{ text: "  senao ", kind: "kw" }, { text: '{ retorne "D" }' }] },
        { lineNumber: 6, tokens: [{ text: "}" }] },
      ],
      getConsoleOutput: rt => (rt.ratio >= 0.78 ? '"B"' : null),
    },
    {
      id: "act-05",
      title: "Desafio na escada correta",
      milestoneLabel: "Desafio",
      themeVariant: "ladder-violet",
      layout: "split",
      audioFile: "act-05.mp3",
      durationMs: 12000,
      cues: buildSyncedCues([
        {
          text: "Na escada certa, qual conceito recebe quem tirou **7.5**?",
          spoken: "Na escada certa, qual conceito recebe quem tirou 7.5?",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.quizSolved ? "starry" : rt.selectedOption ? "explaining" : "curious",
        pointing: rt.quizSolved ? "up" : "right",
        placement: "corner-left",
        callout: rt.quizSolved ? "7.5 >= 7 → Conceito B!" : "Qual degrau segura 7.5?",
      }),
      interaction: {
        kind: "quiz",
        prompt: "Qual o retorno de classificarNota(7.5) na escada correta?",
        options: [
          { id: "A", label: '"A"' },
          { id: "B", label: '"B"' },
          { id: "C", label: '"C"' },
        ],
        correctId: "B",
        nextLabel: "Simular outras notas",
        feedback: {
          A: {
            audioFile: "act-05-wrong-a.mp3",
            cue: "Quase! **7.5 >= 9** dá falso, então ele desce para o próximo degrau.",
            spoken: "Quase! 7.5 maior ou igual a 9 dá falso, então ele desce para o próximo degrau.",
            durationMs: 6500,
          },
          B: {
            audioFile: "act-05-correct.mp3",
            cue: "**Na mosca! \"B\"!** Falhou no 9, mas passou em **7.5 >= 7** e retornou na hora!",
            spoken: "Na mosca! B! Falhou no 9, mas passou em 7.5 maior ou igual a 7 e retornou na hora!",
            durationMs: 7000,
          },
          C: {
            audioFile: "act-05-wrong-c.mp3",
            cue: "Como já deu verdadeiro no **>= 7**, a função retorna **B** e nem testa o degrau **>= 5**!",
            spoken: "Como já deu verdadeiro no maior ou igual a 7, a função retorna B e nem testa o degrau maior ou igual a 5!",
            durationMs: 6500,
          },
        },
      },
      getVisual: () => ({
        kind: "tier-ladder",
        inputLabel: "nota testada",
        inputValue: "7.5",
        tiers: [
          { condition: "nota >= 9", result: '"A"', matched: false },
          { condition: "nota >= 7", result: '"B"', matched: true },
          { condition: "nota >= 5", result: '"C"', matched: false, skipped: true },
          { condition: "senao", result: '"D"', matched: false, skipped: true },
        ],
      }),
      getCodeLines: () => [
        { lineNumber: 1, tokens: [{ text: "se ", kind: "kw" }, { text: '(nota >= 9) { retorne "A" }' }] },
        { lineNumber: 2, spotlight: "green", tokens: [{ text: "senao se ", kind: "kw" }, { text: '(nota >= 7) { retorne "B" }' }] },
        { lineNumber: 3, dimmed: true, tokens: [{ text: "senao se ", kind: "kw" }, { text: '(nota >= 5) { retorne "C" }' }] },
      ],
      getConsoleOutput: rt => (rt.quizSolved ? '"B"' : null),
    },
    {
      id: "act-06",
      title: "Laboratório de Conceitos e resumo",
      milestoneLabel: "Lab",
      themeVariant: "ladder-violet",
      layout: "split",
      audioFile: "act-06.mp3",
      durationMs: 15000,
      cues: buildSyncedCues([
        { text: "Digite qualquer **nota de 0 a 10** abaixo e veja em qual degrau a função para!" },
        { text: "Resumo: **se / senao se / senao** em ordem decrescente evita brechas e garante cada faixa certinha!" },
      ]),
      getLiaStage: rt => {
        const n = Math.max(0, Math.min(10, Number(rt.values.nota) || 0));
        const res = n >= 9 ? "A" : n >= 7 ? "B" : n >= 5 ? "C" : "D";
        return {
          visible: true,
          expression: res === "A" || res === "B" ? "starry" : "explaining",
          pointing: "right",
          placement: "corner-left",
          callout: `Parou no conceito "${res}"!`,
        };
      },
      interaction: {
        kind: "sandbox",
        fields: [{ key: "nota", label: "nota (0-10):", type: "number", min: 0, max: 10, short: true }],
        submitLabel: "Classificar",
        feedback: {
          audioFile: "act-06-run.mp3",
          cue: "**Show!** Cada degrau funciona como uma peneira do mais exigente para o mais geral!",
          durationMs: 6000,
        },
      },
      getVisual: rt => {
        const n = Math.max(0, Math.min(10, Number(rt.values.nota) || 0));
        const mA = n >= 9;
        const mB = !mA && n >= 7;
        const mC = !mA && !mB && n >= 5;
        const mD = !mA && !mB && !mC;
        return {
          kind: "tier-ladder",
          inputLabel: "nota atual",
          inputValue: String(n),
          tiers: [
            { condition: "nota >= 9", result: '"A"', matched: mA },
            { condition: "nota >= 7", result: '"B"', matched: mB, skipped: mA },
            { condition: "nota >= 5", result: '"C"', matched: mC, skipped: mA || mB },
            { condition: "senao", result: '"D"', matched: mD, skipped: mA || mB || mC },
          ],
        };
      },
      getCodeLines: rt => {
        const n = Math.max(0, Math.min(10, Number(rt.values.nota) || 0));
        return [
          { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "nota", kind: "var-violet" }, { text: " = " }, { text: String(n), kind: "num" }] },
          { lineNumber: 2, spotlight: n >= 9 ? "green" : undefined, tokens: [{ text: "se ", kind: "kw" }, { text: '(nota >= 9) { retorne "A" }' }] },
          { lineNumber: 3, spotlight: n < 9 && n >= 7 ? "green" : undefined, tokens: [{ text: "senao se ", kind: "kw" }, { text: '(nota >= 7) { retorne "B" }' }] },
          { lineNumber: 4, spotlight: n < 7 && n >= 5 ? "green" : undefined, tokens: [{ text: "senao se ", kind: "kw" }, { text: '(nota >= 5) { retorne "C" }' }] },
          { lineNumber: 5, spotlight: n < 5 ? "amber" : undefined, tokens: [{ text: "senao ", kind: "kw" }, { text: '{ retorne "D" }' }] },
        ];
      },
      getConsoleOutput: rt => {
        const n = Math.max(0, Math.min(10, Number(rt.executedValues.nota) || 0));
        return n >= 9 ? '"A"' : n >= 7 ? '"B"' : n >= 5 ? '"C"' : '"D"';
      },
    },
  ],
};

/* ==========================================================================
   LOGIC-06 · LAÇO ENQUANTO E ACUMULADOR (Cofrinho + Voltas + Stepper + Loop Infinito)
   ========================================================================== */
const LOGIC_06: TheaterLessonScript = {
  lessonId: "logic-06",
  languageLabel: "Portugol",
  visualTitle: "Voltas do enquanto",
  codeTitle: "Contador + Acumulador · Portugol",
  initialValues: { limite: "10" },
  acts: [
    {
      id: "act-01",
      title: "Dois papéis no laço: contador e acumulador",
      milestoneLabel: "Cenário",
      themeVariant: "loop-indigo",
      layout: "center-story",
      audioFile: "act-01.mp3",
      durationMs: 22000,
      cues: buildSyncedCues([
        {
          text: "Como somar todos os números de **1 até 10** sem escrever dez somas na mão?",
        },
        {
          text: "Usando um **laço enquanto** com duas caixas que trabalham em dupla!",
        },
        {
          text: "O **contador** marca em qual volta estamos (1, 2, 3...), enquanto o **acumulador soma** vai guardando o total no cofrinho!",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.ratio < 0.45 ? "wink" : "happy",
        pointing: rt.ratio >= 0.35 ? "right" : "none",
        placement: "corner-left",
        callout: rt.ratio >= 0.72 ? "Dupla dinâmica do laço!" : undefined,
      }),
      getVisual: rt => ({
        kind: "concept-hook",
        eyebrow: "Aula 06 · Laço enquanto",
        headline: "Repetir com controle até a condição acabar",
        tone: "cyan",
        cards: [
          { badge: "Papel 1", title: "contador", value: "1 → 2 → 3 ... → 10", state: "active", visible: rt.ratio >= 0.28 },
          { badge: "Papel 2", title: "soma (cofrinho)", value: "0 → 1 → 3 → 6 ... → 55", state: "good", visible: rt.ratio >= 0.56 },
        ],
        verdict: {
          text: "enquanto (contador <= 10) repete sem precisar copiar código!",
          tone: "info",
          visible: rt.ratio >= 0.8,
        },
      }),
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-02",
      title: "Assistindo às voltas ao vivo",
      milestoneLabel: "Voltas",
      themeVariant: "loop-indigo",
      layout: "visual-focus",
      audioFile: "act-02.mp3",
      durationMs: 24000,
      cues: buildSyncedCues([
        { text: "Veja um teste menor, de **1 até 4**, acontecendo em câmera lenta." },
        { text: "Na volta 1, **soma** recebe 1 e **contador** vira 2. Na volta 2, soma vira **3** e contador vira 3." },
        { text: "Na volta 3 soma **6**, na volta 4 soma **10**, e quando **contador** chega em **5**, a condição **5 <= 4** dá falso e o laço para!", spoken: "Na volta 3 soma 6, na volta 4 soma 10, e quando contador chega em 5, a condição 5 menor ou igual a 4 dá falso e o laço para!" },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.65,
        expression: "starry",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.75 ? "5 <= 4 é falso → Parou!" : undefined,
      }),
      getVisual: rt => {
        const s = rt.ratio < 0.25 ? 0 : rt.ratio < 0.42 ? 1 : rt.ratio < 0.58 ? 2 : rt.ratio < 0.74 ? 3 : 4;
        const soma = (s * (s + 1)) / 2;
        return {
          kind: "loop-stepper",
          loopLabel: "enquanto (contador <= 4)",
          currentStep: s,
          totalSteps: 4,
          vars: [
            { label: "contador", value: String(s + 1), tone: "violet", highlight: s > 0 },
            { label: "soma", value: String(soma), tone: "cyan", highlight: s > 0 },
          ],
          statusText:
            s === 0
              ? "Início: contador = 1 e soma = 0."
              : s < 4
                ? `Volta ${s}: somou ${s} → soma = ${soma}, contador avançou para ${s + 1}.`
                : "Fim! contador virou 5 → (5 <= 4) é falso. Saiu com soma = 10!",
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-03",
      title: "Mão na massa: dê as voltas no código",
      milestoneLabel: "Passo a Passo",
      themeVariant: "loop-indigo",
      layout: "split",
      audioFile: "act-03.mp3",
      durationMs: 14000,
      cues: buildSyncedCues([
        { text: "Agora execute você mesmo! Clique em **Próxima volta** abaixo e acompanhe **contador** e **soma** mudando junto com o código." },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.stepIndex >= 4 ? "starry" : "happy",
        pointing: "right",
        placement: "corner-left",
        callout: rt.stepIndex >= 4 ? "Laço concluído!" : `Volta ${rt.stepIndex}/4`,
      }),
      interaction: {
        kind: "stepper",
        prompt: "Execute cada volta do laço manualmente:",
        maxSteps: 4,
        stepButtonLabel: "Próxima volta →",
        resetLabel: "Zerar voltas",
      },
      getVisual: rt => {
        const s = Math.min(4, rt.stepIndex);
        const soma = (s * (s + 1)) / 2;
        const nextI = s + 1;
        return {
          kind: "loop-stepper",
          loopLabel: "enquanto (contador <= 4)",
          currentStep: s,
          totalSteps: 4,
          vars: [
            { label: "contador", value: String(nextI), tone: "violet", highlight: s > 0 },
            { label: "soma", value: String(soma), tone: "cyan", highlight: s > 0 },
          ],
          statusText:
            s === 0
              ? "Clique em Próxima volta para começar."
              : s < 4
                ? `Volta ${s}: soma = ${soma} e contador = ${nextI}.`
                : "Fim! 5 <= 4 deu falso e encerrou com soma = 10.",
        };
      },
      getCodeLines: rt => {
        const active = rt.stepIndex > 0 && rt.stepIndex <= 4;
        return [
          { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "contador", kind: "var-violet" }, { text: " = 1, " }, { text: "soma", kind: "var-cyan" }, { text: " = 0" }] },
          { lineNumber: 2, spotlight: active ? "cyan" : undefined, tokens: [{ text: "enquanto ", kind: "kw" }, { text: "(contador <= 4) {" }] },
          { lineNumber: 3, spotlight: active ? "green" : undefined, tokens: [{ text: "  soma += contador" }] },
          { lineNumber: 4, spotlight: active ? "violet" : undefined, tokens: [{ text: "  contador++" }] },
          { lineNumber: 5, tokens: [{ text: "}" }] },
        ];
      },
      getConsoleOutput: rt => (rt.stepIndex >= 4 ? "Total: 10" : null),
    },
    {
      id: "act-04",
      title: "O perigo do loop infinito",
      milestoneLabel: "Loop Infinito",
      themeVariant: "loop-indigo",
      layout: "visual-focus",
      audioFile: "act-04.mp3",
      durationMs: 18000,
      cues: buildSyncedCues([
        { text: "Todo laço precisa **convergir para o fim**. Se você esquecer de atualizar **contador++** dentro do bloco...", spoken: "Todo laço precisa convergir para o fim. Se você esquecer de atualizar o contador dentro do bloco..." },
        { text: "...**contador** fica preso no **1** para sempre, **1 <= 10** nunca vira falso e o programa trava em **loop infinito**!", spoken: "...contador fica preso no 1 para sempre, 1 menor ou igual a 10 nunca vira falso e o programa trava em loop infinito!" },
      ]),
      getLiaStage: () => ({
        visible: true,
        expression: "startled",
        pointing: "right",
        placement: "corner-left",
        callout: "Nunca esqueça contador++!",
      }),
      getVisual: () => ({
        kind: "loop-stepper",
        loopLabel: "enquanto (contador <= 10)  // SEM contador++",
        currentStep: 99,
        totalSteps: 10,
        vars: [
          { label: "contador (preso!)", value: "1", tone: "amber", highlight: true },
          { label: "soma", value: "∞", tone: "amber" },
        ],
        warning: "contador continua 1 para sempre → Loop Infinito!",
        statusText: "",
      }),
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-05",
      title: "Desafio: Preveja o bug sem contador++",
      milestoneLabel: "Desafio",
      themeVariant: "loop-indigo",
      layout: "split",
      audioFile: "act-05.mp3",
      durationMs: 11000,
      cues: buildSyncedCues([
        { text: "Valendo! Se esquecermos de atualizar **contador++** dentro de **enquanto (contador <= 10)**, o que acontece?" },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.quizSolved ? "starry" : rt.selectedOption ? "explaining" : "curious",
        pointing: rt.quizSolved ? "up" : "right",
        placement: "corner-left",
        callout: rt.quizSolved ? "Isso: loop infinito!" : "Ele para ou trava?",
      }),
      interaction: {
        kind: "quiz",
        prompt: "Sem atualizar contador++ dentro de enquanto (contador <= 10), o que ocorre?",
        options: [
          { id: "A", label: "Soma só até 1 e para" },
          { id: "B", label: "Loop infinito (nunca para)" },
          { id: "C", label: "O código incrementa sozinho" },
        ],
        correctId: "B",
        nextLabel: "Testar soma de 1 até 10",
        feedback: {
          A: {
            audioFile: "act-05-wrong-a.mp3",
            cue: "Ele não para em 1 — como **contador** continua sempre valendo **1**, **1 <= 10** fica verdadeiro para sempre!",
            spoken: "Ele não para em 1 — como contador continua sempre valendo 1, 1 menor ou igual a 10 fica verdadeiro para sempre!",
            durationMs: 8000,
          },
          B: {
            audioFile: "act-05-correct.mp3",
            cue: "**Exato! Loop infinito!** Sem alterar o contador, a condição nunca fica falsa e o laço trava repetindo para sempre!",
            durationMs: 8000,
          },
          C: {
            audioFile: "act-05-wrong-c.mp3",
            cue: "O **enquanto** nunca incrementa nada sozinho — você sempre precisa atualizar a variável de controle!",
            durationMs: 7500,
          },
        },
      },
      getVisual: () => ({
        kind: "loop-stepper",
        loopLabel: "enquanto (contador <= 10)",
        currentStep: 99,
        totalSteps: 10,
        vars: [
          { label: "contador", value: "1", tone: "amber", highlight: true },
          { label: "condição", value: "1 <= 10 (sempre V)", tone: "amber" },
        ],
        statusText: "Qual o resultado desse código?",
      }),
      getCodeLines: () => [
        { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "contador", kind: "var-violet" }, { text: " = 1" }] },
        { lineNumber: 2, spotlight: "amber", tokens: [{ text: "enquanto ", kind: "kw" }, { text: "(contador <= 10) {" }] },
        { lineNumber: 3, tokens: [{ text: "  soma += contador" }] },
        { lineNumber: 4, spotlight: "amber", pointerPill: { text: "Faltou contador++!", tone: "amber" }, tokens: [{ text: "  // oops!", kind: "comment" }] },
        { lineNumber: 5, tokens: [{ text: "}" }] },
      ],
      getConsoleOutput: rt => (rt.quizSolved ? "Loop Infinito!" : null),
    },
    {
      id: "act-06",
      title: "Simule até 10 e resumo",
      milestoneLabel: "Lab",
      themeVariant: "loop-indigo",
      layout: "split",
      audioFile: "act-06.mp3",
      durationMs: 16000,
      cues: buildSyncedCues([
        { text: "Teste o **limite** abaixo! Com **limite = 10**, igual ao exercício da aula, o acumulador fecha em **55**." },
        { text: "Resumo: inicialize **contador** e **soma**, teste a condição no **enquanto** e nunca esqueça o **contador++**!" },
      ]),
      getLiaStage: rt => {
        const lim = Math.max(2, Math.min(10, Number(rt.values.limite) || 10));
        const total = (lim * (lim + 1)) / 2;
        return {
          visible: true,
          expression: "starry",
          pointing: "right",
          placement: "corner-left",
          callout: `1 até ${lim} = ${total}!`,
        };
      },
      interaction: {
        kind: "sandbox",
        fields: [{ key: "limite", label: "limite:", type: "number", min: 2, max: 10, short: true }],
        submitLabel: "Rodar Laço",
        feedback: {
          audioFile: "act-06-run.mp3",
          cue: "**Mandou bem!** Contador mais acumulador é a base de relatórios, médias e carrinhos de compras!",
          durationMs: 6500,
        },
      },
      getVisual: rt => {
        const lim = Math.max(2, Math.min(10, Number(rt.values.limite) || 10));
        const total = (lim * (lim + 1)) / 2;
        return {
          kind: "loop-stepper",
          loopLabel: `enquanto (contador <= ${lim})`,
          currentStep: lim,
          totalSteps: lim,
          vars: [
            { label: "voltas", value: String(lim), tone: "violet" },
            { label: "soma final", value: String(total), tone: "green", highlight: true },
          ],
          statusText: `Somou 1 + 2 + ... + ${lim} = ${total}.`,
        };
      },
      getCodeLines: rt => {
        const lim = Math.max(2, Math.min(10, Number(rt.values.limite) || 10));
        return [
          { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "contador", kind: "var-violet" }, { text: " = 1, " }, { text: "soma", kind: "var-cyan" }, { text: " = 0" }] },
          { lineNumber: 2, spotlight: "cyan", tokens: [{ text: "enquanto ", kind: "kw" }, { text: `(contador <= ${lim}) {` }] },
          { lineNumber: 3, tokens: [{ text: "  soma += contador; contador++" }] },
          { lineNumber: 4, tokens: [{ text: "}" }] },
          { lineNumber: 5, tokens: [{ text: "escreva", kind: "fn" }, { text: '("Soma:", soma)' }] },
        ];
      },
      getConsoleOutput: rt => {
        const lim = Math.max(2, Math.min(10, Number(rt.executedValues.limite) || 10));
        return `Soma: ${(lim * (lim + 1)) / 2}`;
      },
    },
  ],
};

/* ==========================================================================
   LOGIC-07 · LAÇO PARA (Contagem controlada preenchendo lista)
   ========================================================================== */
const LOGIC_07: TheaterLessonScript = {
  lessonId: "logic-07",
  languageLabel: "Portugol",
  visualTitle: "Lista Crescendo no para",
  codeTitle: "Laço para · Portugol",
  initialValues: { qtd: "5", mult: "3" },
  acts: [
    {
      id: "act-01",
      title: "Tudo em uma linha: início, critério e passo",
      milestoneLabel: "Cenário",
      themeVariant: "loop-indigo",
      layout: "center-story",
      audioFile: "act-01.mp3",
      durationMs: 21000,
      cues: buildSyncedCues([
        { text: "Quando você já sabe **quantas voltas** quer dar, o laço **para** é a evolução natural do **enquanto**." },
        { text: "Ele junta **início**, **condição de parada** e **incremento** numa única linha — impossível esquecer o **i++**!" },
        { text: "Vamos usar o **para** para gerar listas dinâmicas com **.push()**!" },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.ratio < 0.45 ? "wink" : "happy",
        pointing: rt.ratio >= 0.35 ? "right" : "none",
        placement: "corner-left",
        callout: rt.ratio >= 0.72 ? "3 controles em 1 linha!" : undefined,
      }),
      getVisual: rt => ({
        kind: "concept-hook",
        eyebrow: "Aula 07 · Laço para",
        headline: "Anatomia do para (início ; critério ; passo)",
        tone: "cyan",
        cards: [
          { badge: "1. Início", title: "var i = 1", value: "Onde começa", state: "active", visible: rt.ratio >= 0.22 },
          { badge: "2. Critério", title: "i <= 5", value: "Enquanto for V", state: "good", visible: rt.ratio >= 0.46 },
          { badge: "3. Passo", title: "i++", value: "Soma +1 por volta", state: "neutral", visible: rt.ratio >= 0.68 },
        ],
        verdict: {
          text: "Ideal quando sabemos o número exato de repetições!",
          tone: "info",
          visible: rt.ratio >= 0.82,
        },
      }),
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-02",
      title: "Lista crescendo a cada volta",
      milestoneLabel: "Anatomia",
      themeVariant: "loop-indigo",
      layout: "visual-focus",
      audioFile: "act-02.mp3",
      durationMs: 23000,
      cues: buildSyncedCues([
        { text: "Veja na prática como nascem os **5 primeiros múltiplos de 3**." },
        { text: "Começamos com uma lista vazia **[]**. A cada volta, **multiplos.push(i * 3)** coloca um novo número no final." },
        { text: "Volta 1 entra **3**, volta 2 entra **6**, volta 3 **9**, volta 4 **12** e volta 5 fecha **[3, 6, 9, 12, 15]**!" },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.65,
        expression: "starry",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.72 ? "5 múltiplos certinhos!" : undefined,
      }),
      getVisual: rt => {
        const count = rt.ratio < 0.22 ? 0 : rt.ratio < 0.36 ? 1 : rt.ratio < 0.5 ? 2 : rt.ratio < 0.64 ? 3 : rt.ratio < 0.78 ? 4 : 5;
        const items = Array.from({ length: count }, (_, k) => String((k + 1) * 3));
        return {
          kind: "loop-stepper",
          loopLabel: "para (var i = 1; i <= 5; i++)",
          currentStep: count,
          totalSteps: 5,
          vars: [{ label: "fórmula", value: "i * 3", tone: "cyan", highlight: count > 0 }],
          itemsLabel: "multiplos.push(i * 3)",
          items,
          statusText: count === 0 ? "Lista começa vazia: [ ]" : `Volta ${count}: adicionou ${count * 3} na lista.`,
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-03",
      title: "Escrevendo o laço para no Portugol",
      milestoneLabel: "No Código",
      themeVariant: "loop-indigo",
      layout: "split",
      audioFile: "act-03.mp3",
      durationMs: 20000,
      cues: buildSyncedCues([
        { text: "Olhe no código ao lado exatamente o que o exercício desta aula pede." },
        { text: "Declaramos **var multiplos = []**, rodamos **para (var i = 1; i <= 5; i++)** e fazemos **multiplos.push(i * 3)**!" },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.52,
        expression: "explaining",
        pointing: "right",
        placement: "corner-left",
      }),
      getVisual: () => ({
        kind: "loop-stepper",
        loopLabel: "para (var i = 1; i <= 5; i++)",
        currentStep: 5,
        totalSteps: 5,
        vars: [{ label: "i (1 → 5)", value: "5 voltas", tone: "violet" }],
        itemsLabel: "multiplos",
        items: ["3", "6", "9", "12", "15"],
        statusText: "Lista completa com 5 múltiplos de 3.",
      }),
      getCodeLines: rt => [
        { lineNumber: 1, typeProgress: Math.min(1, rt.ratio / 0.25), tokens: [{ text: "var ", kind: "kw" }, { text: "multiplos", kind: "var-violet" }, { text: " = []" }] },
        {
          lineNumber: 2,
          spotlight: rt.ratio >= 0.25 ? "cyan" : undefined,
          typeProgress: rt.ratio < 0.22 ? 0 : Math.min(1, (rt.ratio - 0.22) / 0.3),
          pointerPill: rt.ratio >= 0.32 ? { text: "Início ; Condição ; Passo", tone: "cyan" } : undefined,
          tokens: [{ text: "para ", kind: "kw" }, { text: "(var i = 1; i <= 5; i++) {" }],
        },
        { lineNumber: 3, spotlight: rt.ratio >= 0.55 ? "green" : undefined, typeProgress: rt.ratio < 0.5 ? 0 : Math.min(1, (rt.ratio - 0.5) / 0.25), tokens: [{ text: "  multiplos.push(i * 3)" }] },
        { lineNumber: 4, tokens: [{ text: "}" }] },
        { lineNumber: 5, spotlight: rt.ratio >= 0.78 ? "cyan" : undefined, tokens: [{ text: "escreva", kind: "fn" }, { text: "(multiplos)" }] },
      ],
      getConsoleOutput: rt => (rt.ratio >= 0.8 ? "[3, 6, 9, 12, 15]" : null),
    },
    {
      id: "act-04",
      title: "Atenção ao início: i = 0 versus i = 1",
      milestoneLabel: "Início 0 vs 1",
      themeVariant: "loop-indigo",
      layout: "visual-focus",
      audioFile: "act-04.mp3",
      durationMs: 18000,
      cues: buildSyncedCues([
        { text: "Pegadinha clássica: se o enunciado pede múltiplos **positivos** de 3 e você começar em **i = 0**...", spoken: "Pegadinha clássica: se o enunciado pede múltiplos positivos de 3 e você começar em i igual a zero..." },
        { text: "...o primeiro item vira **0 * 3 = 0**, e você perde o **15**! Confira sempre onde o contador começa e termina!" },
      ]),
      getLiaStage: () => ({
        visible: true,
        expression: "startled",
        pointing: "right",
        placement: "corner-left",
        callout: "0 * 3 = 0 não é positivo!",
      }),
      getVisual: () => ({
        kind: "loop-stepper",
        loopLabel: "para (var i = 0; i < 5; i++)  // Começou em 0!",
        currentStep: 5,
        totalSteps: 5,
        vars: [{ label: "i (0 → 4)", value: "5 voltas", tone: "amber", highlight: true }],
        itemsLabel: "resultado com i = 0",
        items: ["0", "3", "6", "9", "12"],
        warning: "Começando em 0, faltou o 15 e entrou o 0!",
        statusText: "",
      }),
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-05",
      title: "Desafio: Preveja o conteúdo da lista",
      milestoneLabel: "Desafio",
      themeVariant: "loop-indigo",
      layout: "split",
      audioFile: "act-05.mp3",
      durationMs: 11000,
      cues: buildSyncedCues([
        { text: "Se o laço for de **1 até 3** fazendo **lista.push(i * 5)**, o que vai sair no console?" },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.quizSolved ? "starry" : rt.selectedOption ? "explaining" : "curious",
        pointing: rt.quizSolved ? "up" : "right",
        placement: "corner-left",
        callout: rt.quizSolved ? "i=1,2,3 → [5, 10, 15]!" : "Qual lista sai?",
      }),
      interaction: {
        kind: "quiz",
        prompt: "Com i de 1 até 3 e lista.push(i * 5), qual será o array final?",
        options: [
          { id: "A", label: "[5, 10, 15]" },
          { id: "B", label: "[0, 5, 10]" },
          { id: "C", label: "[1, 2, 3]" },
        ],
        correctId: "A",
        nextLabel: "Gerar minhas sequências",
        feedback: {
          A: {
            audioFile: "act-05-correct.mp3",
            cue: "**Perfeito! [5, 10, 15]!** Para i = 1, 2 e 3, multiplicou cada um por 5!",
            spoken: "Perfeito! 5, 10, 15! Para i igual a 1, 2 e 3, multiplicou cada um por 5!",
            durationMs: 7000,
          },
          B: {
            audioFile: "act-05-wrong-b.mp3",
            cue: "Quase! Só começaria em **0** se **i** começasse em **0** — aqui **i** começou em **1**!",
            durationMs: 6500,
          },
          C: {
            audioFile: "act-05-wrong-c.mp3",
            cue: "Ele não guardou **i** puro, e sim **i * 5**!",
            durationMs: 5500,
          },
        },
      },
      getVisual: () => ({
        kind: "loop-stepper",
        loopLabel: "para (var i = 1; i <= 3; i++)",
        currentStep: 3,
        totalSteps: 3,
        vars: [{ label: "fórmula", value: "i * 5", tone: "cyan" }],
        itemsLabel: "lista",
        items: ["1*5", "2*5", "3*5"],
        statusText: "",
      }),
      getCodeLines: () => [
        { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "lista", kind: "var-violet" }, { text: " = []" }] },
        { lineNumber: 2, spotlight: "violet", tokens: [{ text: "para ", kind: "kw" }, { text: "(var i = 1; i <= 3; i++) {" }] },
        { lineNumber: 3, tokens: [{ text: "  lista.push(i * 5)" }] },
        { lineNumber: 4, tokens: [{ text: "}" }] },
      ],
      getConsoleOutput: rt => (rt.quizSolved ? "[5, 10, 15]" : null),
    },
    {
      id: "act-06",
      title: "Gere sua própria sequência e resumo",
      milestoneLabel: "Lab",
      themeVariant: "loop-indigo",
      layout: "split",
      audioFile: "act-06.mp3",
      durationMs: 15500,
      cues: buildSyncedCues([
        { text: "Ajuste a **quantidade de itens** e o **multiplicador** abaixo! Por padrão já está igual ao exercício: 5 múltiplos de 3." },
        { text: "Resumo: use **para** quando souber o número exato de repetições, mantendo início, critério e passo na mesma linha!" },
      ]),
      getLiaStage: rt => {
        const qtd = Math.max(2, Math.min(6, Number(rt.values.qtd) || 5));
        const mult = Math.max(1, Math.min(10, Number(rt.values.mult) || 3));
        return {
          visible: true,
          expression: "starry",
          pointing: "right",
          placement: "corner-left",
          callout: `${qtd} múltiplos de ${mult}!`,
        };
      },
      interaction: {
        kind: "sandbox",
        fields: [
          { key: "qtd", label: "itens:", type: "number", min: 2, max: 6, short: true },
          { key: "mult", label: "mult:", type: "number", min: 2, max: 10, short: true },
        ],
        submitLabel: "Gerar Lista",
        feedback: {
          audioFile: "act-06-run.mp3",
          cue: "**Muito bom!** O laço **para** é perfeito para gerar sequências e percorrer listas!",
          durationMs: 6000,
        },
      },
      getVisual: rt => {
        const qtd = Math.max(2, Math.min(6, Number(rt.values.qtd) || 5));
        const mult = Math.max(1, Math.min(10, Number(rt.values.mult) || 3));
        const items = Array.from({ length: qtd }, (_, k) => String((k + 1) * mult));
        return {
          kind: "loop-stepper",
          loopLabel: `para (var i = 1; i <= ${qtd}; i++)`,
          currentStep: qtd,
          totalSteps: qtd,
          vars: [{ label: "regra", value: `i * ${mult}`, tone: "cyan" }],
          itemsLabel: "lista gerada",
          items,
          statusText: `${qtd} itens adicionados multiplicando por ${mult}.`,
        };
      },
      getCodeLines: rt => {
        const qtd = Math.max(2, Math.min(6, Number(rt.values.qtd) || 5));
        const mult = Math.max(1, Math.min(10, Number(rt.values.mult) || 3));
        return [
          { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "lista", kind: "var-violet" }, { text: " = []" }] },
          { lineNumber: 2, spotlight: "cyan", tokens: [{ text: "para ", kind: "kw" }, { text: `(var i = 1; i <= ${qtd}; i++) {` }] },
          { lineNumber: 3, tokens: [{ text: `  lista.push(i * ${mult})` }] },
          { lineNumber: 4, tokens: [{ text: "}" }] },
        ];
      },
      getConsoleOutput: rt => {
        const qtd = Math.max(2, Math.min(6, Number(rt.executedValues.qtd) || 5));
        const mult = Math.max(1, Math.min(10, Number(rt.executedValues.mult) || 3));
        return `[${Array.from({ length: qtd }, (_, k) => (k + 1) * mult).join(", ")}]`;
      },
    },
  ],
};

/* ==========================================================================
   LOGIC-08 · ENCONTRANDO O MAIOR VALOR (Varredura de array + Campeão)
   ========================================================================== */
const LOGIC_08_LIST = [4, 15, 8, 23, 16];

const LOGIC_08: TheaterLessonScript = {
  lessonId: "logic-08",
  languageLabel: "Portugol",
  visualTitle: "Varredura do Campeão",
  codeTitle: "Maior Elemento · Portugol",
  initialValues: { lista: "padrao", extra: "30" },
  acts: [
    {
      id: "act-01",
      title: "O torneio do campeão na lista",
      milestoneLabel: "Cenário",
      themeVariant: "array-amber",
      layout: "center-story",
      audioFile: "act-01.mp3",
      durationMs: 21000,
      cues: buildSyncedCues([
        {
          text: "Imagine descobrir o **maior número** de uma lista sem olhar tudo de uma vez só.",
        },
        {
          text: "O algoritmo funciona como um **torneio**: o **primeiro elemento (índice 0)** assume o cinturão de campeão inicial!",
        },
        {
          text: "Depois, percorremos os outros itens com **tamanho(numeros)** e trocamos o campeão só quando alguém vencer!",
          spoken: "Depois, percorremos os outros itens com tamanho de numeros e trocamos o campeão só quando alguém vencer!",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.ratio < 0.45 ? "wink" : "happy",
        pointing: rt.ratio >= 0.35 ? "right" : "none",
        placement: "corner-left",
        callout: rt.ratio >= 0.72 ? "Comece sempre em [0]!" : undefined,
      }),
      getVisual: rt => ({
        kind: "concept-hook",
        eyebrow: "Aula 08 · Varredura de Listas",
        headline: "Como achar o maior valor item por item",
        tone: "amber",
        cards: [
          { badge: "1. Campeão inicial", title: "maior = numeros[0]", value: "4 assume o topo", state: "active", visible: rt.ratio >= 0.25 },
          { badge: "2. Varredura", title: "i = 1 até tamanho - 1", value: "Compara cada item", state: "neutral", visible: rt.ratio >= 0.5 },
          { badge: "3. Troca", title: "se (numeros[i] > maior)", value: "Atualiza o campeão!", state: "good", visible: rt.ratio >= 0.72 },
        ],
      }),
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-02",
      title: "Assistindo à varredura em [4, 15, 8, 23, 16]",
      milestoneLabel: "Varredura",
      themeVariant: "array-amber",
      layout: "visual-focus",
      audioFile: "act-02.mp3",
      durationMs: 24000,
      cues: buildSyncedCues([
        { text: "Acompanhe a lista do exercício: **4, 15, 8, 23, 16**. Começamos com **maior = 4**." },
        { text: "No índice 1, **15 > 4** → novo campeão **15**! No índice 2, **8** perde para 15." },
        { text: "No índice 3, **23 > 15** → novo campeão **23**! E no índice 4, 16 perde, fechando com **23**!" },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.65,
        expression: "starry",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.7 ? "23 levou o troféu!" : undefined,
      }),
      getVisual: rt => {
        const idx = rt.ratio < 0.25 ? 0 : rt.ratio < 0.44 ? 1 : rt.ratio < 0.6 ? 2 : rt.ratio < 0.8 ? 3 : 4;
        let champIdx = 0;
        for (let k = 1; k <= idx; k += 1) {
          if (LOGIC_08_LIST[k] > LOGIC_08_LIST[champIdx]) champIdx = k;
        }
        return {
          kind: "array-scanner",
          arrayLabel: "numeros = [4, 15, 8, 23, 16]",
          items: LOGIC_08_LIST,
          activeIndex: idx,
          championIndex: champIdx,
          championLabel: "maior atual",
          championValue: String(LOGIC_08_LIST[champIdx]),
          comparisonText:
            idx === 0
              ? "Início: maior = numeros[0] (4)"
              : idx === 1
                ? "15 > 4 → Novo campeão: 15!"
                : idx === 2
                  ? "8 <= 15 → Campeão continua 15."
                  : idx === 3
                    ? "23 > 15 → Novo campeão: 23!"
                    : "16 <= 23 → Fim! Maior é 23.",
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-03",
      title: "Avance índice por índice no código",
      milestoneLabel: "Passo a Passo",
      themeVariant: "array-amber",
      layout: "split",
      audioFile: "act-03.mp3",
      durationMs: 13000,
      cues: buildSyncedCues([
        { text: "Clique em **Comparar próximo** abaixo e veja o troféu mudar de mão ao vivo junto com o código Portugol!" },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.stepIndex >= 4 ? "starry" : "happy",
        pointing: "right",
        placement: "corner-left",
        callout: rt.stepIndex >= 4 ? "Campeão: 23!" : `Índice [${rt.stepIndex}]`,
      }),
      interaction: {
        kind: "stepper",
        prompt: "Percorra os índices [1] até [4]:",
        maxSteps: 4,
        stepButtonLabel: "Comparar próximo →",
        resetLabel: "Voltar ao [0]",
      },
      getVisual: rt => {
        const idx = Math.min(4, rt.stepIndex);
        let champIdx = 0;
        for (let k = 1; k <= idx; k += 1) {
          if (LOGIC_08_LIST[k] > LOGIC_08_LIST[champIdx]) champIdx = k;
        }
        const cur = LOGIC_08_LIST[idx];
        let prevChamp = LOGIC_08_LIST[0];
        for (let k = 1; k < idx; k += 1) {
          if (LOGIC_08_LIST[k] > prevChamp) prevChamp = LOGIC_08_LIST[k];
        }
        const msg =
          idx === 0
            ? "Índice [0]: campeão inicial é 4."
            : cur > prevChamp
              ? `Índice [${idx}]: ${cur} > ${prevChamp} → Novo campeão (${cur})!`
              : `Índice [${idx}]: ${cur} <= ${prevChamp} → Campeão continua ${prevChamp}.`;
        return {
          kind: "array-scanner",
          arrayLabel: "numeros",
          items: LOGIC_08_LIST,
          activeIndex: idx,
          championIndex: champIdx,
          championLabel: "maior",
          championValue: String(LOGIC_08_LIST[champIdx]),
          comparisonText: msg,
        };
      },
      getCodeLines: rt => [
        { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "numeros", kind: "var-violet" }, { text: " = [4, 15, 8, 23, 16]" }] },
        { lineNumber: 2, tokens: [{ text: "var ", kind: "kw" }, { text: "maior", kind: "var-cyan" }, { text: " = numeros[0]" }] },
        { lineNumber: 3, spotlight: rt.stepIndex > 0 ? "cyan" : undefined, tokens: [{ text: "para ", kind: "kw" }, { text: "(var i = 1; i < tamanho(numeros); i++) {" }] },
        { lineNumber: 4, spotlight: rt.stepIndex > 0 ? "green" : undefined, tokens: [{ text: "  se ", kind: "kw" }, { text: "(numeros[i] > maior) { maior = numeros[i] }" }] },
        { lineNumber: 5, tokens: [{ text: "}" }] },
      ],
      getConsoleOutput: rt => (rt.stepIndex >= 4 ? "Maior: 23" : null),
    },
    {
      id: "act-04",
      title: "Por que NÃO começar com maior = 0?",
      milestoneLabel: "Armadilha 0",
      themeVariant: "array-amber",
      layout: "visual-focus",
      audioFile: "act-04.mp3",
      durationMs: 18000,
      cues: buildSyncedCues([
        {
          text: "Muita gente começa fazendo **maior = 0**. Olha o desastre se a lista tiver só números negativos: **-10, -3, -25**!",
          spoken: "Muita gente começa fazendo maior igual a zero. Olha o desastre se a lista tiver só números negativos: menos 10, menos 3 e menos 25!",
        },
        {
          text: "Como nenhum negativo ganha de zero, o programa devolve **0** — um número que **nem existe na lista**! Por isso usamos **numeros[0]**!",
          spoken: "Como nenhum negativo ganha de zero, o programa devolve zero, um número que nem existe na lista! Por isso usamos numeros no índice zero!",
        },
      ]),
      getLiaStage: () => ({
        visible: true,
        expression: "startled",
        pointing: "right",
        placement: "corner-left",
        callout: "0 nem estava na lista!",
      }),
      getVisual: () => ({
        kind: "array-scanner",
        arrayLabel: "numeros = [-10, -3, -25]",
        items: [-10, -3, -25],
        activeIndex: 1,
        championIndex: -1,
        championLabel: "maior (bug)",
        championValue: "0 ?",
        comparisonText: "Nenhum item negativo é maior que 0!",
        verdictBadge: "BUG: maior = 0",
      }),
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-05",
      title: "Desafio com números negativos",
      milestoneLabel: "Desafio",
      themeVariant: "array-amber",
      layout: "split",
      audioFile: "act-05.mp3",
      durationMs: 11000,
      cues: buildSyncedCues([
        {
          text: "Se a lista for **[-10, -3, -25]** e alguém iniciar **maior = 0**, qual valor errado vai sair no final?",
          spoken: "Se a lista for menos 10, menos 3 e menos 25 e alguém iniciar maior igual a 0, qual valor errado vai sair no final?",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.quizSolved ? "starry" : rt.selectedOption ? "explaining" : "curious",
        pointing: rt.quizSolved ? "up" : "right",
        placement: "corner-left",
        callout: rt.quizSolved ? "0 venceu sem jogar!" : "Qual valor sai?",
      }),
      interaction: {
        kind: "quiz",
        prompt: "Em [-10, -3, -25], se iniciarmos maior = 0 em vez de numeros[0], o que sai?",
        options: [
          { id: "A", label: "-3" },
          { id: "B", label: "0" },
          { id: "C", label: "-25" },
        ],
        correctId: "B",
        nextLabel: "Testar listas no Lab",
        feedback: {
          A: {
            audioFile: "act-05-wrong-a.mp3",
            cue: "**-3** seria a resposta certa se usássemos **numeros[0]**! Mas com **0**, nenhum negativo vence de 0!",
            durationMs: 7500,
          },
          B: {
            audioFile: "act-05-correct.mp3",
            cue: "**Acertou! Sai 0!** Zero nem estava na lista, mas como é maior que todos os negativos, vence errado!",
            durationMs: 7500,
          },
          C: {
            audioFile: "act-05-wrong-c.mp3",
            cue: "**-25** é o menor de todos, e como **0 > -25**, o 0 ficaria intacto!",
            durationMs: 6000,
          },
        },
      },
      getVisual: () => ({
        kind: "array-scanner",
        arrayLabel: "numeros = [-10, -3, -25]",
        items: [-10, -3, -25],
        activeIndex: 1,
        championIndex: -1,
        championLabel: "maior (bug)",
        championValue: "0 ?",
        comparisonText: "Nenhum item negativo é maior que 0!",
      }),
      getCodeLines: () => [
        { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "numeros", kind: "var-violet" }, { text: " = [-10, -3, -25]" }] },
        { lineNumber: 2, spotlight: "amber", tokens: [{ text: "var ", kind: "kw" }, { text: "maior", kind: "var-cyan" }, { text: " = 0  // Bug!" }] },
        { lineNumber: 3, tokens: [{ text: "para ", kind: "kw" }, { text: "(var i = 0; i < tamanho(numeros); i++) { ... }" }] },
      ],
      getConsoleOutput: rt => (rt.quizSolved ? "0  (por isso usamos numeros[0]!)" : null),
    },
    {
      id: "act-06",
      title: "Teste sua lista e resumo",
      milestoneLabel: "Lab",
      themeVariant: "array-amber",
      layout: "split",
      audioFile: "act-06.mp3",
      durationMs: 15000,
      cues: buildSyncedCues([
        { text: "Escolha uma lista ou adicione um **valor extra** abaixo para ver o algoritmo achar o campeão!" },
        { text: "Resumo: inicialize **maior = numeros[0]**, percorra até **tamanho(numeros) - 1** e atualize quando achar um maior!" },
      ]),
      getLiaStage: rt => {
        const base =
          rt.values.lista === "negativos"
            ? [-10, -3, -25, -7]
            : rt.values.lista === "altos"
              ? [12, 7, 45, 19]
              : [4, 15, 8, 23];
        const extra = Number(rt.values.extra);
        const list = Number.isFinite(extra) ? [...base, extra] : base;
        const max = Math.max(...list);
        return {
          visible: true,
          expression: "starry",
          pointing: "right",
          placement: "corner-left",
          callout: `Campeão encontrado: ${max}!`,
        };
      },
      interaction: {
        kind: "sandbox",
        fields: [
          {
            key: "lista",
            label: "lista base:",
            type: "select",
            options: [
              { value: "padrao", label: "[4, 15, 8, 23]" },
              { value: "negativos", label: "[-10, -3, -25, -7]" },
              { value: "altos", label: "[12, 7, 45, 19]" },
            ],
          },
          { key: "extra", label: "novo item:", type: "number", min: -999, max: 999, short: true },
        ],
        submitLabel: "Buscar Maior",
        feedback: {
          audioFile: "act-06-run.mp3",
          cue: "**Show!** Começando com **numeros[0]**, o algoritmo funciona até com negativos!",
          durationMs: 6000,
        },
      },
      getVisual: rt => {
        const base =
          rt.values.lista === "negativos"
            ? [-10, -3, -25, -7]
            : rt.values.lista === "altos"
              ? [12, 7, 45, 19]
              : [4, 15, 8, 23];
        const extra = Number(rt.values.extra);
        const list = Number.isFinite(extra) ? [...base, extra] : base;
        let champIdx = 0;
        for (let k = 1; k < list.length; k++) {
          if (list[k] > list[champIdx]) champIdx = k;
        }
        return {
          kind: "array-scanner",
          arrayLabel: `numeros = [${list.join(", ")}]`,
          items: list,
          activeIndex: champIdx,
          championIndex: champIdx,
          championLabel: "maior",
          championValue: String(list[champIdx]),
          comparisonText: `Começou em [${list[0]}] e encontrou ${list[champIdx]} no índice [${champIdx}]!`,
        };
      },
      getCodeLines: rt => {
        const base =
          rt.values.lista === "negativos"
            ? [-10, -3, -25, -7]
            : rt.values.lista === "altos"
              ? [12, 7, 45, 19]
              : [4, 15, 8, 23];
        const extra = Number(rt.values.extra);
        const list = Number.isFinite(extra) ? [...base, extra] : base;
        return [
          { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "numeros", kind: "var-violet" }, { text: ` = [${list.join(", ")}]` }] },
          { lineNumber: 2, tokens: [{ text: "var ", kind: "kw" }, { text: "maior", kind: "var-cyan" }, { text: " = numeros[0]" }] },
          { lineNumber: 3, tokens: [{ text: "para ", kind: "kw" }, { text: "(var i = 1; i < tamanho(numeros); i++) { ... }" }] },
          { lineNumber: 4, spotlight: "green", tokens: [{ text: "escreva", kind: "fn" }, { text: '("Maior:", maior)' }] },
        ];
      },
      getConsoleOutput: rt => {
        const base =
          rt.executedValues.lista === "negativos"
            ? [-10, -3, -25, -7]
            : rt.executedValues.lista === "altos"
              ? [12, 7, 45, 19]
              : [4, 15, 8, 23];
        const extra = Number(rt.executedValues.extra);
        const list = Number.isFinite(extra) ? [...base, extra] : base;
        return `Maior: ${Math.max(...list)}`;
      },
    },
  ],
};

/* ==========================================================================
   LOGIC-09 · FUNÇÕES REUTILIZÁVEIS (Máquina Entrada -> mod -> retorne)
   ========================================================================== */
const LOGIC_09: TheaterLessonScript = {
  lessonId: "logic-09",
  languageLabel: "Portugol",
  visualTitle: "Máquina de Função",
  codeTitle: "ehPar(n) e retorne · Portugol",
  initialValues: { n: "4" },
  acts: [
    {
      id: "act-01",
      title: "Receita reutilizável: parâmetro e retorne",
      milestoneLabel: "Cenário",
      themeVariant: "fn-teal",
      layout: "center-story",
      audioFile: "act-01.mp3",
      durationMs: 21000,
      cues: buildSyncedCues([
        { text: "Quando uma regra se repete em vários lugares do programa, colocamos ela dentro de uma **função**." },
        { text: "Pense numa **máquina**: você coloca uma entrada pelo **parâmetro**, ela processa e devolve a resposta com **retorne**!" },
        { text: "Assim você escreve a lógica **uma vez só** e pode reutilizar para quantos números quiser!" },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.ratio < 0.45 ? "wink" : "happy",
        pointing: rt.ratio >= 0.35 ? "right" : "none",
        placement: "corner-left",
        callout: rt.ratio >= 0.72 ? "Escreva 1x, use sempre!" : undefined,
      }),
      getVisual: rt => ({
        kind: "concept-hook",
        eyebrow: "Aula 09 · Funções Reutilizáveis",
        headline: "Entrada → Regra Pura → retorne",
        tone: "green",
        cards: [
          { badge: "1. Parâmetro", title: "ehPar(n)", value: "Recebe n (ex: 4, 7, 0)", state: "active", visible: rt.ratio >= 0.24 },
          { badge: "2. Regra", title: "(n mod 2) == 0", value: "Resto da divisão por 2", state: "neutral", visible: rt.ratio >= 0.5 },
          { badge: "3. Saída", title: "retorne", value: "verdadeiro ou falso", state: "good", visible: rt.ratio >= 0.74 },
        ],
      }),
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-02",
      title: "Como funciona o operador mod",
      milestoneLabel: "Operador mod",
      themeVariant: "fn-teal",
      layout: "visual-focus",
      audioFile: "act-02.mp3",
      durationMs: 23000,
      cues: buildSyncedCues([
        { text: "O segredo do **ehPar(n)** é o operador **mod**, que calcula o **resto** da divisão inteira por 2.", spoken: "O segredo da função ehPar é o operador mod, que calcula o resto da divisão inteira por 2." },
        { text: "Em **4 mod 2**, a divisão dá 2 e sobra **0** — resto zero significa **par (verdadeiro)**!" },
        { text: "Já em **7 mod 2**, sobra **1**! Como 1 é diferente de 0, devolve **falso**!" },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.58,
        expression: "explaining",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.65 ? "Resto 0 = par · Resto 1 = ímpar!" : undefined,
      }),
      getVisual: rt => {
        const showOdd = rt.ratio >= 0.58;
        const phase: 1 | 2 | 3 = rt.ratio < 0.2 ? 1 : rt.ratio < 0.4 ? 2 : 3;
        return {
          kind: "function-machine",
          phase,
          fnName: "ehPar(n)",
          inputLabel: "n",
          inputValue: showOdd ? "7" : "4",
          ruleText: showOdd ? "(7 mod 2) = resto 1 → 1 == 0 é falso" : "(4 mod 2) = resto 0 → 0 == 0 é verdadeiro",
          outputValue: showOdd ? "falso" : "verdadeiro",
          outputTone: showOdd ? "amber" : "green",
          cases: [
            { input: "ehPar(4)", output: "verdadeiro", active: !showOdd },
            { input: "ehPar(7)", output: "falso", active: showOdd },
            { input: "ehPar(0)", output: "verdadeiro" },
          ],
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-03",
      title: "Diferença entre escreva() e retorne",
      milestoneLabel: "retorne",
      themeVariant: "fn-teal",
      layout: "split",
      audioFile: "act-03.mp3",
      durationMs: 20000,
      cues: buildSyncedCues([
        {
          text: "Muita atenção: **escreva()** apenas imprime na tela. Já **retorne** entrega o resultado de volta para quem chamou a função!",
          spoken: "Muita atenção: escreva apenas imprime na tela. Já retorne entrega o resultado de volta para quem chamou a função!",
        },
        { text: "Além disso, assim que encontra **retorne**, a função **encerra na hora** e devolve o valor para a variável **res**!" },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.5,
        expression: "starry",
        pointing: "right",
        placement: "corner-left",
      }),
      getVisual: () => ({
        kind: "function-machine",
        phase: 3,
        fnName: "dobrar(x)",
        inputLabel: "x",
        inputValue: "7",
        ruleText: "retorne x * 2  (entrega 14 para a variável res)",
        outputValue: "14",
        outputTone: "cyan",
        note: "Sem retorne, var res = dobrar(7) ficaria indefinido!",
      }),
      getCodeLines: () => [
        { lineNumber: 1, tokens: [{ text: "funcao ", kind: "kw" }, { text: "dobrar", kind: "fn" }, { text: "(x) {" }] },
        {
          lineNumber: 2,
          spotlight: "cyan",
          pointerPill: { text: "Entrega o valor para fora", tone: "cyan" },
          tokens: [{ text: "  retorne ", kind: "kw" }, { text: "x * 2" }],
        },
        { lineNumber: 3, tokens: [{ text: "}" }] },
        { lineNumber: 4, spotlight: "green", tokens: [{ text: "var ", kind: "kw" }, { text: "res", kind: "var-violet" }, { text: " = dobrar(7)" }] },
      ],
      getConsoleOutput: () => "res = 14",
    },
    {
      id: "act-04",
      title: "Escrevendo ehPar(n) no Portugol",
      milestoneLabel: "No Código",
      themeVariant: "fn-teal",
      layout: "split",
      audioFile: "act-04.mp3",
      durationMs: 19000,
      cues: buildSyncedCues([
        { text: "Veja como fica limpa a função **ehPar(n)** do exercício desta aula." },
        { text: "Em uma única linha fazemos **retorne (n mod 2) == 0**, e depois testamos com **escreva(ehPar(4), ehPar(7))**!", spoken: "Em uma única linha fazemos retorne n mod 2 igual a zero, e depois testamos com escreva ehPar de 4 e ehPar de 7!" },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.5,
        expression: "happy",
        pointing: "right",
        placement: "corner-left",
      }),
      getVisual: () => ({
        kind: "function-machine",
        phase: 3,
        fnName: "ehPar(n)",
        inputLabel: "n",
        inputValue: "4 e 7",
        ruleText: "retorne (n mod 2) == 0",
        outputValue: "V, F",
        outputTone: "green",
        cases: [
          { input: "ehPar(4)", output: "verdadeiro", active: true },
          { input: "ehPar(7)", output: "falso", active: true },
          { input: "ehPar(0)", output: "verdadeiro" },
          { input: "ehPar(-2)", output: "verdadeiro" },
        ],
      }),
      getCodeLines: rt => [
        { lineNumber: 1, typeProgress: Math.min(1, rt.ratio / 0.3), tokens: [{ text: "funcao ", kind: "kw" }, { text: "ehPar", kind: "fn" }, { text: "(n) {" }] },
        { lineNumber: 2, spotlight: rt.ratio >= 0.35 ? "green" : undefined, typeProgress: rt.ratio < 0.3 ? 0 : Math.min(1, (rt.ratio - 0.3) / 0.35), tokens: [{ text: "  retorne ", kind: "kw" }, { text: "(n mod 2) == 0" }] },
        { lineNumber: 3, tokens: [{ text: "}" }] },
        { lineNumber: 4, spotlight: rt.ratio >= 0.72 ? "cyan" : undefined, typeProgress: rt.ratio < 0.65 ? 0 : Math.min(1, (rt.ratio - 0.65) / 0.3), tokens: [{ text: "escreva", kind: "fn" }, { text: "(ehPar(4), ehPar(7))" }] },
      ],
      getConsoleOutput: rt => (rt.ratio >= 0.78 ? "verdadeiro, falso" : null),
    },
    {
      id: "act-05",
      title: "Desafio do retorne",
      milestoneLabel: "Desafio",
      themeVariant: "fn-teal",
      layout: "split",
      audioFile: "act-05.mp3",
      durationMs: 11000,
      cues: buildSyncedCues([
        { text: "Se uma função usar **escreva(x * 2)** mas esquecer do **retorne**, o que vai para **var res = dobrar(5)**?", spoken: "Se uma função usar escreva x vezes 2 mas esquecer do retorne, o que vai para var res igual a dobrar de 5?" },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.quizSolved ? "starry" : rt.selectedOption ? "explaining" : "curious",
        pointing: rt.quizSolved ? "up" : "right",
        placement: "corner-left",
        callout: rt.quizSolved ? "Sem retorne = vazio!" : "O que res recebe?",
      }),
      interaction: {
        kind: "quiz",
        prompt: "Se dobrar(5) usar escreva(x * 2) sem retorne, o que var res recebe?",
        options: [
          { id: "A", label: "10" },
          { id: "B", label: "indefinido (vazio)" },
          { id: "C", label: "5" },
        ],
        correctId: "B",
        nextLabel: "Testar entradas em ehPar(n)",
        feedback: {
          A: {
            audioFile: "act-05-wrong-a.mp3",
            cue: "O **10** até aparece no console, mas a função **não devolveu nada** para a variável **res**!",
            durationMs: 7000,
          },
          B: {
            audioFile: "act-05-correct.mp3",
            cue: "**Exato!** Sem **retorne**, a função imprime na tela mas volta de mãos vazias (**indefinido**)!",
            durationMs: 7500,
          },
          C: {
            audioFile: "act-05-wrong-c.mp3",
            cue: "Sem **retorne**, ela não devolve nem a entrada — volta vazia (**indefinido**)!",
            durationMs: 6000,
          },
        },
      },
      getVisual: () => ({
        kind: "function-machine",
        phase: 3,
        fnName: "dobrar(5)",
        inputLabel: "x",
        inputValue: "5",
        ruleText: "escreva(x * 2)  // faltou retorne!",
        outputValue: "indefinido",
        outputTone: "amber",
      }),
      getCodeLines: () => [
        { lineNumber: 1, tokens: [{ text: "funcao ", kind: "kw" }, { text: "dobrar", kind: "fn" }, { text: "(x) { escreva(x * 2) }" }] },
        { lineNumber: 2, spotlight: "amber", tokens: [{ text: "var ", kind: "kw" }, { text: "res", kind: "var-violet" }, { text: " = dobrar(5)" }] },
      ],
      getConsoleOutput: rt => (rt.quizSolved ? "res = indefinido" : null),
    },
    {
      id: "act-06",
      title: "Teste ehPar(n) e resumo",
      milestoneLabel: "Lab",
      themeVariant: "fn-teal",
      layout: "split",
      audioFile: "act-06.mp3",
      durationMs: 15000,
      cues: buildSyncedCues([
        { text: "Teste **4**, **7**, **0** ou até números negativos como **-2** na máquina **ehPar(n)** abaixo!" },
        { text: "Resumo: parâmetros recebem os dados de fora, **mod** pega o resto da divisão e **retorne** devolve o resultado!" },
      ]),
      getLiaStage: rt => {
        const n = Math.trunc(Number(rt.values.n) || 0);
        const isEven = Math.abs(n % 2) === 0;
        return {
          visible: true,
          expression: isEven ? "starry" : "explaining",
          pointing: "right",
          placement: "corner-left",
          callout: isEven ? `${n} é par (verdadeiro)!` : `${n} é ímpar (falso)!`,
        };
      },
      interaction: {
        kind: "sandbox",
        fields: [{ key: "n", label: "n:", type: "number", min: -999, max: 999, short: true }],
        submitLabel: "Chamar ehPar(n)",
        feedback: {
          audioFile: "act-06-run.mp3",
          cue: "**Perfeito!** Uma única função pura resolve positivos, zero e negativos sem duplicar código!",
          durationMs: 6000,
        },
      },
      getVisual: rt => {
        const n = Math.trunc(Number(rt.values.n) || 0);
        const isEven = Math.abs(n % 2) === 0;
        const out = isEven ? "verdadeiro" : "falso";
        return {
          kind: "function-machine",
          phase: 3,
          fnName: "ehPar(n)",
          inputLabel: "n",
          inputValue: String(n),
          ruleText: `(${n} mod 2) = ${Math.abs(n % 2)} → == 0 é ${out}`,
          outputValue: out,
          outputTone: isEven ? "green" : "amber",
          cases: [
            { input: `ehPar(${n})`, output: out, active: true },
            { input: "ehPar(0)", output: "verdadeiro", active: n === 0 },
            { input: "ehPar(-2)", output: "verdadeiro", active: n === -2 },
          ],
        };
      },
      getCodeLines: rt => {
        const n = Math.trunc(Number(rt.values.n) || 0);
        return [
          { lineNumber: 1, tokens: [{ text: "funcao ", kind: "kw" }, { text: "ehPar", kind: "fn" }, { text: "(n) {" }] },
          { lineNumber: 2, tokens: [{ text: "  retorne ", kind: "kw" }, { text: "(n mod 2) == 0" }] },
          { lineNumber: 3, tokens: [{ text: "}" }] },
          { lineNumber: 4, spotlight: "green", tokens: [{ text: "escreva", kind: "fn" }, { text: `(ehPar(${n}))` }] },
        ];
      },
      getConsoleOutput: rt => {
        const n = Math.trunc(Number(rt.executedValues.n) || 0);
        return Math.abs(n % 2) === 0 ? "verdadeiro" : "falso";
      },
    },
  ],
};

/* ==========================================================================
   LOGIC-10 · PROJETO: ANALISADOR DE TURMA (Arquitetura integrando tudo)
   ========================================================================== */
const LOGIC_10_SAMPLE = [8, 6, 9, 7];

const LOGIC_10: TheaterLessonScript = {
  lessonId: "logic-10",
  languageLabel: "Portugol",
  visualTitle: "Pipeline do Analisador",
  codeTitle: "analisarNotas(notas) · Portugol",
  initialValues: { n1: "8", n2: "6", n3: "9", n4: "7" },
  acts: [
    {
      id: "act-01",
      title: "Sua missão final na Trilha de Lógica",
      milestoneLabel: "Missão",
      themeVariant: "capstone-aurora",
      layout: "center-story",
      audioFile: "act-01.mp3",
      durationMs: 21000,
      cues: buildSyncedCues([
        {
          text: "Parabéns por chegar ao projeto final! Agora vamos unir **tudo** o que você aprendeu na trilha.",
        },
        {
          text: "A função **analisarNotas(notas)** recebe uma lista de notas, percorre com **laço para**, conta aprovados com **se (nota >= 7)**...",
          spoken: "A função analisarNotas recebe uma lista de notas, percorre com laço para, conta aprovados com se nota maior ou igual a 7...",
        },
        {
          text: "...e devolve um **objeto resumo** com **{ media, aprovados }**!",
          spoken: "...e devolve um objeto resumo com média e aprovados!",
        },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.ratio < 0.4 ? "starry" : "happy",
        pointing: rt.ratio >= 0.35 ? "right" : "none",
        placement: "corner-left",
        callout: rt.ratio >= 0.72 ? "Tudo conectado!" : undefined,
      }),
      getVisual: rt => ({
        kind: "concept-hook",
        eyebrow: "Aula 10 · Projeto Integrador",
        headline: "4 pilares trabalhando juntos em uma função",
        tone: "violet",
        cards: [
          { badge: "Pilar 1", title: "Variáveis", value: "soma e aprovados", state: "neutral", visible: rt.ratio >= 0.2 },
          { badge: "Pilar 2", title: "Laço para", value: "Percorre notas[]", state: "active", visible: rt.ratio >= 0.4 },
          { badge: "Pilar 3", title: "Condicional se", value: "notas[i] >= 7", state: "good", visible: rt.ratio >= 0.6 },
          { badge: "Pilar 4", title: "retorne { ... }", value: "{ media, aprovados }", state: "good", visible: rt.ratio >= 0.78 },
        ],
      }),
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-02",
      title: "Arquitetura do pipeline passo a passo",
      milestoneLabel: "Arquitetura",
      themeVariant: "capstone-aurora",
      layout: "visual-focus",
      audioFile: "act-02.mp3",
      durationMs: 22000,
      cues: buildSyncedCues([
        { text: "Olhe o pipeline completo: primeiro entra a lista **[8, 6, 9, 7]**." },
        { text: "Depois o laço **para** soma todas as notas, enquanto o **se (>= 7)** conta quem passou." },
        { text: "Por fim, dividimos a soma por **tamanho(notas)** e retornamos **{ media: 7.5, aprovados: 3 }**!", spoken: "Por fim, dividimos a soma pelo tamanho da lista e retornamos média 7.5 e aprovados 3!" },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.65,
        expression: "starry",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.72 ? "media: 7.5 · aprovados: 3" : undefined,
      }),
      getVisual: rt => {
        const visibleCount = rt.ratio < 0.25 ? 1 : rt.ratio < 0.48 ? 2 : rt.ratio < 0.7 ? 3 : 4;
        return {
          kind: "architecture-flow",
          visibleCount,
          stages: [
            { id: "in", tag: "1. Entrada", title: "notas[]", detail: "[8, 6, 9, 7]", tone: "violet", active: visibleCount === 1 },
            { id: "loop", tag: "2. Laço para", title: "soma += notas[i]", detail: "8 + 6 + 9 + 7 = 30", tone: "cyan", active: visibleCount === 2 },
            { id: "cond", tag: "3. Condicional", title: "notas[i] >= 7", detail: "8, 9 e 7 passam (3)", tone: "green", active: visibleCount === 3 },
            { id: "out", tag: "4. retorne", title: "Objeto Resumo", detail: "{ media: 7.5, aprovados: 3 }", tone: "amber", active: visibleCount === 4 },
          ],
          summaryCard:
            visibleCount >= 4
              ? {
                  title: "Retorno da função analisarNotas(notas)",
                  entries: [
                    { key: "media", value: "7.5" },
                    { key: "aprovados", value: "3" },
                  ],
                }
              : undefined,
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-03",
      title: "Acompanhando a execução em [8, 6, 9, 7]",
      milestoneLabel: "Execução",
      themeVariant: "capstone-aurora",
      layout: "visual-focus",
      audioFile: "act-03.mp3",
      durationMs: 22000,
      cues: buildSyncedCues([
        { text: "Veja a execução em cada índice: começa com **soma = 0** e **aprovados = 0**." },
        { text: "Nota **8** soma 8 e aprova (1). Nota **6** soma 14 mas **não aprova**." },
        { text: "Nota **9** soma 23 e aprova (2). Nota **7** está na fronteira **>= 7**, soma 30 e fecha **3 aprovados**!", spoken: "Nota 9 soma 23 e aprova 2. Nota 7 está na fronteira maior ou igual a 7, soma 30 e fecha 3 aprovados!" },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.7,
        expression: "explaining",
        pointing: "right",
        placement: "corner-left",
        callout: rt.ratio >= 0.72 ? "7 >= 7 conta como aprovado!" : undefined,
      }),
      getVisual: rt => {
        const step = rt.ratio < 0.25 ? 0 : rt.ratio < 0.45 ? 1 : rt.ratio < 0.65 ? 2 : rt.ratio < 0.82 ? 3 : 4;
        const slice = LOGIC_10_SAMPLE.slice(0, step);
        const soma = slice.reduce((a, b) => a + b, 0);
        const aprovados = slice.filter(x => x >= 7).length;
        return {
          kind: "loop-stepper",
          loopLabel: "para (var i = 0; i < tamanho(notas); i++)",
          currentStep: step,
          totalSteps: 4,
          vars: [
            { label: "soma", value: String(soma), tone: "cyan", highlight: step > 0 },
            { label: "aprovados (>= 7)", value: String(aprovados), tone: "green", highlight: step > 0 },
          ],
          itemsLabel: "notas processadas",
          items: slice.map(v => `${v} ${v >= 7 ? "✓" : "✗"}`),
          statusText:
            step === 0
              ? "Início: soma = 0 e aprovados = 0."
              : step < 4
                ? `Processou nota ${slice[step - 1]} → soma = ${soma}, aprovados = ${aprovados}.`
                : "Fim! media = 30 / 4 = 7.5 e aprovados = 3.",
        };
      },
      getCodeLines: () => [],
      getConsoleOutput: () => null,
    },
    {
      id: "act-04",
      title: "O código completo no Portugol",
      milestoneLabel: "No Código",
      themeVariant: "capstone-aurora",
      layout: "split",
      audioFile: "act-04.mp3",
      durationMs: 22000,
      cues: buildSyncedCues([
        { text: "Agora junte tudo no código Portugol ao lado, exatamente como no projeto final." },
        { text: "Inicializamos **soma** e **aprovados**, acumulamos dentro do **para** e retornamos **{ media: soma / tamanho(notas), aprovados: aprovados }**!" },
      ]),
      getLiaStage: rt => ({
        visible: rt.ratio >= 0.52,
        expression: "starry",
        pointing: "right",
        placement: "corner-left",
      }),
      getVisual: () => ({
        kind: "architecture-flow",
        stages: [
          { id: "in", tag: "Entrada", title: "[8, 6, 9, 7]", detail: "4 notas", tone: "violet", active: true },
          { id: "out", tag: "Retorno", title: "media: 7.5", detail: "aprovados: 3", tone: "green", active: true },
        ],
      }),
      getCodeLines: rt => [
        { lineNumber: 1, typeProgress: Math.min(1, rt.ratio / 0.2), tokens: [{ text: "funcao ", kind: "kw" }, { text: "analisarNotas", kind: "fn" }, { text: "(notas) {" }] },
        { lineNumber: 2, typeProgress: rt.ratio < 0.16 ? 0 : Math.min(1, (rt.ratio - 0.16) / 0.22), tokens: [{ text: "  var soma = 0, aprovados = 0", kind: "plain" }] },
        { lineNumber: 3, spotlight: rt.ratio >= 0.38 && rt.ratio < 0.68 ? "cyan" : undefined, typeProgress: rt.ratio < 0.34 ? 0 : Math.min(1, (rt.ratio - 0.34) / 0.25), tokens: [{ text: "  para ", kind: "kw" }, { text: "(var i = 0; i < tamanho(notas); i++) {" }] },
        { lineNumber: 4, spotlight: rt.ratio >= 0.45 && rt.ratio < 0.68 ? "green" : undefined, tokens: [{ text: "    soma += notas[i]; se (notas[i] >= 7) { aprovados++ }" }] },
        { lineNumber: 5, spotlight: rt.ratio >= 0.7 ? "green" : undefined, typeProgress: rt.ratio < 0.66 ? 0 : Math.min(1, (rt.ratio - 0.66) / 0.25), tokens: [{ text: "  } retorne ", kind: "kw" }, { text: "{ media: soma / tamanho(notas), aprovados }" }] },
        { lineNumber: 6, tokens: [{ text: "}" }] },
      ],
      getConsoleOutput: rt => (rt.ratio >= 0.8 ? "{ media: 7.5, aprovados: 3 }" : null),
    },
    {
      id: "act-05",
      title: "Desafio final do Analisador",
      milestoneLabel: "Desafio",
      themeVariant: "capstone-aurora",
      layout: "split",
      audioFile: "act-05.mp3",
      durationMs: 12000,
      cues: buildSyncedCues([
        { text: "Se entrarmos com **[5, 7, 10, 6.5]** e o corte for **>= 7**, quantos alunos ficam em **aprovados**?", spoken: "Se entrarmos com 5, 7, 10 e 6.5 e o corte for maior ou igual a 7, quantos alunos ficam em aprovados?" },
      ]),
      getLiaStage: rt => ({
        visible: true,
        expression: rt.quizSolved ? "starry" : rt.selectedOption ? "explaining" : "curious",
        pointing: rt.quizSolved ? "up" : "right",
        placement: "corner-left",
        callout: rt.quizSolved ? "7 e 10 passam (2)!" : "Lembra da fronteira!",
      }),
      interaction: {
        kind: "quiz",
        prompt: "Para notas = [5, 7, 10, 6.5] com corte >= 7, qual será o campo aprovados?",
        options: [
          { id: "A", label: "1 aprovado" },
          { id: "B", label: "2 aprovados" },
          { id: "C", label: "3 aprovados" },
        ],
        correctId: "B",
        nextLabel: "Simular minha turma",
        feedback: {
          A: {
            audioFile: "act-05-wrong-a.mp3",
            cue: "Tem mais um! Lembra do **>= 7**? O **7** exato também é aprovado junto com o **10**!",
            durationMs: 7000,
          },
          B: {
            audioFile: "act-05-correct.mp3",
            cue: "**Isso! 2 aprovados!** O **7** (na fronteira) e o **10** passam no corte **>= 7**, enquanto **5** e **6.5** ficam de fora!",
            durationMs: 7500,
          },
          C: {
            audioFile: "act-05-wrong-c.mp3",
            cue: "Quase! **6.5** é menor que **7**, então não soma em aprovados.",
            durationMs: 6000,
          },
        },
      },
      getVisual: () => ({
        kind: "architecture-flow",
        stages: [
          { id: "n1", tag: "Nota 1", title: "5", detail: "5 >= 7 (Não)", tone: "amber" },
          { id: "n2", tag: "Nota 2", title: "7", detail: "7 >= 7 (Sim)", tone: "green", active: true },
          { id: "n3", tag: "Nota 3", title: "10", detail: "10 >= 7 (Sim)", tone: "green", active: true },
          { id: "n4", tag: "Nota 4", title: "6.5", detail: "6.5 >= 7 (Não)", tone: "amber" },
        ],
      }),
      getCodeLines: () => [
        { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "turma", kind: "var-violet" }, { text: " = [5, 7, 10, 6.5]" }] },
        { lineNumber: 2, spotlight: "cyan", tokens: [{ text: "escreva", kind: "fn" }, { text: "(analisarNotas(turma))" }] },
      ],
      getConsoleOutput: rt => (rt.quizSolved ? "{ media: 7.125, aprovados: 2 }" : null),
    },
    {
      id: "act-06",
      title: "Monte as notas da turma e encerramento",
      milestoneLabel: "Lab",
      themeVariant: "capstone-aurora",
      layout: "split",
      audioFile: "act-06.mp3",
      durationMs: 16000,
      cues: buildSyncedCues([
        { text: "Altere as 4 notas abaixo e veja o objeto resumo recalcular **média** e **aprovados** em tempo real!" },
        { text: "Você completou toda a parte conceitual da Trilha de Lógica — clique em **Praticar** e finalize o projeto no editor!" },
      ]),
      getLiaStage: rt => {
        const arr = [
          Math.max(0, Math.min(10, Number(rt.values.n1) || 0)),
          Math.max(0, Math.min(10, Number(rt.values.n2) || 0)),
          Math.max(0, Math.min(10, Number(rt.values.n3) || 0)),
          Math.max(0, Math.min(10, Number(rt.values.n4) || 0)),
        ];
        const aprovados = arr.filter(x => x >= 7).length;
        return {
          visible: true,
          expression: "starry",
          pointing: "right",
          placement: "corner-left",
          callout: `${aprovados} de 4 aprovados!`,
        };
      },
      interaction: {
        kind: "sandbox",
        fields: [
          { key: "n1", label: "n1:", type: "number", min: 0, max: 10, short: true },
          { key: "n2", label: "n2:", type: "number", min: 0, max: 10, short: true },
          { key: "n3", label: "n3:", type: "number", min: 0, max: 10, short: true },
          { key: "n4", label: "n4:", type: "number", min: 0, max: 10, short: true },
        ],
        submitLabel: "Analisar Turma",
        feedback: {
          audioFile: "act-06-run.mp3",
          cue: "**Incrível!** Você acabou de dominar a base completa de Lógica de Programação!",
          durationMs: 6000,
        },
      },
      getVisual: rt => {
        const arr = [
          Math.max(0, Math.min(10, Number(rt.values.n1) || 0)),
          Math.max(0, Math.min(10, Number(rt.values.n2) || 0)),
          Math.max(0, Math.min(10, Number(rt.values.n3) || 0)),
          Math.max(0, Math.min(10, Number(rt.values.n4) || 0)),
        ];
        const media = Number(((arr[0] + arr[1] + arr[2] + arr[3]) / 4).toFixed(2));
        const aprovados = arr.filter(x => x >= 7).length;
        return {
          kind: "architecture-flow",
          stages: [
            { id: "in", tag: "Entrada", title: `[${arr.join(", ")}]`, detail: "4 notas", tone: "violet", active: true },
            { id: "calc", tag: "Processamento", title: "Laço + Corte >= 7", detail: `${aprovados} com nota >= 7`, tone: "cyan", active: true },
          ],
          summaryCard: {
            title: "Resumo em tempo real",
            entries: [
              { key: "media", value: String(media) },
              { key: "aprovados", value: String(aprovados) },
            ],
          },
        };
      },
      getCodeLines: rt => {
        const arr = [
          Math.max(0, Math.min(10, Number(rt.values.n1) || 0)),
          Math.max(0, Math.min(10, Number(rt.values.n2) || 0)),
          Math.max(0, Math.min(10, Number(rt.values.n3) || 0)),
          Math.max(0, Math.min(10, Number(rt.values.n4) || 0)),
        ];
        return [
          { lineNumber: 1, tokens: [{ text: "var ", kind: "kw" }, { text: "turma", kind: "var-violet" }, { text: ` = [${arr.join(", ")}]` }] },
          { lineNumber: 2, spotlight: "green", tokens: [{ text: "escreva", kind: "fn" }, { text: "(analisarNotas(turma))" }] },
        ];
      },
      getConsoleOutput: rt => {
        const arr = [
          Math.max(0, Math.min(10, Number(rt.executedValues.n1) || 0)),
          Math.max(0, Math.min(10, Number(rt.executedValues.n2) || 0)),
          Math.max(0, Math.min(10, Number(rt.executedValues.n3) || 0)),
          Math.max(0, Math.min(10, Number(rt.executedValues.n4) || 0)),
        ];
        const media = Number(((arr[0] + arr[1] + arr[2] + arr[3]) / 4).toFixed(2));
        const aprovados = arr.filter(x => x >= 7).length;
        return `{ media: ${media}, aprovados: ${aprovados} }`;
      },
    },
  ],
};

export const LOGIC_THEATER_SCRIPTS: Record<string, TheaterLessonScript> = {
  "logic-01": LOGIC_01,
  "logic-02": LOGIC_02,
  "logic-03": LOGIC_03,
  "logic-04": LOGIC_04,
  "logic-05": LOGIC_05,
  "logic-06": LOGIC_06,
  "logic-07": LOGIC_07,
  "logic-08": LOGIC_08,
  "logic-09": LOGIC_09,
  "logic-10": LOGIC_10,
};
