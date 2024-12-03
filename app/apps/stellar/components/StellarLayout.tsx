"use client";

import React from "react";
import { StellarSidebar } from "./StellarSidebar";
import { StellarContent } from "./StellarContent";
import { useStellarStore } from "../stores/stellar-store";
import { useStyles } from "@/app/hooks/useStyles";
import { SidebarProvider } from "@/components/ui/sidebar";

export function StellarLayout() {
  // PRESERVED: Clean dependency usage
  const { getColor } = useStyles();
  const { files } = useStellarStore();

  return (
    <div className="relative h-full w-full">
      <SidebarProvider>
        {/* EVOLVED: Pure app layout with no window chrome */}
        <div className="relative h-full w-full flex">
          <StellarSidebar />
          <StellarContent />
        </div>
      </SidebarProvider>
    </div>
  );
}
