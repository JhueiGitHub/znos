// components/ui/floating-dock.tsx
"use client";

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
  backgroundColor,
  borderColor,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
  backgroundColor: string;
  borderColor: string;
}) => {
  return (
    <>
      <FloatingDockDesktop
        items={items}
        className={desktopClassName}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
      />
      <FloatingDockMobile
        items={items}
        className={mobileClassName}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
      />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
  backgroundColor,
  borderColor,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
  backgroundColor: string;
  borderColor: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute bottom-full mb-2 inset-x-0 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: { delay: idx * 0.05 },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <Link
                  href={item.href}
                  key={item.title}
                  className="h-10 w-10 rounded-[19px] flex items-center justify-center"
                  style={{
                    backgroundColor,
                    border: `0.6px solid rgba(255, 255, 255, 0.09)`,
                  }}
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="h-10 w-10 rounded-[19px] flex items-center justify-center"
        style={{
          backgroundColor,
          border: `0.6px solid rgba(255, 255, 255, 0.09)`,
        }}
      >
        <IconLayoutNavbarCollapse
          className="h-5 w-5"
          style={{ color: borderColor }}
        />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
  backgroundColor,
  borderColor,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
  backgroundColor: string;
  borderColor: string;
}) => {
  let mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden md:flex h-16 items-end rounded-[19px] px-4 pb-3",
        className
      )}
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
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20]
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
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </Link>
  );
}
