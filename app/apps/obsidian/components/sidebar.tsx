import React from "react";
import { Tree, Folder, File } from "./ui/file-tree";
import { useStyles } from "@os/hooks/useStyles";
import Image from "next/image";

const Sidebar: React.FC = () => {
  const { getColor, getFont } = useStyles();

  const ELEMENTS = [
    {
      id: "1",
      isSelectable: true,
      name: "My Notebook",
      children: [
        {
          id: "2",
          isSelectable: true,
          name: "Chapter 1",
          children: [
            {
              id: "3",
              isSelectable: true,
              name: "Notes.md",
            },
            {
              id: "4",
              isSelectable: true,
              name: "Ideas.md",
            },
          ],
        },
        {
          id: "5",
          isSelectable: true,
          name: "Chapter 2",
          children: [
            {
              id: "6",
              isSelectable: true,
              name: "Research.md",
            },
          ],
        },
      ],
    },
  ];

  const customTreeStyles = {
    color: "#7E8691",
    fontFamily: getFont("Text Primary"),
    "--tree-indicator-color": "rgba(76, 79, 105, 0.3)",
    "--tree-selected-bg": "rgba(0, 0, 0, 0)",
  } as React.CSSProperties;

  const FolderIcon = ({ isOpen }: { isOpen: boolean }) => (
    <Image
      src={isOpen ? "/icns/_folder_open.png" : "/icns/_folder.png"}
      alt={isOpen ? "Open Folder" : "Closed Folder"}
      width={16}
      height={16}
    />
  );

  const FileIcon = () => (
    <Image src="/icns/_file.png" alt="File" width={16} height={16} />
  );

  return (
    <div className="w-[240px] overflow-auto">
      <Tree
        className="p-2"
        initialSelectedId="3"
        initialExpandedItems={["1", "2"]}
        elements={ELEMENTS}
        style={customTreeStyles}
        openIcon={<FolderIcon isOpen={true} />}
        closeIcon={<FolderIcon isOpen={false} />}
      >
        <Folder element="My Notebook" value="1">
          <Folder value="2" element="Chapter 1">
            <File value="3" fileIcon={<FileIcon />}>
              <p>Notes.md</p>
            </File>
            <File value="4" fileIcon={<FileIcon />}>
              <p>Ideas.md</p>
            </File>
          </Folder>
          <Folder value="5" element="Chapter 2">
            <File value="6" fileIcon={<FileIcon />}>
              <p>Research.md</p>
            </File>
          </Folder>
        </Folder>
      </Tree>
    </div>
  );
};

export default Sidebar;
