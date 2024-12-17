// components/ui/keyboard-listener.tsx
"use client";

import { useEffect, useCallback } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useFolder } from "../../contexts/folder-context";

// Event name constant
export const FOLDER_CREATED_EVENT = "folderCreated" as const;

// Event typing
export interface FolderCreatedEvent extends CustomEvent {
  detail: {
    id: string;
    name: string;
    itemType: "folder";
    position: { x: number; y: number };
  };
}

// Grid configuration
const GRID = {
  SPACING: 100,
  INITIAL_OFFSET: 50,
  COLUMNS: 8,
  ROWS: 8,
  ITEM_SIZE: 64,
};

// Emit folder creation event
const emitFolderCreated = (folder: FolderCreatedEvent["detail"]) => {
  window.dispatchEvent(
    new CustomEvent<FolderCreatedEvent["detail"]>(FOLDER_CREATED_EVENT, {
      detail: folder,
    })
  );
};

// Collision detection helper
const hasCollision = (
  position: { x: number; y: number },
  itemPosition: { x: number; y: number }
) => {
  const distance = Math.sqrt(
    Math.pow(position.x - itemPosition.x, 2) +
      Math.pow(position.y - itemPosition.y, 2)
  );
  return distance < GRID.ITEM_SIZE;
};

// Find first available grid position
const findFirstAvailablePosition = async (currentFolderId: string | null) => {
  try {
    // Get current folder contents
    const response = await axios.get(
      currentFolderId
        ? `/api/stellar/folders/${currentFolderId}`
        : "/api/stellar/folders"
    );

    const folder = currentFolderId
      ? response.data.folder
      : response.data.rootFolder;
    const existingItems = [
      ...(folder?.children || []),
      ...(folder?.files || []),
    ];

    // Scan grid for first available position
    for (let row = 0; row < GRID.ROWS; row++) {
      for (let col = 0; col < GRID.COLUMNS; col++) {
        const position = {
          x: GRID.INITIAL_OFFSET + col * GRID.SPACING,
          y: GRID.INITIAL_OFFSET + row * GRID.SPACING,
        };

        // Check if position is clear of all existing items
        const hasAnyCollision = existingItems.some((item) =>
          hasCollision(position, item.position)
        );

        if (!hasAnyCollision) {
          return position;
        }
      }
    }

    // If all positions taken, start new row
    return {
      x: GRID.INITIAL_OFFSET,
      y: GRID.INITIAL_OFFSET + GRID.ROWS * GRID.SPACING,
    };
  } catch (error) {
    console.error("Error finding available position:", error);
    return { x: GRID.INITIAL_OFFSET, y: GRID.INITIAL_OFFSET };
  }
};

export function StellarKeyboardEvents() {
  const queryClient = useQueryClient();
  const { currentFolderId } = useFolder();

  const createNewFolder = useCallback(async () => {
    try {
      const position = await findFirstAvailablePosition(currentFolderId);

      let response;
      if (currentFolderId) {
        response = await axios.post(
          `/api/stellar/folders/${currentFolderId}/children`,
          {
            name: "New Folder",
            position,
          }
        );
      } else {
        response = await axios.post("/api/stellar/folders", {
          name: "New Folder",
          position,
        });
      }

      const newFolder = response.data;

      // Emit event for FoldersArea to handle
      emitFolderCreated(newFolder);

      // Invalidate queries to trigger refetch
      await Promise.all([
        currentFolderId &&
          queryClient.invalidateQueries(["stellar-folder", currentFolderId]),
        queryClient.invalidateQueries(["stellar-folders"]),
        queryClient.invalidateQueries(["sidebar-folders"]),
      ]);
    } catch (error) {
      console.error("Failed to create new folder:", error);
    }
  }, [currentFolderId, queryClient]);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if (document.activeElement?.tagName.match(/^(INPUT|TEXTAREA)$/i)) {
        return;
      }

      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        await createNewFolder();
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [createNewFolder]);

  return null;
}
