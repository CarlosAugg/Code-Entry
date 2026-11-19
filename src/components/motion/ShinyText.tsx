import React from "react";

interface ShinyTextProps {
  text: string;
  speed?: number;
  className?: string;
}

/*
 * React Bits (DavidHDev/react-bits) — ShinyText.
 * Aplica um reflexo metálico suave percorrendo textos e badges.
 */
export const ShinyText: React.FC<ShinyTextProps> = ({ text, speed = 4, className = "" }) => {
  return (
    <span
      className={`ce-shiny-text ${className}`.trim()}
      style={{ "--shiny-duration": `${speed}s` } as React.CSSProperties}
    >
      {text}
    </span>
  );
};
