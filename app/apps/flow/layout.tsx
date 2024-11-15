"use client";

import { usePathname } from "next/navigation";
import { DesignSystemProvider } from "../../contexts/DesignSystemContext";
import { FlowSidebar } from "./components/FlowSidebar";
import "./styles/globals.css";

export default function FlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isEditor = pathname.includes("/flow/editor");

  return (
    <DesignSystemProvider>
      <div className="h-screen bg-[#d52929]">
        {!isEditor ? (
          <div className="flex h-screen overflow-hidden">
            <FlowSidebar />
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </DesignSystemProvider>
  );
}
