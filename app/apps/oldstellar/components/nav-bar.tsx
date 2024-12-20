"use client";

import React, { useCallback } from "react";
import { ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavBarProps {
  currentFolderId?: string;
  path?: Array<{ id: string; name: string }>;
  onNavigate?: (folderId: string) => void;
}

export const NavBar = ({
  currentFolderId,
  path = [],
  onNavigate,
}: NavBarProps) => {
  const handlePathClick = useCallback(
    (folderId: string) => {
      onNavigate?.(folderId);
    },
    [onNavigate]
  );

  const displayPath =
    path.length > 3 ? [...path.slice(0, 1), ...path.slice(-2)] : path;

  const hiddenPaths = path.length > 3 ? path.slice(1, -2) : [];

  return (
    <div className="w-full h-12 flex items-center px-4 bg-[#010203]/30">
      <Breadcrumb>
        <BreadcrumbList>
          {displayPath.map((item, index) => (
            <React.Fragment key={item.id}>
              <BreadcrumbItem>
                {index === displayPath.length - 1 ? (
                  <BreadcrumbPage className="text-[#cccccc78]">
                    {item.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="text-[#cccccc78] hover:text-[#cccccc78]"
                    onClick={() => handlePathClick(item.id)}
                  >
                    {item.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < displayPath.length - 1 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4 text-[#626581]" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}

          {hiddenPaths.length > 0 && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4 text-[#626581]" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1">
                    <BreadcrumbEllipsis className="h-4 w-4 text-[#626581]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="bg-[#010203] border-[#4C4F69]/20"
                  >
                    {hiddenPaths.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => handlePathClick(item.id)}
                        className="text-white/90 hover:text-white hover:bg-[#4C4F69]/10"
                      >
                        {item.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
