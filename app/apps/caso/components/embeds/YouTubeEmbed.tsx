// app/apps/mila/components/embeds/YouTubeEmbed.tsx
import React, { useState, useCallback } from "react";
import { useStyles } from "@/app/hooks/useStyles";
import { Play } from "lucide-react";

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  title = "YouTube Video",
  thumbnailUrl,
  width = 320,
  height = 180,
}) => {
  const { getColor } = useStyles();
  const [showVideo, setShowVideo] = useState(false);

  // Default thumbnail if not provided
  const thumbnail =
    thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const handleClick = useCallback(() => {
    setShowVideo(true);
  }, []);

  if (showVideo) {
    return (
      <div
        className="relative overflow-hidden rounded-md"
        style={{ width, height }}
      >
        <iframe
          width={width}
          height={height}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-md cursor-pointer"
      style={{ width, height }}
      onClick={handleClick}
    >
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => {
          // If the thumbnail fails to load, try a different size
          const target = e.target as HTMLImageElement;
          if (target.src.includes("hqdefault")) {
            target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
          } else if (target.src.includes("mqdefault")) {
            target.src = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
          } else {
            // Fallback to a generic placeholder
            target.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjIyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjYWFhIj5Zb3VUdWJlPC90ZXh0Pjwvc3ZnPg==";
          }
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: getColor("latte-med") }}
        >
          <Play size={24} color="white" />
        </div>
      </div>
    </div>
  );
};
