import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Atom,
  Binary,
  BookOpen,
  Bot,
  Boxes,
  Braces,
  Brain,
  Briefcase,
  Check,
  Cloud,
  Code2,
  Compass,
  Construction,
  Container,
  Cpu,
  Database,
  FileCode2,
  GitBranch,
  Globe,
  HardDrive,
  Layers,
  Lock,
  Network,
  Orbit,
  Radio,
  RotateCcw,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  Terminal,
  TestTube2,
  Workflow,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { AmbientAurora } from "../components/motion/AmbientAurora";
import { ShinyText } from "../components/motion/ShinyText";
import { HeroIllustration } from "../components/shared/HeroIllustration";
import { LiaRobotMascot } from "../components/study/LiaRobotMascot";
import { usePlatform } from "../context/PlatformContext";

type TopicIconName =
  | "binary"
  | "brain"
  | "code"
  | "terminal"
  | "server"
  | "git"
  | "globe"
  | "shield"
  | "network"
  | "cpu"
  | "harddrive"
  | "layers"
  | "database"
  | "braces"
  | "workflow"
  | "zap"
  | "compass"
  | "briefcase"
  | "sparkles"
  | "activity"
  | "test"
  | "bot"
  | "cloud"
  | "container"
  | "boxes"
  | "smartphone"
  | "filecode"
  | "radio"
  | "atom"
  | "lock"
  | "orbit";

interface StudyTopic {
  title: string;
  tag: string;
  icon: TopicIconName;
}

interface BranchGroup {
  id: string;
  shortLabel: string;
  label: string;
  realWorldSummary: string;
  careers: string[];
  icon: TopicIconName;
  cx: number;
  cy: number;
  labelAlign: "left" | "right";
  pathD: string;
  topics: StudyTopic[];
}

interface StudyPhase {
  id: string;
  number: string;
  badge: string;
  title: string;
  accent: string;
  leftBranch: BranchGroup;
  rightBranch: BranchGroup;
}

const TREE_WIDTH = 920;
const TREE_HEIGHT = 650;
const TOUR_STORAGE_KEY = "ce.studyTreeTourDone";

