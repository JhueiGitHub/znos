import { create } from "zustand";
import { AppDefinition } from "../types/AppTypes";

// PRESERVED: Original AppWithState interface unchanged
interface AppWithState extends AppDefinition {
  state: Record<string, any>;
  isMinimized: boolean;
}

// PRESERVED: Original OrionConfig interface with all fields
interface OrionConfig {
  wallpaper?: {
    mode: "color" | "media";
    value: string | null;
    tokenId?: string;
    mediaId?: string;
  };
  dockIcons?: Array<{
    id: string;
    name: string;
    mode: "color" | "media";
    value: string | null;
    tokenId?: string;
    order: number;
    mediaId?: string;
  }>;
}

// EVOLVED: AppState interface with new activeOSFlowId
interface AppState {
  // PRESERVED: Original state
  openApps: AppWithState[];
  activeAppId: string | null;
  orionConfig: OrionConfig | null; // PRESERVED: Nullable

  // NEW: Active flow tracking
  activeOSFlowId: string | null;

  // PRESERVED: Original app window methods
  openApp: (app: AppDefinition) => void;
  closeApp: (appId: string) => void;
  setActiveApp: (appId: string) => void;
  updateAppState: (appId: string, newState: Record<string, any>) => void;
  minimizeApp: (appId: string) => void;
  toggleAppMinimize: (appId: string) => void;

  // PRESERVED: Original Orion methods
  setOrionConfig: (config: OrionConfig) => void;
  updateWallpaper: (wallpaper: NonNullable<OrionConfig["wallpaper"]>) => void;
  updateDockIcons: (icons: NonNullable<OrionConfig["dockIcons"]>) => void;

  // NEW: Active flow method
  setActiveOSFlowId: (flowId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // PRESERVED: Original initial state
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

  // NEW: Initial active flow state
  activeOSFlowId: null,

  // PRESERVED: Original app window management methods exactly as is
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

  // PRESERVED: Original Orion config methods with all safety checks
  setOrionConfig: (config) =>
    set({
      orionConfig: {
        ...config,
        wallpaper: {
          mode: config.wallpaper?.mode || "color",
          value: config.wallpaper?.value || null,
          tokenId: config.wallpaper?.tokenId || "Black",
          mediaId: config.wallpaper?.mediaId,
        },
        dockIcons: config.dockIcons || [],
      },
    }),

  updateWallpaper: (wallpaper) =>
    set((state) => ({
      orionConfig: {
        ...state.orionConfig,
        wallpaper: {
          ...state.orionConfig?.wallpaper,
          ...wallpaper,
          mode: wallpaper.mode || state.orionConfig?.wallpaper?.mode || "color",
          value: wallpaper.value ?? state.orionConfig?.wallpaper?.value ?? null,
        },
      },
    })),

  updateDockIcons: (dockIcons) =>
    set((state) => ({
      orionConfig: {
        ...state.orionConfig,
        dockIcons: dockIcons.map((icon) => ({
          ...icon,
          mode: icon.mode || "color",
          value: icon.value || null,
          tokenId: icon.tokenId || undefined,
          mediaId: icon.mediaId || undefined,
        })),
      },
    })),

  // NEW: Active flow management
  setActiveOSFlowId: (flowId) => set({ activeOSFlowId: flowId }),
}));

export default useAppStore;