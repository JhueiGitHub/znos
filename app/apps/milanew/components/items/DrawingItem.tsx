"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import { Position, LessonItem, DrawingContent } from "../../types";
import { Edit3, Lock, Unlock, Trash, Copy, Move, Eraser, Undo, Redo } from "lucide-react";

interface DrawingItemProps {
  item: LessonItem;
  isSelected: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: (e: React.MouseEvent) => void;
  onPositionChange: (position: Position) => void;
}

const DrawingItem: React.FC<DrawingItemProps> = ({
  item,
  isSelected,
  onDragStart,
  onDragEnd,
  onClick,
  onPositionChange,
}) => {
  const { getColor } = useStyles();
  const [isEditing, setIsEditing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Position[]>([]);
  const [isLocked, setIsLocked] = useState(item.locked || false);
  const [undoStack, setUndoStack] = useState<Position[][]>([]);
  const [redoStack, setRedoStack] = useState<Position[][]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const content = item.content as DrawingContent;
  const { paths = [], style } = content;

  // Handle mouse events for drawing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing || isLocked) return;
    
    e.stopPropagation();
    setIsDrawing(true);
    
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    
    setCurrentPath([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !isEditing || isLocked) return;
    
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    
    setCurrentPath((prev) => [...prev, { x, y }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !isEditing || isLocked || currentPath.length < 2) {
      setIsDrawing(false);
      return;
    }
    
    setIsDrawing(false);
    
    // Add the current drawing to paths
    if (isErasing) {
      // Implement erasing logic here
      // This would need to check path intersections and modify existing paths
    } else {
      // Save the current path
      const updatedPaths = [...paths, currentPath];
      // Add current state to undo stack
      setUndoStack([...undoStack, paths]);
      // Clear redo stack since we've made a new change
      setRedoStack([]);
      
      // Would update the store with the new paths here
    }
    
    setCurrentPath([]);
  };

  // Undo/Redo functionality
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    // Get the last state from undo stack
    const lastState = undoStack[undoStack.length - 1];
    // Remove it from undo stack
    setUndoStack(undoStack.slice(0, -1));
    // Add current state to redo stack
    setRedoStack([...redoStack, paths]);
    
    // Restore the previous state
    // Would update the store with the last state here
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    // Get the last state from redo stack
    const nextState = redoStack[redoStack.length - 1];
    // Remove it from redo stack
    setRedoStack(redoStack.slice(0, -1));
    // Add current state to undo stack
    setUndoStack([...undoStack, paths]);
    
    // Apply the next state
    // Would update the store with the next state here
  };

  // Set up global mouse events for drawing
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDrawing || !isEditing || isLocked) return;
      
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      
      const x = e.clientX - svgRect.left;
      const y = e.clientY - svgRect.top;
      
      setCurrentPath((prev) => [...prev, { x, y }]);
    };
    
    const handleGlobalMouseUp = () => {
      if (!isDrawing || !isEditing || isLocked) {
        setIsDrawing(false);
        return;
      }
      
      handleMouseUp();
    };
    
    if (isDrawing) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDrawing, isEditing, isLocked, currentPath, paths]);

  // Generate path data for SVG
  const generatePathData = (points: Position[]) => {
    if (points.length < 2) return "";
    
    return points
      .map((point, i) => (i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
      .join(" ");
  };

  // Generate rough/sketchy path data for SVG
  const generateRoughPathData = (points: Position[]) => {
    if (points.length < 2) return "";
    
    // Add some randomness to the path for a hand-drawn look
    let pathData = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const point = points[i];
      
      // Add a small random offset
      const offset = Math.random() * 1 - 0.5; // Small offset for subtle effect
      
      if (i % 3 === 0) {
        // Add a slight curve every few points
        pathData += ` Q ${prevPoint.x + offset} ${prevPoint.y + offset}, ${point.x} ${point.y}`;
      } else {
        pathData += ` L ${point.x} ${point.y}`;
      }
    }
    
    return pathData;
  };

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent) => {
    if (isEditing || isLocked) {
      e.stopPropagation();
      return;
    }
    
    onDragStart();
  };

  const handleDrag = (e: any, info: any) => {
    if (isEditing || isLocked) return;
    
    onPositionChange({
      x: item.position.x + info.delta.x,
      y: item.position.y + info.delta.y,
    });
  };

  // Get dimensions for the drawing item
  const dimensions = item.size || { width: 300, height: 200 };

  return (
    <motion.div
      className="absolute cursor-move"
      style={{
        top: item.position.y,
        left: item.position.x,
        width: dimensions.width,
        height: dimensions.height,
        zIndex: item.zIndex,
      }}
      drag={!isEditing && !isLocked}
      dragMomentum={false}
      dragElastic={0}
      onClick={onClick}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={onDragEnd}
    >
      {/* Selection border */}
      {isSelected && (
        <div
          className="absolute -inset-1 border-2 rounded-md pointer-events-none"
          style={{ borderColor: getColor("latte") }}
        />
      )}
      
      {/* Drawing canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          background: "transparent",
          cursor: isEditing ? (isErasing ? "crosshair" : "crosshair") : "move",
          borderRadius: "4px",
        }}
      >
        {/* Draw existing paths */}
        {paths.map((path, index) => (
          <path
            key={`path-${index}`}
            d={style.roughDrawing ? generateRoughPathData(path) : generatePathData(path)}
            stroke={style.strokeColor || "#ffffff"}
            strokeWidth={style.strokeWidth || 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ opacity: style.opacity || 1 }}
          />
        ))}
        
        {/* Draw current path while drawing */}
        {isDrawing && (
          <path
            d={style.roughDrawing ? generateRoughPathData(currentPath) : generatePathData(currentPath)}
            stroke={isErasing ? getColor("Night") : (style.strokeColor || "#ffffff")}
            strokeWidth={isErasing ? (style.strokeWidth || 2) * 3 : (style.strokeWidth || 2)}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ 
              opacity: isErasing ? 0.5 : (style.opacity || 1),
              strokeDasharray: isErasing ? "5,5" : "none"
            }}
          />
        )}
      </svg>
      
      {/* Action toolbar - only visible when selected */}
      {isSelected && (
        <div
          className="absolute -top-10 left-0 flex bg-black-med rounded-md p-1"
          style={{ boxShadow: `0 2px 8px ${getColor("black-thin")}` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={`p-1 rounded-md mr-1 ${isEditing ? "bg-latte-thin" : "hover:bg-black-med"}`}
            onClick={() => {
              setIsEditing(!isEditing);
              setIsErasing(false);
            }}
            title={isEditing ? "Done Drawing" : "Draw"}
          >
            <Edit3 size={16} color={getColor("latte-med")} />
          </button>
          <button
            className={`p-1 rounded-md mr-1 ${isErasing ? "bg-latte-thin" : "hover:bg-black-med"}`}
            onClick={() => {
              if (!isEditing) setIsEditing(true);
              setIsErasing(!isErasing);
            }}
            title="Eraser"
            disabled={!isEditing}
          >
            <Eraser size={16} color={getColor("latte-med")} />
          </button>
          <button
            className="p-1 rounded-md mr-1 hover:bg-black-med"
            onClick={handleUndo}
            title="Undo"
            disabled={undoStack.length === 0}
          >
            <Undo size={16} color={getColor("latte-med")} />
          </button>
          <button
            className="p-1 rounded-md mr-1 hover:bg-black-med"
            onClick={handleRedo}
            title="Redo"
            disabled={redoStack.length === 0}
          >
            <Redo size={16} color={getColor("latte-med")} />
          </button>
          <button
            className="p-1 rounded-md mr-1 hover:bg-black-med"
            onClick={() => setIsLocked(!isLocked)}
            title={isLocked ? "Unlock" : "Lock"}
          >
            {isLocked ? (
              <Lock size={16} color={getColor("latte-med")} />
            ) : (
              <Unlock size={16} color={getColor("latte-med")} />
            )}
          </button>
          <button
            className="p-1 rounded-md mr-1 hover:bg-black-med"
            onClick={() => {/* Copy action */}}
            title="Duplicate"
          >
            <Copy size={16} color={getColor("latte-med")} />
          </button>
          <button
            className="p-1 rounded-md hover:bg-black-med"
            onClick={() => {/* Delete action */}}
            title="Delete"
          >
            <Trash size={16} color={getColor("latte-med")} />
          </button>
        </div>
      )}
      
      {/* Drawing tools panel - visible when editing */}
      {isSelected && isEditing && (
        <div
          className="absolute -bottom-16 left-0 flex bg-black-med rounded-md p-2"
          style={{ boxShadow: `0 2px 8px ${getColor("black-thin")}` }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Stroke color indicator */}
          <div
            className="w-6 h-6 rounded-full mr-2"
            style={{ 
              backgroundColor: style.strokeColor || "#ffffff",
              border: `1px solid ${getColor("black-thin")}`,
            }}
          />
          
          {/* Stroke width indicator */}
          <div className="flex items-center mr-2">
            <div
              className="w-12 h-0 mr-1"
              style={{ 
                borderTopWidth: `${style.strokeWidth || 2}px`,
                borderTopStyle: "solid",
                borderTopColor: style.strokeColor || "#ffffff",
              }}
            />
            <span className="text-xs" style={{ color: getColor("latte") }}>
              {style.strokeWidth || 2}
            </span>
          </div>
          
          {/* Draw/Erase mode indicator */}
          <div
            className="text-xs px-2 py-1 rounded-md"
            style={{ 
              backgroundColor: isErasing ? getColor("black-thin") : getColor("latte-thin"),
              color: getColor("latte"),
            }}
          >
            {isErasing ? "Erase" : "Draw"}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DrawingItem;
