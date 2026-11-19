import React from "react";
import { Network, Workflow } from "lucide-react";
import { TRACK_MAP } from "../../data/tracks";
import type { TrackId } from "../../types/curriculum";

interface TechIconProps {
  trackId: TrackId;
  size?: number;
  boxed?: boolean;
}

export const TechIcon: React.FC<TechIconProps> = ({ trackId, size = 28, boxed = false }) => {
  const track = TRACK_MAP[trackId];
  const content = track.iconPath ? (
    <img
      src={track.iconPath}
      alt={`Logo ${track.name}`}
      style={{ width: size, height: size, objectFit: "contain", display: "block" }}
    />
  ) : trackId === "logic" ? (
    <Workflow
      size={Math.round(size * 0.88)}
      style={{ color: track.accentColor }}
      strokeWidth={2}
      aria-label={`Ícone ${track.name}`}
    />
  ) : (
    <Network
      size={Math.round(size * 0.88)}
      style={{ color: track.accentColor }}
      strokeWidth={2}
      aria-label={`Ícone ${track.name}`}
    />
  );

  if (!boxed) return content;

  return (
    <div
      className="ce-track-icon-box"
      style={{
        width: size + 16,
        height: size + 16,
        background: track.accentSoft,
        borderColor: track.accentBorder,
      }}
    >
      {content}
    </div>
  );
};
