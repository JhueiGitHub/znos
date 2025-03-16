import React, { useState } from "react";
import { motion } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

interface DuolingoImageDropdownProps {
  onLessonSelect?: (lessonId: string) => void;
}

const DuolingoImageDropdown: React.FC<DuolingoImageDropdownProps> = ({
  onLessonSelect,
}) => {
  const { getColor } = useStyles();
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  // Define clickable areas on your image
  const clickableAreas = [
    { id: "lesson1", top: 120, left: 20, width: 160, height: 40 },
    { id: "lesson2", top: 170, left: 20, width: 160, height: 40 },
    { id: "lesson3", top: 220, left: 20, width: 160, height: 40 },
    { id: "lesson4", top: 270, left: 20, width: 160, height: 40 },
    { id: "dailyGoals", top: 380, left: 20, width: 160, height: 30 },
    { id: "schedule", top: 420, left: 20, width: 160, height: 30 },
  ];

  return (
    <DropdownMenuContent
      className="p-0 overflow-hidden"
      align="end"
      alignOffset={-3}
      sideOffset={4}
      style={{
        width: "270px",
        height: "615px",
        backgroundColor: "transparent",
        border: "none",
      }}
    >
      {/* Use your custom image as the background */}
      <div className="relative w-[270px] h-[615px]">
        <img
          src="/media/duo_dropdown.png"
          alt="Duolingo Menu"
          className="w-full h-full object-cover"
        />

        {/* Invisible clickable areas over your image */}
        {clickableAreas.map((area) => (
          <div
            key={area.id}
            className="absolute cursor-pointer"
            style={{
              top: `${area.top}px`,
              left: `${area.left}px`,
              width: `${area.width}px`,
              height: `${area.height}px`,
              backgroundColor:
                hoveredArea === area.id
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              borderRadius: "6px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={() => setHoveredArea(area.id)}
            onMouseLeave={() => setHoveredArea(null)}
            onClick={() => onLessonSelect?.(area.id)}
          />
        ))}
      </div>
    </DropdownMenuContent>
  );
};

export default DuolingoImageDropdown;
