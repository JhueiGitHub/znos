//app/apps/obsidian/hooks/useHotkeys.ts
"use client";

import { useEffect } from "react";

type HotkeyCallback = (e: KeyboardEvent) => void;
type HotkeyDefinition = {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  callback: HotkeyCallback;
};

export const useHotkeys = (hotkeys: HotkeyDefinition[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      hotkeys.forEach(({ key, ctrlKey, altKey, shiftKey, callback }) => {
        if (
          e.key.toLowerCase() === key.toLowerCase() &&
          !!e.ctrlKey === !!ctrlKey &&
          !!e.altKey === !!altKey &&
          !!e.shiftKey === !!shiftKey
        ) {
          e.preventDefault();
          callback(e);
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hotkeys]);
};
