//app/apps/obsidian/hooks/useLayoutState.ts
"use client";

import { useState, useCallback } from "react";

export const useLayoutState = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  return {
    isSidebarCollapsed,
    toggleSidebar,
  };
};
