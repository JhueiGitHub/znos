// keyboard-listener.tsx
"use client";

import { useEffect, useCallback } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useFolder } from "../../contexts/folder-context";

// Export the event name constant
export const FOLDER_CREATED_EVENT = "folderCreated" as const;

// Define and export the event type
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

export const StellarKeyboardEvents = () => {
  const queryClient = useQueryClient();
  const { currentFolderId } = useFolder();

  const createNewFolder = useCallback(async () => {
    try {
      console.log("Creating folder in:", currentFolderId);

      const position = {
        x: Math.random() * 200 + 50,
        y: Math.random() * 200 + 50,
      };

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

      // Emit the folder created event
      emitFolderCreated(newFolder);

      // Update sidebar through query cache
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

      // Invalidate queries for consistency
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
