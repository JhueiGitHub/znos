// app/apps/obsidian/hooks/useAurora.ts

import { useCallback } from "react";

export const useAurora = () => {
  const processContent = useCallback((content: string) => {
    // Process the content to identify and wrap arrows with special classes
    return content.replace(/(->\s)/g, '<span class="onyx-arrow">$1</span>');
  }, []);

  return { processContent };
};
