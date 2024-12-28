// hooks/useDailyNote.ts
"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNote } from "../contexts/note-context";
import { format } from "date-fns";

interface DailyNote {
  id: string;
  title: string;
  content: string;
  date: string;
  vaultId: string;
  isDaily: boolean;
}

export const useDailyNote = (initialDate?: Date) => {
  const { setActiveNoteId } = useNote();
  const queryClient = useQueryClient();
  const today = initialDate || new Date();
  const formattedDate = format(today, "yyyy-MM-dd");

  // Query to get or create today's daily note
  const { data: dailyNote, isLoading } = useQuery<DailyNote>({
    queryKey: ["daily-note", formattedDate],
    queryFn: async () => {
      const response = await axios.get(
        `/api/obsidian/daily-notes/${formattedDate}`
      );
      return response.data;
    },
  });

  // Effect to set the active note to today's daily note when it's loaded
  useEffect(() => {
    if (dailyNote?.id) {
      setActiveNoteId(dailyNote.id);
    }
  }, [dailyNote?.id, setActiveNoteId]);

  // Mutation to create a daily note for a specific date
  const { mutate: createDailyNote } = useMutation({
    mutationFn: async (date: Date) => {
      const formattedNoteDate = format(date, "yyyy-MM-dd");
      const response = await axios.post("/api/obsidian/daily-notes", {
        date: formattedNoteDate,
      });
      return response.data;
    },
    onSuccess: (newNote) => {
      queryClient.setQueryData(
        ["daily-note", format(today, "yyyy-MM-dd")],
        newNote
      );
      setActiveNoteId(newNote.id);
    },
  });

  // Function to navigate to a specific date's daily note
  const navigateToDate = async (date: Date) => {
    const formattedNavigateDate = format(date, "yyyy-MM-dd");
    try {
      const response = await axios.get(
        `/api/obsidian/daily-notes/${formattedNavigateDate}`
      );
      setActiveNoteId(response.data.id);
    } catch (error) {
      // If the note doesn't exist, create it
      createDailyNote(date);
    }
  };

  return {
    dailyNote,
    isLoading,
    navigateToDate,
  };
};
