// app/apps/orion/lib/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Canvas, Node, StarfieldOptions } from "./types";
import { v4 as uuidv4 } from "uuid";

interface OrionState {
  // Canvas management
  activeCanvasId: string | null;
  canvases: Record<string, Canvas>;
  selectedNodeIds: string[];

  // Viewport state
  zoom: number;
  pan: { x: number; y: number };

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
  updateViewport: (zoom: number, pan: { x: number; y: number }) => void;
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
      zoom: 1,
      pan: { x: 0, y: 0 },
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
        set({ activeCanvasId: id });
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

      updateViewport: (zoom, pan) => {
        const { activeCanvasId } = get();

        // Update global viewport state
        set({ zoom, pan });

        // Update active canvas viewport state
        if (activeCanvasId) {
          set((state) => ({
            canvases: {
              ...state.canvases,
              [activeCanvasId]: {
                ...state.canvases[activeCanvasId],
                viewportTransform: { zoom, pan },
              },
            },
          }));
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
