// /app/apps/discord/components/server/server-header.tsx
"use client";

import { ServerWithMembersWithProfiles } from "@/types";
import { MemberRole } from "@prisma/client";
import {
  ChevronDown,
  LogOut,
  PlusCircle,
  Settings,
  Trash,
  UserPlus,
  Users,
  Video,
  Volume2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@dis/components/ui/dropdown-menu";
import { useModal } from "@dis/hooks/use-modal-store";
import { useDiscordStyles } from "../../hooks/useDiscordStyles";

interface ServerHeaderProps {
  server: ServerWithMembersWithProfiles;
  role?: MemberRole;
}

export const ServerHeader = ({ server, role }: ServerHeaderProps) => {
  const { onOpen } = useModal();
  const { getDiscordStyle, getFont } = useDiscordStyles();

  const isAdmin = role === MemberRole.ADMIN;
  const isModerator = isAdmin || role === MemberRole.MODERATOR;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none" asChild>
        <button
          className="w-full text-md font-semibold px-3 flex items-center h-12 transition hover:bg-black/30"
          style={{
            backgroundColor: getDiscordStyle("server-header-bg"),
            borderBottom: `2px solid ${getDiscordStyle("server-header-border")}`,
            color: getDiscordStyle("text-default"),
            fontFamily: getFont("Text Primary"),
          }}
        >
          {server.name}
          <ChevronDown className="h-5 w-5 ml-auto" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 text-xs font-medium space-y-[2px]"
        style={{
          backgroundColor: getDiscordStyle("dropdown-bg"),
          border: `1px solid ${getDiscordStyle("separator")}`,
        }}
      >
        {isModerator && (
          <DropdownMenuItem
            onClick={() => onOpen("invite", { server })}
            className="px-3 py-2 text-sm cursor-pointer hover:bg-black/30"
            style={{ color: getDiscordStyle("invite-text") }}
          >
            Invite People
            <UserPlus className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen("editServer", { server })}
            className="px-3 py-2 text-sm cursor-pointer hover:bg-black/30"
            style={{ color: getDiscordStyle("dropdown-text") }}
          >
            Server Settings
            <Settings className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen("members", { server })}
            className="px-3 py-2 text-sm cursor-pointer hover:bg-black/30"
            style={{ color: getDiscordStyle("dropdown-text") }}
          >
            Manage Members
            <Users className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isModerator && (
          // EVOLVED: Ensure server context is passed correctly
          <DropdownMenuItem
            onClick={() => onOpen("createChannel", { server })}
            className="px-3 py-2 text-sm cursor-pointer hover:bg-black/30"
            style={{ color: getDiscordStyle("dropdown-text") }}
          >
            Create Channel
            <PlusCircle className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isModerator && (
          <DropdownMenuSeparator
            style={{ backgroundColor: getDiscordStyle("separator") }}
          />
        )}
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen("deleteServer", { server })}
            className="px-3 py-2 text-sm cursor-pointer hover:bg-black/30"
            style={{ color: getDiscordStyle("danger-text") }}
          >
            Delete Server
            <Trash className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {!isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen("leaveServer", { server })}
            className="px-3 py-2 text-sm cursor-pointer hover:bg-black/30"
            style={{ color: getDiscordStyle("danger-text") }}
          >
            Leave Server
            <LogOut className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
