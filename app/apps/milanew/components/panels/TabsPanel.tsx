"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStyles } from "@/app/hooks/useStyles";
import { useLessonStore } from "../../store/lessonStore";
import { Plus, X, Edit2, Play, Download, Settings, Menu, ChevronLeft, ChevronRight } from "lucide-react";

const TabsPanel: React.FC = () => {
  const { getColor } = useStyles();
  const activeLesson = useLessonStore((state) => state.activeLesson);
  const activeTab = useLessonStore((state) => state.activeTab);
  const setActiveTab = useLessonStore((state) => state.setActiveTab);
  const lessons = useLessonStore((state) => state.lessons);
  const createCanvas = useLessonStore((state) => state.createCanvas);
  const deleteCanvas = useLessonStore((state) => state.deleteCanvas);
  const updateCanvas = useLessonStore((state) => state.updateCanvas);
  
  const [isRenamingTab, setIsRenamingTab] = useState<string | null>(null);
  const [newTabName, setNewTabName] = useState("");
  const [showTabOptions, setShowTabOptions] = useState<string | null>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  
  // Get current lesson
  const currentLesson = activeLesson ? lessons[activeLesson] : null;
  const canvases = currentLesson?.canvases || [];
  
  // Check if we can show the tab options menu for a specific tab
  const canShowOptions = (canvasId: string) => {
    // Don't allow deleting the last canvas
    if (canvases.length <= 1) return false;
    return true;
  };
  
  // Handle create new tab
  const handleCreateTab = () => {
    if (!activeLesson) return;
    
    const newName = `Page ${canvases.length + 1}`;
    const newCanvasId = createCanvas(activeLesson, newName);
    setActiveTab(newCanvasId);
  };
  
  // Handle tab click
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setShowTabOptions(null);
  };
  
  // Handle tab rename
  const handleRenameTab = (canvasId: string) => {
    setIsRenamingTab(canvasId);
    
    // Set initial value to current tab name
    const canvas = canvases.find((c) => c.id === canvasId);
    if (canvas) {
      setNewTabName(canvas.name);
    }
    
    // Focus input after a small delay to allow rendering
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 10);
    
    setShowTabOptions(null);
  };
  
  // Handle tab delete
  const handleDeleteTab = (canvasId: string) => {
    if (!activeLesson || canvases.length <= 1) return;
    
    deleteCanvas(activeLesson, canvasId);
    setShowTabOptions(null);
  };
  
  // Handle tab rename save
  const handleSaveRename = () => {
    if (!activeLesson || !isRenamingTab || !newTabName) return;
    
    updateCanvas(activeLesson, isRenamingTab, { name: newTabName });
    setIsRenamingTab(null);
    setNewTabName("");
  };
  
  // Handle tab options toggle
  const handleTabOptionsToggle = (e: React.MouseEvent, canvasId: string) => {
    e.stopPropagation();
    setShowTabOptions(showTabOptions === canvasId ? null : canvasId);
  };
  
  // Handle scroll left
  const handleScrollLeft = () => {
    if (!tabsContainerRef.current) return;
    
    tabsContainerRef.current.scrollBy({
      left: -200,
      behavior: "smooth",
    });
  };
  
  // Handle scroll right
  const handleScrollRight = () => {
    if (!tabsContainerRef.current) return;
    
    tabsContainerRef.current.scrollBy({
      left: 200,
      behavior: "smooth",
    });
  };
  
  // Update scroll buttons visibility based on scroll position
  const updateScrollButtons = () => {
    if (!tabsContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
    
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
    setShowScrollButtons(scrollWidth > clientWidth);
  };
  
  // Set up scroll event listeners
  useEffect(() => {
    const tabsContainer = tabsContainerRef.current;
    if (!tabsContainer) return;
    
    // Initialize scroll button state
    updateScrollButtons();
    
    // Add scroll event listener
    tabsContainer.addEventListener("scroll", updateScrollButtons);
    
    // Add resize observer to detect container size changes
    const resizeObserver = new ResizeObserver(updateScrollButtons);
    resizeObserver.observe(tabsContainer);
    
    return () => {
      tabsContainer.removeEventListener("scroll", updateScrollButtons);
      resizeObserver.disconnect();
    };
  }, []);
  
  // Update scroll buttons when tabs change
  useEffect(() => {
    updateScrollButtons();
  }, [canvases.length]);
  
  return (
    <div className="flex-1 flex items-center ml-8 relative">
      {/* Left scroll button */}
      {showScrollButtons && (
        <button
          className={`absolute left-0 z-10 h-8 w-6 flex items-center justify-center bg-black-thick rounded-l-md ${
            !canScrollLeft ? "opacity-30 cursor-not-allowed" : "hover:bg-black-med"
          }`}
          onClick={handleScrollLeft}
          disabled={!canScrollLeft}
        >
          <ChevronLeft size={16} color={getColor("latte-med")} />
        </button>
      )}
      
      {/* Tabs container */}
      <div
        ref={tabsContainerRef}
        className="flex-1 flex items-center overflow-x-auto scrollbar-hide"
        style={{ 
          paddingLeft: showScrollButtons ? "20px" : "0",
          paddingRight: showScrollButtons ? "20px" : "0",
        }}
      >
        {/* Render all tabs */}
        {canvases.map((canvas) => (
          <div
            key={canvas.id}
            className={`flex items-center h-8 px-3 mr-2 rounded-md cursor-pointer relative ${
              activeTab === canvas.id ? "bg-latte-thin" : "hover:bg-black-thick"
            }`}
            onClick={() => handleTabClick(canvas.id)}
          >
            {isRenamingTab === canvas.id ? (
              <input
                ref={inputRef}
                type="text"
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                onBlur={handleSaveRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveRename();
                  if (e.key === "Escape") {
                    setIsRenamingTab(null);
                    setNewTabName("");
                  }
                }}
                className="bg-transparent border-none outline-none text-sm w-32"
                style={{ color: getColor("latte") }}
                autoFocus
              />
            ) : (
              <>
                <span
                  className="text-sm mr-2"
                  style={{ color: getColor("latte") }}
                >
                  {canvas.name}
                </span>
                
                {/* Tab options button */}
                {canShowOptions(canvas.id) && (
                  <button
                    className="p-1 rounded-full hover:bg-black-med"
                    onClick={(e) => handleTabOptionsToggle(e, canvas.id)}
                  >
                    <Menu size={12} color={getColor("latte-thin")} />
                  </button>
                )}
                
                {/* Tab options menu */}
                {showTabOptions === canvas.id && (
                  <div
                    className="absolute right-0 top-full mt-1 bg-black-thick rounded-md shadow-lg z-20 py-1"
                    style={{ minWidth: "140px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="px-3 py-2 hover:bg-black-med flex items-center cursor-pointer"
                      onClick={() => handleRenameTab(canvas.id)}
                    >
                      <Edit2 size={14} className="mr-2" color={getColor("latte-med")} />
                      <span style={{ color: getColor("latte") }}>Rename</span>
                    </div>
                    <div
                      className="px-3 py-2 hover:bg-black-med flex items-center cursor-pointer"
                      onClick={() => {/* Duplicate action */}}
                    >
                      <Play size={14} className="mr-2" color={getColor("latte-med")} />
                      <span style={{ color: getColor("latte") }}>Preview</span>
                    </div>
                    <div
                      className="px-3 py-2 hover:bg-black-med flex items-center cursor-pointer"
                      onClick={() => {/* Download action */}}
                    >
                      <Download size={14} className="mr-2" color={getColor("latte-med")} />
                      <span style={{ color: getColor("latte") }}>Export</span>
                    </div>
                    <div className="border-t border-black-med my-1"></div>
                    <div
                      className="px-3 py-2 hover:bg-black-med flex items-center cursor-pointer text-red-500"
                      onClick={() => handleDeleteTab(canvas.id)}
                    >
                      <X size={14} className="mr-2" color="currentColor" />
                      <span>Delete</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        
        {/* Add new tab button */}
        <button
          className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-black-thick"
          onClick={handleCreateTab}
          title="Add new page"
        >
          <Plus size={18} color={getColor("latte-med")} />
        </button>
      </div>
      
      {/* Right scroll button */}
      {showScrollButtons && (
        <button
          className={`absolute right-0 z-10 h-8 w-6 flex items-center justify-center bg-black-thick rounded-r-md ${
            !canScrollRight ? "opacity-30 cursor-not-allowed" : "hover:bg-black-med"
          }`}
          onClick={handleScrollRight}
          disabled={!canScrollRight}
        >
          <ChevronRight size={16} color={getColor("latte-med")} />
        </button>
      )}
      
      {/* Action buttons */}
      <div className="ml-4 flex items-center space-x-2">
        <button
          className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-black-thick"
          title="Preview Lesson"
        >
          <Play size={18} color={getColor("latte-med")} />
        </button>
        <button
          className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-black-thick"
          title="Export"
        >
          <Download size={18} color={getColor("latte-med")} />
        </button>
        <button
          className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-black-thick"
          title="Settings"
        >
          <Settings size={18} color={getColor("latte-med")} />
        </button>
      </div>
    </div>
  );
};

export default TabsPanel;
