import * as React from "react";
import { GalleryVerticalEnd, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// PRESERVED: Base imports
import { SearchForm } from "./search-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuAction,
  SidebarRail,
} from "./ui/sidebar";

// PRESERVED: Type definitions
interface StellarFolder {
  id: string;
  name: string;
  inSidebar: boolean;
  sidebarOrder: number | null;
  children: StellarFolder[];
  files: any[];
}

interface StellarProfile {
  folders: StellarFolder[];
  driveCapacity: string;
}

interface AppSidebarProps {
  onFolderSelect?: (folderId: string) => void;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const queryClient = useQueryClient();
  // EVOLVED: Added state for drop zone highlight
  const [dropZoneActive, setDropZoneActive] = React.useState(false);

  // PRESERVED: Sidebar folders query
  const { data: sidebarFolders, isLoading } = useQuery<StellarFolder[]>({
    queryKey: ["sidebar-folders"],
    queryFn: async () => {
      const response = await axios.get("/api/stellar/folders/sidebar");
      return response.data;
    },
  });

  // PRESERVED: Base drag start handler
  const handleDragStart = (e: React.DragEvent, folderId: string) => {
    e.dataTransfer.setData("text/plain", folderId);
    e.dataTransfer.setData("source", "sidebar");
  };

  // EVOLVED: Enhanced drag over handler with drop zone activation
  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const source = e.dataTransfer.getData("source");
    // Only show drop zone if dragged from canvas (not sidebar reordering)
    if (!source) {
      setDropZoneActive(true);
    }
  }, []);

  // EVOLVED: Enhanced drag leave handler
  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom ||
      e.clientX <= rect.left ||
      e.clientX >= rect.right
    ) {
      setDropZoneActive(false);
    }
  }, []);

  // EVOLVED: Enhanced drop handler
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDropZoneActive(false);
    const folderId = e.dataTransfer.getData("text/plain");
    const source = e.dataTransfer.getData("source");

    // Only add to sidebar if dragged from canvas
    if (!source) {
      try {
        await axios.post("/api/stellar/folders/sidebar", { folderId });
        // Invalidate queries
        await queryClient.invalidateQueries(["sidebar-folders"]);
        await queryClient.invalidateQueries(["stellar-folders"]);
      } catch (error) {
        console.error("Failed to add folder to sidebar:", error);
      }
    }
  };

  // PRESERVED: Remove from sidebar handler
  const handleRemoveFromSidebar = async (folderId: string) => {
    try {
      await axios.delete("/api/stellar/folders/sidebar", {
        data: { folderId },
      });
      await queryClient.invalidateQueries(["sidebar-folders"]);
      await queryClient.invalidateQueries(["stellar-folders"]);
    } catch (error) {
      console.error("Failed to remove folder from sidebar:", error);
    }
  };

  return (
    <Sidebar {...props}>
      {/* PRESERVED: Header section if needed */}

      {/* EVOLVED: Enhanced content section with drop zone */}
      <SidebarContent
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative"
      >
        {/* EVOLVED: Added drop zone visualization */}
        <AnimatePresence>
          {dropZoneActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#4C4F69]/20 border-2 border-dashed border-[#4C4F69]/40 rounded-lg pointer-events-none"
            >
              <div className="flex items-center justify-center h-full">
                <span className="text-[#4C4F69] text-lg">
                  Drop to add to sidebar
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <SidebarGroup>
          <SidebarMenu>
            {sidebarFolders?.map((folder) => (
              <Collapsible
                key={folder.id}
                defaultOpen={true}
                className="group/collapsible"
              >
                <SidebarMenuItem data-folder-id={folder.id}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      draggable
                      onDragStart={(e) => handleDragStart(e, folder.id)}
                    >
                      <img
                        src="/apps/stellar/icns/system/_sidebar_folder.png"
                        alt=""
                        className="w-4 h-4 mr-1"
                      />
                      {folder.name}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <SidebarMenuAction
                    onClick={() => handleRemoveFromSidebar(folder.id)}
                    className="opacity-0 group-hover/collapsible:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </SidebarMenuAction>
                  {folder.children?.length > 0 && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {folder.children.map((subFolder) => (
                          <SidebarMenuSubItem key={subFolder.id}>
                            <SidebarMenuSubButton
                              draggable
                              onDragStart={(e) =>
                                handleDragStart(e, subFolder.id)
                              }
                            >
                              <img
                                src="/apps/stellar/icns/system/_sidebar_folder.png"
                                alt=""
                                className="w-4 h-4 mr-1"
                              />
                              {subFolder.name}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
