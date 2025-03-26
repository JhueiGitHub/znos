// app/apps/mila/components/EnhancedMilanoteWrapper.tsx
import React from "react";
import { ShorthandProvider } from "../systems/shorthandSystem";
import MilanoteBreadcrumb from "./MilanoteBreadcrumb";
import MilanoteCanvas from "./MilanoteCanvas";
import MilanoteToolbar from "./MilanoteToolbar";

/**
 * Enhanced Milanote wrapper component that wraps the existing Milanote app
 * with the new ShorthandProvider and ensures proper integration.
 */
const EnhancedMilanoteWrapper: React.FC = () => {
  return (
    <ShorthandProvider>
      <div className="h-full w-full flex flex-col bg-black/70">
        <MilanoteBreadcrumb />
        <div className="relative flex-1 overflow-hidden">
          <MilanoteCanvas />
          <MilanoteToolbar />
        </div>
      </div>
    </ShorthandProvider>
  );
};

export default EnhancedMilanoteWrapper;
