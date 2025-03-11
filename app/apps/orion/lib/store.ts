// app/apps/orion/lib/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Canvas, Node, StarfieldOptions } from "./types";
import { v4 as uuidv4 } from "uuid";
import { isEqual } from "lodash";

// Define a flag to track whether we're in the middle of updating
// This helps prevent infinite loops by breaking cycles
let isUpdatingViewport = false;

interface OrionState {
  // Canvas management
  activeCanvasId: string | null;
  canvases: Record<string, Canvas>;
  selectedNodeIds: string[];

  // Viewport state
  viewport: {
    zoom: number;
    pan: { x: number; y: number };
  };

  // Star background options
  starfieldOptions: StarfieldOptions;

  // UI state
  isSidebarOpen: boolean;
  isToolbarOpen: boolean;

  // Actions
  createCanvas: (name: string) => string;
  setActiveCanvas: (id: string) => void;
  createNode: (
    type: Node["type"],
    content: string,
    position: Node["position"]
  ) => string;
  updateNode: (id: string, updates: Partial<Node>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string, isMultiSelect?: boolean) => void;
  clearNodeSelection: () => void;
  setViewport: (newViewport: {
    zoom: number;
    pan: { x: number; y: number };
  }) => void;
  syncCanvasViewport: (canvasId: string) => void;
  updateStarfieldOptions: (options: Partial<StarfieldOptions>) => void;
  toggleSidebar: () => void;
  toggleToolbar: () => void;
}

export const useOrionStore = create<OrionState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeCanvasId: null,
      canvases: {},
      selectedNodeIds: [],
      viewport: {
        zoom: 1,
        pan: { x: 0, y: 0 },
      },
      starfieldOptions: {
        density: 50,
        size: [0.5, 3],
        speed: [0.05, 0.2],
        colors: ["#ffffff", "#ffffdd", "#aaaaff", "#ddddff", "#ccffff"],
        depth: 3,
        parallaxFactor: 0.5,
      },
      isSidebarOpen: true,
      isToolbarOpen: true,

      // Actions
      createCanvas: (name) => {
        const id = uuidv4();
        set((state) => ({
          canvases: {
            ...state.canvases,
            [id]: {
              id,
              name,
              nodes: [],
              viewportTransform: {
                zoom: 1,
                pan: { x: 0, y: 0 },
              },
            },
          },
          activeCanvasId: id,
        }));
        return id;
      },

      setActiveCanvas: (id) => {
        // First set the active canvas
        set({ activeCanvasId: id });

        // Then synchronize the viewport from the canvas to the global state
        // But delay it to prevent it from being part of the same render cycle
        setTimeout(() => {
          const store = get();
          if (store.activeCanvasId && store.canvases[store.activeCanvasId]) {
            const canvasViewport =
              store.canvases[store.activeCanvasId].viewportTransform;
            if (!isEqual(store.viewport, canvasViewport)) {
              store.setViewport(canvasViewport);
            }
          }
        }, 0);
      },

      createNode: (type, content, position) => {
        const { activeCanvasId, canvases } = get();
        if (!activeCanvasId || !canvases[activeCanvasId]) return "";

        const nodeId = uuidv4();
        const newNode: Node = {
          id: nodeId,
          type,
          content,
          position,
          size: { width: 200, height: 150 },
          zIndex: 1,
        };

        set((state) => ({
          canvases: {
            ...state.canvases,
            [activeCanvasId]: {
              ...state.canvases[activeCanvasId],
              nodes: [...state.canvases[activeCanvasId].nodes, newNode],
            },
          },
          selectedNodeIds: [nodeId],
        }));

        return nodeId;
      },

      updateNode: (id, updates) => {
        const { activeCanvasId, canvases } = get();
        if (!activeCanvasId || !canvases[activeCanvasId]) return;

        set((state) => ({
          canvases: {
            ...state.canvases,
            [activeCanvasId]: {
              ...state.canvases[activeCanvasId],
              nodes: state.canvases[activeCanvasId].nodes.map((node) =>
                node.id === id ? { ...node, ...updates } : node
              ),
            },
          },
        }));
      },

      deleteNode: (id) => {
        const { activeCanvasId, canvases, selectedNodeIds } = get();
        if (!activeCanvasId || !canvases[activeCanvasId]) return;

        set((state) => ({
          canvases: {
            ...state.canvases,
            [activeCanvasId]: {
              ...state.canvases[activeCanvasId],
              nodes: state.canvases[activeCanvasId].nodes.filter(
                (node) => node.id !== id
              ),
            },
          },
          selectedNodeIds: selectedNodeIds.filter((nodeId) => nodeId !== id),
        }));
      },

      selectNode: (id, isMultiSelect = false) => {
        set((state) => ({
          selectedNodeIds: isMultiSelect
            ? [...state.selectedNodeIds.filter((nodeId) => nodeId !== id), id]
            : [id],
        }));
      },

      clearNodeSelection: () => {
        set({ selectedNodeIds: [] });
      },

      // COMPLETELY REDESIGNED VIEWPORT MANAGEMENT
      // This is the key to fixing our infinite loop
      setViewport: (newViewport) => {
        // Prevent recursive calls
        if (isUpdatingViewport) return;

        try {
          isUpdatingViewport = true;

          // Check if viewport actually changed to prevent unnecessary updates
          const currentViewport = get().viewport;
          if (
            currentViewport.zoom === newViewport.zoom &&
            currentViewport.pan.x === newViewport.pan.x &&
            currentViewport.pan.y === newViewport.pan.y
          ) {
            return; // Skip if nothing changed
          }

          // Simply update the global viewport state
          // We don't update the canvas viewportTransform here anymore
          set({ viewport: newViewport });

          // Synchronize to canvas in a separate, delayed operation
          setTimeout(() => {
            const { activeCanvasId, canvases } = get();
            if (activeCanvasId && canvases[activeCanvasId]) {
              set((state) => ({
                canvases: {
                  ...state.canvases,
                  [activeCanvasId]: {
                    ...state.canvases[activeCanvasId],
                    viewportTransform: newViewport,
                  },
                },
              }));
            }
          }, 0);
        } finally {
          isUpdatingViewport = false;
        }
      },

      // New function to sync viewport from active canvas to global state
      syncCanvasViewport: (canvasId) => {
        const { canvases } = get();
        const canvas = canvases[canvasId];

        if (canvas) {
          set({ viewport: canvas.viewportTransform });
        }
      },

      updateStarfieldOptions: (options) => {
        set((state) => ({
          starfieldOptions: {
            ...state.starfieldOptions,
            ...options,
          },
        }));
      },

      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      toggleToolbar: () => {
        set((state) => ({ isToolbarOpen: !state.isToolbarOpen }));
      },
    }),
    {
      name: "orion-storage",
      partialize: (state) => ({
        canvases: state.canvases,
        activeCanvasId: state.activeCanvasId,
        starfieldOptions: state.starfieldOptions,
      }),
    }
  )
);
