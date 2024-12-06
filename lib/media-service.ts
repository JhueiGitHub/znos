// lib/media-service.ts
import axios from "axios";

export const mediaService = {
  // EVOLVED: Consistent media fetching with proper headers
  async getMedia(type?: "VIDEO" | "IMAGE" | "FONT") {
    const params = type ? { type } : {};
    const response = await axios.get("/api/media", {
      params,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    // EVOLVED: Process URLs for consistent protocol
    return response.data.map((item: any) => ({
      ...item,
      url: ensureHttps(item.url),
    }));
  },
};

// EVOLVED: Ensure consistent HTTPS protocol
function ensureHttps(url: string) {
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  if (url.startsWith("http:")) {
    return url.replace("http:", "https:");
  }
  return url;
}
