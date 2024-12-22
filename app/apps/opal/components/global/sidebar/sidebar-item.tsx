import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

type Props = {
  icon: React.ReactNode;
  title: string;
  href: string;
  selected: boolean;
  notifications?: number;
};

const SidebarItem = ({ href, icon, selected, title, notifications }: Props) => {
  return (
    <li className="cursor-pointer my-[5px]">
      <Link href={href}>
        <motion.div
          className={cn(
            "flex items-center justify-between group rounded-lg",
            selected ? "bg-[#4C4F69]" : ""
          )}
          initial={{ backgroundColor: "rgba(76, 79, 105, 0)" }}
          animate={{
            backgroundColor: selected
              ? "rgba(76, 79, 105, 1)"
              : "rgba(76, 79, 105, 0)",
          }}
          whileHover={{ backgroundColor: "rgba(76, 79, 105, 0.2)" }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 transition-all p-[5px] cursor-pointer">
            {icon}
            <span
              className={cn(
                "font-medium transition-all truncate w-32",
                selected ? "text-[#cccccc95]" : "text-[#cccccc81]"
              )}
            >
              {title}
            </span>
          </div>
        </motion.div>
      </Link>
    </li>
  );
};

export default SidebarItem;
