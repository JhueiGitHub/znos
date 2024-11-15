import React from "react";
import { motion } from "framer-motion";
import { FileSystemItem } from "./types/FileSystem";
import "@/app/globals.css";

interface SidebarProps {
  sidebarItems: FileSystemItem[];
  onNavigate: (folderId: string) => void;
  onRemoveFromSidebar: (folderId: string) => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarItems,
  onNavigate,
  onRemoveFromSidebar,
  className,
}) => {
  return (
    <div className={className}>
      <h2
        className="text-[#636464] font-light mb-[6px] text-nowrap text-[13px] w-full"
        style={{
          marginLeft: "12px",
          paddingTop: "9px",
          fontFamily: "ExemplarPro",
        }}
      >
        Favourites
      </h2>
      {sidebarItems.map((folder) => (
        <motion.div
          key={folder.id}
          className="flex items-center mb-2 cursor-pointer"
          style={{
            marginLeft: "12px",
            fontFamily: "ExemplarPro",
          }}
          whileHover={{ scale: 1.02 }}
          onClick={() => onNavigate(folder.id)}
        >
          <img
            src="/media/findericon.png"
            alt="Folder"
            className="w-[18px] h-[18px] ml-1 mr-2 opacity-80"
          />
          <span className="text-[#DDE2E2]/90 text-[13px] flex-grow">
            {folder.name}
          </span>
          <button
            className="ml-auto text-gray-500 hover:text-red-500 opacity-0 mr-2"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFromSidebar(folder.id);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </motion.div>
      ))}
    </div>
  );
};

export default Sidebar;