// app/apps/milanote/components/MilanoteBoard.tsx
import React, { useState } from "react";
import { BoardContent, Position } from "../types";
import DraggableItem from "./DraggableItem";
import { useMilanoteStore } from "../store/milanoteStore";
import { useStyles } from "@/app/hooks/useStyles";
import { Folder, Edit2, Trash2 } from "lucide-react";

interface MilanoteBoardProps {
  id: string;
  boardId: string;
  position: Position;
  content: any; // Using any here as we need to cast it to BoardContent
  zIndex?: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const MilanoteBoard: React.FC<MilanoteBoardProps> = ({
  id,
  boardId,
  position,
  content,
  zIndex,
  onDragStart,
  onDragEnd,
}) => {
  const { getColor, getFont } = useStyles();
  const boardContent = content as BoardContent;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(boardContent.name || "");
  const [isHovered, setIsHovered] = useState(false);

  const updateItem = useMilanoteStore((state) => state.updateItem);
  const deleteItem = useMilanoteStore((state) => state.deleteItem);
  const navigateToBoard = useMilanoteStore((state) => state.navigateToBoard);

  // Default sizes for boards
  const DEFAULT_WIDTH = 81;
  const DEFAULT_HEIGHT = 111;

  // Handle save changes
  const handleSave = () => {
    updateItem(boardId, id, {
      content: {
        ...boardContent,
        name,
      },
    });
    setIsEditing(false);
  };

  // Handle key press for saving and canceling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setName(boardContent.name || "");
    }
  };

  // Handle delete
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    deleteItem(boardId, id);
  };

  // Handle double click to open board
  const handleDoubleClick = () => {
    navigateToBoard(id);
  };

  // Get icon for the board
  const getBoardIcon = () => {
    if (boardContent.icon) {
      return (
        <div className="mb-2 flex items-center justify-center h-14 w-14 overflow-hidden">
          <img
            src={boardContent.icon}
            alt=""
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback to generic folder icon
              (e.target as HTMLElement).style.display = "none";
              e.currentTarget.parentElement!.innerHTML = `<div class="flex items-center justify-center h-14 w-14">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z" 
                    stroke="${getColor("latte-med")}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>`;
            }}
          />
        </div>
      );
    }

    return (
      <div className="mb-2 flex items-center justify-center h-14 w-14">
        <Folder size={48} color={getColor("latte-med")} />
      </div>
    );
  };

  return (
    <DraggableItem
      id={id}
      boardId={boardId}
      position={position}
      zIndex={zIndex}
      className="rounded-md shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] "
      style={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
      }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className="drag-handle w-full h-full flex flex-col items-center justify-center p-2 relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hover controls */}
        {isHovered && (
          <div className="absolute top-1 right-1 flex gap-1 bg-black/30 rounded p-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsEditing(true);
              }}
              className="p-1 rounded hover:bg-black/20 opacity-70 hover:opacity-100"
            >
              <Edit2 size={12} color={getColor("smoke")} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded hover:bg-black/20 opacity-70 hover:opacity-100"
            >
              <Trash2 size={12} color={getColor("smoke")} />
            </button>
          </div>
        )}

        {/* Board content */}
        <div className="flex-1 flex flex-col items-center justify-center w-full ">
          {getBoardIcon()}

          {isEditing ? (
            <input
              className="w-full bg-black/10 rounded border-none px-2 py-1 text-center text-sm"
              style={{
                color: getColor("smoke"),
                fontFamily: getFont("Text Primary"),
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              autoFocus
            />
          ) : (
            <div
              className="text-center text-sm px-1 truncate w-full"
              style={{
                color: getColor("latte"), // Update to smoke-thick which is the #CCCCCC/81%
                fontFamily: getFont("Text Primary"),
              }}
            >
              {boardContent.name || "Untitled"}
            </div>
          )}
        </div>
      </div>
    </DraggableItem>
  );
};

export default MilanoteBoard;
