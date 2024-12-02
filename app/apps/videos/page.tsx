// app/apps/videos/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";

// PRESERVED: Core media type from existing system
interface MediaItem {
  id: string;
  name: string;
  type: "IMAGE" | "VIDEO" | "FONT";
  url: string;
}

// EVOLVED: Dedicated video grid app
export default function VideoGrid() {
  // PRESERVED: Existing query pattern
  const { data: mediaItems = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["video-items"],
    queryFn: async () => {
      const response = await axios.get("/api/media", {
        params: { type: "VIDEO" },
      });
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-[#ABC4C3]">Loading videos...</span>
      </div>
    );
  }

  // EVOLVED: Clean minimal video grid
  return (
    <div className="h-full w-full bg-black/80">
      <div className="p-8 grid grid-cols-3 gap-4">
        {mediaItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-video rounded-lg overflow-hidden"
          >
            <video
              src={item.url}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
