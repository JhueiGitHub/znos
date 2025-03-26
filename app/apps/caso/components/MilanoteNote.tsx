// This is an update to the existing MilanoteNote.tsx file to add shorthand functionality
// app/apps/mila/components/MilanoteNote.tsx

import React, { useState, useEffect, useRef } from "react";
import { NoteContent, Position } from "../types";
import DraggableItem from "./DraggableItem";
import { useMilanoteStore } from "../store/milanoteStore";
import { useStyles } from "@/app/hooks/useStyles";
import { Trash2, Edit2 } from "lucide-react";
import { useShorthand } from "../hooks/useShorthand";

interface MilanoteNoteProps {
  id: string;
  boardId: string;
  position: Position;
  content: any; // Using any here as we need to cast it to NoteContent
  zIndex?: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const MilanoteNote: React.FC<MilanoteNoteProps> = ({
  id,
  boardId,
  position,
  content,
  zIndex,
  onDragStart,
  onDragEnd,
}) => {
  const { getColor, getFont } = useStyles();
  const noteContent = content as NoteContent;
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(noteContent.title || "");
  const [text, setText] = useState(noteContent.text || "");
  const [isHovered, setIsHovered] = useState(false);

  // Add shorthand functionality
  const { shorthandActive, toggleShorthand, activate, deactivate } =
    useShorthand();

  // Text input ref for focusing
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const updateItem = useMilanoteStore((state) => state.updateItem);
  const deleteItem = useMilanoteStore((state) => state.deleteItem);

  // URL detection regex
  const URL_REGEX =
    /^(https?:\/\/)?(([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3})(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;

  // Handle save changes
  const handleSave = () => {
    // Check if the note only contains a URL
    const trimmedText = text.trim();
    if (URL_REGEX.test(trimmedText) && !trimmedText.includes(" ")) {
      // If it's just a URL, delete this note and create a new link note
      deleteItem(boardId, id);

      // Add a new link note at the same position
      useMilanoteStore.getState().addItem(boardId, "link", position, {
        url: trimmedText,
        title: title || "Link",
        color: noteContent.color || "night-med",
      });
    } else {
      // Otherwise save as a regular note
      updateItem(boardId, id, {
        content: {
          ...noteContent,
          title,
          text,
        },
      });
    }

    setIsEditing(false);
  };

  // Handle key press for saving and canceling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "§") {
      e.preventDefault();
      toggleShorthand();
      return;
    }

    if (e.key === "Enter" && e.metaKey) {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setTitle(noteContent.title || "");
      setText(noteContent.text || "");
    }
  };

  // Handle delete
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItem(boardId, id);
  };

  // Handle edit click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  // Add shorthand event listeners when editing
  useEffect(() => {
    if (isEditing) {
      activate();
    } else {
      deactivate();
    }

    return () => {
      deactivate();
    };
  }, [isEditing, activate, deactivate]);

  // Focus the text input when editing starts
  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [isEditing]);

  // Default sizes for notes
  const DEFAULT_WIDTH = 200;

  // Determine note style with shorthand effects
  const noteStyle = {
    width: DEFAULT_WIDTH,
    backgroundColor: getColor(noteContent.color || "night-med"),
    border: `1px solid ${getColor("graphite-thin")}`,
    ...(shorthandActive
      ? {
          boxShadow: `0 0 15px ${getColor("latte-med")}`,
          transform: "scale(1.02)",
        }
      : {}),
  };

  return (
    <DraggableItem
      id={id}
      boardId={boardId}
      position={position}
      zIndex={zIndex}
      className="rounded shadow-lg overflow-hidden transition-shadow duration-200"
      style={noteStyle}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDoubleClick={() => setIsEditing(true)}
    >
      <div
        className="w-full h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Minimalist header - only visible on hover unless editing */}
        {(isHovered || isEditing) && (
          <div className="drag-handle flex justify-between items-center p-1 bg-black/20">
            <div
              className="text-xs font-medium truncate opacity-70"
              style={{ color: getColor("smoke") }}
            >
              {noteContent.title || "Note"}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleEditClick}
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
          </div>
        )}

        {/* Note content */}
        {isEditing ? (
          <div className="flex-1 flex flex-col p-2">
            <input
              className="w-full bg-black/10 rounded border-none mb-2 px-2 py-1 text-sm"
              style={{
                color: getColor("smoke"),
                fontFamily: getFont("Text Primary"),
              }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              autoFocus
            />
            <textarea
              ref={textInputRef}
              className="flex-1 w-full bg-black/5 rounded border-none resize-none text-sm p-2 milanote-scrollbar"
              style={{
                color: getColor("smoke"),
                fontFamily: getFont("Text Secondary"),
                ...(shorthandActive
                  ? {
                      backgroundColor: getColor("black-thin"),
                      color: getColor("latte"),
                    }
                  : {}),
              }}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter note text..."
            />
            <div className="flex justify-between items-center mt-2">
              <div
                className={`text-xs ${shorthandActive ? "text-latte font-medium" : "text-smoke-thin"}`}
                style={{
                  color: shorthandActive
                    ? getColor("latte")
                    : getColor("smoke-thin"),
                  opacity: shorthandActive ? 1 : 0.6,
                }}
              >
                {shorthandActive
                  ? "Shorthand mode active"
                  : "Press § for shorthand"}
              </div>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 text-xs rounded bg-black/20 hover:bg-black/30 transition-colors"
                  style={{ color: getColor("smoke-thin") }}
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(noteContent.title || "");
                    setText(noteContent.text || "");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-2 py-1 text-xs rounded bg-latte-med/50 hover:bg-latte-med/70 transition-colors"
                  style={{ color: getColor("smoke") }}
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex-1 p-3 overflow-y-auto milanote-scrollbar cursor-text"
            onClick={() => setIsEditing(true)}
          >
            {/* Only show title if present and not already showing in header */}
            {noteContent.title && !isHovered && (
              <div
                className="font-medium mb-1 text-m"
                style={{
                  color: getColor("latte"),
                  fontFamily: getFont("Text Secondary"),
                }}
              >
                {noteContent.title}
              </div>
            )}
            <div
              className="text-[13px] whitespace-pre-wrap pt-[3px]"
              style={{
                color: getColor("smoke-med"),
              }}
            >
              {noteContent.text || (
                <span className="opacity-50 italic">Empty note</span>
              )}
            </div>
          </div>
        )}
      </div>
    </DraggableItem>
  );
};

export default MilanoteNote;
