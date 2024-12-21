// app/apps/obsidian/components/sidebar.tsx
import React from "react";
import { Tree, Folder, File } from "./ui/file-tree";
import { useStyles } from "@os/hooks/useStyles";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNote } from "../contexts/note-context";
import { ObsidianCalendar } from "./obsidian-calendar";

type ObsidianNote = {
  id: string;
  title: string;
};

type ObsidianFolder = {
  id: string;
  name: string;
  notes: ObsidianNote[];
  children: ObsidianFolder[];
};

const Sidebar: React.FC = () => {
  const { getColor, getFont } = useStyles();
  const { activeNoteId, setActiveNoteId } = useNote();

  // First, fetch the profile to get the vault
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await axios.get("/api/profile");
      return response.data;
    },
  });

  // Then fetch the vault using the profile
  const { data: vault } = useQuery({
    queryKey: ["vault", profile?.id],
    queryFn: async () => {
      const response = await axios.get(`/api/obsidian/profile-vault`);
      return response.data;
    },
    enabled: !!profile?.id,
  });

  // Finally, fetch the folder structure using the vault ID
  const { data: treeData, isLoading } = useQuery({
    queryKey: ["vault-folders", vault?.id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/obsidian/vaults/${vault.id}/folders`
      );
      return response.data;
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

  const handleNoteSelect = (noteId: string) => {
    console.log("Selected note:", noteId); // Debug log
    setActiveNoteId(noteId);
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

  // Enhanced recursive rendering with proper typing
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

      const isNote = item.name.endsWith(".md");

      if (Array.isArray(item.children) && item.children.length > 0) {
        return (
          <Folder key={item.id} element={item.name} value={item.id}>
            {renderTreeItems(item.children)}
            {item.notes &&
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
          >
            <p>{item.name}</p>
          </File>
        );
      }
    });
  };

  if (!vault) {
    return (
      <div className="w-[240px] p-4">
        <div className="text-sm text-white/50">Loading vault...</div>
      </div>
    );
  }

  if (!treeData) {
    return (
      <div className="w-[240px] p-4">
        <div className="text-sm text-white/50">No data available</div>
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
      >
        {renderTreeItems(treeData)}
      </Tree>
      <ObsidianCalendar />
    </div>
  );
};

export default Sidebar;
