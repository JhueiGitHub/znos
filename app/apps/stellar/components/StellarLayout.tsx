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
    <SidebarProvider>
      {/* EVOLVED: Pure app layout with no window chrome */}
      <div className="relative h-full flex w-full bg-black">
        <StellarSidebar />
        <StellarContent />
      </div>
    </SidebarProvider>
  );
}
