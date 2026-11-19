import React, { useRef } from "react";
import { Link, type LinkProps } from "react-router-dom";

interface BaseProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  starBorder?: boolean;
  style?: React.CSSProperties;
  "data-tour"?: string;
}

type DivProps = BaseProps & {
  as?: "div";
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

type ButtonProps = BaseProps & {
  as: "button";
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
};

type NavLinkProps = BaseProps &
  Pick<LinkProps, "to"> & {
    as: "link";
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  };

export type SpotlightCardProps = DivProps | ButtonProps | NavLinkProps;

/*
 * React Bits (DavidHDev/react-bits) — SpotlightCard + StarBorder opcional.
 * Ilumina tanto o interior quanto a borda do cartão seguindo o cursor sem re-render React.
 */
export const SpotlightCard: React.FC<SpotlightCardProps> = props => {
  const {
    children,
    className = "",
    spotlightColor = "rgba(var(--accent-rgb), 0.24)",
    starBorder = false,
    style,
  } = props;
  const elRef = useRef<HTMLElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = elRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
    el.style.setProperty("--spot-color", spotlightColor);
  };

  const mergedClass = `ce-spotlight-card ${starBorder ? "ce-star-border" : ""} ${className}`.trim();

  if (props.as === "link") {
    return (
      <Link
        ref={elRef as React.RefObject<HTMLAnchorElement>}
        to={props.to}
        onClick={props.onClick}
        onMouseMove={handleMouseMove}
        data-tour={props["data-tour"]}
        className={mergedClass}
        style={style}
      >
        {children}
      </Link>
    );
  }

  if (props.as === "button") {
    return (
      <button
        ref={elRef as React.RefObject<HTMLButtonElement>}
        type={props.type || "button"}
        onClick={props.onClick}
        onMouseMove={handleMouseMove}
        data-tour={props["data-tour"]}
        aria-label={props["aria-label"]}
        className={mergedClass}
        style={style}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      ref={elRef as React.RefObject<HTMLDivElement>}
      onClick={props.onClick}
      onMouseMove={handleMouseMove}
      data-tour={props["data-tour"]}
      className={mergedClass}
      style={style}
    >
      {children}
    </div>
  );
};
