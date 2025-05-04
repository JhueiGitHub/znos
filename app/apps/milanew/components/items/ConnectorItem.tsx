"use client";

import React, { useState, useRef } from "react";
import { useStyles } from "@/app/hooks/useStyles";
import { Position, LessonItem, ConnectorContent } from "../../types";
import { Lock, Unlock, Trash, Copy, Edit2, TextIcon } from "lucide-react";

interface ConnectorItemProps {
  item: LessonItem;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onPositionChange: (points: Position[]) => void;
}

const ConnectorItem: React.FC<ConnectorItemProps> = ({
  item,
  isSelected,
  onClick,
  onPositionChange,
}) => {
  const { getColor } = useStyles();
  const svgRef = useRef<SVGSVGElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(item.locked || false);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [labelText, setLabelText] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [isDraggingPoint, setIsDraggingPoint] = useState(false);

  const content = item.content as ConnectorContent;
  const { points, style, label, labelStyle } = content;

  // Calculate line path
  const getLinePath = () => {
    if (points.length < 2) return "";
    
    // For straight lines, just use "M x1 y1 L x2 y2"
    // For multi-point lines, use a series of L commands
    return points
      .map((point, index) => {
        if (index === 0) {
          return `M ${point.x} ${point.y}`;
        } else {
          return `L ${point.x} ${point.y}`;
        }
      })
      .join(" ");
  };

  // Calculate curved line path
  const getCurvedPath = () => {
    if (points.length < 2) return "";
    
    if (points.length === 2) {
      // Simple curved line between two points
      const [p1, p2] = points;
      const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const offset = distance / 3;
      
      return `M ${p1.x} ${p1.y} C ${midX} ${midY - offset}, ${midX} ${midY + offset}, ${p2.x} ${p2.y}`;
    } else {
      // More complex path with multiple points - use smooth curves
      let path = `M ${points[0].x} ${points[0].y}`;
      
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const current = points[i];
        const next = points[i + 1] || current;
        
        const controlPoint1X = prev.x + (current.x - prev.x) / 2;
        const controlPoint1Y = prev.y + (current.y - prev.y) / 2;
        
        const controlPoint2X = current.x - (next.x - current.x) / 2;
        const controlPoint2Y = current.y - (next.y - current.y) / 2;
        
        path += ` C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${current.x} ${current.y}`;
      }
      
      return path;
    }
  };

  // Handle point drag
  const handlePointDragStart = (index: number) => {
    if (isLocked) return;
    
    setSelectedPoint(index);
    setIsDraggingPoint(true);
  };

  const handlePointDrag = (e: React.MouseEvent) => {
    if (!isDraggingPoint || selectedPoint === null || isLocked) return;
    
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    
    const updatedPoints = [...points];
    updatedPoints[selectedPoint] = { x, y };
    
    onPositionChange(updatedPoints);
  };

  const handlePointDragEnd = () => {
    setIsDraggingPoint(false);
    setSelectedPoint(null);
  };

  // Add a midpoint
  const addMidpoint = (index: number) => {
    if (index < 1 || isLocked) return;
    
    const p1 = points[index - 1];
    const p2 = points[index];
    
    const midpoint = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
    
    const updatedPoints = [...points];
    updatedPoints.splice(index, 0, midpoint);
    
    onPositionChange(updatedPoints);
  };

  // Remove a point
  const removePoint = (index: number) => {
    if (points.length <= 2 || isLocked) return; // Keep at least 2 points
    
    const updatedPoints = points.filter((_, i) => i !== index);
    onPositionChange(updatedPoints);
  };

  // Calculate arrow markers
  const getArrowMarkers = () => {
    return (
      <>
        {style.arrowStart && (
          <marker
            id={`startArrow-${item.id}`}
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M10,0 L0,5 L10,10"
              fill="none"
              stroke={style.strokeColor}
              strokeWidth="1"
            />
          </marker>
        )}
        {style.arrowEnd && (
          <marker
            id={`endArrow-${item.id}`}
            markerWidth="10"
            markerHeight="10"
            refX="10"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L10,5 L0,10"
              fill="none"
              stroke={style.strokeColor}
              strokeWidth="1"
            />
          </marker>
        )}
      </>
    );
  };

  // Calculate bounding box for the connector
  const getBoundingBox = () => {
    const xValues = points.map((p) => p.x);
    const yValues = points.map((p) => p.y);
    
    const minX = Math.min(...xValues);
    const minY = Math.min(...yValues);
    const maxX = Math.max(...xValues);
    const maxY = Math.max(...yValues);
    
    // Add some padding
    const padding = 20;
    
    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  };

  const bbox = getBoundingBox();
  const linePath = style.lineDash ? getLinePath() : getCurvedPath();

  // Calculate label position
  const getLabelPosition = () => {
    if (points.length < 2) return { x: 0, y: 0 };
    
    if (points.length === 2) {
      // For a line with 2 points, place label at the midpoint
      return {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2,
      };
    } else {
      // For multi-point lines, place label at the middle segment's midpoint
      const midIndex = Math.floor(points.length / 2);
      return {
        x: (points[midIndex - 1].x + points[midIndex].x) / 2,
        y: (points[midIndex - 1].y + points[midIndex].y) / 2,
      };
    }
  };

  const labelPosition = getLabelPosition();

  return (
    <div
      className="absolute"
      style={{
        top: bbox.y,
        left: bbox.x,
        width: bbox.width,
        height: bbox.height,
        zIndex: item.zIndex,
        pointerEvents: "none", // Make container transparent to mouse events
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${bbox.width} ${bbox.height}`}
        style={{
          overflow: "visible",
          pointerEvents: "all", // Enable mouse events on the SVG
        }}
        onClick={onClick}
        onMouseMove={handlePointDrag}
        onMouseUp={handlePointDragEnd}
      >
        <defs>{getArrowMarkers()}</defs>
        
        {/* Main connector line */}
        <path
          d={linePath}
          fill="none"
          stroke={style.strokeColor || "#ffffff"}
          strokeWidth={style.strokeWidth || 2}
          strokeDasharray={style.lineDash ? style.lineDash.join(" ") : "none"}
          markerStart={style.arrowStart ? `url(#startArrow-${item.id})` : ""}
          markerEnd={style.arrowEnd ? `url(#endArrow-${item.id})` : ""}
          style={{ opacity: style.opacity || 1 }}
          onClick={(e) => {
            e.stopPropagation();
            onClick(e);
          }}
        />
        
        {/* Control points - visible when selected and editing */}
        {isSelected && isEditing && !isLocked && (
          <>
            {points.map((point, index) => (
              <g key={`point-${index}`}>
                {/* Control point */}
                <circle
                  cx={point.x - bbox.x}
                  cy={point.y - bbox.y}
                  r="6"
                  fill={selectedPoint === index ? getColor("latte") : getColor("black-med")}
                  stroke={getColor("latte")}
                  strokeWidth="2"
                  style={{ cursor: "move" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handlePointDragStart(index);
                  }}
                />
                
                {/* Add midpoint button - show between points */}
                {index > 0 && (
                  <circle
                    cx={(points[index - 1].x + point.x) / 2 - bbox.x}
                    cy={(points[index - 1].y + point.y) / 2 - bbox.y}
                    r="4"
                    fill={getColor("black-med")}
                    stroke={getColor("latte-thin")}
                    strokeWidth="1"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addMidpoint(index);
                    }}
                  />
                )}
                
                {/* Delete point button - show for points except first and last when there are > 2 points */}
                {points.length > 2 && index > 0 && index < points.length - 1 && (
                  <text
                    x={point.x - bbox.x + 10}
                    y={point.y - bbox.y - 10}
                    fill={getColor("latte")}
                    fontSize="12"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removePoint(index);
                    }}
                  >
                    ×
                  </text>
                )}
              </g>
            ))}
          </>
        )}
        
        {/* Connector label */}
        {label && (
          <g>
            <rect
              x={labelPosition.x - bbox.x - 40}
              y={labelPosition.y - bbox.y - 12}
              width="80"
              height="24"
              rx="4"
              fill={getColor("black-med")}
              stroke={getColor("black-thin")}
              strokeWidth="1"
            />
            <text
              x={labelPosition.x - bbox.x}
              y={labelPosition.y - bbox.y + 5}
              textAnchor="middle"
              fill={labelStyle?.color || "#ffffff"}
              fontSize={labelStyle?.fontSize || 12}
              fontFamily={labelStyle?.fontFamily || "'Roboto', sans-serif"}
              fontWeight={labelStyle?.fontWeight || "normal"}
              fontStyle={labelStyle?.fontStyle || "normal"}
            >
              {label}
            </text>
          </g>
        )}
      </svg>
      
      {/* Action toolbar - only visible when selected */}
      {isSelected && (
        <div
          className="absolute -top-10 left-0 flex bg-black-med rounded-md p-1 z-10"
          style={{ 
            boxShadow: `0 2px 8px ${getColor("black-thin")}`,
            pointerEvents: "all",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={`p-1 rounded-md mr-1 ${isEditing ? "bg-latte-thin" : "hover:bg-black-med"}`}
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "Done Editing" : "Edit Connector"}
          >
            <Edit2 size={16} color={getColor("latte-med")} />
          </button>
          <button
            className={`p-1 rounded-md mr-1 ${isAddingLabel ? "bg-latte-thin" : "hover:bg-black-med"}`}
            onClick={() => setIsAddingLabel(!isAddingLabel)}
            title={isAddingLabel ? "Cancel" : "Add/Edit Label"}
          >
            <TextIcon size={16} color={getColor("latte-med")} />
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
      
      {/* Label editing panel */}
      {isSelected && isAddingLabel && (
        <div
          className="absolute -bottom-24 left-0 bg-black-med rounded-md p-2 z-10"
          style={{ 
            boxShadow: `0 2px 8px ${getColor("black-thin")}`,
            pointerEvents: "all",
            minWidth: "200px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={labelText}
            onChange={(e) => setLabelText(e.target.value)}
            placeholder="Enter label text"
            className="w-full p-1 rounded-md text-sm mb-2"
            style={{ 
              backgroundColor: getColor("black-thick"),
              color: getColor("latte"),
              border: `1px solid ${getColor("black-thin")}`,
            }}
          />
          <div className="flex justify-end">
            <button
              className="px-2 py-1 rounded-md bg-latte text-black-thick text-xs"
              onClick={() => {
                // Update label
                // Would call store update function here with the new label
                setIsAddingLabel(false);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectorItem;
