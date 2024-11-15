// components/media/MediaCard.tsx
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FontPreview, ImagePreview, VideoPreview } from "@/app/components/media/previews";

interface MediaCardProps {
  item: {
    id: string;
    name: string;
    type: "IMAGE" | "VIDEO" | "FONT";
    url: string;
  };
}

export function MediaCard({ item }: MediaCardProps) {
  const truncatedName = item.name.length > 20 
    ? item.name.substring(0, 20) + "..."
    : item.name;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <Card className="overflow-hidden border-[#292929] bg-black bg-opacity-30 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="aspect-square relative">
            {item.type === "IMAGE" && <ImagePreview url={item.url} alt={item.name} />}
            {item.type === "VIDEO" && <VideoPreview url={item.url} />}
            {item.type === "FONT" && <FontPreview url={item.url} name={item.name} />}
          </div>
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