"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import { useAppStore } from "@/app/store/appStore";
import { GLORY_CONTENT } from "@/app/services/gloryContent";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface BasicSpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BasicSpotlightSearch({ isOpen, onClose }: BasicSpotlightSearchProps) {
  const { getColor, getFont } = useStyles();
  const [query, setQuery] = useState('');
  const { openApp } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    } else {
      // Focus the input when opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, setQuery]);

  // Very basic search function
  const filteredContent = React.useMemo(() => {
    if (!query.trim()) return [];
    
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    // Flatten all content into searchable items
    for (const category of GLORY_CONTENT) {
      for (const content of category.content) {
        if (content.title.toLowerCase().includes(lowerQuery) || 
            content.description.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: content.id,
            type: content.type,
            title: content.title,
            description: content.description,
            category: category.name
          });
        }
        
        // Search episodes if it's a series
        if (content.type === 'series') {
          for (const episode of content.episodes) {
            if (episode.title.toLowerCase().includes(lowerQuery)) {
              results.push({
                id: episode.videoId,
                type: 'episode',
                title: episode.title,
                description: episode.description,
                category: category.name,
                series: content.title
              });
            }
          }
        }
      }
    }
    
    return results;
  }, [query]);

  // Handle opening glory app
  const handleSelect = () => {
    openApp({
      id: 'glory',
      name: 'Glory',
      icon: 'glory-icon',
      dockPosition: 3,
      animationType: 'magnify',
      isMinimized: false,
    });
    onClose();
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
        
        <CommandList className="max-h-[500px] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {query && filteredContent.length === 0 ? (
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
                {filteredContent.length > 0 && (
                  <CommandGroup heading="Search Results" className="px-2">
                    {filteredContent.map((item) => (
                      <CommandItem
                        key={item.id}
                        className="flex items-center gap-2 rounded-md px-2 py-3 hover:bg-white/5 cursor-pointer"
                        onSelect={handleSelect}
                      >
                        <span style={{ color: getColor("Text Primary (Hd)") }}>
                          {item.title}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
