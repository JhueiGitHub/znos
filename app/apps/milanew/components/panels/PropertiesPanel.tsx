"use client";

import React, { useState } from "react";
import { useStyles } from "@/app/hooks/useStyles";
import { useLessonStore } from "../../store/lessonStore";
import { X, ChevronRight, ChevronLeft, Grid, Palette, ZoomIn, ZoomOut, Eye, FolderOpen, Save } from "lucide-react";
import { TextContent, DrawingContent, ShapeContent, ConnectorContent, VideoContent, HandwritingContent } from "../../types";

const PropertiesPanel: React.FC = () => {
  const { getColor } = useStyles();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>("style");
  
  // Get relevant state from store
  const activeLesson = useLessonStore((state) => state.activeLesson);
  const activeCanvas = useLessonStore((state) => state.activeCanvas);
  const selectedItems = useLessonStore((state) => state.selectedItems);
  const lessons = useLessonStore((state) => state.lessons);
  
  // Get selected items data
  const getSelectedItemsData = () => {
    if (!activeLesson || !activeCanvas || selectedItems.length === 0) {
      return [];
    }
    
    const lesson = lessons[activeLesson];
    if (!lesson) return [];
    
    const canvas = lesson.canvases.find((c) => c.id === activeCanvas);
    if (!canvas) return [];
    
    return canvas.items.filter((item) => selectedItems.includes(item.id));
  };
  
  const selectedItemsData = getSelectedItemsData();
  const hasSelection = selectedItemsData.length > 0;
  
  // Check if all selected items are of the same type
  const allSameType = () => {
    if (selectedItemsData.length <= 1) return true;
    
    const firstType = selectedItemsData[0]?.type;
    return selectedItemsData.every((item) => item.type === firstType);
  };
  
  // Get the type of the first selected item
  const getFirstSelectedType = () => {
    if (selectedItemsData.length === 0) return null;
    return selectedItemsData[0]?.type;
  };
  
  const firstSelectedType = getFirstSelectedType();
  
  // Toggle panel collapse
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Toggle section collapse
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };
  
  // Render properties based on item type
  const renderProperties = () => {
    if (!hasSelection) return null;
    
    // If multiple items with different types are selected, show common properties
    if (!allSameType()) {
      return renderCommonProperties();
    }
    
    // Render type-specific properties
    switch (firstSelectedType) {
      case "text":
        return renderTextProperties();
      case "handwriting":
        return renderHandwritingProperties();
      case "drawing":
        return renderDrawingProperties();
      case "shape":
        return renderShapeProperties();
      case "connector":
        return renderConnectorProperties();
      case "image":
        return renderImageProperties();
      case "video":
        return renderVideoProperties();
      default:
        return renderCommonProperties();
    }
  };
  
  // Render properties common to all item types
  const renderCommonProperties = () => {
    return (
      <div>
        <SectionHeader title="General" section="general" activeSection={activeSection} onToggle={toggleSection} />
        
        {activeSection === "general" && (
          <div className="p-3">
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Position
              </label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <span className="text-xs mb-1 block" style={{ color: getColor("latte-thin") }}>X</span>
                  <input
                    type="number"
                    className="w-full p-1 rounded-md text-sm"
                    style={{ 
                      backgroundColor: getColor("black-thick"),
                      color: getColor("latte"),
                      border: `1px solid ${getColor("black-thin")}`,
                    }}
                    placeholder="X"
                    // value and onChange handlers would be implemented here
                  />
                </div>
                <div className="flex-1">
                  <span className="text-xs mb-1 block" style={{ color: getColor("latte-thin") }}>Y</span>
                  <input
                    type="number"
                    className="w-full p-1 rounded-md text-sm"
                    style={{ 
                      backgroundColor: getColor("black-thick"),
                      color: getColor("latte"),
                      border: `1px solid ${getColor("black-thin")}`,
                    }}
                    placeholder="Y"
                    // value and onChange handlers would be implemented here
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Size
              </label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <span className="text-xs mb-1 block" style={{ color: getColor("latte-thin") }}>Width</span>
                  <input
                    type="number"
                    className="w-full p-1 rounded-md text-sm"
                    style={{ 
                      backgroundColor: getColor("black-thick"),
                      color: getColor("latte"),
                      border: `1px solid ${getColor("black-thin")}`,
                    }}
                    placeholder="Width"
                    // value and onChange handlers would be implemented here
                  />
                </div>
                <div className="flex-1">
                  <span className="text-xs mb-1 block" style={{ color: getColor("latte-thin") }}>Height</span>
                  <input
                    type="number"
                    className="w-full p-1 rounded-md text-sm"
                    style={{ 
                      backgroundColor: getColor("black-thick"),
                      color: getColor("latte"),
                      border: `1px solid ${getColor("black-thin")}`,
                    }}
                    placeholder="Height"
                    // value and onChange handlers would be implemented here
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Rotation
              </label>
              <input
                type="range"
                min="0"
                max="360"
                className="w-full"
                // value and onChange handlers would be implemented here
              />
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: getColor("latte-thin") }}>0°</span>
                <span className="text-xs" style={{ color: getColor("latte-thin") }}>180°</span>
                <span className="text-xs" style={{ color: getColor("latte-thin") }}>360°</span>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Layer
              </label>
              <div className="flex space-x-2">
                <button
                  className="flex-1 p-1 rounded-md text-sm"
                  style={{ 
                    backgroundColor: getColor("black-thick"),
                    color: getColor("latte"),
                    border: `1px solid ${getColor("black-thin")}`,
                  }}
                >
                  Bring Forward
                </button>
                <button
                  className="flex-1 p-1 rounded-md text-sm"
                  style={{ 
                    backgroundColor: getColor("black-thick"),
                    color: getColor("latte"),
                    border: `1px solid ${getColor("black-thin")}`,
                  }}
                >
                  Send Backward
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Opacity
              </label>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full"
                // value and onChange handlers would be implemented here
              />
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: getColor("latte-thin") }}>0%</span>
                <span className="text-xs" style={{ color: getColor("latte-thin") }}>50%</span>
                <span className="text-xs" style={{ color: getColor("latte-thin") }}>100%</span>
              </div>
            </div>
          </div>
        )}
        
        <SectionHeader title="Actions" section="actions" activeSection={activeSection} onToggle={toggleSection} />
        
        {activeSection === "actions" && (
          <div className="p-3">
            <button
              className="w-full p-2 rounded-md text-sm mb-2"
              style={{ 
                backgroundColor: getColor("black-thick"),
                color: getColor("latte"),
                border: `1px solid ${getColor("black-thin")}`,
              }}
            >
              Duplicate
            </button>
            
            <button
              className="w-full p-2 rounded-md text-sm mb-2"
              style={{ 
                backgroundColor: getColor("black-thick"),
                color: getColor("latte"),
                border: `1px solid ${getColor("black-thin")}`,
              }}
            >
              Lock
            </button>
            
            <button
              className="w-full p-2 rounded-md text-sm"
              style={{ 
                backgroundColor: getColor("red-500"),
                color: getColor("white"),
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // Render text-specific properties
  const renderTextProperties = () => {
    const textContent = selectedItemsData[0]?.content as TextContent;
    
    return (
      <div>
        <SectionHeader title="Text" section="text" activeSection={activeSection} onToggle={toggleSection} />
        
        {activeSection === "text" && (
          <div className="p-3">
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Font
              </label>
              <select
                className="w-full p-2 rounded-md text-sm"
                style={{ 
                  backgroundColor: getColor("black-thick"),
                  color: getColor("latte"),
                  border: `1px solid ${getColor("black-thin")}`,
                }}
                value={textContent?.style.fontFamily}
                // onChange handler would be implemented here
              >
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Inter', sans-serif">Inter</option>
                <option value="'Poppins', sans-serif">Poppins</option>
                <option value="'Caveat', cursive">Caveat</option>
                <option value="'Dancing Script', cursive">Dancing Script</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Size
              </label>
              <input
                type="range"
                min="10"
                max="72"
                className="w-full"
                value={textContent?.style.fontSize}
                // onChange handler would be implemented here
              />
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: getColor("latte-thin") }}>10px</span>
                <span className="text-xs" style={{ color: getColor("latte-thin") }}>72px</span>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Style
              </label>
              <div className="flex space-x-2">
                <button
                  className={`flex-1 p-1 rounded-md text-sm ${
                    textContent?.style.fontWeight === "bold" ? "bg-latte-thin" : ""
                  }`}
                  style={{ 
                    backgroundColor: textContent?.style.fontWeight === "bold" 
                      ? getColor("latte-thin") 
                      : getColor("black-thick"),
                    color: getColor("latte"),
                    border: `1px solid ${getColor("black-thin")}`,
                  }}
                >
                  Bold
                </button>
                <button
                  className={`flex-1 p-1 rounded-md text-sm ${
                    textContent?.style.fontStyle === "italic" ? "bg-latte-thin" : ""
                  }`}
                  style={{ 
                    backgroundColor: textContent?.style.fontStyle === "italic" 
                      ? getColor("latte-thin") 
                      : getColor("black-thick"),
                    color: getColor("latte"),
                    border: `1px solid ${getColor("black-thin")}`,
                  }}
                >
                  Italic
                </button>
                <button
                  className="flex-1 p-1 rounded-md text-sm"
                  style={{ 
                    backgroundColor: getColor("black-thick"),
                    color: getColor("latte"),
                    border: `1px solid ${getColor("black-thin")}`,
                  }}
                >
                  Underline
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Alignment
              </label>
              <div className="flex space-x-2">
                <button
                  className={`flex-1 p-1 rounded-md text-sm ${
                    textContent?.style.textAlign === "left" ? "bg-latte-thin" : ""
                  }`}
                  style={{ 
                    backgroundColor: textContent?.style.textAlign === "left" 
                      ? getColor("latte-thin") 
                      : getColor("black-thick"),
                    color: getColor("latte"),
                    border: `1px solid ${getColor("black-thin")}`,
                  }}
                >
                  Left
                </button>
                <button
                  className={`flex-1 p-1 rounded-md text-sm ${
                    textContent?.style.textAlign === "center" ? "bg-latte-thin" : ""
                  }`}
                  style={{ 
                    backgroundColor: textContent?.style.textAlign === "center" 
                      ? getColor("latte-thin") 
                      : getColor("black-thick"),
                    color: getColor("latte"),
                    border: `1px solid ${getColor("black-thin")}`,
                  }}
                >
                  Center
                </button>
                <button
                  className={`flex-1 p-1 rounded-md text-sm ${
                    textContent?.style.textAlign === "right" ? "bg-latte-thin" : ""
                  }`}
                  style={{ 
                    backgroundColor: textContent?.style.textAlign === "right" 
                      ? getColor("latte-thin") 
                      : getColor("black-thick"),
                    color: getColor("latte"),
                    border: `1px solid ${getColor("black-thin")}`,
                  }}
                >
                  Right
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Text Color
              </label>
              <div className="flex flex-wrap gap-2">
                {["#ffffff", "#42A5F5", "#66BB6A", "#FFA726", "#EF5350", "#AB47BC", "#FFEE58", "#26A69A"].map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-md ${
                      textContent?.style.color === color ? "ring-2 ring-latte" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    // onClick handler would be implemented here
                  />
                ))}
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Background Color
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`w-8 h-8 rounded-md border border-latte ${
                    !textContent?.style.backgroundColor || textContent?.style.backgroundColor === "transparent" 
                      ? "ring-2 ring-latte" 
                      : ""
                  }`}
                  style={{ 
                    backgroundColor: "transparent", 
                    backgroundImage: "linear-gradient(45deg, #555 25%, transparent 25%, transparent 75%, #555 75%, #555), linear-gradient(45deg, #555 25%, transparent 25%, transparent 75%, #555 75%, #555)",
                    backgroundSize: "6px 6px",
                    backgroundPosition: "0 0, 3px 3px"
                  }}
                  // onClick handler would be implemented here
                />
                {["#2C2C3A", "#7047EB30", "#26A69A30", "#42A5F530", "#FFA72630", "#66BB6A30", "#EF535030"].map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-md ${
                      textContent?.style.backgroundColor === color ? "ring-2 ring-latte" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    // onClick handler would be implemented here
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Include common properties sections */}
        <SectionHeader title="General" section="general" activeSection={activeSection} onToggle={toggleSection} />
        
        {activeSection === "general" && renderCommonProperties()}
        
        <SectionHeader title="Actions" section="actions" activeSection={activeSection} onToggle={toggleSection} />
        
        {activeSection === "actions" && (
          <div className="p-3">
            <button
              className="w-full p-2 rounded-md text-sm mb-2"
              style={{ 
                backgroundColor: getColor("black-thick"),
                color: getColor("latte"),
                border: `1px solid ${getColor("black-thin")}`,
              }}
            >
              Duplicate
            </button>
            
            <button
              className="w-full p-2 rounded-md text-sm mb-2"
              style={{ 
                backgroundColor: getColor("black-thick"),
                color: getColor("latte"),
                border: `1px solid ${getColor("black-thin")}`,
              }}
            >
              Lock
            </button>
            
            <button
              className="w-full p-2 rounded-md text-sm"
              style={{ 
                backgroundColor: getColor("red-500"),
                color: getColor("white"),
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // Render drawing-specific properties
  const renderDrawingProperties = () => {
    // Similar structure to text properties, but with drawing-specific controls
    return (
      <div>
        <SectionHeader title="Drawing" section="drawing" activeSection={activeSection} onToggle={toggleSection} />
        {/* Drawing specific controls would go here */}
      </div>
    );
  };
  
  // Render handwriting-specific properties
  const renderHandwritingProperties = () => {
    // Similar structure to text properties, but with handwriting-specific controls
    return (
      <div>
        <SectionHeader title="Handwriting" section="handwriting" activeSection={activeSection} onToggle={toggleSection} />
        {/* Handwriting specific controls would go here */}
      </div>
    );
  };
  
  // Render shape-specific properties
  const renderShapeProperties = () => {
    // Similar structure to text properties, but with shape-specific controls
    return (
      <div>
        <SectionHeader title="Shape" section="shape" activeSection={activeSection} onToggle={toggleSection} />
        {/* Shape specific controls would go here */}
      </div>
    );
  };
  
  // Render connector-specific properties
  const renderConnectorProperties = () => {
    // Similar structure to text properties, but with connector-specific controls
    return (
      <div>
        <SectionHeader title="Connector" section="connector" activeSection={activeSection} onToggle={toggleSection} />
        {/* Connector specific controls would go here */}
      </div>
    );
  };
  
  // Render image-specific properties
  const renderImageProperties = () => {
    // Similar structure to text properties, but with image-specific controls
    return (
      <div>
        <SectionHeader title="Image" section="image" activeSection={activeSection} onToggle={toggleSection} />
        {/* Image specific controls would go here */}
      </div>
    );
  };
  
  // Render video-specific properties
  const renderVideoProperties = () => {
    // Similar structure to text properties, but with video-specific controls
    return (
      <div>
        <SectionHeader title="Video" section="video" activeSection={activeSection} onToggle={toggleSection} />
        {/* Video specific controls would go here */}
      </div>
    );
  };
  
  // Render canvas properties when no item is selected
  const renderCanvasProperties = () => {
    return (
      <div>
        <SectionHeader title="Canvas" section="canvas" activeSection={activeSection} onToggle={toggleSection} />
        
        {activeSection === "canvas" && (
          <div className="p-3">
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Background Color
              </label>
              <div className="flex flex-wrap gap-2">
                {["#1a1a2e", "#0f0f23", "#2c2c3a", "#26283b", "#252526"].map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-md ${
                      false ? "ring-2 ring-latte" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    // onClick handler would be implemented here
                  />
                ))}
              </div>
            </div>
            
            <div className="mb-3">
              <label className="flex items-center text-sm" style={{ color: getColor("latte-thin") }}>
                <input
                  type="checkbox"
                  className="mr-2"
                  // checked and onChange handlers would be implemented here
                />
                Show Grid
              </label>
            </div>
            
            <div className="mb-3">
              <label className="flex items-center text-sm" style={{ color: getColor("latte-thin") }}>
                <input
                  type="checkbox"
                  className="mr-2"
                  // checked and onChange handlers would be implemented here
                />
                Snap to Grid
              </label>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Grid Size
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                className="w-full"
                // value and onChange handlers would be implemented here
              />
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: getColor("latte-thin") }}>10px</span>
                <span className="text-xs" style={{ color: getColor("latte-thin") }}>50px</span>
                <span className="text-xs" style={{ color: getColor("latte-thin") }}>100px</span>
              </div>
            </div>
          </div>
        )}
        
        <SectionHeader title="Zoom" section="zoom" activeSection={activeSection} onToggle={toggleSection} />
        
        {activeSection === "zoom" && (
          <div className="p-3">
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Zoom Level
              </label>
              <input
                type="range"
                min="10"
                max="200"
                className="w-full"
                // value and onChange handlers would be implemented here
              />
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: getColor("latte-thin") }}>10%</span>
                <span className="text-xs" style={{ color: getColor("latte-thin") }}>100%</span>
                <span className="text-xs" style={{ color: getColor("latte-thin") }}>200%</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                className="flex-1 p-2 rounded-md text-sm"
                style={{ 
                  backgroundColor: getColor("black-thick"),
                  color: getColor("latte"),
                  border: `1px solid ${getColor("black-thin")}`,
                }}
              >
                <div className="flex items-center justify-center">
                  <ZoomIn size={16} className="mr-1" />
                  <span>Zoom In</span>
                </div>
              </button>
              <button
                className="flex-1 p-2 rounded-md text-sm"
                style={{ 
                  backgroundColor: getColor("black-thick"),
                  color: getColor("latte"),
                  border: `1px solid ${getColor("black-thin")}`,
                }}
              >
                <div className="flex items-center justify-center">
                  <ZoomOut size={16} className="mr-1" />
                  <span>Zoom Out</span>
                </div>
              </button>
            </div>
          </div>
        )}
        
        <SectionHeader title="Lesson" section="lesson" activeSection={activeSection} onToggle={toggleSection} />
        
        {activeSection === "lesson" && (
          <div className="p-3">
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Lesson Title
              </label>
              <input
                type="text"
                className="w-full p-2 rounded-md text-sm"
                style={{ 
                  backgroundColor: getColor("black-thick"),
                  color: getColor("latte"),
                  border: `1px solid ${getColor("black-thin")}`,
                }}
                placeholder="Enter lesson title"
                // value and onChange handlers would be implemented here
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Description
              </label>
              <textarea
                className="w-full p-2 rounded-md text-sm"
                style={{ 
                  backgroundColor: getColor("black-thick"),
                  color: getColor("latte"),
                  border: `1px solid ${getColor("black-thin")}`,
                  minHeight: "80px",
                  resize: "vertical",
                }}
                placeholder="Enter lesson description"
                // value and onChange handlers would be implemented here
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm mb-1" style={{ color: getColor("latte-thin") }}>
                Tags
              </label>
              <input
                type="text"
                className="w-full p-2 rounded-md text-sm"
                style={{ 
                  backgroundColor: getColor("black-thick"),
                  color: getColor("latte"),
                  border: `1px solid ${getColor("black-thin")}`,
                }}
                placeholder="Enter tags (comma separated)"
                // value and onChange handlers would be implemented here
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                className="flex-1 p-2 rounded-md text-sm"
                style={{ 
                  backgroundColor: getColor("black-thick"),
                  color: getColor("latte"),
                  border: `1px solid ${getColor("black-thin")}`,
                }}
              >
                <div className="flex items-center justify-center">
                  <FolderOpen size={16} className="mr-1" />
                  <span>Open</span>
                </div>
              </button>
              <button
                className="flex-1 p-2 rounded-md text-sm"
                style={{ 
                  backgroundColor: getColor("latte"),
                  color: getColor("black-thick"),
                }}
              >
                <div className="flex items-center justify-center">
                  <Save size={16} className="mr-1" />
                  <span>Save</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div
      className={`absolute right-0 top-0 bottom-0 flex ${
        isCollapsed ? "w-12" : "w-64"
      } bg-black-med z-40 transition-all duration-300`}
      style={{ boxShadow: `-4px 0 12px ${getColor("black-thin")}` }}
    >
      {/* Collapse/Expand button */}
      <button
        className="absolute top-2 left-2 p-1 rounded-full hover:bg-black-thick z-50"
        onClick={toggleCollapse}
        title={isCollapsed ? "Expand panel" : "Collapse panel"}
      >
        {isCollapsed ? (
          <ChevronLeft size={16} color={getColor("latte")} />
        ) : (
          <ChevronRight size={16} color={getColor("latte")} />
        )}
      </button>
      
      {/* Panel content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto scrollbar-hide p-3 pt-10">
          <div
            className="text-sm font-semibold mb-4"
            style={{ color: getColor("latte") }}
          >
            {hasSelection 
              ? `${selectedItemsData.length} item${selectedItemsData.length > 1 ? 's' : ''} selected` 
              : 'Canvas Properties'}
          </div>
          
          {/* Render properties based on selection */}
          {hasSelection ? renderProperties() : renderCanvasProperties()}
        </div>
      )}
    </div>
  );
};

// Section header component for collapsible sections
const SectionHeader: React.FC<{
  title: string;
  section: string;
  activeSection: string | null;
  onToggle: (section: string) => void;
}> = ({ title, section, activeSection, onToggle }) => {
  const { getColor } = useStyles();
  const isActive = activeSection === section;
  
  return (
    <div
      className="py-2 px-1 cursor-pointer flex items-center justify-between border-b border-black-thin"
      onClick={() => onToggle(section)}
    >
      <span style={{ color: getColor("latte") }}>{title}</span>
      <div
        className={`transform transition-transform ${isActive ? "rotate-90" : ""}`}
      >
        <ChevronRight size={14} color={getColor("latte-thin")} />
      </div>
    </div>
  );
};

export default PropertiesPanel;
