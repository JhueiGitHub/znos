"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLessonStore } from "../../store/lessonStore";
import { useStyles } from "@/app/hooks/useStyles";
import { Position, LessonItem } from "../../types";

// Item renderers
import TextItem from "../items/TextItem";
import DrawingItem from "../items/DrawingItem";
import ShapeItem from "../items/ShapeItem";
import ConnectorItem from "../items/ConnectorItem";
import HandwritingItem from "../items/HandwritingItem";
import VideoItem from "../items/VideoItem";
import ZoomControls from "./ZoomControls";

const LessonCanvas: React.FC = () => {
  const { getColor } = useStyles();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const activeLesson = useLessonStore((state) => state.activeLesson);
  const activeCanvas = useLessonStore((state) => state.activeCanvas);
  const lessons = useLessonStore((state) => state.lessons);
  const selectedItems = useLessonStore((state) => state.selectedItems);
  const updateItemPosition = useLessonStore((state) => state.updateItemPosition);
  const addItem = useLessonStore((state) => state.addItem);
  const bringToFront = useLessonStore((state) => state.bringToFront);
  const selectItem = useLessonStore((state) => state.selectItem);
  const deselectItem = useLessonStore((state) => state.deselectItem);
  const clearSelection = useLessonStore((state) => state.clearSelection);
  const selectMultipleItems = useLessonStore((state) => state.selectMultipleItems);
  
  // Canvas state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPosition, setStartPanPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState<Position[]>([]);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    isSelecting: boolean;
  } | null>(null);
  const [handTool, setHandTool] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  
  // Get current canvas items
  const currentCanvas = activeLesson && activeCanvas 
    ? lessons[activeLesson]?.canvases.find(canvas => canvas.id === activeCanvas)
    : null;
    
  const items = currentCanvas?.items || [];

  // Handle canvas interactions
  
  // Double click to create new item
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!activeLesson || !activeCanvas || isDraggingItem) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const x = (e.clientX - canvasRect.left - position.x) / scale;
    const y = (e.clientY - canvasRect.top - position.y) / scale;
    
    // Apply grid snapping if enabled
    const snappedPos = snapToGrid 
      ? { 
          x: Math.round(x / gridSize) * gridSize,
          y: Math.round(y / gridSize) * gridSize
        }
      : { x, y };
    
    // Create appropriate item based on active tool
    switch (activeTool) {
      case "text":
        addItem(
          activeLesson,
          activeCanvas,
          "text",
          snappedPos,
          {
            text: "Double-click to edit text",
            style: {
              fontFamily: "'Roboto', sans-serif",
              fontSize: 16,
              fontWeight: "normal",
              textAlign: "left",
              color: "#ffffff",
              padding: 8,
            },
          },
          { width: 200, height: 100 }
        );
        break;
      case "handwriting":
        addItem(
          activeLesson,
          activeCanvas,
          "handwriting",
          snappedPos,
          {
            paths: [],
            style: {
              strokeColor: "#ffffff",
              strokeWidth: 2,
              opacity: 1,
            },
            text: "Handwritten note",
          },
          { width: 200, height: 100 }
        );
        break;
      case "shape":
        addItem(
          activeLesson,
          activeCanvas,
          "shape",
          snappedPos,
          {
            shapeType: "rectangle",
            style: {
              strokeColor: "#ffffff",
              strokeWidth: 2,
              fillColor: "transparent",
              opacity: 1,
            },
          },
          { width: 100, height: 100 }
        );
        break;
      case "image":
        // This would typically open a file dialog
        addItem(
          activeLesson,
          activeCanvas,
          "image",
          snappedPos,
          {
            url: "/placeholder-image.jpg",
            alt: "Placeholder Image",
          },
          { width: 300, height: 200 }
        );
        break;
      case "video":
        addItem(
          activeLesson,
          activeCanvas,
          "video",
          snappedPos,
          {
            url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            title: "Sample Video",
            autoplay: false,
          },
          { width: 320, height: 180 }
        );
        break;
      default:
        // Default to text if no tool is selected
        addItem(
          activeLesson,
          activeCanvas,
          "text",
          snappedPos,
          {
            text: "Double-click to edit text",
            style: {
              fontFamily: "'Roboto', sans-serif",
              fontSize: 16,
              fontWeight: "normal",
              textAlign: "left",
              color: "#ffffff",
              padding: 8,
            },
          },
          { width: 200, height: 100 }
        );
    }
  }, [activeLesson, activeCanvas, activeTool, addItem, isDraggingItem, position, scale, snapToGrid, gridSize]);
  
  // Start selection box
  const startSelectionBox = (e: React.MouseEvent) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const x = (e.clientX - canvasRect.left - position.x) / scale;
    const y = (e.clientY - canvasRect.top - position.y) / scale;
    
    setSelectionBox({
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      isSelecting: true,
    });
  };
  
  // Update selection box
  const updateSelectionBox = (e: MouseEvent) => {
    if (!selectionBox?.isSelecting) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const x = (e.clientX - canvasRect.left - position.x) / scale;
    const y = (e.clientY - canvasRect.top - position.y) / scale;
    
    setSelectionBox({
      ...selectionBox,
      endX: x,
      endY: y,
    });
  };
  
  // Finish selection box and select items within it
  const finishSelectionBox = () => {
    if (!selectionBox?.isSelecting) return;
    
    // Calculate selection box bounds
    const minX = Math.min(selectionBox.startX, selectionBox.endX);
    const maxX = Math.max(selectionBox.startX, selectionBox.endX);
    const minY = Math.min(selectionBox.startY, selectionBox.endY);
    const maxY = Math.max(selectionBox.startY, selectionBox.endY);
    
    // Find items within the selection box
    const selectedIds = items.filter((item) => {
      const itemRight = item.position.x + (item.size?.width || 100);
      const itemBottom = item.position.y + (item.size?.height || 100);
      
      return (
        item.position.x < maxX &&
        itemRight > minX &&
        item.position.y < maxY &&
        itemBottom > minY
      );
    }).map((item) => item.id);
    
    // Select the items
    if (selectedIds.length > 0) {
      selectMultipleItems(selectedIds);
    }
    
    // Reset selection box
    setSelectionBox(null);
  };
  
  // Mouse down for panning, selection, and item creation
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Ignore if right-clicking
    if (e.button === 2) return;
    
    // For double-click detection
    const clickTime = new Date().getTime();
    const isDoubleClick = clickTime - lastClickTime < 300;
    setLastClickTime(clickTime);
    
    // Process double click
    if (isDoubleClick && e.button === 0 && !e.altKey && !isDraggingItem) {
      handleDoubleClick(e);
      return;
    }
    
    // Handle panning with middle mouse button, Alt+left click, or when hand tool is active
    if ((e.button === 1 || (e.button === 0 && (e.altKey || handTool))) && !isDraggingItem) {
      e.preventDefault();
      setIsPanning(true);
      setStartPanPosition({ x: e.clientX, y: e.clientY });
      document.body.style.cursor = "grabbing";
      return;
    }
    
    // Handle drawing if drawing tool is active
    if (e.button === 0 && activeTool === "drawing" && !isDraggingItem) {
      e.preventDefault();
      setIsDrawing(true);
      
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      const x = (e.clientX - canvasRect.left - position.x) / scale;
      const y = (e.clientY - canvasRect.top - position.y) / scale;
      
      setDrawingPath([{ x, y }]);
      return;
    }
    
    // Start selection box when clicking on empty canvas with left mouse button
    if (e.button === 0 && !isDraggingItem && e.target === canvasRef.current && !e.altKey && !handTool) {
      startSelectionBox(e);
      // Clear selection when starting a new selection
      clearSelection();
      return;
    }
  }, [
    lastClickTime,
    handleDoubleClick,
    isDraggingItem,
    activeTool,
    clearSelection,
    position,
    scale,
    handTool,
    selectMultipleItems
  ]);
  
  // Mouse move for panning, drawing, and selection
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Handle panning
    if (isPanning) {
      const dx = e.clientX - startPanPosition.x;
      const dy = e.clientY - startPanPosition.y;
      
      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      
      setStartPanPosition({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Handle drawing
    if (isDrawing && activeTool === "drawing") {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      const x = (e.clientX - canvasRect.left - position.x) / scale;
      const y = (e.clientY - canvasRect.top - position.y) / scale;
      
      setDrawingPath((prev) => [...prev, { x, y }]);
      return;
    }
    
    // Handle selection box
    if (selectionBox?.isSelecting) {
      updateSelectionBox(e);
    }
  }, [isPanning, startPanPosition, isDrawing, activeTool, position, scale, selectionBox]);
  
  // Mouse up to end interactions
  const handleMouseUp = useCallback(() => {
    // End panning
    if (isPanning) {
      setIsPanning(false);
      document.body.style.cursor = handTool ? "grab" : "default";
    }
    
    // End drawing and create drawing item
    if (isDrawing && activeTool === "drawing") {
      setIsDrawing(false);
      
      if (drawingPath.length > 1 && activeLesson && activeCanvas) {
        // Calculate bounding box
        const xPoints = drawingPath.map(p => p.x);
        const yPoints = drawingPath.map(p => p.y);
        const minX = Math.min(...xPoints);
        const minY = Math.min(...yPoints);
        const maxX = Math.max(...xPoints);
        const maxY = Math.max(...yPoints);
        
        // Create drawing item
        addItem(
          activeLesson,
          activeCanvas,
          "drawing",
          { x: minX, y: minY },
          {
            paths: drawingPath.map(p => ({ 
              x: p.x - minX, 
              y: p.y - minY 
            })),
            style: {
              strokeColor: "#ffffff",
              strokeWidth: 2,
              opacity: 1,
            },
          },
          { width: maxX - minX, height: maxY - minY }
        );
      }
      
      setDrawingPath([]);
    }
    
    // Finish selection box
    if (selectionBox?.isSelecting) {
      finishSelectionBox();
    }
  }, [
    isPanning,
    isDrawing,
    activeTool,
    drawingPath,
    activeLesson,
    activeCanvas,
    addItem,
    selectionBox,
    handTool
  ]);
  
  // Handle wheel for zooming
  const handleWheel = useCallback((e: WheelEvent) => {
    // Prevent horizontal swipes from triggering browser navigation
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
      e.preventDefault();
    }
    
    // Zoom with Ctrl/Cmd+Wheel
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // Calculate zoom relative to mouse position
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Mouse position in canvas coordinates
      const mouseXInCanvas = (mouseX - position.x) / scale;
      const mouseYInCanvas = (mouseY - position.y) / scale;
      
      // Calculate new scale
      const delta = -e.deltaY * 0.001;
      const newScale = Math.max(0.1, Math.min(5, scale + delta));
      
      // Calculate new position to keep mouse position fixed
      const newX = mouseX - mouseXInCanvas * newScale;
      const newY = mouseY - mouseYInCanvas * newScale;
      
      setScale(newScale);
      setPosition({ x: newX, y: newY });
    } else {
      // Pan with wheel (no modifier key)
      setPosition((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, [position, scale]);
  
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Delete selected items
    if ((e.key === "Delete" || e.key === "Backspace") && selectedItems.length > 0) {
      // Would add code to delete selected items
    }
    
    // Copy selected items
    if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedItems.length > 0) {
      // Would add code to copy selected items
    }
    
    // Paste items
    if ((e.ctrlKey || e.metaKey) && e.key === "v") {
      // Would add code to paste copied items
    }
    
    // Undo
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      // Would add code for undo
    }
    
    // Redo
    if ((e.ctrlKey || e.metaKey) && e.key === "y") {
      // Would add code for redo
    }
    
    // Select all
    if ((e.ctrlKey || e.metaKey) && e.key === "a") {
      e.preventDefault();
      // Select all items in the canvas
      selectMultipleItems(items.map(item => item.id));
    }
    
    // Toggle hand tool temporarily with spacebar
    if (e.key === " " && !e.repeat) {
      e.preventDefault();
      setHandTool(true);
      document.body.style.cursor = "grab";
    }
  }, [selectedItems, items, selectMultipleItems]);
  
  // Handle key up for temporary tools
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    // Disable hand tool when spacebar released
    if (e.key === " ") {
      setHandTool(false);
      document.body.style.cursor = "default";
    }
  }, []);
  
  // Item drag handlers
  const handleItemDragStart = useCallback(() => {
    setIsDraggingItem(true);
  }, []);
  
  const handleItemDragEnd = useCallback(() => {
    setIsDraggingItem(false);
  }, []);
  
  const handleItemClick = useCallback((itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Bring item to front
    if (activeLesson && activeCanvas) {
      bringToFront(activeLesson, activeCanvas, itemId);
    }
    
    // Select the item (handle multi-select with shift key)
    if (e.shiftKey) {
      // Toggle selection
      if (selectedItems.includes(itemId)) {
        deselectItem(itemId);
      } else {
        selectItem(itemId);
      }
    } else {
      // Single select
      selectItem(itemId);
    }
  }, [activeLesson, activeCanvas, bringToFront, selectItem, deselectItem, selectedItems]);
  
  // Set up event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e);
    };
    
    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };
    
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
    }
    
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
      }
    };
  }, [handleMouseMove, handleMouseUp, handleWheel, handleKeyDown, handleKeyUp]);
  
  // Prevent context menu on right-click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Could show a custom context menu here
  };
  
  // Render items based on type
  const renderItem = (item: LessonItem) => {
    const isSelected = selectedItems.includes(item.id);
    
    switch (item.type) {
      case "text":
        return (
          <TextItem
            key={item.id}
            item={item}
            isSelected={isSelected}
            onDragStart={handleItemDragStart}
            onDragEnd={handleItemDragEnd}
            onClick={(e) => handleItemClick(item.id, e)}
            onPositionChange={(position) => {
              if (activeLesson && activeCanvas) {
                // Apply grid snapping if enabled
                const newPos = snapToGrid
                  ? { 
                      x: Math.round(position.x / gridSize) * gridSize,
                      y: Math.round(position.y / gridSize) * gridSize
                    }
                  : position;
                  
                updateItemPosition(activeLesson, activeCanvas, item.id, newPos);
              }
            }}
          />
        );
      case "drawing":
        return (
          <DrawingItem
            key={item.id}
            item={item}
            isSelected={isSelected}
            onDragStart={handleItemDragStart}
            onDragEnd={handleItemDragEnd}
            onClick={(e) => handleItemClick(item.id, e)}
            onPositionChange={(position) => {
              if (activeLesson && activeCanvas) {
                const newPos = snapToGrid
                  ? { 
                      x: Math.round(position.x / gridSize) * gridSize,
                      y: Math.round(position.y / gridSize) * gridSize
                    }
                  : position;
                  
                updateItemPosition(activeLesson, activeCanvas, item.id, newPos);
              }
            }}
          />
        );
      case "shape":
        return (
          <ShapeItem
            key={item.id}
            item={item}
            isSelected={isSelected}
            onDragStart={handleItemDragStart}
            onDragEnd={handleItemDragEnd}
            onClick={(e) => handleItemClick(item.id, e)}
            onPositionChange={(position) => {
              if (activeLesson && activeCanvas) {
                const newPos = snapToGrid
                  ? { 
                      x: Math.round(position.x / gridSize) * gridSize,
                      y: Math.round(position.y / gridSize) * gridSize
                    }
                  : position;
                  
                updateItemPosition(activeLesson, activeCanvas, item.id, newPos);
              }
            }}
          />
        );
      case "connector":
        return (
          <ConnectorItem
            key={item.id}
            item={item}
            isSelected={isSelected}
            onClick={(e) => handleItemClick(item.id, e)}
            onPositionChange={(points) => {
              if (activeLesson && activeCanvas) {
                // For connectors, we need to update the points in the content
                const content = { ...item.content, points };
                // We still use updateItemPosition for consistency
                updateItemPosition(activeLesson, activeCanvas, item.id, item.position);
              }
            }}
          />
        );
      case "handwriting":
        return (
          <HandwritingItem
            key={item.id}
            item={item}
            isSelected={isSelected}
            onDragStart={handleItemDragStart}
            onDragEnd={handleItemDragEnd}
            onClick={(e) => handleItemClick(item.id, e)}
            onPositionChange={(position) => {
              if (activeLesson && activeCanvas) {
                const newPos = snapToGrid
                  ? { 
                      x: Math.round(position.x / gridSize) * gridSize,
                      y: Math.round(position.y / gridSize) * gridSize
                    }
                  : position;
                  
                updateItemPosition(activeLesson, activeCanvas, item.id, newPos);
              }
            }}
          />
        );
      case "video":
        return (
          <VideoItem
            key={item.id}
            item={item}
            isSelected={isSelected}
            onDragStart={handleItemDragStart}
            onDragEnd={handleItemDragEnd}
            onClick={(e) => handleItemClick(item.id, e)}
            onPositionChange={(position) => {
              if (activeLesson && activeCanvas) {
                const newPos = snapToGrid
                  ? { 
                      x: Math.round(position.x / gridSize) * gridSize,
                      y: Math.round(position.y / gridSize) * gridSize
                    }
                  : position;
                  
                updateItemPosition(activeLesson, activeCanvas, item.id, newPos);
              }
            }}
          />
        );
      default:
        return null;
    }
  };
  
  // Render grid
  const renderGrid = () => {
    if (!showGrid) return null;
    
    return (
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(to right, ${getColor("black-thin")} 1px, transparent 1px), linear-gradient(to bottom, ${getColor("black-thin")} 1px, transparent 1px)`,
          backgroundSize: `${gridSize * scale}px ${gridSize * scale}px`,
          backgroundPosition: `${position.x}px ${position.y}px`,
          opacity: 0.5,
        }}
      />
    );
  };
  
  // Draw temporary path while drawing
  const renderDrawingPreview = () => {
    if (!isDrawing || drawingPath.length < 2) return null;
    
    const pathData = drawingPath.map((p, i) => 
      i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
    ).join(" ");
    
    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        <path
          d={pathData}
          stroke="#ffffff"
          strokeWidth={2 / scale}
          fill="none"
        />
      </svg>
    );
  };
  
  // Render selection box
  const renderSelectionBox = () => {
    if (!selectionBox || !selectionBox.isSelecting) return null;
    
    const left = Math.min(selectionBox.startX, selectionBox.endX);
    const top = Math.min(selectionBox.startY, selectionBox.endY);
    const width = Math.abs(selectionBox.endX - selectionBox.startX);
    const height = Math.abs(selectionBox.endY - selectionBox.startY);
    
    return (
      <div
        className="absolute pointer-events-none border-2 border-latte bg-latte bg-opacity-10"
        style={{
          left: left * scale + position.x,
          top: top * scale + position.y,
          width: width * scale,
          height: height * scale,
        }}
      />
    );
  };
  
  // Get background color from canvas settings or default
  const backgroundColor = currentCanvas?.background?.color || "#1a1a2e";
  
  return (
    <div
      ref={canvasRef}
      className="relative flex-1 overflow-hidden"
      style={{
        backgroundColor: getColor("Night"),
        cursor: isPanning 
          ? "grabbing" 
          : handTool 
            ? "grab" 
            : activeTool === "drawing" 
              ? "crosshair" 
              : "default",
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      {/* Grid */}
      {renderGrid()}
      
      {/* Canvas content */}
      <div
        className="milanew-canvas absolute"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: "0 0",
          width: 10000,
          height: 10000,
        }}
      >
        {/* Render items sorted by z-index */}
        {items
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map(renderItem)}
      </div>
      
      {/* Render drawing preview when drawing */}
      {renderDrawingPreview()}
      
      {/* Render selection box */}
      {renderSelectionBox()}
      
      {/* Zoom controls */}
      <ZoomControls
        scale={scale}
        onZoomIn={() => setScale((prev) => Math.min(5, prev + 0.1))}
        onZoomOut={() => setScale((prev) => Math.max(0.1, prev - 0.1))}
        onReset={() => {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }}
      />
      
      {/* Status info - shown at bottom right */}
      <div
        className="absolute bottom-2 right-2 bg-black-med rounded-md px-2 py-1 text-xs"
        style={{ color: getColor("latte-thin") }}
      >
        {`Zoom: ${Math.round(scale * 100)}%`}
        {selectedItems.length > 0 && ` • ${selectedItems.length} selected`}
      </div>
    </div>
  );
};

export default LessonCanvas;
