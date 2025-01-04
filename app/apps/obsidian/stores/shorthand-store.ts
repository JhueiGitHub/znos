// /root/app/apps/onyx/stores/shorthand-store.ts
import { create } from "zustand";

interface TextStyle {
  isActive: boolean;
  font?: string;
  color?: string;
}

interface ShorthandOption {
  id: string;
  label: string;
  icon?: React.ComponentType;
  action: () => void;
}

interface ShorthandState {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedOptionIndex: number;
  textStyle: TextStyle;
  shorthandOptions: ShorthandOption[];
  setIsOpen: (isOpen: boolean) => void;
  setPosition: (position: { x: number; y: number }) => void;
  setSelectedOptionIndex: (index: number) => void;
  setTextStyle: (style: TextStyle) => void;
  cycleSelectedOption: (direction: "up" | "down") => void;
}

export const useShorthandStore = create<ShorthandState>((set) => ({
  isOpen: false,
  position: { x: 0, y: 0 },
  selectedOptionIndex: 0,
  textStyle: {
    isActive: false,
  },
  shorthandOptions: [
    {
      id: "heading1",
      label: "Heading 1",
      action: () => {
        // Implementation
      },
    },
    {
      id: "exemplarPro",
      label: "Exemplar Pro",
      action: () => {
        useShorthandStore.getState().setTextStyle({
          isActive: true,
          font: "Exemplar Pro",
          color: useShorthandStore.getState().textStyle.color,
        });
      },
    },
    {
      id: "separator",
      label: "Separator",
      action: () => {
        // Implementation
      },
    },
  ],
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
  setPosition: (position: { x: number; y: number }) => set({ position }),
  setSelectedOptionIndex: (index: number) =>
    set({ selectedOptionIndex: index }),
  setTextStyle: (style: TextStyle) => set({ textStyle: style }),
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
