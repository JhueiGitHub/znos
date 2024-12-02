"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useStellarStore, StellarFile } from "../stores/stellar-store";
import { useStyles } from "@/app/hooks/useStyles";

interface StellarProviderProps {
  children: React.ReactNode;
}

export function StellarProvider({ children }: StellarProviderProps) {
  const { getColor } = useStyles();
  const setFiles = useStellarStore((state) => state.setFiles);

  // PRESERVED: Basic query setup
  // EVOLVED: Properly typed initial data
  const { isLoading } = useQuery({
    queryKey: ["stellar-files"],
    queryFn: async () => {
      const defaultFiles: StellarFile[] = [
        {
          id: "panther",
          name: "Panther",
          path: "/panther",
          type: "folder",
        },
        {
          id: "desktop",
          name: "Desktop",
          path: "/desktop",
          type: "folder",
        },
        {
          id: "documents",
          name: "Documents",
          path: "/documents",
          type: "folder",
        },
      ];
      setFiles(defaultFiles);
      return defaultFiles;
    },
  });

  if (isLoading) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        style={{ color: getColor("Text Secondary (Bd)") }}
      >
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
