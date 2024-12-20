import React from "react";
import { useStyles } from "@os/hooks/useStyles";

const ObsidianContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { getColor } = useStyles();

  return (
    <div className="flex h-full w-full p-3.5 gap-3 bg-[#ffffff1b]">
      {children}
    </div>
  );
};

export default ObsidianContainer;
