// app/apps/mila/components/DraggableItem.tsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Position, Dimensions } from "../types";
import { useMilanoteStore } from "../store/milanoteStore";

interface DraggableItemProps {
  id: string;
  boardId: string;
  position: Position;
  dimensions?: Dimensions; // New prop for dimensions
  minWidth?: number; // Minimum width constraint
  minHeight?: number; // Minimum height constraint
  isResizable?: boolean; // Flag to enable/disable resize
  zIndex?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onDragStart?: () => void;
  onDragEnd?: (finalPosition?: Position) => void;
  onResizeStart?: () => void;
  onResize?: (dimensions: Dimensions) => void;
  onResizeEnd?: (finalDimensions: Dimensions) => void;
  "data-note-id"?: string;
}

// Resize handle positions
type ResizeHandlePosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "right"
  | "bottom";

const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  boardId,
  position,
  dimensions = { width: "auto", height: "auto" },
  minWidth = 100,
  minHeight = 60,
  isResizable = false,
  zIndex = 1,
  children,
  className = "",
  style = {},
  onClick,
  onDoubleClick,
  onDragStart,
  onDragEnd,
  onResizeStart,
  onResize,
  onResizeEnd,
  "data-note-id": noteId,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandlePosition | null>(
    null
  );
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [resizeOffset, setResizeOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const mouseDownStartRef = useRef<{ x: number; y: number } | null>(null);

  const updateItemPosition = useMilanoteStore(
    (state) => state.updateItemPosition
  );
  const bringToFront = useMilanoteStore((state) => state.bringToFront);

  // Helper to ensure dimensions are type-safe
  const sanitizeDimensions = (dimensions: any): Dimensions => {
    return {
      width:
        dimensions.width === "auto"
          ? "auto"
          : typeof dimensions.width === "number"
            ? dimensions.width
            : 200,
      height:
        dimensions.height === "auto"
          ? "auto"
          : typeof dimensions.height === "number"
            ? dimensions.height
            : "auto",
    };
  };

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

    // Check if this is a resize handle
    const targetEl = e.target as HTMLElement;
    const isResizeHandleClick = targetEl.closest(".resize-handle");

    if (isResizeHandleClick && isResizable) {
      e.preventDefault();
      e.stopPropagation();

      // Get which handle was clicked
      const handlePos = targetEl.getAttribute(
        "data-handle-position"
      ) as ResizeHandlePosition;
      setResizeHandle(handlePos);

      // Record initial position for resizing
      mouseDownStartRef.current = { x: e.clientX, y: e.clientY };

      // Record initial dimensions
      const element = elementRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();

      // Calculate the offset for maintaining position while resizing from top/left
      setResizeOffset({
        x: rect.right - e.clientX,
        y: rect.bottom - e.clientY,
      });

      // Bring item to front
      bringToFront(boardId, id);

      // Start resize mode
      setIsResizing(true);

      if (onResizeStart) {
        onResizeStart();
      }

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

  // Handle mouse move for dragging and resizing
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // If no mouse down event happened, ignore
      if (!mouseDownStartRef.current) return;

      // Get canvas element and its transformation for scaling
      const element = elementRef.current;
      if (!element) return;

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

      // Handle resizing
      if (isResizing && resizeHandle) {
        const rect = element.getBoundingClientRect();
        let newWidth = rect.width;
        let newHeight = rect.height;
        let newX = parseFloat(element.style.left) || position.x;
        let newY = parseFloat(element.style.top) || position.y;

        // Calculate new dimensions based on which handle is being dragged
        switch (resizeHandle) {
          case "right":
            newWidth = (e.clientX - rect.left + resizeOffset.x / 2) / scale;
            break;
          case "bottom":
            newHeight = (e.clientY - rect.top + resizeOffset.y / 2) / scale;
            break;
          case "bottom-right":
            newWidth = (e.clientX - rect.left + resizeOffset.x / 2) / scale;
            newHeight = (e.clientY - rect.top + resizeOffset.y / 2) / scale;
            break;
          case "bottom-left":
            newWidth = (rect.right - e.clientX + resizeOffset.x / 2) / scale;
            newX =
              (e.clientX - canvasRect.left) / scale -
              resizeOffset.x / 2 / scale;
            newHeight = (e.clientY - rect.top + resizeOffset.y / 2) / scale;
            break;
          case "top-right":
            newWidth = (e.clientX - rect.left + resizeOffset.x / 2) / scale;
            newHeight = (rect.bottom - e.clientY + resizeOffset.y / 2) / scale;
            newY =
              (e.clientY - canvasRect.top) / scale - resizeOffset.y / 2 / scale;
            break;
          case "top-left":
            newWidth = (rect.right - e.clientX + resizeOffset.x / 2) / scale;
            newHeight = (rect.bottom - e.clientY + resizeOffset.y / 2) / scale;
            newX =
              (e.clientX - canvasRect.left) / scale -
              resizeOffset.x / 2 / scale;
            newY =
              (e.clientY - canvasRect.top) / scale - resizeOffset.y / 2 / scale;
            break;
        }

        // Apply minimum size constraints
        newWidth = Math.max(newWidth, minWidth);
        newHeight = Math.max(newHeight, minHeight);

        // Update the element style directly
        element.style.width = `${newWidth}px`;
        element.style.height = `${newHeight}px`;
        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;

        // Store for final update
        element.dataset.width = newWidth.toString();
        element.dataset.height = newHeight.toString();
        element.dataset.x = newX.toString();
        element.dataset.y = newY.toString();

        // Notify parent of resize
        if (onResize) {
          onResize({ width: newWidth, height: newHeight });
        }

        return;
      }

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
    [
      isDragging,
      isResizing,
      resizeHandle,
      offset,
      resizeOffset,
      onDragStart,
      boardId,
      id,
      position,
      minWidth,
      minHeight,
      onResize,
    ]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      // Reset the mousedown ref
      const wasMouseDown = !!mouseDownStartRef.current;
      mouseDownStartRef.current = null;

      // Handle resize end
      if (isResizing) {
        const element = elementRef.current;
        if (element) {
          // Get the final dimensions
          const width = element.dataset.width
            ? parseFloat(element.dataset.width)
            : typeof dimensions.width === "number"
              ? dimensions.width
              : null;

          const height = element.dataset.height
            ? parseFloat(element.dataset.height)
            : typeof dimensions.height === "number"
              ? dimensions.height
              : null;

          const x = parseFloat(element.dataset.x || position.x.toString());
          const y = parseFloat(element.dataset.y || position.y.toString());

          // Ensure we have valid dimensions
          const rawDimensions = {
            width: width !== null ? width : dimensions.width,
            height: height !== null ? height : dimensions.height,
          };

          // Sanitize dimensions to ensure they match the expected types
          const finalDimensions = sanitizeDimensions(rawDimensions);

          // Update position too if it changed during resize
          updateItemPosition(boardId, id, { x, y });

          // Notify parent about final dimensions
          if (onResizeEnd) {
            onResizeEnd(finalDimensions);
          }

          // Restore transition
          element.style.transition = "";
        }

        // Reset resizing state
        setIsResizing(false);
        setResizeHandle(null);
        return;
      }

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
    [
      isDragging,
      isResizing,
      onClick,
      updateItemPosition,
      boardId,
      id,
      onDragEnd,
      onResizeEnd,
      position,
      dimensions,
    ]
  );

  // Add and remove event listeners
  useEffect(() => {
    // Always listen for these events
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Update UI for dragging/resizing state
    if (isDragging) {
      if (elementRef.current) {
        elementRef.current.classList.add("dragging");
      }
      document.body.style.cursor = "grabbing";
    } else if (isResizing) {
      if (elementRef.current) {
        elementRef.current.classList.add("resizing");
      }

      // Set appropriate cursor based on resize handle
      switch (resizeHandle) {
        case "top-left":
        case "bottom-right":
          document.body.style.cursor = "nwse-resize";
          break;
        case "top-right":
        case "bottom-left":
          document.body.style.cursor = "nesw-resize";
          break;
        case "right":
          document.body.style.cursor = "ew-resize";
          break;
        case "bottom":
          document.body.style.cursor = "ns-resize";
          break;
        default:
          document.body.style.cursor = "default";
      }
    } else {
      if (elementRef.current) {
        elementRef.current.classList.remove("dragging", "resizing");
      }
      document.body.style.cursor = "";
    }

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
    };
  }, [isDragging, isResizing, resizeHandle, handleMouseMove, handleMouseUp]);

  // Render resize handles if resizable and not dragging
  const renderResizeHandles = () => {
    if (!isResizable) return null;

    return (
      <>
        <div
          className="resize-handle resize-handle-right"
          data-handle-position="right"
          style={{
            position: "absolute",
            right: "-3px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "6px",
            height: "30px",
            cursor: "ew-resize",
            zIndex: 10,
          }}
        />
        <div
          className="resize-handle resize-handle-bottom"
          data-handle-position="bottom"
          style={{
            position: "absolute",
            bottom: "-3px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "30px",
            height: "6px",
            cursor: "ns-resize",
            zIndex: 10,
          }}
        />
        <div
          className="resize-handle resize-handle-corner resize-handle-bottom-right"
          data-handle-position="bottom-right"
          style={{
            position: "absolute",
            bottom: "-3px",
            right: "-3px",
            width: "10px",
            height: "10px",
            cursor: "nwse-resize",
            zIndex: 10,
          }}
        />
        <div
          className="resize-handle resize-handle-corner resize-handle-bottom-left"
          data-handle-position="bottom-left"
          style={{
            position: "absolute",
            bottom: "-3px",
            left: "-3px",
            width: "10px",
            height: "10px",
            cursor: "nesw-resize",
            zIndex: 10,
          }}
        />
        <div
          className="resize-handle resize-handle-corner resize-handle-top-right"
          data-handle-position="top-right"
          style={{
            position: "absolute",
            top: "-3px",
            right: "-3px",
            width: "10px",
            height: "10px",
            cursor: "nesw-resize",
            zIndex: 10,
          }}
        />
        <div
          className="resize-handle resize-handle-corner resize-handle-top-left"
          data-handle-position="top-left"
          style={{
            position: "absolute",
            top: "-3px",
            left: "-3px",
            width: "10px",
            height: "10px",
            cursor: "nwse-resize",
            zIndex: 10,
          }}
        />
      </>
    );
  };

  // Modify the JSX return to properly set dimensions
  return (
    <div
      ref={elementRef}
      className={`milanote-item ${className} ${isDragging ? "dragging" : ""} ${isResizing ? "resizing" : ""}`}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: dimensions.width === "auto" ? "auto" : `${dimensions.width}px`,
        height:
          dimensions.height === "auto" ? "auto" : `${dimensions.height}px`,
        zIndex,
        touchAction: "none", // Prevent touch actions to avoid conflicts
        ...style,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      data-note-id={noteId}
    >
      {children}
      {renderResizeHandles()}
    </div>
  );
};

export default DraggableItem;
