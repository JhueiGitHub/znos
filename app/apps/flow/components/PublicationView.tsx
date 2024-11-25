// app/apps/flow/components/PublicationView.tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { useStyles } from "@os/hooks/useStyles";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Star, Share2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PublicationViewProps {
  publicationId: string;
  onBack: () => void;
}

interface Publication {
  id: string;
  name: string;
  description: string;
  previewImageUrl?: string;
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

export const PublicationView = ({
  publicationId,
  onBack,
}: PublicationViewProps) => {
  const { getColor, getFont } = useStyles();

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
    onSuccess: () => {
      toast.success("Design system imported successfully!");
    },
    onError: () => {
      toast.error("Failed to import design system");
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
      className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden"
      {...containerAnimation}
    >
      {/* Fixed Header */}
      <motion.div
        className="flex items-center justify-between px-[33px] h-[70px] border-b"
        style={{ borderColor: getColor("Brd") }}
        {...itemAnimation}
      >
        <Button variant="ghost" className="gap-2" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Button
          onClick={() => importFlow()}
          disabled={isImporting}
          className="px-6"
          style={{
            backgroundColor: getColor("Lilac Accent"),
            color: getColor("Text Primary (Hd)"),
            fontFamily: getFont("Text Primary"),
          }}
        >
          {isImporting ? "Importing..." : "+ Import"}
        </Button>
      </motion.div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="px-[33px] py-8 space-y-8">
          {/* Title Section */}
          <motion.div {...itemAnimation} transition={{ delay: 0.1 }}>
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

          {/* Preview Image */}
          <motion.div
            className="w-full aspect-[16/9] rounded-xl overflow-hidden border relative group"
            style={{ borderColor: getColor("Brd") }}
            {...itemAnimation}
            transition={{ delay: 0.2 }}
          >
            <img
              src={publication.previewImageUrl || "/media/_emptyimage.png"}
              alt={publication.name}
              className="w-full h-full object-cover"
            />
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
