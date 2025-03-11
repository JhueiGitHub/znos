// app/apps/studio/hooks/useDragAndDrop.ts
import { useState, useRef, useCallback } from "react";

interface DragAndDropResult {
  isDragging: boolean;
  dragRef: React.RefObject<HTMLDivElement>;
  handleDragStart: (e: React.DragEvent) => void;
  handleDragEnd: () => void;
}

export const useDragAndDrop = (): DragAndDropResult => {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    setIsDragging(true);

    // Set drag effect and data
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "dragging");

    // Set drag image if needed
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(
        dragRef.current,
        e.clientX - rect.left,
        e.clientY - rect.top
      );
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    dragRef,
    handleDragStart,
    handleDragEnd,
  };
};
