// app/apps/mila/components/MilanoteLinkNote.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { LinkContent, Position } from "../types";
import DraggableItem from "./DraggableItem";
import { useMilanoteStore } from "../store/milanoteStore";
import { useStyles } from "@/app/hooks/useStyles";
import {
  Trash2,
  Edit2,
  Link as LinkIcon,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { LinkEmbed } from "./embeds/LinkEmbed";

interface MilanoteLinkNoteProps {
  id: string;
  boardId: string;
  position: Position;
  content: any; // Using any here as we need to cast it to LinkContent
  zIndex?: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

// URL pattern for Sketchfab detection
const SKETCHFAB_URL_PATTERN = /sketchfab\.com\/(models|3d-models)\//;

const MilanoteLinkNote: React.FC<MilanoteLinkNoteProps> = ({
  id,
  boardId,
  position,
  content,
  zIndex,
  onDragStart,
  onDragEnd,
}) => {
  const { getColor, getFont } = useStyles();
  const linkContent = content as LinkContent;
  const [isEditing, setIsEditing] = useState(linkContent.url ? false : true);
  const [url, setUrl] = useState(linkContent.url || "");
  const [isHovered, setIsHovered] = useState(false);
  const [embedData, setEmbedData] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);

  // Detect if this is a Sketchfab URL to adjust the note size
  const isSketchfabUrl = linkContent.url
    ? SKETCHFAB_URL_PATTERN.test(linkContent.url)
    : false;

  // Use refs to prevent issues with stale closures and re-renders
  const linkContentRef = useRef(linkContent);
  const urlRef = useRef(url);
  const isEditingRef = useRef(isEditing);
  const idRef = useRef(id);
  const boardIdRef = useRef(boardId);

  // Update refs when props change
  useEffect(() => {
    linkContentRef.current = linkContent;
    urlRef.current = url;
    isEditingRef.current = isEditing;
    idRef.current = id;
    boardIdRef.current = boardId;
  }, [linkContent, url, isEditing, id, boardId]);

  const updateItem = useMilanoteStore((state) => state.updateItem);
  const deleteItem = useMilanoteStore((state) => state.deleteItem);
  const bringToFront = useMilanoteStore((state) => state.bringToFront);

  // Width state based on content type and expanded state
  const [noteWidth, setNoteWidth] = useState(320);
  const [noteHeight, setNoteHeight] = useState<number | undefined>(undefined);

  // Update dimensions based on content type and expanded state
  useEffect(() => {
    // Default size
    let width = 320;
    let height;

    // Expanded state overrides
    if (expanded) {
      width = isSketchfabUrl ? 318 : 400;
      height = isSketchfabUrl ? 366 : undefined;
    } else if (isSketchfabUrl) {
      // Sketchfab notes are a bit larger by default
      width = 360;
      height = 340;
    }

    setNoteWidth(width);
    setNoteHeight(height);
  }, [expanded, isSketchfabUrl]);

  // Handle save changes
  const handleSave = useCallback(() => {
    if (!urlRef.current) {
      // If URL is empty, do nothing
      setIsEditing(false);
      return;
    }

    // Process URL - if it doesn't have http/https prefix, add it
    const processedUrl = urlRef.current.startsWith("http")
      ? urlRef.current
      : `https://${urlRef.current}`;

    updateItem(boardIdRef.current, idRef.current, {
      content: {
        ...linkContentRef.current,
        url: processedUrl,
        // If we have embed data, use it for title/description
        title: embedData?.title || linkContentRef.current.title || "Link",
        description:
          embedData?.description || linkContentRef.current.description,
        thumbnail: embedData?.image || linkContentRef.current.thumbnail,
      },
    });

    // Auto-expand for Sketchfab links
    if (SKETCHFAB_URL_PATTERN.test(processedUrl) && !expanded) {
      setExpanded(true);
    }

    setIsEditing(false);

    // Bring this note to the front when saved
    bringToFront(boardIdRef.current, idRef.current);
  }, [embedData, updateItem, bringToFront, expanded]);

  // Handle embed data load - memoized to prevent re-renders
  const handleEmbedDataLoad = useCallback(
    (data: any) => {
      setEmbedData(data);

      // If we're not editing anymore, update the content
      if (!isEditingRef.current) {
        updateItem(boardIdRef.current, idRef.current, {
          content: {
            ...linkContentRef.current,
            title: data.title || linkContentRef.current.title || "Link",
            description: data.description || linkContentRef.current.description,
            thumbnail: data.image || linkContentRef.current.thumbnail,
          },
        });

        // Auto-expand for Sketchfab data
        if (data.type === "sketchfab" && !expanded) {
          setExpanded(true);
        }
      }
    },
    [updateItem, expanded]
  );

  // Handle paste event to extract URL
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    const pastedText = e.clipboardData.getData("text");

    // Simple URL validation
    const urlRegex =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (urlRegex.test(pastedText)) {
      setUrl(pastedText);
      urlRef.current = pastedText;

      // Auto-expand for Sketchfab links
      if (SKETCHFAB_URL_PATTERN.test(pastedText)) {
        setExpanded(true);
      }
    } else {
      // Not a URL, just set as text
      setUrl(pastedText);
      urlRef.current = pastedText;
    }
  }, []);

  // Handle key press for saving and canceling
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        setIsEditing(false);
        setUrl(linkContentRef.current.url || "");
      }
    },
    [handleSave]
  );

  // Handle delete
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteItem(boardIdRef.current, idRef.current);
    },
    [deleteItem]
  );

  // Handle edit click
  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  // Handle expand/collapse
  const toggleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setExpanded(!expanded);

      // Bring to front when expanded
      if (!expanded) {
        bringToFront(boardIdRef.current, idRef.current);
      }
    },
    [expanded, bringToFront]
  );

  // Handle mouse events for hover state
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Detect if this is the first time this component is rendered with no URL
  useEffect(() => {
    if (!linkContent.url) {
      setIsEditing(true);
      isEditingRef.current = true;
    } else if (isSketchfabUrl && !expanded) {
      // Auto-expand Sketchfab URLs on first load
      setExpanded(true);
    }
  }, [linkContent.url, isSketchfabUrl, expanded]);

  // Use a ref to prevent capturing paste events when not editing
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    // Only capture paste events when we're editing
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (isEditingRef.current && element.contains(e.target as Node)) {
        // Let the textarea handle its own paste event
        return;
      }

      // Prevent handling paste events when not editing
      if (isEditingRef.current) {
        e.stopPropagation();
      }
    };

    document.addEventListener("paste", handleGlobalPaste, true);

    return () => {
      document.removeEventListener("paste", handleGlobalPaste, true);
    };
  }, []);

  return (
    <DraggableItem
      id={id}
      boardId={boardId}
      position={position}
      zIndex={zIndex}
      className="rounded shadow-lg overflow-hidden transition-shadow duration-200"
      style={{
        width: noteWidth,
        height: noteHeight,
        backgroundColor: getColor("night-med"),
        border: `1px solid ${getColor("graphite-thin")}`,
        transition: "width 0.3s ease, height 0.3s ease",
      }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDoubleClick={() => setIsEditing(true)}
    >
      <div
        ref={contentRef}
        className="w-full h-full flex flex-col"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Minimalist header - only visible on hover unless editing */}
        <div
          className={`drag-handle flex justify-between items-center p-1 ${isHovered || isEditing ? "bg-black/20" : "bg-black/10"}`}
        >
          <div
            className="text-xs font-medium truncate opacity-70 flex items-center"
            style={{ color: getColor("smoke") }}
          >
            <LinkIcon size={12} className="mr-1" />
            <span className="truncate max-w-[200px]">
              {isSketchfabUrl ? "3D Model: " : ""}
              {linkContent.title || "Link"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Show expand/collapse button for all link notes */}
            <button
              onClick={toggleExpand}
              className="p-1 rounded hover:bg-black/20 opacity-70 hover:opacity-100"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? (
                <Minimize2 size={12} color={getColor("smoke")} />
              ) : (
                <Maximize2 size={12} color={getColor("smoke")} />
              )}
            </button>
            <button
              onClick={handleEditClick}
              className="p-1 rounded hover:bg-black/20 opacity-70 hover:opacity-100"
              title="Edit"
            >
              <Edit2 size={12} color={getColor("smoke")} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded hover:bg-black/20 opacity-70 hover:opacity-100"
              title="Delete"
            >
              <Trash2 size={12} color={getColor("smoke")} />
            </button>
          </div>
        </div>

        {/* Link content */}
        {isEditing ? (
          <div className="flex-1 flex flex-col p-3">
            <div
              className="text-xs mb-2"
              style={{ color: getColor("smoke-med") }}
            >
              Paste a link below:
            </div>
            <textarea
              className="flex-1 w-full min-h-[80px] bg-black/10 rounded border-none resize-none text-sm p-2 milanote-scrollbar"
              style={{
                color: getColor("smoke"),
                fontFamily: getFont("Text Secondary"),
              }}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                urlRef.current = e.target.value;
              }}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              placeholder="https://"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-2 py-1 text-xs rounded bg-black/20 hover:bg-black/30 transition-colors"
                style={{ color: getColor("smoke-thin") }}
                onClick={() => {
                  setIsEditing(false);
                  setUrl(linkContent.url || "");
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
        ) : (
          <div
            className="flex-1 overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {linkContent.url ? (
              <div className="p-2">
                <LinkEmbed url={linkContent.url} onLoad={handleEmbedDataLoad} />
              </div>
            ) : (
              <div
                className="flex items-center justify-center h-full"
                style={{ color: getColor("smoke-thin") }}
              >
                <div className="text-center p-4">
                  <LinkIcon size={24} className="mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No link added</div>
                  <div className="text-xs mt-1 opacity-70">
                    Double-click to add a link
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DraggableItem>
  );
};

export default MilanoteLinkNote;
