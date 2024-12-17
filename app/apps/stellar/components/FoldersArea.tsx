import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useGrid, defaultGridConfig } from "../hooks/useGrid";
import { useDrag } from "../contexts/drag-context";
import { useFolder } from "../contexts/folder-context";
import { ChevronLeft } from "lucide-react";
import localFont from "next/font/local";

// Import the font
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
  position: Position;
  children: StellarFolder[];
  files: StellarFile[];
}

export interface CanvasItem {
  id: string;
  itemType: "folder" | "file";
  data: StellarFile | StellarFolder;
  position: Position;
}

interface EditState {
  id: string | null;
  value: string;
}

// Update the constants
const MAX_NAME_WIDTH = 117; // Updated max width to 210px
const LINE_HEIGHT = 16; // Line height in pixels
const MAX_LINES = 3;

export function FoldersArea() {
  // Local state only
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [navigationStack, setNavigationStack] = useState<string[]>([]);

  // Context state
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

  const [editState, setEditState] = useState<EditState>({
    id: null,
    value: "",
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // Simple load folders without any guards or refs
  const loadFolders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        currentFolderId
          ? `/api/stellar/folders/${currentFolderId}`
          : "/api/stellar/folders"
      );

      const folderData = currentFolderId
        ? response.data.folder
        : response.data.rootFolder;

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

      const mappedItems: CanvasItem[] = [
        ...folderData.children.map((folderItem: any) => ({
          id: folderItem.id,
          itemType: "folder" as const,
          data: folderItem,
          position:
            folderItem.position ||
            findNextAvailablePosition(
              folderData.children
                .filter((i: any) => i.position)
                .map((i: any) => i.position)
            ),
        })),
        ...folderData.files.map((fileItem: any) => ({
          id: fileItem.id,
          itemType: "file" as const,
          data: fileItem,
          position: fileItem.position || { x: 0, y: 0 },
        })),
      ];

      setItems(mappedItems);
    } catch (error) {
      console.error("Failed to load folders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId, findNextAvailablePosition, setFolderPath]);

  useEffect(() => {
    loadFolders();
  }, [currentFolderId]);

  const handleFolderOpen = useCallback(
    (folderId: string) => {
      if (currentFolderId) {
        setNavigationStack((prev) => [...prev, currentFolderId]);
      }
      setCurrentFolder(folderId);
    },
    [currentFolderId, setCurrentFolder]
  );

  const handleBack = useCallback(() => {
    const previousFolder = navigationStack[navigationStack.length - 1];
    setNavigationStack((prev) => prev.slice(0, -1));
    setCurrentFolder(previousFolder || null);
  }, [navigationStack, setCurrentFolder]);

  const handleDragEnd = useCallback(
    async (item: CanvasItem, position: Position) => {
      try {
        const endpoint =
          item.itemType === "file"
            ? `/api/stellar/files/${item.id}/position`
            : `/api/stellar/folders/${item.id}/position`;

        await axios.patch(endpoint, { position });

        setItems((prevItems) =>
          prevItems.map((prevItem) =>
            prevItem.id === item.id ? { ...prevItem, position } : prevItem
          )
        );
      } catch (error) {
        console.error("Failed to update position:", error);
      }
    },
    []
  );

  // Add rename handlers
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

  const handleRename = useCallback(
    async (item: CanvasItem, newName: string) => {
      try {
        const endpoint =
          item.itemType === "folder"
            ? `/api/stellar/folders/${item.id}`
            : `/api/stellar/files/${item.id}`;

        await axios.patch(endpoint, { name: newName });

        setItems((prevItems) =>
          prevItems.map((prevItem) =>
            prevItem.id === item.id
              ? {
                  ...prevItem,
                  data: { ...prevItem.data, name: newName },
                }
              : prevItem
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
    (event: React.KeyboardEvent<HTMLTextAreaElement>, item: CanvasItem) => {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent new line in textarea
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

  const adjustTextAreaHeight = useCallback(() => {
    if (inputRef.current) {
      // Create a hidden span to measure text width
      const measureSpan = document.createElement("span");
      measureSpan.style.font = window.getComputedStyle(inputRef.current).font;
      measureSpan.style.visibility = "hidden";
      measureSpan.style.position = "absolute";
      measureSpan.style.whiteSpace = "pre";
      measureSpan.textContent =
        inputRef.current.value || inputRef.current.placeholder || "M";
      document.body.appendChild(measureSpan);

      // Calculate width based on content
      const textWidth = measureSpan.offsetWidth;
      const inputWidth = Math.min(Math.max(textWidth + 16, 30), MAX_NAME_WIDTH);

      // Clean up measurement span
      document.body.removeChild(measureSpan);

      // Reset textarea styles to properly measure content height
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, LINE_HEIGHT * MAX_LINES)}px`;

      // Update input and container widths
      if (inputContainerRef.current) {
        inputContainerRef.current.style.width = `${inputWidth}px`;
        inputContainerRef.current.style.marginLeft = `${-inputWidth / 2}px`;
      }
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditState((prev) => ({ ...prev, value: e.target.value }));
      adjustTextAreaHeight();
    },
    [adjustTextAreaHeight]
  );

  useEffect(() => {
    if (editState.id && inputRef.current) {
      adjustTextAreaHeight();
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editState.id, adjustTextAreaHeight]);

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
    <div className="relative w-full h-full flex-1 bg-[#00000030]">
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
              zIndex: 999999,
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
              if (isOverSidebar && item.itemType === "folder") {
                // If over sidebar, IMMEDIATELY prevent any position update
                // and snap back to original position
                setItems((prevItems) =>
                  prevItems.map((prevItem) =>
                    prevItem.id === item.id
                      ? {
                          ...prevItem,
                          animate: false,
                          position: dragStartPosition!,
                        }
                      : prevItem
                  )
                );
              } else {
                // Only proceed with normal drag end if NOT over sidebar
                const finalPosition = {
                  x: item.position.x + info.offset.x,
                  y: item.position.y + info.offset.y,
                };
                handleDragEnd(item, finalPosition);
              }

              // Clean up all drag state
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
                      onKeyDown={(e) => handleInputKeyDown(e, item)}
                      className="resize-none overflow-hidden text-[13px] font-semibold bg-transparent text-[#626581ca] outline-none text-center"
                      style={{
                        ...exemplarPro.style,
                        border: "0.6px solid rgba(255, 255, 255, 0.09)",
                        padding: "1px 4px",
                        borderRadius: "3px",
                        lineHeight: `${LINE_HEIGHT}px`,
                        width: "100%",
                        height: "auto", // Let height be determined by content
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
                <div className="w-16 h-16 rounded-xl flex items-center justify-center">
                  <img
                    src="/apps/stellar/icns/system/_file.png"
                    alt={item.data.name}
                    className="w-[64px] h-[64px] object-contain"
                    draggable={false}
                  />
                </div>
                <h3
                  className="text-[13px] font-semibold truncate max-w-[150px] text-[#626581ca] mt-1 px-1"
                  style={exemplarPro.style}
                >
                  {item.data.name}
                </h3>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
