import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useDrag } from "../../contexts/drag-context";
import { useFolder } from "../../contexts/folder-context";
import { motion } from "framer-motion";

interface SidebarFolder {
  id: string;
  name: string;
  inSidebar: boolean;
  sidebarOrder: number | null;
}

export function SidebarContent() {
  const { isDraggingFolder, isOverSidebar } = useDrag();
  const { currentFolderId, setCurrentFolder } = useFolder();

  const { data: sidebarFolders, isLoading } = useQuery<SidebarFolder[]>({
    queryKey: ["sidebar-folders"],
    queryFn: async () => {
      const response = await axios.get("/api/stellar/folders/sidebar");
      return response.data;
    },
  });

  const handleClick = (folderId: string) => {
    setCurrentFolder(folderId);
  };

  // Keep double-click for future functionality
  const handleDoubleClick = (folderId: string) => {
    setCurrentFolder(folderId);
  };

  if (isLoading) {
    return (
      <div className="p-2 space-y-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 rounded-md bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {sidebarFolders?.map((folder) => (
        <motion.div
          key={folder.id}
          onClick={() => handleClick(folder.id)}
          onDoubleClick={() => handleDoubleClick(folder.id)}
          className={`flex items-center gap-2 px-[12px] py-1.5 rounded-md cursor-pointer group select-none ${
            currentFolderId === folder.id ? "bg-[#4C4F69]/30" : ""
          }`}
          initial={{
            backgroundColor:
              currentFolderId === folder.id
                ? "rgba(76, 79, 105, 0.3)"
                : "rgba(76, 79, 105, 0)",
          }}
          animate={{
            backgroundColor:
              currentFolderId === folder.id
                ? "rgba(76, 79, 105, 0.3)"
                : "rgba(76, 79, 105, 0)",
          }}
          whileHover={{
            backgroundColor:
              currentFolderId === folder.id
                ? "rgba(76, 79, 105, 0.4)"
                : "rgba(76, 79, 105, 0.2)",
          }}
          whileTap={{ scale: 0.98 }}
        >
          <img
            src="apps/stellar/icns/system/_sidebar_folder.png"
            alt=""
            className="w-4 h-4"
            draggable={false}
          />
          <span
            className={`text-sm truncate ${
              currentFolderId === folder.id
                ? "text-[#ccccccdd]"
                : "text-[#cccccc81] group-hover:text-[#cccccc95]"
            }`}
          >
            {folder.name}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
