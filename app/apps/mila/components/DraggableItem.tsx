// app/apps/milanote/components/DraggableItem.tsx
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
  onDoubleClick?: (e: React.MouseEvent) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  boardId,
  position,
  zIndex = 1,
  children,
  className = "",
  style = {},
  onDoubleClick,
  onDragStart,
  onDragEnd,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const updateItemPosition = useMilanoteStore(
    (state) => state.updateItemPosition
  );
  const bringToFront = useMilanoteStore((state) => state.bringToFront);

  // Handle mouse down for drag start
  // Handle mouse down for drag start
  // Handle mouse down for drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle drag on the drag handle or when the whole element is draggable
    if (!e.target || !(e.target as HTMLElement).closest(".drag-handle")) return;

    e.preventDefault();
    e.stopPropagation();

    // Get the element's current position
    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();

    // Get canvas element for coordinate calculation
    const canvasEl = element.closest(".milanote-canvas");
    if (!canvasEl) return;

    const canvasRect = canvasEl.getBoundingClientRect();

    // Extract canvas scale
    let scale = 1;
    try {
      const canvasTransform = window.getComputedStyle(canvasEl).transform;
      const matrix = new DOMMatrix(canvasTransform);
      scale = matrix.a || 1;
    } catch (err) {
      console.warn("Failed to parse transform matrix, using default scale");
    }

    // Calculate the mouse offset within the element accounting for canvas scale
    const mouseXInElement = e.clientX - rect.left;
    const mouseYInElement = e.clientY - rect.top;

    // Set offset based on exact position where mouse clicked
    setOffset({
      x: mouseXInElement,
      y: mouseYInElement,
    });

    // Reset any transitions to ensure smooth dragging
    element.style.transition = "none";

    setIsDragging(true);

    // Bring this item to the front
    bringToFront(boardId, id);

    // Notify parent that dragging has started
    onDragStart?.();
  };

  // Handle mouse move for dragging - attach to window to capture all movement
  // Handle mouse move for dragging - attach to window to capture all movement
  // Handle mouse move for dragging - attach to window to capture all movement
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const element = elementRef.current;
      if (!element) return;

      // Get canvas element and its transformation
      const canvasEl = element.closest(".milanote-canvas");
      if (!canvasEl) return;

      const canvasRect = canvasEl.getBoundingClientRect();
      const canvasTransform = window.getComputedStyle(canvasEl).transform;

      // Extract scale and translation from matrix
      let scale = 1;
      try {
        const matrix = new DOMMatrix(canvasTransform);
        scale = matrix.a || 1;
      } catch (err) {
        console.warn("Failed to parse transform matrix, using default scale");
      }

      // Calculate new position in canvas coordinates
      // This is critical for smooth dragging - we need the precise position
      const x = (e.clientX - canvasRect.left) / scale - offset.x / scale;
      const y = (e.clientY - canvasRect.top) / scale - offset.y / scale;

      // Directly set left/top for more reliable positioning (vs transform)
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;

      // Store for final position update
      element.dataset.x = x.toString();
      element.dataset.y = y.toString();

      // Request an animation frame to ensure smoother rendering
      requestAnimationFrame(() => {
        if (elementRef.current) {
          elementRef.current.style.transition = "none";
        }
      });
    },
    [isDragging, offset]
  );

  // Handle mouse up for drag end
  // Handle mouse up for drag end
  // Handle mouse up for drag end
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    const element = elementRef.current;
    if (!element) return;

    // Get the final position from dataset (stored during drag)
    const x = parseFloat(element.dataset.x || "0");
    const y = parseFloat(element.dataset.y || "0");

    // Ensure we have valid coordinates
    const finalX = isNaN(x) ? position.x : x;
    const finalY = isNaN(y) ? position.y : y;

    // Update the position in the store with properly validated coordinates
    updateItemPosition(boardId, id, { x: finalX, y: finalY });

    // Restore transition for smooth subsequent movements
    element.style.transition = "";

    setIsDragging(false);

    // Notify parent that dragging has ended
    onDragEnd?.();
  }, [isDragging, updateItemPosition, boardId, id, onDragEnd, position]);

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      // Apply dragging class
      if (elementRef.current) {
        elementRef.current.classList.add("dragging");
      }

      // Set cursor to grabbing
      document.body.style.cursor = "grabbing";
    } else {
      // Clean up
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      if (elementRef.current) {
        elementRef.current.classList.remove("dragging");
      }

      // Reset cursor
      document.body.style.cursor = "default";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
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
    >
      {children}
    </div>
  );
};

export default DraggableItem;