// Todos os galhos nascem da parte superior do tronco (acima de y=400), deixando o caule inferior limpo
const STUDY_PHASES: StudyPhase[] = [
  {
    id: "fase-1",
    number: "01",
    badge: "Fase 1",
    title: "Primeiros Passos & Ferramentas",
    accent: "var(--accent-primary)",
    leftBranch: {
      id: "f1-left",
      shortLabel: "Lógica & Código",
      label: "Lógica & Código Inicial",
      realWorldSummary:
        "No mundo real, é aqui que você aprende a quebrar problemas grandes em passos lógicos que qualquer linguagem entende.",
      careers: ["Dev Júnior", "QA", "Analista de Sistemas"],
      icon: "code",
      cx: 245,
      cy: 368,
      labelAlign: "left",
      pathD: "M 452 396 C 390 388, 320 374, 245 368",
      topics: [
        { title: "Lógica Matemática", tag: "Lógica", icon: "binary" },
        { title: "Raciocínio Computacional", tag: "Lógica", icon: "brain" },
        { title: "Primeiros Passos na Programação", tag: "Código", icon: "code" },
      ],
    },
    rightBranch: {
      id: "f1-right",
      shortLabel: "Terminal & Git",
      label: "Ferramentas & Cultura Digital",
      realWorldSummary:
        "Toda equipe profissional usa terminal, Linux e Git diariamente para trabalhar em grupo sem sobrescrever código.",
      careers: ["DevOps", "SRE", "Tech Lead"],
      icon: "terminal",
      cx: 675,
      cy: 368,
      labelAlign: "right",
      pathD: "M 468 396 C 530 388, 600 374, 675 368",
      topics: [
        { title: "Terminal & Linha de Comando", tag: "Ferramentas", icon: "terminal" },
        { title: "Fundamentos de Linux", tag: "Sistemas", icon: "server" },
        { title: "Controle de Versão com Git", tag: "Ferramentas", icon: "git" },
        { title: "Ética e Tecnologia na Sociedade", tag: "Cultura Tech", icon: "globe" },
        { title: "Privacidade Digital e LGPD", tag: "Cultura Tech", icon: "shield" },
      ],
    },
  },
  {
    id: "fase-2",
    number: "02",
    badge: "Fase 2",
    title: "Como os Computadores Funcionam",
    accent: "#38bdf8",
    leftBranch: {
      id: "f2-left",
      shortLabel: "Hardware & Lógica",
      label: "Matemática & Hardware",
      realWorldSummary:
        "Explica como processadores, memória e portas lógicas funcionam por baixo dos panos — essencial para performance e robótica.",
      careers: ["Eng. de Hardware", "Embarcados", "Robótica"],
      icon: "cpu",
      cx: 175,
      cy: 300,
      labelAlign: "left",
      pathD: "M 453 356 C 365 338, 270 314, 175 300",
      topics: [
        { title: "Matemática Discreta", tag: "Matemática", icon: "binary" },
        { title: "Teoria dos Grafos", tag: "Matemática", icon: "network" },
        { title: "Sistemas Digitais", tag: "Hardware", icon: "cpu" },
        { title: "Portas Lógicas e Álgebra Booleana", tag: "Hardware", icon: "zap" },
        { title: "Arquitetura de Computadores", tag: "Hardware", icon: "harddrive" },
        { title: "Componentes de Hardware", tag: "Hardware", icon: "boxes" },
      ],
    },
    rightBranch: {
      id: "f2-right",
      shortLabel: "SO & Redes",
      label: "Sistemas & Redes",
      realWorldSummary:
        "Mostra como servidores conversam pela internet (TCP/IP) e como o sistema operacional gerencia processos e arquivos.",
      careers: ["Infraestrutura", "Cloud", "Cibersegurança"],
      icon: "network",
      cx: 745,
      cy: 300,
      labelAlign: "right",
      pathD: "M 467 356 C 555 338, 650 314, 745 300",
      topics: [
        { title: "Sistemas Operacionais", tag: "Sistemas", icon: "server" },
        { title: "Redes de Computadores", tag: "Redes", icon: "network" },
        { title: "Protocolos da Internet (TCP/IP)", tag: "Redes", icon: "globe" },
      ],
    },
  },
  {
    id: "fase-3",
    number: "03",
    badge: "Fase 3",
    title: "Estruturas, Paradigmas & Dados",
    accent: "#06b6d4",
    leftBranch: {
      id: "f3-left",
      shortLabel: "Dados & Algoritmos",
      label: "Algoritmos, Matemática & Dados",
      realWorldSummary:
        "É o coração de bancos de dados e sistemas rápidos: escolher a estrutura certa faz uma busca levar milissegundos em vez de minutos.",
      careers: ["Data Engineer", "Data Scientist", "Backend"],
      icon: "database",
      cx: 165,
      cy: 226,
      labelAlign: "left",
      pathD: "M 454 316 C 365 288, 265 248, 165 226",
      topics: [
        { title: "Estruturas de Dados Lineares", tag: "Algoritmos", icon: "layers" },
        { title: "Árvores e Grafos na Prática", tag: "Algoritmos", icon: "git" },
        { title: "Álgebra Linear para Computação", tag: "Matemática", icon: "orbit" },
        { title: "Probabilidade e Estatística", tag: "Matemática", icon: "activity" },
        { title: "Modelagem de Dados", tag: "Dados", icon: "database" },
        { title: "Bancos Relacionais e SQL", tag: "Dados", icon: "database" },
      ],
    },
    rightBranch: {
      id: "f3-right",
      shortLabel: "Paradigmas & TS",
      label: "Teoria & Paradigmas de Código",
      realWorldSummary:
        "Ensina os estilos mais usados no mercado (OOP, funcional, tipagem com TypeScript) para escrever código limpo e sustentável.",
      careers: ["Fullstack", "Backend Java", "Frontend TS"],
      icon: "braces",
      cx: 755,
      cy: 226,
      labelAlign: "right",
      pathD: "M 466 316 C 555 288, 655 248, 755 226",
      topics: [
        { title: "Teoria da Computação", tag: "Fundamentos CS", icon: "atom" },
        { title: "Autômatos e Linguagens Formais", tag: "Fundamentos CS", icon: "workflow" },
        { title: "Orientação a Objetos com Java", tag: "Paradigmas", icon: "braces" },
        { title: "TypeScript e Tipagem Estática", tag: "Linguagens", icon: "filecode" },
        { title: "Programação Funcional", tag: "Paradigmas", icon: "sparkles" },
        { title: "Programação Concorrente e Assíncrona", tag: "Paradigmas", icon: "zap" },
      ],
    },
  },
  {
    id: "fase-4",
    number: "04",
    badge: "Fase 4",
    title: "Engenharia de Software & Web Moderna",
    accent: "#22c55e",
    leftBranch: {
      id: "f4-left",
      shortLabel: "Engenharia & UX",
      label: "Engenharia, Produto & UX",
      realWorldSummary:
        "Como transformar ideias de negócio em software real: levantar requisitos, trabalhar em sprints ágeis e criar interfaces acessíveis.",
      careers: ["Product Engineer", "UX Engineer", "Tech PM"],
      icon: "compass",
      cx: 230,
      cy: 158,
      labelAlign: "left",
      pathD: "M 455 268 C 390 232, 310 186, 230 158",
      topics: [
        { title: "Ciclo de Vida de Software", tag: "Engenharia", icon: "workflow" },
        { title: "Engenharia de Requisitos", tag: "Engenharia", icon: "compass" },
        { title: "Diagramas e Modelagem de Sistemas", tag: "Arquitetura", icon: "boxes" },
        { title: "Gestão de Projetos Tech", tag: "Gestão", icon: "briefcase" },
        { title: "Agilidade com Scrum e Kanban", tag: "Processos", icon: "layers" },
        { title: "UX para Desenvolvedores", tag: "Produto & UX", icon: "sparkles" },
        { title: "Acessibilidade Digital (a11y)", tag: "Produto & UX", icon: "shield" },
      ],
    },
    rightBranch: {
      id: "f4-right",
      shortLabel: "Web, APIs & QA",
      label: "Web Moderna, APIs & Qualidade",
      realWorldSummary:
        "Onde nascem os sites, apps web e APIs do dia a dia — com foco em velocidade, comunicação em tempo real e testes automáticos.",
      careers: ["Frontend", "Fullstack", "QA Automation"],
      icon: "globe",
      cx: 690,
      cy: 158,
      labelAlign: "right",
      pathD: "M 465 268 C 530 232, 610 186, 690 158",
      topics: [
        { title: "Protocolo HTTP e WebSockets", tag: "Web & APIs", icon: "globe" },
        { title: "APIs REST e Contratos de Dados", tag: "Web & APIs", icon: "server" },
        { title: "Interfaces Web Modernas (Front-End)", tag: "Front-End", icon: "code" },
        { title: "Performance Web e PWAs", tag: "Web Moderna", icon: "zap" },
        { title: "Edge Computing", tag: "Web Moderna", icon: "cloud" },
        { title: "Testes Automatizados e QA", tag: "Qualidade", icon: "test" },
      ],
    },
  },
  {
    id: "fase-5",
    number: "05",
    badge: "Fase 5",
    title: "Dados, IA Aplicada & Backend Escalável",
    accent: "#a855f7",
    leftBranch: {
      id: "f5-left",
      shortLabel: "IA, LLMs & Dados",
      label: "Dados, Big Data & IA",
      realWorldSummary:
        "O ramo da inteligência artificial moderna: construir sistemas com LLMs, busca semântica (RAG), agentes e pipelines de dados.",
      careers: ["AI Engineer", "ML Engineer", "Data Scientist"],
      icon: "bot",
      cx: 322,
      cy: 100,
      labelAlign: "left",
      pathD: "M 456 218 C 415 178, 368 130, 322 100",
      topics: [
        { title: "Python para Análise de Dados", tag: "Dados", icon: "activity" },
        { title: "Prototipação Ágil com Python", tag: "Python", icon: "code" },
        { title: "Machine Learning Aplicado", tag: "IA & ML", icon: "brain" },
        { title: "LLMs e Engenharia de Prompts", tag: "IA Moderna", icon: "bot" },
        { title: "RAG e Busca Semântica", tag: "IA Moderna", icon: "sparkles" },
        { title: "Agentes Autônomos de IA", tag: "IA Moderna", icon: "bot" },
        { title: "MLOps e Avaliação de Modelos", tag: "IA & Ops", icon: "workflow" },
        { title: "Bancos Vetoriais", tag: "Dados & IA", icon: "database" },
        { title: "Big Data e Pipelines", tag: "Big Data", icon: "layers" },
      ],
    },
    rightBranch: {
      id: "f5-right",
      shortLabel: "Backend & Distribuídos",
      label: "Backend, Algoritmos & Arquitetura",
      realWorldSummary:
        "Prepara você para arquitetar backends que aguentam milhões de usuários, usando filas, microsserviços e bancos NoSQL.",
      careers: ["Backend Sênior", "Arquiteto de Software", "Staff Eng."],
      icon: "boxes",
      cx: 598,
      cy: 100,
      labelAlign: "right",
      pathD: "M 464 218 C 505 178, 552 130, 598 100",
      topics: [
        { title: "Análise de Algoritmos", tag: "Algoritmos", icon: "binary" },
        { title: "Complexidade Computacional", tag: "Algoritmos", icon: "cpu" },
        { title: "Mensageria e Filas de Eventos", tag: "Backend", icon: "radio" },
        { title: "Bancos Não Relacionais (NoSQL)", tag: "Dados", icon: "database" },
        { title: "Design Patterns em Java", tag: "Arquitetura", icon: "braces" },
        { title: "Arquitetura de Software", tag: "Arquitetura", icon: "boxes" },
        { title: "Sistemas Distribuídos", tag: "Distribuídos", icon: "network" },
      ],
    },
  },
  {
    id: "fase-6",
    number: "06",
    badge: "Fase 6",
    title: "Infraestrutura, Sistemas, Segurança & Fronteiras",
    accent: "#f59e0b",
    leftBranch: {
      id: "f6-left",
      shortLabel: "C, Rust & AppSec",
      label: "Sistemas, Hardware & Segurança",
      realWorldSummary:
        "Para quem quer ir fundo: programar em C e Rust, proteger sistemas contra invasões e criar software embarcado de alta performance.",
      careers: ["Systems Eng. (C/Rust)", "AppSec", "Eng. Embarcados"],
      icon: "shield",
      cx: 404,
      cy: 54,
      labelAlign: "left",
      pathD: "M 457 172 C 444 126, 424 84, 404 54",
      topics: [
        { title: "Programação de Sistemas em C", tag: "Baixo Nível", icon: "terminal" },
        { title: "Memória e Ponteiros em C", tag: "Baixo Nível", icon: "cpu" },
        { title: "Sistemas Seguros com Rust", tag: "Sistemas", icon: "shield" },
        { title: "Sistemas Embarcados e Microcontroladores", tag: "Hardware", icon: "harddrive" },
        { title: "Segurança em Aplicações (AppSec)", tag: "Segurança", icon: "lock" },
        { title: "Autenticação (OAuth e JWT)", tag: "Segurança", icon: "shield" },
        { title: "Compiladores na Prática", tag: "Fundamentos CS", icon: "filecode" },
        { title: "Computação Gráfica e Visão", tag: "Gráficos", icon: "sparkles" },
      ],
    },
    rightBranch: {
      id: "f6-right",
      shortLabel: "Cloud, Mobile & Quântica",
      label: "Cloud, Mobile & Novas Fronteiras",
      realWorldSummary:
        "Coloca tudo no ar em escala global com Docker, Kubernetes e Cloud, além de apps Mobile e tecnologias do futuro como Quântica.",
      careers: ["Cloud / SRE", "Mobile Dev", "P&D / Quântica"],
      icon: "cloud",
      cx: 516,
      cy: 54,
      labelAlign: "right",
      pathD: "M 463 172 C 476 126, 496 84, 516 54",
      topics: [
        { title: "Containers com Docker", tag: "DevOps", icon: "container" },
        { title: "Pipelines de CI/CD", tag: "DevOps", icon: "workflow" },
        { title: "Orquestração com Kubernetes", tag: "Cloud & SRE", icon: "boxes" },
        { title: "Infraestrutura como Código (IaC)", tag: "Cloud & SRE", icon: "code" },
        { title: "Observabilidade e Monitoramento", tag: "Cloud & SRE", icon: "activity" },
        { title: "Arquitetura Cloud e FinOps", tag: "Cloud", icon: "cloud" },
        { title: "IoT e Automação com Python", tag: "IoT & Cloud", icon: "radio" },
        { title: "Desenvolvimento Mobile Android", tag: "Mobile", icon: "smartphone" },
        { title: "Apps Multiplataforma", tag: "Multiplataforma", icon: "smartphone" },
        { title: "Computação Quântica", tag: "Fronteiras", icon: "atom" },
        { title: "Criptografia Pós-Quântica", tag: "Fronteiras", icon: "lock" },
      ],
    },
  },
];

