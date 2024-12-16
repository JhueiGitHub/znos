"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { DragEvent as ReactDragEvent } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useFolder } from "../contexts/folder-context";
import {
  FOLDER_CREATED_EVENT,
  FolderCreatedEvent,
} from "./ui/keyboard-listener";
import { cn } from "@/lib/utils";
import { useStellarDrag } from "../hooks/use-stellar-drag";

const exemplarPro = localFont({
  src: "../../../../public/fonts/SFProTextSemibold.ttf",
});

interface Position {
  x: number;
  y: number;
}

interface BaseItem {
  id: string;
  name: string;
  position: Position;
}

interface StellarFile extends BaseItem {
  itemType: "file";
  url: string;
  size: number;
  mimeType: string;
}

interface StellarFolder extends BaseItem {
  itemType: "folder";
  children: StellarFolder[];
  files: StellarFile[];
}

interface StellarProfile {
  id: string;
  name: string;
  driveCapacity: bigint;
  currentUsage: number;
  rootFolder: StellarFolder;
}

type CanvasItem = {
  id: string;
  itemType: "folder" | "file";
  data: StellarFile | StellarFolder;
  position: Position;
};

function isStellarFile(item: any): item is StellarFile {
  return item && item.itemType === "file";
}

function isStellarFolder(item: any): item is StellarFolder {
  return item && item.itemType === "folder";
}

interface EditState {
  id: string | null;
  value: string;
}

interface FolderPath {
  id: string;
  name: string;
}

interface FoldersAreaProps {
  initialFolderId?: string;
  onPathChange?: (path: FolderPath[]) => void;
  className?: string;
}

