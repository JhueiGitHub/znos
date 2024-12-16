"use client";

import * as React from "react";

type DraggedItemType = "folder" | "file" | null;

interface DragContextType {
  isDragging: boolean;
  draggedItemType: DraggedItemType;
  draggedItemId: string | null;
  setDragState: (
    dragging: boolean,
    type: DraggedItemType,
    id: string | null
  ) => void;
}

const DragContext = React.createContext<DragContextType | null>(null);

export function DragProvider({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [draggedItemType, setDraggedItemType] =
    React.useState<DraggedItemType>(null);
  const [draggedItemId, setDraggedItemId] = React.useState<string | null>(null);

  const setDragState = React.useCallback(
    (dragging: boolean, type: DraggedItemType, id: string | null) => {
      setIsDragging(dragging);
      setDraggedItemType(type);
      setDraggedItemId(id);
    },
    []
  );

  return (
    <DragContext.Provider
      value={{
        isDragging,
        draggedItemType,
        draggedItemId,
        setDragState,
      }}
    >
      {children}
    </DragContext.Provider>
  );
}

export function useDragContext() {
  const context = React.useContext(DragContext);
  if (!context) {
    throw new Error("useDragContext must be used within DragProvider");
  }
  return context;
}
