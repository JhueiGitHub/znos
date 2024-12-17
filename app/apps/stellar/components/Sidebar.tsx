import React, { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useDrag } from "../contexts/drag-context";
import { SidebarContent } from "./sidebar/SidebarContent";

export function Sidebar() {
  const queryClient = useQueryClient();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const {
    isDraggingFolder,
    isOverSidebar,
    setIsOverSidebar,
    pointerPosition,
    draggedFolderId,
    setIsDraggingFolder,
    setDraggedFolderId,
    setDragStartPosition,
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

  const handleDrop = useCallback(async () => {
    if (!draggedFolderId || !isOverSidebar) return;

    try {
      // Add folder to sidebar
      await axios.post("/api/stellar/folders/sidebar", {
        folderId: draggedFolderId,
      });

      // Invalidate and refetch both sidebar and current folder view
      await Promise.all([
        // For sidebar
        queryClient.invalidateQueries(["sidebar-folders"]),
        // For current folder view - use the exact query key structure
        queryClient.invalidateQueries(["stellar-folder"]),
        queryClient.refetchQueries(["stellar-folder"]), // Add this!
        queryClient.refetchQueries(["sidebar-folders"]), // And this!
      ]);
    } catch (error) {
      console.error("Failed to add folder to sidebar:", error);
    } finally {
      setIsDraggingFolder(false);
      setDraggedFolderId(null);
      setIsOverSidebar(false);
      setDragStartPosition(null);
    }
  }, [
    draggedFolderId,
    isOverSidebar,
    queryClient,
    setIsDraggingFolder,
    setDraggedFolderId,
    setIsOverSidebar,
    setDragStartPosition,
  ]);

  // Handle drag end
  useEffect(() => {
    const handleDragEnd = () => {
      if (isOverSidebar && draggedFolderId) {
        handleDrop();
      }
      setIsDraggingFolder(false);
      setDraggedFolderId(null);
      setIsOverSidebar(false);
      setDragStartPosition(null); // Clean up drag start position when drag ends
    };

    window.addEventListener("mouseup", handleDragEnd);
    return () => window.removeEventListener("mouseup", handleDragEnd);
  }, [
    isOverSidebar,
    draggedFolderId,
    handleDrop,
    setIsDraggingFolder,
    setDraggedFolderId,
    setIsOverSidebar,
    setDragStartPosition,
  ]);

  return (
    <div
      ref={sidebarRef}
      className="relative w-48 bg-black border-r border-[#29292981]"
    >
      {/* Drag highlight overlay */}
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

      {/* Sidebar content */}
      <SidebarContent />
    </div>
  );
}
