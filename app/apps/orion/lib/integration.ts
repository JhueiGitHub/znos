// // app/apps/orion/lib/integration.ts
// import { useEffect } from "react";
// import { useAppStore } from "@/app/store/appStore";
// import { useOrionStore } from "./store";
// import { StarfieldOptions } from "./types";

// /**
//  * Hook to integrate Orion with the OS
//  * - Syncs app state with OS window state
//  * - Handles window focus/blur
//  * - Saves canvas state on window close
//  */
// export function useOrionOSIntegration() {
//   const appStore = useAppStore();
//   const orionStore = useOrionStore();

//   // Sync app window state
//   useEffect(() => {
//     const appState =
//       appStore.openApps.find((app) => app.id === "orion")?.state || {};

//     // Restore canvas ID from app state if available
//     if (
//       appState.activeCanvasId &&
//       orionStore.canvases[appState.activeCanvasId]
//     ) {
//       orionStore.setActiveCanvas(appState.activeCanvasId);
//     }

//     // Restore starfield options if available
//     if (appState.starfieldOptions) {
//       orionStore.updateStarfieldOptions(
//         appState.starfieldOptions as Partial<StarfieldOptions>
//       );
//     }

//     // Restore UI state
//     if (typeof appState.isSidebarOpen === "boolean") {
//       if (appState.isSidebarOpen !== orionStore.isSidebarOpen) {
//         orionStore.toggleSidebar();
//       }
//     }

//     // Update app state when orion state changes
//     const unsubscribe = orionStore.subscribe((state) => {
//       appStore.updateAppState("orion", {
//         activeCanvasId: state.activeCanvasId,
//         starfieldOptions: state.starfieldOptions,
//         isSidebarOpen: state.isSidebarOpen,
//       });
//     });

//     return unsubscribe;
//   }, [appStore, orionStore]);

//   // Handle window focus/blur
//   useEffect(() => {
//     const handleFocus = () => {
//       // Refresh data or resume animations if needed
//     };

//     const handleBlur = () => {
//       // Pause animations or reduce resource usage when app not focused
//     };

//     window.addEventListener("focus", handleFocus);
//     window.addEventListener("blur", handleBlur);

//     return () => {
//       window.removeEventListener("focus", handleFocus);
//       window.removeEventListener("blur", handleBlur);
//     };
//   }, []);

//   // Save state on window close
//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       // Force-save any pending changes
//       localStorage.setItem(
//         "orion-storage",
//         JSON.stringify({
//           canvases: orionStore.canvases,
//           activeCanvasId: orionStore.activeCanvasId,
//           starfieldOptions: orionStore.starfieldOptions,
//         })
//       );
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, [orionStore]);

//   return {
//     closeOrion: () => {
//       appStore.closeApp("orion");
//     },
//     minimizeOrion: () => {
//       appStore.minimizeApp("orion");
//     },
//     createNewCanvas: orionStore.createCanvas,
//     activeCanvasId: orionStore.activeCanvasId,
//   };
// }
