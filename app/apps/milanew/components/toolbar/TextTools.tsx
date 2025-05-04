"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
  Type,
  Heading1,
  Heading2,
  ListOrdered,
  ListCheck,
  Highlighter,
  TextQuote,
  SquareCode,
  Pilcrow,
  Sparkles
} from "lucide-react";

interface TextToolsProps {
  activeToolType: string | null;
  onClose: () => void;
}

const TextTools: React.FC<TextToolsProps> = ({ activeToolType, onClose }) => {
  const { getColor } = useStyles();
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("'Roboto', sans-serif");
  const [textColor, setTextColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [textStyle, setTextStyle] = useState({
    isBold: false,
    isItalic: false,
    isUnderlined: false,
  });
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [textType, setTextType] = useState<"paragraph" | "heading1" | "heading2" | "list" | "checklist" | "code" | "quote">("paragraph");
  const [presetSettings, setPresetSettings] = useState<"default" | "highlight" | "key-concept" | "definition" | "example">("default");

  // Show handwriting fonts if handwriting tool is active
  const isHandwritingTool = activeToolType === "handwriting";

  // Apply text preset
  const applyPreset = (preset: "default" | "highlight" | "key-concept" | "definition" | "example") => {
    setPresetSettings(preset);
    
    switch (preset) {
      case "highlight":
        setTextColor("#ffffff");
        setBackgroundColor("#7047EB"); // Purple highlight
        setTextStyle({ ...textStyle, isBold: true });
        break;
      case "key-concept":
        setFontSize(24);
        setTextColor("#42A5F5"); // Blue for key concepts
        setBackgroundColor("transparent");
        setTextStyle({ ...textStyle, isBold: true });
        setTextAlign("center");
        break;
      case "definition":
        setTextColor("#ffffff");
        setBackgroundColor("#2C2C3A"); // Darker background for definitions
        setTextStyle({ ...textStyle, isItalic: true });
        break;
      case "example":
        setTextColor("#66BB6A"); // Green for examples
        setBackgroundColor("transparent");
        setTextStyle({ ...textStyle, isItalic: true });
        break;
      default:
        setTextColor("#ffffff");
        setBackgroundColor("transparent");
        setTextStyle({ isBold: false, isItalic: false, isUnderlined: false });
        setTextAlign("left");
    }
  };

  // Color palette options with teaching-friendly colors
  const colorOptions = [
    "#ffffff", // white
    "#66BB6A", // green - for positive/correct concepts
    "#42A5F5", // blue - for definitions
    "#FFA726", // orange - for caution/important
    "#EF5350", // red - for incorrect/warning
    "#AB47BC", // purple - for creative/innovative 
    "#FFEE58", // yellow - for highlighting
    "#26A69A", // teal - for steps/processes
  ];

  // Background colors
  const bgColorOptions = [
    "transparent",
    "#2C2C3A", // dark slate - for definitions
    "#7047EB30", // light purple - for highlights
    "#26A69A30", // light teal - for examples
    "#42A5F530", // light blue - for facts
    "#FFA72630", // light orange - for warnings
    "#66BB6A30", // light green - for success
    "#EF535030", // light red - for errors
  ];

  // Font options - regular and handwriting
  const fontOptions = isHandwritingTool
    ? [
        { name: "Caveat", value: "'Caveat', cursive" },
        { name: "Dancing Script", value: "'Dancing Script', cursive" },
        { name: "Satisfy", value: "'Satisfy', cursive" },
        { name: "Indie Flower", value: "'Indie Flower', cursive" },
        { name: "Kalam", value: "'Kalam', cursive" },
        { name: "Architects Daughter", value: "'Architects Daughter', cursive" },
        { name: "Homemade Apple", value: "'Homemade Apple', cursive" },
        { name: "Just Me Again Down Here", value: "'Just Me Again Down Here', cursive" },
      ]
    : [
        { name: "Roboto", value: "'Roboto', sans-serif" },
        { name: "Inter", value: "'Inter', sans-serif" },
        { name: "Poppins", value: "'Poppins', sans-serif" },
        { name: "Work Sans", value: "'Work Sans', sans-serif" },
        { name: "Source Code Pro", value: "'Source Code Pro', monospace" },
        { name: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
        { name: "Merriweather", value: "'Merriweather', serif" },
        { name: "Montserrat", value: "'Montserrat', sans-serif" },
      ];

  return (
    <motion.div
      className="ml-2 p-4 rounded-md max-h-[80vh] overflow-y-auto"
      style={{
        backgroundColor: getColor("black-med"),
        boxShadow: `0 4px 12px ${getColor("black-thin")}`,
        width: "280px",
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Close button */}
      <button
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black-thick"
        onClick={onClose}
        title="Close"
      >
        <X size={16} color={getColor("latte")} />
      </button>

      {/* Text presets - only show for normal text, not handwriting */}
      {!isHandwritingTool && (
        <div className="mb-4">
          <div 
            className="text-sm mb-2"
            style={{ color: getColor("latte") }}
          >
            Teaching Presets
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`p-2 rounded-md transition-all ${
                presetSettings === "default" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => applyPreset("default")}
              title="Default Text"
            >
              <Type size={20} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                presetSettings === "highlight" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => applyPreset("highlight")}
              title="Highlight"
            >
              <Highlighter size={20} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                presetSettings === "key-concept" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => applyPreset("key-concept")}
              title="Key Concept"
            >
              <Sparkles size={20} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                presetSettings === "definition" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => applyPreset("definition")}
              title="Definition"
            >
              <TextQuote size={20} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                presetSettings === "example" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => applyPreset("example")}
              title="Example"
            >
              <Pilcrow size={20} color={getColor("latte-med")} />
            </button>
          </div>
        </div>
      )}
      
      {/* Text type selector - only show for normal text, not handwriting */}
      {!isHandwritingTool && (
        <div className="mb-4">
          <div 
            className="text-sm mb-2"
            style={{ color: getColor("latte") }}
          >
            Text Type
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`p-2 rounded-md transition-all ${
                textType === "paragraph" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setTextType("paragraph")}
              title="Paragraph"
            >
              <Type size={20} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                textType === "heading1" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setTextType("heading1")}
              title="Heading 1"
            >
              <Heading1 size={20} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                textType === "heading2" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setTextType("heading2")}
              title="Heading 2"
            >
              <Heading2 size={20} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                textType === "list" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setTextType("list")}
              title="Numbered List"
            >
              <ListOrdered size={20} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                textType === "checklist" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setTextType("checklist")}
              title="Checklist"
            >
              <ListCheck size={20} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                textType === "code" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setTextType("code")}
              title="Code Block"
            >
              <SquareCode size={20} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                textType === "quote" ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setTextType("quote")}
              title="Quote"
            >
              <TextQuote size={20} color={getColor("latte-med")} />
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div 
          className="text-sm mb-2"
          style={{ color: getColor("latte") }}
        >
          Font
        </div>
        <select
          className="w-full p-2 rounded-md text-sm"
          style={{ 
            backgroundColor: getColor("black-thick"),
            color: getColor("latte"),
            border: `1px solid ${getColor("black-thin")}`,
          }}
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          {fontOptions.map((font) => (
            <option key={font.value} value={font.value}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <div 
          className="text-sm mb-2"
          style={{ color: getColor("latte") }}
        >
          Font Size
        </div>
        <div className="flex items-center">
          <input
            type="range"
            min="10"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full"
          />
          <span 
            className="ml-2 text-sm"
            style={{ color: getColor("latte") }}
          >
            {fontSize}px
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div 
          className="text-sm mb-2"
          style={{ color: getColor("latte") }}
        >
          Text Color
        </div>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-md ${
                textColor === color ? "ring-2 ring-latte" : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setTextColor(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div 
          className="text-sm mb-2"
          style={{ color: getColor("latte") }}
        >
          Background Color
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={`w-8 h-8 rounded-md border border-latte ${
              backgroundColor === "transparent" ? "ring-2 ring-latte" : ""
            }`}
            style={{ 
              backgroundColor: "transparent", 
              backgroundImage: "linear-gradient(45deg, #555 25%, transparent 25%, transparent 75%, #555 75%, #555), linear-gradient(45deg, #555 25%, transparent 25%, transparent 75%, #555 75%, #555)",
              backgroundSize: "6px 6px",
              backgroundPosition: "0 0, 3px 3px"
            }}
            onClick={() => setBackgroundColor("transparent")}
            title="Transparent"
          />
          {bgColorOptions.slice(1).map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-md ${
                backgroundColor === color ? "ring-2 ring-latte" : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setBackgroundColor(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      {!isHandwritingTool && (
        <div className="mb-4">
          <div 
            className="text-sm mb-2"
            style={{ color: getColor("latte") }}
          >
            Style
          </div>
          <div className="flex gap-2">
            <button
              className={`p-2 rounded-md transition-all ${
                textStyle.isBold ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setTextStyle({...textStyle, isBold: !textStyle.isBold})}
              title="Bold"
            >
              <Bold size={20} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                textStyle.isItalic ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setTextStyle({...textStyle, isItalic: !textStyle.isItalic})}
              title="Italic"
            >
              <Italic size={20} color={getColor("latte-med")} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${
                textStyle.isUnderlined ? "bg-latte-thin" : "hover:bg-black-med"
              }`}
              onClick={() => setTextStyle({...textStyle, isUnderlined: !textStyle.isUnderlined})}
              title="Underline"
            >
              <Underline size={20} color={getColor("latte-med")} />
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div 
          className="text-sm mb-2"
          style={{ color: getColor("latte") }}
        >
          Alignment
        </div>
        <div className="flex gap-2">
          <button
            className={`p-2 rounded-md transition-all ${
              textAlign === "left" ? "bg-latte-thin" : "hover:bg-black-med"
            }`}
            onClick={() => setTextAlign("left")}
            title="Align Left"
          >
            <AlignLeft size={20} color={getColor("latte-med")} />
          </button>
          <button
            className={`p-2 rounded-md transition-all ${
              textAlign === "center" ? "bg-latte-thin" : "hover:bg-black-med"
            }`}
            onClick={() => setTextAlign("center")}
            title="Align Center"
          >
            <AlignCenter size={20} color={getColor("latte-med")} />
          </button>
          <button
            className={`p-2 rounded-md transition-all ${
              textAlign === "right" ? "bg-latte-thin" : "hover:bg-black-med"
            }`}
            onClick={() => setTextAlign("right")}
            title="Align Right"
          >
            <AlignRight size={20} color={getColor("latte-med")} />
          </button>
        </div>
      </div>

      {/* Preview section */}
      <div className="mb-4">
        <div 
          className="text-sm mb-2"
          style={{ color: getColor("latte") }}
        >
          Preview
        </div>
        <div 
          className="p-3 rounded-md h-20 flex items-center justify-center"
          style={{ 
            backgroundColor: getColor("black-thick"),
            fontFamily: fontFamily,
            fontSize: `${fontSize}px`,
            fontWeight: textStyle.isBold ? 'bold' : 'normal',
            fontStyle: textStyle.isItalic ? 'italic' : 'normal',
            textDecoration: textStyle.isUnderlined ? 'underline' : 'none',
            textAlign: textAlign,
            color: textColor,
            backgroundColor: backgroundColor === 'transparent' ? getColor("black-thick") : backgroundColor,
          }}
        >
          {activeToolType === "handwriting" ? "Handwritten Text" : "Your Text Here"}
        </div>
      </div>
    </motion.div>
  );
};

export default TextTools;
