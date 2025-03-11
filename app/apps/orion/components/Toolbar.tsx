// app/apps/orion/components/Toolbar.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import { useOrionStore } from "../lib/store";
import { StarfieldOptions } from "../lib/types";
import {
  Menu,
  PanelLeft,
  LayoutGrid,
  ZoomIn,
  ZoomOut,
  Save,
  Share2,
  Search,
  Star,
  SlidersHorizontal,
  Palette,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

export function Toolbar() {
  const { getColor, getFont } = useStyles();
  const {
    isSidebarOpen,
    toggleSidebar,
    isToolbarOpen,
    toggleToolbar,
    viewport,
    setViewport,
    starfieldOptions,
    updateStarfieldOptions,
    activeCanvasId,
    canvases,
  } = useOrionStore();

  const [showStarSettings, setShowStarSettings] = useState(false);

  const handleZoomIn = () => {
    const newZoom = Math.min(10, viewport.zoom * 1.2);
    setViewport({
      zoom: newZoom,
      pan: viewport.pan,
    });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.1, viewport.zoom * 0.8);
    setViewport({
      zoom: newZoom,
      pan: viewport.pan,
    });
  };

  const handleDensityChange = (value: number[]) => {
    updateStarfieldOptions({ density: value[0] });
  };

  const handleSpeedChange = (value: number[]) => {
    updateStarfieldOptions({
      speed: [value[0] / 100, value[0] / 20],
    });
  };

  const handleSizeChange = (value: number[]) => {
    updateStarfieldOptions({
      size: [0.5, value[0]],
    });
  };

  const handleDepthChange = (value: number[]) => {
    updateStarfieldOptions({ depth: value[0] });
  };

  const handleParallaxChange = (value: number[]) => {
    updateStarfieldOptions({ parallaxFactor: value[0] / 10 });
  };

  const currentCanvas = activeCanvasId ? canvases[activeCanvasId] : null;

  return (
    <div className="fixed top-0 left-0 right-0 z-20 p-2 flex gap-2 items-center">
      <div
        className="px-4 py-2 rounded-md shadow-md flex items-center gap-2"
        style={{
          backgroundColor: getColor("Overlaying BG"),
          borderColor: getColor("Brd"),
          color: getColor("Text Primary (Hd)"),
          fontFamily: getFont("Text Primary"),
        }}
      >
        <button
          className="p-1.5 rounded hover:bg-black/20 transition-colors"
          onClick={toggleSidebar}
        >
          <PanelLeft size={18} />
        </button>

        <div
          className="h-5 border-r mx-1"
          style={{ borderColor: getColor("Brd") }}
        ></div>

        <button
          className="p-1.5 rounded hover:bg-black/20 transition-colors"
          onClick={() => setShowStarSettings(!showStarSettings)}
        >
          <Star size={18} />
        </button>

        <div
          className="h-5 border-r mx-1"
          style={{ borderColor: getColor("Brd") }}
        ></div>

        <div className="flex items-center gap-2">
          <button
            className="p-1.5 rounded hover:bg-black/20 transition-colors"
            onClick={handleZoomOut}
          >
            <ZoomOut size={18} />
          </button>

          <span className="text-sm">{Math.round(viewport.zoom * 100)}%</span>

          <button
            className="p-1.5 rounded hover:bg-black/20 transition-colors"
            onClick={handleZoomIn}
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      <div
        className="flex-grow px-4 py-2 rounded-md shadow-md flex items-center"
        style={{
          backgroundColor: getColor("Overlaying BG"),
          borderColor: getColor("Brd"),
          color: getColor("Text Primary (Hd)"),
          fontFamily: getFont("Text Primary"),
        }}
      >
        <h1 className="text-lg font-medium">
          {currentCanvas?.name || "Orion Canvas"}
        </h1>
      </div>

      <div
        className="px-2 py-2 rounded-md shadow-md flex items-center gap-1"
        style={{
          backgroundColor: getColor("Overlaying BG"),
          borderColor: getColor("Brd"),
          color: getColor("Text Primary (Hd)"),
          fontFamily: getFont("Text Primary"),
        }}
      >
        <button
          className="p-1.5 rounded hover:bg-black/20 transition-colors"
          onClick={() => {}}
        >
          <Search size={18} />
        </button>

        <button
          className="p-1.5 rounded hover:bg-black/20 transition-colors"
          onClick={() => {}}
        >
          <LayoutGrid size={18} />
        </button>

        <button
          className="p-1.5 rounded hover:bg-black/20 transition-colors"
          onClick={() => {}}
        >
          <Share2 size={18} />
        </button>

        <button
          className="p-1.5 rounded hover:bg-black/20 transition-colors"
          onClick={() => {}}
        >
          <Save size={18} />
        </button>
      </div>

      {/* Star field settings panel */}
      <AnimatePresence>
        {showStarSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute left-1/2 transform -translate-x-1/2 top-14 p-4 rounded-md shadow-lg"
            style={{
              backgroundColor: getColor("Overlaying BG"),
              borderColor: getColor("Brd"),
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
              width: "400px",
              border: `1px solid ${getColor("Brd")}`,
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold">Starfield Settings</h3>
              <button
                className="p-1 rounded-full hover:bg-black/20"
                onClick={() => setShowStarSettings(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Star Density</span>
                  <span>{starfieldOptions.density}</span>
                </div>
                <Slider
                  value={[starfieldOptions.density]}
                  min={10}
                  max={200}
                  step={5}
                  onValueChange={handleDensityChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Star Size</span>
                  <span>{starfieldOptions.size[1]}</span>
                </div>
                <Slider
                  value={[starfieldOptions.size[1]]}
                  min={1}
                  max={5}
                  step={0.5}
                  onValueChange={handleSizeChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Animation Speed</span>
                  <span>
                    {Math.round(starfieldOptions.speed[1] * 100) / 100}
                  </span>
                </div>
                <Slider
                  value={[starfieldOptions.speed[1] * 100]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={handleSpeedChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Star Depth</span>
                  <span>{starfieldOptions.depth}</span>
                </div>
                <Slider
                  value={[starfieldOptions.depth]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={handleDepthChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Parallax Effect</span>
                  <span>{starfieldOptions.parallaxFactor}</span>
                </div>
                <Slider
                  value={[starfieldOptions.parallaxFactor * 10]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={handleParallaxChange}
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {starfieldOptions.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full cursor-pointer"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      // Color picker implementation would go here
                    }}
                  />
                ))}
                <button
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: getColor("black-thin"),
                    color: getColor("Text Primary (Hd)"),
                  }}
                >
                  <Palette size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
