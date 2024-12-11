"use client";

import { useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

// PRESERVED: Original types
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

  // EVOLVED: Create folder handler as a callback
  const createNewFolder = useCallback(async () => {
    try {
      await axios.post("/api/stellar/folders", {
        name: "New Folder",
      });

      // EVOLVED: Invalidate queries to force refresh
      queryClient.invalidateQueries(["stellar-folders"]);
      queryClient.invalidateQueries(["stellar-profile"]);

      // Force router refresh
      router.refresh();
    } catch (error) {
      console.error("Failed to create new folder:", error);
    }
  }, [queryClient, router]);

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      // PRESERVED: Input element check
      const activeElement = document.activeElement?.tagName;
      if (["INPUT", "TEXTAREA"].includes(activeElement || "")) {
        return;
      }

      // EVOLVED: Simplified key check
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        await createNewFolder();
      }
    };

    // EVOLVED: Add both keydown and keypress listeners to ensure capture
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, [createNewFolder]);

  // Debug log to verify component mounting
  useEffect(() => {
    console.log("StellarKeyboardEvents mounted");
    return () => console.log("StellarKeyboardEvents unmounted");
  }, []);

  return null;
};

// PRESERVED: Type exports
export type { StellarFolder, StellarFile };
