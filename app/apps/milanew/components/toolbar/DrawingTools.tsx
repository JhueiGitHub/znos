"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import {
  Circle,
  Square,
  Triangle,
  Star,
  ArrowRight,
  ArrowLeft,
  ArrowUpDown,
  Pencil, 
  MousePointer,
  Edit3,
  X,
  Eraser,
  Undo,
  Redo,
  ChevronUp,
  ChevronDown,
  Heart,
  Cloud,
  MessageCircle,
  Flag,
  Check,
  Hexagon
} from "lucide-react";

interface DrawingToolsProps {
  activeToolType: string | null;
  onClose: () => void;
}

const DrawingTools: React.FC<DrawingToolsProps> = ({ activeToolType, onClose }) => {
  const { getColor } = useStyles();
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState("#ffffff");
  const [fillColor, setFillColor] = useState("transparent");
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [arrowStart, setArrowStart] = useState(false);
  const [arrowEnd, setArrowEnd] = useState(true);
  const [mode, setMode] = useState<"draw" | "erase" | "select">("draw");
  const [drawingStyle, setDrawingStyle] = useState<"normal" | "rough" | "dotted" | "dashed">("normal");
  const [advancedPanel, setAdvancedPanel] = useState<string | null>(null);

  // Color palette options
  const colorOptions = [
    "#ffffff", // white
    "#66BB6A", // green - for positive/correct concepts
    "#42A5F5", // blue - for definitions
    "#FFA726", // orange - for caution/important
    "#EF5350", // red - for incorrect/warning
    "#AB47BC", // purple - for creative/innovative 
    "#FFEE58", // yellow - for highlighting
    "#26A69A", // teal - for steps/processes
  ];

  // Shape button component
  const ShapeButton = ({
    icon,
    shapeType,
    label,
  }: {
    icon: React.ReactNode;
    shapeType: string;
    label: string;
  }) => (
    <button
      className={`p-2 rounded-md transition-all ${
        selectedShape === shapeType ? "bg-latte-thin" : "hover:bg-black-med"
      }`}
      onClick={() => setSelectedShape(shapeType)}
      title={label}
    >
      {icon}
    </button>
  );

  // Determine which options to show based on the active tool
  const showShapeOptions = activeToolType === "shape";
  const showConnectorOptions = activeToolType === "connector";
  const showDrawingOptions = activeToolType === "drawing";

  // Toggle advanced panel visibility
  const toggleAdvancedPanel = (panel: string) => {
    if (advancedPanel === panel) {
      setAdvancedPanel(null);
    } else {
      setAdvancedPanel(panel);
    }
  };

  return (
    <motion.div
      className="ml-2 p-4 rounded-md"
      style={{
        backgroundColor: getColor("black-med"),
        boxShadow: `0 4px 12px ${getColor("black-thin")}`,
        width: "280px",
        maxHeight: "80vh",
        overflowY: "auto"
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Close button */}
      <button
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black-thick"
        onClick={onClose}
        title="Close"
      >
        <X size={16} color={getColor("latte")} />
      </button>

      {/* Mode selection - only for drawing tool */}
      {showDrawingOptions && (
        <div className="mb-4">
          <div 
            className="text-sm mb-2"
            style={{ color: getColor("latte") }}
          >
            Drawing Mode
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`p-2 rounded-md transition-all ${
                mode === "draw" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setMode("draw")}
              title="Draw"
            >
              <Pencil size={20} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                mode === "erase" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setMode("erase")}
              title="Erase"
            >
              <Eraser size={20} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                mode === "select" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setMode("select")}
              title="Select"
            >
              <MousePointer size={20} color={getColor("latte-med")} />
            </button>
          </div>
        </div>
      )}

      {/* Drawing style - only for drawing tool */}
      {showDrawingOptions && (
        <div className="mb-4">
          <div 
            className="text-sm mb-2"
            style={{ color: getColor("latte") }}
          >
            Drawing Style
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`p-2 rounded-md transition-all ${
                drawingStyle === "normal" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setDrawingStyle("normal")}
              title="Normal"
            >
              <div className="w-12 h-0 border-t-2 border-latte-med"></div>
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                drawingStyle === "rough" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setDrawingStyle("rough")}
              title="Rough"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12C4 9 6 15 9 12C12 9 15 15 18 12C21 9 23 12 22 12" stroke={getColor("latte-med")} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                drawingStyle === "dotted" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setDrawingStyle("dotted")}
              title="Dotted"
            >
              <div className="w-12 h-0 border-t-2 border-dotted border-latte-med"></div>
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                drawingStyle === "dashed" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setDrawingStyle("dashed")}
              title="Dashed"
            >
              <div className="w-12 h-0 border-t-2 border-dashed border-latte-med"></div>
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div 
          className="text-sm mb-2"
          style={{ color: getColor("latte") }}
        >
          Stroke Width
        </div>
        <div className="flex items-center">
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
            className="w-full"
          />
          <span 
            className="ml-2 text-sm"
            style={{ color: getColor("latte") }}
          >
            {strokeWidth}px
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div 
          className="text-sm mb-2"
          style={{ color: getColor("latte") }}
        >
          Stroke Color
        </div>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-md ${
                strokeColor === color ? "ring-2 ring-latte" : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setStrokeColor(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      {(showShapeOptions || showConnectorOptions) && (
        <div className="mb-4">
          <div 
            className="text-sm mb-2"
            style={{ color: getColor("latte") }}
          >
            Fill Color
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`w-8 h-8 rounded-md border border-latte ${
                fillColor === "transparent" ? "ring-2 ring-latte" : ""
              }`}
              style={{ 
                backgroundColor: "transparent", 
                backgroundImage: "linear-gradient(45deg, #555 25%, transparent 25%, transparent 75%, #555 75%, #555), linear-gradient(45deg, #555 25%, transparent 25%, transparent 75%, #555 75%, #555)",
                backgroundSize: "6px 6px",
                backgroundPosition: "0 0, 3px 3px"
              }}
              onClick={() => setFillColor("transparent")}
              title="Transparent"
            />
            {colorOptions.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-md ${
                  fillColor === color ? "ring-2 ring-latte" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setFillColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Shapes section with collapsible panel */}
      {showShapeOptions && (
        <div className="mb-4">
          <button 
            className="w-full flex justify-between items-center text-sm mb-2 hover:bg-black-thick rounded-md p-1"
            onClick={() => toggleAdvancedPanel('shapes')}
            style={{ color: getColor("latte") }}
          >
            <span>Shape Type</span>
            {advancedPanel === 'shapes' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <div className={`flex flex-wrap gap-2 ${advancedPanel === 'shapes' ? '' : 'max-h-16 overflow-hidden'}`}>
            <ShapeButton
              icon={<Square size={24} color={getColor("latte-med")} />}
              shapeType="rectangle"
              label="Rectangle"
            />
            <ShapeButton
              icon={<Circle size={24} color={getColor("latte-med")} />}
              shapeType="ellipse"
              label="Ellipse"
            />
            <ShapeButton
              icon={<Triangle size={24} color={getColor("latte-med")} />}
              shapeType="triangle"
              label="Triangle"
            />
            <ShapeButton
              icon={<Star size={24} color={getColor("latte-med")} />}
              shapeType="star"
              label="Star"
            />
            <ShapeButton
              icon={<Hexagon size={24} color={getColor("latte-med")} />}
              shapeType="hexagon"
              label="Hexagon"
            />
            <ShapeButton
              icon={<Heart size={24} color={getColor("latte-med")} />}
              shapeType="heart"
              label="Heart"
            />
            <ShapeButton
              icon={<Cloud size={24} color={getColor("latte-med")} />}
              shapeType="cloud"
              label="Cloud"
            />
            <ShapeButton
              icon={<MessageCircle size={24} color={getColor("latte-med")} />}
              shapeType="speech-bubble"
              label="Speech Bubble"
            />
            <ShapeButton
              icon={<Flag size={24} color={getColor("latte-med")} />}
              shapeType="flag"
              label="Flag"
            />
            <ShapeButton
              icon={<Check size={24} color={getColor("latte-med")} />}
              shapeType="checkmark"
              label="Checkmark"
            />
          </div>
        </div>
      )}

      {/* Connector options */}
      {showConnectorOptions && (
        <div className="mb-4">
          <div 
            className="text-sm mb-2"
            style={{ color: getColor("latte") }}
          >
            Arrow Style
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`p-2 rounded-md transition-all ${
                !arrowStart && !arrowEnd ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => {
                setArrowStart(false);
                setArrowEnd(false);
              }}
              title="No Arrows"
            >
              <div className="w-12 h-0 border-t-2 border-latte-med"></div>
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                arrowStart && !arrowEnd ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => {
                setArrowStart(true);
                setArrowEnd(false);
              }}
              title="Start Arrow"
            >
              <ArrowLeft size={24} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                !arrowStart && arrowEnd ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => {
                setArrowStart(false);
                setArrowEnd(true);
              }}
              title="End Arrow"
            >
              <ArrowRight size={24} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                arrowStart && arrowEnd ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => {
                setArrowStart(true);
                setArrowEnd(true);
              }}
              title="Both Arrows"
            >
              <ArrowUpDown size={24} color={getColor("latte-med")} />
            </button>
          </div>
        </div>
      )}

      {/* Line style options */}
      <div className="mb-4">
        <div 
          className="text-sm mb-2"
          style={{ color: getColor("latte") }}
        >
          Line Style
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="p-2 rounded-md hover:bg-black-med"
            title="Solid Line"
          >
            <div className="w-12 h-0 border-t-2 border-latte-med"></div>
          </button>
          <button
            className="p-2 rounded-md hover:bg-black-med"
            title="Dashed Line"
          >
            <div className="w-12 h-0 border-t-2 border-dashed border-latte-med"></div>
          </button>
          <button
            className="p-2 rounded-md hover:bg-black-med"
            title="Dotted Line"
          >
            <div className="w-12 h-0 border-t-2 border-dotted border-latte-med"></div>
          </button>
        </div>
      </div>

      {/* History controls */}
      <div className="mt-4 mb-4 border-t border-black-thin pt-4">
        <div className="flex justify-around">
          <button
            className="p-2 rounded-md hover:bg-black-med"
            title="Undo"
          >
            <Undo size={20} color={getColor("latte-med")} />
          </button>
          <button
            className="p-2 rounded-md hover:bg-black-med"
            title="Redo"
          >
            <Redo size={20} color={getColor("latte-med")} />
          </button>
        </div>
      </div>

      {/* Preview of current settings */}
      <div className="mt-4">
        <div 
          className="text-sm mb-2"
          style={{ color: getColor("latte") }}
        >
          Preview
        </div>
        <div
          className="rounded-md h-20 flex items-center justify-center"
          style={{ backgroundColor: getColor("black-thick") }}
        >
          {showShapeOptions && selectedShape ? (
            <div className="flex items-center justify-center w-full h-full">
              {selectedShape === "rectangle" && (
                <div
                  style={{
                    width: "60px",
                    height: "40px",
                    backgroundColor: fillColor === "transparent" ? "transparent" : fillColor,
                    border: `${strokeWidth}px solid ${strokeColor}`,
                  }}
                />
              )}
              {selectedShape === "ellipse" && (
                <div
                  style={{
                    width: "60px",
                    height: "40px",
                    backgroundColor: fillColor === "transparent" ? "transparent" : fillColor,
                    border: `${strokeWidth}px solid ${strokeColor}`,
                    borderRadius: "50%",
                  }}
                />
              )}
              {selectedShape === "triangle" && (
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "30px solid transparent",
                    borderRight: "30px solid transparent",
                    borderBottom: `50px solid ${fillColor === "transparent" ? strokeColor : fillColor}`,
                  }}
                />
              )}
              {/* Other shapes would be implemented with SVG */}
            </div>
          ) : showConnectorOptions ? (
            <svg width="100" height="20" viewBox="0 0 100 20">
              <defs>
                {arrowStart && (
                  <marker
                    id="startArrow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="0"
                    refY="5"
                    orient="auto"
                  >
                    <path d="M10,0 L0,5 L10,10" fill="none" stroke={strokeColor} />
                  </marker>
                )}
                {arrowEnd && (
                  <marker
                    id="endArrow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="10"
                    refY="5"
                    orient="auto"
                  >
                    <path d="M0,0 L10,5 L0,10" fill="none" stroke={strokeColor} />
                  </marker>
                )}
              </defs>
              <line
                x1="10"
                y1="10"
                x2="90"
                y2="10"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                markerStart={arrowStart ? "url(#startArrow)" : ""}
                markerEnd={arrowEnd ? "url(#endArrow)" : ""}
              />
            </svg>
          ) : (
            <div
              style={{
                width: "80%",
                height: "2px",
                backgroundColor: strokeColor,
                opacity: 0.7,
              }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DrawingTools;
