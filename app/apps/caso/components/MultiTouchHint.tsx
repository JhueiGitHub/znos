// app/apps/mila/components/MultiTouchHint.tsx
import React, { useEffect, useState } from "react";

const MultiTouchHint: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTouchCapability, setHasTouchCapability] = useState(false);

  useEffect(() => {
    // Check if device has touch capability
    const hasTouchSupport =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;

    setHasTouchCapability(hasTouchSupport);

    // Show hint after a short delay
    if (hasTouchSupport) {
      const timer = setTimeout(() => {
        setIsVisible(true);

        // Hide after 10 seconds
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
          localStorage.setItem("milaMultiTouchHintShown", "true");
        }, 10000);

        return () => clearTimeout(hideTimer);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Only show if user hasn't seen it before and device has touch
  if (
    !hasTouchCapability ||
    localStorage.getItem("milaMultiTouchHintShown") === "true"
  ) {
    return null;
  }

  return (
    <div
      className="multi-touch-hint"
      style={{
        opacity: isVisible ? 0.9 : 0,
      }}
    >
      <div className="flex items-center gap-1">
        <span>✨ Pro Tip: Use 3 fingers to drag notes</span>
      </div>
    </div>
  );
};

export default MultiTouchHint;
