// components/editor.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useStyles } from "@os/hooks/useStyles";
import { useNote } from "../contexts/note-context";
import { useDailyColor } from "../hooks/useDailyColor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import debounce from "lodash/debounce";

const Editor: React.FC = () => {
  const { getColor } = useStyles();
  const { activeNote, activeNoteId, saveScrollPosition, getScrollPosition } =
    useNote();
  const { accentColor } = useDailyColor();
  const [content, setContent] = useState(activeNote?.content || "");
  const queryClient = useQueryClient();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Save scroll position periodically
  const saveScrollDebounced = useCallback(
    debounce((position: number) => {
      if (activeNoteId) {
        saveScrollPosition(activeNoteId, position);
      }
    }, 100),
    [activeNoteId, saveScrollPosition]
  );

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (editorRef.current && activeNoteId) {
      saveScrollDebounced(editorRef.current.scrollTop);
    }
  }, [activeNoteId, saveScrollDebounced]);

  // Restore scroll position when note changes
  useEffect(() => {
    if (editorRef.current && activeNoteId) {
      const savedPosition = getScrollPosition(activeNoteId);
      editorRef.current.scrollTop = savedPosition;
    }
  }, [activeNoteId, getScrollPosition]);

  useEffect(() => {
    setContent(activeNote?.content || "");
  }, [activeNote?.id]);

  const { mutate: updateNote } = useMutation({
    mutationFn: async (newContent: string) => {
      const response = await axios.patch(
        `/api/obsidian/notes/${activeNote?.id}`,
        {
          content: newContent,
        }
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

  // CSS for applying accent color to specific elements
  const editorStyles = `
    .editor-content h1, 
    .editor-content h2, 
    .editor-content h3, 
    .editor-content h4, 
    .editor-content h5, 
    .editor-content h6 {
      color: ${accentColor} !important;
    }
    .editor-content hr {
      border-color: ${accentColor} !important;
    }
    .editor-content .punctuation,
    .editor-content .arrow {
      color: ${accentColor} !important;
    }
  `;

  return (
    <div className="h-full bg-[#00000093] rounded-lg flex justify-center">
      <style>{editorStyles}</style>
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
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          onScroll={handleScroll}
          className="w-full h-[calc(100%-3rem)] bg-transparent resize-none outline-none prose prose-invert editor-content"
          style={{
            fontFamily: "Dank",
            color: "#7E8691",
          }}
        />
      </div>
    </div>
  );
};

export default Editor;
