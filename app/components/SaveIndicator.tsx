// /root/components/SaveIndicator.tsx

import React from "react";
import { useStyles } from "@os/hooks/useStyles";

type SaveStatus = "idle" | "saving" | "saved";

interface SaveIndicatorProps {
  status: SaveStatus;
}

const SaveIndicator: React.FC<SaveIndicatorProps> = ({ status }) => {
  const { getColor } = useStyles();

  const getStatusColor = () => {
    switch (status) {
      case "saving":
        return getColor("Yellow");
      case "saved":
        return getColor("Green");
      default:
        return getColor("Overlaying BG");
    }
  };

  return (
    <div
      className="w-3 h-3 rounded-full transition-colors duration-300"
      style={{ backgroundColor: getStatusColor() }}
    />
  );
};

export default SaveIndicator;
