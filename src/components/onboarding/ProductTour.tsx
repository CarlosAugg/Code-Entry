import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { getOnboardingSteps } from "../../data/onboardingSteps";
import { usePlatform } from "../../context/PlatformContext";
import { LiaRobotMascot, playLiaEasterEggSound } from "../study/LiaRobotMascot";
import type { LiaEasterEgg, LiaPointing } from "../../types/theater";

interface BoxRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ActorPos {
  x: number;
  y: number;
  bubbleSide: "left" | "right";
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
  const {
    tourOpen,
    closeTour,
    completeTour,
    openThemeDock,
    closeThemeDock,
    setThemeDockMinimized,
  } = usePlatform();
  const navigate = useNavigate();
  const location = useLocation();

  const [stepIdx, setStepIdx] = useState(0);
  const [pendingStepIdx, setPendingStepIdx] = useState<number | null>(null);
  const [targetRect, setTargetRect] = useState<BoxRect | null>(null);
  const [liaEgg, setLiaEgg] = useState<LiaEasterEgg>(null);
  const [liaCallout, setLiaCallout] = useState<string | null>(null);
  const [flightTilt, setFlightTilt] = useState(0);
  const [isFlying, setIsFlying] = useState(false);
  const [viewport, setViewport] = useState<{ w: number; h: number }>(() =>
    typeof window !== "undefined"
      ? { w: window.innerWidth, h: window.innerHeight }
      : { w: 1280, h: 800 }
  );

  const tourRootRef = useRef<HTMLDivElement | null>(null);
  const actorRef = useRef<HTMLDivElement | null>(null);
  const pathnameRef = useRef(location.pathname);
  const wasTourOpenRef = useRef(false);
  const tourOpenedDockRef = useRef(false);
  const scrolledKeyRef = useRef<string>("");
  const eggCountRef = useRef(0);
  const eggTimerRef = useRef<number | null>(null);
  const prevPosRef = useRef<{ x: number; y: number } | null>(null);
  const tiltTimerRef = useRef<number | null>(null);
  const navTimerRef = useRef<number | null>(null);

  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  const steps = useMemo(() => getOnboardingSteps(), []);
  const step = steps[stepIdx] || steps[0];
  const pendingStep = pendingStepIdx !== null ? steps[pendingStepIdx] || null : null;
  const isNavigatingStep = pendingStep !== null;
  const inLogicTrackDetail =
    tourOpen && !isNavigatingStep && location.pathname === "/trilhas/logic";
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === steps.length - 1;
  const isMobile = viewport.w <= 680;

  const activeSelectors = pendingStep
    ? pendingStep.navSelectors
    : inLogicTrackDetail
      ? ['a.ce-lesson-row[href*="logic-01"]', ".ce-btn-track"]
      : step.targetSelectors;

