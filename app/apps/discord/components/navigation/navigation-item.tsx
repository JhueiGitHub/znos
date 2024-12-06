// /app/apps/discord/components/navigation/navigation-item.tsx
"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ActionTooltip } from "@dis/components/action-tooltip";
import { useDiscordStyles } from "../../hooks/useDiscordStyles";

interface NavigationItemProps {
  id: string;
  imageUrl: string;
  name: string;
  onSelect: () => void;
  initialServerId: string;
}
export const NavigationItem = ({
  id,
  imageUrl,
  name,
  onSelect,
  initialServerId,
}: NavigationItemProps) => {
  const params = useParams();
  const { getDiscordStyle } = useDiscordStyles();

  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button onClick={onSelect} className="group relative flex items-center">
        <div
          className={cn(
            "absolute left-0 rounded-r-full transition-all w-[4px]",
            params?.serverId !== id && "group-hover:h-[20px]",
            params?.serverId === id ? "h-[36px]" : "h-[8px]"
          )}
          style={{
            backgroundColor: getDiscordStyle("nav-indicator"),
          }}
        />
        <div
          className={cn(
            "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
            params?.serverId === id && "rounded-[16px]"
          )}
          style={{
            backgroundColor:
              params?.serverId === id
                ? getDiscordStyle("nav-item-active")
                : getDiscordStyle("nav-item-bg"),
          }}
        >
          <Image fill src={imageUrl} alt="Channel" />
        </div>
      </button>
    </ActionTooltip>
  );
};
