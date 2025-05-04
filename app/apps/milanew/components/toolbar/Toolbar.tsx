"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import {
  Type,
  Pencil,
  Square,
  Image,
  Play,
  Link as LinkIcon,
  ArrowRight,
  Palette,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Hand,
  Layers,
  Upload,
  Download,
  Settings,
  Trash,
  LayoutGrid,
  AlignCenter,
  Copy,
  Scissors,
  Edit2,
  Smile,
  FileText,
  FileImage,
  FileVideo,
  Youtube,
  Code,
  Database,
  GripVertical,
  Sparkles
} from "lucide-react";

import DrawingTools from "./DrawingTools";
import TextTools from "./TextTools";
import { useLessonStore } from "../../store/lessonStore";

const MainToolbar: React.FC = () => {
  const { getColor } = useStyles();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeToolType, setActiveToolType] = useState<string | null>(null);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [showTextTools, setShowTextTools] = useState(false);
  const [showCategory, setShowCategory] = useState<'main' | 'objects' | 'media' | 'tools' | 'edit'>('main');
  
  // Get selected items from the store
  const selectedItems = useLessonStore((state) => state.selectedItems);
  const hasSelection = selectedItems.length > 0;

  // Tool category maps
  const toolCategories = {
    main: [
      { icon: <Type size={24} color={getColor("latte-med")} />, label: "Text", toolType: "text" },
      { icon: <Edit3 size={24} color={getColor("latte-med")} />, label: "Handwriting", toolType: "handwriting" },
      { icon: <Pencil size={24} color={getColor("latte-med")} />, label: "Draw", toolType: "drawing" },
      { icon: <Square size={24} color={getColor("latte-med")} />, label: "Shape", toolType: "shape" },
      { icon: <ArrowRight size={24} color={getColor("latte-med")} />, label: "Connector", toolType: "connector" },
      { icon: <LayoutGrid size={24} color={getColor("latte-med")} />, label: "Grid", toolType: "grid" },
      { icon: <AlignCenter size={24} color={getColor("latte-med")} />, label: "Align", toolType: "align" },
      { icon: <Layers size={24} color={getColor("latte-med")} />, label: "Layers", toolType: "layers" },
    ],
    objects: [
      { icon: <Smile size={24} color={getColor("latte-med")} />, label: "Stickers", toolType: "stickers" },
      { icon: <FileText size={24} color={getColor("latte-med")} />, label: "Templates", toolType: "templates" },
      { icon: <Code size={24} color={getColor("latte-med")} />, label: "Code Block", toolType: "code" },
      { icon: <Database size={24} color={getColor("latte-med")} />, label: "Chart", toolType: "chart" },
      { icon: <Sparkles size={24} color={getColor("latte-med")} />, label: "AI Generate", toolType: "ai" },
    ],
    media: [
      { icon: <Image size={24} color={getColor("latte-med")} />, label: "Image", toolType: "image" },
      { icon: <Play size={24} color={getColor("latte-med")} />, label: "Video", toolType: "video" },
      { icon: <Youtube size={24} color={getColor("latte-med")} />, label: "YouTube", toolType: "youtube" },
      { icon: <FileImage size={24} color={getColor("latte-med")} />, label: "Gallery", toolType: "gallery" }, 
      { icon: <LinkIcon size={24} color={getColor("latte-med")} />, label: "Embed", toolType: "embed" },
    ],
    edit: [
      { icon: <Copy size={24} color={getColor("latte-med")} />, label: "Copy", toolType: "copy" },
      { icon: <Scissors size={24} color={getColor("latte-med")} />, label: "Cut", toolType: "cut" },
      { icon: <Edit2 size={24} color={getColor("latte-med")} />, label: "Rename", toolType: "rename" },
      { icon: <Trash size={24} color={getColor("latte-med")} />, label: "Delete", toolType: "delete" },
    ],
    tools: [
      { icon: <Hand size={24} color={getColor("latte-med")} />, label: "Hand Tool", toolType: "hand" },
      { icon: <Upload size={24} color={getColor("latte-med")} />, label: "Import", toolType: "import" },
      { icon: <Download size={24} color={getColor("latte-med")} />, label: "Export", toolType: "export" },
      { icon: <Palette size={24} color={getColor("latte-med")} />, label: "Theme", toolType: "theme" },
      { icon: <Settings size={24} color={getColor("latte-med")} />, label: "Settings", toolType: "settings" },
    ]
  };

  // Tool button component
  const ToolButton = ({
    icon,
    label,
    toolType,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    toolType: string;
    onClick?: () => void;
  }) => (
    <button
      className={`flex flex-col items-center justify-center mb-3 p-1 rounded-md transition-all ${
        activeToolType === toolType ? "bg-latte-thin" : "hover:bg-black-med"
      }`}
      onClick={() => {
        setActiveToolType(activeToolType === toolType ? null : toolType);
        if (onClick) onClick();
      }}
      title={label}
    >
      <div
        className="w-10 h-10 flex items-center justify-center rounded-md mb-1"
        style={{ 
          backgroundColor: getColor(activeToolType === toolType ? "latte-thin" : "black-med")
        }}
      >
        {icon}
      </div>
      {!isCollapsed && (
        <div
          className="text-xs"
          style={{
            color: getColor("smoke-thin"),
          }}
        >
          {label}
        </div>
      )}
    </button>
  );

  // Category button component
  const CategoryButton = ({
    icon,
    label,
    category,
  }: {
    icon: React.ReactNode;
    label: string;
    category: 'main' | 'objects' | 'media' | 'tools' | 'edit';
  }) => (
    <button
      className={`flex flex-col items-center justify-center p-1 rounded-md transition-all ${
        showCategory === category ? "bg-latte-thin" : "hover:bg-black-med"
      }`}
      onClick={() => setShowCategory(category)}
      title={label}
    >
      <div
        className="w-8 h-8 flex items-center justify-center rounded-md"
      >
        {icon}
      </div>
      {!isCollapsed && (
        <div
          className="text-xs"
          style={{
            color: getColor("smoke-thin"),
          }}
        >
          {label}
        </div>
      )}
    </button>
  );

  // Handle tool selection 
  const handleToolClick = (toolType: string) => {
    switch (toolType) {
      case "drawing":
      case "shape":
      case "connector":
        setShowDrawingTools(true);
        setShowTextTools(false);
        break;
      case "text":
      case "handwriting":
        setShowTextTools(true);
        setShowDrawingTools(false);
        break;
      case "delete":
        // Handle delete action for selected items
        if (hasSelection) {
          // Would call a delete function from the store here
        }
        setActiveToolType(null);
        break;
      default:
        setShowDrawingTools(false);
        setShowTextTools(false);
    }
  };

  return (
    <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 flex">
      {/* Category selector */}
      <motion.div
        className="py-4 px-2 rounded-l-md flex flex-col items-center"
        style={{
          backgroundColor: getColor("black-thick"),
          boxShadow: `0 4px 12px ${getColor("black-thin")}`,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <CategoryButton 
          icon={<Pencil size={20} color={getColor("latte-med")} />} 
          label="Draw" 
          category="main" 
        />
        <div className="my-2 border-t border-black-med w-8"></div>
        <CategoryButton 
          icon={<Square size={20} color={getColor("latte-med")} />} 
          label="Objects" 
          category="objects" 
        />
        <div className="my-2 border-t border-black-med w-8"></div>
        <CategoryButton 
          icon={<Image size={20} color={getColor("latte-med")} />} 
          label="Media" 
          category="media" 
        />
        <div className="my-2 border-t border-black-med w-8"></div>
        <CategoryButton 
          icon={<Edit2 size={20} color={getColor("latte-med")} />} 
          label="Edit" 
          category="edit" 
        />
        <div className="my-2 border-t border-black-med w-8"></div>
        <CategoryButton 
          icon={<Settings size={20} color={getColor("latte-med")} />} 
          label="Tools" 
          category="tools" 
        />
      </motion.div>

      {/* Main toolbar */}
      <motion.div
        className="p-4 rounded-r-md flex flex-col items-center"
        style={{
          backgroundColor: getColor("black-med"),
          boxShadow: `0 4px 12px ${getColor("black-thin")}`,
          width: isCollapsed ? "auto" : "85px"
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
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Drag handle to reposition toolbar */}
        <div 
          className="absolute top-2 left-2 cursor-move" 
          style={{ color: getColor("latte-thin") }}
          title="Drag to reposition toolbar"
        >
          <GripVertical size={16} />
        </div>

        {/* Tool buttons - show based on selected category */}
        <div className="mt-6 flex flex-col items-center">
          {toolCategories[showCategory].map((tool) => (
            <ToolButton
              key={tool.toolType}
              icon={tool.icon}
              label={tool.label}
              toolType={tool.toolType}
              onClick={() => handleToolClick(tool.toolType)}
            />
          ))}
        </div>
      </motion.div>

      {/* Secondary toolbars */}
      {showDrawingTools && (
        <DrawingTools 
          activeToolType={activeToolType} 
          onClose={() => setShowDrawingTools(false)} 
        />
      )}
      
      {showTextTools && (
        <TextTools 
          activeToolType={activeToolType} 
          onClose={() => setShowTextTools(false)} 
        />
      )}
    </div>
  );
};

export default MainToolbar;
