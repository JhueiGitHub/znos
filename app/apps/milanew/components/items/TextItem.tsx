"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import { Position, LessonItem, TextContent } from "../../types";
import { Edit, Lock, Unlock, Trash, Copy, Move, ArrowUp, ArrowDown } from "lucide-react";

interface TextItemProps {
  item: LessonItem;
  isSelected: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: (e: React.MouseEvent) => void;
  onPositionChange: (position: Position) => void;
}

const TextItem: React.FC<TextItemProps> = ({
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
  const [textValue, setTextValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });

  const content = item.content as TextContent;
  const { text, style } = content;

  // Initialize text value on mount and when item changes
  useEffect(() => {
    setTextValue(text || "");
  }, [text]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Place cursor at the end of the text
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      textareaRef.current.selectionEnd = textareaRef.current.value.length;
    }
  }, [isEditing]);

  // Update text value 
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(e.target.value);
    // Would typically call a store update function here
  };

  // Get background color with appropriate fallback
  const getBackgroundColor = () => {
    if (!style.backgroundColor || style.backgroundColor === "transparent") {
      return "transparent";
    }
    return style.backgroundColor;
  };

  // Handle drag
  const handleDrag = (e: any, info: any) => {
    if (isEditing || isLocked) return;
    
    onPositionChange({
      x: item.position.x + info.delta.x,
      y: item.position.y + info.delta.y,
    });
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    
    // Store initial size and mouse position
    setInitialSize({
      width: item.size?.width || 200,
      height: item.size?.height || 100,
    });
    setInitialMousePos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Handle resize move
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - initialMousePos.x;
    const deltaY = e.clientY - initialMousePos.y;
    
    const newWidth = Math.max(100, initialSize.width + deltaX);
    const newHeight = Math.max(50, initialSize.height + deltaY);
    
    // Would update item size in store here
    if (item.size) {
      item.size.width = newWidth;
      item.size.height = newHeight;
    }
  };

  // Handle resize end
  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // Set up resize event listeners
  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [isResizing, initialSize, initialMousePos]);

  // Handle double click to start editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLocked) {
      setIsEditing(true);
    }
  };

  // Check if text appears to be handwritten
  const isHandwriting = style.isHandwriting || style.fontFamily.includes("cursive");

  // Map text type to correct HTML element
  const renderTextContent = () => {
    // For handwriting display
    if (isHandwriting) {
      return (
        <div
          className="w-full h-full overflow-auto p-2"
          style={{
            fontFamily: style.fontFamily,
            fontSize: `${style.fontSize}px`,
            fontWeight: style.fontWeight,
            fontStyle: style.fontStyle,
            textAlign: style.textAlign,
            color: style.color,
            backgroundColor: getBackgroundColor(),
            padding: style.padding ? `${style.padding}px` : "8px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {text}
        </div>
      );
    }
    
    // For normal text display
    return (
      <div
        className="w-full h-full overflow-auto p-2"
        style={{
          fontFamily: style.fontFamily,
          fontSize: `${style.fontSize}px`,
          fontWeight: style.fontWeight,
          fontStyle: style.fontStyle,
          textAlign: style.textAlign,
          color: style.color,
          backgroundColor: getBackgroundColor(),
          padding: style.padding ? `${style.padding}px` : "8px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {text}
      </div>
    );
  };

  // Get dimensions for the text item
  const dimensions = item.size || { width: 200, height: 100 };

  return (
    <motion.div
      className="absolute"
      style={{
        top: item.position.y,
        left: item.position.x,
        width: dimensions.width,
        height: dimensions.height,
        zIndex: item.zIndex,
        borderRadius: "4px",
        overflow: "hidden",
        boxShadow: isSelected ? `0 0 0 2px ${getColor("latte")}` : "none",
        cursor: isEditing ? "text" : isLocked ? "default" : "move",
      }}
      drag={!isEditing && !isLocked}
      dragMomentum={false}
      dragElastic={0}
      onClick={onClick}
      onDragStart={onDragStart}
      onDrag={handleDrag}
      onDragEnd={onDragEnd}
      onDoubleClick={handleDoubleClick}
    >
      {/* Text content or editing textarea */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={textValue}
          onChange={handleTextChange}
          className="w-full h-full resize-none p-2 outline-none"
          style={{
            fontFamily: style.fontFamily,
            fontSize: `${style.fontSize}px`,
            fontWeight: style.fontWeight,
            fontStyle: style.fontStyle,
            textAlign: style.textAlign,
            color: style.color,
            backgroundColor: getBackgroundColor(),
            border: "none",
          }}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            // Exit editing on Escape
            if (e.key === "Escape") {
              setIsEditing(false);
            }
            
            // Apply changes and exit editing on Ctrl/Cmd + Enter
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              setIsEditing(false);
              e.preventDefault();
            }
          }}
        />
      ) : (
        renderTextContent()
      )}
      
      {/* Resize handle - only show when selected and not editing */}
      {isSelected && !isEditing && !isLocked && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize"
          onMouseDown={handleResizeStart}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="w-3 h-3 border-r-2 border-b-2"
            style={{ borderColor: getColor("latte") }}
          />
        </div>
      )}
      
      {/* Action toolbar - only visible when selected */}
      {isSelected && !isEditing && (
        <div
          className="absolute -top-10 left-0 flex bg-black-med rounded-md p-1"
          style={{ boxShadow: `0 2px 8px ${getColor("black-thin")}` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="p-1 rounded-md mr-1 hover:bg-black-med"
            onClick={() => setIsEditing(true)}
            title="Edit Text"
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
            className="p-1 rounded-md mr-1 hover:bg-black-med"
            onClick={() => {/* Layer ordering */}}
            title="Bring Forward"
          >
            <ArrowUp size={16} color={getColor("latte-med")} />
          </button>
          <button
            className="p-1 rounded-md mr-1 hover:bg-black-med"
            onClick={() => {/* Layer ordering */}}
            title="Send Backward"
          >
            <ArrowDown size={16} color={getColor("latte-med")} />
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

export default TextItem;
