import React, { useState, useCallback, useEffect, useRef } from "react";
import { useStyles } from "@os/hooks/useStyles";
import { useNote } from "../contexts/note-context";
import { useDailyColor } from "../hooks/useDailyColor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import debounce from "lodash/debounce";
import { useShorthand } from "../hooks/useShorthand";
import { useShorthandStore } from "../stores/shorthand-store";

// Updated regex pattern to include both arrows and bullet points while preserving their original form
const SYMBOL_PATTERN = /(->|- |"|"|"|:|;)/g;

// Enhanced helper to identify symbol types including bullet points
const getSymbolType = (symbol: string) => {
  switch (symbol) {
    case "->":
      return "arrow";
    case "- ":
      return "bullet";
    case '"':
    case '"':
    case '"':
      return "quote";
    case ":":
    case ";":
      return "punctuation";
    default:
      return "text";
  }
};

// Enhanced PreviewContent component to handle both arrows and bullets
const PreviewContent: React.FC<{ content: string; accentColor: string }> =
  React.memo(({ content, accentColor }) => {
    // Split content by our symbol pattern while preserving the symbols
    const parts = content.split(SYMBOL_PATTERN).map((part, index) => {
      const symbolType = getSymbolType(part);

      if (symbolType === "text") {
        return part;
      }

      // Enhanced style configuration to handle both arrows and bullets
      const style = {
        color: accentColor,
        opacity: symbolType === "punctuation" ? 0.9 : 1,
        fontWeight: symbolType === "quote" ? 500 : "inherit",
      };

      // Special handling for bullet points
      if (symbolType === "bullet") {
        return (
          <span key={index} style={style}>
            • {/* Unicode bullet point replaces "- " */}
          </span>
        );
      }

      return (
        <span key={index} style={style}>
          {part}
        </span>
      );
    });

    return <div className="whitespace-pre-wrap">{parts}</div>;
  });

const Editor: React.FC = () => {
  const { getColor } = useStyles();
  const { activeNote, activeNoteId, saveScrollPosition, getScrollPosition } =
    useNote();
  const { accentColor } = useDailyColor();
  const [content, setContent] = useState(activeNote?.content || "");
  const queryClient = useQueryClient();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced scroll sync with requestAnimationFrame for performance
  // Enhanced scroll sync with requestAnimationFrame for performance
  const syncScroll = useCallback(
    (sourceElement: HTMLElement, targetElement: HTMLElement) => {
      requestAnimationFrame(() => {
        targetElement.scrollTop = sourceElement.scrollTop;
      });
    },
    []
  );

  const saveScrollDebounced = useCallback(
    debounce((noteId: string, position: number) => {
      saveScrollPosition(noteId, position);
    }, 100),
    [saveScrollPosition]
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const source = e.target as HTMLElement;
      if (editorRef.current && previewRef.current) {
        if (source === editorRef.current) {
          syncScroll(editorRef.current, previewRef.current);
        } else if (source === previewRef.current) {
          syncScroll(previewRef.current, editorRef.current);
        }
      }

      if (activeNoteId && editorRef.current) {
        saveScrollDebounced(activeNoteId, editorRef.current.scrollTop);
      }
    },
    [activeNoteId, saveScrollDebounced, syncScroll]
  );

  // Update scroll position when note changes
  useEffect(() => {
    if (activeNoteId && editorRef.current && previewRef.current) {
      const savedPosition = getScrollPosition(activeNoteId);
      editorRef.current.scrollTop = savedPosition;
      previewRef.current.scrollTop = savedPosition;
    }
  }, [activeNoteId, getScrollPosition]);

  // Update content when note changes
  useEffect(() => {
    setContent(activeNote?.content || "");
  }, [activeNote?.id]);

  // Note update mutation
  const { mutate: updateNote } = useMutation({
    mutationFn: async (newContent: string) => {
      const response = await axios.patch(
        `/api/obsidian/notes/${activeNote?.id}`,
        { content: newContent }
      );
      return response.data;
    },
    onSuccess: (updatedNote) => {
      queryClient.setQueryData(["note", activeNote?.id], updatedNote);
    },
  });

  const debouncedSave = useCallback(
    debounce((newContent: string) => {
      if (activeNote?.id) {
        updateNote(newContent);
      }
    }, 1000),
    [activeNote?.id]
  );

  const { handleKeyDown: handleShorthand } = useShorthand({
    accentColor,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textArea = e.currentTarget;
    const cursorPosition = textArea.selectionStart;
    const beforeCursor = textArea.value.slice(0, cursorPosition);
    const afterCursor = textArea.value.slice(cursorPosition);

    // Handle § key
    if (e.key === "§") {
      e.preventDefault();
      const rect = textArea.getBoundingClientRect();
      const lineHeight = parseInt(getComputedStyle(textArea).lineHeight);
      const lines = textArea.value.slice(0, cursorPosition).split("\n");
      const currentLineNumber = lines.length - 1;

      useShorthandStore.getState().setPosition({
        x: rect.left + 20,
        y: rect.top + currentLineNumber * lineHeight + 30,
      });
      useShorthandStore.getState().setIsOpen(true);
      useShorthandStore.getState().setFilterText("");
      return;
    }

    // Handle filtering when shorthand menu is open
    if (useShorthandStore.getState().isOpen) {
      if (e.key === "Backspace") {
        const currentFilter = useShorthandStore.getState().filterText;
        useShorthandStore.getState().setFilterText(currentFilter.slice(0, -1));
        return;
      }

      if (e.key.length === 1) {
        // Single character key
        useShorthandStore
          .getState()
          .setFilterText(useShorthandStore.getState().filterText + e.key);
        return;
      }
    }

    if (useShorthandStore.getState().isOpen && e.key === "Enter") {
      e.preventDefault();
      const selectedOption =
        useShorthandStore.getState().shorthandOptions[
          useShorthandStore.getState().selectedOptionIndex
        ];

      if (selectedOption) {
        const beforeCursor = textArea.value.slice(0, cursorPosition);
        const afterCursor = textArea.value.slice(cursorPosition);
        const newLine = beforeCursor.endsWith("\n") ? "" : "\n";

        // Insert the heading with proper spacing
        const headingText = `${beforeCursor}${newLine}${selectedOption.insertText}`;
        setContent(headingText + afterCursor);

        // Position cursor after the heading marker
        requestAnimationFrame(() => {
          if (textArea) {
            const newPosition = headingText.length;
            textArea.selectionStart = newPosition;
            textArea.selectionEnd = newPosition;
            textArea.focus(); // Ensure the textarea keeps focus
          }
        });

        useShorthandStore.getState().setIsOpen(false);
      }
    }

    // Handle space after hyphen (existing bullet point logic)
    if (
      e.key === " " &&
      beforeCursor.endsWith("-") &&
      !beforeCursor.endsWith("->")
    ) {
      handleShorthand(e);
      return;
    }

    // Handle enter key for bullet points
    if (e.key === "Enter") {
      const currentLine = beforeCursor.split("\n").pop() || "";

      // Check if we're in a bullet point line
      if (currentLine.startsWith("- ") || currentLine.startsWith("• ")) {
        // If the line only contains the bullet point with no content, remove the bullet
        if (currentLine.trim() === "-" || currentLine.trim() === "•") {
          e.preventDefault();
          const newContent = beforeCursor.slice(0, -2) + "\n" + afterCursor;
          setContent(newContent);
          debouncedSave(newContent);
          return;
        }

        // Otherwise, add a new bullet point
        e.preventDefault();
        const newContent = beforeCursor + "\n- " + afterCursor;
        setContent(newContent);

        // Set cursor position after the new bullet point
        requestAnimationFrame(() => {
          if (textArea) {
            const newPosition = cursorPosition + 3; // \n-
            textArea.selectionStart = newPosition;
            textArea.selectionEnd = newPosition;
          }
        });

        debouncedSave(newContent);
      }
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedSave(newContent);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
      saveScrollDebounced.cancel();
    };
  }, [debouncedSave, saveScrollDebounced]);

  if (!activeNote) {
    return (
      <div className="h-full bg-[#00000093] rounded-lg flex items-center justify-center">
        <div className="text-sm text-[#7E8691]/95">No note selected</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#00000093] rounded-lg flex justify-center">
      <div className="w-[970px] p-6 flex flex-col h-full">
        <h1
          className="text-2xl font-bold mb-4 flex-shrink-0"
          style={{
            fontFamily: "'ExemplarPro', system-ui",
            color: activeNote.isDaily ? accentColor : "#4C4F69",
            opacity: 0.81,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {activeNote.title}
        </h1>

        <div ref={containerRef} className="relative flex-grow overflow-hidden">
          <textarea
            ref={editorRef}
            value={content}
            onChange={handleContentChange}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full bg-transparent resize-none outline-none prose prose-invert overflow-y-auto"
            style={{
              fontFamily: "Dank",
              color: "transparent",
              caretColor: "#7E8691",
              zIndex: 1,
              padding: 0,
            }}
          />
          <div
            ref={previewRef}
            onScroll={handleScroll}
            className="absolute inset-0 w-full h-full pointer-events-none prose prose-invert overflow-y-auto"
            style={{
              fontFamily: "Dank",
              color: "#7E8691",
              zIndex: 2,
              padding: 0,
            }}
          >
            <PreviewContent content={content} accentColor={accentColor} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
