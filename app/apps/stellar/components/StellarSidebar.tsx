"use client";

import React from "react";
import { useStyles } from "@/app/hooks/useStyles";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tree, File } from "./ui/file-tree";

export function StellarSidebar() {
  const { getColor } = useStyles();

  return (
    <div className="h-full w-52 bg-black">
      <ScrollArea className="h-full">
        <div className="py-4 space-y-6">
          {/* Favourites Section */}
          <div className="px-4 space-y-2">
            <span className="text-[#636464] text-xs font-medium">
              Favourites
            </span>
            <Tree className="[&_[data-state=selected]]:bg-[#292929]/30">
              <File
                value="panther"
                className="text-[#cccccc]/[0.81]"
                fileIcon={
                  <img
                    src="/apps/stellar/icns/system/_sidebar_folder.png"
                    className="w-4 h-4"
                    alt=""
                  />
                }
              >
                Panther
              </File>
              <File
                value="desktop"
                className="text-[#cccccc]/[0.81]"
                fileIcon={
                  <img
                    src="/apps/stellar/icns/system/_sidebar_folder.png"
                    className="w-4 h-4"
                    alt=""
                  />
                }
              >
                Desktop
              </File>
            </Tree>
          </div>

          {/* Locations Section */}
          <div className="px-4 space-y-2">
            <span className="text-[#636464] text-xs font-medium">
              Locations
            </span>
            <Tree className="[&_[data-state=selected]]:bg-[#292929]/30">
              <File
                value="desktop-location"
                className="text-[#cccccc]/[0.81]"
                fileIcon={
                  <img
                    src="/apps/stellar/icns/system/_sidebar_folder.png"
                    className="w-4 h-4"
                    alt=""
                  />
                }
              >
                Desktop
              </File>
              <File
                value="documents"
                className="text-[#cccccc]/[0.81]"
                fileIcon={
                  <img
                    src="/apps/stellar/icns/system/_sidebar_folder.png"
                    className="w-4 h-4"
                    alt=""
                  />
                }
              >
                Documents
              </File>
            </Tree>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
