import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  File as FileIcon,
  Folder as FolderIcon,
} from "lucide-react";
import { useStyles } from "@os/hooks/useStyles";
import { OrionFlowComponent } from "./orion-flow-types";

interface TreeComponentProps {
  name: string;
  value?: string;
  handleSelect?: (id: string) => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  children?: React.ReactNode;
}

export const FileTreeFolder: React.FC<TreeComponentProps> = ({
  name,
  children,
  isSelectable = true,
  handleSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { getColor } = useStyles();

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center gap-2 h-8 px-2 rounded-md hover:bg-[#292929]/20 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-[#cccccc]/70" />
        ) : (
          <ChevronRight className="h-4 w-4 text-[#cccccc]/70" />
        )}
        <FolderIcon className="h-4 w-4 text-[#cccccc]/70" />
        <span className="text-[11px] text-[#cccccc]/70">{name}</span>
      </div>
      {isExpanded && (
        <div className="ml-4 pl-4 border-l border-white/10">{children}</div>
      )}
    </div>
  );
};

export const FileTreeFile: React.FC<TreeComponentProps> = ({
  name,
  value,
  isSelectable = true,
  isSelected = false,
  handleSelect,
}) => {
  const { getColor } = useStyles();

  return (
    <div
      className={`flex items-center gap-2 h-8 px-2 rounded-md cursor-pointer ${
        isSelected ? "bg-[#292929]/50" : "hover:bg-[#292929]/20"
      }`}
      onClick={() => handleSelect?.(value || name)}
    >
      <FileIcon className="h-4 w-4 text-[#cccccc]/70" />
      <span className="text-[11px] text-[#cccccc]/70">{name}</span>
    </div>
  );
};
