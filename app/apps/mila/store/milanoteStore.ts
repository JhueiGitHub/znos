// app/apps/milanote/store/milanoteStore.ts
import { create } from "zustand";
import {
  MilanoteBoard,
  MilanoteItem,
  BreadcrumbItem,
  Position,
  ItemType,
  ItemContent,
} from "../types";

interface MilanoteState {
  boards: Record<string, MilanoteBoard>;
  currentBoardId: string;
  breadcrumb: BreadcrumbItem[];
  nextZIndex: number;

  // Board operations
  addBoard: (board: Omit<MilanoteBoard, "id" | "items">) => string;
  updateBoard: (
    id: string,
    update: Partial<Omit<MilanoteBoard, "id" | "items">>
  ) => void;
  deleteBoard: (id: string) => void;

  // Item operations
  addItem: <T extends ItemContent>(
    boardId: string,
    type: ItemType,
    position: Position,
    content: T,
    size?: { width: number; height: number }
  ) => string;
  updateItem: (
    boardId: string,
    itemId: string,
    update: Partial<Omit<MilanoteItem, "id" | "type">>
  ) => void;
  updateItemPosition: (
    boardId: string,
    itemId: string,
    position: Position
  ) => void;
  bringToFront: (boardId: string, itemId: string) => void;
  deleteItem: (boardId: string, itemId: string) => void;

  // Navigation
  setCurrentBoard: (id: string) => void;
  navigateToBoard: (id: string) => void;
  navigateBack: () => void;
}

export const useMilanoteStore = create<MilanoteState>((set, get) => ({
  boards: {},
  currentBoardId: "root",
  breadcrumb: [{ id: "root", name: "Brand Kit" }],
  nextZIndex: 1,

  addBoard: (board) => {
    const id = `board_${Date.now()}`;
    set((state) => ({
      boards: {
        ...state.boards,
        [id]: { ...board, id, items: [] },
      },
    }));
    return id;
  },

  updateBoard: (id, update) => {
    set((state) => ({
      boards: {
        ...state.boards,
        [id]: { ...state.boards[id], ...update },
      },
    }));
  },

  deleteBoard: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.boards;
      return { boards: rest };
    });
  },

  addItem: (boardId, type, position, content, size) => {
    const id = `item_${Date.now()}`;
    const nextZ = get().nextZIndex;

    set((state) => ({
      nextZIndex: state.nextZIndex + 1,
      boards: {
        ...state.boards,
        [boardId]: {
          ...state.boards[boardId],
          items: [
            ...state.boards[boardId].items,
            { id, type, position, content, size, zIndex: nextZ },
          ],
        },
      },
    }));
    return id;
  },

  updateItem: (boardId, itemId, update) => {
    set((state) => ({
      boards: {
        ...state.boards,
        [boardId]: {
          ...state.boards[boardId],
          items: state.boards[boardId].items.map((item) =>
            item.id === itemId ? { ...item, ...update } : item
          ),
        },
      },
    }));
  },

  updateItemPosition: (boardId, itemId, position) => {
    set((state) => ({
      boards: {
        ...state.boards,
        [boardId]: {
          ...state.boards[boardId],
          items: state.boards[boardId].items.map((item) =>
            item.id === itemId ? { ...item, position } : item
          ),
        },
      },
    }));
  },

  bringToFront: (boardId, itemId) => {
    set((state) => {
      const nextZ = state.nextZIndex;
      return {
        nextZIndex: nextZ + 1,
        boards: {
          ...state.boards,
          [boardId]: {
            ...state.boards[boardId],
            items: state.boards[boardId].items.map((item) =>
              item.id === itemId ? { ...item, zIndex: nextZ } : item
            ),
          },
        },
      };
    });
  },

  deleteItem: (boardId, itemId) => {
    set((state) => ({
      boards: {
        ...state.boards,
        [boardId]: {
          ...state.boards[boardId],
          items: state.boards[boardId].items.filter(
            (item) => item.id !== itemId
          ),
        },
      },
    }));
  },

  setCurrentBoard: (id) => {
    set({ currentBoardId: id });
  },

  navigateToBoard: (id) => {
    const board = get().boards[id];
    if (!board) return;

    set((state) => ({
      currentBoardId: id,
      breadcrumb: [...state.breadcrumb, { id, name: board.name }],
    }));
  },

  navigateBack: () => {
    set((state) => {
      if (state.breadcrumb.length <= 1) return state;

      const newBreadcrumb = [...state.breadcrumb];
      newBreadcrumb.pop();
      const lastItem = newBreadcrumb[newBreadcrumb.length - 1];

      return {
        breadcrumb: newBreadcrumb,
        currentBoardId: lastItem.id,
      };
    });
  },
}));
