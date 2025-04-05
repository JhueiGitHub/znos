// /app/apps/discord/components/navigation/navigation-action.tsx
"use client";

import { Plus } from "lucide-react";
import { ActionTooltip } from "@dis/components/action-tooltip";
import { useModal } from "@os/hooks/use-modal-store";
import { useDiscordStyles } from "../../hooks/useDiscordStyles";

export const NavigationAction = () => {
  const { onOpen } = useModal();
  const { getDiscordStyle } = useDiscordStyles();

  return (
    <div>
      <ActionTooltip side="right" align="center" label="Add a server">
        <button
          onClick={() => onOpen("createServer")}
          className="group flex items-center"
        >
          <div
            className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center group-hover:bg-[#4C4F69]"
            style={{
              backgroundColor: getDiscordStyle("nav-item-bg"),
            }}
          >
            <Plus
              style={{
                color: getDiscordStyle("action-default"),
              }}
              size={25}
              className="group-hover:text-white transition"
            />
          </div>
        </button>
      </ActionTooltip>
    </div>
  );
};
