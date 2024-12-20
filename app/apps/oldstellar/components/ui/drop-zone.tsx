// /root/app/apps/stellar/components/ui/drop-zone.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  isActive: boolean;
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

export const DropZone = ({
  isActive,
  message = "Drop here",
  className,
  children,
}: DropZoneProps) => {
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#4C4F69]/20 border-2 border-dashed border-[#4C4F69]/40 rounded-lg pointer-events-none"
          >
            <div className="flex items-center justify-center h-full">
              <span className="text-[#4C4F69] text-lg">{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
};
