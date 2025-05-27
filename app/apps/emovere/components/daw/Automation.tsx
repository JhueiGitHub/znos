import React, { useRef, useState } from "react";

interface AutomationPoint {
  x: number; // 0-1 (relative time)
  y: number; // 0-1 (relative value)
}

interface AutomationProps {
  width?: number;
  height?: number;
  points?: AutomationPoint[];
  onChange?: (points: AutomationPoint[]) => void;
}

export const Automation: React.FC<AutomationProps> = ({
  width = 400,
  height = 120,
  points: initialPoints = [
    { x: 0, y: 0.5 },
    { x: 1, y: 0.5 },
  ],
  onChange,
}) => {
  const [points, setPoints] = useState<AutomationPoint[]>(initialPoints);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handlePointerDown = (idx: number) => setDragIdx(idx);
  const handlePointerUp = () => setDragIdx(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragIdx === null) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / width));
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / height));
    setPoints((prev) => {
      const copy = [...prev];
      copy[dragIdx] = { x, y };
      if (onChange) onChange(copy);
      return copy;
    });
  };

  // Draw automation curve as SVG path
  const path = points
    .map(
      (pt, i) =>
        `${i === 0 ? "M" : "L"} ${pt.x * width} ${height - pt.y * height}`
    )
    .join(" ");

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{
        background: "#181818",
        borderRadius: 8,
        touchAction: "none",
        cursor: dragIdx !== null ? "grabbing" : "pointer",
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <path d={path} stroke="#4fd1c5" strokeWidth={2} fill="none" />
      {points.map((pt, idx) => (
        <circle
          key={idx}
          cx={pt.x * width}
          cy={height - pt.y * height}
          r={8}
          fill={dragIdx === idx ? "#319795" : "#fff"}
          stroke="#4fd1c5"
          strokeWidth={2}
          onPointerDown={() => handlePointerDown(idx)}
        />
      ))}
    </svg>
  );
};
