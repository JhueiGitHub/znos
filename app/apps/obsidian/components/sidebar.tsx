// components/Sidebar.tsx
import React, { useEffect } from "react";
import { Tree, Folder, File } from "./ui/file-tree";
import { useStyles } from "@os/hooks/useStyles";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNote } from "../contexts/note-context";
import { ObsidianCalendar } from "./obsidian-calendar";
import { useNotePersistence } from "../hooks/useNotePersistence";

type ObsidianNote = {
  id: string;
  title: string;
  isDaily?: boolean;
};

type ObsidianFolder = {
  id: string;
  name: string;
  notes: ObsidianNote[];
  children: ObsidianFolder[];
};

const Sidebar: React.FC = () => {
  const { getColor, getFont } = useStyles();
  const { activeNoteId, setActiveNoteId, navigateToDate } = useNote();
  const { 
    expandedFolders, 
    setExpandedFolders, 
    toggleFolderExpanded 
  } = useNotePersistence();

  // Profile and vault queries remain the same...
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await axios.get("/api/profile");
      return response.data;
    },
  });

  const { data: vault } = useQuery({
    queryKey: ["vault", profile?.id],
    queryFn: async () => {
      const response = await axios.get(`/api/obsidian/profile-vault`);
      return response.data;
    },
    enabled: !!profile?.id,
  });

  const { data: treeData, isLoading } = useQuery({
    queryKey: ["vault-folders", vault?.id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/obsidian/vaults/${vault.id}/folders`
      );

      // Filter out daily notes before returning
      const filterDailyNotes = (data: any): any => {
        if (!data) return data;

        if (Array.isArray(data)) {
          return data.map(filterDailyNotes);
        }

        const notes = Array.isArray(data.notes)
          ? data.notes.filter((note: ObsidianNote) => !note.isDaily)
          : [];

        const children = Array.isArray(data.children)
          ? data.children.map(filterDailyNotes)
          : [];

        return {
          ...data,
          notes,
          children,
        };
      };

      return filterDailyNotes(response.data);
    },
    enabled: !!vault?.id,
  });

  const customTreeStyles = {
    color: "#7E8691",
    fontFamily: getFont("Text Primary"),
    "--tree-indicator-color": "rgba(76, 79, 105, 0.3)",
    "--tree-selected-bg": "rgba(0, 0, 0, 0)",
  } as React.CSSProperties;

  const FolderIcon = ({ isOpen }: { isOpen: boolean }) => (
    <Image
      src={isOpen ? "/icns/_folder_open.png" : "/icns/_folder.png"}
      alt={isOpen ? "Open Folder" : "Closed Folder"}
      width={16}
      height={16}
      unoptimized
    />
  );

  const FileIcon = () => (
    <Image
      src="/icns/_file.png"
      alt="File"
      width={16}
      height={16}
      unoptimized
    />
  );

  const renderTreeItems = (items: any[]) => {
    if (!Array.isArray(items)) {
      console.error("Items is not an array:", items);
      return null;
    }

    return items.map((item) => {
      if (!item || !item.id || !item.name) {
        console.error("Invalid item structure:", item);
        return null;
      }

      if (Array.isArray(item.children) && item.children.length > 0) {
        return (
          <Folder 
            key={item.id} 
            element={item.name} 
            value={item.id}
            isSelect={expandedFolders?.includes(item.id) || false}
          >
            {renderTreeItems(item.children)}
            {Array.isArray(item.notes) &&
              renderTreeItems(
                item.notes.map((note: ObsidianNote) => ({
                  id: note.id,
                  name: `${note.title}.md`,
                }))
              )}
          </Folder>
        );
      } else {
        return (
          <File
            key={item.id}
            value={item.id}
            fileIcon={<FileIcon />}
            handleSelect={(id) => setActiveNoteId(id)}
            isSelect={activeNoteId === item.id}
          >
            <p>{item.name}</p>
          </File>
        );
      }
    });
  };

  if (isLoading) {
    return (
      <div className="w-[240px] p-4">
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-white/5 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!vault || !treeData) {
    return (
      <div className="w-[240px] p-4">
        <div className="text-sm text-white/50">
          {!vault ? "Loading vault..." : "No data available"}
        </div>
      </div>
    );
  }

  return (
    <div className="w-[240px] h-full flex flex-col justify-between">
      <Tree
        className="p-2"
        elements={treeData}
        style={customTreeStyles}
        openIcon={<FolderIcon isOpen={true} />}
        closeIcon={<FolderIcon isOpen={false} />}
        initialSelectedId={activeNoteId}
        initialExpandedItems={expandedFolders || []}
      >
        {renderTreeItems(treeData)}
      </Tree>
      <ObsidianCalendar onDateSelect={navigateToDate} />
    </div>
  );
};

export default Sidebar;