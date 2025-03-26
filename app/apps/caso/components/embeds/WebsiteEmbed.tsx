// app/apps/mila/components/embeds/WebsiteEmbed.tsx
import React, { useMemo } from "react";
import { useStyles } from "@/app/hooks/useStyles";
import { ExternalLink } from "lucide-react";

interface WebsiteEmbedProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  width?: number;
}

export const WebsiteEmbed: React.FC<WebsiteEmbedProps> = ({
  url,
  title,
  description,
  image,
  width = 300,
}) => {
  const { getColor, getFont } = useStyles();

  // Calculate height based on content
  const imageHeight = image ? 150 : 0;

  // Extract hostname for display
  const hostname = useMemo(() => {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  }, [url]);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="no-underline block rounded-md overflow-hidden hover:opacity-95 transition-opacity"
      style={{
        width,
        backgroundColor: getColor("black-med"),
        border: `1px solid ${getColor("graphite-thin")}`,
        color: "inherit",
      }}
    >
      {image && (
        <div
          className="w-full bg-cover bg-center"
          style={{
            height: imageHeight,
            backgroundImage: `url(${image})`,
          }}
        />
      )}

      <div className="p-3">
        <div className="flex items-center">
          <div
            className="text-sm font-medium line-clamp-2 flex-1 mb-1"
            style={{
              color: getColor("smoke"),
              fontFamily: getFont("Text Primary"),
            }}
          >
            {title || "Website Link"}
          </div>
          <ExternalLink
            size={14}
            className="ml-1 flex-shrink-0 opacity-70"
            style={{ color: getColor("smoke-thin") }}
          />
        </div>

        {description && (
          <div
            className="text-xs line-clamp-3 mt-1"
            style={{
              color: getColor("smoke-med"),
              fontFamily: getFont("Text Secondary"),
            }}
          >
            {description}
          </div>
        )}

        <div
          className="text-xs mt-2 truncate"
          style={{ color: getColor("smoke-thin") }}
        >
          {hostname}
        </div>
      </div>
    </a>
  );
};
