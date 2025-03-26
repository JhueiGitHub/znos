// app/apps/mila/components/UnifiedNote.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { NoteContent, LinkContent, Position } from "../types";
import DraggableItem from "./DraggableItem";
import { useMilanoteStore } from "../store/milanoteStore";
import { useStyles } from "@/app/hooks/useStyles";
import { LinkEmbed } from "./embeds/LinkEmbed";
import { useShorthand } from "../hooks/useShorthand";

interface UnifiedNoteProps {
  id: string;
  boardId: string;
  position: Position;
  content: any; // This can be either NoteContent or LinkContent
  zIndex?: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

// URL pattern for detection
const URL_REGEX =
  /^(https?:\/\/)?(([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3})(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;

// Generate a unique storage key for position tracking
const getPositionStorageKey = (id: string) => `milanote_note_pos_${id}`;

const UnifiedNote: React.FC<UnifiedNoteProps> = ({
  id,
  boardId,
  position,
  content,
  zIndex,
  onDragStart,
  onDragEnd,
}) => {
  const { getColor, getFont } = useStyles();

  // Determine if this is a link note by checking for url property
  const isLinkNote = "url" in content;

  // Content state (always "editing" - no distinct modes)
  const [text, setText] = useState(
    isLinkNote ? content.url : content.text || ""
  );
  const [embedData, setEmbedData] = useState<any>(null);

  // Track view mode - two distinct modes: VIEW or EDIT
  // VIEW: Note is just displayed, can be selected, dragged
  // EDIT: Note is in edit mode, textarea is focused
  const [mode, setMode] = useState<"VIEW" | "EDIT">("VIEW");

  // Selected state for highlighting
  const [isSelected, setIsSelected] = useState(false);

  // Store the actual position in the component state to prevent teleporting
  const [notePosition, setNotePosition] = useState<Position>(position);

  // References
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSavedText = useRef(text);
  const isNewNoteRef = useRef(text === "");

  // Initialize shorthand hook
  const {
    shorthandActive,
    toggleShorthand,
    activate,
    deactivate,
    getShorthandStyles,
  } = useShorthand();

  // Access store methods
  const updateItem = useMilanoteStore((state) => state.updateItem);
  const deleteItem = useMilanoteStore((state) => state.deleteItem);
  const bringToFront = useMilanoteStore((state) => state.bringToFront);
  const updateItemPosition = useMilanoteStore(
    (state) => state.updateItemPosition
  );

  // Load saved position from localStorage on mount
  useEffect(() => {
    const storageKey = getPositionStorageKey(id);
    const savedPosition = localStorage.getItem(storageKey);

    if (savedPosition) {
      try {
        const parsedPosition = JSON.parse(savedPosition);
        // Only use saved position if it has valid coordinates
        if (
          typeof parsedPosition.x === "number" &&
          typeof parsedPosition.y === "number"
        ) {
          setNotePosition(parsedPosition);
          updateItemPosition(boardId, id, parsedPosition);
        }
      } catch (e) {
        console.error("Failed to parse saved position", e);
      }
    }
  }, [id, boardId, updateItemPosition]);

  // Save position to localStorage whenever it changes
  useEffect(() => {
    const storageKey = getPositionStorageKey(id);
    localStorage.setItem(storageKey, JSON.stringify(notePosition));
  }, [id, notePosition]);

  // Update the component position when the dragged position changes
  useEffect(() => {
    if (position.x !== notePosition.x || position.y !== notePosition.y) {
      setNotePosition(position);
    }
  }, [position, notePosition]);

  // Ensure focus on creation for new notes
  useEffect(() => {
    // If this is a new note (empty text), focus the textarea
    if (isNewNoteRef.current && textareaRef.current) {
      // Set a timeout to ensure DOM is ready
      setTimeout(() => {
        if (textareaRef.current) {
          setMode("EDIT");
          textareaRef.current.focus();
          isNewNoteRef.current = false; // Only focus once
        }
      }, 50);
    }
  }, []);

  // Check if current content is a URL only
  const isUrlOnly = useCallback((value: string) => {
    const trimmedValue = value.trim();
    return URL_REGEX.test(trimmedValue) && !trimmedValue.includes(" ");
  }, []);

  // Auto-save changes after a delay
  useEffect(() => {
    if (text === lastSavedText.current) return;

    const timerId = setTimeout(() => {
      // If content is just a URL, convert to link note
      if (isUrlOnly(text) && !isLinkNote) {
        // Save the current position
        const currentPosition = notePosition;

        // Delete the current note
        deleteItem(boardId, id);

        // Add new link note at the exact same position
        const newNoteId = useMilanoteStore
          .getState()
          .addItem(boardId, "link", currentPosition, {
            url: text.trim(),
            title: "", // No title - minimal UI
            description: "",
            color: content.color || "night-med",
          });

        // Save position in localStorage for the new note
        if (newNoteId) {
          localStorage.setItem(
            getPositionStorageKey(newNoteId),
            JSON.stringify(currentPosition)
          );
        }
      } else if (!isUrlOnly(text) && isLinkNote) {
        // Convert link note back to regular note
        const currentPosition = notePosition;

        // Delete the link note
        deleteItem(boardId, id);

        // Add regular note at the exact same position
        const newNoteId = useMilanoteStore
          .getState()
          .addItem(boardId, "note", currentPosition, {
            title: "",
            text: text,
            color: content.color || "night-med",
          });

        // Save position in localStorage for the new note
        if (newNoteId) {
          localStorage.setItem(
            getPositionStorageKey(newNoteId),
            JSON.stringify(currentPosition)
          );
        }
      } else {
        // Just update the current note's content
        updateItem(boardId, id, {
          content: {
            ...(isLinkNote
              ? { url: text, title: "", description: "" }
              : { text: text, title: "" }),
            color: content.color || "night-med",
          },
        });
      }

      lastSavedText.current = text;
    }, 500); // 500ms debounce

    return () => clearTimeout(timerId);
  }, [
    text,
    isLinkNote,
    boardId,
    id,
    content.color,
    deleteItem,
    isUrlOnly,
    notePosition,
    updateItem,
  ]);

  // Handle clicks on the note
  const handleNoteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      // Always bring the note to front
      bringToFront(boardId, id);

      // If already selected, switch to edit mode
      if (isSelected && mode === "VIEW" && !isLinkNote) {
        setMode("EDIT");

        // Schedule focus to ensure it happens after render
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        }, 0);
      } else {
        // First click just selects
        setIsSelected(true);
      }
    },
    [boardId, id, bringToFront, isLinkNote, isSelected, mode]
  );

  // Handle keydown events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Toggle shorthand on § key
    if (e.key === "§") {
      e.preventDefault();
      toggleShorthand();
    }

    // Bring note to front when typing
    bringToFront(boardId, id);
  };

  // Handle embed data load
  const handleEmbedDataLoad = useCallback((data: any) => {
    setEmbedData(data);
  }, []);

  // Autoresize the textarea as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [text]);

  // Setup shorthand listeners
  useEffect(() => {
    activate();
    return () => deactivate();
  }, [activate, deactivate]);

  // Handle document clicks to deselect when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Only process if we're selected or in edit mode
      if (isSelected || mode === "EDIT") {
        // Get all elements above the click point
        const elementsAtPoint = document.elementsFromPoint(
          e.clientX,
          e.clientY
        );

        // Check if any element is this note
        const isClickInsideNote = elementsAtPoint.some((element) =>
          element.closest(`[data-note-id="${id}"]`)
        );

        if (!isClickInsideNote) {
          // If clicked outside, exit edit mode and deselect
          setMode("VIEW");
          setIsSelected(false);

          // Blur the textarea if it's focused
          if (document.activeElement === textareaRef.current) {
            textareaRef.current?.blur();
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id, isSelected, mode]);

  // Calculate width based on note type
  const noteWidth = isLinkNote ? 300 : 200;

  // Apply shorthand visual effects with different styles based on mode
  const noteStyle = getShorthandStyles({
    width: noteWidth,
    backgroundColor: getColor(content.color || "night-med"),
    border: `1px solid ${getColor("graphite-thin")}`,
    transition: "box-shadow 0.3s ease, transform 0.2s ease",
    // Selection highlighting
    ...(isSelected ? { boxShadow: `0 0 0 2px ${getColor("latte")}` } : {}),
    // More prominent focus when in edit mode
    ...(mode === "EDIT" && !isLinkNote
      ? {
          boxShadow: `0 0 0 2px ${getColor("latte")}, 0 0 0 4px ${getColor("graphite")}`,
        }
      : {}),
  });

  // Determine if we should show a link embed
  const showEmbed = isLinkNote && content.url;

  // Handle drag start - blur textarea and ensure we're in view mode
  const handleDragStartInternal = useCallback(() => {
    // Ensure any focused textarea is blurred
    if (textareaRef.current && document.activeElement === textareaRef.current) {
      textareaRef.current.blur();
    }

    // Switch to view mode during drag
    setMode("VIEW");

    if (onDragStart) {
      onDragStart();
    }
  }, [onDragStart]);

  // Handle position updates
  const handleDragEnd = useCallback(
    (finalPosition?: Position) => {
      if (finalPosition) {
        setNotePosition(finalPosition);
      }

      if (onDragEnd) {
        onDragEnd();
      }
    },
    [onDragEnd]
  );

  // Get appropriate cursor style based on mode
  const getCursorStyle = () => {
    if (isLinkNote) return "";
    if (mode === "EDIT") return "text";
    if (isSelected) return "pointer";
    return "";
  };

  return (
    <DraggableItem
      id={id}
      boardId={boardId}
      position={notePosition}
      zIndex={zIndex}
      className={`rounded shadow-lg overflow-hidden`}
      style={{
        ...noteStyle,
        cursor: getCursorStyle(),
      }}
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEnd}
      onClick={handleNoteClick}
      data-note-id={id}
    >
      {showEmbed ? (
        // Link embed view
        <div className="p-2 drag-handle">
          <LinkEmbed url={content.url} onLoad={handleEmbedDataLoad} />
        </div>
      ) : (
        // Note with overlay view for selection and drag
        <div className="w-full h-full relative">
          {/* Top drag handle area */}
          <div className="absolute top-0 left-0 right-0 h-8 drag-handle" />

          {/* Textarea for editing */}
          <textarea
            ref={textareaRef}
            className="w-full h-full bg-transparent border-none resize-none p-3 milanote-scrollbar outline-none"
            style={{
              color: getColor("smoke-med"),
              fontFamily: getFont("Text Secondary"),
              minHeight: "100px",
              caretColor: getColor("latte"),
              zIndex: 2,
              position: "relative",
              // Only allow interaction when in EDIT mode
              pointerEvents: mode === "EDIT" ? "auto" : "none",
            }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={(e) => {
              e.stopPropagation();
              bringToFront(boardId, id);
            }}
            onFocus={() => {
              setMode("EDIT");
              setIsSelected(true);
            }}
            onBlur={() => {
              // Only exit edit mode if the note is still selected
              if (isSelected) {
                setMode("VIEW");
              }
            }}
            spellCheck="false"
            autoFocus={text === ""}
            readOnly={mode !== "EDIT"} // Important: readonly when not in edit mode
          />

          {/* Overlay layer for view mode - catches clicks and allows dragging */}
          {mode === "VIEW" && (
            <div
              className="absolute inset-0 cursor-pointer drag-handle"
              style={{
                zIndex: 3,
                cursor: "move",
              }}
              onClick={handleNoteClick}
              // Ensure this div doesn't block text visibility
              dangerouslySetInnerHTML={{ __html: "" }}
            />
          )}
        </div>
      )}
    </DraggableItem>
  );
};

export default UnifiedNote;
