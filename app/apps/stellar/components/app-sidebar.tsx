import * as React from "react";
import { GalleryVerticalEnd } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
  SidebarRail,
} from "./ui/sidebar";

// EVOLVED: Type definitions
interface StellarFolder {
  id: string;
  name: string;
  inSidebar: boolean;
  sidebarOrder: number | null;
  children: StellarFolder[];
  files: any[]; // Preserved for future file handling
}

interface StellarProfile {
  rootFolder: {
    children: StellarFolder[];
  };
  driveCapacity: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // EVOLVED: Data fetching
  const { data: profile, isLoading } = useQuery<StellarProfile>({
    queryKey: ["stellar-folders"],
    queryFn: async () => {
      const response = await axios.get("/api/stellar/folders?sidebar=true");
      return response.data;
    },
  });

  // EVOLVED: Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, folderId: string) => {
    e.dataTransfer.setData("text/plain", folderId);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const folderId = e.dataTransfer.getData("text/plain");

    try {
      await axios.patch("/api/stellar/folders", {
        folderId,
        inSidebar: true,
        sidebarOrder: profile?.rootFolder.children.length || 0,
      });
    } catch (error) {
      console.error("Failed to update sidebar status:", error);
    }
  };

  return (
    <Sidebar {...props}>
      {/* PRESERVED: Header section */}
      {/* <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#4C4F69]/60 text-[#CCCCCC]/70">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Documents</span>
                  <span className="text-xs text-muted-foreground">
                    {profile?.driveCapacity} GB
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader> */}

      {/* EVOLVED: Dynamic content section */}
      <SidebarContent
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <SidebarGroup>
          <SidebarMenu>
            {profile?.rootFolder.children.map((folder) => (
              <Collapsible
                key={folder.id}
                defaultOpen={true}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      draggable
                      onDragStart={(e) => handleDragStart(e, folder.id)}
                    >
                      {/* PRESERVED: Consistent folder icon */}
                      <img
                        src="/apps/stellar/icns/system/_sidebar_folder.png"
                        alt=""
                        className="w-4 h-4 mr-1"
                      />
                      {folder.name}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
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

      {/* PRESERVED: Rail */}
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
