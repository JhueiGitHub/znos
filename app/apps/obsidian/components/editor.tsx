// app/apps/obsidian/components/editor.tsx
import React, { useState, useCallback, useEffect } from "react";
import { useStyles } from "@os/hooks/useStyles";
import { useNote } from "../contexts/note-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import debounce from "lodash/debounce";
import { motion } from "framer-motion";

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
            color: "#4C4F69",
            opacity: 0.81,
          }}
        >
          {activeNote.title}
        </h1>
        <textarea
          value={content}
          onChange={handleContentChange}
          className="w-full h-[calc(100%-3rem)] bg-transparent resize-none outline-none prose prose-invert"
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
