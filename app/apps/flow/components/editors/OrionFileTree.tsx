import React, { useState } from "react";
import { useStyles } from "@os/hooks/useStyles";

// PRESERVED: Base type interface structure
interface TreeComponentProps {
  name: string;
  value?: string;
  handleSelect?: (id: string) => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  children?: React.ReactNode;
}

// EVOLVED: Simplified FileTreeFolder without chevrons
export const FileTreeFolder: React.FC<TreeComponentProps> = ({
  name,
  children,
  isSelectable = true,
  handleSelect,
}) => {
  // PRESERVED: Expansion state management
  const [isExpanded, setIsExpanded] = useState(true);
  const { getColor } = useStyles();

  // EVOLVED: Unified container styles
  const containerStyles = "flex flex-col";

  // EVOLVED: Unified item styles without chevrons
  const itemStyles =
    "flex items-center gap-2 h-8 hover:bg-[#292929]/20 cursor-pointer";

  // EVOLVED: Consolidated padding system
  const paddingStyles = "px-4";

  return (
    <div className={containerStyles}>
      <div
        className={`${itemStyles} ${paddingStyles}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* EVOLVED: Unified frame icon */}
        <img src="/media/frame.png" alt="" className="h-4 w-4" />
        <span className="text-[11px] text-[#cccccc]/70">{name}</span>
      </div>
      {/* EVOLVED: Simplified children container without border-l */}
      {isExpanded && <div className="ml-4">{children}</div>}
    </div>
  );
};

// EVOLVED: Simplified FileTreeFile with consistent styling
export const FileTreeFile: React.FC<TreeComponentProps> = ({
  name,
  value,
  isSelectable = true,
  isSelected = false,
  handleSelect,
}) => {
  const { getColor } = useStyles();

  // EVOLVED: Match folder padding and structure
  return (
    <div
      className={`flex items-center gap-2 h-8 px-4 cursor-pointer ${
        isSelected ? "bg-[#292929]/50" : "hover:bg-[#292929]/20"
      }`}
      onClick={() => handleSelect?.(value || name)}
    >
      {/* EVOLVED: Use same frame icon as folders */}
      <img src="/media/frame.png" alt="" className="h-4 w-4" />
      <span className="text-[11px] text-[#cccccc]/70">{name}</span>
    </div>
  );
};
