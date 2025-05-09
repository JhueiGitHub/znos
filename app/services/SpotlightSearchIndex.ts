"use client";

import Fuse from 'fuse.js';
import { GLORY_CONTENT } from './gloryContent';

// Define the types for our search results
export type SearchResultType = 
  | 'app' 
  | 'category' 
  | 'series' 
  | 'movie' 
  | 'episode'
  | 'media'
  | 'flow'
  | 'stream';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  icon?: string;
  thumbnail?: string;
  parent?: {
    id: string;
    type: SearchResultType;
    title: string;
  };
  metadata?: Record<string, any>;
  path?: string; // Used for navigation - could be URL or internal path
}

// Build the Glory app search index
function buildGlorySearchIndex(categoriesData: any[] = []): SearchResult[] {
  const gloryResults: SearchResult[] = [];
  
  // Add the Glory app itself
  gloryResults.push({
    id: 'glory-app',
    type: 'app',
    title: 'Glory',
    description: 'Video streaming application',
    icon: '/apps/glory/glory_thumbnail.png',
    path: '/apps/glory'
  });
  
  // Add categories if available
  if (categoriesData && categoriesData.length > 0) {
    categoriesData.forEach(category => {
    // Add the category
    gloryResults.push({
      id: `category-${category.id}`,
      type: 'category',
      title: category.name,
      description: `${category.name} video category`,
      thumbnail: category.content[0]?.thumbnail,
      path: `/apps/glory/categories/${category.id}`
    });
    
    // Add content (series and movies)
    category.content.forEach(content => {
      const contentResult: SearchResult = {
        id: `${content.type}-${content.id}`,
        type: content.type,
        title: content.title,
        description: content.description,
        thumbnail: content.thumbnail,
        metadata: {
          rating: content.rating,
          maturityRating: content.maturityRating
        },
        parent: {
          id: `category-${category.id}`,
          type: 'category',
          title: category.name
        },
        path: `/apps/glory/${content.type}/${content.id}`
      };
      
      gloryResults.push(contentResult);
      
      // For series, add all episodes
      if (content.type === 'series') {
        content.episodes.forEach((episode, index) => {
          gloryResults.push({
            id: `episode-${content.id}-${index}`,
            type: 'episode',
            title: episode.title,
            description: episode.description || `Episode ${index + 1} of ${content.title}`,
            thumbnail: content.thumbnail,
            metadata: {
              duration: episode.duration,
              videoId: episode.videoId,
              platform: episode.platform || 'default'
            },
            parent: {
              id: `series-${content.id}`,
              type: 'series',
              title: content.title
            },
            path: `/apps/glory/series/${content.id}/episode/${index}`
          });
        });
      }
    });
    });
  }
  
  return gloryResults;
}

// Class to manage the search index
class SearchIndexManager {
  private static instance: SearchIndexManager;
  private glorySearchIndex: Fuse<SearchResult>;
  private allResults: SearchResult[] = [];
  private isInitialized = false;
  
  private constructor() {
    // Initialize with glory content from our hardcoded data
    this.allResults = buildGlorySearchIndex(GLORY_CONTENT);
    
    // Create Fuse.js instance for fuzzy search
    this.glorySearchIndex = new Fuse(this.allResults, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'description', weight: 1 },
        { name: 'parent.title', weight: 0.5 }
      ],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true
    });
    
    this.isInitialized = true; // We've loaded the data, so we're ready
  }
  
  public static getInstance(): SearchIndexManager {
    if (!SearchIndexManager.instance) {
      SearchIndexManager.instance = new SearchIndexManager();
    }
    return SearchIndexManager.instance;
  }
  
  // Initialize with Glory content
  public initializeWithGloryContent(categoriesData: any[]): void {
    // Build the search index with the categories data
    this.allResults = buildGlorySearchIndex(categoriesData);
    
    // Recreate the index with the updated results
    this.glorySearchIndex = new Fuse(this.allResults, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'description', weight: 1 },
        { name: 'parent.title', weight: 0.5 }
      ],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true
    });
    
    this.isInitialized = true;
  }
  
  // Method to add external results (from APIs)
  public addExternalResults(results: SearchResult[]): void {
    this.allResults = [...this.allResults, ...results];
    
    // Recreate the index with the updated results
    this.glorySearchIndex = new Fuse(this.allResults, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'description', weight: 1 },
        { name: 'parent.title', weight: 0.5 }
      ],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true
    });
  }
  
  // Search method
  public search(query: string, filters?: {types?: SearchResultType[]}): SearchResult[] {
    if (!query) return [];
    
    const searchResults = this.glorySearchIndex.search(query);
    let filteredResults = searchResults.map(result => result.item);
    
    // Apply type filters if provided
    if (filters?.types && filters.types.length > 0) {
      filteredResults = filteredResults.filter(result => 
        filters.types!.includes(result.type)
      );
    }
    
    return filteredResults;
  }
  
  // Get all results of specific types
  public getResultsByType(types: SearchResultType[]): SearchResult[] {
    return this.allResults.filter(result => types.includes(result.type));
  }
  
  // Check if the index is initialized
  public isReady(): boolean {
    return this.isInitialized;
  }
}

export const searchIndexManager = SearchIndexManager.getInstance();
