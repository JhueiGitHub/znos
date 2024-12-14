"use client";

import { useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

interface StellarFolder {
  id: string;
  name: string;
  children: StellarFolder[];
  files: StellarFile[];
}

interface StellarFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export const StellarKeyboardEvents = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname() || ""; // EVOLVED: Safe pathname handling

  // EVOLVED: Extract current folder ID from pathname
  const getCurrentFolderId = useCallback(() => {
    // Match either /stellar/folder/[id] or /stellar/[id]
    const match = pathname.match(/\/stellar(?:\/folder)?\/([^\/]+)$/);
    return match ? match[1] : null;
  }, [pathname]);

  const createNewFolder = useCallback(async () => {
    try {
      const parentId = getCurrentFolderId();
      const position = { x: 20, y: 20 }; // Default position for new folder

      await axios.post("/api/stellar/folders", {
        name: "New Folder",
        parentId, // Will be null for root folder
        position,
      });

      // EVOLVED: Invalidate appropriate queries based on context
      if (parentId) {
        // If we're in a folder view, invalidate that folder's data
        queryClient.invalidateQueries(["stellar-folder", parentId]);
        queryClient.invalidateQueries(["stellar-folders", parentId]);
      } else {
        // If we're in root view, invalidate root data
        queryClient.invalidateQueries(["stellar-folders"]);
      }
      queryClient.invalidateQueries(["stellar-profile"]);

      router.refresh();
    } catch (error) {
      console.error("Failed to create new folder:", error);
    }
  }, [getCurrentFolderId, queryClient, router]);

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

    // PRESERVED: Original event listener setup
    window.addEventListener("keypress", handleKeyPress);

    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [createNewFolder]);

  // PRESERVED: Debug logging
  useEffect(() => {
    console.log("StellarKeyboardEvents mounted");
    return () => console.log("StellarKeyboardEvents unmounted");
  }, []);

  return null;
};

// PRESERVED: Type exports
export type { StellarFolder, StellarFile };
