"use client";

import { useState, useEffect } from 'react';
import { 
  searchIndexManager, 
  SearchResult, 
  SearchResultType 
} from '@/app/services/SpotlightSearchIndex';
import { useAppStore } from '@/app/store/appStore';
import axios from 'axios';

export function useSpotlightSearch() {
  const [isReady, setIsReady] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { openApp } = useAppStore();

  // Initialize search index with API data
  useEffect(() => {
    const initialize = async () => {
      try {
        // We'll load data from an API instead of relying on VideoContext
        // This approach is much more reliable and works everywhere
        
        // Fetch any external results that need to be added to the search index
        try {
          const [mediaResponse, streamsResponse] = await Promise.all([
            axios.get('/api/media'),
            axios.get('/api/streams')
          ]);
          
          const mediaItems = mediaResponse.data || [];
          const streams = streamsResponse.data || [];
          
          // Convert to search results format
          const mediaResults: SearchResult[] = mediaItems.map((item: any) => ({
            id: `media-${item.id}`,
            type: 'media' as SearchResultType,
            title: item.name,
            description: item.description || 'Media file',
            thumbnail: item.type === 'IMAGE' ? item.url : undefined,
            icon: item.type === 'VIDEO' ? '/icns/_video.png' : '/icns/_font.png',
            metadata: {
              type: item.type,
              url: item.url
            },
            path: `/media/${item.id}`
          }));
          
          const streamResults: SearchResult[] = streams.map((stream: any) => ({
            id: `stream-${stream.id}`,
            type: 'stream' as SearchResultType,
            title: stream.name,
            description: stream.description || 'Stream',
            icon: '/icns/_folder.png',
            path: `/streams/${stream.id}`
          }));
          
          const flowResults: SearchResult[] = streams.flatMap((stream: any) => 
            (stream.flows || []).map((flow: any) => ({
              id: `flow-${flow.id}`,
              type: 'flow' as SearchResultType,
              title: flow.name,
              description: flow.description || 'Flow',
              icon: '/icns/_flow.png',
              parent: {
                id: `stream-${stream.id}`,
                type: 'stream' as SearchResultType,
                title: stream.name
              },
              path: `/streams/${stream.id}/flows/${flow.id}`
            }))
          );
          
          // Add to search index
          searchIndexManager.addExternalResults([
            ...mediaResults,
            ...streamResults,
            ...flowResults
          ]);
        } catch (error) {
          console.error('Error fetching external data:', error);
          // Continue with Glory app search even if external data fails
        }
        
        // Load recent searches from localStorage
        try {
          const savedSearches = localStorage.getItem('recentSearches');
          if (savedSearches) {
            setRecentSearches(JSON.parse(savedSearches));
          }
        } catch (error) {
          console.error('Error loading recent searches:', error);
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing search:', error);
      }
    };
    
    initialize();
  }, []);
  
  // Perform search when query changes
  useEffect(() => {
    if (!isReady) return;
    
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    // Small debounce for performance
    const handler = setTimeout(() => {
      const searchResults = searchIndexManager.search(query);
      setResults(searchResults);
      setIsSearching(false);
    }, 150);
    
    return () => clearTimeout(handler);
  }, [query, isReady]);
  
  // Handle saving recent searches
  const addRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updatedSearches = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5); // Keep only 5 most recent
    
    setRecentSearches(updatedSearches);
    
    try {
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };
  
  // Handle item selection and navigation
  const handleSelectResult = (result: SearchResult) => {
    // Add to recent searches
    addRecentSearch(result.title);
    
    // Handle navigation based on result type
    switch (result.type) {
      case 'app':
        openApp({
          id: 'glory',
          name: 'Glory',
          icon: 'glory-icon',
          dockPosition: 3,
          animationType: 'magnify',
          isMinimized: false,
        });
        break;
        
      case 'category':
        openApp({
          id: 'glory',
          name: 'Glory',
          icon: 'glory-icon',
          dockPosition: 3,
          animationType: 'magnify',
          isMinimized: false,
        });
        // Additional logic to navigate to category will be handled in the Glory app
        break;
        
      case 'series':
      case 'movie':
      case 'episode':
        // Simply open the Glory app - the additional navigation will be
        // handled by passing parameters to the URL/state
        openApp({
          id: 'glory',
          name: 'Glory',
          icon: 'glory-icon',
          dockPosition: 3,
          animationType: 'magnify',
          isMinimized: false,
          params: {
            contentType: result.type,
            contentId: result.id,
            parentId: result.parent?.id
          }
        });
        break;
        
      case 'flow':
        openApp({
          id: 'flow',
          name: 'Flow',
          icon: 'flow-icon',
          dockPosition: 1,
          animationType: 'magnify',
          isMinimized: false,
        });
        break;
        
      case 'stream':
        openApp({
          id: 'flow',
          name: 'Flow',
          icon: 'flow-icon',
          dockPosition: 1,
          animationType: 'magnify',
          isMinimized: false,
        });
        break;
        
      case 'media':
        openApp({
          id: 'stellar',
          name: 'Stellar',
          icon: 'stellar-icon',
          dockPosition: 2,
          animationType: 'grow',
          isMinimized: false,
        });
        break;
    }
  };
  
  return {
    query,
    setQuery,
    results,
    isSearching,
    isReady,
    recentSearches,
    handleSelectResult,
    clearRecentSearches: () => {
      setRecentSearches([]);
      localStorage.removeItem('recentSearches');
    }
  };
}
