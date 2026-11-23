import type { LiaExpression, LiaPointing } from "../types/theater";

export interface OnboardingStep {
  id: string;
  route: string;
  speech: string;
  targetSelectors?: string[];
  navSelectors?: string[];
  transitionLabel?: string;
  preferredSide?: "bottom" | "top" | "right" | "left";
  openThemeDock?: boolean;
  liaExpression: LiaExpression;
  liaPointing: LiaPointing;
  ctaLabel?: string;
}

export function getOnboardingSteps(): OnboardingStep[] {
  return [
    {
      id: "home-welcome",
      route: "/",
      targetSelectors: ['[data-tour="dashboard-hero"]'],
      navSelectors: ['[data-tour="nav-home"]'],
      preferredSide: "bottom",
      liaExpression: "wink",
      liaPointing: "up",
      speech:
        "Oi! Eu sou a Lia. Aqui no Início você retoma sua aula em um clique e acompanha sua jornada ali à direita.",
    },
    {
      id: "live-themes",
      route: "/",
      openThemeDock: true,
      targetSelectors: [".ce-theme-dock-panel"],
      preferredSide: "top",
      liaExpression: "happy",
      liaPointing: "down",
      speech:
        "Primeiro, deixe tudo com a sua cara! Pode testar o modo claro, escuro e as 8 cores aqui embaixo agora mesmo.",
    },
    {
      id: "live-tracks",
      route: "/trilhas",
      targetSelectors: ['[data-tour="track-card-logic"]', '[data-tour="tracks-grid"]'],
      navSelectors: ['[data-tour="nav-tracks"]', '[data-tour="mobile-nav-tracks"]'],
      transitionLabel: "Vamos ali em Trilhas...",
      preferredSide: "right",
      liaExpression: "starry",
      liaPointing: "left",
      speech:
        "Aqui ficam as Trilhas, com aulas guiadas e editor no navegador. Começando do zero? Vai em Lógica — eu te ensino lá dentro!",
    },
    {
      id: "live-roadmaps",
      route: "/roadmaps",
      targetSelectors: ['[data-tour="roadmaps-graph"]', ".ce-rm-hero"],
      navSelectors: ['[data-tour="nav-roadmaps"]', '[data-tour="mobile-nav-roadmaps"]'],
      transitionLabel: "Agora vamos para Roadmaps...",
      preferredSide: "bottom",
      liaExpression: "curious",
      liaPointing: "up",
      speech:
        "Nos Roadmaps você vê o mapa completo de cada carreira para saber sempre o que estudar depois.",
    },
    {
      id: "live-projects",
      route: "/projetos",
      targetSelectors: [".ce-proj-card", ".ce-proj-filter-bar"],
      navSelectors: ['[data-tour="nav-projects"]', '[data-tour="mobile-nav-projects"]'],
      transitionLabel: "Partiu ver Projetos...",
      preferredSide: "right",
      liaExpression: "explaining",
      liaPointing: "left",
      speech:
        "E aqui em Projetos — junto com Desafios e Laboratórios no menu — você junta tudo na prática.",
    },
    {
      id: "ready-home",
      route: "/",
      targetSelectors: ['[data-tour="dashboard-start-cta"]', '[data-tour="dashboard-hero"]'],
      navSelectors: ['[data-tour="nav-home"]'],
      transitionLabel: "Voltando para o Início...",
      preferredSide: "bottom",
      liaExpression: "wink",
      liaPointing: "up",
      speech:
        "Tudo pronto! A busca e o Manual ficam no topo, e os temas no seu perfil. Bora começar?",
      ctaLabel: "Bora codar!",
    },
  ];
}

export const ONBOARDING_STEPS = getOnboardingSteps();
