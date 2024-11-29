import { useState } from "react";
import { motion } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import { ScrollArea } from "@/components/ui/scroll-area";

export function StellarView() {
  const { getColor, getFont } = useStyles();
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  return (
    <ScrollArea className="flex-1">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6"
      >
        <div className="grid grid-cols-5 gap-4">
          {/* Grid placeholder - will integrate with media system */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="aspect-square rounded-lg border backdrop-blur-sm flex items-center justify-center"
              style={{
                backgroundColor: getColor("Glass"),
                borderColor: getColor("Brd"),
              }}
            >
              <span
                className="text-sm"
                style={{
                  color: getColor("Text Secondary (Bd)"),
                  fontFamily: getFont("Text Secondary"),
                }}
              >
                File {i + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </ScrollArea>
  );
}
