"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DAWComponent } from "../types";
import PianoRoll from "./daw/PianoRoll";
import TrackLane from "./daw/TrackLane";
import MixerChannel from "./daw/MixerChannel";
import Timeline from "./daw/Timeline";
import Transport from "./daw/Transport";
import Waveform from "./daw/Waveform";
import { EffectsRack } from "./daw/EffectsRack";
import { Instrument } from "./daw/Instrument";
import { Sequencer } from "./daw/Sequencer";
import { Automation } from "./daw/Automation";

interface Props {
  components: DAWComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Partial<DAWComponent>) => void;
  onDeleteComponent: (id: string) => void;
  onAddComponent: (
    type: DAWComponent["type"],
    position: { x: number; y: number }
  ) => void;
}

export default function EmovereCanvas({
  components,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onAddComponent,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
  const [isDraggingComponent, setIsDraggingComponent] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Handle canvas double-click to add component
  const handleCanvasDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDraggingComponent) return;

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const x = (e.clientX - canvasRect.left - canvasPosition.x) / scale;
      const y = (e.clientY - canvasRect.top - canvasPosition.y) / scale;

      // Default to piano roll when double-clicking canvas
      onAddComponent("piano-roll", { x, y });
    },
    [canvasPosition, scale, isDraggingComponent, onAddComponent]
  );

  // Handle mouse down for panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const clickTime = new Date().getTime();
      const isDoubleClick = clickTime - lastClickTime < 300;
      setLastClickTime(clickTime);

      if (
        isDoubleClick &&
        e.button === 0 &&
        !e.altKey &&
        !isDraggingComponent
      ) {
        handleCanvasDoubleClick(e);
        return;
      }

      if (
        (e.button === 1 || (e.button === 0 && e.altKey)) &&
        !isDraggingComponent
      ) {
        e.preventDefault();
        setIsPanning(true);
        setStartPanPosition({ x: e.clientX, y: e.clientY });
        document.body.style.cursor = "grabbing";
      }
    },
    [handleCanvasDoubleClick, isDraggingComponent, lastClickTime]
  );

  // Handle mouse move for panning
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isPanning) return;

      const dx = e.clientX - startPanPosition.x;
      const dy = e.clientY - startPanPosition.y;

      setCanvasPosition({
        x: canvasPosition.x + dx,
        y: canvasPosition.y + dy,
      });

      setStartPanPosition({ x: e.clientX, y: e.clientY });
    },
    [isPanning, startPanPosition, canvasPosition]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      document.body.style.cursor = "default";
    }
  }, [isPanning]);

  // Handle wheel for zooming
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const mouseXInCanvas = (mouseX - canvasPosition.x) / scale;
        const mouseYInCanvas = (mouseY - canvasPosition.y) / scale;

        const delta = -e.deltaY * 0.001;
        const newScale = Math.max(0.1, Math.min(3, scale + delta));

        const newX = mouseX - mouseXInCanvas * newScale;
        const newY = mouseY - mouseYInCanvas * newScale;

        setScale(newScale);
        setCanvasPosition({ x: newX, y: newY });
      } else {
        // Pan with wheel
        setCanvasPosition({
          x: canvasPosition.x - e.deltaX,
          y: canvasPosition.y - e.deltaY,
        });
      }
    },
    [canvasPosition, scale]
  );

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const componentType = e.dataTransfer.getData(
        "componentType"
      ) as DAWComponent["type"];
      if (!componentType) return;

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const x = (e.clientX - canvasRect.left - canvasPosition.x) / scale;
      const y = (e.clientY - canvasRect.top - canvasPosition.y) / scale;

      onAddComponent(componentType, { x, y });
    },
    [canvasPosition, scale, onAddComponent]
  );

  // Click outside to deselect
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onSelectComponent(null);
      }
    },
    [onSelectComponent]
  );

  // Set up event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        handleMouseMove(e);
      }
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
      }
    };
  }, [isPanning, handleMouseMove, handleMouseUp, handleWheel]);

  const renderComponent = (component: DAWComponent) => {
    const commonProps = {
      id: component.id,
      position: component.position,
      size: component.size,
      isSelected: selectedComponentId === component.id,
      onSelect: () => onSelectComponent(component.id),
      onUpdate: (updates: Partial<DAWComponent>) =>
        onUpdateComponent(component.id, updates),
      onStartDrag: () => setIsDraggingComponent(true),
      onEndDrag: () => setIsDraggingComponent(false),
      trackId: component.id,
    };

    switch (component.type) {
      case "piano-roll":
        return <PianoRoll key={component.id} {...commonProps} />;
      case "track-lane":
        return <TrackLane key={component.id} {...commonProps} />;
      case "mixer-channel":
        return <MixerChannel key={component.id} {...commonProps} />;
      case "timeline":
        return <Timeline key={component.id} {...commonProps} />;
      case "transport":
        return <Transport key={component.id} {...commonProps} />;
      case "waveform":
        return <Waveform key={component.id} {...commonProps} />;
      case "effects-rack":
        return <EffectsRack key={component.id} {...commonProps} />;
      case "instrument":
        return <Instrument key={component.id} {...commonProps} />;
      case "sequencer":
        return <Sequencer key={component.id} {...commonProps} />;
      case "automation":
        return <Automation key={component.id} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 overflow-hidden bg-[#000000]"
      style={{
        cursor: isPanning ? "grabbing" : "default",
        backgroundImage: `
          linear-gradient(to right, #29292910 1px, transparent 1px),
          linear-gradient(to bottom, #29292910 1px, transparent 1px)
        `,
        backgroundSize: `${50 * scale}px ${50 * scale}px`,
        backgroundPosition: `${canvasPosition.x}px ${canvasPosition.y}px`,
      }}
      onMouseDown={handleMouseDown}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
      <div
        className="absolute"
        style={{
          transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${scale})`,
          transformOrigin: "0 0",
          width: "10000px",
          height: "10000px",
        }}
      >
        {[...components]
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map(renderComponent)}
      </div>

      {/* Scale indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-4 left-4 bg-[#292929]/80 backdrop-blur-sm rounded-lg px-3 py-1 text-[#CCCCCC] text-sm"
      >
        {Math.round(scale * 100)}%
      </motion.div>
    </div>
  );
}
