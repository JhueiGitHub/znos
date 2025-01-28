import { useEffect, useCallback, useState } from "react";

interface UseDropZoneProps {
  onDrop: (files: FileList, position: { x: number; y: number }) => void;
}

export function useDropZone({ onDrop }: UseDropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  // Track drag enter/leave with counter to handle child elements
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);

    const dt = e.dataTransfer;
    if (dt?.types.includes("Files")) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter((prev) => prev - 1);

      if (dragCounter - 1 === 0) {
        setIsDragActive(false);
      }
    },
    [dragCounter]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const dt = e.dataTransfer;
    if (dt) {
      dt.dropEffect = "copy";
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      setDragCounter(0);

      const dt = e.dataTransfer;
      if (dt?.files?.length) {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const position = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        onDrop(dt.files, position);
      }
    },
    [onDrop]
  );

  useEffect(() => {
    // Add event listeners to the window to catch drag events
    // outside the drop zone that might affect our state
    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  return {
    isDragActive,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}
