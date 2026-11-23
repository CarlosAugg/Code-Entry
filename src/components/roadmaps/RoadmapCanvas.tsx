import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  CheckCircle2,
  CircleDashed,
  Eye,
  EyeOff,
  Flag,
  FolderGit2,
  GitBranch,
  Play,
  SkipForward,
  Sparkles,
  X,
} from "lucide-react";
import { TRACK_MAP } from "../../data/tracks";
import { TechIcon } from "../shared/TechIcon";
import { computeRoadmapNodeState } from "../../data/roadmaps";
import type { BootstrapPayload, RoadmapTopicStatus } from "../../types/progress";
import type {
  RoadmapDefinition,
  RoadmapNode,
  RoadmapPriority,
  ComputedRoadmapNodeState,
} from "../../types/roadmap";

interface RoadmapCanvasProps {
  roadmap: RoadmapDefinition;
  data: BootstrapPayload;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onSetStatus?: (roadmapId: string, topicId: string, status: RoadmapTopicStatus) => void;
  activePathwayId?: string | null;
  onClearPathway?: () => void;
  priorityFilter?: RoadmapPriority | "all";
  onChangePriorityFilter?: (next: RoadmapPriority | "all") => void;
  focusHighlightNextId?: string | null;
}

interface ComputedEdge {
  id: string;
  fromId: string;
  toId: string;
  d: string;
  tone: "default" | "active" | "completed" | "dimmed";
  dashed: boolean;
  arrow: boolean;
}

interface FlowSlot {
  topic: RoadmapNode;
  milestones: RoadmapNode[];
}

interface FlowRow {
  rowIndex: number;
  direction: "ltr" | "rtl";
  /** Slots na ordem visual da esquerda para a direita (3 colunas). */
  cells: Array<FlowSlot | null>;
  /** Slots na ordem lógica de leitura/fluxo. */
  orderedSlots: FlowSlot[];
  /** Stage principal que inicia ou domina esta linha, para exibir marco SVG ilustrativo. */
  stageStart?: {
    id: string;
    label: string;
    title: string;
    order: number;
  };
}

