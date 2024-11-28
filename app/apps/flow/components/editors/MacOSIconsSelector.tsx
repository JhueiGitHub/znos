import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as Portal from "@radix-ui/react-portal";
import { useStyles } from "@os/hooks/useStyles";
import React, { useState, useCallback } from "react";
import { debounce } from "lodash";

interface MacOSIcon {
  appName: string;
  icnsUrl: string;
  lowResPngUrl: string;
  credit: string;
  uploadedBy: string;
  userName: string;
}

interface MacOSIconsSelectorProps {
  position: { x: number; y: number };
  onSelect: (url: string, metadata: { credit: string; uploadedBy: string }) => Promise<void>;
  onClose: () => void;
}

// Create axios instance with default config
const macOSIconsApi = axios.create({
  baseURL: 'https://api.macosicons.com/api',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'ec7a2a6c2497225fa802fd0615b7ca3d57276c200f68f2536dd1c03e764baa62'
  }
});

export const MacOSIconsSelector = ({
  position,
  onSelect,
  onClose,
}: MacOSIconsSelectorProps) => {
  const { getColor, getFont } = useStyles();
  const [query, setQuery] = useState("");

  // Using our proven working implementation
  const { data, isLoading, error } = useQuery({
    queryKey: ["macos-icons", query],
    queryFn: async () => {
      const response = await macOSIconsApi.post('/search', {
        query: query || "",
        searchOptions: {
          hitsPerPage: 20,
          page: 1,
          sort: ["downloads:desc"]
        }
      });
      return response.data.hits as MacOSIcon[];
    }
  });

  const debouncedSearch = useCallback(
    debounce((value: string) => setQuery(value), 300),
    []
  );

  // Preserve exact same UI implementation but with proper error display
  return (
    <Portal.Root>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="fixed z-50"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div
          className="w-[400px] rounded-lg overflow-hidden border shadow-lg"
          style={{
            backgroundColor: getColor("Glass"),
            borderColor: getColor("Brd"),
          }}
        >
          {/* Header */}
          <div
            className="p-3 border-b flex items-center justify-between"
            style={{
              borderColor: getColor("Brd"),
            }}
          >
            <span
              className="text-sm font-semibold"
              style={{
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
            >
              Select macOS Icon
            </span>
            <button
              onClick={onClose}
              className="text-sm hover:opacity-70"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              ESC
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b" style={{ borderColor: getColor("Brd") }}>
            <input
              type="text"
              placeholder="Search icons..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full p-2 rounded-md text-sm"
              style={{
                backgroundColor: getColor("Overlaying BG"),
                color: getColor("Text Primary (Hd)"),
                border: `1px solid ${getColor("Brd")}`,
              }}
            />
          </div>

          {/* Grid */}
          <div className="p-3 grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div 
                className="col-span-3 py-8 text-center"
                style={{ color: getColor("Text Secondary (Bd)") }}
              >
                Loading...
              </div>
            ) : error ? (
              <div 
                className="col-span-3 py-8 text-center text-red-500"
              >
                {(error as any)?.message || 'Error loading icons'}
                <pre className="mt-2 text-xs opacity-50">
                  {(error as any)?.response?.status} {(error as any)?.response?.statusText}
                </pre>
              </div>
            ) : !data?.length ? (
              <div 
                className="col-span-3 py-8 text-center"
                style={{ color: getColor("Text Secondary (Bd)") }}
              >
                No icons found
              </div>
            ) : (
              data.map((icon) => (
                <motion.div
                  key={`${icon.appName}-${icon.userName}`}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer border group relative"
                  style={{ borderColor: getColor("Brd") }}
                  onClick={() => onSelect(icon.icnsUrl, {
                    credit: icon.credit,
                    uploadedBy: icon.uploadedBy
                  })}
                >
                  {/* Icon Preview */}
                  <div className="w-full h-full p-2 flex items-center justify-center bg-white/5">
                    <img
                      src={icon.lowResPngUrl}
                      alt={icon.appName}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Hover Info */}
                  <div 
                    className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col items-center justify-end text-center"
                    style={{ color: getColor("Text Primary (Hd)") }}
                  >
                    <p className="text-xs font-medium truncate w-full">
                      {icon.appName}
                    </p>
                    <p 
                      className="text-[10px] truncate w-full mt-0.5"
                      style={{ color: getColor("Text Secondary (Bd)") }}
                    >
                      by {icon.userName}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </Portal.Root>
  );
};