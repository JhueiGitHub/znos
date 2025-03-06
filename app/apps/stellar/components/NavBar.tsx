import React, { useCallback, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useStellarState } from "../contexts/stellar-state-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid2X2Icon,
  ListIcon,
  ArrowUpDownIcon,
  SortAscIcon,
  SortDescIcon,
  ClockIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FolderInfo {
  id: string;
  name: string;
  parentId: string | null;
}

export function NavBar() {
  const { currentFolderId, setCurrentFolder } = useFolder();
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const { state, setViewMode, setSortBy, setSortDirection } = useStellarState();

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

  const handleBack = useCallback(() => {
    const previousFolder = navigationStack[navigationStack.length - 1];
    setNavigationStack((previousStack) => previousStack.slice(0, -1));
    setCurrentFolder(previousFolder || null);
  }, [navigationStack, setCurrentFolder]);

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
    <div className="h-8 w-full flex justify-between border-b border-[#29292981] bg-[#00000045]">
      <nav className="h-full px-4 flex items-center w-fit">
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
                    <BreadcrumbEllipsis className="text-[#4C4F69]" />
                  ) : (
                    <>
                      <BreadcrumbSeparator className="text-[#4C4F69]" />
                      <BreadcrumbItem>
                        {index === visiblePath.length - 1 ? (
                          <BreadcrumbPage className="text-[#cccccc78]">
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
      {/* View Controls */}
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-1 mr-[9px]">
          {/* Back Button - Only show when we have navigation history */}
          {navigationStack.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="px-2 py-1 h-auto hover:bg-[#4C4F69]/20"
            >
              <ChevronLeft className="w-4 h-4 text-[#cccccc78]" />
            </Button>
          )}

          {/* View Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("canvas")}
            className={`px-2 py-1 h-auto hover:bg-[#4C4F69]/20 ${state.viewMode === "canvas" ? "bg-[#4C4F69]/20" : ""}`}
          >
            <motion.svg
              className="w-4 h-4 text-[#cccccc78]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 8H8V4H4V8ZM10 20H14V16H10V20ZM4 20H8V16H4V20ZM4 14H8V10H4V14ZM10 14H14V10H10V14ZM16 4V8H20V4H16ZM10 8H14V4H10V8ZM16 14H20V10H16V14ZM16 20H20V16H16V20Z"
                fill="currentColor"
              />
            </motion.svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={`px-2 py-1 h-auto hover:bg-[#4C4F69]/20 ${state.viewMode === "list" ? "bg-[#4C4F69]/20" : ""}`}
          >
            <ListIcon className="w-4 h-4 text-[#cccccc78]" />
          </Button>
        </div>

        <div className="h-[18px] border-l border-[#29292981] mr-[9px]"></div>

        <div className="flex items-center gap-1">
          {/* Sort Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 h-auto hover:bg-[#4C4F69]/20"
              >
                <ArrowUpDownIcon className="w-4 h-4 text-[#cccccc78]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[#01020390] border border-[#29292981] text-[#cccccc]"
            >
              <DropdownMenuItem
                onClick={() => setSortBy("name")}
                className={`text-xs ${state.sortBy === "name" ? "bg-[#4C4F69]/20" : ""}`}
              >
                Sort by Name
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("date")}
                className={`text-xs ${state.sortBy === "date" ? "bg-[#4C4F69]/20" : ""}`}
              >
                Sort by Date
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("type")}
                className={`text-xs ${state.sortBy === "type" ? "bg-[#4C4F69]/20" : ""}`}
              >
                Sort by Type
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Direction */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setSortDirection(state.sortDirection === "asc" ? "desc" : "asc")
            }
            className="px-2 py-1 h-auto hover:bg-[#4C4F69]/20"
          >
            {state.sortDirection === "asc" ? (
              <SortAscIcon className="w-4 h-4 text-[#cccccc78]" />
            ) : (
              <SortDescIcon className="w-4 h-4 text-[#cccccc78]" />
            )}
          </Button>

          {/* Recent Folders */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 h-auto hover:bg-[#4C4F69]/20"
              >
                <ClockIcon className="w-4 h-4 text-[#cccccc78]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[#01020390] border border-[#29292981] text-[#cccccc]"
            >
              {state.recentFolders.length > 0 ? (
                state.recentFolders.map((folder) => (
                  <DropdownMenuItem
                    key={folder.id}
                    onClick={() => setCurrentFolder(folder.id)}
                    className="text-xs"
                  >
                    {folder.name}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled className="text-xs opacity-50">
                  No recent folders
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
