"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  Music,
  Sliders,
  Zap,
  Clock,
} from "lucide-react";
import { DAWComponent, ToolkitItem } from "../types";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  onAddComponent: (
    type: DAWComponent["type"],
    position: { x: number; y: number }
  ) => void;
}

const toolkitItems: ToolkitItem[] = [
  // Composition
  {
    type: "piano-roll",
    name: "Piano Roll",
    icon: "🎹",
    description: "MIDI note editor with velocity and timing",
    category: "composition",
  },
  {
    type: "sequencer",
    name: "Step Sequencer",
    icon: "⬜",
    description: "Grid-based pattern sequencer",
    category: "composition",
  },
  {
    type: "track-lane",
    name: "Track Lane",
    icon: "━",
    description: "Audio/MIDI track with clips",
    category: "composition",
  },
  {
    type: "automation",
    name: "Automation Lane",
    icon: "📈",
    description: "Parameter automation curves",
    category: "composition",
  },

  // Mixing
  {
    type: "mixer-channel",
    name: "Mixer Channel",
    icon: "🎚️",
    description: "Channel strip with fader and FX",
    category: "mixing",
  },
  {
    type: "waveform",
    name: "Waveform Display",
    icon: "〰️",
    description: "Audio waveform visualizer",
    category: "mixing",
  },

  // Effects
  {
    type: "effects-rack",
    name: "Effects Rack",
    icon: "🎛️",
    description: "Chain multiple audio effects",
    category: "effects",
  },
  {
    type: "instrument",
    name: "Instrument",
    icon: "🎸",
    description: "Virtual instrument interface",
    category: "effects",
  },

  // Timing
  {
    type: "timeline",
    name: "Timeline",
    icon: "📏",
    description: "Project timeline ruler",
    category: "timing",
  },
  {
    type: "transport",
    name: "Transport",
    icon: "▶️",
    description: "Playback controls",
    category: "timing",
  },
];

const categoryIcons = {
  composition: <Music size={16} />,
  mixing: <Sliders size={16} />,
  effects: <Zap size={16} />,
  timing: <Clock size={16} />,
};

export default function EmovereToolkit({
  isOpen,
  onToggle,
  onAddComponent,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<ToolkitItem | null>(null);

  const categories = Array.from(
    new Set(toolkitItems.map((item) => item.category))
  );
  const filteredItems = selectedCategory
    ? toolkitItems.filter((item) => item.category === selectedCategory)
    : toolkitItems;

  const handleDragStart = (e: React.DragEvent, item: ToolkitItem) => {
    setDraggedItem(item);
    e.dataTransfer.setData("componentType", item.type);
    e.dataTransfer.effectAllowed = "move";

    // Create custom drag image
    const dragImage = document.createElement("div");
    dragImage.className = "drag-ghost";
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    dragImage.style.padding = "12px 20px";
    dragImage.style.background = "#4C4F69";
    dragImage.style.color = "white";
    dragImage.style.borderRadius = "8px";
    dragImage.style.fontSize = "14px";
    dragImage.style.fontWeight = "500";
    dragImage.textContent = item.name;
    document.body.appendChild(dragImage);

    e.dataTransfer.setDragImage(dragImage, 50, 20);

    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={onToggle}
        className="absolute bottom-[90px] left-1/2 -translate-x-1/2 z-50 bg-[#292929] hover:bg-[#4C4F69] transition-colors rounded-full p-3 shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <ChevronDown size={20} color="#CCCCCC" />
        ) : (
          <ChevronUp size={20} color="#CCCCCC" />
        )}
      </motion.button>

      {/* Toolkit Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-[#000000]/95 backdrop-blur-xl border-t border-[#29292981] shadow-2xl"
            style={{ height: "320px" }}
          >
            <div className="h-full flex flex-col p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#CCCCCC]">
                  Component Toolkit
                </h2>

                {/* Category Filter */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedCategory === null
                        ? "bg-[#4C4F69] text-white"
                        : "bg-[#292929] text-[#CCCCCC] hover:bg-[#292929]/80"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        selectedCategory === category
                          ? "bg-[#4C4F69] text-white"
                          : "bg-[#292929] text-[#CCCCCC] hover:bg-[#292929]/80"
                      }`}
                    >
                      {categoryIcons[category as keyof typeof categoryIcons]}
                      <span className="capitalize">{category}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Components Grid */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-5 gap-4">
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragEnd={handleDragEnd}
                      className="group relative bg-[#292929] hover:bg-[#292929]/80 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Component Icon */}
                      <div className="text-3xl mb-2 text-center">
                        {item.icon}
                      </div>

                      {/* Component Name */}
                      <div className="text-sm font-medium text-[#CCCCCC] text-center mb-1">
                        {item.name}
                      </div>

                      {/* Category Badge */}
                      <div className="flex justify-center">
                        <span className="text-xs px-2 py-1 bg-[#000000]/50 rounded-full text-[#4C4F69] capitalize">
                          {item.category}
                        </span>
                      </div>

                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-[#4C4F69] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {item.description}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-4 text-center text-sm text-[#CCCCCC]/60">
                Drag components onto the canvas or double-click the canvas to
                add a Piano Roll
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
