// app/api/extract-url/route.ts
import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import * as cheerio from "cheerio";

// URL validation regex - more comprehensive than before
const URL_REGEX =
  /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;

// Function to detect URL type with improved patterns
function detectUrlType(url: string) {
  // YouTube video detection - handle more URL patterns
  if (
    url.includes("youtube.com/watch") ||
    url.includes("youtu.be/") ||
    url.includes("youtube.com/embed/") ||
    url.includes("youtube.com/v/") ||
    url.includes("youtube.com/user/") ||
    url.includes("youtube.com/shorts/")
  ) {
    return "youtube";
  }

  // Sketchfab model detection - handle more URL patterns
  if (
    url.includes("sketchfab.com/models/") ||
    url.includes("sketchfab.com/3d-models/")
  ) {
    return "sketchfab";
  }

  // Add more specialized types as needed

  // Default: treat as a general webpage
  return "website";
}

// Extract YouTube video ID with improved support for various URL formats
function extractYoutubeId(url: string) {
  // Handle youtube.com/watch?v= format
  const watchMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtu\.be\/)([^?&/#]+)/
  );
  if (watchMatch) return watchMatch[1];

  // Handle youtu.be/ format
  const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
  if (shortMatch) return shortMatch[1];

  // Handle youtube.com/shorts/ format (if not caught by the first regex)
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&#]+)/);
  if (shortsMatch) return shortsMatch[1];

  return null;
}

// Extract Sketchfab model ID with improved pattern matching
function extractSketchfabId(url: string) {
  // Match /models/ID or /3d-models/ID patterns
  const modelMatch = url.match(
    /sketchfab\.com\/(models|3d-models)\/([^/?&#]+)/
  );
  if (modelMatch) return modelMatch[2];

  return null;
}

// Function to fetch and extract OpenGraph data with error handling and timeouts
async function extractOpenGraphData(url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MilanoteClone/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract OpenGraph data
    const ogData: Record<string, string> = {};

    // Process OpenGraph tags
    $('meta[property^="og:"]').each((i, el) => {
      const property = $(el).attr("property")?.replace("og:", "");
      const content = $(el).attr("content");
      if (property && content) {
        ogData[property] = content;
      }
    });

    // Also check Twitter Card meta tags as fallback
    if (!ogData.title || !ogData.description || !ogData.image) {
      $('meta[name^="twitter:"]').each((i, el) => {
        const name = $(el).attr("name")?.replace("twitter:", "");
        const content = $(el).attr("content");
        if (content) {
          if (name === "title" && !ogData.title) ogData.title = content;
          if (name === "description" && !ogData.description)
            ogData.description = content;
          if (name === "image" && !ogData.image) ogData.image = content;
        }
      });
    }

    // Extract basic meta tags as fallback
    if (!ogData.title) {
      ogData.title = $("title").text() || url;
    }

    if (!ogData.description) {
      ogData.description = $('meta[name="description"]').attr("content") || "";
    }

    // Make sure image URLs are absolute
    if (ogData.image && !ogData.image.startsWith("http")) {
      try {
        const baseUrl = new URL(url);
        ogData.image = new URL(ogData.image, baseUrl.origin).toString();
      } catch (e) {
        console.error("Failed to resolve relative image URL", e);
      }
    }

    return ogData;
  } catch (error) {
    console.error("Error fetching URL:", error);
    return {
      title: new URL(url).hostname || url,
      description: "No description available",
      error:
        error instanceof Error ? error.message : "Failed to fetch URL data",
    };
  }
}

// Main route handler with improved error handling
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Validate URL
    if (typeof url !== "string" || !URL_REGEX.test(url)) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Normalize URL (ensure it has http/https prefix)
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

    // Detect URL type
    const urlType = detectUrlType(normalizedUrl);

    // Process based on URL type
    let embedData: Record<string, any> = {};

    switch (urlType) {
      case "youtube":
        const videoId = extractYoutubeId(normalizedUrl);
        if (videoId) {
          embedData = {
            type: "youtube",
            videoId,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          };

          try {
            // Also fetch OpenGraph data for title and description
            const ogData = await extractOpenGraphData(normalizedUrl);
            embedData = { ...embedData, ...ogData };
          } catch (ogError) {
            // If OpenGraph fetch fails, provide defaults
            embedData.title = embedData.title || "YouTube Video";
            embedData.description =
              embedData.description || `Video ID: ${videoId}`;
          }
        } else {
          // Couldn't extract video ID
          embedData = {
            type: "website",
            url: normalizedUrl,
            title: "YouTube",
            description: "Could not extract video ID from this YouTube URL.",
          };
        }
        break;

      case "sketchfab":
        const modelId = extractSketchfabId(normalizedUrl);
        if (modelId) {
          embedData = {
            type: "sketchfab",
            modelId,
            embedUrl: `https://sketchfab.com/models/${modelId}/embed`,
          };

          try {
            // Also fetch OpenGraph data for title and description
            const ogData = await extractOpenGraphData(normalizedUrl);
            embedData = { ...embedData, ...ogData };
          } catch (ogError) {
            // If OpenGraph fetch fails, provide defaults
            embedData.title = embedData.title || "3D Model";
            embedData.description =
              embedData.description || `Model ID: ${modelId}`;
          }
        } else {
          // Couldn't extract model ID
          embedData = {
            type: "website",
            url: normalizedUrl,
            title: "Sketchfab",
            description: "Could not extract model ID from this Sketchfab URL.",
          };
        }
        break;

      case "website":
      default:
        // For regular websites, just fetch OpenGraph data
        try {
          const ogData = await extractOpenGraphData(normalizedUrl);
          embedData = {
            type: "website",
            url: normalizedUrl,
            ...ogData,
          };
        } catch (ogError) {
          // If OpenGraph fetch fails, provide minimal data
          embedData = {
            type: "website",
            url: normalizedUrl,
            title: new URL(normalizedUrl).hostname,
            description: "No description available",
          };
        }
        break;
    }

    return NextResponse.json(embedData);
  } catch (error) {
    console.error("Error processing URL:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process URL",
      },
      { status: 500 }
    );
  }
}
