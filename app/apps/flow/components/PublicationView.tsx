// app/apps/flow/components/PublicationView.tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { useStyles } from "@os/hooks/useStyles";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Star, Share2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/app/store/appStore";
import { VideoPreview } from "@/app/components/media/previews/VideoPreview";
import { useRouter } from "next/navigation";

// PRESERVED: Existing interfaces
interface PublicationViewProps {
  publicationId: string;
  onBack: () => void;
}

interface WallpaperData {
  mode?: "color" | "media";
  value?: string | null;
  tokenId?: string;
}

interface PreviewMediaProps {
  wallpaper?: {
    mode?: "color" | "media";
    value?: string | null;
    mediaItem?: any; // Type this properly based on your schema
  };
}

interface Publication {
  id: string;
  name: string;
  description: string;
  previewData?: {
    wallpaper?: WallpaperData;
  };
  downloads: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  designSystemId: string;
  xpProfile?: {
    displayName?: string;
    customImageUrl?: string;
    isVerified?: boolean;
  };
}

// EVOLVED: Fixed typing for PreviewMedia
const PreviewMedia: React.FC<PreviewMediaProps> = ({ wallpaper }) => {
  if (!wallpaper?.value || wallpaper.mode !== "media") {
    return (
      <img
        src="/media/system/_empty_image.png"
        alt="Empty preview"
        className="w-full h-full object-cover"
      />
    );
  }

  // EVOLVED: Use proper URL from mediaItem if available
  const mediaUrl = wallpaper.mediaItem?.url || wallpaper.value;

  // EVOLVED: Better video detection using mediaItem type or URL pattern
  const isVideo =
    wallpaper.mediaItem?.type === "VIDEO" ||
    mediaUrl.match(/\.(mp4|webm|mov)$/i);

  if (isVideo) {
    return <VideoPreview url={mediaUrl} />;
  }

  return (
    <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
  );
};

