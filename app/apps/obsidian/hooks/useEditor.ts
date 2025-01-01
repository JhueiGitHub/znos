// app/apps/obsidian/hooks/useEditor.ts
import { useState, useCallback, useEffect } from "react";

interface EditorState {
  content: string;
  selectionStart: number;
  selectionEnd: number;
}

export const useEditor = (initialContent: string = "") => {
  const [editorState, setEditorState] = useState<EditorState>({
    content: initialContent,
    selectionStart: 0,
    selectionEnd: 0,
  });

  const handleContentChange = useCallback(
    (
      textArea: HTMLTextAreaElement,
      newContent: string,
      onChange: (content: string) => void
    ) => {
      // Store current selection
      const selectionStart = textArea.selectionStart;
      const selectionEnd = textArea.selectionEnd;

      // Update state
      setEditorState({
        content: newContent,
        selectionStart,
        selectionEnd,
      });

      // Call original onChange
      onChange(newContent);

      // Restore selection in next tick
      requestAnimationFrame(() => {
        textArea.selectionStart = selectionStart;
        textArea.selectionEnd = selectionEnd;
      });
    },
    []
  );

  return {
    editorState,
    handleContentChange,
  };
};
