// /root/app/apps/obsidian/hooks/useShorthand.ts
import { useCallback } from "react";

interface UseShorthandProps {
  accentColor: string;
}

export const useShorthand = ({ accentColor }: UseShorthandProps) => {
  // Handle special character transformations
  const transformContent = useCallback(
    (content: string, selectionStart: number) => {
      console.log("Checking for shorthand transformation...");

      // Don't process if content is too short
      if (!content || content.length < 2) {
        console.log("Content too short for transformation");
        return { content, selectionStart };
      }

      // Look for hyphen + space pattern at cursor position
      const beforeCursor = content.slice(0, selectionStart);
      const afterCursor = content.slice(selectionStart);

      // Only transform if we just typed a space after a hyphen
      if (beforeCursor.endsWith("- ")) {
        console.log("Found hyphen + space pattern, transforming...");

        // Create the bullet point with color
        const bulletHtml = `• `;

        // Remove the hyphen and space, replace with bullet
        const newContent = beforeCursor.slice(0, -2) + bulletHtml + afterCursor;

        // Adjust cursor position to after bullet point
        const newSelectionStart = selectionStart - 1;

        console.log("Transformation complete:", {
          originalContent: content,
          newContent,
          originalCursor: selectionStart,
          newCursor: newSelectionStart,
        });

        return {
          content: newContent,
          selectionStart: newSelectionStart,
        };
      }

      console.log("No transformation needed");
      return { content, selectionStart };
    },
    []
  );

  // Handle keydown events to detect space after hyphen
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textArea = e.currentTarget;

      if (e.key === " ") {
        console.log("Space key pressed, checking context...");

        const cursorPosition = textArea.selectionStart;
        const beforeCursor = textArea.value.slice(0, cursorPosition - 1);

        if (beforeCursor.endsWith("-")) {
          console.log("Space after hyphen detected, preventing default");
          e.preventDefault();

          const result = transformContent(textArea.value, cursorPosition);

          if (result.content !== textArea.value) {
            // Update content
            textArea.value = result.content;

            // Trigger change event
            const event = new Event("input", { bubbles: true });
            textArea.dispatchEvent(event);

            // Update cursor position
            textArea.selectionStart = result.selectionStart;
            textArea.selectionEnd = result.selectionStart;
          }
        }
      }
    },
    [transformContent]
  );

  return {
    transformContent,
    handleKeyDown,
  };
};
