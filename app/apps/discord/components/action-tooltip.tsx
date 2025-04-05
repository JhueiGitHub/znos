// /app/apps/discord/components/action-tooltip.tsx
"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@dis/components/ui/tooltip";
import { useDiscordStyles } from "../hooks/useDiscordStyles";

interface ActionTooltipProps {
  label: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export const ActionTooltip = ({
  label,
  children,
  side,
  align,
}: ActionTooltipProps) => {
  const { getDiscordStyle } = useDiscordStyles();

  return (
    <TooltipProvider>
      <Tooltip delayDuration={50}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="text-sm font-semibold"
          style={{
            backgroundColor: getDiscordStyle("tooltip-bg"),
            color: getDiscordStyle("text-default"),
            border: `1px solid ${getDiscordStyle("separator")}`,
          }}
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
