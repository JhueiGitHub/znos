import React from 'react';
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
  }[];
  backgroundColor: string;
  borderColor: string;
}) => {
  let mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="flex h-16 items-end rounded-[19px] px-4 pb-3"
      style={{
        backgroundColor,
        border: `0.6px solid rgba(255, 255, 255, 0.09)`,
      }}
    >
      {items.map((item) => (
        <IconContainer
          mouseX={mouseX}
          key={item.title}
          {...item}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
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
  isColorFill = false,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
  backgroundColor: string;
  borderColor: string;
  isColorFill?: boolean;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Container transforms remain the same for layout consistency
  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  // Different icon size transforms based on type
  let iconSizeTransform = useTransform(
    distance, 
    [-150, 0, 150], 
    isColorFill 
      ? [24, 48, 24]  // Color fills max out at 48px
      : [24, 64, 24]  // Media icons can go up to 64px
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
          border: `0.6px solid rgba(255, 255, 255, 0.09)`,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="rounded-[19px] flex items-center justify-center relative"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="px-2 py-0.5 whitespace-pre rounded-[19px] absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs"
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
        
        {/* Icon container with dynamic sizing */}
        <motion.div 
          style={{ 
            width: iconSize,
            height: iconSize,
          }}
          className="flex items-center justify-center rounded-md overflow-hidden"
        >
          {icon}
        </motion.div>
      </motion.div>
    </Link>
  );
}

export default FloatingDock;