import { debounce } from "lodash";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { ChromePicker, ColorResult } from "react-color";

interface CanvasComponentProps {
  component: any;
  onUpdate: (updates: any) => void;
  getColor: (name: string) => string;
  getFont: (name: string) => string;
}

const CanvasComponent: React.FC<CanvasComponentProps> = ({
  component,
  onUpdate,
  getColor,
  getFont,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [localColor, setLocalColor] = useState(component.value);
  const [localOpacity, setLocalOpacity] = useState(component.opacity);
  const debouncedUpdate = useRef(debounce(onUpdate, 1000)).current;
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleColorChange = (color: ColorResult) => {
    setLocalColor(color.hex);
    // Commented out to isolate the issue:
    // onUpdate(component.id, { value: color.hex, opacity: Math.round(color.rgb.a * 100) });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPicker(true);
    console.log("Color icon clicked"); // Debugging log
  };

  if (component.type !== "color") return null;

  return (
    <div className="relative">
      <div
        className="w-20 h-20 rounded cursor-pointer"
        style={{ backgroundColor: localColor }}
        onClick={handleClick}
      />
      {showPicker && (
        <div className="absolute z-10 mt-2" ref={pickerRef}>
          <ChromePicker color={localColor} onChange={handleColorChange} />
        </div>
      )}
    </div>
  );
};

export default CanvasComponent;