export const PublicationView = ({
  publicationId,
  onBack,
}: PublicationViewProps) => {
  // PRESERVED: Existing hooks and setup
  const { getColor, getFont } = useStyles();
  const openApp = useAppStore((state) => state.openApp);

  const { data: publication, isLoading } = useQuery<Publication>({
    queryKey: ["publication", publicationId],
    queryFn: async () => {
      const response = await axios.get(`/api/xp/publications/${publicationId}`);
      return response.data;
    },
  });

  const { mutate: importFlow, isLoading: isImporting } = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `/api/xp/publications/${publicationId}/import`
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Design system imported successfully!", {
        duration: 5000,
        className: "bg-[#010203]/80 backdrop-blur-md border border-white/10",
        descriptionClassName: "text-sm text-white/70",
        action: {
          label: "View Flow",
          onClick: () => {
            openApp({
              id: "flow",
              name: "Flow",
              icon: "flow-icon",
              dockPosition: 1,
              animationType: "magnify",
              isMinimized: false,
            });
          },
        },
      });
    },
    onError: () => {
      toast.error("Failed to import design system", {
        duration: 5000,
        className: "bg-[#010203]/80 backdrop-blur-md border border-white/10",
        descriptionClassName: "text-sm text-white/70",
      });
    },
  });

  // Shared animation configuration
  const containerAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  };

  const itemAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring", stiffness: 300, damping: 30 },
  };

  if (isLoading || !publication) {
    return (
      <div className="flex-1 min-w-0 px-[33px] py-5 flex items-center justify-center">
        <span style={{ color: getColor("Text Secondary (Bd)") }}>
          {isLoading ? "Loading publication..." : "Publication not found"}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      className="flex-1 min-w-0 flex flex-col h-full overflow-hidden scrollbar scrollbar-thumb-rose-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Fixed Header */}
      <motion.div
        className="flex items-center justify-between px-[33px] h-[70px] border-b scrollbar scrollbar-thumb-rose-500"
        style={{ borderColor: getColor("Brd") }}
      >
        <Button
          className="gap-2 bg-black/0 hover:bg-[#4c4f693e] text-[11px] text-[#cccccc]/90  hover:text-[#ccccccf3]"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Button
          onClick={() => importFlow()}
          disabled={isImporting}
          className="px-6"
          style={{
            backgroundColor: getColor("latte"),
            color: getColor("Text Primary (Hd)"),
            fontFamily: getFont("Text Primary"),
          }}
        >
          {isImporting ? "Importing..." : "+ Import"}
        </Button>
      </motion.div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 scrollbar scrollbar-thumb-rose-500">
        <div className="px-[33px] py-8 space-y-8 scrollbar scrollbar-thumb-rose-500">
          {/* Title Section */}
          <motion.div
            {...itemAnimation}
            transition={{ delay: 0.1 }}
            className="scrollbar scrollbar-thumb-rose-500"
          >
            <h1
              className="text-3xl font-semibold mb-2"
              style={{
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
            >
              {publication.name}
            </h1>
            <p
              className="text-sm"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              Published {new Date(publication.createdAt).toLocaleDateString()}
            </p>
          </motion.div>

          <motion.div
            className="w-full aspect-[16/9] rounded-xl overflow-hidden border relative group"
            style={{ borderColor: getColor("Brd") }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: 0.2,
            }}
          >
            {publication.previewData?.wallpaper?.mode === "media" &&
            publication.previewData.wallpaper.value ? (
              <VideoPreview url={publication.previewData.wallpaper.value} />
            ) : (
              <img
                src="/media/system/_empty_image.png"
                alt="Empty preview"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-3 gap-6"
            {...itemAnimation}
            transition={{ delay: 0.3 }}
          >
            {/* Downloads Card */}
            <div
              className="p-6 rounded-xl border backdrop-blur-sm"
              style={{
                backgroundColor: getColor("Glass"),
                borderColor: getColor("Brd"),
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Download
                  className="w-5 h-5"
                  style={{ color: getColor("Text Secondary (Bd)") }}
                />
                <span
                  className="text-sm"
                  style={{
                    color: getColor("Text Secondary (Bd)"),
                    fontFamily: getFont("Text Secondary"),
                  }}
                >
                  Downloads
                </span>
              </div>
              <span
                className="text-3xl font-semibold"
                style={{ color: getColor("Text Primary (Hd)") }}
              >
                {publication.downloads}
              </span>
            </div>

            {/* Rating Card */}
            <div
              className="p-6 rounded-xl border backdrop-blur-sm"
              style={{
                backgroundColor: getColor("Glass"),
                borderColor: getColor("Brd"),
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Star
                  className="w-5 h-5"
                  style={{ color: getColor("Text Secondary (Bd)") }}
                />
                <span
                  className="text-sm"
                  style={{
                    color: getColor("Text Secondary (Bd)"),
                    fontFamily: getFont("Text Secondary"),
                  }}
                >
                  Rating
                </span>
              </div>
              <span
                className="text-3xl font-semibold"
                style={{ color: getColor("Text Primary (Hd)") }}
              >
                4.9
              </span>
            </div>

            {/* Price Card */}
            <div
              className="p-6 rounded-xl border backdrop-blur-sm"
              style={{
                backgroundColor: getColor("Glass"),
                borderColor: getColor("Brd"),
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Share2
                  className="w-5 h-5"
                  style={{ color: getColor("Text Secondary (Bd)") }}
                />
                <span
                  className="text-sm"
                  style={{
                    color: getColor("Text Secondary (Bd)"),
                    fontFamily: getFont("Text Secondary"),
                  }}
                >
                  Price
                </span>
              </div>
              <span
                className="text-3xl font-semibold"
                style={{ color: getColor("Text Primary (Hd)") }}
              >
                ${publication.price}
              </span>
            </div>
          </motion.div>

          {/* About Section */}
          <motion.div
            {...itemAnimation}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-xl border backdrop-blur-sm"
            style={{
              backgroundColor: getColor("Glass"),
              borderColor: getColor("Brd"),
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
            >
              About this design system
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              {publication.description || "Default OS Configuration"}
            </p>
          </motion.div>

          {/* Creator Section */}
          <motion.div
            {...itemAnimation}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-xl border backdrop-blur-sm"
            style={{
              backgroundColor: getColor("Glass"),
              borderColor: getColor("Brd"),
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
            >
              Creator
            </h2>
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full overflow-hidden border"
                style={{ borderColor: getColor("Brd") }}
              >
                <img
                  src={
                    publication.xpProfile?.customImageUrl ||
                    "/media/default-avatar.png"
                  }
                  alt={publication.xpProfile?.displayName || "Creator"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="font-semibold"
                    style={{
                      color: getColor("Text Primary (Hd)"),
                      fontFamily: getFont("Text Primary"),
                    }}
                  >
                    {publication.xpProfile?.displayName || "Anonymous Creator"}
                  </span>
                  {publication.xpProfile?.isVerified && (
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <span
                  className="text-sm"
                  style={{
                    color: getColor("Text Secondary (Bd)"),
                    fontFamily: getFont("Text Secondary"),
                  }}
                >
                  {publication.xpProfile?.isVerified
                    ? "Verified Creator"
                    : "Community Creator"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};
