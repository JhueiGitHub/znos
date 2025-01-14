"use client";
import { cn } from "@/lib/utils";
import {
  MotionValue,
  color,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
export const FloatingDock = ({
  items,
  backgroundColor,
  borderColor,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  backgroundColor: string;
  borderColor: string;
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="flex h-16 items-end px-4 pb-3 overflow-visible"
      style={{
        backgroundColor,
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
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
  backgroundColor: string;
  borderColor: string;
}) {
  let ref = useRef<HTMLDivElement>(null);
  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });
  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
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
  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
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
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex items-center justify-center relative overflow-visible"
      >
        {/* Custom outline image - scales with container */}
        <motion.img
          src="/media/orion-outline.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{
            width,
            height,
          }}
        />

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="px-2 py-0.5 whitespace-pre rounded-[19px] absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs"
              style={{
                backgroundColor,
                border: 0.6px solid rgba(255, 255, 255, 0.09),
                color: borderColor,
              }}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center z-10"
        >
          {icon}
        </motion.div>
      </motion.div>
    </Link>
  );
}