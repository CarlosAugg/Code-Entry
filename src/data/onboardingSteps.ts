export type TourInteractionMode = "info" | "click-target" | "navigate";

export interface OnboardingStep {
  id: string;
  badge: string;
  title: string;
  description: string;
  tip: string;
  actionPrompt?: string;
  interactionMode: TourInteractionMode;
  route: string;
  routePattern?: RegExp;
  advanceOnRoutePattern?: RegExp;
  targetSelectors?: string[];
  preferredSide?: "bottom" | "top" | "right" | "left";
}

export function getOnboardingSteps(displayName = "Estudante"): OnboardingStep[] {
  const name = displayName.trim() || "Estudante";
  return [
    {
      id: "welcome",
      badge: "Boas-vindas · 1 de 8",
      title: `Bem-vindo(a) ao Code Entry, ${name}!`,
      description:
        "Vamos fazer um tour rápido e interativo. Em vez de apenas trocar telas sozinho, vou destacar cada área para você clicar e explorar na prática.",
      tip: "Seu progresso, temas e conquistas ficam salvos automaticamente neste computador.",
      interactionMode: "info",
      route: "/",
      targetSelectors: undefined,
    },
    {
      id: "dashboard-journey",
      badge: "Sua Jornada · 2 de 8",
      title: "Acompanhe seu ritmo diário aqui",
      description:
        "Neste painel lateral ficam seu progresso geral, sequência de dias ativos, XP acumulado e o acompanhamento leve da sua meta diária.",
      tip: "Você pode ajustar sua meta diária a qualquer momento no menu do seu perfil.",
      actionPrompt: 'Clique no cartão "Sua Jornada" em destaque para continuar.',
      interactionMode: "click-target",
      route: "/",
      routePattern: /^\/$/,
      targetSelectors: ['[data-tour="dashboard-journey"]'],
      preferredSide: "left",
    },
    {
      id: "open-tracks",
      badge: "Trilhas · 3 de 8",
      title: "Abra o catálogo de Trilhas",
      description:
        "O Code Entry organiza os estudos em 7 trilhas completas: Lógica, C++, JavaScript, Python, Linux, Banco de Dados e Redes.",
      tip: "Todas as trilhas são abertas — você escolhe por onde prefere evoluir.",
      actionPrompt: 'Clique no item "Trilhas" destacado no menu para abrir o catálogo.',
      interactionMode: "navigate",
      route: "/",
      routePattern: /^\/$/,
      advanceOnRoutePattern: /^\/trilhas\/?$/,
      targetSelectors: [
        '[data-tour="nav-tracks"]',
        '[data-tour="mobile-nav-tracks"]',
        '[data-tour="dashboard-explore-tracks"]',
      ],
      preferredSide: "right",
    },
    {
      id: "select-track",
      badge: "Escolher Trilha · 4 de 8",
      title: "Entre na trilha de Lógica de Programação",
      description:
        "Cada card mostra os módulos, aulas práticas, desafios e porcentagem real concluída com cores próprias da tecnologia.",
      tip: "Recomendamos começar por Lógica caso esteja dando seus primeiros passos.",
      actionPrompt: 'Clique no card "Lógica de Programação" (ou em qualquer trilha) em destaque.',
      interactionMode: "navigate",
      route: "/trilhas",
      routePattern: /^\/trilhas\/?$/,
      advanceOnRoutePattern: /^\/trilhas\/[^/]+\/?$/,
      targetSelectors: ['[data-tour="track-card-logic"]', '[data-tour="tracks-grid"] .ce-track-card'],
      preferredSide: "right",
    },
    {
      id: "start-lesson",
      badge: "Iniciar Aula · 5 de 8",
      title: "Abra uma aula prática",
      description:
        "Na página da trilha você vê o progresso por módulo, pré-requisitos sugeridos e a lista completa de aulas e desafios.",
      tip: "O botão principal leva direto para a próxima aula recomendada da trilha.",
      actionPrompt: "Clique no botão destacado para abrir a primeira aula prática.",
      interactionMode: "navigate",
      route: "/trilhas/logic",
      routePattern: /^\/trilhas\/[^/]+\/?$/,
      advanceOnRoutePattern: /^\/trilhas\/[^/]+\/aula\/[^/]+\/?$/,
      targetSelectors: ['[data-tour="track-start-lesson"]'],
      preferredSide: "bottom",
    },
    {
      id: "lesson-tabs",
      badge: "Ambiente de Aula · 6 de 8",
      title: "Teoria, Exemplos, Desafio e Dicas",
      description:
        "Toda aula traz abas organizadas lado a lado com o editor ou simulador. Ao executar seu código, os objetivos são validados em tempo real.",
      tip: "As dicas são reveladas em 3 níveis progressivos para ajudar sem entregar a resposta de imediato.",
      actionPrompt: 'Clique em qualquer aba destacada (ex.: "Exemplos" ou "Desafio") para testar.',
      interactionMode: "click-target",
      route: "/trilhas/logic/aula/logic-01",
      routePattern: /^\/trilhas\/[^/]+\/aula\/[^/]+\/?$/,
      targetSelectors: ['[data-tour="lesson-tabs"]'],
      preferredSide: "bottom",
    },
    {
      id: "open-labs",
      badge: "Laboratórios · 7 de 8",
      title: "Explore os Laboratórios Livres",
      description:
        "Além das aulas guiadas, você conta com 7 laboratórios abertos para experimentar código, terminal Linux, consultas SQL e redes sem restrições.",
      tip: "Em telas menores, abra o menu no canto superior esquerdo para acessar Laboratórios.",
      actionPrompt: 'Clique em "Laboratórios" no menu para conhecer o ambiente livre.',
      interactionMode: "navigate",
      route: "/trilhas/logic/aula/logic-01",
      advanceOnRoutePattern: /^\/laboratorios\/?$/,
      targetSelectors: [
        '[data-tour="nav-labs"]',
        '[data-tour="mobile-nav-labs"]',
        '[data-tour="mobile-menu-btn"]',
      ],
      preferredSide: "right",
    },
    {
      id: "finish",
      badge: "Tudo Pronto · 8 de 8",
      title: `Você já domina a navegação, ${name}!`,
      description:
        "Pelo seu avatar no topo você altera qualquer uma das 8 paletas de cores, ajusta sua meta diária, controla animações e exporta backups a qualquer hora.",
      tip: "Você pode refazer este roteiro interativo clicando no ícone ? na barra superior.",
      interactionMode: "info",
      route: "/laboratorios",
      targetSelectors: ['[data-tour="topbar-profile"]'],
      preferredSide: "bottom",
    },
  ];
}

export const ONBOARDING_STEPS = getOnboardingSteps();
