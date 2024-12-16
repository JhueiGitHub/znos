"use client";

import { useEffect, useCallback } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useFolder } from "../../contexts/folder-context";

// PRESERVED: Constants and type definitions
export const FOLDER_CREATED_EVENT = "folderCreated" as const;

export interface FolderCreatedEvent extends CustomEvent {
  detail: {
    id: string;
    name: string;
    itemType: "folder";
    position: { x: number; y: number };
    children: any[];
    files: any[];
  };
}

export const emitFolderCreated = (folder: FolderCreatedEvent["detail"]) => {
  const event = new CustomEvent<FolderCreatedEvent["detail"]>(
    FOLDER_CREATED_EVENT,
    {
      detail: folder,
    }
  );
  window.dispatchEvent(event);
};

// EVOLVED: Refined grid constants
const GRID_SPACING = 100;
const INITIAL_OFFSET = 50;
const GRID_COLUMNS = 8;
const GRID_ROWS = 8;
const ITEM_SIZE = 64; // Size of folder/file icons

// EVOLVED: Helper to determine if an item overlaps a grid cell
const doesItemOverlapCell = (
  itemPosition: { x: number; y: number },
  cellRow: number,
  cellCol: number
) => {
  // Calculate grid cell bounds
  const cellLeft = INITIAL_OFFSET + cellCol * GRID_SPACING - GRID_SPACING / 2;
  const cellRight = cellLeft + GRID_SPACING;
  const cellTop = INITIAL_OFFSET + cellRow * GRID_SPACING - GRID_SPACING / 2;
  const cellBottom = cellTop + GRID_SPACING;

  // Calculate item bounds
  const itemLeft = itemPosition.x - ITEM_SIZE / 2;
  const itemRight = itemPosition.x + ITEM_SIZE / 2;
  const itemTop = itemPosition.y - ITEM_SIZE / 2;
  const itemBottom = itemPosition.y + ITEM_SIZE / 2;

  // Check for any overlap
  return !(
    itemLeft >= cellRight ||
    itemRight <= cellLeft ||
    itemTop >= cellBottom ||
    itemBottom <= cellTop
  );
};

// EVOLVED: Refined function to find first available grid position
const findFirstAvailablePosition = async (currentFolderId: string | null) => {
  try {
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

    // Create a grid occupancy map using precise overlap detection
    const occupiedGrid: boolean[][] = Array(GRID_ROWS)
      .fill(null)
      .map(() => Array(GRID_COLUMNS).fill(false));

    // Mark cells as occupied if any item overlaps them
    existingItems.forEach((item: any) => {
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLUMNS; col++) {
          if (doesItemOverlapCell(item.position, row, col)) {
            occupiedGrid[row][col] = true;
          }
        }
      }
    });

    // Find first completely unoccupied grid cell
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLUMNS; col++) {
        if (!occupiedGrid[row][col]) {
          // Return exact grid cell center
          return {
            x: INITIAL_OFFSET + col * GRID_SPACING,
            y: INITIAL_OFFSET + row * GRID_SPACING,
          };
        }
      }
    }

    // If all cells are occupied, add to a new row
    const nextRow = occupiedGrid.length;
    return {
      x: INITIAL_OFFSET,
      y: INITIAL_OFFSET + nextRow * GRID_SPACING,
    };
  } catch (error) {
    console.error("Error finding available position:", error);
    return { x: INITIAL_OFFSET, y: INITIAL_OFFSET };
  }
};

export const StellarKeyboardEvents = () => {
  const queryClient = useQueryClient();
  const { currentFolderId } = useFolder();

  // PRESERVED: Create new folder function
  const createNewFolder = useCallback(async () => {
    try {
      console.log("Creating folder in:", currentFolderId);

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
      console.log("Created folder:", newFolder);

      // PRESERVED: Event emission
      emitFolderCreated(newFolder);

      // PRESERVED: Cache updates
      if (currentFolderId) {
        queryClient.setQueryData(
          ["stellar-folder", currentFolderId],
          (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              folder: {
                ...oldData.folder,
                children: [...(oldData.folder.children || []), newFolder],
              },
            };
          }
        );
      } else {
        queryClient.setQueryData(["stellar-folders"], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            rootFolder: {
              ...oldData.rootFolder,
              children: [...(oldData.rootFolder.children || []), newFolder],
            },
          };
        });
      }

      // PRESERVED: Query invalidation
      if (currentFolderId) {
        await queryClient.invalidateQueries([
          "stellar-folder",
          currentFolderId,
        ]);
      }
      await queryClient.invalidateQueries(["stellar-folders"]);
      await queryClient.invalidateQueries(["stellar-profile"]);
    } catch (error) {
      console.error("Failed to create new folder:", error);
    }
  }, [currentFolderId, queryClient]);

  // PRESERVED: Keyboard event handler
  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      const activeElement = document.activeElement?.tagName;
      if (["INPUT", "TEXTAREA"].includes(activeElement || "")) {
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
};
