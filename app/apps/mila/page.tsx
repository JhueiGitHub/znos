// app/apps/stellar/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import UploadCareButton from "@/app/components/uploadcare-button";
import { MediaCard } from "@/app/components/media/MediaCard";
import { MediaItem } from "@prisma/client";

export default function StellarApp() {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  // PRESERVED: Original query setup
  const { data: mediaItems = [], refetch } = useQuery<MediaItem[]>({
    queryKey: ["mediaItems"],
    queryFn: async () => {
      const response = await axios.get("/api/media");
      return response.data;
    },
  });

  // EVOLVED: Robust media type detection
  const handleUpload = async (cdnUrl: string) => {
    try {
      setIsUploading(true);

      // EVOLVED: Proper MIME type detection
      const response = await fetch(cdnUrl, { method: "HEAD" });
      const contentType = response.headers.get("content-type");

      let type: "IMAGE" | "VIDEO" | "FONT";
      if (contentType?.startsWith("video/")) {
        type = "VIDEO";
      } else if (
        contentType?.startsWith("font/") ||
        cdnUrl.match(/\.(ttf|otf|woff|woff2)$/)
      ) {
        type = "FONT";
      } else {
        type = "IMAGE";
      }

      const uploadData = {
        name: cdnUrl.split("/").pop() || "Untitled",
        type,
        url: cdnUrl,
      };

      await axios.post("/api/media", uploadData);
      await refetch();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full w-full relative bg-black bg-opacity-80">
      <div className="absolute inset-0 flex flex-col p-4">
        {/* PRESERVED: Upload button section */}
        <div className="flex justify-center mb-6">
          <div className="p-2">
            <UploadCareButton onUpload={handleUpload} />
          </div>
        </div>

        {/* EVOLVED: Media grid with proper type handling */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {mediaItems.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* PRESERVED: Upload indicator */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-[#ABC4C3]">Uploading...</div>
        </div>
      )}
    </div>
  );
}
