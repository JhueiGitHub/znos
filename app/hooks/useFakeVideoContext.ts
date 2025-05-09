"use client";

import { GLORY_CONTENT } from '../services/gloryContent';

// This is a standalone replacement for useVideo that doesn't rely on React Context
export function useFakeVideoContext() {
  // It simply returns direct access to the hard-coded content
  return {
    categories: GLORY_CONTENT,
    currentEpisode: null,
    currentContent: null,
    setCurrentEpisode: () => {}, 
    setCurrentContent: () => {}
  };
}
