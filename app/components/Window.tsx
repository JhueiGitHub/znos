import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { AppDefinition } from "../types/AppTypes";
import { useAppStore } from "../store/appStore";
import { useStyles } from "../hooks/useStyles";

interface WindowProps {
  app: AppDefinition;
  isActive: boolean;
}

interface DynamicAppProps {}

const Window: React.FC<WindowProps> = ({ app, isActive }) => {
  const { closeApp, setActiveApp, updateAppState, openApps } = useAppStore();
  const { getColor } = useStyles();

  const AppComponent = dynamic<DynamicAppProps>(
    () => import(`../apps/${app.id}/page`),
    {
      loading: () => <p>Loading...</p>,
    }
  );

  const appState = openApps.find((openApp) => openApp.id === app.id);
  const isMinimized = appState?.isMinimized || false;

  const handleClose = () => closeApp(app.id);
  const handleMinimize = () => updateAppState(app.id, { isMinimized: true });
  const handleMaximize = () => {
    updateAppState(app.id, { isMinimized: false });
    setActiveApp(app.id);
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isMinimized ? 0 : 1,
        opacity: isMinimized ? 0 : 1,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      exit={{ scale: 0, opacity: 0 }}
      style={{
        zIndex: isActive ? 100 : 1,
      }}
      className="fixed inset-0 w-full h-full flex flex-col shadow-lg overflow-hidden backdrop-blur-[18px] bg-[#00000030]"
    >
      <div
        className="p-[9px] flex justify-between items-center backdrop-blur-[18px] bg-[#0000009f]"
        onClick={() => setActiveApp(app.id)}
      >
        <div className="flex space-x-2">
          <button
            onClick={handleClose}
            className="w-3 h-3 rounded-full bg-red-500"
          />
          <button
            onClick={handleMinimize}
            className="w-3 h-3 rounded-full bg-yellow-500"
          />
          <button
            onClick={handleMaximize}
            className="w-3 h-3 rounded-full bg-green-500"
          />
        </div>
        <h2
          className="text-sm font-medium"
          style={{ color: getColor("Text Primary (Hd)") }}
        ></h2>
      </div>
      <div className="flex-grow overflow-hidden">
        <AppComponent />
      </div>
    </motion.div>
  );
};

export default Window;
