import React from "react";

export const SkeletonBlock: React.FC<{
  height?: number | string;
  width?: number | string;
  radius?: number;
  style?: React.CSSProperties;
}> = ({ height = 18, width = "100%", radius = 10, style }) => (
  <div
    className="ce-skeleton"
    aria-hidden="true"
    style={{ height, width, borderRadius: radius, ...style }}
  />
);

export const DashboardSkeleton: React.FC = () => (
  <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 310px", gap: 22 }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="ce-card" style={{ padding: 26, display: "flex", flexDirection: "column", gap: 14 }}>
        <SkeletonBlock width={140} height={24} radius={999} />
        <SkeletonBlock width="72%" height={34} />
        <SkeletonBlock width="58%" height={16} />
        <SkeletonBlock width={180} height={42} radius={12} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="ce-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <SkeletonBlock width="65%" height={18} />
            <SkeletonBlock width="40%" height={14} />
            <SkeletonBlock width="100%" height={6} radius={999} />
          </div>
        ))}
      </div>

      <div className="ce-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <SkeletonBlock width={200} height={18} />
        <SkeletonBlock width="90%" height={24} />
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="ce-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <SkeletonBlock width={120} height={18} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <SkeletonBlock width={86} height={86} radius={999} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <SkeletonBlock width="80%" height={18} />
            <SkeletonBlock width="60%" height={14} />
          </div>
        </div>
      </div>

      <div className="ce-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <SkeletonBlock width={150} height={18} />
        <SkeletonBlock width="100%" height={42} />
        <SkeletonBlock width="100%" height={42} />
      </div>
    </div>
  </div>
);
