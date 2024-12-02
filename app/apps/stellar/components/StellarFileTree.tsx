"use client";

import React from "react";
import { Tree, File, Folder } from "@/components/ui/file-tree";
import { useStyles } from "@/app/hooks/useStyles";
import { useStellarStore } from "../stores/stellar-store";

interface StellarFileTreeProps {
  type: "favorites" | "locations";
}

export function StellarFileTree({ type }: StellarFileTreeProps) {
  const { getColor } = useStyles();
  const {
    files,
    selectedFileId,
    expandedFolders,
    setSelectedFile,
    toggleFolder,
  } = useStellarStore();

  // Filter files based on type
  const getFavorites = () =>
    files.filter((f) => ["panther", "desktop"].includes(f.id));
  const getLocations = () =>
    files.filter((f) => ["desktop", "documents"].includes(f.id));

  const renderFiles = type === "favorites" ? getFavorites() : getLocations();

  return (
    <Tree
      initialSelectedId={selectedFileId || undefined}
      initialExpandedItems={expandedFolders}
    >
      {type === "favorites" ? (
        <>
          {renderFiles.map((file) => (
            <File
              key={file.id}
              value={file.id}
              className="text-[#cccccc]/90 text-[9px] font-medium"
              fileIcon={<StellarFolderIcon />}
              isSelectable
              isSelect={selectedFileId === file.id}
              handleSelect={() => setSelectedFile(file.id)}
            >
              {file.name}
            </File>
          ))}
        </>
      ) : (
        <>
          {renderFiles.map((file) => (
            <Folder
              key={file.id}
              element={file.name}
              value={file.id}
              isSelectable
              isSelect={selectedFileId === file.id}
            >
              <File
                value={`${file.id}-files`}
                className="text-[#cccccc]/90 text-[9px] font-medium pl-4"
                handleSelect={() => setSelectedFile(file.id)}
              >
                {file.name}
              </File>
            </Folder>
          ))}
        </>
      )}
    </Tree>
  );
}

function StellarFolderIcon() {
  return (
    <img
      src="/apps/stellar/icns/system/_sidebar_folder.png"
      className="w-3 h-3"
      alt=""
    />
  );
}
