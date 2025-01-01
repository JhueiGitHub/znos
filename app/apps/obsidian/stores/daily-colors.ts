// stores/daily-colors.ts

export interface DailyColorFlow {
  id: string;
  name: string;
  colors: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

// Default color scheme for Onyx daily notes
export const defaultDailyColors: DailyColorFlow = {
  id: "onyx-default",
  name: "Onyx Daily",
  colors: {
    monday: "#4C4F69", // latte (existing accent)
    tuesday: "#7287FD", // lavender
    wednesday: "#179299", // teal
    thursday: "#EA76CB", // pink
    friday: "#FE640B", // peach
    saturday: "#40A02B", // green
    sunday: "#E64553", // red
  },
};

export const getDayColor = (date: Date): string => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayName = days[date.getDay()];
  return defaultDailyColors.colors[
    dayName as keyof typeof defaultDailyColors.colors
  ];
};
