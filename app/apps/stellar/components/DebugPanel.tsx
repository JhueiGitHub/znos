// components/DebugPanel.tsx
import { useDrag } from "../contexts/drag-context";
import { motion } from "framer-motion";

export function DebugPanel() {
  const {
    isDraggingFolder,
    isOverSidebar,
    draggedFolderId,
    pointerPosition,
    dragStartPosition,
  } = useDrag();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-2 right-2 z-[9999] font-mono"
    >
      <div
        className="p-3 rounded-[19px] space-y-1.5 backdrop-blur-sm"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.72)", // night-med
          border: "0.6px solid rgba(255, 255, 255, 0.09)",
        }}
      >
        <div className="space-y-1.5">
          {/* Drag Initiation State */}
          <div className="flex gap-2">
            <span className="text-[#4C4F69]/54">dragStart:</span>
            <span className="text-[#CCCCCC]/81">
              {dragStartPosition
                ? `${Math.round(dragStartPosition.x)}, ${Math.round(dragStartPosition.y)}`
                : "none"}
            </span>
          </div>

          {/* Active Drag State */}
          <div className="flex gap-2">
            <span className="text-[#4C4F69]/54">dragging:</span>
            <span className="text-[#CCCCCC]/81">
              {isDraggingFolder.toString()}
            </span>
          </div>

          {/* Current Position */}
          <div className="flex gap-2">
            <span className="text-[#4C4F69]/54">position:</span>
            <span className="text-[#CCCCCC]/81">
              {pointerPosition
                ? `${Math.round(pointerPosition.x)}, ${Math.round(pointerPosition.y)}`
                : "none"}
            </span>
          </div>

          {/* Sidebar Interaction State */}
          <div className="flex gap-2">
            <span className="text-[#4C4F69]/54">overSidebar:</span>
            <span
              className="text-[#CCCCCC]/81"
              style={{
                color: isOverSidebar ? "rgba(123, 108, 189, 1)" : undefined, // Lilac accent for active state
              }}
            >
              {isOverSidebar.toString()}
            </span>
          </div>

          {/* Folder ID being dragged */}
          <div className="flex gap-2">
            <span className="text-[#4C4F69]/54">folderId:</span>
            <span className="text-[#CCCCCC]/81 truncate max-w-[120px]">
              {draggedFolderId || "none"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
