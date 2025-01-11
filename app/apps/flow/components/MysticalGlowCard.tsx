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
      {/* Mystical backdrop layer - creates the base ethereal effect */}
      <motion.div
        className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }}
        transition={{ duration: 0.5 }}
      >
        {/* Northern lights reverse effect - the mysterious portal backdrop */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div
            className="absolute inset-0 blur-2xl"
            style={{
              background: `
                radial-gradient(circle at 50% 50%, 
                  rgba(255, 0, 0, 0.15), 
                  rgba(255, 0, 0, 0.1) 20%, 
                  transparent 70%
                )
              `,
            }}
          />
        </div>
      </motion.div>

      {/* Animated mist layers */}
      <div className="absolute -inset-2 rounded-2xl overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 30% 50%, rgba(255,0,0,0.08), transparent 50%)",
              "radial-gradient(circle at 70% 50%, rgba(255,0,0,0.08), transparent 50%)",
              "radial-gradient(circle at 30% 50%, rgba(255,0,0,0.08), transparent 50%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 70% 30%, rgba(255,0,0,0.08), transparent 50%)",
              "radial-gradient(circle at 30% 70%, rgba(255,0,0,0.08), transparent 50%)",
              "radial-gradient(circle at 70% 30%, rgba(255,0,0,0.08), transparent 50%)",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      {/* Edge glow effect */}
      <div className="absolute -inset-[1px] rounded-2xl">
        <div className="absolute inset-0 rounded-2xl opacity-50">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: `
                linear-gradient(90deg, 
                  transparent, 
                  rgba(255, 0, 0, 0.12) 20%,
                  rgba(255, 0, 0, 0.12) 80%,
                  transparent
                )
              `,
              animation: "pulseGlow 4s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Main card content with subtle lift effect */}
      <motion.div
        className="relative"
        whileHover={{
          y: -2,
          transition: { duration: 0.2 },
        }}
      >
        {children}
      </motion.div>

      {/* Global styles for the glow animation */}
      <style jsx global>{`
        @keyframes pulseGlow {
          0% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.5;
          }
        }

        .mystical-glow {
          animation: mistFlow 20s ease-in-out infinite;
          filter: blur(40px);
        }

        @keyframes mistFlow {
          0% {
            transform: translateX(-25%) translateY(-25%) rotate(0deg);
          }
          50% {
            transform: translateX(25%) translateY(25%) rotate(180deg);
          }
          100% {
            transform: translateX(-25%) translateY(-25%) rotate(360deg);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default MysticalGlowCard;
