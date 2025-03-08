// app/apps/mila/components/embeds/LinkEmbed.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStyles } from "@/app/hooks/useStyles";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { SketchfabEmbed } from "./SketchfabEmbed";
import { WebsiteEmbed } from "./WebsiteEmbed";
import { Loader2 } from "lucide-react";

interface LinkEmbedProps {
  url: string;
  onLoad?: (embedData: any) => void;
}

export const LinkEmbed: React.FC<LinkEmbedProps> = ({ url, onLoad }) => {
  const { getColor } = useStyles();
  const [embedData, setEmbedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  const processedUrlRef = useRef("");

  // Initialize embedHeight with a responsive value based on embed type
  const [embedHeight, setEmbedHeight] = useState(240);

  // Directly detect different URL types for immediate rendering
  const isSketchfabUrl =
    url.includes("sketchfab.com/3d-models/") ||
    url.includes("sketchfab.com/models/");

  const isYoutubeUrl =
    url.includes("youtube.com/watch") ||
    url.includes("youtu.be/") ||
    url.includes("youtube.com/embed/");

  // Extract IDs directly if possible for immediate rendering
  const getSketchfabId = (url: string) => {
    // Extract ID from URLs like:
    // https://sketchfab.com/3d-models/shiva-diamond-dust-12cbdfbf6920486a948fc739ab5538e5
    // https://sketchfab.com/models/12cbdfbf6920486a948fc739ab5538e5

    // Try the /3d-models/ pattern first
    const modelPathMatch = url.match(
      /sketchfab\.com\/3d-models\/[^/]+-([a-f0-9]+)$/
    );
    if (modelPathMatch) return modelPathMatch[1];

    // Try the /models/ pattern
    const modelIdMatch = url.match(/sketchfab\.com\/models\/([a-f0-9]+)/);
    if (modelIdMatch) return modelIdMatch[1];

    // If we can't extract it, just return the whole URL and let the component handle it
    return url;
  };

  const getYoutubeId = (url: string) => {
    // Handle youtube.com/watch?v= format
    const watchMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtu\.be\/)([^?&/#]+)/
    );
    if (watchMatch) return watchMatch[1];

    // Handle youtu.be/ format
    const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
    if (shortMatch) return shortMatch[1];

    return null;
  };

  const sketchfabId = isSketchfabUrl ? getSketchfabId(url) : null;
  const youtubeId = isYoutubeUrl ? getYoutubeId(url) : null;

  // Use a memoized version of the fetch function to prevent re-renders
  const fetchEmbedData = useCallback(async () => {
    if (!url || url === processedUrlRef.current || fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      processedUrlRef.current = url;

      // Handle special URL types directly without API calls
      if (isSketchfabUrl && sketchfabId) {
        // For Sketchfab links, we'll create our own embedData without an API call
        const data = {
          type: "sketchfab",
          modelId: sketchfabId,
          url: url,
          title: "Sketchfab 3D Model",
        };

        setEmbedData(data);
        setEmbedHeight(320); // Larger height for 3D models

        // Call onLoad callback with the embed data
        if (onLoad && typeof onLoad === "function") {
          setTimeout(() => onLoad(data), 0);
        }

        setLoading(false);
        fetchingRef.current = false;
        return;
      }

      if (isYoutubeUrl && youtubeId) {
        // For YouTube links, we'll create our own embedData without an API call
        const data = {
          type: "youtube",
          videoId: youtubeId,
          url: url,
          title: "YouTube Video",
          thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
        };

        setEmbedData(data);
        setEmbedHeight(240); // Standard video height

        // Call onLoad callback with the embed data
        if (onLoad && typeof onLoad === "function") {
          setTimeout(() => onLoad(data), 0);
        }

        setLoading(false);
        fetchingRef.current = false;
        return;
      }

      // For other URLs, fetch from our API
      const response = await fetch("/api/extract-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL data: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Set appropriate embed height based on content type
      if (data.type === "youtube") {
        setEmbedHeight(240); // Standard 16:9 video height
      } else if (data.type === "sketchfab") {
        setEmbedHeight(320); // Taller for 3D models
      } else {
        setEmbedHeight(240); // Default height
      }

      setEmbedData(data);

      // Call onLoad callback with the embed data
      if (onLoad && typeof onLoad === "function") {
        // Make sure we don't trigger a re-render by making this call in a setTimeout
        setTimeout(() => {
          onLoad(data);
        }, 0);
      }
    } catch (err) {
      console.error("Error fetching embed data:", err);
      setError((err as Error)?.message || "Failed to load URL data");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [url, onLoad, isSketchfabUrl, sketchfabId, isYoutubeUrl, youtubeId]);

  // Only fetch once per URL and prevent re-fetching on re-renders
  useEffect(() => {
    if (url && url !== processedUrlRef.current && !fetchingRef.current) {
      fetchEmbedData();
    }
  }, [url, fetchEmbedData]);

  // Direct rendering for Sketchfab URLs without waiting for data fetching
  if (isSketchfabUrl && sketchfabId) {
    return (
      <SketchfabEmbed
        modelId={sketchfabId}
        title={embedData?.title || "3D Model"}
        width={300}
        height={320}
      />
    );
  }

  // Direct rendering for YouTube URLs without waiting for data fetching
  if (isYoutubeUrl && youtubeId) {
    return (
      <YouTubeEmbed
        videoId={youtubeId}
        title={embedData?.title || "YouTube Video"}
        width={300}
        height={240}
      />
    );
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          height: embedHeight,
          color: getColor("smoke-med"),
          backgroundColor: getColor("black-thick"),
          borderRadius: "0.375rem",
        }}
      >
        <Loader2 className="animate-spin mr-2" size={16} />
        <span className="text-sm">Loading preview...</span>
      </div>
    );
  }

  if (error || !embedData) {
    return (
      <div
        className="py-4 px-3 rounded-md text-sm"
        style={{
          backgroundColor: getColor("black-thick"),
          color: getColor("smoke-med"),
          minHeight: "100px",
        }}
      >
        <div className="font-medium mb-1">Unable to load preview</div>
        <div className="text-xs">{error || "Failed to fetch URL data"}</div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs block mt-2 underline truncate"
          style={{ color: getColor("latte-med") }}
        >
          {url}
        </a>
      </div>
    );
  }

  // Render the appropriate embed based on the data type
  switch (embedData.type) {
    case "youtube":
      return (
        <YouTubeEmbed
          videoId={embedData.videoId}
          title={embedData.title}
          thumbnailUrl={embedData.thumbnailUrl}
          width={300}
          height={embedHeight}
        />
      );

    case "sketchfab":
      return (
        <SketchfabEmbed
          modelId={embedData.modelId}
          title={embedData.title || "3D Model"}
          width={300}
          height={embedHeight}
        />
      );

    case "website":
    default:
      return (
        <WebsiteEmbed
          url={embedData.url}
          title={embedData.title}
          description={embedData.description}
          image={embedData.image}
          width={300}
        />
      );
  }
};
