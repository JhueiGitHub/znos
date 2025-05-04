"use client";

import React from "react";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { useStyles } from "@/app/hooks/useStyles";

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
      className="absolute bottom-5 right-5 flex items-center p-2 rounded-lg z-10"
      style={{ backgroundColor: getColor("black-thick") }}
    >
      <button
        className="p-2 rounded-md hover:bg-black-med transition"
        onClick={onZoomOut}
        title="Zoom Out"
      >
        <ZoomOut size={18} color={getColor("latte")} />
      </button>
      
      <div
        className="mx-2 px-2 select-none"
        style={{ color: getColor("latte") }}
        onClick={onReset}
        title="Reset Zoom"
      >
        {Math.round(scale * 100)}%
      </div>
      
      <button
        className="p-2 rounded-md hover:bg-black-med transition"
        onClick={onZoomIn}
        title="Zoom In"
      >
        <ZoomIn size={18} color={getColor("latte")} />
      </button>
      
      <button
        className="ml-2 p-2 rounded-md hover:bg-black-med transition"
        onClick={onReset}
        title="Reset View"
      >
        <Maximize size={18} color={getColor("latte")} />
      </button>
    </div>
  );
};

export default ZoomControls;
