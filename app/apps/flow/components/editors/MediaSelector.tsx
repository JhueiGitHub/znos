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

// Define interface for Stellar files
interface StellarFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  position: { x: number; y: number };
  stellarFolderId: string;
}

// Helper to convert StellarFile to MediaItem
const convertToMediaItem = (file: StellarFile): MediaItem => {
  return {
    id: file.id,
    name: file.name,
    url: file.url,
    type: file.mimeType.startsWith("video/") ? "VIDEO" : "IMAGE",
    profileId: "", // This will be handled by the API
    createdAt: new Date(),
    updatedAt: new Date(),
    flowComponentId: null,
  };
};

export const MediaSelector = ({
  position,
  onSelect,
  onClose,
}: MediaSelectorProps) => {
  const { getColor } = useStyles();

  // Update query to fetch from Stellar instead
  const { data: stellarFiles, isLoading } = useQuery({
    queryKey: ["stellar-media-files"],
    queryFn: async () => {
      // Fetch from the root folder of Stellar
      const response = await axios.get("/api/stellar/folders");

      // Recursively collect all files from the folder structure
      const collectFiles = (folder: any): StellarFile[] => {
        let files: StellarFile[] = [...(folder.files || [])];
        if (folder.children) {
          folder.children.forEach((child: any) => {
            files = [...files, ...collectFiles(child)];
          });
        }
        return files;
      };

      // Filter for only media files
      const allFiles = collectFiles(response.data.rootFolder);
      const mediaFiles = allFiles.filter(
        (file) =>
          file.mimeType.startsWith("image/") ||
          file.mimeType.startsWith("video/")
      );

      return mediaFiles;
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
              Select Media from Stellar
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
            ) : !stellarFiles?.length ? (
              <div
                className="text-center py-8"
                style={{ color: getColor("Text Secondary (Bd)") }}
              >
                No media files found in Stellar
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {stellarFiles.map((file: StellarFile) => (
                  <motion.div
                    key={file.id}
                    whileHover={{ scale: 1.05 }}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer border relative group"
                    style={{ borderColor: getColor("Brd") }}
                    onClick={() => onSelect(convertToMediaItem(file))}
                  >
                    {file.mimeType.startsWith("video/") ? (
                      <video
                        src={file.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs text-white">
                        {file.mimeType.startsWith("video/") ? "Video" : "Image"}
                      </span>
                    </div>
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
