import React from "react";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percent,
  size = 82,
  strokeWidth = 7,
  color = "var(--accent-blue)",
  label,
  sublabel,
}) => {
  const clamped = Math.max(0, Math.min(100, percent));
  const animatedPercent = useAnimatedNumber(Math.round(clamped), 480);
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clamped / 100) * circ;

  return (
    <div className="ce-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(148, 163, 184, 0.16)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.55s var(--ease-out-expo, ease)" }}
        />
      </svg>
      <div className="ce-ring-center">
        <strong>{label ?? `${animatedPercent}%`}</strong>
        {sublabel && <span>{sublabel}</span>}
      </div>
    </div>
  );
};
