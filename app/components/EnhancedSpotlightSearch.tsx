"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useStyles } from "@/app/hooks/useStyles";
import { useSpotlightSearch } from "@/app/hooks/useSpotlightSearch";
import { SearchResult, SearchResultType } from "@/app/services/SpotlightSearchIndex";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EnhancedSpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnhancedSpotlightSearch({ isOpen, onClose }: EnhancedSpotlightSearchProps) {
  const { getColor, getFont } = useStyles();
  const {
    query,
    setQuery,
    results,
    isSearching,
    isReady,
    recentSearches,
    handleSelectResult,
    clearRecentSearches
  } = useSpotlightSearch();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentHighlight, setCurrentHighlight] = useState<number>(-1);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter results based on active tab
  const filteredResults = React.useMemo(() => {
    if (activeTab === "all") return results;
    
    const typeMapping: Record<string, SearchResultType[]> = {
      "video": ["series", "movie", "episode"],
      "categories": ["category"],
      "other": ["app", "media", "flow", "stream"]
    };
    
    return results.filter(result => 
      typeMapping[activeTab]?.includes(result.type)
    );
  }, [results, activeTab]);

  // Group results by type for display
  const groupedResults = React.useMemo(() => {
    const groups: Record<string, { title: string, results: SearchResult[] }> = {
      "series": { title: "Series", results: [] },
      "movies": { title: "Movies", results: [] },
      "episodes": { title: "Episodes", results: [] },
      "categories": { title: "Categories", results: [] },
      "other": { title: "Other", results: [] },
    };
    
    filteredResults.forEach(result => {
      if (result.type === "series") {
        groups.series.results.push(result);
      } else if (result.type === "movie") {
        groups.movies.results.push(result);
      } else if (result.type === "episode") {
        groups.episodes.results.push(result);
      } else if (result.type === "category") {
        groups.categories.results.push(result);
      } else {
        groups.other.results.push(result);
      }
    });
    
    // Only return groups with results
    return Object.entries(groups)
      .filter(([_, group]) => group.results.length > 0)
      .map(([key, group]) => ({ key, ...group }));
  }, [filteredResults]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const totalItems = filteredResults.length;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCurrentHighlight(prev => (prev + 1) % totalItems);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCurrentHighlight(prev => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === "Enter" && currentHighlight >= 0) {
        e.preventDefault();
        handleSelectResult(filteredResults[currentHighlight]);
        onClose();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredResults, currentHighlight, handleSelectResult, onClose]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setCurrentHighlight(-1);
      setActiveTab("all");
    } else {
      // Focus the input when opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, setQuery]);

  // Show recent searches when the input is focused and empty
  useEffect(() => {
    setShowRecentSearches(isOpen && !query.trim() && recentSearches.length > 0);
  }, [isOpen, query, recentSearches]);

  // Format title with highlight for search query
  const formatTitle = (title: string) => {
    if (!query.trim()) return title;
    
    try {
      const regex = new RegExp(`(${query.trim()})`, 'gi');
      const parts = title.split(regex);
      
      return (
        <>
          {parts.map((part, i) => 
            regex.test(part) ? (
              <span key={i} className="bg-blue-500/40">{part}</span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </>
      );
    } catch (e) {
      return title;
    }
  };

  // Get icon for a result based on type
  const getResultIcon = (result: SearchResult) => {
    if (result.thumbnail) {
      return (
        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
          <img
            src={result.thumbnail}
            alt={result.title}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    
    const defaultIcons: Record<SearchResultType, string> = {
      app: "/icns/_app.png",
      category: "/icns/_folder.png",
      series: "/icns/_video.png",
      movie: "/icns/_movie.png",
      episode: "/icns/_episode.png",
      media: "/icns/_media.png",
      flow: "/icns/_flow.png",
      stream: "/icns/_stream.png",
    };
    
    return (
      <Image
        src={result.icon || defaultIcons[result.type] || "/icns/_default.png"}
        alt={result.type}
        width={24}
        height={24}
        className="opacity-80"
      />
    );
  };

  return (
    <CommandDialog 
      open={isOpen} 
      onOpenChange={onClose}
      className="overflow-hidden backdrop-blur-xl"
    >
      <Command
        className="bg-black/80"
        style={{
          backdropFilter: "blur(24px)",
          borderColor: "rgba(255, 255, 255, 0.15)",
          borderWidth: "0.8px",
          fontFamily: getFont("Text Primary"),
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.45)",
        }}
      >
        <div className="flex items-center px-4 h-16 border-b border-white/10">
          <div className="mr-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 17.5L12.5 12.5M14.1667 8.33333C14.1667 11.555 11.555 14.1667 8.33333 14.1667C5.11167 14.1667 2.5 11.555 2.5 8.33333C2.5 5.11167 5.11167 2.5 8.33333 2.5C11.555 2.5 14.1667 5.11167 14.1667 8.33333Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <CommandInput
            ref={inputRef}
            placeholder="Search movies, series, episodes..."
            value={query}
            onValueChange={setQuery}
            className="h-full bg-transparent text-lg text-white/80 placeholder:text-white/40 border-none focus:ring-0 flex-1 py-6"
          />
          <div className="flex items-center space-x-2 ml-2">
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L13 13M1 13L13 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
            <div className="text-white/40 text-sm border border-white/20 rounded px-2 py-0.5">
              Esc
            </div>
          </div>
        </div>
        
        <div className="p-2">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="all" className="data-[state=active]:bg-white/10">
                All
              </TabsTrigger>
              <TabsTrigger value="video" className="data-[state=active]:bg-white/10">
                Videos
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-white/10">
                Categories
              </TabsTrigger>
            </TabsList>
            
            <CommandList className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {isSearching ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-8 flex flex-col items-center justify-center"
                  >
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    <p className="text-white/50 mt-4">Searching...</p>
                  </motion.div>
                ) : showRecentSearches ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <CommandGroup heading="Recent Searches">
                      {recentSearches.map((search, index) => (
                        <CommandItem
                          key={`recent-${index}`}
                          className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-white/5 cursor-pointer"
                          onSelect={() => {
                            setQuery(search);
                          }}
                        >
                          <div className="flex items-center justify-center w-6 h-6">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 13.3333C10.9455 13.3333 13.3333 10.9455 13.3333 8C13.3333 5.05448 10.9455 2.66667 8 2.66667C5.05448 2.66667 2.66667 5.05448 2.66667 8C2.66667 10.9455 5.05448 13.3333 8 13.3333Z" stroke="white" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8 5.33333V8L9.33333 9.33333" stroke="white" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <span className="text-white/80">{search}</span>
                        </CommandItem>
                      ))}
                      
                      <div className="pt-2 pb-1 px-3">
                        <button
                          onClick={clearRecentSearches}
                          className="text-sm text-blue-400 hover:underline"
                        >
                          Clear recent searches
                        </button>
                      </div>
                    </CommandGroup>
                  </motion.div>
                ) : query && filteredResults.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <CommandEmpty className="py-12 text-center">
                      <div className="text-white/40 mb-2">No results found for "{query}"</div>
                      <div className="text-white/60 text-sm">
                        Try different keywords or check for spelling mistakes
                      </div>
                    </CommandEmpty>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="all" className="mt-0">
                      {groupedResults.map((group) => (
                        <React.Fragment key={group.key}>
                          <CommandGroup heading={group.title} className="px-2">
                            {group.results.map((result, index) => {
                              const globalIndex = filteredResults.findIndex(r => r.id === result.id);
                              const isHighlighted = globalIndex === currentHighlight;
                              
                              return (
                                <CommandItem
                                  key={result.id}
                                  className={`
                                    flex items-center gap-3 rounded-md px-3 py-3 hover:bg-white/10 cursor-pointer transition-colors
                                    ${isHighlighted ? 'bg-white/10' : ''}
                                  `}
                                  onSelect={() => {
                                    handleSelectResult(result);
                                    onClose();
                                  }}
                                  onMouseEnter={() => setCurrentHighlight(globalIndex)}
                                >
                                  {getResultIcon(result)}
                                  
                                  <div className="flex-1 overflow-hidden">
                                    <div className="text-white/90 font-medium truncate">
                                      {formatTitle(result.title)}
                                    </div>
                                    
                                    <div className="flex items-center text-sm text-white/50 space-x-2 mt-0.5">
                                      <span className="capitalize">{result.type}</span>
                                      
                                      {result.parent && (
                                        <>
                                          <span>•</span>
                                          <span>{result.parent.title}</span>
                                        </>
                                      )}
                                      
                                      {result.metadata?.rating && (
                                        <>
                                          <span>•</span>
                                          <span className="text-green-400">{result.metadata.rating.split(' ')[0]}</span>
                                        </>
                                      )}
                                      
                                      {result.metadata?.duration && (
                                        <>
                                          <span>•</span>
                                          <span>{result.metadata.duration}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="ml-2">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M6 12L10 8L6 4" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                          <CommandSeparator />
                        </React.Fragment>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="video" className="mt-0">
                      {groupedResults
                        .filter(group => ['series', 'movies', 'episodes'].includes(group.key))
                        .map((group) => (
                          <React.Fragment key={group.key}>
                            <CommandGroup heading={group.title} className="px-2">
                              {group.results.map((result) => {
                                const globalIndex = filteredResults.findIndex(r => r.id === result.id);
                                const isHighlighted = globalIndex === currentHighlight;
                                
                                return (
                                  <CommandItem
                                    key={result.id}
                                    className={`
                                      flex items-center gap-3 rounded-md px-3 py-3 hover:bg-white/10 cursor-pointer transition-colors
                                      ${isHighlighted ? 'bg-white/10' : ''}
                                    `}
                                    onSelect={() => {
                                      handleSelectResult(result);
                                      onClose();
                                    }}
                                    onMouseEnter={() => setCurrentHighlight(globalIndex)}
                                  >
                                    {getResultIcon(result)}
                                    
                                    <div className="flex-1 overflow-hidden">
                                      <div className="text-white/90 font-medium truncate">
                                        {formatTitle(result.title)}
                                      </div>
                                      
                                      <div className="flex items-center text-sm text-white/50 space-x-2 mt-0.5">
                                        <span className="capitalize">{result.type}</span>
                                        
                                        {result.parent && (
                                          <>
                                            <span>•</span>
                                            <span>{result.parent.title}</span>
                                          </>
                                        )}
                                        
                                        {result.metadata?.rating && (
                                          <>
                                            <span>•</span>
                                            <span className="text-green-400">{result.metadata.rating.split(' ')[0]}</span>
                                          </>
                                        )}
                                        
                                        {result.metadata?.duration && (
                                          <>
                                            <span>•</span>
                                            <span>{result.metadata.duration}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="ml-2">
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 12L10 8L6 4" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                            <CommandSeparator />
                          </React.Fragment>
                        ))}
                    </TabsContent>
                    
                    <TabsContent value="categories" className="mt-0">
                      {groupedResults
                        .filter(group => group.key === 'categories')
                        .map((group) => (
                          <CommandGroup key={group.key} className="px-2">
                            {group.results.map((result) => {
                              const globalIndex = filteredResults.findIndex(r => r.id === result.id);
                              const isHighlighted = globalIndex === currentHighlight;
                              
                              return (
                                <CommandItem
                                  key={result.id}
                                  className={`
                                    flex items-center gap-3 rounded-md px-3 py-3 hover:bg-white/10 cursor-pointer transition-colors
                                    ${isHighlighted ? 'bg-white/10' : ''}
                                  `}
                                  onSelect={() => {
                                    handleSelectResult(result);
                                    onClose();
                                  }}
                                  onMouseEnter={() => setCurrentHighlight(globalIndex)}
                                >
                                  {getResultIcon(result)}
                                  
                                  <div className="flex-1 overflow-hidden">
                                    <div className="text-white/90 font-medium truncate">
                                      {formatTitle(result.title)}
                                    </div>
                                    
                                    <div className="flex items-center text-sm text-white/50 space-x-2 mt-0.5">
                                      <span>Category</span>
                                      <span>•</span>
                                      <span>Glory</span>
                                    </div>
                                  </div>
                                  
                                  <div className="ml-2">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M6 12L10 8L6 4" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        ))}
                    </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Keyboard navigation tips */}
              {filteredResults.length > 0 && (
                <div className="border-t border-white/10 mt-3 pt-3 px-4 pb-2 flex items-center justify-between text-white/40 text-xs">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 border border-white/20 rounded">↑</kbd>
                      <kbd className="px-1.5 py-0.5 border border-white/20 rounded">↓</kbd>
                      <span className="ml-1">to navigate</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 border border-white/20 rounded">Enter</kbd>
                      <span>to select</span>
                    </div>
                  </div>
                  
                  <div>
                    {filteredResults.length} results
                  </div>
                </div>
              )}
            </CommandList>
          </Tabs>
        </div>
      </Command>
    </CommandDialog>
  );
}
