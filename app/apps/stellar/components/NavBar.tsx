import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useFolder } from "../contexts/folder-context";
import axios from "axios";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";

interface FolderInfo {
  id: string;
  name: string;
  parentId: string | null;
}

export function NavBar() {
  const { currentFolderId, setCurrentFolder } = useFolder();

  // Fetch folder path, excluding root (which we'll handle separately)
  const { data: folderPath = [], isLoading } = useQuery({
    queryKey: ["folder-path", currentFolderId],
    queryFn: async () => {
      if (!currentFolderId) return [];

      const path: FolderInfo[] = [];
      let folderId = currentFolderId;

      // Traverse up the folder tree
      while (folderId) {
        const response = await axios.get(`/api/stellar/folders/${folderId}`);
        const folder = response.data.folder;

        if (!folder) break;

        // Only add to path if it's not the root folder (i.e., has no parent)
        if (folder.parentId !== null) {
          path.unshift(folder);
        } else {
          // We've reached the root folder - stop here without adding it
          break;
        }

        folderId = folder.parentId;
      }

      return path;
    },
    enabled: !!currentFolderId,
  });

  const handleNavigate = (folderId: string | null) => {
    setCurrentFolder(folderId);
  };

  // Only show folders in the path that aren't root
  const nonRootFolders = folderPath.filter(
    (folder) => folder.parentId !== null
  );

  // For long paths, show ellipsis in the middle
  const shouldTruncate = nonRootFolders.length > 4;
  const visiblePath = shouldTruncate
    ? [
        ...nonRootFolders.slice(0, 2),
        { id: "ellipsis", name: "", parentId: null },
        ...nonRootFolders.slice(-2),
      ]
    : nonRootFolders;

  // Only show current folder name in the navbar if there is one
  const currentFolderName =
    nonRootFolders.length > 0
      ? nonRootFolders[nonRootFolders.length - 1].name
      : "Root";

  return (
    <nav className="h-8 px-4 flex items-center border-b border-[#29292981] bg-[#01020330]">
      {!currentFolderId ? (
        // When at root, just show "Root" text without breadcrumb
        <span className="text-[13px] text-[#cccccc78]">Root</span>
      ) : (
        // When in a folder, show breadcrumb
        <Breadcrumb className="w-full">
          <BreadcrumbList className="text-[13px]">
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => handleNavigate(null)}
                className="text-[#cccccc78] hover:text-[#ccccccbb] cursor-pointer"
              >
                Root
              </BreadcrumbLink>
            </BreadcrumbItem>

            {visiblePath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                {folder.id === "ellipsis" ? (
                  <BreadcrumbEllipsis className="text-[#cccccc60]" />
                ) : (
                  <>
                    <BreadcrumbSeparator className="text-[#cccccc60]" />
                    <BreadcrumbItem>
                      {index === visiblePath.length - 1 ? (
                        <BreadcrumbPage className="text-[#ccccccbb]">
                          {folder.name}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          onClick={() => handleNavigate(folder.id)}
                          className="text-[#cccccc78] hover:text-[#ccccccbb] cursor-pointer"
                        >
                          {folder.name}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </>
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {isLoading && (
        <span className="ml-2 text-[11px] text-[#cccccc50]">Loading...</span>
      )}
    </nav>
  );
}
