import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AppDefinition } from "../types/AppTypes";
import axios from "axios";

interface PersistedWindow {
  id: string;
  isMinimized: boolean;
  lastActive: boolean;
}

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
  lastWindowState: PersistedWindow[];

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
      lastWindowState: [],

      openApp: (app) =>
        set((state) => {
          const existingApp = state.openApps.find(
            (openApp) => openApp.id === app.id
          );

          // If app exists, just reactivate it
          if (existingApp) {
            return {
              openApps: state.openApps.map((a) =>
                a.id === app.id ? { ...a, isMinimized: false } : a
              ),
              activeAppId: app.id,
              lastWindowState: [
                { id: app.id, isMinimized: false, lastActive: true },
              ],
            };
          }

          // If opening new app, replace last window state entirely
          const newApp: AppWithState = {
            ...app,
            state: {},
            isMinimized: false,
          };
          return {
            openApps: [...state.openApps, newApp],
            activeAppId: app.id,
            lastWindowState: [
              { id: app.id, isMinimized: false, lastActive: true },
            ],
          };
        }),

      closeApp: (appId) =>
        set((state) => {
          const remainingApps = state.openApps.filter(
            (app) => app.id !== appId
          );
          const newActiveId =
            state.activeAppId === appId
              ? remainingApps.length > 0
                ? remainingApps[remainingApps.length - 1].id
                : null
              : state.activeAppId;

          // If we closed the last window, clear window state
          if (remainingApps.length === 0) {
            return {
              openApps: [],
              activeAppId: null,
              lastWindowState: [],
            };
          }

          // Otherwise store the new active window
          return {
            openApps: remainingApps,
            activeAppId: newActiveId,
            lastWindowState: newActiveId
              ? [{ id: newActiveId, isMinimized: false, lastActive: true }]
              : [],
          };
        }),

      setActiveApp: (appId) =>
        set((state) => ({
          activeAppId: appId,
          openApps: state.openApps.map((app) =>
            app.id === appId ? { ...app, isMinimized: false } : app
          ),
          lastWindowState: [
            { id: appId, isMinimized: false, lastActive: true },
          ],
        })),

      updateAppState: (appId, newState) =>
        set((state) => ({
          openApps: state.openApps.map((app) =>
            app.id === appId
              ? { ...app, state: { ...app.state, ...newState } }
              : app
          ),
          lastWindowState: state.lastWindowState.map((w) => ({
            ...w,
            isMinimized: w.id === appId ? newState.isMinimized : w.isMinimized,
          })),
        })),

      minimizeApp: (appId) =>
        set((state) => ({
          openApps: state.openApps.map((app) =>
            app.id === appId ? { ...app, isMinimized: true } : app
          ),
          activeAppId: state.activeAppId === appId ? null : state.activeAppId,
          lastWindowState: state.lastWindowState.map((w) => ({
            ...w,
            isMinimized: w.id === appId ? true : w.isMinimized,
          })),
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
              lastWindowState: [
                { id: appId, isMinimized: false, lastActive: true },
              ],
            };
          } else {
            return {
              openApps: state.openApps.map((a) =>
                a.id === appId ? { ...a, isMinimized: true } : a
              ),
              activeAppId:
                state.activeAppId === appId ? null : state.activeAppId,
              lastWindowState: [
                {
                  id: appId,
                  isMinimized: true,
                  lastActive: true,
                },
              ],
            };
          }
        }),

      setOrionConfig: (config) => set({ orionConfig: config }),
      updateWallpaper: (wallpaper) =>
        set((state) => ({
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
          orionConfig: {
            ...state.orionConfig,
            dockIcons,
          },
        })),
      setActiveOSFlowId: async (flowId) => {
        const response = await axios.put("/api/apps/orion/active-flow", {
          flowId,
        });
        set({ activeOSFlowId: response.data.flow.id });
      },
    }),
    {
      name: "app-window-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lastWindowState: state.lastWindowState,
        activeAppId: state.activeAppId,
      }),
    }
  )
);

export default useAppStore;
