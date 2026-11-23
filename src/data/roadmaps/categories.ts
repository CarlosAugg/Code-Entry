import type { RoadmapCategory } from "../../types/roadmap";

export const ROADMAP_CATEGORIES: RoadmapCategory[] = [
  {
    id: "web-frontend",
    label: "Frontend & Interfaces",
    shortLabel: "Frontend",
    description:
      "Interfaces web, acessibilidade, ecossistemas JavaScript, design systems e renderização moderna.",
    icon: "layout",
    accentColor: "#F97316",
  },
  {
    id: "backend-apis",
    label: "Backend & APIs",
    shortLabel: "Backend",
    description:
      "Arquitetura de servidores, modelagem de APIs, autenticação, filas, observabilidade e escala.",
    icon: "server",
    accentColor: "#3B82F6",
  },
  {
    id: "fullstack-product",
    label: "Desenvolvimento Full Stack",
    shortLabel: "Full Stack",
    description:
      "Integração completa do navegador ao servidor, banco de dados, deploy em nuvem e automação.",
    icon: "layers",
    accentColor: "#9B65FF",
  },
  {
    id: "systems-infra",
    label: "Sistemas, Redes & Infra",
    shortLabel: "Sistemas & Redes",
    description:
      "Linux, linha de comando, roteamento IPv4, DNS, firewalls e operação confiável de infraestrutura.",
    icon: "terminal",
    accentColor: "#22C55E",
  },
  {
    id: "data-databases",
    label: "Dados & Bancos SQL",
    shortLabel: "Dados & SQL",
    description:
      "Consultas analíticas, modelagem relacional, agregações, normalização e análise em Python.",
    icon: "database",
    accentColor: "#14B8A6",
  },
  {
    id: "foundations-cs",
    label: "Ciência da Computação & Base",
    shortLabel: "Base & Algoritmos",
    description:
      "Raciocínio algorítmico, tipagem, estruturas de dados, funções e resolução de problemas.",
    icon: "cpu",
    accentColor: "#6366F1",
  },
];

export const ROADMAP_CATEGORY_MAP: Record<string, RoadmapCategory> = Object.fromEntries(
  ROADMAP_CATEGORIES.map(category => [category.id, category])
);
