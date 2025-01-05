import { create } from "zustand";

// First, let's update shorthand-store.ts to include a handler function
interface TextStyle {
  isActive: boolean;
  font?: string;
  color?: string;
}

interface ShorthandOption {
  id: string;
  label: string;
  icon?: React.ComponentType;
  shortcode: string;
  insertText: string;
  action: () => void;
}

interface ShorthandState {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedOptionIndex: number;
  textStyle: TextStyle;
  filterText: string;
  shorthandOptions: ShorthandOption[];
  setIsOpen: (isOpen: boolean) => void;
  setPosition: (position: { x: number; y: number }) => void;
  setSelectedOptionIndex: (index: number) => void;
  setTextStyle: (style: TextStyle) => void;
  setFilterText: (text: string) => void;
  cycleSelectedOption: (direction: "up" | "down") => void;
  selectedOptionText: string | null;
  setSelectedOptionText: (text: string | null) => void;
}

export const useShorthandStore = create<ShorthandState>((set) => ({
  isOpen: false,
  position: { x: 0, y: 0 },
  selectedOptionIndex: 0,
  filterText: "",
  selectedOptionText: null,
  textStyle: {
    isActive: false,
  },
  shorthandOptions: [
    {
      id: "heading1",
      label: "Heading 1",
      shortcode: "h1",
      insertText: "# ",
      action: () => {
        // This will be handled in the editor component
      },
    },
  ],
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
  setPosition: (position: { x: number; y: number }) => set({ position }),
  setSelectedOptionIndex: (index: number) =>
    set({ selectedOptionIndex: index }),
  setTextStyle: (style: TextStyle) => set({ textStyle: style }),
  setFilterText: (text: string) => set({ filterText: text }),
  setSelectedOptionText: (text: string | null) =>
    set({ selectedOptionText: text }),
  cycleSelectedOption: (direction: "up" | "down") =>
    set((state) => {
      const totalOptions = state.shorthandOptions.length;
      const currentIndex = state.selectedOptionIndex;
      let newIndex: number;

      if (direction === "up") {
        newIndex = currentIndex <= 0 ? totalOptions - 1 : currentIndex - 1;
      } else {
        newIndex = currentIndex >= totalOptions - 1 ? 0 : currentIndex + 1;
      }

      return { selectedOptionIndex: newIndex };
    }),
}));
