import { create } from "zustand";

export type StellarFile = {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  parentId?: string;
};

interface StellarState {
  files: StellarFile[];
  selectedFileId: string | null;
  currentPath: string[];
  expandedFolders: string[];
  setFiles: (files: StellarFile[]) => void;
  setSelectedFile: (id: string | null) => void;
  setCurrentPath: (path: string[]) => void;
  setExpandedFolders: (folders: string[]) => void;
  toggleFolder: (folderId: string) => void;
}

export const useStellarStore = create<StellarState>((set) => ({
  files: [],
  selectedFileId: null,
  currentPath: ["Stellar"],
  expandedFolders: [],

  setFiles: (files) => set({ files }),
  setSelectedFile: (id) => set({ selectedFileId: id }),
  setCurrentPath: (path) => set({ currentPath: path }),
  setExpandedFolders: (folders) => set({ expandedFolders: folders }),

  toggleFolder: (folderId) =>
    set((state) => ({
      expandedFolders: state.expandedFolders.includes(folderId)
        ? state.expandedFolders.filter((id) => id !== folderId)
        : [...state.expandedFolders, folderId],
    })),
}));
