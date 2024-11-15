import React from "react";
import Finder from "./Finder";
import { useFileSystem } from "./hooks/useFileSystem";

const App: React.FC = () => {
  const fileSystemProps = useFileSystem();

  return (
    <div className="h-full w-full">
      <Finder {...fileSystemProps} />
    </div>
  );
};

export default App;
