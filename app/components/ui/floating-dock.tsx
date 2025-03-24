import React from "react";
import {
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";

interface IconContainerProps {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
  backgroundColor: string;
  borderColor: string;
  outlineMode: "color" | "media";
  outlineValue?: string | null;
  outlineTokenId?: string;
  isColorFill?: boolean;
}

export const FloatingDock = ({
  items,
  backgroundColor,
  borderColor,
}: {
  items: {
    title: string;
    icon: React.ReactNode;
    href: string;
    isColorFill?: boolean;
    borderColor?: string;
    outlineMode: "color" | "media";
    outlineValue?: string | null;
    outlineTokenId?: string;
  }[];
  backgroundColor: string;
  borderColor: string;
}) => {
  let mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="flex h-16 items-end rounded-[19px] px-4 pb-3 relative"
      style={{
        border: `0.6px solid ${borderColor}`,
      }}
    >
      {/* GLASS EFFECT - Layer 1: Backdrop Blur */}
      <div className="absolute inset-0 rounded-[19px] backdrop-blur-[16px] -z-10" />

      {/* GLASS EFFECT - Layer 2: Gradient Overlay */}
      <div
        className="absolute inset-0 rounded-[19px] -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.15) 100%)",
          opacity: 0.7,
        }}
      />

      {/* GLASS EFFECT - Layer 3: Noise Texture (optional) */}
      <div
        className="absolute inset-0 rounded-[19px] mix-blend-overlay opacity-[0.03] -z-10"
        style={{
          backgroundImage: "url('/noise.png')",
          backgroundRepeat: "repeat",
        }}
      />

      {/* GLASS EFFECT - Layer 4: Top Highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] rounded-t-[19px] -z-10"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.07) 50%, transparent 100%)",
        }}
      />

      {/* The actual dock items - these need to be above the glass effect */}
      {items?.map((item) => (
        <IconContainer
          mouseX={mouseX}
          key={item.title}
          {...item}
          backgroundColor="transparent"
          borderColor={item.borderColor || borderColor}
        />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  backgroundColor,
  borderColor,
  outlineMode,
  outlineValue,
  isColorFill = false,
}: IconContainerProps) {
  let ref = useRef<HTMLDivElement>(null);
  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let iconSizeTransform = useTransform(
    distance,
    [-150, 0, 150],
    isColorFill ? [24, 48, 24] : [24, 60, 24]
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let iconSize = useSpring(iconSizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <Link href={href}>
      <motion.div
        ref={ref}
        style={{
          width,
          height,
          backgroundColor,
          position: "relative",
          margin: "0 4px",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="rounded-[19px] flex items-center justify-center"
      >
        {/* Base container without border */}
        <motion.div
          className="absolute inset-0 rounded-[19px]"
          style={{
            ...(outlineMode === "color"
              ? { border: `0.6px solid ${borderColor}` }
              : {}),
          }}
        />

        {/* Media outline container */}
        {outlineMode === "media" && outlineValue && (
          <motion.div
            className="absolute inset-0 rounded-[19px]"
            style={{
              width,
              height,
            }}
          >
            <div
              className="absolute inset-0"
              style={{ transform: "scale(1.2)", transformOrigin: "center" }}
            >
              <img
                src={outlineValue}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </motion.div>
        )}

        {/* Icon container */}
        <motion.div
          style={{
            width: iconSize,
            height: iconSize,
          }}
          className="relative z-10 flex items-center justify-center"
        >
          {icon}
        </motion.div>

        {/* Tooltip */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="px-2 py-0.5 whitespace-pre rounded-[19px] absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs z-20"
              style={{
                backgroundColor,
                border: `0.6px solid rgba(255, 255, 255, 0.09)`,
                color: borderColor,
              }}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}

export default FloatingDock;
