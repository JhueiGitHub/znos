import { create } from "zustand";
import { AppDefinition } from "../types/AppTypes";

interface AppWithState extends AppDefinition {
  state: Record<string, any>;
  isMinimized: boolean;
}

// Updated to include mediaId for video/image handling
interface OrionConfig {
  wallpaper?: {
    mode: "color" | "media";
    value: string | null;
    tokenId?: string;
    mediaId?: string; // Add mediaId to track video/image assets
  };
  dockIcons?: Array<{
    id: string;
    name: string;
    mode: "color" | "media";
    value: string | null;
    tokenId?: string;
    order: number;
    mediaId?: string; // Add mediaId to dock icons as well for consistency
  }>;
}

interface AppState {
  openApps: AppWithState[];
  activeAppId: string | null;
  orionConfig: OrionConfig; // Remove nullable to ensure config always exists

  // App window management
  openApp: (app: AppDefinition) => void;
  closeApp: (appId: string) => void;
  setActiveApp: (appId: string) => void;
  updateAppState: (appId: string, newState: Record<string, any>) => void;
  minimizeApp: (appId: string) => void;
  toggleAppMinimize: (appId: string) => void;

  // Orion configuration
  setOrionConfig: (config: OrionConfig) => void;
  updateWallpaper: (wallpaper: NonNullable<OrionConfig["wallpaper"]>) => void; // Make wallpaper non-nullable
  updateDockIcons: (icons: NonNullable<OrionConfig["dockIcons"]>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state with guaranteed orionConfig
  openApps: [],
  activeAppId: null,
  orionConfig: {
    wallpaper: {
      mode: "color",
      value: null,
      tokenId: "Black",
    },
    dockIcons: [],
  },

  // Original app window management methods remain unchanged
  openApp: (app) =>
    set((state) => {
      const existingApp = state.openApps.find(
        (openApp) => openApp.id === app.id
      );
      if (existingApp) {
        return {
          openApps: state.openApps.map((a) =>
            a.id === app.id ? { ...a, isMinimized: false } : a
          ),
          activeAppId: app.id,
        };
      }
      const newApp: AppWithState = { ...app, state: {}, isMinimized: false };
      return {
        openApps: [...state.openApps, newApp],
        activeAppId: app.id,
      };
    }),

  closeApp: (appId) =>
    set((state) => ({
      openApps: state.openApps.filter((app) => app.id !== appId),
      activeAppId:
        state.activeAppId === appId
          ? state.openApps.length > 1
            ? state.openApps[state.openApps.length - 2].id
            : null
          : state.activeAppId,
    })),

  setActiveApp: (appId) =>
    set((state) => ({
      activeAppId: appId,
      openApps: state.openApps.map((app) =>
        app.id === appId ? { ...app, isMinimized: false } : app
      ),
    })),

  updateAppState: (appId, newState) =>
    set((state) => ({
      openApps: state.openApps.map((app) =>
        app.id === appId
          ? { ...app, state: { ...app.state, ...newState } }
          : app
      ),
    })),

  minimizeApp: (appId) =>
    set((state) => ({
      openApps: state.openApps.map((app) =>
        app.id === appId ? { ...app, isMinimized: true } : app
      ),
      activeAppId: state.activeAppId === appId ? null : state.activeAppId,
    })),

  toggleAppMinimize: (appId) =>
    set((state) => {
      const app = state.openApps.find((a) => a.id === appId);
      if (!app) return state;

      if (app.isMinimized) {
        return {
          openApps: state.openApps.map((a) =>
            a.id === appId ? { ...a, isMinimized: false } : a
          ),
          activeAppId: appId,
        };
      } else {
        return {
          openApps: state.openApps.map((a) =>
            a.id === appId ? { ...a, isMinimized: true } : a
          ),
          activeAppId: state.activeAppId === appId ? null : state.activeAppId,
        };
      }
    }),

  // Updated Orion configuration methods with better type safety and state management
  setOrionConfig: (config) =>
    set({
      orionConfig: {
        ...config,
        // Ensure wallpaper has required properties
        wallpaper: {
          mode: config.wallpaper?.mode || "color",
          value: config.wallpaper?.value || null,
          tokenId: config.wallpaper?.tokenId || "Black",
          mediaId: config.wallpaper?.mediaId,
        },
        // Ensure dockIcons is always an array
        dockIcons: config.dockIcons || [],
      },
    }),

  // Enhanced updateWallpaper to properly merge with existing config
  updateWallpaper: (wallpaper) =>
    set((state) => ({
      orionConfig: {
        ...state.orionConfig,
        wallpaper: {
          ...state.orionConfig.wallpaper,
          ...wallpaper,
          // Ensure mode and value are always set
          mode: wallpaper.mode || state.orionConfig.wallpaper?.mode || "color",
          value: wallpaper.value ?? state.orionConfig.wallpaper?.value ?? null,
        },
      },
    })),

  // Enhanced updateDockIcons to maintain proper typing and structure
  updateDockIcons: (dockIcons) =>
    set((state) => ({
      orionConfig: {
        ...state.orionConfig,
        dockIcons: dockIcons.map((icon) => ({
          ...icon,
          // Ensure each icon has required properties
          mode: icon.mode || "color",
          value: icon.value || null,
          tokenId: icon.tokenId || undefined,
          mediaId: icon.mediaId || undefined,
        })),
      },
    })),
}));

export default useAppStore;
