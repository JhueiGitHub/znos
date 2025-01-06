import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AppDefinition } from "../types/AppTypes";
import axios from "axios";

interface AppWithState extends AppDefinition {
  state: Record<string, any>;
  isMinimized: boolean;
}

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

interface AppState {
  openApps: AppWithState[];
  activeAppId: string | null;
  orionConfig: OrionConfig | null;
  activeOSFlowId: string | null;

  openApp: (app: AppDefinition) => void;
  closeApp: (appId: string) => void;
  setActiveApp: (appId: string) => void;
  updateAppState: (appId: string, newState: Record<string, any>) => void;
  minimizeApp: (appId: string) => void;
  toggleAppMinimize: (appId: string) => void;
  setOrionConfig: (config: OrionConfig) => void;
  updateWallpaper: (wallpaper: NonNullable<OrionConfig["wallpaper"]>) => void;
  updateDockIcons: (icons: NonNullable<OrionConfig["dockIcons"]>) => void;
  setActiveOSFlowId: (flowId: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
      activeOSFlowId: null,

      openApp: (app) =>
        set((state) => {
          const existingApp = state.openApps.find(
            (openApp) => openApp.id === app.id
          );
          if (existingApp) {
            return {
              ...state,
              openApps: state.openApps.map((a) =>
                a.id === app.id ? { ...a, isMinimized: false } : a
              ),
              activeAppId: app.id,
            };
          }

          return {
            ...state,
            openApps: [
              ...state.openApps,
              { ...app, state: {}, isMinimized: false },
            ],
            activeAppId: app.id,
          };
        }),

      closeApp: (appId) =>
        set((state) => {
          const remainingApps = state.openApps.filter(
            (app) => app.id !== appId
          );
          if (remainingApps.length === 0) {
            window.localStorage.clear(); // Nuclear option - clear everything
            return {
              ...state,
              openApps: [],
              activeAppId: null,
            };
          }

          return {
            ...state,
            openApps: remainingApps,
            activeAppId:
              state.activeAppId === appId
                ? remainingApps[remainingApps.length - 1].id
                : state.activeAppId,
          };
        }),

      setActiveApp: (appId) =>
        set((state) => ({
          ...state,
          activeAppId: appId,
          openApps: state.openApps.map((app) =>
            app.id === appId ? { ...app, isMinimized: false } : app
          ),
        })),

      updateAppState: (appId, newState) =>
        set((state) => ({
          ...state,
          openApps: state.openApps.map((app) =>
            app.id === appId
              ? { ...app, state: { ...app.state, ...newState } }
              : app
          ),
        })),

      minimizeApp: (appId) =>
        set((state) => ({
          ...state,
          openApps: state.openApps.map((app) =>
            app.id === appId ? { ...app, isMinimized: true } : app
          ),
          activeAppId: state.activeAppId === appId ? null : state.activeAppId,
        })),

      toggleAppMinimize: (appId) =>
        set((state) => {
          const app = state.openApps.find((a) => a.id === appId);
          if (!app) return state;

          return {
            ...state,
            openApps: state.openApps.map((a) =>
              a.id === appId ? { ...a, isMinimized: !a.isMinimized } : a
            ),
            activeAppId: app.isMinimized
              ? appId
              : state.activeAppId === appId
                ? null
                : state.activeAppId,
          };
        }),

      setOrionConfig: (config) =>
        set((state) => ({ ...state, orionConfig: config })),

      updateWallpaper: (wallpaper) =>
        set((state) => ({
          ...state,
          orionConfig: {
            ...state.orionConfig,
            wallpaper: {
              ...state.orionConfig?.wallpaper,
              ...wallpaper,
            },
          },
        })),

      updateDockIcons: (dockIcons) =>
        set((state) => ({
          ...state,
          orionConfig: {
            ...state.orionConfig,
            dockIcons,
          },
        })),

      setActiveOSFlowId: async (flowId) => {
        const response = await axios.put("/api/apps/orion/active-flow", {
          flowId,
        });
        set((state) => ({ ...state, activeOSFlowId: response.data.flow.id }));
      },
    }),
    {
      name: "app-window-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        openApps: state.openApps,
      }),
    }
  )
);

export default useAppStore;
