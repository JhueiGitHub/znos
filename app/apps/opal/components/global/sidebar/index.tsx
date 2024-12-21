"use client";

import Image from "next/image";
import React from "react";

type Props = {
  activeWorkspaceId: string;
};

const Sidebar = ({ activeWorkspaceId }: Props) => {
  return (
    <div className="bg-black/30 flex-none relative p-4 h-full w-[250px] flex flex-col gap-4 items-center overflow-hidden">
      <div className="p-4 flex gap-2 justify-center items-center mb-4 absolute top-0 left-0 right-0">
        <Image
          src="/apps/opal/media/opal-logo.svg"
          height={40}
          width={40}
          alt="logo"
        />
        <p className="text-2xl">LOOM</p>
      </div>

      {/* Workspace content will be added here */}
    </div>
  );
};

export default Sidebar;
