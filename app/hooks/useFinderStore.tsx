import { create } from "zustand";
import { Folder, File } from "@prisma/client";

type FolderWithRelations = Folder & {
  subfolders: Folder[];
  files: File[];
};

interface FinderItem {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FinderItem[];
  parentId: string | null;
  isRoot: boolean;
}

interface FinderState {
  sidebarItems: FinderItem[];
  contentItems: FinderItem[];
  currentFolderId: string | null;
  selectedItemId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchItems: (folderId?: string | null) => Promise<void>;
  selectItem: (id: string) => void;
  toggleFolder: (id: string) => Promise<void>;
  createItem: (
    name: string,
    type: "file" | "folder",
    parentId: string | null
  ) => Promise<void>;
  renameItem: (
    id: string,
    name: string,
    type: "file" | "folder"
  ) => Promise<void>;
  deleteItem: (id: string, type: "file" | "folder") => Promise<void>;
}

export const useFinderStore = create<FinderState>((set, get) => ({
  sidebarItems: [],
  contentItems: [],
  currentFolderId: null,
  selectedItemId: null,
  isLoading: false,
  error: null,

  fetchItems: async (folderId) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch root folder if no folderId is provided
      const response = await fetch(`/api/finder/${folderId || "root"}`);
      if (!response.ok) throw new Error("Failed to fetch items");
      const data = await response.json();

      const mapToFinderItem = (
        item: FolderWithRelations | File
      ): FinderItem => ({
        id: item.id,
        name: item.name,
        type: "subfolders" in item ? "folder" : "file", // Correctly identify folders
        parentId:
          "parentId" in item
            ? item.parentId
            : "folderId" in item
            ? item.folderId
            : null,
        isRoot: "isRoot" in item ? item.isRoot : false,
        children:
          "subfolders" in item
            ? [
                ...item.subfolders.map(mapToFinderItem),
                ...item.files.map(mapToFinderItem),
              ]
            : undefined,
      });

      const rootItem = mapToFinderItem(data as FolderWithRelations);

      // If fetching root, set sidebarItems to rootItem's children
      // Otherwise, update the specific folder in sidebarItems
      if (!folderId || folderId === "root") {
        set({
          sidebarItems: rootItem.children || [],
          contentItems: rootItem.children || [],
          currentFolderId: rootItem.id,
          isLoading: false,
        });
      } else {
        set((state) => {
          const updateSidebarItems = (items: FinderItem[]): FinderItem[] => {
            return items.map((item) => {
              if (item.id === folderId) {
                return { ...item, children: rootItem.children };
              }
              if (item.children) {
                return { ...item, children: updateSidebarItems(item.children) };
              }
              return item;
            });
          };

          return {
            sidebarItems: updateSidebarItems(state.sidebarItems),
            contentItems: rootItem.children || [],
            currentFolderId: folderId,
            isLoading: false,
          };
        });
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectItem: (id) => set({ selectedItemId: id }),

  toggleFolder: async (id) => {
    const { fetchItems, currentFolderId } = get();
    if (id === currentFolderId) {
      const currentFolder = get().contentItems.find((item) => item.id === id);
      await fetchItems(currentFolder?.parentId ?? null);
    } else {
      await fetchItems(id);
    }
  },

  createItem: async (name, type, parentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, parentId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create item");
      }
      const newItem = await response.json();

      set((state) => {
        const updateItems = (items: FinderItem[]): FinderItem[] => {
          return items.map((item) => {
            if (item.id === parentId || (item.isRoot && !parentId)) {
              return {
                ...item,
                children: [
                  ...(item.children || []),
                  {
                    id: newItem.id,
                    name: newItem.name,
                    type: type,
                    parentId: newItem.parentId || newItem.folderId,
                    isRoot: false,
                    children: type === "folder" ? [] : undefined,
                  },
                ],
              };
            }
            if (item.children) {
              return { ...item, children: updateItems(item.children) };
            }
            return item;
          });
        };

        const updatedSidebarItems = parentId
          ? updateItems(state.sidebarItems)
          : [
              ...state.sidebarItems,
              {
                id: newItem.id,
                name: newItem.name,
                type: type,
                parentId: null,
                isRoot: false,
                children: type === "folder" ? [] : undefined,
              },
            ];

        const updatedContentItems =
          parentId === state.currentFolderId || !parentId
            ? [
                ...state.contentItems,
                {
                  id: newItem.id,
                  name: newItem.name,
                  type: type,
                  parentId: newItem.parentId || newItem.folderId,
                  isRoot: false,
                  children: type === "folder" ? [] : undefined,
                },
              ]
            : state.contentItems;

        return {
          sidebarItems: updatedSidebarItems,
          contentItems: updatedContentItems,
          isLoading: false,
        };
      });

      // Refetch items to ensure consistency
      await get().fetchItems(parentId || "root");
    } catch (error) {
      console.error("Error creating item:", error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  renameItem: async (id, name, type) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/finder/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to rename item");
      }
      const updatedItem = await response.json();

      // Update the local state with the renamed item
      set((state) => {
        const updateItems = (items: FinderItem[]): FinderItem[] => {
          return items.map((item) => {
            if (item.id === id) {
              return { ...item, name: updatedItem.name };
            }
            if (item.children) {
              return { ...item, children: updateItems(item.children) };
            }
            return item;
          });
        };

        return {
          sidebarItems: updateItems(state.sidebarItems),
          contentItems: updateItems(state.contentItems),
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Error renaming item:", error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteItem: async (id, type) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/finder/${id}?type=${type}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete item");
      }

      // Update the local state by removing the deleted item
      set((state) => {
        const removeItem = (items: FinderItem[]): FinderItem[] => {
          return items.filter((item) => {
            if (item.id === id) {
              return false;
            }
            if (item.children) {
              item.children = removeItem(item.children);
            }
            return true;
          });
        };

        return {
          sidebarItems: removeItem(state.sidebarItems),
          contentItems: removeItem(state.contentItems),
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
