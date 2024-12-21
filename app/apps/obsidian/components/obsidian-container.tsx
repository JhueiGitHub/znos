// app/apps/obsidian/components/obsidian-container.tsx
import React from "react";

const ObsidianContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className="flex h-full w-full p-4">{children}</div>;
};

export default ObsidianContainer;
