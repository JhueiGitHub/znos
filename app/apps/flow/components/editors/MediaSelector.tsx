// app/apps/flow/components/MediaSelector.tsx
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as Portal from "@radix-ui/react-portal";
import { MediaItem } from "@prisma/client";
import { useStyles } from "@os/hooks/useStyles";
import { Skeleton } from "@/components/ui/skeleton";

interface MediaSelectorProps {
  position: { x: number; y: number };
  onSelect: (mediaItem: MediaItem) => void;
  onClose: () => void;
}

export const MediaSelector = ({
  position,
  onSelect,
  onClose,
}: MediaSelectorProps) => {
  const { getColor } = useStyles();

  const { data: mediaItems, isLoading } = useQuery({
    queryKey: ["media-items"],
    queryFn: async () => {
      const response = await axios.get("/api/media");
      return response.data;
    },
  });

  const MediaGridSkeleton = () => (
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
              }}
            >
              Select Media
            </span>
            <button
              onClick={onClose}
              className="text-sm hover:opacity-70"
              style={{
                color: getColor("Text Secondary (Bd)"),
              }}
            >
              ESC
            </button>
          </div>
          <div className="p-3">
            {isLoading ? (
              <MediaGridSkeleton />
            ) : !mediaItems?.length ? (
              <div
                className="text-center py-8"
                style={{ color: getColor("Text Secondary (Bd)") }}
              >
                No media items found
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {mediaItems.map((item: MediaItem) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer border"
                    style={{ borderColor: getColor("Brd") }}
                    onClick={() => onSelect(item)}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Portal.Root>
  );
};
