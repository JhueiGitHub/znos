"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useStyles } from "@/app/hooks/useStyles";
import localFont from "next/font/local";

// PRESERVED: Original font loading
const exemplarPro = localFont({
  src: "../../../../public/fonts/SFProTextSemibold.ttf",
});

// PRESERVED: Original interfaces
interface StellarFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

interface StellarFolder {
  id: string;
  name: string;
  children: StellarFolder[];
  files: StellarFile[];
}

interface StellarProfile {
  id: string;
  name: string;
  driveCapacity: bigint;
  currentUsage: number;
  rootFolder: StellarFolder;
}

export const FoldersArea = () => {
  const [profile, setProfile] = useState<StellarProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { getColor, getFont } = useStyles();

  // PRESERVED: Original folder fetching
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/stellar/folders");
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch folders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
  }, []);

  // EVOLVED: File upload handling using proven media page mechanics
  // Inside the FoldersArea component, replace handleFileUpload with:

  // Inside the FoldersArea component, the fixed handleFileUpload:

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);

        // PRESERVED: Exact media app FormData construction
        const formData = new FormData();
        formData.append("file", file);
        formData.append("UPLOADCARE_PUB_KEY", "f908b6ff47aba6efd711");

        // PRESERVED: Same upload URL logic as media app
        const uploadResponse = await axios.post(
          "https://upload.uploadcare.com/base/",
          formData
        );

        if (!uploadResponse?.data?.file) {
          throw new Error("Upload failed");
        }

        const cdnUrl = `https://ucarecdn.com/${uploadResponse.data.file}/`;

        // Step 1: Create media item exactly like media app
        await axios.post("/api/media", {
          name: file.name,
          type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
          url: cdnUrl,
        });

        // Step 2: Also create stellar file entry
        await axios.post("/api/stellar/files", {
          name: file.name,
          url: cdnUrl,
          size: file.size,
          mimeType: file.type,
          folderId: profile?.rootFolder?.id,
        });

        // PRESERVED: Refresh folder contents
        const updatedProfile = await axios.get("/api/stellar/folders");
        setProfile(updatedProfile.data);
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [profile?.rootFolder?.id]
  );

  // EVOLVED: Enhanced drag and drop handlers
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) setIsDragging(true);
    },
    [isDragging]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom ||
      e.clientX <= rect.left ||
      e.clientX >= rect.right
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const { files } = e.dataTransfer;
      if (files?.length) {
        for (const file of Array.from(files)) {
          await handleFileUpload(file);
        }
      }
    },
    [handleFileUpload]
  );

  // PRESERVED: Loading state with skeleton grid
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4 h-full p-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const rootFolder = profile?.rootFolder;
  if (!rootFolder) return null;

  return (
    <div
      className="relative h-full flex-1 overflow-auto bg-[#010203]/30 p-4"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* EVOLVED: Upload overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#4C4F69]/20 border-2 border-dashed border-[#4C4F69]/40 rounded-lg pointer-events-none"
          >
            <div className="flex items-center justify-center h-full">
              <span className="text-[#4C4F69] text-lg">
                Drop files to upload
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRESERVED: Original folder layout */}
      {/* EVOLVED: Replace the entire files mapping section */}
      <div className="flex flex-wrap gap-6 p-4">
        {/* EVOLVED: Folders without unnecessary container */}
        {rootFolder.children.map((folder) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center">
              <img
                src="/apps/stellar/icns/system/_folder.png"
                alt={folder.name}
                className="w-[64px] h-[64px] object-contain"
              />
            </div>

            <h3
              className="text-[13px] font-semibold truncate max-w-[150px] text-[#626581ca] mt-1"
              style={exemplarPro.style}
            >
              {folder.name}
            </h3>
          </motion.div>
        ))}

        {/* EVOLVED: Files with precise video styling */}
        {rootFolder.files.map((file) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {file.mimeType?.startsWith("video/") ? (
              <div className="flex flex-col items-center">
                {/* PRESERVED: Square container for layout consistency */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {/* EVOLVED: 16:9 video container centered in square */}
                  <div className="w-full h-12">
                    {" "}
                    {/* 16:9 ratio: 36px height in 64px container */}
                    <video
                      src={file.url}
                      className="w-full h-full object-cover rounded-[9px]"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  </div>
                </div>
                <h3
                  className="text-[13px] font-semibold truncate max-w-[150px] text-[#626581ca] mt-1"
                  style={exemplarPro.style}
                >
                  {file.name}
                </h3>
              </div>
            ) : file.mimeType?.startsWith("image/") ? (
              <>
                <div className="w-16 h-16">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <h3
                  className="text-[13px] font-semibold truncate max-w-[150px] text-[#626581ca] mt-1"
                  style={exemplarPro.style}
                >
                  {file.name}
                </h3>
              </>
            ) : (
              // Default file icon case remains unchanged
              <>
                <div className="w-16 h-16 flex items-center justify-center">
                  <img
                    src="/apps/stellar/icns/system/_file.png"
                    alt={file.name}
                    className="w-[64px] h-[64px] object-contain"
                  />
                </div>
                <h3
                  className="text-[13px] font-semibold truncate max-w-[150px] text-[#626581ca] mt-1"
                  style={exemplarPro.style}
                >
                  {file.name}
                </h3>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Upload progress indicator */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-[#ABC4C3]">Uploading...</div>
        </div>
      )}
    </div>
  );
};
