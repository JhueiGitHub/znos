// app/apps/obsidian/components/editor.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useStyles } from "@os/hooks/useStyles";
import { useNote } from "../contexts/note-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import debounce from "lodash/debounce";

const Editor: React.FC = () => {
  const { getColor } = useStyles();
  const { activeNote } = useNote();
  const [content, setContent] = useState(activeNote?.content || "");
  const queryClient = useQueryClient();

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
    };
  }, [debouncedSave]);

  if (!activeNote) {
    return (
      <div className="flex-1 p-6 rounded-lg bg-[#00000093] flex items-center justify-center">
        <div className="text-sm text-[#7E8691]/95">No note selected</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 rounded-lg bg-[#00000093] flex flex-col">
      <h1
        className="text-2xl font-bold mb-4"
        style={{
          fontFamily: "ExemplarPro",
          color: "#4C4F69",
          opacity: 0.81,
        }}
      >
        {activeNote.title}
      </h1>
      <textarea
        value={content}
        onChange={handleContentChange}
        className="flex-1 bg-transparent resize-none outline-none prose prose-invert max-w-none"
        style={{
          fontFamily: "Dank",
          color: "#7E8691",
        }}
      />
    </div>
  );
};

export default Editor;
