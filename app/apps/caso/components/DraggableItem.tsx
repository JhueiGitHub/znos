// app/apps/mila/components/DraggableItem.tsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Position } from "../types";
import { useMilanoteStore } from "../store/milanoteStore";

interface DraggableItemProps {
  id: string;
  boardId: string;
  position: Position;
  zIndex?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onDragStart?: () => void;
  onDragEnd?: (finalPosition?: Position) => void;
  "data-note-id"?: string;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  boardId,
  position,
  zIndex = 1,
  children,
  className = "",
  style = {},
  onClick,
  onDoubleClick,
  onDragStart,
  onDragEnd,
  "data-note-id": noteId,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const mouseDownStartRef = useRef<{ x: number; y: number } | null>(null);

  const updateItemPosition = useMilanoteStore(
    (state) => state.updateItemPosition
  );
  const bringToFront = useMilanoteStore((state) => state.bringToFront);

  // Handle mouse down for drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag if mouse is on textarea or interactive elements
    if (
      (e.target as HTMLElement).tagName.toLowerCase() === "textarea" ||
      (e.target as HTMLElement).tagName.toLowerCase() === "input" ||
      (e.target as HTMLElement).tagName.toLowerCase() === "button"
    ) {
      return;
    }

    // Only handle drag on the drag handle
    if (!e.target || !(e.target as HTMLElement).closest(".drag-handle")) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Record initial position for threshold detection
    mouseDownStartRef.current = { x: e.clientX, y: e.clientY };

    // Get the element's current position
    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();

    // Calculate the mouse offset within the element
    const mouseXInElement = e.clientX - rect.left;
    const mouseYInElement = e.clientY - rect.top;

    // Set offset based on exact position where mouse clicked
    setOffset({
      x: mouseXInElement,
      y: mouseYInElement,
    });

    // Reset any transitions to ensure smooth dragging
    element.style.transition = "none";

    // Bring this item to the front
    bringToFront(boardId, id);
  };

  // Handle mouse move for dragging - attach to window to capture all movement
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // If no mouse down event happened, ignore
      if (!mouseDownStartRef.current) return;

      // If we're not dragging yet, check if we should start
      if (!isDragging) {
        const dx = Math.abs(e.clientX - mouseDownStartRef.current.x);
        const dy = Math.abs(e.clientY - mouseDownStartRef.current.y);

        // Use a lower threshold to start dragging more quickly (3px)
        if (dx < 3 && dy < 3) {
          return; // Below threshold, not dragging yet
        }

        // Started dragging, set state and notify parent
        setIsDragging(true);

        if (onDragStart) {
          onDragStart();
        }
      }

      // If we're now dragging, update position
      if (isDragging) {
        const element = elementRef.current;
        if (!element) return;

        // Get canvas element and its transformation
        const canvasEl = element.closest(".milanote-canvas");
        if (!canvasEl) return;

        const canvasRect = canvasEl.getBoundingClientRect();
        const canvasTransform = window.getComputedStyle(canvasEl).transform;

        // Extract scale from matrix
        let scale = 1;
        try {
          const matrix = new DOMMatrix(canvasTransform);
          scale = matrix.a || 1;
        } catch (err) {
          console.warn("Failed to parse transform matrix, using default scale");
        }

        // Calculate new position in canvas coordinates
        const x = (e.clientX - canvasRect.left) / scale - offset.x / scale;
        const y = (e.clientY - canvasRect.top) / scale - offset.y / scale;

        // Directly set left/top for more reliable positioning
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;

        // Store for final position update
        element.dataset.x = x.toString();
        element.dataset.y = y.toString();
      }
    },
    [isDragging, offset, onDragStart, boardId, id]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      // Reset the mousedown ref
      const wasMouseDown = !!mouseDownStartRef.current;
      mouseDownStartRef.current = null;

      // If we weren't dragging, but had mousedown, this is a click
      if (wasMouseDown && !isDragging && onClick) {
        // This was a simple click, trigger the click handler
        const syntheticEvent = {
          clientX: e.clientX,
          clientY: e.clientY,
          target: e.target,
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as React.MouseEvent;

        onClick(syntheticEvent);
      }

      // If we were dragging, finalize the drag
      if (isDragging) {
        const element = elementRef.current;
        if (element) {
          // Get the final position
          const x = parseFloat(element.dataset.x || "0");
          const y = parseFloat(element.dataset.y || "0");

          // Ensure we have valid coordinates
          const finalX = isNaN(x) ? position.x : x;
          const finalY = isNaN(y) ? position.y : y;

          // Update the position in the store
          updateItemPosition(boardId, id, { x: finalX, y: finalY });

          // Notify parent
          if (onDragEnd) {
            onDragEnd({ x: finalX, y: finalY });
          }

          // Restore transition
          element.style.transition = "";
        }

        // Reset dragging state
        setIsDragging(false);
      }
    },
    [isDragging, onClick, updateItemPosition, boardId, id, onDragEnd, position]
  );

  // Add and remove event listeners
  useEffect(() => {
    // Always listen for these events
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Update UI for dragging state
    if (isDragging) {
      if (elementRef.current) {
        elementRef.current.classList.add("dragging");
      }
      document.body.style.cursor = "grabbing";
    } else {
      if (elementRef.current) {
        elementRef.current.classList.remove("dragging");
      }
      document.body.style.cursor = "";
    }

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={elementRef}
      className={`milanote-item ${className} ${isDragging ? "dragging" : ""}`}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex,
        touchAction: "none", // Prevent touch actions to avoid conflicts
        ...style,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      data-note-id={noteId}
    >
      {children}
    </div>
  );
};

export default DraggableItem;
