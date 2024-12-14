"use client";

import { useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFolder } from "../../contexts/folder-context";

export const StellarKeyboardEvents = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentFolderId } = useFolder();

  const createNewFolder = useCallback(async () => {
    try {
      console.log("Creating folder in:", currentFolderId); // Debug log

      const position = {
        x: Math.random() * 200 + 50,
        y: Math.random() * 200 + 50,
      };

      let response;
      if (currentFolderId) {
        // We're in a specific folder
        response = await axios.post(
          `/api/stellar/folders/${currentFolderId}/children`,
          {
            name: "New Folder",
            position,
          }
        );
      } else {
        // We're in root
        response = await axios.post("/api/stellar/folders", {
          name: "New Folder",
          position,
        });
      }

      console.log("Created folder:", response.data);

      // Invalidate queries
      if (currentFolderId) {
        await queryClient.invalidateQueries([
          "stellar-folder",
          currentFolderId,
        ]);
      }
      await queryClient.invalidateQueries(["stellar-folders"]);
      await queryClient.invalidateQueries(["stellar-profile"]);

      // Wait for invalidation before refresh
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.refresh();
    } catch (error) {
      console.error("Failed to create new folder:", error);
    }
  }, [currentFolderId, queryClient, router]);

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
