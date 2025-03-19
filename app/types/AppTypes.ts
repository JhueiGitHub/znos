// types/AppTypes.ts
export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  dockPosition: number;
  animationType: "magnify" | "grow";
  isMinimized?: boolean;
}

export const appDefinitions: AppDefinition[] = [
  {
    id: "stellar",
    name: "Stellar",
    icon: "/media/finder.png",
    dockPosition: 0,
    animationType: "grow",
  },
  {
    id: "flow",
    name: "Flow",
    icon: "/media/settings.png",
    dockPosition: 1,
    animationType: "magnify",
  },
  {
    id: "studio",
    name: "Studio",
    icon: "/media/editor.png",
    dockPosition: 2,
    animationType: "magnify",
  },
  {
    id: "obsidian",
    name: "Onyx",
    icon: "/media/mila.png",
    dockPosition: 3,
    animationType: "magnify",
  },
  {
    id: "orion",
    name: "Orion",
    icon: "/media/figma.png",
    dockPosition: 4,
    animationType: "magnify",
  },
  {
    id: "discord",
    name: "XP",
    icon: "/media/tor.png",
    dockPosition: 5,
    animationType: "magnify",
  },
  {
    id: "monopoly",
    name: "Monopoly",
    icon: "/media/desktop.png",
    dockPosition: 6,
    animationType: "magnify",
  },
  {
    id: "glory",
    name: "Glory",
    icon: "/media/trash.png",
    dockPosition: 7,
    animationType: "magnify",
  },
];
