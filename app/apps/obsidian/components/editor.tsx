import React from "react";
import { useStyles } from "@os/hooks/useStyles";

const Editor: React.FC = () => {
  const { getColor, getFont } = useStyles();

  return (
    <div
      className="flex-1 p-6 rounded-lg bg-[#00000093]"
      style={{
        color: getColor("Text Primary (Hd)"),
        fontFamily: getFont("Text Primary"),
      }}
    >
      <h1 className="text-2xl font-bold mb-4"></h1>
      <p></p>
      <p></p>
    </div>
  );
};

export default Editor;
