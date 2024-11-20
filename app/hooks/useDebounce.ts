import { useState, useCallback, useRef } from "react";
import { debounce } from "lodash";
import { OrionFlowComponent } from "../apps/flow/components/editors/orion-flow-types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ComponentUpdate {
  componentId: string;
  updates: {
    mode?: "color" | "media";
    value?: string | null;
    mediaId?: string;
    tokenId?: string;
  };
}

interface UseAutosaveOptions {
  // Match EXACTLY with OrionSidebarProps.onUpdateComponent
  onSave: (
    id: string,
    updates: Partial<OrionFlowComponent>
  ) => Promise<OrionFlowComponent>;
  onSuccess?: (updatedComponent: OrionFlowComponent) => void;
  onError?: (error: any) => void;
  debounceMs?: number;
}

export function useAutosave({
  onSave,
  onSuccess,
  onError,
  debounceMs = 2000,
}: UseAutosaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const pendingSaveRef = useRef<{
    id: string;
    updates: Partial<OrionFlowComponent>;
  } | null>(null);
  const isSavingRef = useRef(false);

  const executeSave = useCallback(
    async (id: string, updates: Partial<OrionFlowComponent>) => {
      if (isSavingRef.current) {
        pendingSaveRef.current = { id, updates };
        return;
      }

      try {
        isSavingRef.current = true;
        setSaveStatus("saving");

        const result = await onSave(id, updates);

        setSaveStatus("saved");
        onSuccess?.(result);

        setTimeout(() => setSaveStatus("idle"), 1000);

        if (pendingSaveRef.current) {
          const pendingData = pendingSaveRef.current;
          pendingSaveRef.current = null;
          await executeSave(pendingData.id, pendingData.updates);
        }
      } catch (error) {
        setSaveStatus("error");
        onError?.(error);
        setTimeout(() => setSaveStatus("idle"), 2000);
      } finally {
        isSavingRef.current = false;
      }
    },
    [onSave, onSuccess, onError]
  );

  const debouncedSave = useCallback(debounce(executeSave, debounceMs), [
    executeSave,
    debounceMs,
  ]);

  const handleComponentUpdate = useCallback(
    (id: string, updates: Partial<OrionFlowComponent>) => {
      debouncedSave(id, updates);
    },
    [debouncedSave]
  );

  return { handleComponentUpdate, saveStatus };
}
