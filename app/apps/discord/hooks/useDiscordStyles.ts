// /app/apps/discord/hooks/useDiscordStyles.ts
import { useStyles } from "@/app/hooks/useStyles";
import { DiscordStyleId } from "../types/style-ids";
import { defaultDiscordMapping } from "../config/style-mapping";

// Our hook becomes much simpler
export const useDiscordStyles = () => {
  const { getColor, getFont } = useStyles();

  const getDiscordStyle = (styleId: DiscordStyleId) =>
    getColor(defaultDiscordMapping[styleId]);

  return {
    getDiscordStyle,
    getFont,
  };
};
