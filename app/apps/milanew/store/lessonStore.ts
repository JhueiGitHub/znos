// MilaneW Lesson Store
import { create } from "zustand";
import {
  Lesson,
  LessonCanvas,
  LessonItem,
  Position,
  ItemContent,
  ItemType,
  TextStyle,
  DrawingStyle,
} from "../types";

// Default text style with handwriting font
const defaultTextStyle: TextStyle = {
  fontFamily: "'Caveat', cursive", // Handwriting font
  fontSize: 18,
  fontWeight: "normal",
  textAlign: "left",
  color: "#ffffff",
  padding: 8,
};

// Default handwriting text style
const defaultHandwritingStyle: TextStyle = {
  fontFamily: "'Caveat', cursive",
  fontSize: 24,
  fontWeight: "normal",
  textAlign: "left",
  color: "#ffffff",
  padding: 4,
  isHandwriting: true,
};

// Default drawing style
const defaultDrawingStyle: DrawingStyle = {
  strokeColor: "#ffffff",
  strokeWidth: 2,
  opacity: 1,
};

// Default connector style with arrow
const defaultConnectorStyle: DrawingStyle = {
  strokeColor: "#ffffff",
  strokeWidth: 2,
  opacity: 1,
  arrowEnd: true,
};

// Sample lesson data
const SAMPLE_LESSON: Lesson = {
  id: "lesson1",
  title: "Introduction to Machine Learning",
  description:
    "A beginner-friendly exploration of ML concepts and applications",
  created: new Date(),
  modified: new Date(),
  canvases: [
    {
      id: "canvas1",
      name: "Overview",
      items: [
        {
          id: "title1",
          type: "text",
          position: { x: 400, y: 50 },
          content: {
            text: "Machine Learning Fundamentals",
            style: {
              ...defaultTextStyle,
              fontSize: 36,
              fontWeight: "bold",
              textAlign: "center",
            },
          },
          zIndex: 1,
        },
        {
          id: "text1",
          type: "text",
          position: { x: 150, y: 150 },
          size: { width: 300, height: 200 },
          content: {
            text: "Machine Learning is a subset of artificial intelligence focused on building systems that learn from data. Instead of explicit programming, these systems identify patterns to make decisions with minimal human intervention.",
            style: defaultTextStyle,
          },
          zIndex: 2,
        },
        {
          id: "handwriting1",
          type: "handwriting",
          position: { x: 500, y: 200 },
          content: {
            paths: [], // Would contain SVG path data
            style: defaultDrawingStyle,
            text: "Key concepts to explore",
          },
          zIndex: 3,
        },
        {
          id: "drawing1",
          type: "drawing",
          position: { x: 700, y: 300 },
          content: {
            paths: [], // Would contain SVG path data
            style: defaultDrawingStyle,
          },
          zIndex: 4,
        },
        {
          id: "connector1",
          type: "connector",
          position: { x: 0, y: 0 }, // Position is determined by points
          content: {
            points: [
              { x: 300, y: 250 },
              { x: 500, y: 250 },
            ],
            style: defaultConnectorStyle,
            label: "Leads to",
            labelStyle: defaultTextStyle,
          },
          zIndex: 5,
        },
      ],
      background: {
        color: "#1a1a2e",
        grid: true,
      },
    },
    {
      id: "canvas2",
      name: "Types of ML",
      items: [
        {
          id: "title2",
          type: "text",
          position: { x: 400, y: 50 },
          content: {
            text: "Types of Machine Learning",
            style: {
              ...defaultTextStyle,
              fontSize: 36,
              fontWeight: "bold",
              textAlign: "center",
            },
          },
          zIndex: 1,
        },
      ],
      background: {
        color: "#1a1a2e",
        grid: true,
      },
    },
  ],
  tags: ["machine learning", "ai", "data science"],
};

interface LessonState {
  lessons: Record<string, Lesson>;
  activeLesson: string | null;
  activeCanvas: string | null;
  activeTab: string | null;
  selectedItems: string[];
  nextZIndex: number;

