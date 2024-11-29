import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as Portal from "@radix-ui/react-portal";
import { useStyles } from "@os/hooks/useStyles";
import React, { useState, useCallback } from "react";
import { debounce } from "lodash";
import { Skeleton } from "@/components/ui/skeleton";

interface MacOSIcon {
  appName: string;
  timestamp: number;
  icnsUrl: string;
  i0SUrl: string;
  lowResPngUrl: string;
  category: string;
  downloads: number;
  credit: string;
  uploadedBy: string;
  userName: string;
}

interface SearchResponse {
  hits: MacOSIcon[];
  page: number;
  totalPages: number;
  totalHits: number;
}

interface MacOSIconsSelectorProps {
  position: { x: number; y: number };
  onSelect: (url: string) => void;
  onClose: () => void;
}

// Create basic query implementation exactly as in working App.tsx
export const MacOSIconsSelector = ({
  position,
  onSelect,
  onClose,
}: MacOSIconsSelectorProps) => {
  const { getColor, getFont } = useStyles();
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = useQuery<SearchResponse>({
    queryKey: ["macos-icons-basic", query],
    queryFn: async () => {
      const response = await axios.post(
        "https://api.macosicons.com/api/search",
        {
          query,
          searchOptions: {
            hitsPerPage: 20,
            page: 1,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_MACOSICONS_API_KEY || "",
          },
        }
      );
      return response.data;
    },
  });

  const debouncedSearch = useCallback(
    debounce((value: string) => setQuery(value), 300),
    []
  );

  const IconGridSkeleton = () => (
    <div className="grid grid-cols-3 gap-2">
      {[...Array(9)].map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg bg-white/5" />
      ))}
    </div>
  );

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

          <div
            className="p-3 border-b"
            style={{ borderColor: getColor("Brd") }}
          >
            <input
              type="text"
              placeholder="Search icons..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2"
            />
          </div>

          <div className="p-3 grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <IconGridSkeleton />
            ) : error ? (
              <div className="col-span-3 text-center py-8 text-red-500">
                {(error as any)?.message || "Error loading icons"}
              </div>
            ) : !data?.hits?.length ? (
              <div className="col-span-3 text-center py-8">No icons found</div>
            ) : (
              // Existing icon grid render
              data.hits.map((icon, idx) => (
                <div
                  key={`${icon.appName}-${idx}`}
                  onClick={() => onSelect(icon.icnsUrl)}
                  className="aspect-square bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <img
                    src={icon.lowResPngUrl}
                    alt={icon.appName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </Portal.Root>
  );
};
