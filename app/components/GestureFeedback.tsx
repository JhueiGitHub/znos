import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GestureFeedbackProps {
  direction: string;
}

const GestureFeedback: React.FC<GestureFeedbackProps> = ({ direction }) => {
  return (
    <AnimatePresence>
      {direction && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-[9999]"
        >
          <motion.div
            className="text-[#4C4F69] bg-[#010203]/80 backdrop-blur-md px-8 py-4 rounded-xl text-2xl font-bold border border-[#4C4F69]/20"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            exit={{ y: 20 }}
          >
            {direction.toUpperCase()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GestureFeedback;
