// /root/app/apps/opal/constants/index.ts
import { Bell, CreditCard, FolderIcon, Home, Settings } from "lucide-react";

export const MENU_ITEMS = (
  workspaceId: string
): { title: string; href: string; icon: React.ReactNode }[] => [
  {
    title: "Home",
    href: `/dashboard/${workspaceId}/home`,
    icon: <Home className="w-4 h-4" />,
  },
  {
    title: "My Library",
    href: `/dashboard/${workspaceId}`,
    icon: <FolderIcon className="w-4 h-4" />,
  },
  {
    title: "Notifications",
    href: `/dashboard/${workspaceId}/notifications`,
    icon: <Bell className="w-4 h-4" />,
  },
  {
    title: "Billing",
    href: `/dashboard/${workspaceId}/billing`,
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    title: "Settings",
    href: `/dashboard/${workspaceId}/settings`,
    icon: <Settings className="w-4 h-4" />,
  },
];
