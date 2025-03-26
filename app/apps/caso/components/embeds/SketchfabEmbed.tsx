// app/apps/mila/components/embeds/SketchfabEmbed.tsx
import React, { useState, useEffect, useRef } from "react";
import { useStyles } from "@/app/hooks/useStyles";
import { Loader2, ExternalLink } from "lucide-react";

interface SketchfabEmbedProps {
  modelId: string;
  title?: string;
  width?: number;
  height?: number;
}

export const SketchfabEmbed: React.FC<SketchfabEmbedProps> = ({
  modelId,
  title = "3D Model",
  width = 320,
  height = 240,
}) => {
  const { getColor } = useStyles();
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Clean model ID to handle different URL formats
  const cleanModelId = modelId
    .replace("https://sketchfab.com/3d-models/", "")
    .replace("https://sketchfab.com/models/", "");

  // Create a direct embed URL
  const embedUrl = `https://sketchfab.com/models/${cleanModelId}/embed?autostart=1&ui_controls=1&ui_infos=1&ui_watermark=1&ui_watermark_link=1`;

  // Handle iframe load events
  const handleIframeLoad = () => {
    setLoading(false);
  };

  // Handle iframe errors
  const handleIframeError = () => {
    setError("Failed to load 3D model");
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        // If still loading after 5 seconds, show an error
        setError("3D model is taking too long to load");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div
      className="sketchfab-embed rounded relative overflow-hidden"
      style={{
        width,
        height,
        backgroundColor: getColor("night"),
      }}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin mb-2" size={24} color="white" />
            <div className="text-sm text-white">Loading 3D model...</div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="p-4 text-center">
            <div className="text-sm text-white mb-2">{error}</div>
            <a
              href={`https://sketchfab.com/3d-models/${cleanModelId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs underline text-blue-300 hover:text-blue-200"
            >
              View on Sketchfab
              <ExternalLink size={12} className="ml-1" />
            </a>
          </div>
        </div>
      )}

      {/* Direct iframe embed */}
      <iframe
        ref={iframeRef}
        title={title}
        width="100%"
        height="100%"
        src={embedUrl}
        frameBorder="0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      ></iframe>
    </div>
  );
};
