// app/apps/orion/components/Node.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Node as NodeType } from "../lib/types";
import { useStyles } from "@/app/hooks/useStyles";

interface NodeProps {
  node: NodeType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<NodeType>) => void;
  onDelete: (id: string) => void;
}

export function Node({
  node,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: NodeProps) {
  const { getColor, getFont } = useStyles();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(node.content);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(node.id, { content });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey === false) {
      e.preventDefault();
      setIsEditing(false);
      onUpdate(node.id, { content });
    }
  };

  const getNodeStyle = () => {
    switch (node.type) {
      case "note":
        return {
          backgroundColor: node.style?.backgroundColor || "#f7e8a4",
          borderColor: isSelected
            ? getColor("Lilac Accent")
            : node.style?.borderColor || "#e6d796",
          color: node.style?.color || "#000000",
        };
      case "image":
        return {
          backgroundColor: "transparent",
          borderColor: isSelected ? getColor("Lilac Accent") : "transparent",
        };
      case "link":
        return {
          backgroundColor: node.style?.backgroundColor || "#e1f5fe",
          borderColor: isSelected
            ? getColor("Lilac Accent")
            : node.style?.borderColor || "#81d4fa",
          color: node.style?.color || "#0277bd",
        };
      case "file":
        return {
          backgroundColor: node.style?.backgroundColor || "#e8f5e9",
          borderColor: isSelected
            ? getColor("Lilac Accent")
            : node.style?.borderColor || "#a5d6a7",
          color: node.style?.color || "#2e7d32",
        };
      default:
        return {
          backgroundColor: node.style?.backgroundColor || "#f7e8a4",
          borderColor: isSelected
            ? getColor("Lilac Accent")
            : node.style?.borderColor || "#e6d796",
          color: node.style?.color || "#000000",
        };
    }
  };

  return (
    <motion.div
      className="absolute rounded-md shadow-md overflow-hidden"
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.size.width,
        height: node.size.height,
        border: `2px solid ${getNodeStyle().borderColor}`,
        backgroundColor: getNodeStyle().backgroundColor,
        color: getNodeStyle().color,
        zIndex: node.zIndex,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {isEditing ? (
        <textarea
          className="w-full h-full p-3 focus:outline-none resize-none"
          style={{
            backgroundColor: "transparent",
            color: getNodeStyle().color,
            fontFamily: getFont("Text Secondary"),
          }}
          value={content}
          onChange={handleContentChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <div className="w-full h-full p-3 overflow-auto">
          {node.type === "note" && (
            <div
              style={{
                fontFamily: getFont("Text Secondary"),
                whiteSpace: "pre-wrap",
              }}
            >
              {content}
            </div>
          )}
          {node.type === "image" && (
            <img
              src={content}
              alt="Node Image"
              className="w-full h-full object-cover"
            />
          )}
          {node.type === "link" && (
            <div className="flex flex-col h-full">
              <div className="text-sm font-semibold mb-1">Link</div>
              <a
                href={content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline"
                style={{
                  fontFamily: getFont("Text Secondary"),
                }}
              >
                {content}
              </a>
            </div>
          )}
          {node.type === "file" && (
            <div className="flex flex-col h-full">
              <div className="text-sm font-semibold mb-1">File</div>
              <div
                className="text-sm"
                style={{
                  fontFamily: getFont("Text Secondary"),
                }}
              >
                {content}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
