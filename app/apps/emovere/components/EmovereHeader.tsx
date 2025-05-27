"use client";

import React from "react";
import { motion } from "framer-motion";
import { Layers, Grid, Save, Download, Settings, HelpCircle } from "lucide-react";

export default function EmovereHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#000000] border-b border-[#29292981] px-6 py-3 flex items-center justify-between"
    >
      {/* Left Section - App Name and Status */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#4C4F69] to-[#694C4C] bg-clip-text text-transparent">
          Emovere
        </h1>
        <span className="text-xs text-[#CCCCCC]/60 bg-[#292929] px-2 py-1 rounded">
          Canvas DAW • UI Prototype
        </span>
      </div>

      {/* Center Section - View Controls */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg bg-[#292929] hover:bg-[#292929]/80 transition-colors"
          title="Grid View"
        >
          <Grid size={18} color="#CCCCCC" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg bg-[#292929] hover:bg-[#292929]/80 transition-colors"
          title="Layers"
        >
          <Layers size={18} color="#CCCCCC" />
        </motion.button>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-[#292929] transition-colors"
          title="Save Project"
        >
          <Save size={18} color="#CCCCCC" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-[#292929] transition-colors"
          title="Export"
        >
          <Download size={18} color="#CCCCCC" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-[#292929] transition-colors"
          title="Settings"
        >
          <Settings size={18} color="#CCCCCC" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-[#292929] transition-colors"
          title="Help"
        >
          <HelpCircle size={18} color="#CCCCCC" />
        </motion.button>
      </div>
    </motion.header>
  );
}
