"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import { Position, LessonItem, ShapeContent } from "../../types";
import { Lock, Unlock, Trash, Copy, Move, Edit, RotateCcw } from "lucide-react";

interface ShapeItemProps {
  item: LessonItem;
  isSelected: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: (e: React.MouseEvent) => void;
  onPositionChange: (position: Position) => void;
}

const ShapeItem: React.FC<ShapeItemProps> = ({
  item,
  isSelected,
  onDragStart,
  onDragEnd,
  onClick,
  onPositionChange,
}) => {
  const { getColor } = useStyles();
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(item.locked || false);
  const [rotation, setRotation] = useState(item.rotation || 0);
  const [isRotating, setIsRotating] = useState(false);
  const [startAngle, setStartAngle] = useState(0);

  const content = item.content as ShapeContent;
  const { shapeType, style, points } = content;

  // Handle drag
  const handleDrag = (e: any, info: any) => {
    if (isEditing || isLocked) return;
    
    onPositionChange({
      x: item.position.x + info.delta.x,
      y: item.position.y + info.delta.y,
    });
  };

  // Get dimensions for the shape item
  const dimensions = item.size || { width: 100, height: 100 };

  // Get fill color with appropriate fallback
  const getFillColor = () => {
    if (!style.fillColor || style.fillColor === "transparent") {
      return "none";
    }
    return style.fillColor;
  };

  // Handle rotation start
  const handleRotationStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLocked) return;
    
    setIsRotating(true);
    
    // Calculate center of the shape
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    // Calculate start angle
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    
    setStartAngle(angle - rotation);
  };

  // Handle rotation move
  const handleRotationMove = (e: MouseEvent) => {
    if (!isRotating || isLocked) return;
    
    // Calculate center of the shape
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    // Get the current element position
    const element = document.getElementById(`shape-${item.id}`);
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    // Calculate new angle
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    const newRotation = angle - startAngle;
    
    // Update rotation (would typically update in store)
    setRotation(newRotation);
  };

  // Handle rotation end
  const handleRotationEnd = () => {
    setIsRotating(false);
  };

  // Set up rotation event listeners
  React.useEffect(() => {
    if (isRotating) {
      window.addEventListener("mousemove", handleRotationMove);
      window.addEventListener("mouseup", handleRotationEnd);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleRotationMove);
      window.removeEventListener("mouseup", handleRotationEnd);
    };
  }, [isRotating, startAngle]);

  // Render different shape types
  const renderShape = () => {
    switch (shapeType) {
      case "rectangle":
        return (
          <rect
            x="0"
            y="0"
            width={dimensions.width}
            height={dimensions.height}
            stroke={style.strokeColor || "#ffffff"}
            strokeWidth={style.strokeWidth || 2}
            fill={getFillColor()}
            style={{ opacity: style.opacity || 1 }}
          />
        );
      case "ellipse":
        return (
          <ellipse
            cx={dimensions.width / 2}
            cy={dimensions.height / 2}
            rx={dimensions.width / 2 - (style.strokeWidth || 2)}
            ry={dimensions.height / 2 - (style.strokeWidth || 2)}
            stroke={style.strokeColor || "#ffffff"}
            strokeWidth={style.strokeWidth || 2}
            fill={getFillColor()}
            style={{ opacity: style.opacity || 1 }}
          />
        );
      case "triangle":
        const trianglePoints = `${dimensions.width / 2},0 ${dimensions.width},${dimensions.height} 0,${dimensions.height}`;
        return (
          <polygon
            points={trianglePoints}
            stroke={style.strokeColor || "#ffffff"}
            strokeWidth={style.strokeWidth || 2}
            fill={getFillColor()}
            style={{ opacity: style.opacity || 1 }}
          />
        );
      case "star":
        // Generate a 5-point star
        const starPoints = generateStarPoints(
          dimensions.width / 2,
          dimensions.height / 2,
          Math.min(dimensions.width, dimensions.height) / 2,
          Math.min(dimensions.width, dimensions.height) / 4,
          5
        );
        return (
          <polygon
            points={starPoints}
            stroke={style.strokeColor || "#ffffff"}
            strokeWidth={style.strokeWidth || 2}
            fill={getFillColor()}
            style={{ opacity: style.opacity || 1 }}
          />
        );
      case "hexagon":
        const hexPoints = generatePolygonPoints(
          dimensions.width / 2,
          dimensions.height / 2,
          Math.min(dimensions.width, dimensions.height) / 2,
          6
        );
        return (
          <polygon
            points={hexPoints}
            stroke={style.strokeColor || "#ffffff"}
            strokeWidth={style.strokeWidth || 2}
            fill={getFillColor()}
            style={{ opacity: style.opacity || 1 }}
          />
        );
      case "cloud":
        return (
          <path
            d="M25,60 A20,20 0 0,1 5,40 A20,20 0 0,1 25,20 A20,20 0 0,1 45,40 A20,20 0 0,1 65,20 A20,20 0 0,1 85,40 A20,20 0 0,1 65,60 Z"
            transform={`scale(${dimensions.width / 100}, ${dimensions.height / 80})`}
            stroke={style.strokeColor || "#ffffff"}
            strokeWidth={style.strokeWidth || 2}
            fill={getFillColor()}
            style={{ opacity: style.opacity || 1 }}
          />
        );
      case "heart":
        return (
          <path
            d="M50,90 A20,20 0 0,1 30,70 A20,20 1 0,1 10,50 A20,20 0 0,1 30,30 A20,20 0 0,1 50,10 A20,20 0 0,1 70,30 A20,20 0 0,1 90,50 A20,20 0 0,1 70,70 A20,20 0 0,1 50,90 Z"
            transform={`scale(${dimensions.width / 100}, ${dimensions.height / 100})`}
            stroke={style.strokeColor || "#ffffff"}
            strokeWidth={style.strokeWidth || 2}
            fill={getFillColor()}
            style={{ opacity: style.opacity || 1 }}
          />
        );
      case "speech-bubble":
        return (
          <path
            d="M10,10 H90 V70 H60 L50,90 L40,70 H10 Z"
            transform={`scale(${dimensions.width / 100}, ${dimensions.height / 100})`}
            stroke={style.strokeColor || "#ffffff"}
            strokeWidth={style.strokeWidth || 2}
            fill={getFillColor()}
            style={{ opacity: style.opacity || 1 }}
          />
        );
      case "custom":
        // For custom shapes with custom points
        if (!points || points.length < 3) return null;
        
        const customPoints = points
          .map((p) => `${p.x},${p.y}`)
          .join(" ");
        
        return (
          <polygon
            points={customPoints}
            stroke={style.strokeColor || "#ffffff"}
            strokeWidth={style.strokeWidth || 2}
            fill={getFillColor()}
            style={{ opacity: style.opacity || 1 }}
          />
        );
      default:
        return null;
    }
  };

  // Helper to generate a star shape
  const generateStarPoints = (
    centerX: number,
    centerY: number,
    outerRadius: number,
    innerRadius: number,
    points: number
  ): string => {
    let result = "";
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI * i) / points;
      const x = centerX + radius * Math.sin(angle);
      const y = centerY - radius * Math.cos(angle);
      
      result += `${x},${y} `;
    }
    
    return result.trim();
  };

  // Helper to generate a regular polygon
  const generatePolygonPoints = (
    centerX: number,
    centerY: number,
    radius: number,
    sides: number
  ): string => {
    let result = "";
    
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides;
      const x = centerX + radius * Math.sin(angle);
      const y = centerY - radius * Math.cos(angle);
      
      result += `${x},${y} `;
    }
    
    return result.trim();
  };

  return (
    <motion.div
      id={`shape-${item.id}`}
      className="absolute cursor-move"
      style={{
        top: item.position.y,
        left: item.position.x,
        width: dimensions.width,
        height: dimensions.height,
        zIndex: item.zIndex,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
      }}
      drag={!isEditing && !isLocked}
      dragMomentum={false}
      dragElastic={0}
      onClick={onClick}
      onDragStart={onDragStart}
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
      
      {/* Shape SVG */}
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        {renderShape()}
      </svg>
      
      {/* Rotation handle - only show when selected and not locked */}
      {isSelected && !isLocked && (
        <div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          onMouseDown={handleRotationStart}
        >
          <div className="w-px h-6 bg-latte-med mx-auto"></div>
          <div
            className="w-6 h-6 rounded-full bg-black-med flex items-center justify-center"
            style={{ border: `2px solid ${getColor("latte-med")}` }}
          >
            <RotateCcw size={14} color={getColor("latte")} />
          </div>
        </div>
      )}
      
      {/* Action toolbar - only visible when selected */}
      {isSelected && (
        <div
          className="absolute -top-10 left-0 flex bg-black-med rounded-md p-1 z-10"
          style={{ boxShadow: `0 2px 8px ${getColor("black-thin")}` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={`p-1 rounded-md mr-1 ${isEditing ? "bg-latte-thin" : "hover:bg-black-med"}`}
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "Done Editing" : "Edit Shape"}
          >
            <Edit size={16} color={getColor("latte-med")} />
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

export default ShapeItem;
