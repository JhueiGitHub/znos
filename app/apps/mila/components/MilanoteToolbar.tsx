// app/apps/milanote/components/MilanoteToolbar.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMilanoteStore } from "../store/milanoteStore";
import { useStyles } from "@/app/hooks/useStyles";
import {
  StickyNote,
  FolderPlus,
  Image,
  Link,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MilanoteToolbar: React.FC = () => {
  const { getColor, getFont } = useStyles();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const currentBoardId = useMilanoteStore((state) => state.currentBoardId);
  const addItem = useMilanoteStore((state) => state.addItem);

  // Function to create items on drop
  // Function to create items on drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const itemType = e.dataTransfer.getData("text/plain") || draggedItem;

    if (!itemType) {
      console.error("No item type found for drop");
      return;
    }

    console.log("Handling drop with item type:", itemType);

    // Get mouse position relative to the canvas
    const canvasEl = document.querySelector(".milanote-canvas");
    if (!canvasEl) {
      console.error("Canvas element not found");
      return;
    }

    // Reset cursor
    document.body.style.cursor = "default";

    const canvasRect = canvasEl.getBoundingClientRect();
    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    try {
      const canvasTransform = new DOMMatrix(
        window.getComputedStyle(canvasEl).transform
      );
      scale = canvasTransform.a || 1; // The scale from the transform matrix
      translateX = canvasTransform.e || 0; // The X translation
      translateY = canvasTransform.f || 0; // The Y translation
    } catch (err) {
      console.warn("Could not parse canvas transform:", err);
    }

    // Calculate the drop position in canvas coordinates
    // Add some offset to center the item under the cursor
    const x = (e.clientX - canvasRect.left - translateX) / scale - 50;
    const y = (e.clientY - canvasRect.top - translateY) / scale - 50;

    // Create the appropriate item based on draggedItem
    switch (draggedItem) {
      case "note":
        addItem(
          currentBoardId,
          "note",
          { x, y },
          {
            title: "New Note",
            text: "Double-click to edit this note.",
            color: "night-med",
          }
        );
        break;
      case "board":
        addItem(
          currentBoardId,
          "board",
          { x, y },
          {
            name: "New Board",
            color: "black-med",
          }
        );
        break;
      case "image":
        // For demo purposes, we're adding a placeholder note
        addItem(
          currentBoardId,
          "note",
          { x, y },
          {
            title: "Image Placeholder",
            text: "This would be an image upload component.",
            color: "night-med",
          }
        );
        break;
      case "link":
        // For demo purposes, we're adding a placeholder note
        addItem(
          currentBoardId,
          "note",
          { x, y },
          {
            title: "Link Placeholder",
            text: "This would be a link component.",
            color: "night-med",
          }
        );
        break;
    }

    setDraggedItem(null);
  };

  // Handle drag start
  // Handle drag start
  const handleDragStart = (type: string) => (e: React.DragEvent) => {
    setDraggedItem(type);

    // Create a visible ghost drag image
    const ghostImage = document.createElement("div");
    ghostImage.className = "milanote-drag-ghost";
    ghostImage.style.width = "100px";
    ghostImage.style.height = "100px";
    ghostImage.style.backgroundColor = getColor("latte-med");
    ghostImage.style.opacity = "0.6";
    ghostImage.style.borderRadius = "5px";
    ghostImage.style.position = "absolute";
    ghostImage.style.top = "-1000px"; // Position off-screen initially
    ghostImage.style.zIndex = "9999";
    ghostImage.textContent = type.charAt(0).toUpperCase() + type.slice(1); // Display the item type
    ghostImage.style.display = "flex";
    ghostImage.style.alignItems = "center";
    ghostImage.style.justifyContent = "center";
    ghostImage.style.color = "white";
    ghostImage.style.fontWeight = "bold";
    document.body.appendChild(ghostImage);

    // Use a custom drag image to make it more visible
    e.dataTransfer.setDragImage(ghostImage, 50, 50);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", type); // Set data to ensure drag works

    // Set cursor to grabbing
    document.body.style.cursor = "grabbing";

    console.log("Drag started with item type:", type);
  };

  // Handle drag over to show drop is allowed
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Add drag event listeners to canvas
  React.useEffect(() => {
    const canvas = document.querySelector(".milanote-canvas");
    if (!canvas) return;

    canvas.addEventListener("dragover", handleDragOver as any);
    canvas.addEventListener("drop", handleDrop as any);

    return () => {
      canvas.removeEventListener("dragover", handleDragOver as any);
      canvas.removeEventListener("drop", handleDrop as any);
    };
  }, [currentBoardId, draggedItem]);

  // Toolbar button component
  const ToolbarButton = ({
    icon,
    label,
    onClick,
    onDragStart,
  }: {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    onDragStart?: (e: React.DragEvent) => void;
  }) => (
    <div
      className="flex flex-col items-center justify-center mb-4 cursor-grab"
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
    >
      <div
        className="w-12 h-12 flex items-center justify-center rounded-md mb-1"
        style={{ backgroundColor: getColor("black-med") }}
      >
        {icon}
      </div>
      {!isCollapsed && (
        <div
          className="text-xs"
          style={{
            color: getColor("smoke-thin"),
            // fontFamily: getFont("Text Secondary"),
          }}
        >
          {label}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed left-[3px] top-1/2 transform -translate-y-1/2 z-50 mr-6">
      <motion.div
        className="p-4 rounded-md flex flex-col items-center"
        style={{
          backgroundColor: getColor("black-med"),
          boxShadow: `0 4px 12px ${getColor("black-thin")}`,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Collapse/expand toggle */}
        <button
          className="absolute top-2 right-2"
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ color: getColor("latte") }}
        >
          {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Tool buttons */}
        <ToolbarButton
          icon={<StickyNote size={24} color={getColor("latte-med")} />}
          label="Note"
          onDragStart={handleDragStart("note")}
        />
        <ToolbarButton
          icon={<FolderPlus size={24} color={getColor("latte-med")} />}
          label="Board"
          onDragStart={handleDragStart("board")}
        />
        <ToolbarButton
          icon={<Image size={24} color={getColor("latte-med")} />}
          label="Image"
          onDragStart={handleDragStart("image")}
        />
        <ToolbarButton
          icon={<Link size={24} color={getColor("latte-med")} />}
          label="Link"
          onDragStart={handleDragStart("link")}
        />
        <ToolbarButton
          icon={<Layers size={24} color={getColor("latte-med")} />}
          label="Layers"
        />
      </motion.div>
    </div>
  );
};

export default MilanoteToolbar;
