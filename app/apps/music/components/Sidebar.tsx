// /root/app/apps/music/components/Sidebar.tsx
"use client";

import Image from "next/image";
import { useStyles } from "@/app/hooks/useStyles";

export function Sidebar() {
  const { getColor, getFont } = useStyles();

  return (
    <div
      className="w-[222px] h-full flex flex-col bg-black"
      style={{
        borderRight: `1px solid ${getColor("Brd")}`,
        fontFamily: getFont("Text Primary"),
      }}
    >
      <div className="p-4 flex items-center gap-2">
        <div className="w-8 h-8 flex items-center justify-center">
          <Image
            src="/apps/music/media/icns/_play.png"
            alt="Music"
            width={40}
            height={40}
          />
        </div>
        <span className="text-white text-xl">Music</span>
      </div>

      <div className="mt-4">
        <SidebarItem icon="home" label="Home" active />
        <SidebarItem icon="explore" label="Explore" />
        <SidebarItem icon="library" label="Library" />
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center px-6 py-3 gap-4 cursor-pointer hover:bg-white/10 ${active ? "bg-white/10" : ""}`}
    >
      <Image
        src={`/apps/music/media/icns/${icon}.png`}
        alt={label}
        width={24}
        height={24}
      />
      <span className="text-white text-sm">{label}</span>
    </div>
  );
}
