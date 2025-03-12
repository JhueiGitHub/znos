"use client";

import { ReactNode } from "react";
import { MSMProvider } from "./context/MSMContext";
import "./globals.css";
import { Toaster } from "sonner";
import { useStyles } from "@/app/hooks/useStyles";

export default function MSMLayout({ children }: { children: ReactNode }) {
  const { getColor, getFont } = useStyles();

  return (
    <MSMProvider>
      <div className="h-full w-full overflow-hidden relative msm-app">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: getColor("Glass"),
              border: `1px solid ${getColor("Brd")}`,
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
            },
          }}
        />
      </div>
    </MSMProvider>
  );
}