  // Store initialization
  initialize: () => void;

  // Lesson operations
  createLesson: (title: string, description?: string) => string;
  updateLesson: (
    id: string,
    updates: Partial<Omit<Lesson, "id" | "canvases">>
  ) => void;
  deleteLesson: (id: string) => void;
  setActiveLesson: (id: string | null) => void;

  // Canvas operations
  createCanvas: (lessonId: string, name: string) => string;
  updateCanvas: (
    lessonId: string,
    canvasId: string,
    updates: Partial<Omit<LessonCanvas, "id" | "items">>
  ) => void;
  deleteCanvas: (lessonId: string, canvasId: string) => void;
  setActiveCanvas: (id: string | null) => void;
  setActiveTab: (id: string | null) => void;

  // Item operations
  addItem: <T extends ItemContent>(
    lessonId: string,
    canvasId: string,
    type: ItemType,
    position: Position,
    content: T,
    size?: { width: number; height: number }
  ) => string;
  updateItem: (
    lessonId: string,
    canvasId: string,
    itemId: string,
    updates: Partial<Omit<LessonItem, "id" | "type">>
  ) => void;
  updateItemPosition: (
    lessonId: string,
    canvasId: string,
    itemId: string,
    position: Position
  ) => void;
  deleteItem: (lessonId: string, canvasId: string, itemId: string) => void;

  // Selection operations
  selectItem: (itemId: string) => void;
  deselectItem: (itemId: string) => void;
  clearSelection: () => void;
  selectMultipleItems: (itemIds: string[]) => void;

  // Z-index operations
  bringToFront: (lessonId: string, canvasId: string, itemId: string) => void;
  sendToBack: (lessonId: string, canvasId: string, itemId: string) => void;
  bringForward: (lessonId: string, canvasId: string, itemId: string) => void;
  sendBackward: (lessonId: string, canvasId: string, itemId: string) => void;
}

