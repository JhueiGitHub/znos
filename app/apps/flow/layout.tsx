"use client";

import { usePathname } from "next/navigation";
import { DesignSystemProvider } from "../../contexts/DesignSystemContext";
import { FlowSidebar } from "./components/FlowSidebar";
import { useState } from "react";
import { Toaster } from "sonner";
import { useStyles } from "@/app/hooks/useStyles";
import { ViewType } from "./types/view";
import "./styles/globals.css";

export default function FlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isEditor = pathname?.includes("/flow/editor") ?? false;
  const [currentView, setCurrentView] = useState<ViewType>("streams");
  const { getColor, getFont } = useStyles();

  return (
    <DesignSystemProvider>
      <div className="h-screen bg-[#010203]">
        {!isEditor ? (
          <div className="flex h-screen overflow-hidden">
            <FlowSidebar
              onViewChange={(view: ViewType) => setCurrentView(view)}
            />
            {children}
          </div>
        ) : (
          children
        )}
        <Toaster
          className="toaster group"
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: getColor("Glass"),
              border: `1px solid ${getColor("Brd")}`,
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
            },
            classNames: {
              toast:
                "group toast group-[.toaster]:bg-transparent group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
              description: "group-[.toast]:text-muted-foreground",
              actionButton:
                "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
              cancelButton:
                "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
            },
          }}
        />
      </div>
    </DesignSystemProvider>
  );
}
