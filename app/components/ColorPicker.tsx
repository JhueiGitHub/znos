import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChromePicker, ColorResult } from "react-color";
import { useStyles } from "../hooks/useStyles";

interface ColorPickerProps {
  color: string;
  opacity: number;
  onUpdate: (color: string, opacity: number) => void;
  onClose: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  opacity,
  onUpdate,
  onClose,
}) => {
  const [localColor, setLocalColor] = useState(color);
  const [localOpacity, setLocalOpacity] = useState(opacity);
  const { getColor, getFont } = useStyles();

  const handleChange = (colorResult: ColorResult) => {
    setLocalColor(colorResult.hex);
    setLocalOpacity(Math.round((colorResult.rgb.a ?? 1) * 100));
  };

  const handleAccept = () => {
    onUpdate(localColor, localOpacity);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          className="bg-white p-4 rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
          style={{ backgroundColor: getColor("Overlaying BG") }}
        >
          <ChromePicker color={localColor} onChange={handleChange} />
          <div className="mt-4 flex justify-between">
            <button
              className="px-4 py-2 rounded"
              onClick={onClose}
              style={{
                backgroundColor: getColor("Brd"),
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded"
              onClick={handleAccept}
              style={{
                backgroundColor: getColor("Lilac Accent"),
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
            >
              Accept
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ColorPicker;
