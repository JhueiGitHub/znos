// contexts/drag-context.tsx
import React, { createContext, useContext, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface DragContextType {
  isDraggingFolder: boolean;
  setIsDraggingFolder: (dragging: boolean) => void;
  isOverSidebar: boolean;
  setIsOverSidebar: (over: boolean) => void;
  draggedFolderId: string | null;
  setDraggedFolderId: (id: string | null) => void;
  pointerPosition: Position | null;
  setPointerPosition: (position: Position | null) => void;
  dragStartPosition: Position | null;
  setDragStartPosition: (position: Position | null) => void;
}

const DragContext = createContext<DragContextType | null>(null);

export function DragProvider({ children }: { children: React.ReactNode }) {
  const [isDraggingFolder, setIsDraggingFolder] = useState(false);
  const [isOverSidebar, setIsOverSidebar] = useState(false);
  const [draggedFolderId, setDraggedFolderId] = useState<string | null>(null);
  const [pointerPosition, setPointerPosition] = useState<Position | null>(null);
  const [dragStartPosition, setDragStartPosition] = useState<Position | null>(
    null
  );

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
        dragStartPosition,
        setDragStartPosition,
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
