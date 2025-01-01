// /root/app/apps/obsidian/hooks/useEditorEngine.ts
import { useCallback, useEffect, useRef } from "react";
import { EditorEngine } from "../lib/syntax/useEditorEngine";

export const useEditorEngine = (
  editorRef: React.RefObject<HTMLTextAreaElement>,
  accentColor: string
) => {
  const observerRef = useRef<MutationObserver | null>(null);

  const processEditor = useCallback(() => {
    if (!editorRef.current) return;

    const textArea = editorRef.current;
    const content = textArea.value;
    const segments = EditorEngine.processText(content);
    const selectionStart = textArea.selectionStart;
    const selectionEnd = textArea.selectionEnd;

    // Create overlay for styled content
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      color: transparent;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: Dank;
      padding: inherit;
      font-size: inherit;
      line-height: inherit;
    `;

    segments.forEach((segment) => {
      const span = document.createElement("span");
      span.textContent = segment.text;

      if (segment.type === "arrow") {
        span.style.color = accentColor;
      }

      overlay.appendChild(span);
    });

    // Update or create overlay
    const existingOverlay =
      textArea.parentElement?.querySelector(".editor-overlay");
    if (existingOverlay) {
      existingOverlay.replaceWith(overlay);
    } else {
      textArea.parentElement?.appendChild(overlay);
    }
    overlay.className = "editor-overlay";

    // Restore selection
    textArea.setSelectionRange(selectionStart, selectionEnd);
  }, [accentColor]);

  useEffect(() => {
    if (!editorRef.current) return;

    const textArea = editorRef.current;

    // Set up the textarea container
    if (!textArea.parentElement?.style.position) {
      textArea.parentElement!.style.position = "relative";
    }

    // Initial processing
    processEditor();

    // Observe changes
    observerRef.current = new MutationObserver(processEditor);
    observerRef.current.observe(textArea, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    // Clean up
    return () => {
      observerRef.current?.disconnect();
      const overlay = textArea.parentElement?.querySelector(".editor-overlay");
      overlay?.remove();
    };
  }, [processEditor]);

  return { processEditor };
};
