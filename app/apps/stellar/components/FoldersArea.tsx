import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useGrid, defaultGridConfig } from "../hooks/useGrid";
import { CanvasItem } from "../types/stellar";
import { useDrag } from "../contexts/drag-context";
import { useFolder } from "../contexts/folder-context";
import { ChevronLeft } from "lucide-react";

export function FoldersArea() {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const { findNextAvailablePosition } = useGrid(defaultGridConfig);
  const { setIsDraggingFolder, setDraggedFolderId, setPointerPosition } =
    useDrag();
  const { currentFolderId, setCurrentFolder, navigateBack } = useFolder();

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const response = await axios.get(
          currentFolderId
            ? `/api/stellar/folders/${currentFolderId}`
            : "/api/stellar/folders"
        );

        const folderData = currentFolderId
          ? response.data.folder
          : response.data.rootFolder;

        const mappedItems = [
          ...folderData.children.map((folderItem: any) => ({
            id: folderItem.id,
            name: folderItem.name,
            itemType: "folder" as const,
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
            name: fileItem.name,
            itemType: "file" as const,
            position: fileItem.position || { x: 0, y: 0 },
          })),
        ];

        setItems(mappedItems);
      } catch (error) {
        console.error("Failed to load folders:", error);
      }
    };

    loadFolders();
  }, [currentFolderId, findNextAvailablePosition]);

  const handleDoubleClick = useCallback(
    (item: CanvasItem) => {
      if (item.itemType === "folder") {
        setCurrentFolder(item.id);
      }
    },
    [setCurrentFolder]
  );

  return (
    <div className="relative w-full h-full flex-1 bg-[#00000030]">
      {currentFolderId && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={navigateBack}
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
              setIsDraggingFolder(true);
              setDraggedFolderId(item.id);
            }}
            onDrag={(event, info) => {
              setPointerPosition({ x: info.point.x, y: info.point.y });
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
