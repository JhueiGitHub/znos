// components/media/MediaCard.tsx
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { VideoPreview } from "./previews/VideoPreview";
import { ImagePreview } from "./previews/ImagePreview";
import { FontPreview } from "./previews/FontPreview";

interface MediaCardProps {
  item: {
    id: string;
    name: string;
    type: "IMAGE" | "VIDEO" | "FONT";
    url: string;
  };
}

export function MediaCard({ item }: MediaCardProps) {
  // PRESERVED: Name truncation
  const truncatedName =
    item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name;

  // EVOLVED: Type-specific preview rendering with proper URL handling
  const renderPreview = () => {
    // Ensure URL is properly formatted before passing to previews
    const secureUrl = item.url.startsWith("https://")
      ? item.url
      : `https://${item.url.replace(/^https?:\/\//, "")}`;

    switch (item.type) {
      case "VIDEO":
        return <VideoPreview url={secureUrl} />;
      case "IMAGE":
        return <ImagePreview url={secureUrl} alt={item.name} />;
      case "FONT":
        return <FontPreview url={secureUrl} name={item.name} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <Card className="overflow-hidden border-[#292929] bg-black bg-opacity-30 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="aspect-square relative">{renderPreview()}</div>
        </CardContent>
        <CardFooter className="p-3 bg-black/50">
          <span className="text-sm text-[#ABC4C3] font-medium truncate">
            {truncatedName}
          </span>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
