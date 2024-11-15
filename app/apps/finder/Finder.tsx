import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  PanInfo,
  useDragControls,
} from "framer-motion";
import ContextMenu from "./components/ContextMenu";
import Sidebar from "./Sidebar";
import { FileSystemItem } from "./types/FileSystem";
import { useFileSystem } from "./hooks/useFileSystem";
import { useStyles } from "@os/hooks/useStyles";

const Finder: React.FC<ReturnType<typeof useFileSystem>> = ({
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
}) => {
  const { getColor, getFont } = useStyles();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [newFolder, setNewFolder] = useState<{
    id: string;
    position: { x: number; y: number };
  } | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isDraggingOverSidebar, setIsDraggingOverSidebar] = useState(false);
  const [draggingFolder, setDraggingFolder] = useState<FileSystemItem | null>(
    null
  );
  const explorerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // TEMPORARILY DISABLED: Auto-hide sidebar logic
      /*
      const explorerRect = explorerRef.current?.getBoundingClientRect();
      if (explorerRect) {
        const threshold = 100;
        const isNearLeftEdge = e.clientX - explorerRect.left < threshold;
        setIsSidebarVisible(isNearLeftEdge || !!draggingFolder);
      }
      */

      // Force sidebar to stay visible
      setIsSidebarVisible(true);
    },
    [draggingFolder]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = explorerRef.current?.getBoundingClientRect();
    if (rect) {
      setContextMenu({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleDoubleClick = (folder: FileSystemItem) => {
    navigateToFolder(folder.id);
  };

  const handleCreateFolder = () => {
    if (contextMenu) {
      const id = `temp-${Date.now()}`;
      setNewFolder({ id, position: { x: contextMenu.x, y: contextMenu.y } });
      setEditingFolder(id);
      closeContextMenu();
    }
  };

  const handleNewFolderNameSubmit = (name: string) => {
    if (newFolder) {
      createFolder(name, newFolder.position);
      setNewFolder(null);
      setEditingFolder(null);
    }
  };

  const handleDragStart = (folder: FileSystemItem) => () => {
    setDraggingFolder(folder);
    setIsSidebarVisible(true);
  };

  const handleDragEnd =
    (folder: FileSystemItem) => (_: never, info: PanInfo) => {
      const newPosition = {
        x: (folder.position?.x || 0) + info.offset.x,
        y: (folder.position?.y || 0) + info.offset.y,
      };

      if (isDraggingOverSidebar) {
        addToSidebar(folder);
      } else {
        updateFolderPosition(folder.id, newPosition);
      }

      setDraggingFolder(null);
      setIsDraggingOverSidebar(false);
    };

  const renderFolder = (folder: FileSystemItem) => {
    return (
      <motion.div
        key={folder.id}
        className="absolute flex cursor-move flex-col items-center"
        style={{
          fontFamily: getFont("Text Secondary"),
          color: getColor("Text Primary (Hd)"),
          x: folder.position?.x || 0,
          y: folder.position?.y || 0,
        }}
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        onDragStart={handleDragStart(folder)}
        onDragEnd={handleDragEnd(folder)}
        onDoubleClick={() => handleDoubleClick(folder)}
      >
        <img src="/media/folder.png" alt="Folder" className="h-12 w-12" />
        {editingFolder === folder.id ? (
          <input
            type="text"
            defaultValue={folder.name}
            className="w-20 bg-transparent text-center outline-none"
            style={{
              fontFamily: getFont("Text Secondary"),
              color: getColor("Text Primary (Hd)"),
            }}
            onBlur={(e) => {
              renameFolder(folder.id, e.target.value);
              setEditingFolder(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                renameFolder(folder.id, e.currentTarget.value);
                setEditingFolder(null);
              }
            }}
            autoFocus
          />
        ) : (
          <span
            className="mt-[3px] text-[15px]"
            style={{ color: getColor("Text Primary (Hd)") }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingFolder(folder.id);
            }}
          >
            {folder.name}
          </span>
        )}
      </motion.div>
    );
  };

  return (
    <div
      ref={explorerRef}
      className="relative h-full w-full overflow-hidden"
      style={{
        backgroundColor: getColor("Underlying BG"),
        color: getColor("Text Primary (Hd)"),
      }}
      onContextMenu={handleContextMenu}
      onClick={closeContextMenu}
    >
      <div className="flex h-full">
        <AnimatePresence>
          {isSidebarVisible && (
            <motion.div
              ref={sidebarRef}
              initial={{ x: -200 }}
              animate={{ x: 0 }}
              exit={{ x: -200 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="h-full w-48 z-10"
              style={{
                backgroundColor: getColor("Overlaying BG"),
                borderRight: `1px solid ${getColor("Brd")}`,
              }}
              onMouseEnter={() => {
                setIsSidebarVisible(true);
                setIsDraggingOverSidebar(true);
              }}
              onMouseLeave={() => {
                if (!draggingFolder) {
                  setIsSidebarVisible(false);
                }
                setIsDraggingOverSidebar(false);
              }}
            >
              <Sidebar
                sidebarItems={sidebarItems}
                onNavigate={navigateToFolder}
                onRemoveFromSidebar={removeFromSidebar}
                className="h-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col flex-grow">
          <div className="flex items-center p-4">
            <button
              onClick={navigateUp}
              className="mr-2"
              style={{ color: getColor("Text Secondary (Bd)") }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-[21px] w-[21px]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={navigateForward}
              className={`mr-2 ${
                canNavigateForward ? "" : "cursor-not-allowed opacity-50"
              }`}
              style={{
                color: canNavigateForward
                  ? getColor("Lilac Accent")
                  : getColor("Text Secondary (Bd)"),
              }}
              disabled={!canNavigateForward}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-[21px] w-[21px]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <span
              className="text-[17px]"
              style={{
                fontFamily: getFont("Text Primary"),
                color: getColor("Text Primary (Hd)"),
              }}
            >
              {getFolderName(currentFolder)}
            </span>
          </div>

          <div className="flex-grow relative overflow-hidden">
            {folderContents.map(renderFolder)}
            {newFolder && (
              <motion.div
                className="absolute flex flex-col items-center"
                initial={{ x: newFolder.position.x, y: newFolder.position.y }}
                animate={{ x: newFolder.position.x, y: newFolder.position.y }}
              >
                <img
                  src="/media/folder.png"
                  alt="New Folder"
                  className="h-12 w-12"
                />
                <input
                  type="text"
                  className="w-20 bg-transparent text-center outline-none"
                  style={{
                    fontFamily: getFont("Text Secondary"),
                    color: getColor("Text Primary (Hd)"),
                  }}
                  placeholder=""
                  autoFocus
                  onBlur={(e) => handleNewFolderNameSubmit(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleNewFolderNameSubmit(e.currentTarget.value);
                    }
                  }}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={[{ label: "New Folder", onClick: handleCreateFolder }]}
          onClose={closeContextMenu}
          onWipeDatabase={wipeDatabase}
        />
      )}
    </div>
  );
};

export default Finder;
