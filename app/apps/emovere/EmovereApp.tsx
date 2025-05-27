"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EmovereCanvas from "./components/EmovereCanvas";
import EmovereToolkit from "./components/EmovereToolkit";
import EmovereHeader from "./components/EmovereHeader";
import { useCanvasState } from "./hooks/useCanvasState";
import { DAWComponent } from "./types";

export default function EmovereApp() {
  const [components, setComponents] = useState<DAWComponent[]>([]);
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const nextId = useRef(1);

  const generateId = () => {
    return `component-${nextId.current++}`;
  };

  const handleAddComponent = (type: DAWComponent["type"], position: { x: number; y: number }) => {
    const newComponent: DAWComponent = {
      id: generateId(),
      type,
      position,
      size: getDefaultSize(type),
      zIndex: components.length + 1,
    };
    setComponents([...components, newComponent]);
  };

  const getDefaultSize = (type: DAWComponent["type"]) => {
    switch (type) {
      case "piano-roll":
        return { width: 800, height: 400 };
      case "track-lane":
        return { width: 1000, height: 120 };
      case "mixer-channel":
        return { width: 80, height: 400 };
      case "timeline":
        return { width: 1000, height: 60 };
      case "transport":
        return { width: 400, height: 80 };
      case "waveform":
        return { width: 600, height: 200 };
      case "effects-rack":
        return { width: 300, height: 400 };
      case "instrument":
        return { width: 600, height: 350 };
      case "sequencer":
        return { width: 500, height: 300 };
      case "automation":
        return { width: 800, height: 200 };
      default:
        return { width: 300, height: 200 };
    }
  };

  const handleUpdateComponent = (id: string, updates: Partial<DAWComponent>) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  const handleDeleteComponent = (id: string) => {
    setComponents(components.filter(comp => comp.id !== id));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };

  const handleSelectComponent = (id: string | null) => {
    setSelectedComponentId(id);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedComponentId) {
        handleDeleteComponent(selectedComponentId);
      }
      if (e.key === "Escape") {
        setSelectedComponentId(null);
      }
      if (e.key === "t" && e.metaKey) {
        e.preventDefault();
        setIsToolkitOpen(!isToolkitOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedComponentId, isToolkitOpen]);

  return (
    <div className="h-full w-full flex flex-col bg-[#000000] overflow-hidden">
      <EmovereHeader />
      
      <div className="flex-1 relative">
        <EmovereCanvas
          components={components}
          selectedComponentId={selectedComponentId}
          onSelectComponent={handleSelectComponent}
          onUpdateComponent={handleUpdateComponent}
          onDeleteComponent={handleDeleteComponent}
          onAddComponent={handleAddComponent}
        />
        
        <EmovereToolkit
          isOpen={isToolkitOpen}
          onToggle={() => setIsToolkitOpen(!isToolkitOpen)}
          onAddComponent={handleAddComponent}
        />
        
        {/* Floating info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 bg-[#292929]/80 backdrop-blur-sm rounded-lg p-3 text-[#CCCCCC] text-sm"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#4C4F69]">⌘T</span>
            <span>Toggle Toolkit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#4C4F69]">Double-click</span>
            <span>Add Component</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
