import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, AlertCircle } from "lucide-react";
interface PDFReaderProps {
  onClose: () => void;
  initialPage?: number;
  pdfUrl?: string;
}

const PDFReader: React.FC<PDFReaderProps> = ({ 
  onClose, 
  initialPage = 1,
  pdfUrl = "/root/public/apps/48/48.pdf"
}) => {
  // Local state instead of context
  const [currentPage, setCurrentPage] = useState(initialPage);
  const totalPages = 480; // Estimated total for "48 Laws of Power"
  
  const [isPrevHovered, setIsPrevHovered] = useState(false);
  const [isNextHovered, setIsNextHovered] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [thumbnailRange, setThumbnailRange] = useState<[number, number]>([1, 10]);
  const [pageInput, setPageInput] = useState('');
  const [showPageInput, setShowPageInput] = useState(false);
  const [isTurningPage, setIsTurningPage] = useState(false);
  const [turnDirection, setTurnDirection] = useState<'left' | 'right'>('right');
  const [isPDFLoaded, setIsPDFLoaded] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);
  
  // Create a preloaded images array for smoother transitions
  const [preloadedImages, setPreloadedImages] = useState<string[]>([]);

  // Save current page to localStorage
  useEffect(() => {
    localStorage.setItem("pdfReaderCurrentPage", currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    // Preload current page and next/previous pages
    const pagesToPreload = [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2
    ].filter(page => page > 0 && page <= totalPages);
    
    const uniquePages = [...new Set(pagesToPreload)];
    const imageUrls = uniquePages.map(page => `/root/public/apps/48/pages/page-${page}.jpg`);
    
    setPreloadedImages(imageUrls);
    
    // Actually preload the images
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, [currentPage, totalPages]);

  // Navigation functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reference to the iframe
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Function to navigate to specific page in iframe
  const navigateToPage = (pageNum: number) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        // Update the iframe src with the page parameter
        iframeRef.current.src = `/apps/48/48.pdf#page=${pageNum}`;
        setCurrentPage(pageNum);
      } catch (error) {
        console.error("Error navigating to page:", error);
      }
    } else {
      // Fallback if iframe isn't ready
      setCurrentPage(pageNum);
    }
  };

  // Custom page turn with visual effect
  const handlePageTurn = (direction: 'next' | 'prev') => {
    setIsTurningPage(true);
    setTurnDirection(direction === 'next' ? 'right' : 'left');
    
    // Delay the actual page change for the animation
    setTimeout(() => {
      if (direction === 'next') {
        navigateToPage(Math.min(currentPage + 1, totalPages));
      } else {
        navigateToPage(Math.max(currentPage - 1, 1));
      }
      
      // Reset the animation state
      setTimeout(() => {
        setIsTurningPage(false);
      }, 150);
    }, 150);
  };
  
  // Use effect to handle keyboard navigation with our new navigation function
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        handlePageTurn('prev');
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        handlePageTurn('next');
      } else if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Home") {
        navigateToPage(1);
      } else if (e.key === "End") {
        navigateToPage(totalPages);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Navigate with swipe gestures
  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    let startX: number;
    let startY: number;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const diffX = startX - e.changedTouches[0].clientX;
      const diffY = startY - e.changedTouches[0].clientY;
      
      // Check if horizontal swipe is more significant than vertical
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) {
          // Swipe left - go to next page
          handlePageTurn('next');
        } else if (diffX < -50) {
          // Swipe right - go to previous page
          handlePageTurn('prev');
        }
      }
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <>
      {/* Backdrop overlay */}
      <motion.div
        className="fixed inset-0 z-[9998] backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      />

      {/* Main PDF reader container */}
      <motion.div
        ref={mainRef}
        className="fixed flex items-center justify-center z-[9999]"
        initial={{ opacity: 0, scale: 0.9, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25,
          mass: 0.8 
        }}
        style={{ 
          width: "80vw", 
          height: "80vh", 
          top: "10vh", 
          left: "10vw",
          backgroundColor: "rgba(0, 0, 0, 0.72)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 0, 0, 0.3) inset",
          overflow: "hidden"
        }}
      >
        {/* Close button */}
        <motion.button 
          className="absolute top-4 right-4 z-10 rounded-full p-2 bg-black/30 text-white/80 hover:bg-black/50 hover:text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
        >
          <X size={24} />
        </motion.button>

        {/* Page navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 rounded-lg px-4 py-2 text-white/80 flex items-center gap-3">
          <button 
            className="mr-2 p-1 rounded hover:bg-white/10 transition-colors"
            onClick={() => setShowThumbnails(!showThumbnails)}
          >
            {showThumbnails ? "Hide" : "Show"} Thumbnails
          </button>
          
          <div className="flex items-center cursor-pointer" onClick={() => setShowPageInput(!showPageInput)}>
            {showPageInput ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const pageNum = parseInt(pageInput);
                  if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                    goToPage(pageNum);
                    setShowPageInput(false);
                    setPageInput('');
                  }
                }}
                className="flex items-center"
              >
                <input 
                  type="text" 
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  autoFocus
                  className="w-12 bg-transparent border-b border-white/50 text-center outline-none"
                />
                <span className="ml-1">/ {totalPages}</span>
                <button type="submit" className="hidden">Go</button>
              </form>
            ) : (
              <span>Page {currentPage} of {totalPages}</span>
            )}
          </div>
          
          {/* Law title display */}
          <div className="ml-4 font-medium">
            {/* This would ideally be dynamically pulled from a data source */}
            <span className="text-yellow-300/90">Law {currentPage <= 48 ? currentPage : '—'}</span>
          </div>
        </div>
        
        {/* Thumbnail navigation */}
        <AnimatePresence>
          {showThumbnails && (
            <motion.div 
              className="absolute bottom-16 left-0 right-0 mx-auto w-[90%] bg-black/60 rounded-lg p-3 backdrop-blur-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-2">
                <button 
                  onClick={() => {
                    if (thumbnailRange[0] > 1) {
                      const newStart = Math.max(1, thumbnailRange[0] - 10);
                      setThumbnailRange([newStart, newStart + 9]);
                    }
                  }}
                  disabled={thumbnailRange[0] <= 1}
                  className="p-1 rounded-full bg-black/30 disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-white/70">Pages {thumbnailRange[0]}-{Math.min(thumbnailRange[1], totalPages)}</span>
                <button 
                  onClick={() => {
                    if (thumbnailRange[1] < totalPages) {
                      const newStart = thumbnailRange[1] + 1;
                      setThumbnailRange([newStart, newStart + 9]);
                    }
                  }}
                  disabled={thumbnailRange[1] >= totalPages}
                  className="p-1 rounded-full bg-black/30 disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="flex overflow-x-auto gap-2 py-2">
                {Array.from({ length: Math.min(10, totalPages - thumbnailRange[0] + 1) }, (_, i) => {
                  const pageNum = thumbnailRange[0] + i;
                  return (
                    <motion.div 
                      key={`thumb-${pageNum}`}
                      className={`cursor-pointer flex-shrink-0 rounded overflow-hidden border-2 ${currentPage === pageNum ? 'border-white' : 'border-transparent'}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigateToPage(pageNum)}
                    >
                      <div className="w-20 h-28 relative bg-white/10 flex items-center justify-center">
                        <img 
                          src={`/root/public/apps/48/pages/page-${pageNum}.jpg`}
                          alt={`Thumbnail ${pageNum}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const imgEl = e.target as HTMLImageElement;
                            imgEl.style.display = 'none';
                          }}
                        />
                        <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs bg-black/50 px-1 rounded">
                          {pageNum}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PDF Content */}
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Previous page button */}
          <motion.button
            className="absolute left-4 z-10 rounded-full p-3 bg-black/30 text-white/80"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(0, 0, 0, 0.5)", color: "rgba(255, 255, 255, 1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePageTurn('prev')}
            disabled={currentPage <= 1 || isTurningPage}
            onHoverStart={() => setIsPrevHovered(true)}
            onHoverEnd={() => setIsPrevHovered(false)}
            style={{ opacity: currentPage <= 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={28} />
          </motion.button>

          {/* PDF page display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`page-${currentPage}`}
              initial={{ 
                opacity: 0, 
                x: turnDirection === 'left' ? 100 : -100,
                rotateY: turnDirection === 'left' ? -15 : 15 
              }}
              animate={{ 
                opacity: 1, 
                x: 0,
                rotateY: 0,
                transition: { 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30 
                }
              }}
              exit={{ 
                opacity: 0, 
                x: turnDirection === 'left' ? -100 : 100,
                rotateY: turnDirection === 'left' ? 15 : -15
              }}
              className="w-full h-full flex items-center justify-center p-8"
            >
              {/* PDF Viewer - using iframe for reliability */}
              <motion.div
                className="max-w-full max-h-full relative flex items-center justify-center bg-white"
                style={{ 
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                  width: "80%",
                  height: "90%",
                  borderRadius: "2px",
                  overflow: "hidden"
                }}
              >
                <iframe 
                  ref={iframeRef}
                  src={`/apps/48/48.pdf#page=${currentPage}`}
                  title="The 48 Laws of Power"
                  className="w-full h-full border-0"
                  style={{ backgroundColor: "white" }}
                  onLoad={() => {
                    // Save current page to localStorage when iframe loads
                    localStorage.setItem("pdfReaderCurrentPage", currentPage.toString());
                    setIsPDFLoaded(true);
                  }}
                  onError={() => {
                    console.error("Failed to load PDF in iframe");
                    setIsPDFLoaded(false);
                  }}
                />
                
                {/* Fallback UI in case iframe doesn't work */}
                {!isPDFLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white">
                    <div className="text-center">
                      <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to load PDF</h3>
                      <p className="text-gray-600 mb-4">The PDF could not be loaded from the specified location.</p>
                      <p className="text-gray-600 mb-4">Please ensure the file is located at:<br/><code className="bg-gray-100 px-2 py-1 rounded">/apps/48/48.pdf</code></p>
                      <p className="text-gray-600">If you're using a local development environment, you'll need to place the PDF in your public directory.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Next page button */}
          <motion.button
            className="absolute right-4 z-10 rounded-full p-3 bg-black/30 text-white/80"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(0, 0, 0, 0.5)", color: "rgba(255, 255, 255, 1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePageTurn('next')}
            disabled={currentPage >= totalPages || isTurningPage}
            onHoverStart={() => setIsNextHovered(true)}
            onHoverEnd={() => setIsNextHovered(false)}
            style={{ opacity: currentPage >= totalPages ? 0.5 : 1 }}
          >
            <ChevronRight size={28} />
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default PDFReader;
