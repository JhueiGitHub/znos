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
  const [isFocused, setIsFocused] = useState(false);

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

  // Handle clicks to ensure focus
  const handleNoteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      // Only handle clicks that aren't on interactive elements
      if ((e.target as HTMLElement).tagName.toLowerCase() !== "textarea") {
        if (textareaRef.current && !isLinkNote) {
          // Focus the textarea when clicking anywhere on the note
          textareaRef.current.focus();

          // Make sure it's brought to front
          bringToFront(boardId, id);
        }
      }
    },
    [boardId, id, bringToFront, isLinkNote]
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

  // Calculate width based on note type
  const noteWidth = isLinkNote ? 300 : 200;

  // Apply shorthand visual effects
  const noteStyle = getShorthandStyles({
    width: noteWidth,
    backgroundColor: getColor(content.color || "night-med"),
    border: `1px solid ${getColor("graphite-thin")}`,
    transition: "box-shadow 0.3s ease, transform 0.2s ease",
    // Add a subtle outline when focused
    ...(isFocused && !isLinkNote
      ? { boxShadow: `0 0 0 1px ${getColor("graphite")}` }
      : {}),
  });

  // Determine if we should show a link embed
  const showEmbed = isLinkNote && content.url;

  // Handle position updates - fixed the type mismatch issue
  const handleDragEnd = useCallback(
    (finalPosition?: Position) => {
      if (finalPosition) {
        setNotePosition(finalPosition);
      }
      // Call parent's onDragEnd if provided
      if (onDragEnd) {
        onDragEnd();
      }
    },
    [onDragEnd]
  );

  return (
    <DraggableItem
      id={id}
      boardId={boardId}
      position={notePosition}
      zIndex={zIndex}
      className={`rounded shadow-lg overflow-hidden ${isLinkNote ? "" : "cursor-text"}`}
      style={noteStyle}
      onDragStart={onDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleNoteClick}
    >
      {showEmbed ? (
        // Link embed view
        <div className="p-2 drag-handle">
          <LinkEmbed url={content.url} onLoad={handleEmbedDataLoad} />
        </div>
      ) : (
        // Editable note view (always in edit mode - no switching)
        // Apply drag-handle class to outer div but not to textarea area
        <div className="w-full h-full">
          {/* Header area for dragging */}
          <div className="absolute top-0 left-0 right-0 h-8 drag-handle" />

          <textarea
            ref={textareaRef}
            className="w-full h-full bg-transparent border-none resize-none p-3 milanote-scrollbar outline-none"
            style={{
              color: getColor("smoke-med"),
              fontFamily: getFont("Text Secondary"),
              minHeight: "100px",
              caretColor: getColor("latte"),
              zIndex: 2, // Ensure textarea is above drag handle
              position: "relative",
            }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={(e) => {
              e.stopPropagation();
              bringToFront(boardId, id);
            }}
            onMouseDown={(e) => {
              // Prevent drag behavior when clicking on textarea
              e.stopPropagation();
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            spellCheck="false"
            autoFocus={text === ""}
          />
        </div>
      )}
    </DraggableItem>
  );
};

export default UnifiedNote;
