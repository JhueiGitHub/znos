// app/apps/milanote/components/ZoomControls.tsx
import React from "react";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { useStyles } from "@/app/hooks/useStyles";
import { Position } from "../types";

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}) => {
  const { getColor } = useStyles();

  return (
    <div
      className="absolute bottom-6 right-6 flex items-center gap-2 px-3 py-2 rounded-md shadow-md z-40"
      style={{
        backgroundColor: getColor("black-med"),
        border: `1px solid ${getColor("black-thin")}`,
      }}
    >
      <button
        onClick={onZoomOut}
        className="p-1 rounded-md hover:bg-white/5 transition-colors"
        title="Zoom out (Ctrl+-)"
      >
        <ZoomOut size={16} color={getColor("smoke-med")} />
      </button>

      <div
        className="px-2 text-xs font-mono"
        style={{ color: getColor("smoke") }}
      >
        {Math.round(scale * 100)}%
      </div>

      <button
        onClick={onZoomIn}
        className="p-1 rounded-md hover:bg-white/5 transition-colors"
        title="Zoom in (Ctrl+=)"
      >
        <ZoomIn size={16} color={getColor("smoke-med")} />
      </button>

      <div className="mx-1 h-4 w-px bg-white/10" />

      <button
        onClick={onReset}
        className="p-1 rounded-md hover:bg-white/5 transition-colors"
        title="Reset view (Ctrl+0)"
      >
        <Maximize size={16} color={getColor("smoke-med")} />
      </button>
    </div>
  );
};

export default ZoomControls;
