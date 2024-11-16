// app/apps/stellar/page.tsx
"use client";

import { useState } from "react";
import {
  QueryClientProvider,
  QueryClient,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import UploadCareButton from "@/app/components/uploadcare-button";
import { MediaCard } from "@/app/components/media/MediaCard";
import { MediaItem } from "@prisma/client";

const queryClient = new QueryClient();

function MediaGrid() {
  const [isUploading, setIsUploading] = useState(false);

  const { data: mediaItems = [], refetch } = useQuery<MediaItem[]>({
    queryKey: ["mediaItems"],
    queryFn: async () => {
      const response = await axios.get("/api/media");
      return response.data;
    },
  });

  const handleUpload = async (cdnUrl: string) => {
    try {
      setIsUploading(true);

      let type: "IMAGE" | "VIDEO" | "FONT";
      const lowerUrl = cdnUrl.toLowerCase();

      if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) {
        type = "IMAGE";
      } else if (lowerUrl.match(/\.(mp4|webm|mov|avi|mkv)$/)) {
        type = "VIDEO";
      } else if (lowerUrl.match(/\.(ttf|otf|woff|woff2)$/)) {
        type = "FONT";
      } else {
        type = "IMAGE";
      }

      const uploadData = {
        name: cdnUrl.split("/").pop() || "Untitled",
        type,
        url: cdnUrl,
        size: 0, // You might want to get the actual file size
      };

      await axios.post("/api/media", uploadData);
      refetch();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full w-full relative bg-black bg-opacity-80">
      <div className="absolute inset-0 flex flex-col p-4">
        {/* Upload button */}
        <div className="flex justify-center mb-6">
          <div className="p-2">
            <UploadCareButton onUpload={handleUpload} />
          </div>
        </div>

        {/* Media grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {mediaItems.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Upload indicator */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-[#ABC4C3]">Uploading...</div>
        </div>
      )}
    </div>
  );
}

export default function Stellar() {
  return (
    <QueryClientProvider client={queryClient}>
      <MediaGrid />
    </QueryClientProvider>
  );
}
