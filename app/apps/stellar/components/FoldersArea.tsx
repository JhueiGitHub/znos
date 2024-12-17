import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useGrid, defaultGridConfig } from "../hooks/useGrid";
import { CanvasItem } from "../types/stellar";
import { useDrag } from "../contexts/drag-context";
import { useFolder } from "../contexts/folder-context";
import { ChevronLeft } from "lucide-react";

interface Position {
  x: number;
  y: number;
}

export function FoldersArea() {
  // Local state only
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [navigationStack, setNavigationStack] = useState<string[]>([]);

  // Context state
  const { currentFolderId, setCurrentFolder, setFolderPath } = useFolder();
  const { findNextAvailablePosition } = useGrid(defaultGridConfig);
  const { setIsDraggingFolder, setDraggedFolderId, setPointerPosition } =
    useDrag();

  // Simple load folders without any guards or refs
  const loadFolders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        currentFolderId
          ? `/api/stellar/folders/${currentFolderId}`
          : "/api/stellar/folders"
      );

      const folderData = currentFolderId
        ? response.data.folder
        : response.data.rootFolder;

      if (response.data.folder) {
        const newPath =
          response.data.folder.path?.map((folder: any) => ({
            id: folder.id,
            name: folder.name,
          })) || [];

        if (newPath.length > 0 && newPath[0].name !== "Root") {
          newPath.unshift({ id: response.data.rootFolder.id, name: "Root" });
        }
        setFolderPath(newPath);
      } else {
        setFolderPath([]);
      }

      const mappedItems = [
        ...folderData.children.map((folderItem: any) => ({
          id: folderItem.id,
          itemType: "folder" as const,
          data: { ...folderItem, itemType: "folder" },
          position:
            folderItem.position ||
            findNextAvailablePosition(
              folderData.children
                .filter((i: any) => i.position)
                .map((i: any) => i.position)
            ),
        })),
        ...folderData.files.map((fileItem: any) => ({
          id: fileItem.id,
          itemType: "file" as const,
          data: { ...fileItem, itemType: "file" },
          position: fileItem.position || { x: 0, y: 0 },
        })),
      ];

      setItems(mappedItems);
    } catch (error) {
      console.error("Failed to load folders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId, findNextAvailablePosition, setFolderPath]);

  useEffect(() => {
    loadFolders();
  }, [currentFolderId]);

  const handleFolderOpen = useCallback(
    (folderId: string) => {
      if (currentFolderId) {
        setNavigationStack((prev) => [...prev, currentFolderId]);
      }
      setCurrentFolder(folderId);
    },
    [currentFolderId, setCurrentFolder]
  );

  const handleBack = useCallback(() => {
    const previousFolder = navigationStack[navigationStack.length - 1];
    setNavigationStack((prev) => prev.slice(0, -1));
    setCurrentFolder(previousFolder || null);
  }, [navigationStack, setCurrentFolder]);

  const handleDragEnd = useCallback(
    async (item: CanvasItem, position: Position) => {
      try {
        const endpoint =
          item.itemType === "file"
            ? `/api/stellar/files/${item.id}/position`
            : `/api/stellar/folders/${item.id}/position`;

        await axios.patch(endpoint, { position });

        setItems((prevItems) =>
          prevItems.map((prevItem) =>
            prevItem.id === item.id ? { ...prevItem, position } : prevItem
          )
        );
      } catch (error) {
        console.error("Failed to update position:", error);
      }
    },
    []
  );

  const handleDoubleClick = useCallback(
    (item: CanvasItem) => {
      if (item.itemType === "folder") {
        handleFolderOpen(item.id);
      }
    },
    [handleFolderOpen]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4 h-full p-4">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex-1 bg-[#00000030]">
      {currentFolderId && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg bg-[#4C4F69]/10 hover:bg-[#4C4F69]/20 transition"
          >
            <ChevronLeft className="w-4 h-4 text-[#626581]" />
          </button>
        </div>
      )}

      <div className="relative w-full h-full">
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="absolute flex flex-col items-center cursor-grab active:cursor-grabbing"
            initial={false}
            animate={{
              x: item.position.x,
              y: item.position.y,
            }}
            drag
            dragMomentum={false}
            dragElastic={0}
            onDragStart={() => {
              setIsDraggingFolder(item.itemType === "folder");
              setDraggedFolderId(item.id);
            }}
            onDrag={(_, info) => {
              setPointerPosition({ x: info.point.x, y: info.point.y });
            }}
            onDragEnd={(_, info) => {
              setIsDraggingFolder(false);
              setDraggedFolderId(null);
              setPointerPosition(null);
              const finalPosition = {
                x: item.position.x + info.offset.x,
                y: item.position.y + info.offset.y,
              };
              handleDragEnd(item, finalPosition);
            }}
            onDoubleClick={() => handleDoubleClick(item)}
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center">
              <img
                src={`/apps/stellar/icns/system/_${item.itemType}.png`}
                alt={item.name}
                className="w-[64px] h-[64px] object-contain"
                draggable={false}
              />
            </div>
            <h3 className="text-[13px] font-semibold truncate max-w-[150px] text-[#626581ca] mt-1">
              {item.name}
            </h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
