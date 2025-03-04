import React, { useState } from "react";
import { useStyles } from "@/app/hooks/useStyles";

interface TreeComponentProps {
  name: string;
  value?: string;
  handleSelect?: (
    id: string,
    modifiers: { shift?: boolean; meta?: boolean }
  ) => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  children?: React.ReactNode;
}

const Folder: React.FC<TreeComponentProps> = ({
  name,
  children,
  isSelectable = true,
  handleSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { getColor } = useStyles();

  const containerStyles = "flex flex-col";
  const itemStyles =
    "flex items-center gap-2 h-8 hover:bg-[#292929]/20 cursor-pointer";
  const paddingStyles = "px-4";

  return (
    <div className={containerStyles}>
      <div
        className={`${itemStyles} ${paddingStyles}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <img src="/media/frame.png" alt="" className="h-4 w-4" />
        <span className="text-[11px] text-[#cccccc]/70">{name}</span>
      </div>
      {isExpanded && <div className="ml-4">{children}</div>}
    </div>
  );
};

const File: React.FC<TreeComponentProps> = ({
  name,
  value,
  isSelectable = true,
  isSelected = false,
  handleSelect,
}) => {
  const { getColor } = useStyles();

  const handleClick = (e: React.MouseEvent) => {
    if (handleSelect && value) {
      handleSelect(value, {
        shift: e.shiftKey,
        meta: e.metaKey || e.ctrlKey,
      });
    }
  };

  return (
    <div
      className={`flex items-center gap-2 h-8 px-4 cursor-pointer ${
        isSelected ? "bg-[#292929]/50" : "hover:bg-[#292929]/20"
      }`}
      onClick={handleClick}
    >
      <img src="/media/frame.png" alt="" className="h-4 w-4" />
      <span className="text-[11px] text-[#cccccc]/70">{name}</span>
    </div>
  );
};

// This explicitly exports the FileTreeFolder and FileTreeFile names
// as well as the CoreFileTree object for compatibility
export const FileTreeFolder = Folder;
export const FileTreeFile = File;

export const CoreFileTree = {
  Folder,
  File,
};