const TrailStageIllustration: React.FC<{ order: number; accent: string }> = ({ order, accent }) => {
  const idx = ((order - 1) % 4 + 4) % 4;
  if (idx === 0) {
    return (
      <svg viewBox="0 0 44 32" className="ce-rm-trail-svg" aria-hidden="true">
        <rect x="3" y="4" width="38" height="24" rx="5" fill="rgba(148,163,184,0.1)" stroke={accent} strokeWidth="1.6" />
        <line x1="3" y1="11" x2="41" y2="11" stroke={accent} strokeWidth="1.2" strokeOpacity="0.6" />
        <circle cx="8" cy="7.5" r="1.3" fill={accent} />
        <circle cx="12.5" cy="7.5" r="1.3" fill="rgba(148,163,184,0.6)" />
        <rect x="8" y="15" width="12" height="9" rx="2" fill={accent} fillOpacity="0.22" stroke={accent} strokeWidth="1.2" />
        <line x1="24" y1="16.5" x2="36" y2="16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
        <line x1="24" y1="21.5" x2="32" y2="21.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
      </svg>
    );
  }
  if (idx === 1) {
    return (
      <svg viewBox="0 0 44 32" className="ce-rm-trail-svg" aria-hidden="true">
        <circle cx="11" cy="9" r="3.2" fill={accent} fillOpacity="0.25" stroke={accent} strokeWidth="1.6" />
        <circle cx="11" cy="23" r="3.2" fill="rgba(148,163,184,0.15)" stroke="currentColor" strokeWidth="1.6" opacity="0.75" />
        <circle cx="32" cy="16" r="3.5" fill={accent} fillOpacity="0.3" stroke={accent} strokeWidth="1.6" />
        <path d="M14.2 9 H21 C24.5 9 24.5 16 28.5 16" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M14.2 23 H21 C24.5 23 24.5 16 28.5 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
      </svg>
    );
  }
  if (idx === 2) {
    return (
      <svg viewBox="0 0 44 32" className="ce-rm-trail-svg" aria-hidden="true">
        <rect x="5" y="5" width="16" height="9" rx="2.5" fill="rgba(148,163,184,0.1)" stroke={accent} strokeWidth="1.5" />
        <rect x="5" y="18" width="16" height="9" rx="2.5" fill="rgba(148,163,184,0.1)" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
        <circle cx="9.5" cy="9.5" r="1.4" fill={accent} />
        <circle cx="9.5" cy="22.5" r="1.4" fill="#22c55e" />
        <ellipse cx="32.5" cy="10" rx="6.5" ry="2.8" fill={accent} fillOpacity="0.22" stroke={accent} strokeWidth="1.5" />
        <path d="M26 10 V22 C26 23.6 28.9 24.8 32.5 24.8 C36.1 24.8 39 23.6 39 22 V10" fill="none" stroke={accent} strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 44 32" className="ce-rm-trail-svg" aria-hidden="true">
      <path
        d="M14 23 H32 C35.3 23 38 20.5 38 17.3 C38 14.4 35.8 12 33 11.7 C32 7.8 28.5 5 24.3 5 C19.5 5 15.6 8.6 15.2 13.2 C11.8 13.7 9.2 16.5 9.2 19.9 C9.2 21.8 11.3 23 14 23 Z"
        fill={accent}
        fillOpacity="0.16"
        stroke={accent}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M23.5 19 V11.5 M20.5 14.5 L23.5 11.5 L26.5 14.5" fill="none" stroke={accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

function roundedPolylinePath(points: Array<{ x: number; y: number }>, radius = 10): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    const len1 = Math.hypot(dx1, dy1);
    const len2 = Math.hypot(dx2, dy2);
    if (len1 < 0.5 || len2 < 0.5) {
      d += ` L ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
      continue;
    }

    const r = Math.min(radius, len1 / 2, len2 / 2);
    const p1x = curr.x - (dx1 / len1) * r;
    const p1y = curr.y - (dy1 / len1) * r;
    const p2x = curr.x + (dx2 / len2) * r;
    const p2y = curr.y + (dy2 / len2) * r;

    d += ` L ${p1x.toFixed(1)} ${p1y.toFixed(1)} Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)} ${p2x.toFixed(1)} ${p2y.toFixed(1)}`;
  }

  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
}

const ROW_COLS = 3;
const STATUS_CYCLE: RoadmapTopicStatus[] = [
  "not_started",
  "in_progress",
  "completed",
  "skipped",
];
const STATUS_LABELS: Record<RoadmapTopicStatus, string> = {
  not_started: "Pendente",
  in_progress: "Estudando",
  completed: "Concluído",
  skipped: "Pulado",
};

export const RoadmapCanvas: React.FC<RoadmapCanvasProps> = ({
  roadmap,
  data,
  selectedNodeId,
  onSelectNode,
  onSetStatus,
  activePathwayId = null,
  onClearPathway,
  priorityFilter = "all",
  focusHighlightNextId = null,
}) => {
  const svgInstanceId = useId().replace(/:/g, "");
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const branchRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isolatePathway, setIsolatePathway] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [edges, setEdges] = useState<ComputedEdge[]>([]);

  const nodeStateMap = useMemo(() => {
    const map = new Map<string, ComputedRoadmapNodeState>();
    for (const node of roadmap.nodes) {
      map.set(node.id, computeRoadmapNodeState(node, data));
    }
    return map;
  }, [roadmap.nodes, data]);

  const activePathway = useMemo(() => {
    if (!activePathwayId) return null;
    return roadmap.pathways.find(p => p.id === activePathwayId) || null;
  }, [activePathwayId, roadmap.pathways]);

  const activePathwayStepMap = useMemo(() => {
    if (!activePathway) return null;
    const map = new Map<string, number>();
    activePathway.nodeIds.forEach((id, idx) => {
      map.set(id, idx + 1);
    });
    return map;
  }, [activePathway]);

  useEffect(() => {
    if (!activePathwayId) {
      setIsolatePathway(false);
    }
  }, [activePathwayId]);

  const rootNodeIds = useMemo(() => {
    const roots = roadmap.nodes.filter(n => n.prerequisites.length === 0).map(n => n.id);
    return new Set(roots.length > 0 ? [roots[0]] : roadmap.nodes[0] ? [roadmap.nodes[0].id] : []);
  }, [roadmap.nodes]);

  const isNodeVisibleInCanvas = useCallback(
    (node: RoadmapNode) => {
      if (isolatePathway && activePathwayStepMap && !activePathwayStepMap.has(node.id)) {
        return false;
      }
      return true;
    },
    [isolatePathway, activePathwayStepMap]
  );

  const isNodeHighlighted = useCallback(
    (node: RoadmapNode) => {
      const priority = node.priority || "recommended";
      if (priorityFilter !== "all" && priority !== priorityFilter) {
        return false;
      }
      if (activePathwayStepMap && !activePathwayStepMap.has(node.id)) {
        return false;
      }
      return true;
    },
    [priorityFilter, activePathwayStepMap]
  );

  const stageMap = useMemo(
    () => new Map(roadmap.stages.map(s => [s.id, s])),
    [roadmap.stages]
  );

  const flowRows: FlowRow[] = useMemo(() => {
    const visibleNodes = roadmap.nodes.filter(isNodeVisibleInCanvas);
    const slots: FlowSlot[] = [];
    const slotById = new Map<string, FlowSlot>();

    for (const node of visibleNodes) {
      const isMilestone = node.kind === "checkpoint" || node.kind === "project";
      if (!isMilestone || slots.length === 0) {
        const slot: FlowSlot = { topic: node, milestones: [] };
        slots.push(slot);
        slotById.set(node.id, slot);
      } else {
        let parentSlot: FlowSlot | undefined;
        // Prefere o tópico mais recente que aponta diretamente para este marco via nextIds ou prerequisites
        for (let i = slots.length - 1; i >= 0; i -= 1) {
          if (slots[i].topic.nextIds.includes(node.id)) {
            parentSlot = slots[i];
            break;
          }
        }
        if (!parentSlot) {
          for (let i = node.prerequisites.length - 1; i >= 0; i -= 1) {
            const found = slotById.get(node.prerequisites[i]);
            if (found) {
              parentSlot = found;
              break;
            }
          }
        }
        (parentSlot || slots[slots.length - 1]).milestones.push(node);
      }
    }

    const rows: FlowRow[] = [];
    let lastStageId: string | null = null;
    for (let i = 0; i < slots.length; i += ROW_COLS) {
      const rowIndex = rows.length;
      const direction: "ltr" | "rtl" = rowIndex % 2 === 0 ? "ltr" : "rtl";
      const orderedSlots = slots.slice(i, i + ROW_COLS);
      const cells: Array<FlowSlot | null> = Array(ROW_COLS).fill(null);

      if (direction === "ltr") {
        orderedSlots.forEach((slot, idx) => {
          cells[idx] = slot;
        });
      } else {
        orderedSlots.forEach((slot, idx) => {
          cells[ROW_COLS - 1 - idx] = slot;
        });
      }

      const firstStageId = orderedSlots[0]?.topic.stageId;
      let stageStart: FlowRow["stageStart"];
      if (firstStageId && firstStageId !== lastStageId) {
        const st = stageMap.get(firstStageId);
        if (st) {
          stageStart = {
            id: st.id,
            label: st.label,
            title: st.title,
            order: st.order,
          };
        }
        lastStageId = firstStageId;
      }

      rows.push({ rowIndex, direction, cells, orderedSlots, stageStart });
    }

    return rows;
  }, [roadmap.nodes, isNodeVisibleInCanvas, stageMap]);

  const recomputeEdges = useCallback(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const canvasRect = canvasEl.getBoundingClientRect();
    if (canvasRect.width === 0 || canvasRect.height === 0) return;

    const naturalWidth = canvasEl.offsetWidth;
    const naturalHeight = canvasEl.offsetHeight;
    setCanvasSize({ width: naturalWidth, height: naturalHeight });

    const nextEdges: ComputedEdge[] = [];
    const activeId = hoveredNodeId || selectedNodeId;

    const getTone = (fromNode: RoadmapNode, toNode: RoadmapNode): ComputedEdge["tone"] => {
      const fromVisible = isNodeHighlighted(fromNode);
      const toVisible = isNodeHighlighted(toNode);
      if (!fromVisible || !toVisible) return "dimmed";
      if (activeId === fromNode.id || activeId === toNode.id) return "active";
      if (
        activePathwayStepMap?.has(fromNode.id) &&
        activePathwayStepMap?.has(toNode.id)
      ) {
        return "active";
      }
      if (nodeStateMap.get(fromNode.id)?.effectiveStatus === "completed") {
        return "completed";
      }
      return "default";
    };

    const measureEl = (el: HTMLElement | null) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        cx: r.left - canvasRect.left + r.width / 2,
        cy: r.top - canvasRect.top + r.height / 2,
        left: r.left - canvasRect.left,
        right: r.right - canvasRect.left,
        top: r.top - canvasRect.top,
        bottom: r.bottom - canvasRect.top,
      };
    };

    const measure = (id: string) => measureEl(nodeRefs.current[id] || null);

    for (let r = 0; r < flowRows.length; r += 1) {
      const row = flowRows[r];

      // 1. Conexões horizontais entre tópicos da mesma linha (serpentina)
      for (let i = 0; i < row.orderedSlots.length - 1; i += 1) {
        const fromNode = row.orderedSlots[i].topic;
        const toNode = row.orderedSlots[i + 1].topic;
        const f = measure(fromNode.id);
        const t = measure(toNode.id);
        if (!f || !t) continue;

        const sameBand = Math.abs(f.cy - t.cy) < 28;
        let d = "";
        if (sameBand) {
          const sx = row.direction === "ltr" ? f.right : f.left;
          const ex = row.direction === "ltr" ? t.left : t.right;
          const y = (f.cy + t.cy) / 2;
          d = roundedPolylinePath([
            { x: sx, y },
            { x: ex, y },
          ]);
        } else {
          d = roundedPolylinePath([
            { x: f.cx, y: f.bottom },
            { x: t.cx, y: t.top },
          ]);
        }

        nextEdges.push({
          id: `spine-${fromNode.id}->${toNode.id}`,
          fromId: fromNode.id,
          toId: toNode.id,
          d,
          tone: getTone(fromNode, toNode),
          dashed: false,
          arrow: true,
        });
      }

      // 2. Ramificações de alternativas (ex.: Node.js, Go, C++ fora da trilha principal)
      for (const slot of row.orderedSlots) {
        const alts = slot.topic.alternatives;
        if (alts && alts.length > 1) {
          const f = measure(slot.topic.id);
          if (f) {
            for (const alt of alts.slice(1)) {
              const t = measureEl(branchRefs.current[`${slot.topic.id}::${alt.id}`] || null);
              if (!t) continue;
              const midY = (f.bottom + t.top) / 2;
              const d =
                Math.abs(f.cx - t.cx) < 10
                  ? roundedPolylinePath([
                      { x: f.cx, y: f.bottom },
                      { x: t.cx, y: t.top },
                    ])
                  : roundedPolylinePath([
                      { x: f.cx, y: f.bottom },
                      { x: f.cx, y: midY },
                      { x: t.cx, y: midY },
                      { x: t.cx, y: t.top },
                    ]);
              nextEdges.push({
                id: `alt-${slot.topic.id}->${alt.id}`,
                fromId: slot.topic.id,
                toId: slot.topic.id,
                d,
                tone: getTone(slot.topic, slot.topic),
                dashed: true,
                arrow: false,
              });
            }
          }
        }
      }

      // 3. Drops tracejados para Checkpoints / Projetos pendurados abaixo do tópico
      for (const slot of row.orderedSlots) {
        let prevMilestone = slot.topic;
        for (const ms of slot.milestones) {
          const f = measure(prevMilestone.id);
          const t = measure(ms.id);
          if (!f || !t) continue;

          const d =
            Math.abs(f.cx - t.cx) < 12
              ? roundedPolylinePath([
                  { x: f.cx, y: f.bottom },
                  { x: t.cx, y: t.top },
                ])
              : roundedPolylinePath([
                  { x: f.cx, y: f.bottom },
                  { x: f.cx, y: (f.bottom + t.top) / 2 },
                  { x: t.cx, y: (f.bottom + t.top) / 2 },
                  { x: t.cx, y: t.top },
                ]);

          nextEdges.push({
            id: `ms-${prevMilestone.id}->${ms.id}`,
            fromId: prevMilestone.id,
            toId: ms.id,
            d,
            tone: getTone(prevMilestone, ms),
            dashed: true,
            arrow: false,
          });
          prevMilestone = ms;
        }
      }

      // 3. Curva externa da serpentina conectando o fim desta linha ao início da próxima
      if (r < flowRows.length - 1) {
        const nextRow = flowRows[r + 1];
        const fromNode = row.orderedSlots[row.orderedSlots.length - 1]?.topic;
        const toNode = nextRow.orderedSlots[0]?.topic;
        if (fromNode && toNode) {
          const f = measure(fromNode.id);
          const t = measure(toNode.id);
          if (f && t) {
            const stackedSingleCol = Math.abs(f.cx - t.cx) < 28 && naturalWidth < 680;
            let d = "";
            if (stackedSingleCol) {
              d = roundedPolylinePath([
                { x: f.cx, y: f.bottom },
                { x: t.cx, y: t.top },
              ]);
            } else if (row.direction === "ltr") {
              const turnX = Math.min(naturalWidth - 10, Math.max(f.right, t.right) + 28);
              d = roundedPolylinePath([
                { x: f.right, y: f.cy },
                { x: turnX, y: f.cy },
                { x: turnX, y: t.cy },
                { x: t.right, y: t.cy },
              ]);
            } else {
              const turnX = Math.max(10, Math.min(f.left, t.left) - 28);
              d = roundedPolylinePath([
                { x: f.left, y: f.cy },
                { x: turnX, y: f.cy },
                { x: turnX, y: t.cy },
                { x: t.left, y: t.cy },
              ]);
            }

            nextEdges.push({
              id: `turn-${fromNode.id}->${toNode.id}`,
              fromId: fromNode.id,
              toId: toNode.id,
              d,
              tone: getTone(fromNode, toNode),
              dashed: false,
              arrow: true,
            });
          }
        }
      }
    }

    setEdges(nextEdges);
  }, [
    activePathwayStepMap,
    flowRows,
    hoveredNodeId,
    isNodeHighlighted,
    nodeStateMap,
    selectedNodeId,
  ]);

  useLayoutEffect(() => {
    recomputeEdges();
    const raf = window.requestAnimationFrame(recomputeEdges);
    return () => window.cancelAnimationFrame(raf);
  }, [recomputeEdges, roadmap.id, isolatePathway, activePathwayId, priorityFilter]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      recomputeEdges();
    });
    ro.observe(canvasEl);
    window.addEventListener("resize", recomputeEdges);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recomputeEdges);
    };
  }, [recomputeEdges]);

  const renderNodeCard = (node: RoadmapNode) => {
    const nodeState = nodeStateMap.get(node.id)!;
    const isSelected = selectedNodeId === node.id;
    const isRoot = rootNodeIds.has(node.id);
    const isNextFocus = focusHighlightNextId === node.id;
    const highlighted = isNodeHighlighted(node);
    const priority = node.priority || "recommended";
    const isMilestone = node.kind === "checkpoint" || node.kind === "project";
    const pathwayStep = activePathwayStepMap?.get(node.id);
    const displayTitle = node.shortTitle || node.title;
    const primaryTrackId = !isMilestone ? node.studyLinks.find(l => l.trackId)?.trackId : undefined;

    return (
      <div
        key={node.id}
        className={`ce-rm-node-wrap ${isRoot ? "has-start-flag" : ""} ${
          isMilestone ? "is-milestone-wrap" : ""
        }`}
      >
        {isRoot && (
          <div className="ce-rm-start-banner">
            <Flag size={10} />
            <span>Comece aqui</span>
          </div>
        )}

        <div
          ref={el => {
            nodeRefs.current[node.id] = el;
          }}
          role="button"
          tabIndex={0}
          onClick={() => onSelectNode(node.id)}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectNode(node.id);
            }
          }}
          onMouseEnter={() => setHoveredNodeId(node.id)}
          onMouseLeave={() => setHoveredNodeId(prev => (prev === node.id ? null : prev))}
          aria-pressed={isSelected}
          title={node.title}
          className={[
            "ce-rm-node",
            `status-${nodeState.effectiveStatus}`,
            `kind-${node.kind}`,
            `priority-${priority}`,
            isSelected ? "is-selected" : "",
            pathwayStep ? "is-pathway-step" : "",
            !highlighted ? "is-dimmed" : "",
            isMilestone ? "is-milestone" : "",
            isNextFocus ? "is-next-focus" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="ce-rm-node-compact-row">
            <span className="ce-rm-node-lead" aria-hidden="true">
              {isMilestone ? (
                node.kind === "project" ? (
                  <FolderGit2 size={14} style={{ color: "var(--accent-warning)" }} />
                ) : (
                  <Flag size={14} style={{ color: "var(--accent-warning)" }} />
                )
              ) : primaryTrackId ? (
                <TechIcon trackId={primaryTrackId} size={15} />
              ) : (
                <span className={`ce-rm-dot is-${priority}`} />
              )}
            </span>

            <strong className="ce-rm-node-title">{displayTitle}</strong>

            <span className="ce-rm-node-trail">
              {pathwayStep && <span className="ce-rm-step-pill">{pathwayStep}</span>}
              {isNextFocus && nodeState.effectiveStatus === "not_started" && (
                <Sparkles size={12} style={{ color: roadmap.accentSecondary }} aria-hidden="true" />
              )}
              <button
                type="button"
                className={`ce-rm-status-toggle is-${nodeState.effectiveStatus}`}
                title={`Status: ${STATUS_LABELS[nodeState.effectiveStatus]} (clique para alternar)`}
                aria-label={`Alterar status de ${displayTitle} (atual: ${STATUS_LABELS[nodeState.effectiveStatus]})`}
                onClick={e => {
                  e.stopPropagation();
                  if (!onSetStatus) return;
                  const idx = STATUS_CYCLE.indexOf(nodeState.effectiveStatus);
                  const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
                  onSetStatus(roadmap.id, node.id, next);
                }}
              >
                {nodeState.effectiveStatus === "completed" ? (
                  <CheckCircle2 size={15} style={{ color: "var(--accent-success)" }} />
                ) : nodeState.effectiveStatus === "in_progress" ? (
                  <Play size={13} style={{ color: roadmap.accentColor }} />
                ) : nodeState.effectiveStatus === "skipped" ? (
                  <SkipForward size={13} style={{ color: "var(--text-muted)" }} />
                ) : (
                  <CircleDashed size={14} style={{ color: "var(--text-muted)", opacity: 0.65 }} />
                )}
              </button>
            </span>
          </div>

          {nodeState.linkedTotal > 0 && nodeState.percent > 0 && (
            <div className="ce-rm-node-bar" aria-hidden="true">
              <div className="ce-rm-node-bar-fill" style={{ width: `${nodeState.percent}%` }} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="ce-rm-canvas-shell"
      style={
        {
          "--rm-accent": roadmap.accentColor,
          "--rm-accent-secondary": roadmap.accentSecondary,
          "--rm-accent-soft": roadmap.accentSoft,
          "--rm-accent-border": roadmap.accentBorder,
        } as React.CSSProperties
      }
    >
      {activePathway && (
        <div className="ce-rm-pathway-banner" role="status">
          <div className="ce-rm-pathway-banner-info">
            <GitBranch size={15} style={{ color: roadmap.accentColor, flexShrink: 0 }} />
            <div>
              <strong>
                Percurso ativo: {activePathway.label} ({activePathway.nodeIds.length} de{" "}
                {roadmap.nodes.length} tópicos destacados)
              </strong>
              <span>
                {activePathway.audience} — {activePathway.description}
              </span>
            </div>
          </div>

          <div className="ce-rm-pathway-banner-actions">
            <button
              type="button"
              className={`ce-btn ce-btn-sm ${isolatePathway ? "ce-btn-primary" : "ce-btn-ghost"}`}
              onClick={() => setIsolatePathway(prev => !prev)}
            >
              {isolatePathway ? <Eye size={13} /> : <EyeOff size={13} />}
              <span>{isolatePathway ? "Mostrar mapa completo" : "Focar só este percurso"}</span>
            </button>

            {onClearPathway && (
              <button
                type="button"
                className="ce-btn ce-btn-ghost ce-btn-sm"
                onClick={onClearPathway}
                aria-label="Limpar filtro de percurso"
              >
                <X size={13} />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="ce-rm-canvas-viewport">
        <div className="ce-rm-corner-legend" aria-label="Legenda do mapa">
          <span className="ce-rm-legend-item">
            <span className="ce-rm-dot is-required" aria-hidden="true" />
            <span>Obrigatório</span>
          </span>
          <span className="ce-rm-legend-item">
            <span className="ce-rm-dot is-recommended" aria-hidden="true" />
            <span>Recomendado</span>
          </span>
          <span className="ce-rm-legend-item">
            <span className="ce-rm-dot is-optional" aria-hidden="true" />
            <span>Opcional</span>
          </span>
          <span className="ce-rm-legend-sep" aria-hidden="true" />
          <span className="ce-rm-legend-item">
            <Flag size={11} style={{ color: "var(--accent-warning)" }} />
            <span>Marco / Projeto</span>
          </span>
          <span className="ce-rm-legend-item">
            <CheckCircle2 size={11} style={{ color: "var(--accent-success)" }} />
            <span>Concluído</span>
          </span>
        </div>

        <div ref={canvasRef} className="ce-rm-serpentine-canvas">
          {canvasSize.width > 0 && canvasSize.height > 0 && (
            <svg
              className="ce-rm-svg-edges"
              width={canvasSize.width}
              height={canvasSize.height}
              viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
              aria-hidden="true"
            >
              <defs>
                <marker
                  id={`arrow-def-${svgInstanceId}`}
                  markerWidth="7"
                  markerHeight="7"
                  refX="5.5"
                  refY="3.5"
                  orient="auto"
                >
                  <path d="M 0 1 L 6 3.5 L 0 6 z" fill="rgba(148, 163, 184, 0.7)" />
                </marker>
                <marker
                  id={`arrow-act-${svgInstanceId}`}
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="4"
                  orient="auto"
                >
                  <path d="M 0 1 L 7 4 L 0 7 z" fill={roadmap.accentColor} />
                </marker>
                <marker
                  id={`arrow-ok-${svgInstanceId}`}
                  markerWidth="7"
                  markerHeight="7"
                  refX="5.5"
                  refY="3.5"
                  orient="auto"
                >
                  <path d="M 0 1 L 6 3.5 L 0 6 z" fill="rgba(34, 197, 94, 0.85)" />
                </marker>
              </defs>

              {edges.map(edge => {
                const markerEnd = !edge.arrow
                  ? undefined
                  : edge.tone === "active"
                    ? `url(#arrow-act-${svgInstanceId})`
                    : edge.tone === "completed"
                      ? `url(#arrow-ok-${svgInstanceId})`
                      : `url(#arrow-def-${svgInstanceId})`;
                return (
                  <React.Fragment key={edge.id}>
                    {!edge.dashed && edge.tone !== "dimmed" && (
                      <path
                        d={edge.d}
                        className={`ce-rm-edge-glow is-${edge.tone}`}
                        aria-hidden="true"
                      />
                    )}
                    <path
                      d={edge.d}
                      className={`ce-rm-edge is-${edge.tone} ${edge.dashed ? "is-dashed" : "is-spine"}`}
                      strokeDasharray={
                        edge.tone === "active"
                          ? "6 6"
                          : edge.dashed
                            ? "5 5"
                            : undefined
                      }
                      markerEnd={edge.tone === "dimmed" ? undefined : markerEnd}
                    />
                  </React.Fragment>
                );
              })}
            </svg>
          )}

          <div className="ce-rm-serpentine-rows">
            {flowRows.map(row => (
              <React.Fragment key={row.rowIndex}>
                {row.stageStart && (
                  <div className="ce-rm-trail-divider-wrap">
                    <span className="ce-rm-trail-line" aria-hidden="true" />
                    <div className="ce-rm-trail-divider" aria-label={row.stageStart.title}>
                      <TrailStageIllustration
                        order={row.stageStart.order}
                        accent={roadmap.accentColor}
                      />
                      <div className="ce-rm-trail-divider-text">
                        <span>{row.stageStart.label}</span>
                        <strong>{row.stageStart.title}</strong>
                      </div>
                    </div>
                    <span className="ce-rm-trail-line" aria-hidden="true" />
                  </div>
                )}

                <div className={`ce-rm-serpentine-row is-${row.direction}`}>
                  {row.cells.map((slot, cellIdx) => {
                    if (!slot) {
                      return (
                        <div
                          key={`empty-${row.rowIndex}-${cellIdx}`}
                          className="ce-rm-serpentine-cell is-empty"
                          aria-hidden="true"
                        />
                      );
                    }
                    return (
                      <div key={slot.topic.id} className="ce-rm-serpentine-cell">
                        {renderNodeCard(slot.topic)}
                        {slot.topic.alternatives && slot.topic.alternatives.length > 1 && (
                          <div className="ce-rm-slot-branches">
                            {slot.topic.alternatives.slice(1).map(alt => {
                              const altPrio = alt.priority || "recommended";
                              return (
                                <button
                                  key={alt.id}
                                  ref={el => {
                                    branchRefs.current[`${slot.topic.id}::${alt.id}`] = el;
                                  }}
                                  type="button"
                                  className={`ce-rm-branch-node priority-${altPrio}`}
                                  onClick={() => onSelectNode(slot.topic.id)}
                                  onMouseEnter={() => setHoveredNodeId(slot.topic.id)}
                                  onMouseLeave={() =>
                                    setHoveredNodeId(prev => (prev === slot.topic.id ? null : prev))
                                  }
                                  title={`${alt.name}: ${alt.summary}`}
                                >
                                  <span className={`ce-rm-dot is-${altPrio}`} aria-hidden="true" />
                                  <span className="ce-rm-branch-name">{alt.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {slot.milestones.length > 0 && (
                          <div className="ce-rm-slot-milestones">
                            {slot.milestones.map(ms => renderNodeCard(ms))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="ce-rm-trail-finish" aria-hidden="true">
            <svg viewBox="0 0 28 28" className="ce-rm-finish-svg">
              <circle
                cx="14"
                cy="14"
                r="11"
                fill={roadmap.accentSoft}
                stroke={roadmap.accentColor}
                strokeWidth="1.5"
              />
              <path
                d="M14 8 L15.8 11.8 L20 12.4 L17 15.3 L17.7 19.5 L14 17.5 L10.3 19.5 L11 15.3 L8 12.4 L12.2 11.8 Z"
                fill={roadmap.accentColor}
              />
            </svg>
            <span>Jornada {roadmap.shortTitle}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RoadmapMiniPreviewProps {
  roadmap: RoadmapDefinition;
  data: BootstrapPayload;
}

export const RoadmapMiniPreview: React.FC<RoadmapMiniPreviewProps> = ({ roadmap, data }) => {
  const previewNodes = useMemo(() => {
    const firstStages = [...roadmap.stages]
      .sort((a, b) => a.order - b.order)
      .slice(0, 3)
      .map(s => s.id);
    return roadmap.nodes.filter(n => firstStages.includes(n.stageId)).slice(0, 6);
  }, [roadmap.nodes, roadmap.stages]);

  return (
    <div
      className="ce-rm-mini-preview"
      style={
        {
          "--rm-accent": roadmap.accentColor,
          "--rm-accent-soft": roadmap.accentSoft,
          "--rm-accent-border": roadmap.accentBorder,
        } as React.CSSProperties
      }
    >
      <div className="ce-rm-mini-legend">
        <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 12 }}>
          Principais blocos do percurso
        </span>
        <div className="ce-rm-mini-logos" aria-label="Tecnologias do roadmap">
          {roadmap.relatedTrackIds.slice(0, 5).map(tId => {
            const track = TRACK_MAP[tId];
            if (!track) return null;
            return (
              <span key={tId} className="ce-rm-mini-logo-chip" title={track.name}>
                <TechIcon trackId={tId} size={15} />
              </span>
            );
          })}
        </div>
      </div>

      <div className="ce-rm-mini-grid">
        {previewNodes.map((node, idx) => {
          const state = computeRoadmapNodeState(node, data);
          const priority = node.priority || "recommended";
          const linkedTrackId = node.studyLinks.find(l => l.trackId)?.trackId;
          const stepLabel = String(idx + 1).padStart(2, "0");
          return (
            <Link
              key={node.id}
              to={`/roadmaps/${roadmap.id}?topico=${node.id}`}
              className={`ce-rm-mini-node status-${state.effectiveStatus} priority-${priority} ${
                idx === 0 ? "is-root" : ""
              }`}
            >
              <div className="ce-rm-mini-node-top">
                <span className="ce-rm-mini-step">{stepLabel}</span>
                {idx === 0 && state.effectiveStatus === "not_started" && (
                  <span className="ce-rm-mini-start-tag">Início</span>
                )}
                {state.effectiveStatus === "completed" && (
                  <Check size={13} style={{ color: "var(--accent-success)", flexShrink: 0 }} />
                )}
                {state.effectiveStatus === "in_progress" && (
                  <span className="ce-rm-mini-status">Em estudo</span>
                )}
                {linkedTrackId && (
                  <span className="ce-rm-mini-track-icon" aria-hidden="true">
                    <TechIcon trackId={linkedTrackId} size={20} />
                  </span>
                )}
              </div>
              <strong className="ce-rm-mini-title">{node.shortTitle || node.title}</strong>
              <span className="ce-rm-mini-sub">
                {node.alternatives && node.alternatives.length > 0
                  ? node.alternatives
                      .slice(0, 2)
                      .map(a => a.name)
                      .join(" · ")
                  : node.keyConcepts.slice(0, 2).join(" · ") || node.studyLinks[0]?.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
