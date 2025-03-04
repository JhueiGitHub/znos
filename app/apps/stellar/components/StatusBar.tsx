// components/StatusBar.tsx
import React from "react";
import { useFolder } from "../contexts/folder-context";
import { useStellarState } from "../contexts/stellar-state-context";
import { StellarFile } from "../types/stellar";

export function StatusBar() {
  const { folderData } = useFolder();
  const { state } = useStellarState();

  // Calculate folder stats
  const getFolderStats = () => {
    const currentFolder = folderData?.folder || folderData?.rootFolder;

    if (!currentFolder) return { items: 0, folders: 0, files: 0 };

    const folders = currentFolder.children?.length || 0;
    const files = currentFolder.files?.length || 0;

    return {
      items: folders + files,
      folders,
      files,
    };
  };

  const stats = getFolderStats();

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Calculate total size of all files in the folder
  const getTotalSize = (): number => {
    const currentFolder = folderData?.folder || folderData?.rootFolder;
    if (!currentFolder || !currentFolder.files) return 0;

    return currentFolder.files.reduce(
      (total: number, file: StellarFile) => total + (file.size || 0),
      0
    );
  };

  return (
    <div className="h-5 px-3 flex items-center justify-between border-t border-[#29292981] bg-[#01020330]">
      <span className="text-xs text-[#cccccc78]">
        {stats.items} {stats.items === 1 ? "item" : "items"}
        {stats.folders > 0 &&
          ` (${stats.folders} ${stats.folders === 1 ? "folder" : "folders"})`}
        {stats.files > 0 &&
          ` (${stats.files} ${stats.files === 1 ? "file" : "files"})`}
      </span>

      {stats.files > 0 && (
        <span className="text-xs text-[#cccccc78]">
          {formatFileSize(getTotalSize())}
        </span>
      )}

      <span className="text-xs text-[#cccccc78]">
        {state.viewMode === "grid" ? "Grid view" : "List view"} • Sorting by{" "}
        {state.sortBy} (
        {state.sortDirection === "asc" ? "ascending" : "descending"})
      </span>
    </div>
  );
}