  const clearNavTimer = useCallback(() => {
    if (navTimerRef.current !== null) {
      window.clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (tourOpen && !wasTourOpenRef.current) {
      clearNavTimer();
      setStepIdx(0);
      setPendingStepIdx(null);
      setLiaEgg(null);
      setLiaCallout(null);
      setFlightTilt(0);
      setIsFlying(false);
      scrolledKeyRef.current = "";
      prevPosRef.current = null;
      if (pathnameRef.current !== "/") {
        navigate("/");
      }
    }
    wasTourOpenRef.current = tourOpen;
  }, [tourOpen, navigate, clearNavTimer]);

  useEffect(() => {
    if (!tourOpen) return;

    if (location.pathname === "/trilhas/logic" && !isNavigatingStep) {
      window.sessionStorage.setItem("ce-tour-auto-theater", "1");
    } else if (location.pathname.startsWith("/trilhas/logic/aula/")) {
      window.sessionStorage.setItem("ce-tour-auto-theater", "1");
      completeTour();
    }
  }, [tourOpen, location.pathname, isNavigatingStep, completeTour]);

  useEffect(() => {
    if (!tourOpen || isNavigatingStep) return;

    if (step.openThemeDock) {
      openThemeDock();
      setThemeDockMinimized(false);
      tourOpenedDockRef.current = true;
    } else if (tourOpenedDockRef.current) {
      closeThemeDock();
      tourOpenedDockRef.current = false;
    }
  }, [
    tourOpen,
    isNavigatingStep,
    stepIdx,
    step.openThemeDock,
    openThemeDock,
    closeThemeDock,
    setThemeDockMinimized,
  ]);

  useEffect(() => {
    return () => {
      if (eggTimerRef.current) window.clearTimeout(eggTimerRef.current);
      if (tiltTimerRef.current) window.clearTimeout(tiltTimerRef.current);
      clearNavTimer();
    };
  }, [clearNavTimer]);

  const handleClose = useCallback(() => {
    clearNavTimer();
    setPendingStepIdx(null);
    window.sessionStorage.removeItem("ce-tour-auto-theater");
    if (tourOpenedDockRef.current) {
      closeThemeDock();
      tourOpenedDockRef.current = false;
    }
    closeTour();
  }, [clearNavTimer, closeThemeDock, closeTour]);

  const handleComplete = useCallback(() => {
    clearNavTimer();
    setPendingStepIdx(null);
    window.sessionStorage.removeItem("ce-tour-auto-theater");
    if (tourOpenedDockRef.current) {
      closeThemeDock();
      tourOpenedDockRef.current = false;
    }
    completeTour();
  }, [clearNavTimer, closeThemeDock, completeTour]);

  const goToStep = useCallback(
    (nextIndex: number) => {
      clearNavTimer();
      window.sessionStorage.removeItem("ce-tour-auto-theater");
      const clamped = Math.max(0, Math.min(steps.length - 1, nextIndex));
      const targetStep = steps[clamped];
      if (!targetStep) return;

      if (tourOpenedDockRef.current && !targetStep.openThemeDock) {
        closeThemeDock();
        tourOpenedDockRef.current = false;
      }

      if (targetStep.route !== pathnameRef.current) {
        setPendingStepIdx(clamped);
        navTimerRef.current = window.setTimeout(() => {
          navigate(targetStep.route);
          navTimerRef.current = window.setTimeout(() => {
            setStepIdx(clamped);
            setPendingStepIdx(null);
            navTimerRef.current = null;
          }, 320);
        }, 1800);
      } else {
        setPendingStepIdx(null);
        setStepIdx(clamped);
      }
    },
    [clearNavTimer, steps, closeThemeDock, navigate]
  );

  const handleLiaClick = useCallback(() => {
    const reactions: Array<{ egg: "jump" | "startle" | "love"; text: string }> = [
      { egg: "jump", text: "Hehe!" },
      { egg: "startle", text: "Opa!" },
      { egg: "love", text: "♥" },
    ];
    const picked = reactions[eggCountRef.current % reactions.length];
    eggCountRef.current += 1;
    setLiaEgg(picked.egg);
    setLiaCallout(picked.text);
    playLiaEasterEggSound(picked.egg);

    if (eggTimerRef.current) window.clearTimeout(eggTimerRef.current);
    eggTimerRef.current = window.setTimeout(() => {
      setLiaEgg(null);
      setLiaCallout(null);
    }, 1300);
  }, []);

  const measureTarget = useCallback(
    (allowScrollIntoView = false) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const el = findVisibleTarget(activeSelectors);
      if (!el) {
        setTargetRect(prev => (prev === null ? prev : null));
        return false;
      }

      if (
        allowScrollIntoView &&
        !isNavigatingStep &&
        !el.closest(".ce-theme-dock-panel, .ce-sidebar, .ce-topbar, .ce-mobile-bottom-nav")
      ) {
        const key = `${step.id}:${pathnameRef.current}`;
        if (scrolledKeyRef.current !== key) {
          scrolledKeyRef.current = key;
          const preRect = el.getBoundingClientRect();
          if (preRect.top < 74 || preRect.bottom > vh - 74) {
            el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
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
    [activeSelectors, isNavigatingStep, step.id]
  );

  useLayoutEffect(() => {
    if (!tourOpen) return;

    let cancelled = false;
    let attempts = 0;
    let rafId = 0;
    let retryTimer = 0;

    const scheduleMeasure = () => {
      if (cancelled || rafId !== 0) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        if (!cancelled) measureTarget(false);
      });
    };

    const tryLocate = () => {
      if (cancelled) return;
      if (!activeSelectors || activeSelectors.length === 0) {
        setTargetRect(prev => (prev === null ? prev : null));
        return;
      }

      const found = measureTarget(true);
      if (found) return;

      attempts += 1;
      if (attempts < 28) {
        retryTimer = window.setTimeout(tryLocate, 70);
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
    const onTransitionEnd = () => scheduleMeasure();

    const mutObserver = new MutationObserver(mutations => {
      const rootEl = tourRootRef.current;
      const hasExternalMutation = mutations.some(
        m => !(rootEl && m.target instanceof Node && rootEl.contains(m.target))
      );
      if (hasExternalMutation) {
        scheduleMeasure();
      }
    });
    mutObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("transitionend", onTransitionEnd, true);

    return () => {
      cancelled = true;
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      if (retryTimer !== 0) window.clearTimeout(retryTimer);
      mutObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("transitionend", onTransitionEnd, true);
    };
  }, [tourOpen, stepIdx, pendingStepIdx, location.pathname, activeSelectors, measureTarget]);

  useEffect(() => {
    if (!tourOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key === "ArrowRight" && !isNavigatingStep) {
        e.preventDefault();
        if (isLast) handleComplete();
        else goToStep(stepIdx + 1);
      } else if (e.key === "ArrowLeft" && !isFirst && !isNavigatingStep) {
        e.preventDefault();
        goToStep(stepIdx - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    tourOpen,
    isFirst,
    isLast,
    isNavigatingStep,
    stepIdx,
    handleClose,
    handleComplete,
    goToStep,
  ]);

  const actorPos: ActorPos = useMemo(() => {
    const vw = viewport.w;
    const vh = viewport.h;
    const actorW = actorRef.current?.offsetWidth || (isMobile ? Math.min(368, vw - 24) : 424);
    const actorH = actorRef.current?.offsetHeight || (isMobile ? 120 : 136);

    if (isMobile) {
      const x = Math.max(12, (vw - actorW) / 2);
      const lowerTarget = targetRect ? targetRect.top + targetRect.height / 2 > vh * 0.52 : false;
      const y =
        step.openThemeDock || lowerTarget ? 72 : Math.max(72, vh - actorH - 76);
      return { x, y, bubbleSide: "right" };
    }

    const margin = 16;
    const topMin = 68;
    const gap = 18;
    let x = vw - actorW - 24;
    let y = vh - actorH - 24;
    let bubbleSide: "left" | "right" = "right";

    if (isNavigatingStep && targetRect) {
      x = targetRect.left + targetRect.width + 18;
      y = targetRect.top + targetRect.height / 2 - actorH / 2;
      bubbleSide = "right";
    } else if (inLogicTrackDetail && targetRect) {
      x = targetRect.left + Math.min(targetRect.width * 0.35, 180);
      y = targetRect.top + targetRect.height + gap;
      bubbleSide = "right";
    } else if (step.openThemeDock && targetRect) {
      x = targetRect.left + targetRect.width / 2 - actorW / 2;
      y = targetRect.top - actorH - gap;
      bubbleSide = "right";
    } else if (targetRect) {
      const spaceAbove = targetRect.top - topMin;
      const spaceBelow = vh - (targetRect.top + targetRect.height) - margin;
      const spaceLeft = targetRect.left - margin;
      const spaceRight = vw - (targetRect.left + targetRect.width) - margin;
      const pref = step.preferredSide || "bottom";

      if (pref === "right" && spaceRight >= actorW + gap) {
        x = targetRect.left + targetRect.width + gap;
        y = targetRect.top + Math.min(24, Math.max(0, (targetRect.height - actorH) / 2));
        bubbleSide = "right";
      } else if (pref === "left" && spaceLeft >= actorW + gap) {
        x = targetRect.left - actorW - gap;
        y = targetRect.top + 12;
        bubbleSide = "left";
      } else if (pref === "bottom" && spaceBelow >= actorH + gap) {
        x = targetRect.left + Math.min(targetRect.width * 0.35, 180);
        y = targetRect.top + targetRect.height + gap;
        bubbleSide = "right";
      } else if (pref === "top" && spaceAbove >= actorH + gap) {
        x = targetRect.left + targetRect.width / 2 - actorW / 2;
        y = targetRect.top - actorH - gap;
        bubbleSide = "right";
      } else if (spaceBelow >= actorH + gap) {
        x = targetRect.left + Math.min(targetRect.width * 0.35, 180);
        y = targetRect.top + targetRect.height + gap;
        bubbleSide = "right";
      } else if (spaceRight >= actorW + gap) {
        x = targetRect.left + targetRect.width + gap;
        y = targetRect.top + 12;
        bubbleSide = "right";
      } else if (spaceLeft >= actorW + gap) {
        x = targetRect.left - actorW - gap;
        y = targetRect.top + 12;
        bubbleSide = "left";
      } else if (spaceAbove >= actorH + gap) {
        x = targetRect.left + targetRect.width / 2 - actorW / 2;
        y = targetRect.top - actorH - gap;
        bubbleSide = "right";
      }
    }

    return {
      x: Math.max(margin, Math.min(vw - actorW - margin, x)),
      y: Math.max(topMin, Math.min(vh - actorH - margin, y)),
      bubbleSide,
    };
  }, [
    viewport.w,
    viewport.h,
    isMobile,
    isNavigatingStep,
    inLogicTrackDetail,
    targetRect,
    step.openThemeDock,
    step.preferredSide,
  ]);

  useEffect(() => {
    if (!tourOpen) return;
    const prev = prevPosRef.current;
    prevPosRef.current = { x: actorPos.x, y: actorPos.y };

    if (prev) {
      const dx = actorPos.x - prev.x;
      const dy = actorPos.y - prev.y;
      if (Math.abs(dx) > 22 || Math.abs(dy) > 22) {
        setIsFlying(true);
        if (Math.abs(dx) > 16) {
          setFlightTilt(dx > 0 ? 9 : -9);
        }
        if (tiltTimerRef.current) window.clearTimeout(tiltTimerRef.current);
        tiltTimerRef.current = window.setTimeout(() => {
          setFlightTilt(0);
          setIsFlying(false);
        }, 1500);
      }
    }
  }, [tourOpen, stepIdx, pendingStepIdx, actorPos.x, actorPos.y]);

  if (!tourOpen || typeof document === "undefined") return null;

  const effectivePointing: LiaPointing = isNavigatingStep
    ? "left"
    : inLogicTrackDetail
      ? "up"
      : actorPos.bubbleSide === "left" && step.liaPointing === "left"
        ? "right"
        : step.liaPointing;

  const displayExpression = isNavigatingStep
    ? "curious"
    : inLogicTrackDetail
      ? "starry"
      : step.liaExpression;
  const displaySpeech =
    pendingStep?.transitionLabel ||
    (inLogicTrackDetail
      ? "Boa! Agora entra aqui na Aula 01 que eu abro minha aula em tela cheia pra você!"
      : step.speech);
  const displayStepNumber = (pendingStepIdx ?? stepIdx) + 1;

  return createPortal(
    <div ref={tourRootRef} role="dialog" aria-modal="false" aria-label="Tour guiado com a Lia">
      {targetRect && (
        <div
          className={`ce-tour-spotlight-box ${isNavigatingStep ? "is-nav-target" : ""}`}
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
          aria-hidden="true"
        />
      )}

      <motion.div
        ref={actorRef}
        className={`ce-tour-lia-actor ${actorPos.bubbleSide === "left" ? "is-bubble-left" : ""} ${
          isFlying ? "is-flying" : ""
        }`}
        data-tour-step={step.id}
        initial={{ opacity: 0, scale: 0.86, x: actorPos.x, y: actorPos.y + 18 }}
        animate={{ opacity: 1, scale: 1, x: actorPos.x, y: actorPos.y }}
        transition={{
          x: { type: "spring", stiffness: 22, damping: 11.5, mass: 1.7 },
          y: { type: "spring", stiffness: 22, damping: 11.5, mass: 1.7 },
          opacity: { duration: 0.7 },
          scale: { duration: 0.7 },
        }}
      >
        <motion.div
          className="ce-tour-lia-mascot"
          animate={{ rotate: flightTilt }}
          transition={{ type: "spring", stiffness: 60, damping: 12 }}
        >
          <LiaRobotMascot
            expression={displayExpression}
            speaking={false}
            visible
            pointing={effectivePointing}
            easterEgg={liaEgg}
            callout={liaCallout ?? undefined}
            onClick={handleLiaClick}
          />
        </motion.div>

        <div className={`ce-tour-bubble ${isNavigatingStep ? "is-transit" : ""}`}>
          <div className="ce-tour-bubble-top">
            <span className="ce-tour-step-counter">
              {displayStepNumber} / {steps.length}
            </span>

            <button
              type="button"
              className="ce-tour-bubble-close"
              onClick={handleClose}
              aria-label="Fechar tour"
              title="Fechar tour (Esc)"
            >
              <X size={13} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={
                pendingStep
                  ? `transit-${pendingStep.id}`
                  : inLogicTrackDetail
                    ? "logic-track-detail"
                    : step.id
              }
              className="ce-tour-bubble-text"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
            >
              {displaySpeech}
            </motion.p>
          </AnimatePresence>

          <div className="ce-tour-bubble-foot">
            <div className="ce-tour-dots" aria-label="Progresso do tour">
              {steps.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={isNavigatingStep}
                  className={`ce-tour-dot ${
                    idx === (pendingStepIdx ?? stepIdx)
                      ? "is-active"
                      : idx < (pendingStepIdx ?? stepIdx)
                      ? "is-done"
                      : ""
                  }`}
                  onClick={() => goToStep(idx)}
                  aria-label={`Ir para passo ${idx + 1}`}
                />
              ))}
            </div>

            <div className="ce-tour-bubble-actions">
              {!isFirst && (
                <button
                  type="button"
                  disabled={isNavigatingStep}
                  className="ce-btn ce-btn-ghost ce-btn-sm ce-tour-back-btn"
                  onClick={() => goToStep(stepIdx - 1)}
                  aria-label="Passo anterior"
                  title="Voltar"
                >
                  <ArrowLeft size={13} />
                </button>
              )}

              {inLogicTrackDetail ? (
                <button
                  type="button"
                  className="ce-btn ce-btn-primary ce-btn-sm"
                  onClick={() => navigate("/trilhas/logic/aula/logic-01")}
                >
                  <span>Abrir Aula 01</span>
                  <ArrowRight size={13} />
                </button>
              ) : isLast && !isNavigatingStep ? (
                <button
                  type="button"
                  className="ce-btn ce-btn-primary ce-btn-sm"
                  onClick={handleComplete}
                >
                  <Check size={13} />
                  <span>{step.ctaLabel || "Bora codar!"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isNavigatingStep}
                  className="ce-btn ce-btn-primary ce-btn-sm"
                  onClick={() => goToStep(stepIdx + 1)}
                >
                  <span>{isNavigatingStep ? "Indo..." : "Próximo"}</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
