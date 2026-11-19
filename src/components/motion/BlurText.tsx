import React from "react";
import { motion } from "motion/react";

interface BlurTextProps {
  text: string;
  highlight?: string;
  className?: string;
}

/* Inspirado no BlurText de DavidHDev/react-bits com motion/react e respeito a reducedMotion */
export const BlurText: React.FC<BlurTextProps> = ({ text, highlight, className }) => {
  const words = text.split(" ");
  const highlightTokens = (highlight || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return (
    <span
      className={className ? `ce-blur-root ${className}` : "ce-blur-root"}
      style={{ display: "inline", color: "inherit", whiteSpace: "normal" }}
    >
      {words.map((word, idx) => {
        const clean = word.replace(/[.,!?:;]/g, "").toLowerCase();
        const isHighlighted = highlightTokens.includes(clean);
        return (
          <React.Fragment key={`${word}-${idx}`}>
            <motion.span
              className={isHighlighted ? "ce-blur-highlight" : "ce-blur-word"}
              initial={{ opacity: 0, filter: "blur(5px)", y: 4 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 0.32,
                delay: Math.min(0.22, idx * 0.03),
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ display: "inline-block" }}
            >
              {word}
            </motion.span>
            {idx < words.length - 1 ? " " : ""}
          </React.Fragment>
        );
      })}
    </span>
  );
};
