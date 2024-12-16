// contexts/drag-context.tsx
import React, { createContext, useContext, useState } from "react";

interface DragContextType {
  isDraggingFolder: boolean;
  setIsDraggingFolder: (dragging: boolean) => void;
  isOverSidebar: boolean;
  setIsOverSidebar: (over: boolean) => void;
  draggedFolderId: string | null;
  setDraggedFolderId: (id: string | null) => void;
  pointerPosition: { x: number; y: number } | null;
  setPointerPosition: (position: { x: number; y: number } | null) => void;
}

const DragContext = createContext<DragContextType | null>(null);

export function DragProvider({ children }: { children: React.ReactNode }) {
  const [isDraggingFolder, setIsDraggingFolder] = useState(false);
  const [isOverSidebar, setIsOverSidebar] = useState(false);
  const [draggedFolderId, setDraggedFolderId] = useState<string | null>(null);
  const [pointerPosition, setPointerPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  return (
    <DragContext.Provider
      value={{
        isDraggingFolder,
        setIsDraggingFolder,
        isOverSidebar,
        setIsOverSidebar,
        draggedFolderId,
        setDraggedFolderId,
        pointerPosition,
        setPointerPosition,
      }}
    >
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error("useDrag must be used within a DragProvider");
  }
  return context;
}
