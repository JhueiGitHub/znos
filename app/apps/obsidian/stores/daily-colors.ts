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

// Updated color scheme matching folder structure
export const defaultDailyColors: DailyColorFlow = {
  id: "onyx-default",
  name: "Onyx Daily",
  colors: {
    monday: "#166e6a", // 02 - Stallion (deep-blue)
    tuesday: "#1d8e86", // 03 - Dopa (light-blue)
    wednesday: "#5770b4", // 04 - SO (blue-lilac)
    thursday: "#455a96", // 05 - Docs (deep-blue-lilac)
    friday: "#6a51a6", // 06 - Daily (deep-pink-lilac)
    saturday: "#8069c4", // 07 - Flt (pink-lilac)
    sunday: "#c45c8a", // 99 - Meta (rose)
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
