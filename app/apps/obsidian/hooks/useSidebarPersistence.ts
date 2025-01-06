// hooks/useSidebarPersistence.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface SidebarState {
  isVisible: boolean;
}

export const useSidebarPersistence = () => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await axios.get("/api/profile");
      return response.data;
    },
  });

  const STORAGE_KEY = `obsidian_sidebar_state_${profile?.id}`;

  // Load initial state from localStorage
  const [state, setState] = useState<SidebarState>(() => {
    if (typeof window === "undefined" || !profile?.id)
      return { isVisible: true };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { isVisible: true };
    } catch (e) {
      console.error("Error loading persisted sidebar state:", e);
      return { isVisible: true };
    }
  });

  // Update state when profile loads/changes
  useEffect(() => {
    if (profile?.id) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setState(JSON.parse(saved));
      }
    }
  }, [profile?.id, STORAGE_KEY]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (profile?.id) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, profile?.id, STORAGE_KEY]);

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, isVisible: !prev.isVisible }));
  }, []);

  return {
    isVisible: state.isVisible,
    toggleSidebar,
  };
};
