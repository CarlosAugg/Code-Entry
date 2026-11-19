import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  MousePointerClick,
  Sparkles,
  X,
} from "lucide-react";
import { getOnboardingSteps } from "../../data/onboardingSteps";
import { usePlatform } from "../../context/PlatformContext";

interface BoxRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function isElementVisibleInViewport(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
    return false;
  }
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return false;
  if (r.right <= 4 || r.left >= window.innerWidth - 4) return false;
  return true;
}

function findVisibleTarget(selectors?: string[]): HTMLElement | null {
  if (!selectors || selectors.length === 0) return null;
  for (const sel of selectors) {
    const candidates = Array.from(document.querySelectorAll(sel)) as HTMLElement[];
    for (const candidate of candidates) {
      if (isElementVisibleInViewport(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

function sameRect(a: BoxRect | null, b: BoxRect | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
}

export const ProductTour: React.FC = () => {
  const { data, tourOpen, closeTour, completeTour } = usePlatform();
  const navigate = useNavigate();
  const location = useLocation();
  const [stepIdx, setStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<BoxRect | null>(null);
  const [viewport, setViewport] = useState<{ w: number; h: number }>(() =>
    typeof window !== "undefined"
      ? { w: window.innerWidth, h: window.innerHeight }
      : { w: 1280, h: 800 }
  );

  const tourRootRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const activeTargetRef = useRef<HTMLElement | null>(null);
  const advancingRef = useRef(false);
  const scrolledKeyRef = useRef<string>("");

  const steps = useMemo(
    () => getOnboardingSteps(data.settings.displayName),
    [data.settings.displayName]
  );
  const step = steps[stepIdx] || steps[0];
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === steps.length - 1;
  const isMobile = viewport.w <= 680;
  const isInteractive = step.interactionMode !== "info";

  useEffect(() => {
    if (tourOpen) {
      setStepIdx(0);
      advancingRef.current = false;
      scrolledKeyRef.current = "";
    }
  }, [tourOpen]);

  useEffect(() => {
    advancingRef.current = false;
  }, [stepIdx]);

  const measureTarget = useCallback(
    (allowScrollIntoView = false) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const el = findVisibleTarget(step.targetSelectors);
      activeTargetRef.current = el;
      if (!el) {
        setTargetRect(prev => (prev === null ? prev : null));
        return false;
      }

      if (allowScrollIntoView && !el.closest(".ce-sidebar, .ce-topbar, .ce-mobile-bottom-nav")) {
        const key = `${step.id}:${location.pathname}`;
        if (scrolledKeyRef.current !== key) {
          scrolledKeyRef.current = key;
          const preRect = el.getBoundingClientRect();
          if (preRect.top < 70 || preRect.bottom > vh - 70) {
            el.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
          }
        }
      }

      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        setTargetRect(prev => (prev === null ? prev : null));
        return false;
      }

      const pad = 6;
      const left = Math.max(4, r.left - pad);
      const top = Math.max(4, r.top - pad);
      const right = Math.min(vw - 4, r.right + pad);
      const bottom = Math.min(vh - 4, r.bottom + pad);

      const nextRect: BoxRect = {
        top,
        left,
        width: Math.max(24, right - left),
        height: Math.max(24, bottom - top),
      };
      setTargetRect(prev => (sameRect(prev, nextRect) ? prev : nextRect));
      return true;
    },
    [step.id, step.targetSelectors, location.pathname]
  );

  // Mede alvo continuamente (sem auto-navegar e sem loop de mutações)
  useLayoutEffect(() => {
    if (!tourOpen) return;

    let cancelled = false;
    let attempts = 0;
    let rafId = 0;

    const scheduleMeasure = () => {
      if (cancelled || rafId !== 0) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        if (!cancelled) measureTarget(false);
      });
    };

    const tryLocate = () => {
      if (cancelled) return;
      if (!step.targetSelectors || step.targetSelectors.length === 0) {
        activeTargetRef.current = null;
        setTargetRect(prev => (prev === null ? prev : null));
        return;
      }

      const found = measureTarget(true);
      if (found) return;

      attempts += 1;
      if (attempts < 18) {
        window.setTimeout(tryLocate, 65);
      } else {
        setTargetRect(prev => (prev === null ? prev : null));
      }
    };

    tryLocate();

    const onResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setViewport(prev => (prev.w === vw && prev.h === vh ? prev : { w: vw, h: vh }));
      scheduleMeasure();
    };
    const onScroll = () => scheduleMeasure();
    const onDrawerTransition = () => window.setTimeout(scheduleMeasure, 240);

    // Observa apenas abertura/fechamento de gaveta e expansão fora do portal do tour
    const mutObserver = new MutationObserver(mutations => {
      const rootEl = tourRootRef.current;
      const hasExternalClassChange = mutations.some(
        m => !(rootEl && m.target instanceof Node && rootEl.contains(m.target))
      );
      if (hasExternalClassChange) {
        scheduleMeasure();
      }
    });
    mutObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "aria-expanded"],
      subtree: true,
      childList: false,
    });

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("transitionend", onDrawerTransition, true);

    return () => {
      cancelled = true;
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      mutObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("transitionend", onDrawerTransition, true);
    };
  }, [tourOpen, stepIdx, location.pathname, step.targetSelectors, measureTarget]);

  // Avança automaticamente APÓS o clique real do usuário navegar para a rota esperada
  useEffect(() => {
    if (!tourOpen || step.interactionMode !== "navigate" || !step.advanceOnRoutePattern) return;
    if (advancingRef.current) return;
    if (step.advanceOnRoutePattern.test(location.pathname)) {
      advancingRef.current = true;
      setStepIdx(i => Math.min(steps.length - 1, i + 1));
    }
  }, [tourOpen, step.interactionMode, step.advanceOnRoutePattern, location.pathname, steps.length]);

  // Para etapas "click-target", aguarda clique real dentro do elemento destacado
  useEffect(() => {
    if (!tourOpen || step.interactionMode !== "click-target") return;

    const onDocClick = (e: MouseEvent) => {
      if (advancingRef.current) return;
      const targetEl = activeTargetRef.current || findVisibleTarget(step.targetSelectors);
      if (!targetEl) return;
      const clickedNode = e.target as Node | null;
      if (clickedNode && targetEl.contains(clickedNode)) {
        advancingRef.current = true;
        window.setTimeout(() => {
          setStepIdx(i => Math.min(steps.length - 1, i + 1));
        }, 180);
      }
    };

    document.addEventListener("click", onDocClick, true);
    return () => document.removeEventListener("click", onDocClick, true);
  }, [tourOpen, step.interactionMode, step.targetSelectors, steps.length]);

  const goToStepFallback = useCallback(
    (nextIndex: number) => {
      const clamped = Math.max(0, Math.min(steps.length - 1, nextIndex));
      const targetStep = steps[clamped];
      advancingRef.current = false;
      if (targetStep) {
        const matches = targetStep.routePattern
          ? targetStep.routePattern.test(location.pathname)
          : location.pathname === targetStep.route;
        if (!matches && targetStep.route) {
          navigate(targetStep.route);
        }
      }
      setStepIdx(clamped);
    },
    [location.pathname, navigate, steps]
  );

  // Suporte a teclado: Esc fecha; setas atuam como válvula de escape
  useEffect(() => {
    if (!tourOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeTour();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isLast) completeTour();
        else goToStepFallback(stepIdx + 1);
      } else if (e.key === "ArrowLeft" && !isFirst) {
        e.preventDefault();
        goToStepFallback(stepIdx - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tourOpen, isFirst, isLast, stepIdx, closeTour, completeTour, goToStepFallback]);

  if (!tourOpen || typeof document === "undefined") return null;

  // Calcula posição do cartão explicativo evitando cobrir a área clicável destacada
  const getCardStyle = (): React.CSSProperties => {
    if (isMobile) {
      const targetInLowerHalf =
        targetRect && targetRect.top + targetRect.height / 2 > viewport.h * 0.54;
      if (targetInLowerHalf) {
        return {
          left: 12,
          right: 12,
          top: 12,
          width: "auto",
        };
      }
      if (!targetRect) {
        return {
          left: 12,
          right: 12,
          top: 0,
          bottom: 0,
          margin: "auto",
          height: "fit-content",
          width: "auto",
        };
      }
      return {
        left: 12,
        right: 12,
        bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        width: "auto",
      };
    }

    if (!targetRect) {
      // Sem transform translate(-50%,-50%) para não colidir com a animação ceScaleIn
      return {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        margin: "auto",
        height: "fit-content",
      };
    }

    const vw = viewport.w;
    const vh = viewport.h;
    const cardWidth = Math.min(390, vw - 32);
    const estCardHeight = cardRef.current?.offsetHeight || 310;
    const margin = 16;

    const spaceAbove = targetRect.top - margin;
    const spaceBelow = vh - (targetRect.top + targetRect.height) - margin;
    const spaceLeft = targetRect.left - margin;
    const spaceRight = vw - (targetRect.left + targetRect.width) - margin;

    const pref = step.preferredSide || "bottom";
    let top = vh / 2 - estCardHeight / 2;
    let left = vw / 2 - cardWidth / 2;

    if (pref === "left" && spaceLeft >= cardWidth + 14) {
      left = targetRect.left - cardWidth - 16;
      top = targetRect.top + 12;
    } else if (pref === "right" && spaceRight >= cardWidth + 14) {
      left = targetRect.left + targetRect.width + 16;
      top = Math.min(targetRect.top, vh - estCardHeight - margin);
    } else if (pref === "bottom" && spaceBelow >= estCardHeight + 12) {
      top = targetRect.top + targetRect.height + 16;
      left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    } else if (pref === "top" && spaceAbove >= estCardHeight + 12) {
      top = targetRect.top - estCardHeight - 16;
      left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    } else if (spaceBelow >= estCardHeight + 12) {
      top = targetRect.top + targetRect.height + 16;
      left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    } else if (spaceLeft >= cardWidth + 14) {
      left = targetRect.left - cardWidth - 16;
      top = targetRect.top + 12;
    } else if (spaceRight >= cardWidth + 14) {
      left = targetRect.left + targetRect.width + 16;
      top = targetRect.top + 12;
    } else if (spaceAbove >= estCardHeight + 12) {
      top = targetRect.top - estCardHeight - 16;
      left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    } else {
      top = vh - estCardHeight - 20;
      left = vw - cardWidth - 20;
    }

    const clampedLeft = Math.max(margin, Math.min(vw - cardWidth - margin, left));
    const clampedTop = Math.max(margin, Math.min(vh - estCardHeight - margin, top));

    return {
      top: clampedTop,
      left: clampedLeft,
      width: cardWidth,
    };
  };

  // Posiciona indicador visual "Clique aqui" sem sair da tela
  const pointerPillStyle = (): React.CSSProperties | null => {
    if (!targetRect || !isInteractive) return null;
    const placeAbove = targetRect.top > 48;
    const left = Math.max(12, Math.min(viewport.w - 150, targetRect.left));
    return {
      top: placeAbove ? targetRect.top - 32 : targetRect.top + targetRect.height + 8,
      left,
    };
  };

  const pillPos = pointerPillStyle();

  return createPortal(
    <div ref={tourRootRef} role="dialog" aria-modal="false" aria-label={`Tour guiado: ${step.title}`}>
      {/* Overlay: 4 quadrantes fora do recorte para deixar o alvo 100% clicável */}
      {targetRect ? (
        <>
          <div
            className="ce-tour-quadrant"
            style={{ top: 0, left: 0, right: 0, height: targetRect.top }}
            aria-hidden="true"
          />
          <div
            className="ce-tour-quadrant"
            style={{
              top: targetRect.top,
              left: 0,
              width: targetRect.left,
              height: targetRect.height,
            }}
            aria-hidden="true"
          />
          <div
            className="ce-tour-quadrant"
            style={{
              top: targetRect.top,
              left: targetRect.left + targetRect.width,
              right: 0,
              height: targetRect.height,
            }}
            aria-hidden="true"
          />
          <div
            className="ce-tour-quadrant"
            style={{
              top: targetRect.top + targetRect.height,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            aria-hidden="true"
          />
        </>
      ) : (
        <div className="ce-tour-backdrop" aria-hidden="true" />
      )}

      {/* Borda luminosa não-bloqueante ao redor do alvo clicável */}
      {targetRect && (
        <div
          className="ce-tour-spotlight-box"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
          aria-hidden="true"
        />
      )}

      {/* Indicador discreto de ação no alvo */}
      {pillPos && (
        <div className="ce-tour-pointer-pill" style={pillPos} aria-hidden="true">
          <MousePointerClick size={12} />
          <span>Clique aqui</span>
        </div>
      )}

      {/* Cartão explicativo */}
      <div ref={cardRef} className="ce-tour-card" style={getCardStyle()} data-tour-step={step.id}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
              <span
                className="ce-badge"
                style={{
                  borderColor: "var(--border-accent)",
                  background: "var(--accent-soft)",
                  color: "var(--accent-secondary)",
                }}
              >
                {isFirst || isLast ? <Sparkles size={12} /> : <Compass size={12} />}
                <span>{step.badge}</span>
              </span>

              <button
                type="button"
                className="ce-icon-btn"
                style={{ width: 28, height: 28 }}
                onClick={closeTour}
                aria-label="Fechar tour"
                title="Fechar tour (Esc)"
              >
                <X size={14} />
              </button>
            </div>

            <h3 style={{ fontSize: 17.5, lineHeight: 1.25, marginBottom: 8 }}>{step.title}</h3>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.55, margin: 0 }}>
              {step.description}
            </p>

            {isInteractive && step.actionPrompt && (
              <div className="ce-tour-action-banner" data-testid="tour-action-prompt">
                <MousePointerClick size={15} style={{ color: "var(--accent-secondary)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ display: "block", fontSize: 12, color: "var(--accent-secondary)" }}>
                    Sua vez · Aguardando seu clique
                  </strong>
                  <span>{step.actionPrompt}</span>
                </div>
              </div>
            )}

            <div
              style={{
                marginTop: 10,
                padding: "9px 11px",
                borderRadius: 10,
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              <strong style={{ color: "var(--text-primary)" }}>Dica: </strong>
              {step.tip}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicadores de progresso */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 14 }} aria-hidden="true">
          {steps.map((s, idx) => (
            <span
              key={s.id}
              style={{
                height: 5,
                flex: idx === stepIdx ? 2.2 : 1,
                borderRadius: 999,
                background:
                  idx < stepIdx
                    ? "var(--accent-success)"
                    : idx === stepIdx
                    ? "var(--accent-secondary)"
                    : "rgba(148, 163, 184, 0.22)",
                transition: "all 220ms ease",
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginTop: 14,
          }}
        >
          <button type="button" className="ce-btn ce-btn-ghost ce-btn-sm" onClick={closeTour}>
            Pular tour
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            {!isFirst && (
              <button
                type="button"
                className="ce-btn ce-btn-ghost ce-btn-sm"
                onClick={() => goToStepFallback(stepIdx - 1)}
              >
                <ArrowLeft size={13} />
                <span>Voltar</span>
              </button>
            )}

            {isLast ? (
              <button type="button" className="ce-btn ce-btn-primary ce-btn-sm" onClick={() => completeTour()}>
                <Check size={14} />
                <span>Concluir tour</span>
              </button>
            ) : isFirst ? (
              <button
                type="button"
                className="ce-btn ce-btn-primary ce-btn-sm"
                onClick={() => goToStepFallback(1)}
              >
                <span>Iniciar tour</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                className="ce-btn ce-btn-ghost ce-btn-sm"
                onClick={() => goToStepFallback(stepIdx + 1)}
                title="Avançar para a próxima etapa caso prefira não clicar no elemento"
              >
                <span>Avançar</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