function renderTopicIcon(name: TopicIconName, color: string, size = 15) {
  const props = { size, style: { color, flexShrink: 0 } };
  switch (name) {
    case "binary":
      return <Binary {...props} />;
    case "brain":
      return <Brain {...props} />;
    case "code":
      return <Code2 {...props} />;
    case "terminal":
      return <Terminal {...props} />;
    case "server":
      return <Server {...props} />;
    case "git":
      return <GitBranch {...props} />;
    case "globe":
      return <Globe {...props} />;
    case "shield":
      return <Shield {...props} />;
    case "network":
      return <Network {...props} />;
    case "cpu":
      return <Cpu {...props} />;
    case "harddrive":
      return <HardDrive {...props} />;
    case "layers":
      return <Layers {...props} />;
    case "database":
      return <Database {...props} />;
    case "braces":
      return <Braces {...props} />;
    case "workflow":
      return <Workflow {...props} />;
    case "zap":
      return <Zap {...props} />;
    case "compass":
      return <Compass {...props} />;
    case "briefcase":
      return <Briefcase {...props} />;
    case "sparkles":
      return <Sparkles {...props} />;
    case "activity":
      return <Activity {...props} />;
    case "test":
      return <TestTube2 {...props} />;
    case "bot":
      return <Bot {...props} />;
    case "cloud":
      return <Cloud {...props} />;
    case "container":
      return <Container {...props} />;
    case "boxes":
      return <Boxes {...props} />;
    case "smartphone":
      return <Smartphone {...props} />;
    case "filecode":
      return <FileCode2 {...props} />;
    case "radio":
      return <Radio {...props} />;
    case "atom":
      return <Atom {...props} />;
    case "lock":
      return <Lock {...props} />;
    case "orbit":
      return <Orbit {...props} />;
  }
}

