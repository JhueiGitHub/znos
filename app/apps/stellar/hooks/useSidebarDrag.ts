// hooks/useSidebarDrag.ts
import { useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDrag } from "../contexts/drag-context";
import axios from "axios";

interface Position {
  x: number;
  y: number;
}

export interface UseSidebarDragOptions {
  onSidebarDragStart?: () => void;
  onSidebarDragEnd?: () => void;
  onSidebarDrop?: () => void;
}

export function useSidebarDrag(options: UseSidebarDragOptions = {}) {
  const queryClient = useQueryClient();
  const {
    isDraggingFolder,
    isOverSidebar,
    draggedFolderId,
    dragStartPosition,
    setIsOverSidebar,
    setIsDraggingFolder,
    setDraggedFolderId,
    setDragStartPosition,
    setPointerPosition,
  } = useDrag();

  // Add to sidebar mutation with optimistic updates
  const sidebarMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const response = await axios.post("/api/stellar/folders/sidebar", {
        folderId,
      });
      return response.data;
    },
    onMutate: async (folderId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["sidebar-folders"] });
      await queryClient.cancelQueries({ queryKey: ["folder"] });

      // Snapshot current data
      const previousSidebarData = queryClient.getQueryData(["sidebar-folders"]);
      const previousFolderData = queryClient.getQueryData(["folder"]);

      // Return context with snapshotted data
      return { previousSidebarData, previousFolderData };
    },
    onError: (err, folderId, context) => {
      // Revert optimistic updates on error
      if (context?.previousSidebarData) {
        queryClient.setQueryData(
          ["sidebar-folders"],
          context.previousSidebarData
        );
      }
      if (context?.previousFolderData) {
        queryClient.setQueryData(["folder"], context.previousFolderData);
      }
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["sidebar-folders"] });
      queryClient.invalidateQueries({ queryKey: ["folder"] });
    },
  });

  // Handle drag initialization
  const handleDragStart = useCallback(
    (position: Position) => {
      setDragStartPosition(position);
      options.onSidebarDragStart?.();
    },
    [setDragStartPosition, options]
  );

  // Handle drop on sidebar
  const handleSidebarDrop = useCallback(async () => {
    if (!draggedFolderId || !isOverSidebar || !dragStartPosition) return;

    try {
      await sidebarMutation.mutateAsync(draggedFolderId);
      options.onSidebarDrop?.();
    } finally {
      // Clean up drag state
      setIsDraggingFolder(false);
      setDraggedFolderId(null);
      setIsOverSidebar(false);
      setPointerPosition(null);
      setDragStartPosition(null);
      options.onSidebarDragEnd?.();
    }
  }, [
    draggedFolderId,
    isOverSidebar,
    dragStartPosition,
    sidebarMutation,
    setIsDraggingFolder,
    setDraggedFolderId,
    setIsOverSidebar,
    setPointerPosition,
    setDragStartPosition,
    options,
  ]);

  // Cleanup function
  const cleanup = useCallback(() => {
    setIsDraggingFolder(false);
    setDraggedFolderId(null);
    setIsOverSidebar(false);
    setPointerPosition(null);
    setDragStartPosition(null);
    options.onSidebarDragEnd?.();
  }, [
    setIsDraggingFolder,
    setDraggedFolderId,
    setIsOverSidebar,
    setPointerPosition,
    setDragStartPosition,
    options,
  ]);

  return {
    isDraggingFolder,
    isOverSidebar,
    draggedFolderId,
    dragStartPosition,
    handleDragStart,
    handleSidebarDrop,
    cleanup,
  };
}
