import { useDrag } from "../contexts/drag-context";

// components/DebugPanel.tsx
export function DebugPanel() {
  const { isDraggingFolder, isOverSidebar, draggedFolderId, pointerPosition } =
    useDrag();

  return (
    <div className="fixed top-2 right-2 bg-black/50 p-2 rounded text-xs text-white z-[9999] font-mono">
      <div>isDragging: {isDraggingFolder.toString()}</div>
      <div>overSidebar: {isOverSidebar.toString()}</div>
      <div>folderId: {draggedFolderId || "none"}</div>
      <div>
        pointer:{" "}
        {pointerPosition
          ? `${pointerPosition.x}, ${pointerPosition.y}`
          : "none"}
      </div>
    </div>
  );
}
