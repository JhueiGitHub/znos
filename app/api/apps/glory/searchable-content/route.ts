import { NextResponse } from "next/server";

// Import directly from the Glory app data source
import { CATEGORIES_DATA } from "@/app/apps/glory/context/VideoContext";

export async function GET() {
  try {
    const searchableItems: any[] = [];
    
    // Process all categories, series, movies, and episodes
    CATEGORIES_DATA.forEach(category => {
      category.content.forEach(content => {
        // Add the series/movie itself
        searchableItems.push({
          id: `glory-${content.type}-${content.id}`,
          type: content.type === "series" ? "glory-series" : "glory-movie",
          category: category.name,
          title: content.title,
          thumbnail: content.thumbnail,
          description: content.description,
          rating: content.rating,
          maturityRating: content.maturityRating,
          data: content
        });

        // For series, also add individual episodes
        if (content.type === "series") {
          content.episodes.forEach((episode, index) => {
            searchableItems.push({
              id: `glory-episode-${content.id}-${index}`,
              type: "glory-episode",
              category: category.name,
              title: episode.title,
              thumbnail: content.thumbnail, // Use series thumbnail for episode
              description: episode.description || "",
              duration: episode.duration,
              parentId: content.id, // Reference to parent series
              parentTitle: content.title,
              data: episode
            });
          });
        }
      });
    });
    
    return NextResponse.json(searchableItems);
  } catch (error) {
    console.error("Error fetching Glory searchable content:", error);
    return NextResponse.json({ error: "Failed to fetch Glory content" }, { status: 500 });
  }
}
