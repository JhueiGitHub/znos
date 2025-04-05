// /root/app/apps/duolingo/styles/zenithStyles.ts

// Using CSS variables defined globally by OrionOS might be better,
// but defining them here ensures the app uses the correct ones.

export const zenith = {
  colors: {
    black: "#000000", // Container backgrounds
    graphite: "#CCCCCC", // Text
    white: "#FFFFFF", // Borders and subtle outlines
    latte: "#4C4F69", // Accent
    daimon: "#694C4C",
    onyx: "#5E4C69",
    mariana: "#4C6957",
    correct: "#4CAF50", // Standard green for correct answers
    incorrect: "#F44336", // Standard red for incorrect answers
  },
  opacity: {
    undefined: 1, // 100%
    thick: 0.81, // 81%
    med: 0.72, // 72%
    thin: 0.54, // 54%
    glass: 0.3, // 30%
    brd: 0.09, // 9%
  },
  // Combine colors and opacities for easier Tailwind usage
  // Example: bg-zenith-black-glass border border-zenith-white-brd
  tailwind: {
    // Backgrounds
    bgBlackGlass: `bg-[${"#000000"}]/30`, // bg-black bg-opacity-30
    bgLatte: `bg-[${"#4C4F69"}]`,
    bgCorrect: `bg-[#4CAF50]/81`, // Use thick opacity for feedback
    bgIncorrect: `bg-[#F44336]/81`,

    // Text
    textGraphite: `text-[${"#CCCCCC"}]`,
    textWhite: `text-[${"#FFFFFF"}]`,
    textLatte: `text-[${"#4C4F69"}]`,

    // Borders
    borderWhiteBrd: `border-[${"#FFFFFF"}]/9`, // border-white border-opacity-9
    borderLatte: `border-[${"#4C4F69"}]`,
    borderGraphiteThin: `border-[${"#CCCCCC"}]/54`,

    // Accent usage examples
    accentButtonBg: `bg-[${"#4C4F69"}]`, // Latte
    accentButtonHoverBg: `bg-[${"#4C4F69"}]/81`, // Latte with Thick opacity
    accentText: `text-[${"#4C4F69"}]`,
  },
};

// Helper function for dynamic opacity (optional)
export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
