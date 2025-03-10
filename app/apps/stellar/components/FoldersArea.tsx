// components/FoldersArea.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useGrid, defaultGridConfig } from "../hooks/useGrid";
import { useDrag } from "../contexts/drag-context";
import { useFolder } from "../contexts/folder-context";
import { useStellarState } from "../contexts/stellar-state-context";
import { ChevronLeft } from "lucide-react";
import {
  Grid2X2Icon,
  ListIcon,
  ArrowUpDownIcon,
  SortAscIcon,
  SortDescIcon,
  ClockIcon,
} from "lucide-react";
import localFont from "next/font/local";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSidebarDrag } from "../hooks/useSidebarDrag";
import { useDropZone } from "../hooks/useDropZone";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderCreatedEvent,
  FOLDER_CREATED_EVENT,
} from "./ui/keyboard-listener";

// Import exemplar font
const exemplarPro = localFont({
  src: "../../../../public/fonts/SFProTextSemibold.ttf",
});

// Type definitions
interface Position {
  x: number;
  y: number;
}

interface StellarProfile {
  id: string;
  name: string;
  driveCapacity: bigint;
  currentUsage: number;
  rootFolder: StellarFolder;
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

// Constants
const MAX_NAME_WIDTH = 117;
const LINE_HEIGHT = 16;
const MAX_LINES = 3;

export function FoldersArea() {
  // Query client for cache management
  const queryClient = useQueryClient();

  // Local state management
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [fileDropActive, setFileDropActive] = useState(false);
  const [profile, setProfile] = useState<StellarProfile | null>(null);
  const [editState, setEditState] = useState<EditState>({
    id: null,
    value: "",
  });

  // Get the persistent state from StellarState
  const { state, setViewMode, setSortBy, setSortDirection } = useStellarState();

  // Context management
  const { currentFolderId, setCurrentFolder, setFolderPath } = useFolder();
  const { findNextAvailablePosition } = useGrid(defaultGridConfig);
  const {
    setIsDraggingFolder,
    setDraggedFolderId,
    setPointerPosition,
    isOverSidebar,
    dragStartPosition,
    setDragStartPosition,
  } = useDrag();

  const {
    handleSidebarDrop,
  }: { handleSidebarDrop: (folderId: string) => Promise<void> } =
    useSidebarDrag({
      onSidebarDragStart: () => {
        console.log("Started dragging towards sidebar");
      },
    });

  // References for text input management
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // Improved query with proper error handling and enabled state
  const {
    data: folderData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["folder", currentFolderId],
    queryFn: async () => {
      try {
        const response = await axios.get(
          currentFolderId
            ? `/api/stellar/folders/${currentFolderId}`
            : "/api/stellar/folders"
        );

        const folderData = currentFolderId
          ? response.data.folder
          : response.data.rootFolder;

        // Handle path updates
        if (response.data.folder) {
          const newPath =
            response.data.folder.path?.map((folder: any) => ({
              id: folder.id,
              name: folder.name,
            })) || [];

          if (newPath.length > 0 && newPath[0].name !== "Root") {
            newPath.unshift({ id: response.data.rootFolder.id, name: "Root" });
          }
          setFolderPath(newPath);
        } else {
          setFolderPath([]);
        }

        return {
          items: [
            ...(folderData.children || []).map((folderItem: any) => ({
              id: folderItem.id,
              itemType: "folder" as const,
              data: { ...folderItem, itemType: "folder" },
              position: folderItem.position || findNextAvailablePosition([]),
            })),
            ...(folderData.files || []).map((fileItem: any) => ({
              id: fileItem.id,
              itemType: "file" as const,
              data: { ...fileItem, itemType: "file" },
              position: fileItem.position || { x: 0, y: 0 },
            })),
          ],
          rawData: folderData,
        };
      } catch (err) {
        console.error("Error fetching folder data:", err);
        throw err;
      }
    },
    enabled: true, // Always enabled
    retry: 2, // Retry failed requests twice
    staleTime: 2000, // Consider data fresh for 2 seconds
    refetchOnWindowFocus: true,
  });

