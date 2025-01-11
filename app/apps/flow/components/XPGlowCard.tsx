import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MysticalGlowCardProps {
  children: React.ReactNode;
  isAddedToXP?: boolean;
}

const MysticalGlowCard: React.FC<MysticalGlowCardProps> = ({
  children,
  isAddedToXP = false,
}) => {
  if (!isAddedToXP) return <>{children}</>;

  return (
    <motion.div
      className="relative group"
      initial={{ z: 0 }}
      animate={{ z: 10 }}
      transition={{
        z: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
      }}
    >
      {/* Ethereal koi spirit layer */}
      <div className="absolute -inset-4 rounded-2xl overflow-hidden">
        {/* First koi spirit */}
        <motion.div
          className="absolute w-32 h-32 blur-xl opacity-0 group-hover:opacity-40"
          animate={{
            x: ["0%", "100%", "50%", "0%"],
            y: ["0%", "50%", "100%", "0%"],
            scale: [1, 1.2, 1, 1.2, 1],
            filter: ["blur(8px)", "blur(12px)", "blur(8px)"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,60,60,0.3), transparent 70%)",
          }}
        />

        {/* Second koi spirit */}
        <motion.div
          className="absolute w-32 h-32 blur-xl opacity-0 group-hover:opacity-40"
          animate={{
            x: ["100%", "0%", "100%", "50%"],
            y: ["50%", "100%", "0%", "50%"],
            scale: [1.2, 1, 1.2, 1, 1.2],
            filter: ["blur(12px)", "blur(8px)", "blur(12px)"],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,40,40,0.25), transparent 70%)",
          }}
        />

        {/* Third koi spirit - moving in a different pattern */}
        <motion.div
          className="absolute w-32 h-32 blur-xl opacity-0 group-hover:opacity-40"
          animate={{
            x: ["50%", "0%", "100%", "50%"],
            y: ["100%", "50%", "50%", "100%"],
            scale: [1, 1.2, 1, 1.2],
            filter: ["blur(10px)", "blur(14px)", "blur(10px)"],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,50,50,0.28), transparent 70%)",
          }}
        />
      </div>

      {/* Mystical mist overlay */}
      <div className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at 30% 50%, rgba(255,30,30,0.06), transparent 60%)",
                "radial-gradient(circle at 70% 30%, rgba(255,30,30,0.06), transparent 60%)",
                "radial-gradient(circle at 30% 50%, rgba(255,30,30,0.06), transparent 60%)",
              ],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>

      {/* Subtle edge glow */}
      <div className="absolute -inset-[1px] rounded-2xl">
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              "0 0 0 1px rgba(255,0,0,0.1)",
              "0 0 0 1px rgba(255,0,0,0.2)",
              "0 0 0 1px rgba(255,0,0,0.1)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="relative"
        whileHover={{
          y: -2,
          transition: { duration: 0.2 },
        }}
      >
        {children}
      </motion.div>

      <style jsx global>{`
        .koi-spirit {
          will-change: transform, opacity, filter;
        }

        @keyframes shimmerGlow {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default MysticalGlowCard;
