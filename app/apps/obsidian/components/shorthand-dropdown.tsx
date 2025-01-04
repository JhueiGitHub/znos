// /root/app/apps/onyx/components/shorthand-dropdown.tsx
import React, { useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useShorthandStore } from "../stores/shorthand-store";

export const ShorthandDropdown: React.FC = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    isOpen,
    position,
    selectedOptionIndex,
    shorthandOptions,
    setIsOpen,
    cycleSelectedOption,
  } = useShorthandStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          cycleSelectedOption("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          cycleSelectedOption("down");
          break;
        case "Enter":
          e.preventDefault();
          shorthandOptions[selectedOptionIndex]?.action();
          setIsOpen(false);
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    selectedOptionIndex,
    shorthandOptions,
    cycleSelectedOption,
    setIsOpen,
  ]);

  if (!isOpen) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuContent
        ref={menuRef}
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
        }}
        className="w-64 bg-[#01020372] border border-[#29292981] backdrop-blur-md rounded-md"
      >
        {shorthandOptions.map((option, index) => (
          <DropdownMenuItem
            key={option.id}
            className={`flex items-center gap-2 px-[12px] py-1.5 text-sm rounded-md cursor-pointer select-none transition-colors
              ${
                index === selectedOptionIndex
                  ? "bg-[#4C4F6920] text-[#cccccc95]"
                  : "text-[#cccccc81]"
              } 
              hover:bg-[#4C4F6920] hover:text-[#cccccc95]`}
            onClick={() => {
              option.action();
              setIsOpen(false);
            }}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
