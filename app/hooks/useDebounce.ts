import { useState, useCallback, useRef } from "react";
import { debounce } from "lodash";
import { OrionFlowComponent } from "../apps/flow/components/editors/orion-flow-types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutosaveOptions {
  onSave: (
    id: string | string[],
    updates: Partial<OrionFlowComponent>
  ) => Promise<OrionFlowComponent | OrionFlowComponent[]>;
  onSuccess?: (
    updatedComponent: OrionFlowComponent | OrionFlowComponent[]
  ) => void;
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
    id: string | string[];
    updates: Partial<OrionFlowComponent>;
  } | null>(null);
  const isSavingRef = useRef(false);
  const lastSuccessfulSaveRef = useRef<
    OrionFlowComponent | OrionFlowComponent[] | null
  >(null);

  const executeSave = useCallback(
    async (id: string | string[], updates: Partial<OrionFlowComponent>) => {
      if (isSavingRef.current) {
        pendingSaveRef.current = { id, updates };
        return;
      }

      try {
        isSavingRef.current = true;
        setSaveStatus("saving");

        // Optimistically update UI before server response
        if (onSuccess && lastSuccessfulSaveRef.current) {
          if (Array.isArray(id)) {
            // For bulk updates
            const optimisticUpdates = Array.isArray(
              lastSuccessfulSaveRef.current
            )
              ? lastSuccessfulSaveRef.current.map((comp) => ({
                  ...comp,
                  ...updates,
                }))
              : [{ ...lastSuccessfulSaveRef.current, ...updates }];
            onSuccess(optimisticUpdates);
          } else {
            // For single updates
            const optimisticUpdate = {
              ...(Array.isArray(lastSuccessfulSaveRef.current)
                ? lastSuccessfulSaveRef.current[0]
                : lastSuccessfulSaveRef.current),
              ...updates,
              id,
            };
            onSuccess(optimisticUpdate);
          }
        }

        const result = await onSave(id, updates);
        lastSuccessfulSaveRef.current = result;

        setSaveStatus("saved");
        onSuccess?.(result);

        const timeout = setTimeout(() => {
          if (saveStatus === "saved") {
            setSaveStatus("idle");
          }
        }, 1000);

        if (pendingSaveRef.current) {
          const pendingData = pendingSaveRef.current;
          pendingSaveRef.current = null;
          await executeSave(pendingData.id, pendingData.updates);
        }
      } catch (error) {
        setSaveStatus("error");
        onError?.(error);

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
    debounce((id: string | string[], updates: Partial<OrionFlowComponent>) => {
      executeSave(id, updates);
    }, debounceMs),
    [executeSave, debounceMs]
  );

  const handleComponentUpdate = useCallback(
    (id: string | string[], updates: Partial<OrionFlowComponent>) => {
      // Apply update optimistically before debounced save
      if (onSuccess && lastSuccessfulSaveRef.current) {
        if (Array.isArray(id)) {
          const optimisticUpdates = Array.isArray(lastSuccessfulSaveRef.current)
            ? lastSuccessfulSaveRef.current.map((comp) => ({
                ...comp,
                ...updates,
              }))
            : [{ ...lastSuccessfulSaveRef.current, ...updates }];
          onSuccess(optimisticUpdates);
        } else {
          const optimisticUpdate = {
            ...(Array.isArray(lastSuccessfulSaveRef.current)
              ? lastSuccessfulSaveRef.current[0]
              : lastSuccessfulSaveRef.current),
            ...updates,
            id,
          };
          onSuccess(optimisticUpdate);
        }
      }
      debouncedSave(id, updates);
    },
    [debouncedSave, onSuccess]
  );

  return { handleComponentUpdate, saveStatus };
}
