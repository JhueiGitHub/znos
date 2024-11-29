"use client";

import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";

// Common types for API responses
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

const MacOSIconsApp = () => {
  // Shared state
  const [query, setQuery] = useState("");
  const [activeGrid, setActiveGrid] = useState<
    "basic" | "detailed" | "minimal"
  >("basic");

  // Basic direct POST request approach
  const basicQuery = useQuery<SearchResponse>({
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
    enabled: activeGrid === "basic",
  });

  // Detailed MeiliSearch style approach
  const detailedQuery = useQuery<SearchResponse>({
    queryKey: ["macos-icons-detailed", query],
    queryFn: async () => {
      const response = await axios.post(
        "https://api.macosicons.com/api/search",
        {
          q: query,
          attributesToRetrieve: [
            "appName",
            "lowResPngUrl",
            "downloads",
            "userName",
          ],
          sort: ["downloads:desc"],
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
    enabled: activeGrid === "detailed",
  });

  // Minimal stripped-down approach
  const minimalQuery = useQuery<SearchResponse>({
    queryKey: ["macos-icons-minimal", query],
    queryFn: async () => {
      const response = await axios({
        method: "post",
        url: "https://api.macosicons.com/api/search",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_MACOSICONS_API_KEY || "",
        },
        data: JSON.stringify({ query }),
      });
      return response.data;
    },
    enabled: activeGrid === "minimal",
  });

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value: string) => setQuery(value), 300),
    []
  );

  return (
    <div className="min-h-screen w-screen flex flex-col p-8 bg-[#010203] text-white">
      {/* Header Controls */}
      <div className="mb-8 space-y-4">
        <h1 className="text-2xl font-bold">MacOS Icons API Tester</h1>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search icons..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2"
          />
          <select
            value={activeGrid}
            onChange={(e) => setActiveGrid(e.target.value as typeof activeGrid)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
          >
            <option value="basic">Basic Grid</option>
            <option value="detailed">Detailed Grid</option>
            <option value="minimal">Minimal Grid</option>
          </select>
        </div>
      </div>

      {/* Grid Implementations */}
      <AnimatePresence mode="wait">
        {activeGrid === "basic" && (
          <motion.div
            key="basic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-5 gap-4"
          >
            {basicQuery.isLoading ? (
              <div className="col-span-5 text-center py-8">Loading...</div>
            ) : basicQuery.error ? (
              <div className="col-span-5 text-center py-8 text-red-500">
                Basic Grid Error: {(basicQuery.error as any)?.message}
              </div>
            ) : (
              basicQuery.data?.hits.map((icon, idx) => (
                <div
                  key={`${icon.appName}-${idx}`}
                  className="aspect-square bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <img
                    src={icon.lowResPngUrl}
                    alt={icon.appName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeGrid === "detailed" && (
          <motion.div
            key="detailed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-4 gap-6"
          >
            {detailedQuery.isLoading ? (
              <div className="col-span-4 text-center py-8">Loading...</div>
            ) : detailedQuery.error ? (
              <div className="col-span-4 text-center py-8 text-red-500">
                Detailed Grid Error: {(detailedQuery.error as any)?.message}
              </div>
            ) : (
              detailedQuery.data?.hits.map((icon, idx) => (
                <div
                  key={`${icon.appName}-${idx}`}
                  className="group relative aspect-square bg-white/5 rounded-lg border border-white/10 p-4"
                >
                  <img
                    src={icon.lowResPngUrl}
                    alt={icon.appName}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-4">
                    <p className="text-white font-medium">{icon.appName}</p>
                    <p className="text-white/70 text-sm">by {icon.userName}</p>
                    <p className="text-white/50 text-sm mt-2">
                      {icon.downloads} downloads
                    </p>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeGrid === "minimal" && (
          <motion.div
            key="minimal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-6 gap-2"
          >
            {minimalQuery.isLoading ? (
              <div className="col-span-6 text-center py-8">Loading...</div>
            ) : minimalQuery.error ? (
              <div className="col-span-6 text-center py-8 text-red-500">
                Minimal Grid Error: {(minimalQuery.error as any)?.message}
              </div>
            ) : (
              minimalQuery.data?.hits.map((icon, idx) => (
                <div
                  key={`${icon.appName}-${idx}`}
                  className="aspect-square bg-black/50 rounded-md p-2 hover:bg-black/70 transition-colors"
                >
                  <img
                    src={icon.lowResPngUrl}
                    alt={icon.appName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display for API Key */}
      {!process.env.NEXT_PUBLIC_MACOSICONS_API_KEY && (
        <div className="fixed top-4 right-4 bg-red-500/20 text-red-500 px-4 py-2 rounded-lg">
          Missing API Key
        </div>
      )}
    </div>
  );
};

export default MacOSIconsApp;
