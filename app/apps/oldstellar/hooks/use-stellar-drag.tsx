import { useCallback } from "react";

export const useStellarDrag = () => {
  const handleDragStart = useCallback(
    (e: React.DragEvent, folderId: string) => {
      e.dataTransfer.setData("text/plain", folderId);
      e.dataTransfer.setData("source", "canvas"); // To identify it came from folders area
      e.dataTransfer.effectAllowed = "move";

      // Optionally dispatch an event to notify other components
      document.dispatchEvent(
        new CustomEvent("folder-drag-start", { detail: { folderId } })
      );
    },
    []
  );

  return {
    handleDragStart,
  };
};
