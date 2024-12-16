// /root/app/apps/stellar/store/use-drag-store.ts
import { create } from "zustand";

interface DragState {
  isDragging: boolean;
  draggedItemId: string | null;
  draggedItemType: "folder" | "file" | null;
  dropTargetId: string | null;
  setDragging: (dragging: boolean) => void;
  setDraggedItem: (id: string | null, type: "folder" | "file" | null) => void;
  setDropTarget: (id: string | null) => void;
  reset: () => void;
}

export const useDragStore = create<DragState>((set) => ({
  isDragging: false,
  draggedItemId: null,
  draggedItemType: null,
  dropTargetId: null,

  setDragging: (dragging) => set({ isDragging: dragging }),
  setDraggedItem: (id, type) =>
    set({ draggedItemId: id, draggedItemType: type }),
  setDropTarget: (id) => set({ dropTargetId: id }),
  reset: () =>
    set({
      isDragging: false,
      draggedItemId: null,
      draggedItemType: null,
      dropTargetId: null,
    }),
}));
