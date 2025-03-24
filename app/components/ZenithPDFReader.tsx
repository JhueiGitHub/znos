// Enhanced PDF Reader with smooth page turns & proper gestures
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Bookmark,
  Text,
  Menu,
  X,
} from "lucide-react";
import { useStyles } from "@/app/hooks/useStyles";
import * as pdfjs from "pdfjs-dist";
import localFont from "next/font/local";

const exemplarPro = localFont({
  src: "../../public/fonts/ExemplarPro.otf",
});

// Define types for better type safety
interface ZenithPDFReaderProps {
  onClose: () => void;
  initialPage?: number;
}

interface Annotation {
  id: string;
  page: number;
  content: string;
  x: number;
  y: number;
  color: string;
}

interface PDFPageProxy {
  getViewport: (options: { scale: number }) => {
    width: number;
    height: number;
  };
  render: (options: any) => { promise: Promise<void> };
}

// Create a component for the page turn effect
// Replace the existing PageTurn component with this enhanced version
const PageTurn: React.FC<{
  currentPage: number;
  direction: "left" | "right" | null;
  onAnimationComplete: () => void;
  children: React.ReactNode;
}> = ({ currentPage, direction, onAnimationComplete, children }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (direction) {
      // Create a realistic 3D page flip animation
      controls
        .start({
          // Rotate around Y axis for a 3D flip effect
          rotateY: direction === "right" ? -80 : 80,
          // Scale down slightly during flip
          scale: 0.9,
          // Move slightly to side for more realistic effect
          x: direction === "right" ? "-10%" : "10%",
          // Fade out during rotation
          opacity: 0,
          // Custom 3D perspective configuration
          transition: {
            duration: 0.4,
            ease: [0.645, 0.045, 0.355, 1.0], // Cubic bezier for realistic paper physics
            opacity: { duration: 0.3 },
          },
        })
        .then(onAnimationComplete);
    } else {
      // Reset position with a subtle entrance animation
      controls.start({
        rotateY: 0,
        scale: 1,
        x: 0,
        opacity: 1,
        transition: { duration: 0.3, ease: "easeOut" },
      });
    }
  }, [direction, controls, onAnimationComplete]);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      style={{ perspective: "1200px" }} // Add perspective to parent for 3D effect
    >
      <motion.div
        key={`page-${currentPage}`}
        initial={{
          rotateY: direction === "right" ? 80 : -80,
          opacity: 0,
          scale: 0.9,
        }}
        animate={controls}
        style={{
          transformStyle: "preserve-3d",
          transformOrigin:
            direction === "right" ? "left center" : "right center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const ZenithPDFReader: React.FC<ZenithPDFReaderProps> = ({
  onClose,
  initialPage = 1,
}) => {
  const { getColor } = useStyles();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [targetPage, setTargetPage] = useState<number | null>(null);
  const [pageDirection, setPageDirection] = useState<"left" | "right" | null>(
    null
  );
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1.0);

  // Refs for elements and state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<any>(null);

  // Gesture tracking refs
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    isTracking: false,
    threshold: 20, // LOWER threshold for lighter swipes
    velocityThreshold: 0.1, // Velocity threshold for gesture detection
    lastTime: 0,
    lastX: 0,
    velocity: 0,
  });

  // Audio for page turn
  const pageTurnAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on component mount
  useEffect(() => {
    // Create audio element
    pageTurnAudioRef.current = new Audio("/sounds/page-turn.mp3");

    // Cleanup on unmount
    return () => {
      if (pageTurnAudioRef.current) {
        pageTurnAudioRef.current.pause();
        pageTurnAudioRef.current = null;
      }
    };
  }, []);

  // Play page turn sound with velocity-based volume
  const playPageTurnSound = (velocity: number = 0.5) => {
    if (pageTurnAudioRef.current) {
      // Set volume based on velocity (0.3-1.0 range)
      const volume = Math.min(1.0, Math.max(0.3, velocity));
      pageTurnAudioRef.current.volume = volume;

      // Reset and play
      pageTurnAudioRef.current.currentTime = 0;
      pageTurnAudioRef.current.play().catch((err) => {
        // Silently handle autoplay restrictions
        console.log("Audio play prevented:", err);
      });
    }
  };

  // Handle page turn animation completion
  const handleAnimationComplete = () => {
    if (targetPage !== null) {
      setCurrentPage(targetPage);
      setTargetPage(null);
      setPageDirection(null);
    }
  };

  // Calculate optimal scale based on container size
  const calculateOptimalScale = async () => {
    if (!containerRef.current || !pdfRef.current) return;

    try {
      const container = containerRef.current;
      // Account for padding and margins
      const availableHeight = container.clientHeight - 40;
      const availableWidth = container.clientWidth - 40;

      // Get current page dimensions
      const page = await pdfRef.current.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.0 });

      // Calculate scale to fit height and width
      const scaleHeight = availableHeight / viewport.height;
      const scaleWidth = availableWidth / viewport.width;

      // Use the smaller scale to ensure entire page is visible
      const optimalScale = Math.min(scaleHeight, scaleWidth);

      // Set scale with a max limit to avoid too large rendering
      setScale(Math.min(optimalScale, 1.4));
    } catch (error) {
      console.error("Error calculating scale:", error);
    }
  };

  // Load PDF document once on mount
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setIsLoading(true);

        // Load PDF document
        const loadingTask = pdfjs.getDocument("/apps/48/48.pdf");
        const pdf = await loadingTask.promise;
        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);

        // Calculate initial scale
        await calculateOptimalScale();

        // Render initial page
        renderPage(currentPage);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setIsLoading(false);
      }
    };

    loadPDF();

    // Setup resize handler
    const handleResize = () => {
      calculateOptimalScale();
      renderPage(currentPage);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Render PDF page with calculated scale
  const renderPage = async (pageNum: number) => {
    if (!pdfRef.current || !canvasRef.current) return;

    try {
      setIsLoading(true);

      // Get the page
      const page = await pdfRef.current.getPage(pageNum);

      // Get the canvas context
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set up viewport with current scale
      const viewport = page.getViewport({ scale: scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      setIsLoading(false);
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
      setIsLoading(false);
    }
  };

  // Re-render page when currentPage or scale changes
  useEffect(() => {
    renderPage(currentPage);

    // Save to localStorage
    localStorage.setItem("pdfReaderCurrentPage", currentPage.toString());
  }, [currentPage, scale]);

  // Advanced page turning with animation
  const turnPage = (direction: "prev" | "next", velocity: number = 0.5) => {
    if (targetPage !== null) return; // Don't interrupt ongoing animation

    const nextPage = direction === "next" ? currentPage + 1 : currentPage - 1;

    // Check if page is valid
    if (nextPage < 1 || nextPage > totalPages) return;

    // Set animation direction
    const animDirection = direction === "next" ? "right" : "left";

    // Play sound with velocity-based volume
    playPageTurnSound(velocity);

    // Set target page and direction to trigger animation
    setTargetPage(nextPage);
    setPageDirection(animDirection);
  };

  // Improved gesture handling for trackpad swipes
  const handleGestureStart = (clientX: number, clientY: number) => {
    if (gestureRef.current.isTracking) return;

    gestureRef.current = {
      ...gestureRef.current,
      startX: clientX,
      startY: clientY,
      isTracking: true,
      lastTime: Date.now(),
      lastX: clientX,
      velocity: 0,
    };
  };

  // Update the gesture handler for more subtle interactions
  const handleGestureMove = (clientX: number, clientY: number) => {
    if (!gestureRef.current.isTracking) return;

    // Calculate velocity
    const now = Date.now();
    const elapsed = now - gestureRef.current.lastTime;

    if (elapsed > 0) {
      const deltaX = clientX - gestureRef.current.lastX;
      gestureRef.current.velocity = Math.abs(deltaX) / elapsed;
      gestureRef.current.lastX = clientX;
      gestureRef.current.lastTime = now;
    }

    // Calculate horizontal delta
    const deltaX = clientX - gestureRef.current.startX;
    const deltaY = clientY - gestureRef.current.startY;

    // MUCH lower threshold for activation (10px instead of 20px)
    if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      // Check if velocity exceeds lower threshold for faster response (0.05 instead of 0.1)
      if (gestureRef.current.velocity > 0.05) {
        // Determine direction
        const direction = deltaX < 0 ? "next" : "prev";

        // Turn page with velocity factor
        turnPage(direction, Math.min(0.8, gestureRef.current.velocity * 2));

        // Reset tracking
        gestureRef.current.isTracking = false;
      }
    }
  };

  const handleGestureEnd = (clientX: number, clientY: number) => {
    if (!gestureRef.current.isTracking) return;

    // Calculate final deltas
    const deltaX = clientX - gestureRef.current.startX;

    // Check if swipe distance exceeds threshold
    if (Math.abs(deltaX) > gestureRef.current.threshold * 2) {
      // Determine direction
      const direction = deltaX < 0 ? "next" : "prev";

      // Get final velocity (default to moderate if too low)
      const velocity = Math.max(0.3, gestureRef.current.velocity);

      // Turn page
      turnPage(direction, velocity);
    }

    // Reset tracking
    gestureRef.current.isTracking = false;
  };

  // Unified event handlers for mouse, touch, and wheel events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleGestureStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleGestureMove(e.clientX, e.clientY);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    handleGestureEnd(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleGestureStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleGestureMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1) {
      handleGestureEnd(
        e.changedTouches[0].clientX,
        e.changedTouches[0].clientY
      );
    }
  };

  // Specialized handler for trackpad gestures
  // Updated wheel handler for more subtle trackpad gestures
  const handleWheel = (e: React.WheelEvent) => {
    // Lower threshold for trackpad detection (3px instead of 5px)
    if (Math.abs(e.deltaX) > 3 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();

      // More sensitive detection for quicker swipes (15px instead of 20px)
      const isQuickSwipe = Math.abs(e.deltaX) > 15;

      if (isQuickSwipe) {
        const direction = e.deltaX > 0 ? "next" : "prev";

        // Scale velocity more gently (0.2-0.8 range instead of 0.3-1.0)
        const velocity = 0.2 + Math.min(0.6, Math.abs(e.deltaX) / 100);

        turnPage(direction, velocity);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        turnPage("next", 0.5);
      } else if (e.key === "ArrowLeft") {
        turnPage("prev", 0.5);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Toggle bookmarks
  const toggleBookmark = () => {
    setBookmarks((prev: number[]) =>
      prev.includes(currentPage)
        ? prev.filter((p) => p !== currentPage)
        : [...prev, currentPage]
    );
  };

  // Main component render
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/30 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div
        className="h-14 border-b flex items-center justify-between px-6"
        style={{
          borderColor: getColor("Brd"),
          backgroundColor: getColor("Glass"),
          fontFamily: "var(--font-exemplar)",
        }}
      >
        <div className="flex items-center gap-4">
          <BookOpen size={20} color={getColor("latte")} />
          <h1
            className="text-xl font-medium text-[#4C4F69]"
            style={exemplarPro.style}
          >
            48 Laws of Power
          </h1>
          {bookmarks.includes(currentPage) && (
            <Bookmark size={16} className="text-yellow-300/90" />
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setShowSidebar(!showSidebar)}
            style={{ color: getColor("latte") }}
          >
            <Menu size={18} />
          </button>
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={onClose}
            style={{ color: getColor("latte") }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main content with multi-gesture handlers */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full border-r overflow-y-auto"
              style={{
                backgroundColor: getColor("Black"),
                borderColor: getColor("Brd"),
              }}
            >
              <div className="p-4">
                <h3
                  className="font-medium mb-4"
                  style={{ color: getColor("latte") }}
                >
                  Contents
                </h3>

                <div className="space-y-3">
                  {/* Laws list */}
                  {Array.from({ length: 48 }, (_, i) => i + 1).map(
                    (lawNumber) => (
                      <div
                        key={lawNumber}
                        className="py-1 cursor-pointer hover:opacity-80"
                        onClick={() => {
                          // Determine direction for animation
                          const direction =
                            lawNumber > currentPage ? "right" : "left";
                          setTargetPage(lawNumber);
                          setPageDirection(direction as "left" | "right");
                          playPageTurnSound(0.5);
                        }}
                        style={{
                          color:
                            currentPage === lawNumber
                              ? "#4C4F69"
                              : getColor("latte"),
                          fontWeight:
                            currentPage === lawNumber ? "bold" : "normal",
                        }}
                      >
                        <div className="flex justify-between">
                          <span>Law {lawNumber}</span>
                          <span>{lawNumber}</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PDF View with all gesture handlers */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center relative bg-black/50 overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {/* Page Turn Animation */}
          <PageTurn
            currentPage={currentPage}
            direction={pageDirection}
            onAnimationComplete={handleAnimationComplete}
          >
            <canvas
              ref={canvasRef}
              className="rounded-md"
              style={{
                // Add a subtle page edge effect
                boxShadow:
                  "2px 0 15px rgba(0,0,0,0.2), 0 0 1px rgba(0,0,0,0.3)",
                // Add subtle page texture
                background:
                  "linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0) 8%, rgba(255,255,255,0))",
                borderRadius: "2px",
              }}
            />

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-10 h-10 border-4 border-t-white border-opacity-50 rounded-full animate-spin"></div>
              </div>
            )}

            {/* Annotation markers */}
            {annotations
              .filter((a) => a.page === currentPage)
              .map((annotation) => (
                <div
                  key={annotation.id}
                  className="absolute w-6 h-6 rounded-full bg-opacity-80 flex items-center justify-center cursor-pointer"
                  style={{
                    left: `${annotation.x}%`,
                    top: `${annotation.y}%`,
                    backgroundColor: "#4C4F69",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <Text size={14} color="#fff" />
                </div>
              ))}
          </PageTurn>

          {/* Gesture hint overlays with improved visuals */}
          <div
            className="absolute left-0 top-0 bottom-0 w-16 opacity-0 hover:opacity-100 transition-opacity"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.15), transparent)",
            }}
          >
            <motion.div
              className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/40 opacity-40"
              initial={false}
              whileHover={{ scale: 1.2, opacity: 0.8 }}
            >
              <ChevronLeft size={24} />
            </motion.div>
          </div>

          <div
            className="absolute right-0 top-0 bottom-0 w-16 opacity-0 hover:opacity-100 transition-opacity"
            style={{
              background:
                "linear-gradient(to left, rgba(0,0,0,0.15), transparent)",
            }}
          >
            <motion.div
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white/40 opacity-40"
              initial={false}
              whileHover={{ scale: 1.2, opacity: 0.8 }}
            >
              <ChevronRight size={24} />
            </motion.div>
          </div>

          {/* Navigation buttons */}
          <motion.button
            className="absolute left-6 top-1/2 transform -translate-y-1/2 p-3 rounded-full"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: getColor("Glass"),
              color: getColor("latte"),
              opacity: currentPage > 1 ? 1 : 0.5,
            }}
            onClick={() => turnPage("prev")}
            disabled={currentPage <= 1}
          >
            <ChevronLeft size={24} />
          </motion.button>

          <motion.button
            className="absolute right-6 top-1/2 transform -translate-y-1/2 p-3 rounded-full"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: getColor("Glass"),
              color: getColor("latte"),
              opacity: currentPage < totalPages ? 1 : 0.5,
            }}
            onClick={() => turnPage("next")}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      <div
        className="h-14 border-t flex items-center justify-between px-6"
        style={{
          borderColor: getColor("Brd"),
          backgroundColor: getColor("Glass"),
        }}
      >
        <div
          className="flex items-center gap-3"
          style={{ color: getColor("latte") }}
        >
          <span>
            Page {currentPage} of {totalPages || 476}
          </span>

          <span
            className="ml-4 font-medium"
            style={{
              color: "#4C4F69",
              fontFamily: "var(--font-exemplar)",
            }}
          >
            {currentPage <= 48 ? `Law ${currentPage}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleBookmark}
            style={{
              color: bookmarks.includes(currentPage)
                ? "#FFD700"
                : getColor("latte"),
            }}
          >
            <Bookmark size={18} />
          </motion.button>

          <motion.button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddingNote(!isAddingNote)}
            style={{
              color: isAddingNote ? "#4C4F69" : getColor("latte"),
            }}
          >
            <Text size={18} />
          </motion.button>
        </div>
      </div>

      {/* Hidden audio element for page turns */}
      <audio id="pageTurnAudio" src="/sounds/page-turn.mp3" preload="auto" />
    </motion.div>
  );
};

export default ZenithPDFReader;
