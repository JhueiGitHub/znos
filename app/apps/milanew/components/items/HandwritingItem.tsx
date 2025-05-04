"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import { Position, LessonItem, HandwritingContent } from "../../types";
import { Edit3, Lock, Unlock, Trash, Copy, Move } from "lucide-react";

interface HandwritingItemProps {
  item: LessonItem;
  isSelected: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: (e: React.MouseEvent) => void;
  onPositionChange: (position: Position) => void;
}

const HandwritingItem: React.FC<HandwritingItemProps> = ({
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
  const [currentPath, setCurrentPath] = useState<Position[]>([]);
  const [isLocked, setIsLocked] = useState(item.locked || false);
  const svgRef = useRef<SVGSVGElement>(null);

  const content = item.content as HandwritingContent;
  const { paths = [], style, text = "" } = content;

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
    
    // Save the current path
    const updatedPaths = [...paths, currentPath];
    // Would update the store with the new paths here
    
    setCurrentPath([]);
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
      if (!isDrawing || !isEditing || isLocked || currentPath.length < 2) {
        setIsDrawing(false);
        return;
      }
      
      setIsDrawing(false);
      
      // Save the current path
      const updatedPaths = [...paths, currentPath];
      // Would update the store with the new paths here
      
      setCurrentPath([]);
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

  // Calculate dimensions based on paths or use default
  const getItemDimensions = () => {
    if (!item.size) {
      return {
        width: 200,
        height: 150,
      };
    }
    return item.size;
  };

  const dimensions = getItemDimensions();

  // Style for the handwriting text
  const textStyle = {
    fontFamily: "'Caveat', cursive", // Handwriting font
    fontSize: "18px",
    fill: style.strokeColor || "#ffffff",
  };

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
          cursor: isEditing && !isLocked ? "crosshair" : "move",
        }}
      >
        {/* Draw existing paths */}
        {paths.map((path, index) => (
          <path
            key={`path-${index}`}
            d={generatePathData(path)}
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
            d={generatePathData(currentPath)}
            stroke={style.strokeColor || "#ffffff"}
            strokeWidth={style.strokeWidth || 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ opacity: style.opacity || 1 }}
          />
        )}
        
        {/* Optional text label for the handwriting */}
        {text && (
          <text
            x="10"
            y={dimensions.height - 10}
            style={textStyle}
          >
            {text}
          </text>
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
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "Done Editing" : "Edit Handwriting"}
          >
            <Edit3 size={16} color={getColor("latte-med")} />
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
    </motion.div>
  );
};

export default HandwritingItem;
