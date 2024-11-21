// // /hooks/useRealtimeSync.ts

// import { useCallback } from "react";
// import {
//   realtimeStateManager,
//   ComponentUpdate,
// } from "@/lib/state/realtimeSync";
// import { useAppStore } from "@/app/store/appStore";

// export const useRealtimeSync = (
//   componentId: string,
//   componentType: ComponentUpdate["type"]
// ) => {
//   const updateStatus = realtimeStateManager.getUpdateStatus(componentId);

//   const updateComponent = useCallback(
//     (changes: Record<string, any>) => {
//       return realtimeStateManager.updateComponent({
//         id: componentId,
//         type: componentType,
//         changes,
//       });
//     },
//     [componentId, componentType]
//   );

//   return {
//     updateStatus,
//     updateComponent,
//   };
// };
