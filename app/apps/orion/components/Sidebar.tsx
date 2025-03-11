// app/apps/orion/components/Sidebar.tsx
"use client";

import React from "react";
import { useOrionStore } from "../lib/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  FolderIcon,
  ClipboardIcon,
  ImageIcon,
  LinkIcon,
  FileIcon,
  Trash2Icon,
  SettingsIcon,
} from "lucide-react";
import { useStyles } from "@/app/hooks/useStyles";

export function Sidebar() {
  const { getColor, getFont } = useStyles();
  const {
    isSidebarOpen,
    toggleSidebar,
    activeCanvasId,
    canvases,
    createCanvas,
    setActiveCanvas,
  } = useOrionStore();

  const handleCreateCanvas = () => {
    const name = `Canvas ${Object.keys(canvases).length + 1}`;
    createCanvas(name);
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          initial={{ x: -264 }}
          animate={{ x: 0 }}
          exit={{ x: -264 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed left-0 top-0 bottom-0 w-64 z-10 flex flex-col"
          style={{
            backgroundColor: getColor("Overlaying BG"),
            borderRight: `1px solid ${getColor("Brd")}`,
          }}
        >
          {/* Sidebar Header */}
          <div
            className="h-14 px-4 flex items-center border-b"
            style={{
              borderColor: getColor("Brd"),
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
            }}
          >
            <h2 className="text-lg font-semibold">Orion</h2>
          </div>

          {/* Canvas List */}
          <div className="flex-grow overflow-auto p-2">
            <div
              className="mb-2 px-2 py-1 text-xs font-semibold uppercase"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              My Canvases
            </div>

            <div className="space-y-1">
              {Object.values(canvases).map((canvas) => (
                <button
                  key={canvas.id}
                  className="w-full px-3 py-2 text-left rounded-md flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor:
                      activeCanvasId === canvas.id
                        ? getColor("black-thin")
                        : "transparent",
                    color: getColor("Text Primary (Hd)"),
                    fontFamily: getFont("Text Primary"),
                  }}
                  onClick={() => setActiveCanvas(canvas.id)}
                >
                  <FolderIcon size={16} />
                  <span>{canvas.name}</span>
                </button>
              ))}
            </div>

            <button
              className="w-full mt-2 px-3 py-2 rounded-md flex items-center gap-2 transition-colors"
              style={{
                backgroundColor: getColor("black-glass"),
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
              onClick={handleCreateCanvas}
            >
              <PlusIcon size={16} />
              <span>New Canvas</span>
            </button>
          </div>

          {/* Quick Access Tools */}
          <div
            className="p-2 border-t"
            style={{
              borderColor: getColor("Brd"),
              backgroundColor: getColor("black-glass"),
            }}
          >
            <div className="grid grid-cols-4 gap-1">
              <button
                className="p-2 flex flex-col items-center justify-center rounded transition-colors"
                style={{
                  backgroundColor: "transparent",
                  color: getColor("Text Primary (Hd)"),
                  fontFamily: getFont("Text Primary"),
                }}
              >
                <ClipboardIcon size={16} />
                <span className="text-xs mt-1">Note</span>
              </button>
              <button
                className="p-2 flex flex-col items-center justify-center rounded transition-colors"
                style={{
                  backgroundColor: "transparent",
                  color: getColor("Text Primary (Hd)"),
                  fontFamily: getFont("Text Primary"),
                }}
              >
                <ImageIcon size={16} />
                <span className="text-xs mt-1">Image</span>
              </button>
              <button
                className="p-2 flex flex-col items-center justify-center rounded transition-colors"
                style={{
                  backgroundColor: "transparent",
                  color: getColor("Text Primary (Hd)"),
                  fontFamily: getFont("Text Primary"),
                }}
              >
                <LinkIcon size={16} />
                <span className="text-xs mt-1">Link</span>
              </button>
              <button
                className="p-2 flex flex-col items-center justify-center rounded transition-colors"
                style={{
                  backgroundColor: "transparent",
                  color: getColor("Text Primary (Hd)"),
                  fontFamily: getFont("Text Primary"),
                }}
              >
                <FileIcon size={16} />
                <span className="text-xs mt-1">File</span>
              </button>
            </div>
          </div>

          {/* Settings */}
          <div
            className="p-3 flex justify-between"
            style={{
              borderTop: `1px solid ${getColor("Brd")}`,
              backgroundColor: getColor("black-med"),
            }}
          >
            <button
              className="p-2 rounded flex items-center justify-center"
              style={{
                backgroundColor: "transparent",
                color: getColor("Text Primary (Hd)"),
              }}
            >
              <Trash2Icon size={16} />
            </button>
            <button
              className="p-2 rounded flex items-center justify-center"
              style={{
                backgroundColor: "transparent",
                color: getColor("Text Primary (Hd)"),
              }}
            >
              <SettingsIcon size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