export const FoldersArea = ({
  initialFolderId,
  onPathChange,
  className,
}: FoldersAreaProps) => {
  const router = useRouter();
  const { currentFolderId: contextFolderId, setCurrentFolder } = useFolder();
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(
    initialFolderId
  );
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const [profile, setProfile] = useState<StellarProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [fileDropActive, setFileDropActive] = useState(false);
  const { getColor } = useStyles();
  const [editState, setEditState] = useState<EditState>({
    id: null,
    value: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [folderPath, setFolderPath] = useState<FolderPath[]>([]);

  useEffect(() => {
    setCurrentFolder(currentFolderId || null);
  }, [currentFolderId, setCurrentFolder]);

  const fetchFolders = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching folders for ID:", currentFolderId);

      const response = await axios.get(
        currentFolderId
          ? `/api/stellar/folders/${currentFolderId}`
          : "/api/stellar/folders"
      );

      console.log("Folder response:", response.data);
      setProfile(response.data);

      if (response.data.folder) {
        // EVOLVED: Only include root once in the path
        const newPath =
          response.data.folder.path?.map((folder: any) => ({
            id: folder.id,
            name: folder.name,
          })) || [];

        // If we have a path and it doesn't start with root, add root at the beginning
        if (newPath.length > 0 && newPath[0].name !== "Root") {
          newPath.unshift({ id: response.data.rootFolder.id, name: "Root" });
        }

        setFolderPath(newPath);
        onPathChange?.(newPath);
      } else {
        // At root level, don't set any path
        setFolderPath([]);
        onPathChange?.([]);
      }

      if (response.data.folder || response.data.rootFolder) {
        const folder = response.data.folder || response.data.rootFolder;
        const canvasItems: CanvasItem[] = [
          ...folder.children.map((folderItem: StellarFolder) => ({
            id: folderItem.id,
            itemType: "folder",
            data: { ...folderItem, itemType: "folder" },
            position: folderItem.position || { x: 0, y: 0 },
          })),
          ...folder.files.map((fileItem: StellarFile) => ({
            id: fileItem.id,
            itemType: "file",
            data: { ...fileItem, itemType: "file" },
            position: fileItem.position || { x: 0, y: 0 },
          })),
        ];
        setItems(canvasItems);
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId, onPathChange]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Add this new useEffect after the existing useEffects in the FoldersArea component
  // In folders-area.tsx, add this useEffect:
  useEffect(() => {
    const handleFolderCreated = (event: FolderCreatedEvent) => {
      const newFolder = event.detail;
      setItems((previousItems) => [
        ...previousItems,
        {
          id: newFolder.id,
          itemType: "folder",
          data: { ...newFolder, itemType: "folder" },
          position: newFolder.position || { x: 0, y: 0 },
        },
      ]);
    };

    // Add event listener for folder creation
    window.addEventListener(
      FOLDER_CREATED_EVENT,
      handleFolderCreated as EventListener
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        FOLDER_CREATED_EVENT,
        handleFolderCreated as EventListener
      );
    };
  }, []);

  const handleDragStart = useCallback((item: CanvasItem) => {
    const event = new CustomEvent("folder-drag-start", {
      detail: { folderId: item.id },
    });
    document.dispatchEvent(event);
  }, []);

  const handleDragEnd = useCallback(
    async (item: CanvasItem, position: Position) => {
      try {
        const endpoint =
          item.itemType === "file"
            ? `/api/stellar/files/${item.id}/position`
            : `/api/stellar/folders/${item.id}/position`;

        await axios.patch(endpoint, { position });

        setItems((previousItems) =>
          previousItems.map((previousItem) =>
            previousItem.id === item.id
              ? { ...previousItem, position }
              : previousItem
          )
        );
      } catch (error) {
        console.error("Failed to update position:", error);
      }
    },
    []
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.types.includes("Files")) {
      setFileDropActive(true);
    }
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    if (
      event.clientY <= rect.top ||
      event.clientY >= rect.bottom ||
      event.clientX <= rect.left ||
      event.clientX >= rect.right
    ) {
      setFileDropActive(false);
    }
  }, []);

  const handleFileUpload = useCallback(
    async (file: File, dropPosition: Position) => {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("UPLOADCARE_PUB_KEY", "f908b6ff47aba6efd711");

        const uploadResponse = await axios.post(
          "https://upload.uploadcare.com/base/",
          formData
        );

        if (!uploadResponse?.data?.file) {
          throw new Error("Upload failed");
        }

        const cdnUrl = `https://ucarecdn.com/${uploadResponse.data.file}/`;

        const fileResponse = await axios.post("/api/stellar/files", {
          name: file.name,
          url: cdnUrl,
          size: file.size,
          mimeType: file.type,
          folderId: currentFolderId || profile?.rootFolder?.id,
          position: dropPosition,
        });

        setItems((previousItems) => [
          ...previousItems,
          {
            id: fileResponse.data.id,
            itemType: "file",
            data: { ...fileResponse.data, itemType: "file" },
            position: dropPosition,
          },
        ]);
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [currentFolderId, profile?.rootFolder?.id]
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      setFileDropActive(false);

      const dropPosition = {
        x: event.clientX - event.currentTarget.getBoundingClientRect().left,
        y: event.clientY - event.currentTarget.getBoundingClientRect().top,
      };

      const { files } = event.dataTransfer;
      if (files?.length) {
        for (const file of Array.from(files)) {
          await handleFileUpload(file, dropPosition);
        }
      }
    },
    [handleFileUpload]
  );

  const handleFolderOpen = useCallback(
    (folderId: string) => {
      console.log("Opening folder:", folderId);
      if (currentFolderId) {
        setNavigationStack((previousStack) => [
          ...previousStack,
          currentFolderId,
        ]);
      }
      setCurrentFolderId(folderId);
      setCurrentFolder(folderId);
    },
    [currentFolderId, setCurrentFolder]
  );

  const handleBack = useCallback(() => {
    console.log("Navigation stack:", navigationStack);
    const previousFolder = navigationStack[navigationStack.length - 1];
    setNavigationStack((previousStack) => previousStack.slice(0, -1));
    setCurrentFolderId(previousFolder);
    setCurrentFolder(previousFolder || null);
  }, [navigationStack, setCurrentFolder]);

  const handleDoubleClick = useCallback(
    (item: CanvasItem, event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName.toLowerCase() === "h3") {
        setEditState({ id: item.id, value: item.data.name });
      } else if (item.itemType === "folder") {
        handleFolderOpen(item.id);
      }
    },
    [handleFolderOpen]
  );

  const handleRename = useCallback(
    async (item: CanvasItem, newName: string) => {
      try {
        const endpoint =
          item.itemType === "folder"
            ? `/api/stellar/folders/${item.id}`
            : `/api/stellar/files/${item.id}`;

        await axios.patch(endpoint, { name: newName });

        setItems((previousItems) =>
          previousItems.map((previousItem) =>
            previousItem.id === item.id
              ? {
                  ...previousItem,
                  data: { ...previousItem.data, name: newName },
                }
              : previousItem
          )
        );
      } catch (error) {
        console.error("Failed to rename item:", error);
      } finally {
        setEditState({ id: null, value: "" });
      }
    },
    []
  );

  const handleInputBlur = useCallback(
    (item: CanvasItem) => {
      if (editState.value.trim() && editState.value !== item.data.name) {
        handleRename(item, editState.value);
      } else {
        setEditState({ id: null, value: "" });
      }
    },
    [editState.value, handleRename]
  );

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>, item: CanvasItem) => {
      if (event.key === "Enter") {
        if (editState.value.trim() && editState.value !== item.data.name) {
          handleRename(item, editState.value);
        } else {
          setEditState({ id: null, value: "" });
        }
      } else if (event.key === "Escape") {
        setEditState({ id: null, value: "" });
      }
    },
    [editState.value, handleRename]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4 h-full p-4">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="relative flex-1 overflow-hidden bg-[#010203]/30"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {currentFolderId && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg bg-[#4C4F69]/10 hover:bg-[#4C4F69]/20 transition"
          >
            <ChevronLeft className="w-4 h-4 text-[#626581]" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {fileDropActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#4C4F69]/20 border-2 border-dashed border-[#4C4F69]/40 rounded-lg pointer-events-none"
          >
            <div className="flex items-center justify-center h-full">
              <span className="text-[#4C4F69] text-lg">
                Drop files to upload
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full h-full">
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="absolute flex flex-col items-center cursor-grab active:cursor-grabbing"
            drag
            dragMomentum={false}
            dragTransition={{ power: 0 }}
            initial={false}
            animate={{
              x: item.position.x,
              y: item.position.y,
              zIndex: 999999, // Force absolute highest z-index for dragged items
            }}
            onDragEnd={(_, info) => {
              const finalPosition = {
                x: item.position.x + info.offset.x,
                y: item.position.y + info.offset.y,
              };
              handleDragEnd(item, finalPosition);
            }}
            onDoubleClick={(event) => handleDoubleClick(item, event)}
            dragConstraints={false}
            dragElastic={0}
          >
            {item.itemType === "folder" ? (
              <>
                <div className="w-16 h-16 rounded-xl flex items-center justify-center">
                  <img
                    src="/apps/stellar/icns/system/_folder.png"
                    alt={item.data.name}
                    className="w-[64px] h-[64px] object-contain"
                    draggable={false}
                  />
                </div>
                {editState.id === item.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={editState.value}
                    onChange={(event) =>
                      setEditState({ ...editState, value: event.target.value })
                    }
                    onBlur={() => handleInputBlur(item)}
                    onKeyDown={(event) => handleInputKeyDown(event, item)}
                    className="text-[13px] font-semibold bg-[#4C4F69]/10 px-2 py-1 rounded outline-none focus:ring-2 focus:ring-[#4C4F69]/20 text-[#626581] mt-1"
                    style={exemplarPro.style}
                    maxLength={255}
                  />
                ) : (
                  <h3
                    className="text-[13px] font-semibold truncate max-w-[150px] text-[#626581ca] mt-1"
                    style={exemplarPro.style}
                  >
                    {item.data.name}
                  </h3>
                )}
              </>
            ) : (
              <>
                {isStellarFile(item.data) && (
                  <>
                    {item.data.mimeType?.startsWith("video/") ? (
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="w-full h-12">
                          <video
                            src={item.data.url}
                            className="w-full h-full object-cover rounded-[9px]"
                            autoPlay
                            muted
                            loop
                            playsInline
                          />
                        </div>
                      </div>
                    ) : item.data.mimeType?.startsWith("image/") ? (
                      <div className="w-16 h-16">
                        <img
                          src={item.data.url}
                          alt={item.data.name}
                          className="w-full h-full object-cover rounded-lg"
                          draggable={false}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center">
                        <img
                          src="/apps/stellar/icns/system/_file.png"
                          alt={item.data.name}
                          className="w-[64px] h-[64px] object-contain"
                          draggable={false}
                        />
                      </div>
                    )}
                    <h3
                      className="text-[13px] font-semibold truncate max-w-[150px] text-[#626581ca] mt-1"
                      style={exemplarPro.style}
                    >
                      {item.data.name}
                    </h3>
                  </>
                )}
              </>
            )}
          </motion.div>
        ))}
      </div>

      {isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-[#ABC4C3]">Uploading...</div>
        </div>
      )}
    </div>
  );
};
