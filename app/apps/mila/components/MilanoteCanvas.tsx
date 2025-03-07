// app/apps/milanote/components/MilanoteCanvas.tsx
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useMilanoteStore } from "../store/milanoteStore";
import { useStyles } from "@/app/hooks/useStyles";
import MilanoteNote from "./MilanoteNote";
import MilanoteBoard from "./MilanoteBoard";
import { Position } from "../types";

const MilanoteCanvas: React.FC = () => {
  const { getColor } = useStyles();
  const canvasRef = useRef<HTMLDivElement>(null);
  const currentBoardId = useMilanoteStore((state) => state.currentBoardId);
  const currentBoard = useMilanoteStore(
    (state) => state.boards[currentBoardId]
  );
  const items = currentBoard?.items || [];
  const router = useRouter();

  // Canvas panning and zooming state
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPosition, setStartPanPosition] = useState<Position>({
    x: 0,
    y: 0,
  });
  const [canvasPosition, setCanvasPosition] = useState<Position>({
    x: 0,
    y: 0,
  });
  const [scale, setScale] = useState(1);
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Handle touch start events
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
    }
  };

  // Handle touch move events
  const handleTouchMove = (e: TouchEvent) => {
    if (
      e.touches.length === 2 &&
      touchStartX !== null &&
      touchStartY !== null
    ) {
      e.preventDefault();

      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;

      setCanvasPosition((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
    }
  };

  // Handle middle mouse or Alt+mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only initiate pan if it's middle mouse button or Alt+left click
    // and we're not already dragging a canvas item
    if ((e.button === 1 || (e.button === 0 && e.altKey)) && !isDraggingItem) {
      e.preventDefault();
      setIsPanning(true);
      setStartPanPosition({ x: e.clientX, y: e.clientY });
      document.body.style.cursor = "grabbing";
    }
  };

  // Handle mouse move for panning
  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning) return;

    const dx = e.clientX - startPanPosition.x;
    const dy = e.clientY - startPanPosition.y;

    setCanvasPosition((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    setStartPanPosition({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse up to end panning
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      document.body.style.cursor = "default";
    }
  };

  // Handle wheel for zooming and panning
  const handleWheel = (e: WheelEvent) => {
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

      setScale(newScale);
      setCanvasPosition({ x: newX, y: newY });
    } else {
      // Pan with wheel (no Ctrl key)
      setCanvasPosition((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Handle drag over for dropping new items
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Notify parent when an item is being dragged
  const handleItemDragStart = () => {
    setIsDraggingItem(true);
  };

  // Notify parent when item drag is complete
  const handleItemDragEnd = () => {
    setIsDraggingItem(false);
  };

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

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

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

      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, [
    isPanning,
    startPanPosition,
    scale,
    canvasPosition,
    handleMouseMove,
    handleMouseUp,
  ]);

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