export const CoursesPage: React.FC = () => {
  const { resetEpoch } = usePlatform();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [tourStepIdx, setTourStepIdx] = useState<number | null>(null);
  const [tourDone, setTourDone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.removeItem("ce_study_tree_tour_done_v1");
      return window.localStorage.getItem(TOUR_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [offerDismissed, setOfferDismissed] = useState(false);
  const [zoom, setZoom] = useState(1);

  const bottomHeroRef = useRef<HTMLElement | null>(null);
  const inspectorRef = useRef<HTMLDivElement | null>(null);

  // Reinicia o estado da Lia quando o usuário reseta toda a plataforma
  useEffect(() => {
    if (resetEpoch === 0) return;
    setTourDone(false);
    setTourStepIdx(null);
    setOfferDismissed(false);
    setSelectedBranchId(null);
  }, [resetEpoch]);

  const { allBranches, totalTopics } = useMemo(() => {
    let step = 0;
    const list: Array<{
      phase: StudyPhase;
      branch: BranchGroup;
      topics: Array<StudyTopic & { stepLabel: string }>;
    }> = [];

    for (const phase of STUDY_PHASES) {
      for (const branch of [phase.leftBranch, phase.rightBranch]) {
        const numbered = branch.topics.map(t => {
          step += 1;
          return { ...t, stepLabel: String(step).padStart(2, "0") };
        });
        list.push({ phase, branch, topics: numbered });
      }
    }

    return { allBranches: list, totalTopics: step };
  }, []);

  const tourEntry = tourStepIdx !== null ? allBranches[tourStepIdx] ?? null : null;
  const activeBranchId = tourEntry ? tourEntry.branch.id : selectedBranchId;

  const selectedEntry = useMemo(
    () => allBranches.find(item => item.branch.id === selectedBranchId) ?? null,
    [allBranches, selectedBranchId]
  );

  // Inicia a página lá embaixo (no Hero / raiz da árvore)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      bottomHeroRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const finishTour = () => {
    setTourStepIdx(null);
    setTourDone(true);
    try {
      window.localStorage.setItem(TOUR_STORAGE_KEY, "1");
    } catch {
      // ignore storage errors
    }
  };

  const startLiaTour = () => {
    setSelectedBranchId(null);
    setOfferDismissed(false);
    setTourStepIdx(0);
  };

  const handleSelectBranch = (branchId: string) => {
    setTourStepIdx(null);
    const next = selectedBranchId === branchId ? null : branchId;
    setSelectedBranchId(next);
    if (next) {
      requestAnimationFrame(() => {
        inspectorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Controles flutuantes de Zoom (abaixo da Topbar) */}
      <div
        style={{
          position: "sticky",
          top: "calc(var(--topbar-height, 64px) + 12px)",
          zIndex: 25,
          display: "flex",
          justifyContent: "flex-end",
          pointerEvents: "none",
        }}
      >
        <div
          className="ce-surface"
          style={{
            pointerEvents: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "5px 8px",
            borderRadius: 999,
            border: "1px solid var(--border-accent)",
            boxShadow: "0 10px 26px rgba(0, 0, 0, 0.25)",
          }}
        >
          <button
            type="button"
            className="ce-icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() => setZoom(z => Math.max(0.7, Number((z - 0.1).toFixed(2))))}
            aria-label="Diminuir zoom da árvore"
            disabled={zoom <= 0.7}
          >
            <ZoomOut size={14} />
          </button>
          <span style={{ fontSize: 11.5, fontWeight: 700, minWidth: 42, textAlign: "center" }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className="ce-icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() => setZoom(z => Math.min(1.2, Number((z + 0.1).toFixed(2))))}
            aria-label="Aumentar zoom da árvore"
            disabled={zoom >= 1.2}
          >
            <ZoomIn size={14} />
          </button>
          {zoom !== 1 && (
            <button
              type="button"
              className="ce-icon-btn"
              style={{ width: 28, height: 28 }}
              onClick={() => setZoom(1)}
              aria-label="Resetar zoom"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Árvore Orgânica Interativa */}
      <section
        className="ce-surface"
        aria-label="Árvore interativa do plano de estudos"
        style={{
          padding: "24px 14px 18px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          background:
            "radial-gradient(circle at 50% 25%, color-mix(in srgb, var(--accent-secondary) 10%, transparent), transparent 55%), radial-gradient(circle at 50% 88%, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 55%), var(--bg-surface)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: TREE_WIDTH,
            aspectRatio: `${TREE_WIDTH} / ${TREE_HEIGHT}`,
            position: "relative",
            transform: `scale(${zoom})`,
            transformOrigin: "bottom center",
            transition: "transform 0.2s ease",
          }}
        >
          {/* SVG da árvore com caule limpo embaixo e copa frondosa em cima */}
          <svg
            viewBox={`0 0 ${TREE_WIDTH} ${TREE_HEIGHT}`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              overflow: "visible",
            }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="ce-tree-trunk-grad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>

            {/* Copa frondosa monocromática (nuvens suaves no tom do tema) */}
            <g opacity="0.14">
              <ellipse cx="460" cy="215" rx="345" ry="175" fill="var(--accent-primary)" />
              <ellipse cx="235" cy="275" rx="185" ry="125" fill="var(--accent-primary)" />
              <ellipse cx="685" cy="275" rx="185" ry="125" fill="var(--accent-primary)" />
              <ellipse cx="340" cy="125" rx="175" ry="95" fill="var(--accent-primary)" />
              <ellipse cx="580" cy="125" rx="175" ry="95" fill="var(--accent-primary)" />
              <ellipse cx="460" cy="75" rx="150" ry="70" fill="var(--accent-primary)" />
            </g>

            {/* Solo / Gramado suave na base */}
            <path
              d="M 210 622 Q 460 584 710 622 Z"
              fill="color-mix(in srgb, var(--accent-primary) 18%, transparent)"
            />
            <path
              d="M 240 622 Q 460 590 680 622"
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.55"
            />

            {/* Caule sólido e limpo subindo da raiz até a copa */}
            <path
              d="M 412 618 C 434 550, 444 470, 450 380 L 456 164 L 464 164 L 470 380 C 476 470, 486 550, 508 618 Z"
              fill="url(#ce-tree-trunk-grad)"
              opacity="0.9"
            />

            {/* Galho de apoio da gangorra (estendido para prender as duas cordas) */}
            {tourDone && tourStepIdx === null && (
              <path
                d="M 468 424 C 508 424, 550 426, 594 426"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.88"
              />
            )}

            {/* Galhos orgânicos curvados saindo apenas da parte superior do tronco */}
            {allBranches.map(({ phase, branch }) => {
              const isSelected = activeBranchId === branch.id;
              const isDimmed = activeBranchId !== null && !isSelected;

              return (
                <path
                  key={`path-${branch.id}`}
                  d={branch.pathD}
                  fill="none"
                  stroke={isSelected ? phase.accent : "url(#ce-tree-trunk-grad)"}
                  strokeWidth={isSelected ? 8.5 : 6.5}
                  strokeLinecap="round"
                  opacity={isDimmed ? 0.25 : isSelected ? 1 : 0.84}
                  style={{ transition: "opacity 0.2s ease, stroke-width 0.2s ease" }}
                />
              );
            })}
          </svg>

          {/* Nós circulares clicáveis nas pontas dos galhos */}
          {allBranches.map(({ phase, branch }) => {
            const isSelected = activeBranchId === branch.id;
            const isDimmed = activeBranchId !== null && !isSelected;
            const leftPct = (branch.cx / TREE_WIDTH) * 100;
            const topPct = (branch.cy / TREE_HEIGHT) * 100;

            return (
              <div
                key={`node-${branch.id}`}
                style={{
                  position: "absolute",
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: isSelected ? 10 : 3,
                  opacity: isDimmed ? 0.42 : 1,
                  transition: "opacity 0.2s ease",
                }}
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.14 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelectBranch(branch.id)}
                  aria-label={`${phase.badge}: ${branch.label}`}
                  aria-pressed={isSelected}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    cursor: "pointer",
                    background: isSelected
                      ? phase.accent
                      : `color-mix(in srgb, ${phase.accent} 18%, var(--bg-surface-elevated))`,
                    border: `2.5px solid ${phase.accent}`,
                    boxShadow: isSelected
                      ? `0 0 24px ${phase.accent}`
                      : `0 4px 14px color-mix(in srgb, ${phase.accent} 32%, transparent)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  {renderTopicIcon(
                    branch.icon,
                    isSelected ? "#ffffff" : phase.accent,
                    17
                  )}
                </motion.button>

                {/* Rótulo com contraste em qualquer tema */}
                <button
                  type="button"
                  onClick={() => handleSelectBranch(branch.id)}
                  style={{
                    position: "absolute",
                    cursor: "pointer",
                    ...(branch.labelAlign === "left"
                      ? { right: 50, top: "50%", transform: "translateY(-50%)", textAlign: "right" }
                      : { left: 50, top: "50%", transform: "translateY(-50%)", textAlign: "left" }),
                    padding: "5px 11px",
                    borderRadius: 999,
                    background: isSelected
                      ? phase.accent
                      : `color-mix(in srgb, ${phase.accent} 14%, var(--bg-surface))`,
                    border: isSelected
                      ? `1px solid ${phase.accent}`
                      : `1px solid color-mix(in srgb, ${phase.accent} 45%, transparent)`,
                    color: isSelected ? "#ffffff" : "var(--text-primary)",
                    fontSize: 11.5,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.18)",
                  }}
                >
                  {branch.shortLabel}
                </button>
              </div>
            );
          })}

          {/* 1) Primeira vez: Lia no pé da árvore oferecendo o tour */}
          {!tourDone && tourStepIdx === null && (
            <div
              style={{
                position: "absolute",
                left: "36%",
                bottom: 22,
                transform: "translateX(-100%)",
                zIndex: 15,
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
              }}
            >
              {!offerDismissed && (
                <div
                  className="ce-surface"
                  style={{
                    width: "min(250px, 46vw)",
                    padding: "11px 13px",
                    borderRadius: 14,
                    border: "1.5px solid var(--border-accent)",
                    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.25)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent-secondary)" }}>
                      Lia · Guia da Árvore
                    </span>
                    <button
                      type="button"
                      className="ce-icon-btn"
                      style={{ width: 20, height: 20 }}
                      onClick={() => setOfferDismissed(true)}
                      aria-label="Dispensar convite da Lia"
                    >
                      <X size={11} />
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    Oi! Quer que eu dê um passeio pela árvore explicando o que cada ramo faz no mundo real?
                  </p>
                  <button
                    type="button"
                    className="ce-btn ce-btn-primary ce-btn-sm"
                    onClick={startLiaTour}
                  >
                    <Sparkles size={12} />
                    <span>Sim, mostrar tour!</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={startLiaTour}
                title="Iniciar tour com a Lia"
                style={{
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  padding: 0,
                  width: 68,
                  height: 78,
                  flexShrink: 0,
                }}
              >
                <LiaRobotMascot
                  expression="happy"
                  speaking={!offerDismissed}
                  visible
                  pointing="right"
                />
              </button>
            </div>
          )}

          {/* 2) Depois que o tour foi concluído: Lia balançando no balanço pendurado no galho */}
          {tourDone && tourStepIdx === null && (
            <div
              style={{
                position: "absolute",
                left: `${(542 / TREE_WIDTH) * 100}%`,
                top: `${(426 / TREE_HEIGHT) * 100}%`,
                transform: "translateX(-50%)",
                zIndex: 14,
              }}
            >
              <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  transformOrigin: "top center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={startLiaTour}
                  title="Clique na Lia para refazer o tour pela árvore"
                  style={{
                    position: "relative",
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                    padding: 0,
                    width: 74,
                    height: 118,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  {/* Duas cordas presas do galho até as pontas do assento */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 5,
                      width: 2,
                      height: 112,
                      background: "var(--accent-secondary)",
                      opacity: 0.85,
                    }}
                  />
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 5,
                      width: 2,
                      height: 112,
                      background: "var(--accent-secondary)",
                      opacity: 0.85,
                    }}
                  />

                  {/* Lia sentada entre as cordas */}
                  <div style={{ width: 60, height: 68, position: "relative", zIndex: 1, marginBottom: -8 }}>
                    <LiaRobotMascot expression="happy" speaking={false} visible />
                  </div>

                  {/* Assento */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "relative",
                      zIndex: 2,
                      width: 74,
                      height: 8,
                      borderRadius: 999,
                      background: "var(--accent-primary)",
                      border: "1px solid var(--border-accent)",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.28)",
                    }}
                  />
                </button>
              </motion.div>
            </div>
          )}

          {/* 3) Durante o tour: Lia caminhando ao lado interno de cada nó (sem cobrir o nó ou sair da tela) */}
          <AnimatePresence>
            {tourEntry && (() => {
              const isRightSide = tourEntry.branch.cx > TREE_WIDTH / 2;
              return (
                <motion.div
                  key="lia-tree-guide"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 210, damping: 24 }}
                  style={{
                    position: "absolute",
                    ...(isRightSide
                      ? {
                          right: `calc(${((TREE_WIDTH - tourEntry.branch.cx) / TREE_WIDTH) * 100}% + 34px)`,
                          flexDirection: "row-reverse",
                        }
                      : {
                          left: `calc(${(tourEntry.branch.cx / TREE_WIDTH) * 100}% + 34px)`,
                          flexDirection: "row",
                        }),
                    top: `${(tourEntry.branch.cy / TREE_HEIGHT) * 100}%`,
                    transform: "translateY(-50%)",
                    zIndex: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    pointerEvents: "auto",
                  }}
                >
                  <div style={{ width: 62, height: 72, flexShrink: 0 }}>
                    <LiaRobotMascot
                      expression="happy"
                      speaking
                      visible
                      pointing={isRightSide ? "right" : "left"}
                    />
                  </div>

                  {/* Balão da Lia explicando o ramo no mundo real */}
                  <div
                    className="ce-surface"
                    style={{
                      width: "min(270px, 50vw)",
                      padding: "11px 13px",
                      borderRadius: 14,
                      border: `1.5px solid ${tourEntry.phase.accent}`,
                      boxShadow: "0 14px 32px rgba(0, 0, 0, 0.34)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 7,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: tourEntry.phase.accent }}>
                        Lia · {tourEntry.phase.badge} ({(tourStepIdx ?? 0) + 1}/{allBranches.length})
                      </span>
                      <button
                        type="button"
                        className="ce-icon-btn"
                        style={{ width: 22, height: 22 }}
                        onClick={() => setTourStepIdx(null)}
                        aria-label="Fechar tour da Lia"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <strong style={{ fontSize: 13, color: "var(--text-primary)" }}>
                      {tourEntry.branch.label}
                    </strong>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.45 }}>
                      {tourEntry.branch.realWorldSummary}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", gap: 6, paddingTop: 4 }}>
                      <button
                        type="button"
                        className="ce-btn ce-btn-ghost ce-btn-sm"
                        disabled={(tourStepIdx ?? 0) === 0}
                        onClick={() => setTourStepIdx(i => (i !== null && i > 0 ? i - 1 : i))}
                      >
                        <ArrowLeft size={12} />
                        <span>Anterior</span>
                      </button>

                      {(tourStepIdx ?? 0) < allBranches.length - 1 ? (
                        <button
                          type="button"
                          className="ce-btn ce-btn-primary ce-btn-sm"
                          onClick={() =>
                            setTourStepIdx(i =>
                              i !== null && i < allBranches.length - 1 ? i + 1 : i
                            )
                          }
                        >
                          <span>Próximo</span>
                          <ArrowRight size={12} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="ce-btn ce-btn-primary ce-btn-sm"
                          onClick={finishTour}
                        >
                          <Check size={12} />
                          <span>Concluir</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>

        <span style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
          Clique em qualquer nó da copa para abrir os módulos do ramo
        </span>
      </section>

      {/* Painel expansível do ramo selecionado */}
      <div ref={inspectorRef}>
        <AnimatePresence mode="wait">
          {selectedEntry && (
            <motion.section
              key={selectedEntry.branch.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="ce-surface"
              aria-label={`Detalhes do ramo ${selectedEntry.branch.label}`}
              style={{
                padding: "18px 20px",
                border: `1.5px solid color-mix(in srgb, ${selectedEntry.phase.accent} 55%, transparent)`,
                boxShadow: `0 12px 30px color-mix(in srgb, ${selectedEntry.phase.accent} 16%, transparent)`,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: selectedEntry.phase.accent,
                    }}
                  >
                    {selectedEntry.phase.badge} · {selectedEntry.phase.title}
                  </span>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                    {selectedEntry.branch.label}
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
                    {selectedEntry.branch.realWorldSummary}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 2 }}>
                    <Briefcase size={12} style={{ color: "var(--text-muted)" }} />
                    {selectedEntry.branch.careers.map(career => (
                      <span
                        key={career}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 9px",
                          borderRadius: 999,
                          background: `color-mix(in srgb, ${selectedEntry.phase.accent} 14%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${selectedEntry.phase.accent} 35%, transparent)`,
                          color: "var(--text-primary)",
                        }}
                      >
                        {career}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="ce-icon-btn"
                  onClick={() => setSelectedBranchId(null)}
                  aria-label="Fechar detalhes do ramo"
                  style={{ width: 32, height: 32 }}
                >
                  <X size={15} />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 10,
                }}
              >
                {selectedEntry.topics.map(topic => (
                  <div
                    key={topic.title}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 11,
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 7,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          background: `color-mix(in srgb, ${selectedEntry.phase.accent} 16%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${selectedEntry.phase.accent} 40%, transparent)`,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {renderTopicIcon(topic.icon, selectedEntry.phase.accent, 14)}
                      </span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: selectedEntry.phase.accent }}>
                        #{topic.stepLabel}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.35 }}>
                      {topic.title}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: "auto" }}>
                      <span style={{ color: "var(--text-secondary)" }}>{topic.tag}</span>
                      <span style={{ color: "var(--text-muted)" }}>Em breve</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Hero lá embaixo (Raiz da Árvore / Ponto de Partida) */}
      <section
        ref={bottomHeroRef}
        className="ce-hero-banner ce-projects-hero ce-hero-with-art"
      >
        <AmbientAurora speed={0.5} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <span
              className="ce-badge"
              style={{
                background: "color-mix(in srgb, var(--accent-warning, #f59e0b) 14%, transparent)",
                borderColor: "color-mix(in srgb, var(--accent-warning, #f59e0b) 42%, transparent)",
                color: "var(--accent-warning, #d97706)",
              }}
            >
              <Construction size={12} aria-hidden="true" />
              <span>Em construção</span>
            </span>
            <span
              className="ce-badge"
              style={{
                borderColor: "var(--border-accent)",
                color: "var(--accent-secondary)",
              }}
            >
              <BookOpen size={12} aria-hidden="true" />
              <ShinyText text="Raiz da Árvore · Explore a copa acima" />
            </span>
          </div>

          <h1 className="ce-hero-title">Plano de Estudos</h1>

          <p className="ce-hero-sub" style={{ marginBottom: 0 }}>
            Árvore visual de conhecimento com {STUDY_PHASES.length} fases e {totalTopics} módulos. Clique nos nós da copa ou converse com a Lia no pé da árvore para conhecer o papel de cada ramo no mundo real.
          </p>
        </div>

        <div className="ce-hero-right-cluster">
          <div className="ce-hero-art-slot" aria-hidden="true">
            <HeroIllustration variant="study-plan" />
          </div>

          <div className="ce-proj-hero-metrics">
            <div className="ce-metric-tile">
              <span>Ramos</span>
              <strong>{allBranches.length}</strong>
            </div>
            <div className="ce-metric-tile">
              <span>Módulos</span>
              <strong>{totalTopics}</strong>
            </div>
            <div className="ce-metric-tile">
              <span>Status</span>
              <strong style={{ color: "var(--accent-warning, #d97706)", fontSize: 15, whiteSpace: "nowrap" }}>
                Em breve
              </strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
