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
  const lastSuccessfulSaveRef = useRef<OrionFlowComponent | null>(null);

  const executeSave = useCallback(
    async (id: string, updates: Partial<OrionFlowComponent>) => {
      if (isSavingRef.current) {
        pendingSaveRef.current = { id, updates };
        return;
      }

      try {
        isSavingRef.current = true;
        setSaveStatus("saving");

        // Optimistically update UI before server response
        if (onSuccess && lastSuccessfulSaveRef.current) {
          const optimisticUpdate = {
            ...lastSuccessfulSaveRef.current,
            ...updates,
            id,
          };
          onSuccess(optimisticUpdate);
        }

        const result = await onSave(id, updates);
        lastSuccessfulSaveRef.current = result;

        setSaveStatus("saved");
        onSuccess?.(result);

        // Reset status after a delay without triggering refresh
        const timeout = setTimeout(() => {
          if (saveStatus === "saved") {
            setSaveStatus("idle");
          }
        }, 1000);

        // Handle any pending saves that came in while we were saving
        if (pendingSaveRef.current) {
          const pendingData = pendingSaveRef.current;
          pendingSaveRef.current = null;
          await executeSave(pendingData.id, pendingData.updates);
        }
      } catch (error) {
        setSaveStatus("error");
        onError?.(error);

        // If error, revert to last successful state
        if (onSuccess && lastSuccessfulSaveRef.current) {
          onSuccess(lastSuccessfulSaveRef.current);
        }

        const timeout = setTimeout(() => {
          if (saveStatus === "error") {
            setSaveStatus("idle");
          }
        }, 2000);
      } finally {
        isSavingRef.current = false;
      }
    },
    [onSave, onSuccess, onError, saveStatus]
  );

  const debouncedSave = useCallback(
    debounce((id: string, updates: Partial<OrionFlowComponent>) => {
      executeSave(id, updates);
    }, debounceMs),
    [executeSave, debounceMs]
  );

  const handleComponentUpdate = useCallback(
    (id: string, updates: Partial<OrionFlowComponent>) => {
      // Apply update optimistically before debounced save
      if (onSuccess && lastSuccessfulSaveRef.current) {
        const optimisticUpdate = {
          ...lastSuccessfulSaveRef.current,
          ...updates,
          id,
        };
        onSuccess(optimisticUpdate);
      }
      debouncedSave(id, updates);
    },
    [debouncedSave, onSuccess]
  );

  return { handleComponentUpdate, saveStatus };
}