export const useLessonStore = create<LessonState>((set, get) => ({
  lessons: {},
  activeLesson: null,
  activeCanvas: null,
  activeTab: null,
  selectedItems: [],
  nextZIndex: 1,

  // Initialize store with sample data
  initialize: () => {
    // Check if there's already data to avoid reinitializing
    const { lessons } = get();
    if (Object.keys(lessons).length === 0) {
      set({
        lessons: { [SAMPLE_LESSON.id]: SAMPLE_LESSON },
        activeLesson: SAMPLE_LESSON.id,
        activeCanvas: SAMPLE_LESSON.canvases[0].id,
        activeTab: SAMPLE_LESSON.canvases[0].id,
        nextZIndex: 100, // Start with a high zIndex value
      });
    }
  },

  // Lesson operations
  createLesson: (title, description) => {
    const id = `lesson_${Date.now()}`;
    const canvasId = `canvas_${Date.now()}`;

    const newLesson: Lesson = {
      id,
      title,
      description,
      created: new Date(),
      modified: new Date(),
      canvases: [
        {
          id: canvasId,
          name: "Page 1",
          items: [],
          background: {
            color: "#1a1a2e",
            grid: true,
          },
        },
      ],
    };

    set((state) => ({
      lessons: { ...state.lessons, [id]: newLesson },
      activeLesson: id,
      activeCanvas: canvasId,
      activeTab: canvasId,
    }));

    return id;
  },

  updateLesson: (id, updates) => {
    set((state) => ({
      lessons: {
        ...state.lessons,
        [id]: {
          ...state.lessons[id],
          ...updates,
          modified: new Date(),
        },
      },
    }));
  },

  deleteLesson: (id) => {
    set((state) => {
      const { [id]: _, ...remainingLessons } = state.lessons;

      // If the deleted lesson was active, set the first available lesson as active,
      // or null if no lessons remain
      let newActiveLesson = state.activeLesson;
      let newActiveCanvas = state.activeCanvas;
      let newActiveTab = state.activeTab;

      if (state.activeLesson === id) {
        const lessonIds = Object.keys(remainingLessons);
        newActiveLesson = lessonIds.length > 0 ? lessonIds[0] : null;

        if (newActiveLesson) {
          const firstCanvas = remainingLessons[newActiveLesson].canvases[0];
          newActiveCanvas = firstCanvas?.id || null;
          newActiveTab = firstCanvas?.id || null;
        } else {
          newActiveCanvas = null;
          newActiveTab = null;
        }
      }

      return {
        lessons: remainingLessons,
        activeLesson: newActiveLesson,
        activeCanvas: newActiveCanvas,
        activeTab: newActiveTab,
      };
    });
  },

  setActiveLesson: (id) => {
    set((state) => {
      if (!id || !state.lessons[id]) return state;

      const firstCanvas = state.lessons[id].canvases[0];
      return {
        activeLesson: id,
        activeCanvas: firstCanvas?.id || null,
        activeTab: firstCanvas?.id || null,
        selectedItems: [],
      };
    });
  },

  // Canvas operations
  createCanvas: (lessonId, name) => {
    const canvasId = `canvas_${Date.now()}`;

    set((state) => {
      const lesson = state.lessons[lessonId];
      if (!lesson) return state;

      const updatedLesson = {
        ...lesson,
        modified: new Date(),
        canvases: [
          ...lesson.canvases,
          {
            id: canvasId,
            name,
            items: [],
            background: {
              color: "#1a1a2e",
              grid: true,
            },
          },
        ],
      };

      return {
        lessons: { ...state.lessons, [lessonId]: updatedLesson },
        activeCanvas: canvasId,
        activeTab: canvasId,
      };
    });

    return canvasId;
  },

  updateCanvas: (lessonId, canvasId, updates) => {
    set((state) => {
      const lesson = state.lessons[lessonId];
      if (!lesson) return state;

      const updatedCanvases = lesson.canvases.map((canvas) =>
        canvas.id === canvasId ? { ...canvas, ...updates } : canvas
      );

      return {
        lessons: {
          ...state.lessons,
          [lessonId]: {
            ...lesson,
            modified: new Date(),
            canvases: updatedCanvases,
          },
        },
      };
    });
  },

  deleteCanvas: (lessonId, canvasId) => {
    set((state) => {
      const lesson = state.lessons[lessonId];
      if (!lesson) return state;

      // Don't allow deleting the last canvas
      if (lesson.canvases.length <= 1) return state;

      const updatedCanvases = lesson.canvases.filter(
        (canvas) => canvas.id !== canvasId
      );

      // If the deleted canvas was active, set the first canvas as active
      let newActiveCanvas = state.activeCanvas;
      let newActiveTab = state.activeTab;

      if (state.activeCanvas === canvasId) {
        newActiveCanvas = updatedCanvases[0].id;
      }

      if (state.activeTab === canvasId) {
        newActiveTab = updatedCanvases[0].id;
      }

      return {
        lessons: {
          ...state.lessons,
          [lessonId]: {
            ...lesson,
            modified: new Date(),
            canvases: updatedCanvases,
          },
        },
        activeCanvas: newActiveCanvas,
        activeTab: newActiveTab,
        selectedItems: [],
      };
    });
  },

  setActiveCanvas: (id) => {
    set((state) => ({
      activeCanvas: id,
      selectedItems: [],
    }));
  },

  setActiveTab: (id) => {
    set((state) => ({
      activeTab: id,
      activeCanvas: id,
      selectedItems: [],
    }));
  },

  // Item operations
  addItem: (lessonId, canvasId, type, position, content, size) => {
    const itemId = `item_${Date.now()}`;
    const nextZ = get().nextZIndex;

    set((state) => {
      const lesson = state.lessons[lessonId];
      if (!lesson) return state;

      const canvasIndex = lesson.canvases.findIndex(
        (canvas) => canvas.id === canvasId
      );

      if (canvasIndex === -1) return state;

      const updatedCanvases = [...lesson.canvases];
      updatedCanvases[canvasIndex] = {
        ...updatedCanvases[canvasIndex],
        items: [
          ...updatedCanvases[canvasIndex].items,
          {
            id: itemId,
            type,
            position,
            size,
            content,
            zIndex: nextZ,
          },
        ],
      };

      return {
        lessons: {
          ...state.lessons,
          [lessonId]: {
            ...lesson,
            modified: new Date(),
            canvases: updatedCanvases,
          },
        },
        nextZIndex: nextZ + 1,
        selectedItems: [itemId],
      };
    });

    return itemId;
  },

  updateItem: (lessonId, canvasId, itemId, updates) => {
    set((state) => {
      const lesson = state.lessons[lessonId];
      if (!lesson) return state;

      const canvasIndex = lesson.canvases.findIndex(
        (canvas) => canvas.id === canvasId
      );

      if (canvasIndex === -1) return state;

      const updatedCanvases = [...lesson.canvases];
      updatedCanvases[canvasIndex] = {
        ...updatedCanvases[canvasIndex],
        items: updatedCanvases[canvasIndex].items.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      };

      return {
        lessons: {
          ...state.lessons,
          [lessonId]: {
            ...lesson,
            modified: new Date(),
            canvases: updatedCanvases,
          },
        },
      };
    });
  },

  updateItemPosition: (lessonId, canvasId, itemId, position) => {
    set((state) => {
      const lesson = state.lessons[lessonId];
      if (!lesson) return state;

      const canvasIndex = lesson.canvases.findIndex(
        (canvas) => canvas.id === canvasId
      );

      if (canvasIndex === -1) return state;

      const updatedCanvases = [...lesson.canvases];
      updatedCanvases[canvasIndex] = {
        ...updatedCanvases[canvasIndex],
        items: updatedCanvases[canvasIndex].items.map((item) =>
          item.id === itemId ? { ...item, position } : item
        ),
      };

      return {
        lessons: {
          ...state.lessons,
          [lessonId]: {
            ...lesson,
            modified: new Date(),
            canvases: updatedCanvases,
          },
        },
      };
    });
  },

  deleteItem: (lessonId, canvasId, itemId) => {
    set((state) => {
      const lesson = state.lessons[lessonId];
      if (!lesson) return state;

      const canvasIndex = lesson.canvases.findIndex(
        (canvas) => canvas.id === canvasId
      );

      if (canvasIndex === -1) return state;

      const updatedCanvases = [...lesson.canvases];
      updatedCanvases[canvasIndex] = {
        ...updatedCanvases[canvasIndex],
        items: updatedCanvases[canvasIndex].items.filter(
          (item) => item.id !== itemId
        ),
      };

      return {
        lessons: {
          ...state.lessons,
          [lessonId]: {
            ...lesson,
            modified: new Date(),
            canvases: updatedCanvases,
          },
        },
        selectedItems: state.selectedItems.filter((id) => id !== itemId),
      };
    });
  },

  // Selection operations
  selectItem: (itemId) => {
    set((state) => ({
      selectedItems: [itemId],
    }));
  },

  deselectItem: (itemId) => {
    set((state) => ({
      selectedItems: state.selectedItems.filter((id) => id !== itemId),
    }));
  },

  clearSelection: () => {
    set({ selectedItems: [] });
  },

  selectMultipleItems: (itemIds) => {
    set({ selectedItems: itemIds });
  },

  // Z-index operations
  bringToFront: (lessonId, canvasId, itemId) => {
    const nextZ = get().nextZIndex;

    set((state) => {
      const lesson = state.lessons[lessonId];
      if (!lesson) return state;

      const canvasIndex = lesson.canvases.findIndex(
        (canvas) => canvas.id === canvasId
      );

      if (canvasIndex === -1) return state;

      const updatedCanvases = [...lesson.canvases];
      updatedCanvases[canvasIndex] = {
        ...updatedCanvases[canvasIndex],
        items: updatedCanvases[canvasIndex].items.map((item) =>
          item.id === itemId ? { ...item, zIndex: nextZ } : item
        ),
      };

      return {
        lessons: {
          ...state.lessons,
          [lessonId]: {
            ...lesson,
            modified: new Date(),
            canvases: updatedCanvases,
          },
        },
        nextZIndex: nextZ + 1,
      };
    });
  },

  sendToBack: (lessonId, canvasId, itemId) => {
    set((state) => {
      const lesson = state.lessons[lessonId];
      if (!lesson) return state;

      const canvasIndex = lesson.canvases.findIndex(
        (canvas) => canvas.id === canvasId
      );

      if (canvasIndex === -1) return state;

      // Find the lowest z-index
      const lowestZ =
        Math.min(
          ...updatedCanvases[canvasIndex].items.map((item) => item.zIndex)
        ) - 1;

      const updatedCanvases = [...lesson.canvases];
      updatedCanvases[canvasIndex] = {
        ...updatedCanvases[canvasIndex],
        items: updatedCanvases[canvasIndex].items.map((item) =>
          item.id === itemId ? { ...item, zIndex: lowestZ } : item
        ),
      };

      return {
        lessons: {
          ...state.lessons,
          [lessonId]: {
            ...lesson,
            modified: new Date(),
            canvases: updatedCanvases,
          },
        },
      };
    });
  },

  bringForward: (lessonId, canvasId, itemId) => {
    set((state) => {
      const lesson = state.lessons[lessonId];
      if (!lesson) return state;

      const canvasIndex = lesson.canvases.findIndex(
        (canvas) => canvas.id === canvasId
      );

      if (canvasIndex === -1) return state;

      const canvas = lesson.canvases[canvasIndex];
      const item = canvas.items.find((i) => i.id === itemId);

      if (!item) return state;

      // Find the next higher z-index
      const items = canvas.items
        .filter((i) => i.zIndex > item.zIndex)
        .sort((a, b) => a.zIndex - b.zIndex);

      if (items.length === 0) return state; // Already at the front

      const newZIndex = items[0].zIndex;
      const updatedCanvases = [...lesson.canvases];

      updatedCanvases[canvasIndex] = {
        ...updatedCanvases[canvasIndex],
        items: updatedCanvases[canvasIndex].items.map((i) => {
          if (i.id === itemId) return { ...i, zIndex: newZIndex };
          if (i.zIndex === newZIndex) return { ...i, zIndex: item.zIndex };
          return i;
        }),
      };

      return {
        lessons: {
          ...state.lessons,
          [lessonId]: {
            ...lesson,
            modified: new Date(),
            canvases: updatedCanvases,
          },
        },
      };
    });
  },

  sendBackward: (lessonId, canvasId, itemId) => {
    set((state) => {
      const lesson = state.lessons[lessonId];
      if (!lesson) return state;

      const canvasIndex = lesson.canvases.findIndex(
        (canvas) => canvas.id === canvasId
      );

      if (canvasIndex === -1) return state;

      const canvas = lesson.canvases[canvasIndex];
      const item = canvas.items.find((i) => i.id === itemId);

      if (!item) return state;

      // Find the next lower z-index
      const items = canvas.items
        .filter((i) => i.zIndex < item.zIndex)
        .sort((a, b) => b.zIndex - a.zIndex);

      if (items.length === 0) return state; // Already at the back

      const newZIndex = items[0].zIndex;
      const updatedCanvases = [...lesson.canvases];

      updatedCanvases[canvasIndex] = {
        ...updatedCanvases[canvasIndex],
        items: updatedCanvases[canvasIndex].items.map((i) => {
          if (i.id === itemId) return { ...i, zIndex: newZIndex };
          if (i.zIndex === newZIndex) return { ...i, zIndex: item.zIndex };
          return i;
        }),
      };

      return {
        lessons: {
          ...state.lessons,
          [lessonId]: {
            ...lesson,
            modified: new Date(),
            canvases: updatedCanvases,
          },
        },
      };
    });
  },
}));
