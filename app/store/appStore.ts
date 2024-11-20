// store/appStore.ts
import { create } from "zustand";
import { AppDefinition } from "../types/AppTypes";

interface AppWithState extends AppDefinition {
  state: Record<string, any>;
  isMinimized: boolean;
}

interface OrionConfig {
  wallpaper?: {
    mode: "color" | "media";
    value: string | null;
    tokenId?: string;
  };
  dockIcons?: Array<{
    id: string;
    name: string;
    mode: "color" | "media";
    value: string | null;
    tokenId?: string;
    order: number;
  }>;
}

interface AppState {
  openApps: AppWithState[];
  activeAppId: string | null;
  orionConfig: OrionConfig | null;

  // App window management
  openApp: (app: AppDefinition) => void;
  closeApp: (appId: string) => void;
  setActiveApp: (appId: string) => void;
  updateAppState: (appId: string, newState: Record<string, any>) => void;
  minimizeApp: (appId: string) => void;
  toggleAppMinimize: (appId: string) => void;

  // Orion configuration
  setOrionConfig: (config: OrionConfig) => void;
  updateWallpaper: (wallpaper: OrionConfig["wallpaper"]) => void;
  updateDockIcons: (icons: NonNullable<OrionConfig["dockIcons"]>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  openApps: [],
  activeAppId: null,
  orionConfig: {
    wallpaper: {
      mode: "color",
      value: null,
      tokenId: "Black", // Default system color
    },
    dockIcons: [],
  },

  // Original app window management methods (unchanged)
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

  // New Orion configuration methods
  setOrionConfig: (config) => set({ orionConfig: config }),

  updateWallpaper: (wallpaper) =>
    set((state) => ({
      orionConfig: {
        ...state.orionConfig,
        wallpaper,
      },
    })),
  updateDockIcons: (dockIcons) =>
    set((state) => ({
      orionConfig: {
        ...state.orionConfig,
        dockIcons,
      },
    })),
}));
