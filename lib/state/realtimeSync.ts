// // /lib/state/realtimeSync.ts

// import { debounce } from "lodash";
// import axios from "axios";

// type ComponentUpdate = {
//   id: string;
//   type: "WALLPAPER" | "DOCK_ICON" | "COLOR_TOKEN" | "TYPOGRAPHY_TOKEN";
//   changes: Record<string, any>;
// };

// type UpdateStatus = "idle" | "pending" | "success" | "error";

// export class RealtimeStateManager {
//   private optimisticUpdates: Map<string, ComponentUpdate>;
//   private updateStatus: Map<string, UpdateStatus>;
//   private debouncedSync: ReturnType<typeof debounce>;

//   constructor() {
//     this.optimisticUpdates = new Map();
//     this.updateStatus = new Map();
//     this.debouncedSync = debounce(this.syncWithServer.bind(this), 1000);
//   }

//   async updateComponent(update: ComponentUpdate) {
//     try {
//       // 1. Apply optimistic update immediately
//       this.applyOptimisticUpdate(update);

//       // 2. Queue server sync
//       await this.debouncedSync(update);

//       return true;
//     } catch (error) {
//       this.handleError(update.id, error);
//       return false;
//     }
//   }

//   private applyOptimisticUpdate(update: ComponentUpdate) {
//     const { id, type, changes } = update;

//     // Store optimistic state
//     this.optimisticUpdates.set(id, update);
//     this.updateStatus.set(id, "pending");

//     // Update UI immediately based on component type
//     switch (type) {
//       case "DOCK_ICON":
//       case "WALLPAPER":
//         this.updateOrionConfig(id, changes);
//         break;
//       // Add other component types as needed
//     }
//   }

//   private async syncWithServer(update: ComponentUpdate) {
//     try {
//       const response = await axios.patch(
//         `/api/flows/components/${update.id}`,
//         update.changes
//       );

//       this.updateStatus.set(update.id, "success");
//       this.optimisticUpdates.delete(update.id);

//       return response.data;
//     } catch (error) {
//       this.handleError(update.id, error);
//       throw error;
//     }
//   }

//   private updateOrionConfig(componentId: string, changes: Record<string, any>) {
//     const { useAppStore } = require("@/app/store/appStore");
//     const currentConfig = useAppStore.getState().orionConfig;

//     // Handle dock icons
//     if (currentConfig?.dockIcons) {
//       const updatedDockIcons = currentConfig.dockIcons.map((icon) =>
//         icon.id === componentId ? { ...icon, ...changes } : icon
//       );

//       useAppStore.getState().setOrionConfig({
//         ...currentConfig,
//         dockIcons: updatedDockIcons,
//       });
//     }

//     // Handle wallpaper
//     if (
//       currentConfig?.wallpaper &&
//       componentId === currentConfig.wallpaper.id
//     ) {
//       useAppStore.getState().setOrionConfig({
//         ...currentConfig,
//         wallpaper: { ...currentConfig.wallpaper, ...changes },
//       });
//     }
//   }

//   private handleError(componentId: string, error: any) {
//     console.error(`Error updating component ${componentId}:`, error);
//     this.updateStatus.set(componentId, "error");

//     // Revert optimistic update
//     const previousUpdate = this.optimisticUpdates.get(componentId);
//     if (previousUpdate) {
//       const { useAppStore } = require("@/app/store/appStore");
//       const currentConfig = useAppStore.getState().orionConfig;

//       // Restore previous state
//       useAppStore.getState().setOrionConfig(currentConfig);
//     }

//     this.optimisticUpdates.delete(componentId);
//   }

//   getUpdateStatus(componentId: string): UpdateStatus {
//     return this.updateStatus.get(componentId) || "idle";
//   }
// }

// // Export singleton instance
// export const realtimeStateManager = new RealtimeStateManager();
