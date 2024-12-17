import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useDrag } from "../../contexts/drag-context";

interface SidebarFolder {
  id: string;
  name: string;
  inSidebar: boolean;
  sidebarOrder: number | null;
}

export function SidebarContent() {
  const { isDraggingFolder, isOverSidebar } = useDrag();

  // Fetch folders that are marked for sidebar display
  const { data: sidebarFolders, isLoading } = useQuery<SidebarFolder[]>({
    queryKey: ["sidebar-folders"],
    queryFn: async () => {
      const response = await axios.get("/api/stellar/folders/sidebar");
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="p-2 text-[#cccccc40]">Loading folders...</div>;
  }

  if (!sidebarFolders?.length) {
    return <div className="p-2 text-[#cccccc40]">No folders in sidebar</div>;
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {sidebarFolders.map((folder) => (
        <div
          key={folder.id}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#4C4F6930] cursor-pointer group"
        >
          <img
            src="/apps/stellar/icns/system/_sidebar_folder.png"
            alt=""
            className="w-4 h-4"
            draggable={false}
          />
          <span className="text-sm text-[#cccccc81] truncate">
            {folder.name}
          </span>
        </div>
      ))}
    </div>
  );
}
