import React, { useState, useCallback, useEffect, useRef } from "react";
import { useStyles } from "@os/hooks/useStyles";
import { useNote } from "../contexts/note-context";
import { useDailyColor } from "../hooks/useDailyColor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import debounce from "lodash/debounce";

// Regex pattern for all special symbols we want to style
const SYMBOL_PATTERN = /(->|"|"|"|:|;)/g;

// Helper to identify symbol types
const getSymbolType = (symbol: string) => {
  switch (symbol) {
    case "->":
      return "arrow";
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

const PreviewContent: React.FC<{ content: string; accentColor: string }> =
  React.memo(({ content, accentColor }) => {
    // Split content by our symbol pattern while preserving the symbols
    const parts = content.split(SYMBOL_PATTERN).map((part, index) => {
      const symbolType = getSymbolType(part);

      if (symbolType === "text") {
        return part;
      }

      // Style configuration based on symbol type
      const style = {
        color: accentColor,
        opacity: symbolType === "punctuation" ? 0.9 : 1, // Slightly dimmed punctuation
        fontWeight: symbolType === "quote" ? 500 : "inherit", // Slightly bolder quotes
      };

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

  // Existing scroll handling
  const saveScrollDebounced = useCallback(
    debounce((position: number) => {
      if (activeNoteId) {
        saveScrollPosition(activeNoteId, position);
      }
    }, 100),
    [activeNoteId, saveScrollPosition]
  );

  const handleScroll = useCallback(() => {
    if (editorRef.current && activeNoteId) {
      saveScrollDebounced(editorRef.current.scrollTop);
      if (previewRef.current) {
        previewRef.current.scrollTop = editorRef.current.scrollTop;
      }
    }
  }, [activeNoteId, saveScrollDebounced]);

  // Restore scroll position
  useEffect(() => {
    if (editorRef.current && activeNoteId) {
      const savedPosition = getScrollPosition(activeNoteId);
      editorRef.current.scrollTop = savedPosition;
      if (previewRef.current) {
        previewRef.current.scrollTop = savedPosition;
      }
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
      <div className="w-[970px] p-6">
        <h1
          className="text-2xl font-bold mb-4"
          style={{
            fontFamily: "ExemplarPro",
            color: activeNote.isDaily ? accentColor : "#4C4F69",
            opacity: 0.81,
          }}
        >
          {activeNote.title}
        </h1>
        <div className="relative w-full h-[calc(100%-3rem)]">
          <textarea
            ref={editorRef}
            value={content}
            onChange={handleContentChange}
            onScroll={handleScroll}
            className="absolute inset-0 w-full h-full bg-transparent resize-none outline-none prose prose-invert"
            style={{
              fontFamily: "Dank",
              color: "#7E8691",
              zIndex: 1,
            }}
          />
          <div
            ref={previewRef}
            className="absolute inset-0 w-full h-full pointer-events-none prose prose-invert"
            style={{
              fontFamily: "Dank",
              color: "#7E8691",
              zIndex: 2,
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
