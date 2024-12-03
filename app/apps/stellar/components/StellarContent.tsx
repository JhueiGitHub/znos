"use client";

import React from "react";
import { useStyles } from "@/app/hooks/useStyles";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StellarBreadcrumb } from "./StellarBreadcrumb";

export function StellarContent() {
  const { getColor } = useStyles();

  return (
    <div className="relative h-full w-full flex-1 flex flex-col bg-[#010203]/80">
      {/* Top navigation with breadcrumbs */}
      <div className="h-8 px-[22px] py-4 border-b border-white/10 flex items-center">
        <StellarBreadcrumb />
      </div>

      {/* Files grid */}
      <div className="relative h-full w-full">
        <ScrollArea className="w-full h-full flex-1">
          <div className="w-full h-full grid grid-cols-6 gap-4 p-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded bg-white/5 flex items-center justify-center text-[#cccccc]/90 text-sm"
              >
                File {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Status bar */}
      <div className="h-5 border-t border-[#292929]/80" />
    </div>
  );
}
