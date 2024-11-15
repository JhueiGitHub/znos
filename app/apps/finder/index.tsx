// src/apps/Finder/index.tsx
"use client";

import React from "react";
import FileExplorer from "./Finder";
import { useFileSystem } from "./hooks/useFileSystem";

const Finder: React.FC = () => {
  const {
    currentFolder,
    folderContents,
    favorites,
    navigateToFolder,
    navigateUp,
    navigateForward,
    createFolder,
    renameFolder,
    deleteFolder,
    updateFolderPosition,
    addToFavorites,
    removeFromFavorites,
    getFolderName,
    canNavigateForward,
    wipeDatabase,
    addToSidebar,
    removeFromSidebar,
    sidebarItems,
  } = useFileSystem();

  return (
    <div className="relative h-full w-full overflow-hidden">
      <FileExplorer
        currentFolder={currentFolder}
        folderContents={folderContents}
        favorites={favorites}
        navigateToFolder={navigateToFolder}
        navigateUp={navigateUp}
        navigateForward={navigateForward}
        createFolder={createFolder}
        renameFolder={renameFolder}
        deleteFolder={deleteFolder}
        updateFolderPosition={updateFolderPosition}
        addToFavorites={addToFavorites}
        removeFromFavorites={removeFromFavorites}
        getFolderName={getFolderName}
        canNavigateForward={canNavigateForward}
        wipeDatabase={wipeDatabase}
        addToSidebar={addToSidebar}
        removeFromSidebar={removeFromSidebar}
        sidebarItems={sidebarItems}
      />
    </div>
  );
};

export default Finder;
