// app/apps/mila/components/MilanoteCanvas.tsx
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useMilanoteStore } from "../store/milanoteStore";
import { useStyles } from "@/app/hooks/useStyles";
import { useCanvasState } from "../hooks/useCanvasState";
import MilanoteNote from "./MilanoteNote";
import MilanoteBoard from "./MilanoteBoard";
import MilanoteLinkNote from "./MilanoteLinkNote";
import { Position } from "../types";

const MilanoteCanvas: React.FC = () => {
  const { getColor } = useStyles();
  const canvasRef = useRef<HTMLDivElement>(null);
  const currentBoardId = useMilanoteStore((state) => state.currentBoardId);
  const currentBoard = useMilanoteStore(
    (state) => state.boards[currentBoardId]
  );
  const addItem = useMilanoteStore((state) => state.addItem);
  const items = currentBoard?.items || [];
  const router = useRouter();

  // Get the user's profile ID from localStorage or generate a fallback
  // In a real app, you would get this from authentication
  const getUserId = () => {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      // Create a pseudo-random ID if none exists
      userId = "user_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("userId", userId);
    }
    return userId;
  };

  // Canvas panning and zooming state - now using our custom hook
  const {
    canvasPosition,
    scale,
    updatePosition,
    updateScale,
    updateCanvasState,
  } = useCanvasState({
    profileId: getUserId(),
    boardId: currentBoardId,
    defaultPosition: { x: 0, y: 0 },
    defaultScale: 1,
  });

  const [isPanning, setIsPanning] = useState(false);
  const [startPanPosition, setStartPanPosition] = useState<Position>({
    x: 0,
    y: 0,
  });
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Track if we're editing a note to prevent duplicate paste handling
  const activeEditRef = useRef<boolean>(false);
  const pasteHandledRef = useRef<boolean>(false);

  // Handle touch start events - Now updated to save position after touch
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
    }
  }, []);

  // Handle touch move events - Now updated to save position
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (
        e.touches.length === 2 &&
        touchStartX !== null &&
        touchStartY !== null
      ) {
        e.preventDefault();

        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;

        const newPosition = {
          x: canvasPosition.x + deltaX,
          y: canvasPosition.y + deltaY,
        };

        updatePosition(newPosition);

        setTouchStartX(e.touches[0].clientX);
        setTouchStartY(e.touches[0].clientY);
      }
    },
    [touchStartX, touchStartY, canvasPosition, updatePosition]
  );

  // Handle double-click to create a new item
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      // Don't create a note if we're editing or dragging
      if (activeEditRef.current || isDraggingItem) return;

      // Get canvas position to calculate the correct position for the new item
      if (!canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();

      // Calculate position in canvas coordinates
      const x = (e.clientX - canvasRect.left - canvasPosition.x) / scale;
      const y = (e.clientY - canvasRect.top - canvasPosition.y) / scale;

      // Add a new link note
      addItem(
        currentBoardId,
        "link", // This is the new type we'll handle
        { x, y },
        {
          url: "", // Start with empty URL
          title: "New Link",
          color: "night-med",
        }
      );
    },
    [addItem, canvasPosition, currentBoardId, isDraggingItem, scale]
  );

  // Handle middle mouse or Alt+mouse drag for panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // For double-click handling, track time
      const clickTime = new Date().getTime();
      const isDoubleClick = clickTime - lastClickTime < 300;
      setLastClickTime(clickTime);

      // Handle double-click to create item
      if (isDoubleClick && e.button === 0 && !e.altKey && !isDraggingItem) {
        // This is a valid double-click - create a new item at that position
        handleDoubleClick(e);
        return;
      }

      // Only initiate pan if it's middle mouse button or Alt+left click
      // and we're not already dragging a canvas item
      if ((e.button === 1 || (e.button === 0 && e.altKey)) && !isDraggingItem) {
        e.preventDefault();
        setIsPanning(true);
        setStartPanPosition({ x: e.clientX, y: e.clientY });
        document.body.style.cursor = "grabbing";
      }
    },
    [handleDoubleClick, isDraggingItem, lastClickTime]
  );

  // Handle mouse move for panning - Now updated to save position
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isPanning) return;

      const dx = e.clientX - startPanPosition.x;
      const dy = e.clientY - startPanPosition.y;

      const newPosition = {
        x: canvasPosition.x + dx,
        y: canvasPosition.y + dy,
      };

      updatePosition(newPosition);

      setStartPanPosition({ x: e.clientX, y: e.clientY });
    },
    [isPanning, startPanPosition, canvasPosition, updatePosition]
  );

  // Handle mouse up to end panning
  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      document.body.style.cursor = "default";
    }
  }, [isPanning]);

  // Handle wheel for zooming and panning - Now updated to save position and scale
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // Prevent horizontal swipes from triggering browser navigation
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
        e.preventDefault();
      }

      // Zoom with Ctrl+Wheel
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        // Calculate zoom around mouse position
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Mouse position relative to the current transform
        const mouseXInCanvas = (mouseX - canvasPosition.x) / scale;
        const mouseYInCanvas = (mouseY - canvasPosition.y) / scale;

        // Calculate new scale (zoom level)
        const delta = -e.deltaY * 0.001;
        const newScale = Math.max(0.1, Math.min(3, scale + delta));

        // Calculate new position to maintain the mouse position
        const newX = mouseX - mouseXInCanvas * newScale;
        const newY = mouseY - mouseYInCanvas * newScale;

        // Update both position and scale at once
        updateCanvasState({ x: newX, y: newY }, newScale);
      } else {
        // Pan with wheel (no Ctrl key)
        const newPosition = {
          x: canvasPosition.x - e.deltaX,
          y: canvasPosition.y - e.deltaY,
        };
        updatePosition(newPosition);
      }
    },
    [canvasPosition, scale, updatePosition, updateCanvasState]
  );

  // Handle drag over for dropping new items
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  // Handle paste events on the canvas
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      // Skip paste handling if we're already editing a note or if the paste event has been handled
      if (activeEditRef.current || pasteHandledRef.current) {
        return;
      }

      // Prevent duplicate paste handling by marking this event as handled
      pasteHandledRef.current = true;

      // Reset the handled flag after a short delay
      setTimeout(() => {
        pasteHandledRef.current = false;
      }, 100);

      // Process the paste event
      const pastedText = e.clipboardData?.getData("text");
      if (!pastedText) return;

      // Check if it's a URL
      const urlRegex =
        /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;
      if (urlRegex.test(pastedText)) {
        // Get center of viewport
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (!canvasRect) return;

        const x = (canvasRect.width / 2 - canvasPosition.x) / scale;
        const y = (canvasRect.height / 2 - canvasPosition.y) / scale;

        // Create a link note with the pasted URL
        addItem(
          currentBoardId,
          "link",
          { x, y },
          {
            url: pastedText,
            title: "New Link",
            color: "night-med",
          }
        );
      }
    },
    [addItem, currentBoardId, canvasPosition, scale]
  );

  // Notify editing state
  // These functions allow child components to notify the parent about editing state
  const notifyEditStart = useCallback(() => {
    activeEditRef.current = true;
  }, []);

  const notifyEditEnd = useCallback(() => {
    activeEditRef.current = false;
  }, []);

  // Notify parent when an item is being dragged
  const handleItemDragStart = useCallback(() => {
    setIsDraggingItem(true);
  }, []);

  // Notify parent when item drag is complete
  const handleItemDragEnd = useCallback(() => {
    setIsDraggingItem(false);
  }, []);

  // Add event listeners for panning and zooming
  useEffect(() => {
    // Create a "buffer" in the browser history
    const pushDummyState = () => {
      window.history.pushState({ page: "milanote-canvas" }, "");
      window.history.pushState({ page: "milanote-canvas-active" }, "");
    };

    pushDummyState();

    // Handle popstate (back button)
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.page === "milanote-canvas") {
        window.history.forward();
        setTimeout(pushDummyState, 0);
      }
    };

    // Set up all event listeners
    window.addEventListener("popstate", handlePopState);

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        handleMouseMove(e);
      }
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    // Add a modified paste handler that checks editing state
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Only handle paste if we're not currently editing
      if (!activeEditRef.current) {
        handlePaste(e);
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("paste", handleGlobalPaste);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
      canvas.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("paste", handleGlobalPaste);

      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, [
    isPanning,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handlePaste,
  ]);

  // When the currentBoardId changes, the useCanvasState hook will automatically
  // load the correct state for the new board - we don't need to manage that here

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: getColor("Night"),
        cursor: isPanning ? "grabbing" : "default",
      }}
      onMouseDown={handleMouseDown}
      onDragOver={handleDragOver}
    >
      <div
        className="milanote-canvas milanote-grid-pattern absolute"
        style={{
          transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${scale})`,
          transformOrigin: "0 0",
          width: "10000px", // Very large to accommodate items anywhere
          height: "10000px",
        }}
      >
        {/* Render all items sorted by z-index */}
        {[...items]
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map((item) => {
            switch (item.type) {
              case "note":
                return (
                  <MilanoteNote
                    key={item.id}
                    id={item.id}
                    boardId={currentBoardId}
                    position={item.position}
                    content={item.content}
                    zIndex={item.zIndex}
                    onDragStart={handleItemDragStart}
                    onDragEnd={handleItemDragEnd}
                  />
                );
              case "board":
                return (
                  <MilanoteBoard
                    key={item.id}
                    id={item.id}
                    boardId={currentBoardId}
                    position={item.position}
                    content={item.content}
                    zIndex={item.zIndex}
                    onDragStart={handleItemDragStart}
                    onDragEnd={handleItemDragEnd}
                  />
                );
              case "link":
                // Handle the new link type
                return (
                  <MilanoteLinkNote
                    key={item.id}
                    id={item.id}
                    boardId={currentBoardId}
                    position={item.position}
                    content={item.content}
                    zIndex={item.zIndex}
                    onDragStart={handleItemDragStart}
                    onDragEnd={handleItemDragEnd}
                  />
                );
              // Add other item types here as needed
              default:
                return null;
            }
          })}
      </div>
    </div>
  );
};

export default MilanoteCanvas;
