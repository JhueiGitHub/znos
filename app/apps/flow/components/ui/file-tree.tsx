// components/ui/file-tree.tsx
"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTreeContextValue {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

const FileTreeContext = React.createContext<FileTreeContextValue | undefined>(
  undefined
);

interface FileTreeProps extends React.HTMLAttributes<HTMLDivElement> {
  initialSelectedId?: string;
}

export const FileTree = React.forwardRef<HTMLDivElement, FileTreeProps>(
  ({ className, initialSelectedId, children, ...props }, ref) => {
    const [selectedId, setSelectedId] = React.useState<string | null>(
      initialSelectedId ?? null
    );

    return (
      <FileTreeContext.Provider value={{ selectedId, setSelectedId }}>
        <div
          ref={ref}
          className={cn("flex flex-col space-y-1", className)}
          {...props}
        >
          {children}
        </div>
      </FileTreeContext.Provider>
    );
  }
);
FileTree.displayName = "FileTree";

interface FolderProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  icon?: string;
  defaultExpanded?: boolean;
}

export const Folder = React.forwardRef<HTMLDivElement, FolderProps>(
  (
    {
      name,
      icon = "/icns/_folder.svg",
      defaultExpanded = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
    const Icon = isExpanded ? ChevronDown : ChevronRight;

    return (
      <div ref={ref} className={cn("space-y-1", className)} {...props}>
        <div
          className="flex items-center gap-2 h-8 px-2 rounded-md hover:bg-[#292929]/20 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Icon className="h-4 w-4 text-[#cccccc]/70" />
          <img
            src={isExpanded ? "/icns/_folder_open.svg" : icon}
            alt=""
            className="h-4 w-4"
          />
          <span className="text-[11px] text-[#cccccc]/70">{name}</span>
        </div>
        {isExpanded && (
          <div className="ml-4 pl-4 border-l border-white/10">{children}</div>
        )}
      </div>
    );
  }
);
Folder.displayName = "Folder";

interface FileProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  icon?: string;
  active?: boolean;
}

export const File = React.forwardRef<HTMLDivElement, FileProps>(
  ({ name, icon, active, className, ...props }, ref) => {
    const context = React.useContext(FileTreeContext);
    if (!context) throw new Error("File must be used within FileTree");

    const { selectedId, setSelectedId } = context;
    const isSelected = selectedId === name;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 h-8 px-2 rounded-md cursor-pointer",
          isSelected && "bg-[#292929]/50",
          "hover:bg-[#292929]/20",
          className
        )}
        onClick={() => setSelectedId(name)}
        {...props}
      >
        {icon && <img src={icon} alt="" className="h-4 w-4" />}
        <span className="text-[11px] text-[#cccccc]/70">{name}</span>
      </div>
    );
  }
);
File.displayName = "File";
