import confetti from "canvas-confetti";

export function isReducedMotionActive(): boolean {
  if (typeof document === "undefined" || typeof window === "undefined") return true;
  if (document.documentElement.classList.contains("reduced-motion")) return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function fireCompletionConfetti(accentColor?: string): void {
  if (typeof window === "undefined" || isReducedMotionActive()) return;

  const isMobile = window.innerWidth <= 680;
  const colors = [accentColor, "#8b5cf6", "#38bdf8", "#4ade80", "#facc15"].filter(
    (c): c is string => Boolean(c && /^#[0-9a-f]{3,8}$/i.test(c))
  );

  try {
    confetti({
      particleCount: isMobile ? 22 : 34,
      spread: isMobile ? 48 : 58,
      startVelocity: isMobile ? 24 : 30,
      gravity: 1.05,
      ticks: 125,
      scalar: isMobile ? 0.78 : 0.88,
      origin: isMobile ? { x: 0.5, y: 0.72 } : { x: 0.82, y: 0.78 },
      colors: colors.length > 0 ? colors : ["#8b5cf6", "#38bdf8", "#4ade80"],
      disableForReducedMotion: true,
    });
  } catch {
    // Fallback silencioso caso o navegador bloqueie canvas
  }
}

export function fireAchievementConfetti(accentColor = "#FACC15"): void {
  if (typeof window === "undefined" || isReducedMotionActive()) return;

  const isMobile = window.innerWidth <= 680;
  const safeAccent = /^#[0-9a-f]{3,8}$/i.test(accentColor) ? accentColor : "#FACC15";

  try {
    confetti({
      particleCount: isMobile ? 16 : 24,
      spread: 48,
      startVelocity: 25,
      ticks: 110,
      scalar: 0.82,
      origin: isMobile ? { x: 0.5, y: 0.72 } : { x: 0.84, y: 0.82 },
      colors: [safeAccent, "#a78bfa", "#ffffff"],
      disableForReducedMotion: true,
    });
  } catch {
    // Ignora falha de canvas em ambiente headless restrito
  }
}
