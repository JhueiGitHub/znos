// app/apps/mila/store/milanoteStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  MilanoteBoard,
  MilanoteItem,
  BreadcrumbItem,
  Position,
  ItemType,
  ItemContent,
  Dimensions,
} from "../types";
import { SAMPLE_BOARDS } from "../data/sampleData";

// Generate a unique user ID or get the existing one
const getUserId = () => {
  if (typeof window === "undefined") return "default-user";

  let userId = localStorage.getItem("milanote_user_id");
  if (!userId) {
    // Create a pseudo-random ID if none exists
    userId = "user_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("milanote_user_id", userId);
  }
  return userId;
};

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
    size?: Dimensions // Changed to Dimensions
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

  // State management
  resetState: () => void;
  importState: (state: Partial<MilanoteState>) => void;

  // Dimensions handling
  updateItemDimensions: (
    boardId: string,
    itemId: string,
    dimensions: Dimensions
  ) => void;
}

// Get a unique store name for this user
const getStoreName = () => `milanote_store_${getUserId()}`;

export const useMilanoteStore = create<MilanoteState>()(
  persist(
    (set, get) => ({
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
        const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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

        // Save the initial position to localStorage for additional resilience
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `milanote_note_pos_${id}`,
            JSON.stringify(position)
          );
        }

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

        // Save individual position to localStorage for additional resilience
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `milanote_note_pos_${itemId}`,
            JSON.stringify(position)
          );
        }
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

        // Clean up localStorage entries
        if (typeof window !== "undefined") {
          localStorage.removeItem(`milanote_note_pos_${itemId}`);
          localStorage.removeItem(`milanote_note_dim_${itemId}`);
        }
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

      // State management functions
      resetState: () => {
        set({
          boards: SAMPLE_BOARDS,
          currentBoardId: "root",
          breadcrumb: [{ id: "root", name: "Brand Kit" }],
          nextZIndex: 1,
        });
      },

      importState: (newState) => {
        set((state) => ({
          ...state,
          ...newState,
          // Preserve sample boards if no boards in import
          boards:
            newState.boards && Object.keys(newState.boards).length > 0
              ? newState.boards
              : SAMPLE_BOARDS,
        }));
      },

      // Dimensions handling
      updateItemDimensions: (boardId, itemId, dimensions) => {
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: {
              ...state.boards[boardId],
              items: state.boards[boardId].items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      size: dimensions,
                    }
                  : item
              ),
            },
          },
        }));

        // Also save to localStorage for resilience
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `milanote_note_dim_${itemId}`,
            JSON.stringify(dimensions)
          );
        }
      },
    }),
    {
      name: getStoreName(), // Use the user-specific store name
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        boards: state.boards,
        currentBoardId: state.currentBoardId,
        breadcrumb: state.breadcrumb,
        nextZIndex: state.nextZIndex,
      }),
      onRehydrateStorage: (state) => {
        return (rehydratedState, error) => {
          if (error) {
            console.error("Error rehydrating Milanote state:", error);
          } else if (
            !rehydratedState?.boards ||
            Object.keys(rehydratedState.boards).length === 0
          ) {
            // If there are no boards (first use), initialize with sample boards
            if (state) {
              state.importState({ boards: SAMPLE_BOARDS });
            }
          }
        };
      },
    }
  )
);

export default useMilanoteStore;