  // Position mutation with optimistic updates
  const positionMutation = useMutation({
    mutationFn: async ({
      item,
      position,
    }: {
      item: CanvasItem;
      position: Position;
    }) => {
      const endpoint =
        item.itemType === "file"
          ? `/api/stellar/files/${item.id}/position`
          : `/api/stellar/folders/${item.id}/position`;

      await axios.patch(endpoint, { position });
      return { item, position };
    },
    onMutate: async ({ item, position }) => {
      await queryClient.cancelQueries({
        queryKey: ["folder", currentFolderId],
      });
      const previousData = queryClient.getQueryData([
        "folder",
        currentFolderId,
      ]);

      queryClient.setQueryData(["folder", currentFolderId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((i: CanvasItem) =>
            i.id === item.id ? { ...i, position } : i
          ),
        };
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["folder", currentFolderId],
          context.previousData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["folder", currentFolderId] });
    },
  });

  // Rename mutation with optimistic updates
  const renameMutation = useMutation({
    mutationFn: async ({
      item,
      newName,
    }: {
      item: CanvasItem;
      newName: string;
    }) => {
      const endpoint =
        item.itemType === "folder"
          ? `/api/stellar/folders/${item.id}`
          : `/api/stellar/files/${item.id}`;

      await axios.patch(endpoint, { name: newName });
      return { item, newName };
    },
    onMutate: async ({ item, newName }) => {
      await queryClient.cancelQueries({
        queryKey: ["folder", currentFolderId],
      });
      const previousData = queryClient.getQueryData([
        "folder",
        currentFolderId,
      ]);

      queryClient.setQueryData(["folder", currentFolderId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((i: CanvasItem) =>
            i.id === item.id ? { ...i, data: { ...i.data, name: newName } } : i
          ),
        };
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["folder", currentFolderId],
          context.previousData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["folder", currentFolderId] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-folders"] });
    },
  });

  // Navigation handlers
  const handleFolderOpen = useCallback(
    (folderId: string) => {
      if (currentFolderId) {
        setNavigationStack((previousStack) => [
          ...previousStack,
          currentFolderId,
        ]);
      }
      setCurrentFolder(folderId);
    },
    [currentFolderId, setCurrentFolder]
  );

  const handleFilesDrop = useCallback(
    async (files: FileList, position: { x: number; y: number }) => {
      for (const file of Array.from(files)) {
        try {
          setIsUploading(true);
          const formData = new FormData();
          formData.append("file", file);
          formData.append("UPLOADCARE_PUB_KEY", "f23d206ae7780b1a0d26");

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
            position: position,
          });

          queryClient.invalidateQueries({
            queryKey: ["folder", currentFolderId],
          });
        } catch (error) {
          console.error("Upload error:", error);
        }
      }
      setIsUploading(false);
    },
    [currentFolderId, profile?.rootFolder?.id, queryClient]
  );

  const { isDragActive, dragHandlers } = useDropZone({
    onDrop: handleFilesDrop,
  });

  const handleBack = useCallback(() => {
    const previousFolder = navigationStack[navigationStack.length - 1];
    setNavigationStack((previousStack) => previousStack.slice(0, -1));
    setCurrentFolder(previousFolder || null);
  }, [navigationStack, setCurrentFolder]);

  // Drag handlers
  const handleDragEnd = useCallback(
    async (item: CanvasItem, position: Position) => {
      // CRUCIAL: Don't mutate position if dropping on sidebar
      if (!isOverSidebar) {
        positionMutation.mutate({ item, position });
      }
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
    [isOverSidebar, positionMutation]
  );

  // Rename handlers
  const handleRename = useCallback(
    async (item: CanvasItem, newName: string) => {
      if (newName.trim() && newName !== item.data.name) {
        renameMutation.mutate({ item, newName });
      }
      setEditState({ id: null, value: "" });
    },
    [renameMutation]
  );

  const handleDoubleClick = useCallback(
    (item: CanvasItem, event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName.toLowerCase() === "h3") {
        setEditState({ id: item.id, value: item.data.name });
        setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        }, 0);
      } else if (item.itemType === "folder") {
        handleFolderOpen(item.id);
      }
    },
    [handleFolderOpen]
  );

  // Enhanced drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setFileDropActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX <= rect.left ||
      e.clientX >= rect.right ||
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom
    ) {
      setFileDropActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setFileDropActive(true);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setFileDropActive(false);
    const dropPosition = {
      x: e.clientX - e.currentTarget.getBoundingClientRect().left,
      y: e.clientY - e.currentTarget.getBoundingClientRect().top,
    };
    handleFilesDrop(e.dataTransfer.files, dropPosition);
  };

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
    (event: React.KeyboardEvent<HTMLTextAreaElement>, item: CanvasItem) => {
      if (event.key === "Enter") {
        event.preventDefault();
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

  // Text area height adjustment
  const adjustTextAreaHeight = useCallback(() => {
    if (inputRef.current) {
      const measureSpan = document.createElement("span");
      measureSpan.style.font = window.getComputedStyle(inputRef.current).font;
      measureSpan.style.visibility = "hidden";
      measureSpan.style.position = "absolute";
      measureSpan.style.whiteSpace = "pre";
      measureSpan.textContent =
        inputRef.current.value || inputRef.current.placeholder || "M";
      document.body.appendChild(measureSpan);

      const textWidth = measureSpan.offsetWidth;
      const inputWidth = Math.min(Math.max(textWidth + 16, 30), MAX_NAME_WIDTH);

      document.body.removeChild(measureSpan);

      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, LINE_HEIGHT * MAX_LINES)}px`;

      if (inputContainerRef.current) {
        inputContainerRef.current.style.width = `${inputWidth}px`;
        inputContainerRef.current.style.marginLeft = `${-inputWidth / 2}px`;
      }
    }
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditState((previousState) => ({
        ...previousState,
        value: event.target.value,
      }));
      adjustTextAreaHeight();
    },
    [adjustTextAreaHeight]
  );

  // Input focus effect
  useEffect(() => {
    if (editState.id && inputRef.current) {
      adjustTextAreaHeight();
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editState.id, adjustTextAreaHeight]);

  // Folder creation event subscription
  useEffect(() => {
    const handleFolderCreated = (
      event: CustomEvent<FolderCreatedEvent["detail"]>
    ) => {
      queryClient.invalidateQueries({ queryKey: ["folder", currentFolderId] });

      // Update recent folders in state
      if (event.detail && event.detail.name) {
        // Our StellarState now tracks this automatically when using setCurrentFolder
      }
    };

    window.addEventListener(
      FOLDER_CREATED_EVENT,
      handleFolderCreated as EventListener
    );
    return () => {
      window.removeEventListener(
        FOLDER_CREATED_EVENT,
        handleFolderCreated as EventListener
      );
    };
  }, [currentFolderId, queryClient]);

  // Get and sort folder items
  const getSortedItems = () => {
    if (!folderData?.items) return [];

    return [...folderData.items].sort((a, b) => {
      // First separate folders and files if that's the preference
      if (state.sortBy === "type") {
        if (a.itemType === "folder" && b.itemType === "file") return -1;
        if (a.itemType === "file" && b.itemType === "folder") return 1;
      }

      // Then sort by the selected criteria
      if (state.sortBy === "name") {
        return state.sortDirection === "asc"
          ? a.data.name.localeCompare(b.data.name)
          : b.data.name.localeCompare(a.data.name);
      } else if (state.sortBy === "date") {
        // Assuming items have createdAt or updatedAt properties
        const aDate = a.data.updatedAt || a.data.createdAt || new Date();
        const bDate = b.data.updatedAt || b.data.createdAt || new Date();
        return state.sortDirection === "asc"
          ? new Date(aDate).getTime() - new Date(bDate).getTime()
          : new Date(bDate).getTime() - new Date(aDate).getTime();
      }

      // Default - don't change order
      return 0;
    });
  };

  // Enhanced error UI
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">
          Error loading folder contents. Please try again.
        </div>
      </div>
    );
  }

  // Loading state with proper skeleton UI
  if (isLoading || !folderData) {
    return (
      <div className="h-full w-full grid grid-cols-4 gap-4 p-4 bg-black/30">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // The sorted items to display
  const sortedItems = getSortedItems();

  return (
    <div className="flex flex-col h-full">
      {/* Main Content Area - Switch between views based on state */}
      {state.viewMode === "list" ? (
        // List View
        <div
          className="flex-1 p-2 overflow-auto"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <AnimatePresence>
            {fileDropActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-[#4C4F69]/20 border-2 border-dashed border-[#4C4F69]/40 rounded-lg pointer-events-none"
              >
                <div className="flex items-center justify-center h-full">
                  <span className="text-[#4C4F69] text-lg">
                    Drop files to upload
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List header */}
          <div className="flex items-center px-4 py-2 border-b border-[#29292981] text-xs text-[#cccccc60] font-medium">
            <div className="flex-1">Name</div>
            <div className="w-24 text-right">Size</div>
            <div className="w-32 text-right">Type</div>
            <div className="w-32 text-right">Modified</div>
          </div>

          {sortedItems.length > 0 ? (
            <div className="space-y-1 mt-1">
              {sortedItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center px-4 py-2 rounded-md hover:bg-[#01020340] transition-colors cursor-pointer"
                  onDoubleClick={() => {
                    if (item.itemType === "folder") {
                      handleFolderOpen(item.id);
                    }
                  }}
                >
                  <div className="flex-1 flex items-center">
                    {item.itemType === "folder" ? (
                      <img
                        src="/apps/stellar/icns/system/_folder.png"
                        alt=""
                        className="w-5 h-5 mr-2"
                        draggable={false}
                      />
                    ) : (
                      <img
                        src="/apps/stellar/icns/system/_file.png"
                        alt=""
                        className="w-5 h-5 mr-2"
                        draggable={false}
                      />
                    )}
                    <span
                      className="text-sm text-[#cccccc90] truncate"
                      style={exemplarPro.style}
                    >
                      {item.data.name}
                    </span>
                  </div>
                  <div className="w-24 text-right text-xs text-[#cccccc70]">
                    {item.itemType === "file" && isStellarFile(item.data)
                      ? formatFileSize(item.data.size)
                      : "--"}
                  </div>
                  <div className="w-32 text-right text-xs text-[#cccccc70]">
                    {item.itemType === "folder"
                      ? "Folder"
                      : (isStellarFile(item.data) && item.data.mimeType) ||
                        "File"}
                  </div>
                  <div className="w-32 text-right text-xs text-[#cccccc70]">
                    {formatDate(item.data.updatedAt || item.data.createdAt)}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-[#cccccc60]">
                This folder is empty
              </div>
            </div>
          )}

          {isUploading && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="text-[#ABC4C3]">Uploading...</div>
            </div>
          )}
        </div>
      ) : (
        // Canvas View
        <div
          className="relative flex-1 overflow-hidden bg-[#010203]/30"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <AnimatePresence>
            {fileDropActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
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
            {sortedItems.map((item) => (
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
                  zIndex: editState.id === item.id ? 1000 : 1,
                }}
                onDragStart={() => {
                  if (item.itemType === "folder") {
                    setIsDraggingFolder(true);
                    setDraggedFolderId(item.id);
                    setDragStartPosition(item.position);
                  }
                }}
                onDrag={(_, info) => {
                  if (item.itemType === "folder") {
                    setPointerPosition({ x: info.point.x, y: info.point.y });
                  }
                }}
                onDragEnd={(_, info) => {
                  if (
                    isOverSidebar &&
                    item.itemType === "folder" &&
                    dragStartPosition
                  ) {
                    // Optimistically update UI back to original position
                    queryClient.setQueryData(
                      ["folder", currentFolderId],
                      (oldData: any) => ({
                        ...oldData,
                        items: oldData.items.map((i: CanvasItem) =>
                          i.id === item.id
                            ? { ...i, position: dragStartPosition }
                            : i
                        ),
                      })
                    );

                    // Handle sidebar operation
                    handleSidebarDrop(item.id);
                  } else {
                    const finalPosition = {
                      x: item.position.x + info.offset.x,
                      y: item.position.y + info.offset.y,
                    };
                    handleDragEnd(item, finalPosition);
                  }

                  // Clean up drag state
                  setIsDraggingFolder(false);
                  setDraggedFolderId(null);
                  setPointerPosition(null);
                  setDragStartPosition(null);
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
                      <div
                        ref={inputContainerRef}
                        className="absolute mt-[68px] left-1/2 flex items-center justify-center"
                        style={{
                          maxWidth: `${MAX_NAME_WIDTH}px`,
                        }}
                      >
                        <textarea
                          ref={inputRef}
                          value={editState.value}
                          onChange={handleInputChange}
                          onBlur={() => handleInputBlur(item)}
                          onKeyDown={(event) => handleInputKeyDown(event, item)}
                          className="resize-none overflow-hidden text-[13px] font-semibold bg-transparent text-[#626581ca] outline-none text-center"
                          style={{
                            ...exemplarPro.style,
                            border: "0.6px solid rgba(255, 255, 255, 0.09)",
                            padding: "1px 4px",
                            borderRadius: "3px",
                            lineHeight: `${LINE_HEIGHT}px`,
                            width: "100%",
                            height: "auto",
                            maxWidth: `${MAX_NAME_WIDTH}px`,
                          }}
                          maxLength={255}
                          rows={1}
                        />
                      </div>
                    ) : (
                      <h3
                        className="text-[13px] font-semibold text-[#626581ca] mt-1 px-1 text-center break-all"
                        style={{
                          ...exemplarPro.style,
                          display: "-webkit-box",
                          WebkitLineClamp: MAX_LINES.toString(),
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          maxWidth: `${MAX_NAME_WIDTH}px`,
                          lineHeight: `${LINE_HEIGHT}px`,
                          minWidth: "30px",
                          width: "fit-content",
                          maxHeight: `${LINE_HEIGHT * MAX_LINES}px`,
                        }}
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
      )}
    </div>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Helper function to format date
function formatDate(dateString: string | undefined): string {
  if (!dateString) return "--";

  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
