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
  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);

        // PRESERVED: Exact working media detection from media page
        const response = await fetch(
          file.type.startsWith("video/")
            ? "/api/uploadUrl?type=video"
            : "/api/uploadUrl",
          {
            method: "GET",
          }
        );

        if (!response.ok) throw new Error("Failed to get upload URL");
        const { url } = await response.json();

        // PRESERVED: Direct file upload mechanic from media page
        const uploadResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadResponse.ok) throw new Error("Upload failed");
        const { cdnUrl } = await uploadResponse.json();

        // EVOLVED: Type detection from media page
        let type: "IMAGE" | "VIDEO" | "FONT";
        if (file.type.startsWith("video/")) {
          type = "VIDEO";
        } else if (
          file.type.startsWith("font/") ||
          file.name.match(/\.(ttf|otf|woff|woff2)$/)
        ) {
          type = "FONT";
        } else {
          type = "IMAGE";
        }

        // EVOLVED: Save to stellar files
        await axios.post("/api/stellar/files", {
          name: file.name,
          type,
          url: cdnUrl,
          size: file.size,
          mimeType: file.type,
          folderId: profile?.rootFolder?.id,
        });

        // Refresh folder contents
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
      <div className="flex flex-wrap gap-[1px]">
        {rootFolder.children.map((folder) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Card
              className="w-[128px] h-[128px] border border-white/[0.00] rounded-[19px] transition-all hover:border-white/[0.15] cursor-pointer"
              style={{ backgroundColor: getColor("Glass") }}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center gap-[6px]">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center">
                  <img
                    src="/apps/stellar/icns/system/_folder.png"
                    alt="Folder"
                    className="w-[64px] h-[64px] object-contain"
                  />
                </div>

                <div className="text-center">
                  <h3
                    className="text-[13px] font-semibold truncate max-w-[150px] text-[#626581ca]"
                    style={exemplarPro.style}
                  >
                    {folder.name}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* EVOLVED: Files display with media preview */}
        {rootFolder.files.map((file) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Card
              className="w-[128px] h-[128px] border border-white/[0.00] rounded-[19px] transition-all hover:border-white/[0.15] cursor-pointer overflow-hidden"
              style={{ backgroundColor: getColor("Glass") }}
            >
              <CardContent className="p-0 h-full relative">
                {file.mimeType?.startsWith("video/") ? (
                  <video
                    src={file.url}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : file.mimeType?.startsWith("image/") ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <img
                      src="/apps/stellar/icns/system/_file.png"
                      alt={file.name}
                      className="w-16 h-16 object-contain mb-2"
                    />
                    <span className="text-[11px] text-[#626581ca] truncate w-full text-center">
                      {file.name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
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
