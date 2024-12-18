import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDrag } from "../contexts/drag-context";
import { SidebarContent } from "./sidebar/SidebarContent";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function Sidebar() {
  const queryClient = useQueryClient();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const {
    isDraggingFolder,
    isOverSidebar,
    draggedFolderId,
    dragStartPosition,
    setIsOverSidebar,
    setIsDraggingFolder,
    setDraggedFolderId,
    setPointerPosition,
    setDragStartPosition,
    pointerPosition,
  } = useDrag();

  // Check if pointer is over sidebar during drag
  useEffect(() => {
    if (!isDraggingFolder || !pointerPosition || !sidebarRef.current) return;

    const rect = sidebarRef.current.getBoundingClientRect();
    const isOver =
      pointerPosition.x >= rect.left &&
      pointerPosition.x <= rect.right &&
      pointerPosition.y >= rect.top &&
      pointerPosition.y <= rect.bottom;

    setIsOverSidebar(isOver);
  }, [isDraggingFolder, pointerPosition, setIsOverSidebar]);

  useEffect(() => {
    const handleDragEnd = async () => {
      if (isOverSidebar && draggedFolderId && dragStartPosition) {
        // CRITICAL: Immediately restore position in folder cache
        queryClient.setQueryData(["folder"], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item: any) =>
              item.id === draggedFolderId
                ? { ...item, position: dragStartPosition }
                : item
            ),
          };
        });

        try {
          await axios.post("/api/stellar/folders/sidebar", {
            folderId: draggedFolderId,
          });

          await queryClient.invalidateQueries(["sidebar-folders"]);
        } catch (error) {
          console.error("Failed to add folder to sidebar:", error);
        }
      }

      setIsDraggingFolder(false);
      setDraggedFolderId(null);
      setIsOverSidebar(false);
      setPointerPosition(null);
      setDragStartPosition(null);
    };

    window.addEventListener("mouseup", handleDragEnd);
    return () => window.removeEventListener("mouseup", handleDragEnd);
  }, [
    isOverSidebar,
    draggedFolderId,
    dragStartPosition,
    queryClient,
    setIsDraggingFolder,
    setDraggedFolderId,
    setIsOverSidebar,
    setPointerPosition,
    setDragStartPosition,
  ]);

  return (
    <div
      ref={sidebarRef}
      className="relative w-[210px] pt-[6px] bg-black/30 border-r border-[#29292981]"
    >
      <AnimatePresence>
        {isDraggingFolder && isOverSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#4C4F69]/20 border-2 border-dashed border-[#4C4F69]/40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <SidebarContent />
    </div>
  );
}
