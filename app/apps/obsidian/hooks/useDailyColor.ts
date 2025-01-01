// hooks/useDailyColor.ts
import { useMemo } from "react";
import { useNote } from "../contexts/note-context";
import { getDayColor } from "../stores/daily-colors";

export const useDailyColor = () => {
  const { activeNote } = useNote();

  const accentColor = useMemo(() => {
    if (!activeNote?.frontmatter?.date || !activeNote.isDaily) {
      return "#4C4F69"; // Default latte color for non-daily notes
    }

    return getDayColor(new Date(activeNote.frontmatter.date));
  }, [activeNote?.frontmatter?.date, activeNote?.isDaily]);

  return { accentColor };
};
