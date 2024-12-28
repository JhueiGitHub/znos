// components/obsidian-calendar.tsx
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DayPicker,
  DayClickEventHandler,
  ModifiersStyles,
} from "react-day-picker";
import { cn } from "@/lib/utils";
import { useStyles } from "@os/hooks/useStyles";
import { isSameDay } from "date-fns";
import { useNote } from "../contexts/note-context";

interface ObsidianCalendarProps
  extends Omit<
    React.ComponentProps<typeof DayPicker>,
    "mode" | "selected" | "onSelect"
  > {
  onDateSelect: (date: Date) => void;
}

function ObsidianCalendar({
  className,
  classNames,
  showOutsideDays = true,
  onDateSelect,
  ...props
}: ObsidianCalendarProps) {
  const { getColor } = useStyles();
  const [selectedDay, setSelectedDay] = React.useState<Date>(new Date());
  const today = React.useMemo(() => new Date(), []);
  const { activeNote } = useNote();

  const handleDayClick: DayClickEventHandler = (day, modifiers) => {
    setSelectedDay(day);
    onDateSelect(day);
  };

  const modifiersStyles: ModifiersStyles = {
    currentNotSelected: {
      border: "1px solid rgba(76, 79, 105, 0.3)",
      borderRadius: "6px",
    },
    selected: {
      backgroundColor: activeNote?.isDaily
        ? "rgba(76, 79, 105, 0.1)"
        : undefined,
      color: "rgb(76, 79, 105)",
    },
  };

  return (
    <DayPicker
      mode="single"
      selected={selectedDay}
      onDayClick={handleDayClick}
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      modifiersStyles={modifiersStyles}
      modifiers={{
        currentNotSelected: (day: Date) =>
          isSameDay(day, today) &&
          (!activeNote?.isDaily || !isSameDay(day, selectedDay)),
      }}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: cn("text-sm font-medium", "text-[#7E8691]"),
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-[#4C4F69]"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: cn(
          "text-[#4C4F69] rounded-md w-8 font-normal text-[0.8rem]"
        ),
        row: "flex w-full mt-2",
        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day: cn(
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100 rounded-md",
          "text-[#7E8691]/90 hover:bg-[#4C4F69]/10 focus:bg-[#4C4F69]/10"
        ),
        day_outside: "text-[#7E8691]/50",
        day_disabled: "text-[#7E8691]/30",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeft className="h-4 w-4 text-[#4C4F69]" {...props} />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRight className="h-4 w-4 text-[#4C4F69]" {...props} />
        ),
      }}
      {...props}
    />
  );
}

ObsidianCalendar.displayName = "ObsidianCalendar";

export { ObsidianCalendar };
