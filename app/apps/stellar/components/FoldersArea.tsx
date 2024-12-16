// components/FoldersArea.tsx
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useGrid, defaultGridConfig } from "../hooks/useGrid";
import { CanvasItem } from "../types/stellar";
import { useDrag } from "../contexts/drag-context";

export function FoldersArea() {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const { findNextAvailablePosition } = useGrid(defaultGridConfig);
  const { setIsDraggingFolder, setDraggedFolderId, setPointerPosition } =
    useDrag();

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const response = await axios.get("/api/stellar/folders");
        const mappedItems = response.data.rootFolder.children.map(
          (item: any) => ({
            id: item.id,
            name: item.name,
            itemType: "folder" as const,
            position:
              item.position ||
              findNextAvailablePosition(
                response.data.rootFolder.children
                  .filter((i: any) => i.position)
                  .map((i: any) => i.position)
              ),
          })
        );
        setItems(mappedItems);
      } catch (error) {
        console.error("Failed to load folders:", error);
      }
    };
    loadFolders();
  }, []);

  const handleDragStart = useCallback(
    (item: CanvasItem) => {
      setIsDraggingFolder(true);
      setDraggedFolderId(item.id);
    },
    [setIsDraggingFolder, setDraggedFolderId]
  );

  const handleDragEnd = useCallback(
    async (
      item: CanvasItem,
      info: {
        offset: { x: number; y: number };
        point: { x: number; y: number };
      }
    ) => {
      setIsDraggingFolder(false);
      setDraggedFolderId(null);
      setPointerPosition(null);

      try {
        // Calculate the new position based on the original position plus the offset
        const newPosition = {
          x: item.position.x + info.offset.x,
          y: item.position.y + info.offset.y,
        };

        await axios.patch(`/api/stellar/folders/${item.id}/position`, {
          position: newPosition,
        });

        // Update local state with the precise new position
        setItems((prev) =>
          prev.map((prevItem) =>
            prevItem.id === item.id
              ? { ...prevItem, position: newPosition }
              : prevItem
          )
        );
      } catch (error) {
        console.error("Failed to update position:", error);
      }
    },
    [setIsDraggingFolder, setDraggedFolderId, setPointerPosition]
  );

  return (
    <div className="relative flex-1 bg-[#00000030]">
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
          dragTransition={{
            bounceStiffness: 0,
            bounceDamping: 0,
            power: 0,
          }}
          onDragStart={() => handleDragStart(item)}
          onDrag={(event, info) => {
            setPointerPosition({ x: info.point.x, y: info.point.y });
          }}
          onDragEnd={(event, info) => handleDragEnd(item, info)}
          whileDrag={{
            scale: 1.05,
            zIndex: 999999,
          }}
        >
          <div className="w-16 h-16 rounded-xl flex items-center justify-center">
            <img
              src="/apps/stellar/icns/system/_folder.png"
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
  );
}
