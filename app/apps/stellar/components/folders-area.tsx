"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const exemplarPro = localFont({
  src: "../../../../public/fonts/SFProTextSemibold.ttf",
});

interface Position {
  x: number;
  y: number;
}

interface StellarFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  position: Position;
}

interface StellarFolder {
  id: string;
  name: string;
  children: StellarFolder[];
  files: StellarFile[];
  position: Position;
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

interface EditState {
  id: string | null;
  value: string;
}

// First, modify your FoldersArea.tsx to track folder paths and expose them to NavBar
interface FolderPath {
  id: string;
  name: string;
}

interface FoldersAreaProps {
  initialFolderId?: string;
  onPathChange?: (path: FolderPath[]) => void;
}

export const FoldersArea = ({
  initialFolderId,
  onPathChange,
}: FoldersAreaProps) => {
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

  // Effect to focus input when editing starts
  useEffect(() => {
    if (editState.id && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editState.id]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          currentFolderId
            ? `/api/stellar/folders/${currentFolderId}`
            : "/api/stellar/folders"
        );
        setProfile(response.data);

        // Update folder path
        if (response.data.folder) {
          const newPath = [
            { id: response.data.rootFolder.id, name: "Root" },
            ...response.data.folder.path.map((f: any) => ({
              id: f.id,
              name: f.name,
            })),
          ];
          setFolderPath(newPath);
          onPathChange?.(newPath);
        } else {
          setFolderPath([{ id: response.data.rootFolder.id, name: "Root" }]);
          onPathChange?.([{ id: response.data.rootFolder.id, name: "Root" }]);
        }

        if (response.data.folder || response.data.rootFolder) {
          const folder = response.data.folder || response.data.rootFolder;
          const canvasItems: CanvasItem[] = [
            ...folder.children.map((folder: StellarFolder) => ({
              id: folder.id,
              itemType: "folder",
              data: folder,
              position: folder.position || { x: 0, y: 0 },
            })),
            ...folder.files.map((file: StellarFile) => ({
              id: file.id,
              itemType: "file",
              data: file,
              position: file.position || { x: 0, y: 0 },
            })),
          ];
          setItems(canvasItems);
        }
      } catch (error) {
        console.error("Failed to fetch folders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
  }, [currentFolderId, onPathChange]);

  const handleDragEnd = useCallback(
    async (item: CanvasItem, position: Position) => {
      try {
        const endpoint =
          item.itemType === "file"
            ? `/api/stellar/files/${item.id}/position`
            : `/api/stellar/folders/${item.id}/position`;

        await axios.patch(endpoint, { position });

        setItems((prev) =>
          prev.map((prevItem) =>
            prevItem.id === item.id ? { ...prevItem, position } : prevItem
          )
        );
      } catch (error) {
        console.error("Failed to update position:", error);
      }
    },
    []
  );

  // File upload handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      setFileDropActive(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom ||
      e.clientX <= rect.left ||
      e.clientX >= rect.right
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
          folderId: profile?.rootFolder?.id,
          position: dropPosition,
        });

        setItems((prev) => [
          ...prev,
          {
            id: fileResponse.data.id,
            itemType: "file",
            data: fileResponse.data,
            position: dropPosition,
          },
        ]);
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [profile?.rootFolder?.id]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setFileDropActive(false);

      const dropPosition = {
        x: e.clientX - e.currentTarget.getBoundingClientRect().left,
        y: e.clientY - e.currentTarget.getBoundingClientRect().top,
      };

      const { files } = e.dataTransfer;
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
      setNavigationStack((prev) => [...prev, currentFolderId as string]);
      setCurrentFolderId(folderId);
    },
    [currentFolderId]
  );

  const handleBack = useCallback(() => {
    const previousFolder = navigationStack[navigationStack.length - 1];
    setNavigationStack((prev) => prev.slice(0, -1));
    setCurrentFolderId(previousFolder);
  }, [navigationStack]);

  const handleDoubleClick = useCallback(
    (item: CanvasItem, e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
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
        const response = await axios.patch(`/api/stellar/folders/${item.id}`, {
          name: newName,
        });

        setItems((prev) =>
          prev.map((prevItem) =>
            prevItem.id === item.id
              ? { ...prevItem, data: { ...prevItem.data, name: newName } }
              : prevItem
          )
        );
      } catch (error) {
        console.error("Failed to rename folder:", error);
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
    (e: React.KeyboardEvent<HTMLInputElement>, item: CanvasItem) => {
      if (e.key === "Enter") {
        if (editState.value.trim() && editState.value !== item.data.name) {
          handleRename(item, editState.value);
        } else {
          setEditState({ id: null, value: "" });
        }
      } else if (e.key === "Escape") {
        setEditState({ id: null, value: "" });
      }
    },
    [editState.value, handleRename]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4 h-full p-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="relative h-full flex-1 overflow-hidden bg-[#010203]/30"
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
            animate={{ x: item.position.x, y: item.position.y }}
            onDragEnd={(_, info) => {
              const finalPosition = {
                x: item.position.x + info.offset.x,
                y: item.position.y + info.offset.y,
              };
              handleDragEnd(item, finalPosition);
            }}
            onDoubleClick={(e) => handleDoubleClick(item, e)}
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
                    onChange={(e) =>
                      setEditState({ ...editState, value: e.target.value })
                    }
                    onBlur={() => handleInputBlur(item)}
                    onKeyDown={(e) => handleInputKeyDown(e, item)}
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
                {(item.data as StellarFile).mimeType?.startsWith("video/") ? (
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="w-full h-12">
                      <video
                        src={(item.data as StellarFile).url}
                        className="w-full h-full object-cover rounded-[9px]"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    </div>
                  </div>
                ) : (item.data as StellarFile).mimeType?.startsWith(
                    "image/"
                  ) ? (
                  <div className="w-16 h-16">
                    <img
                      src={(item.data as StellarFile).url}
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
