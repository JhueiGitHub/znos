// /root/app/apps/monopoly/components/dice-roller.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DiceRollerProps {
  onRollComplete: (result: number) => void;
}

export function DiceRoller({ onRollComplete }: DiceRollerProps) {
  const [diceValue1, setDiceValue1] = useState(1);
  const [diceValue2, setDiceValue2] = useState(1);

  useEffect(() => {
    let rollCount = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
      setDiceValue1(Math.floor(Math.random() * 6) + 1);
      setDiceValue2(Math.floor(Math.random() * 6) + 1);
      rollCount++;

      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);
        const finalValue1 = Math.floor(Math.random() * 6) + 1;
        const finalValue2 = Math.floor(Math.random() * 6) + 1;
        setDiceValue1(finalValue1);
        setDiceValue2(finalValue2);
        onRollComplete(finalValue1 + finalValue2);
      }
    }, 100);

    return () => clearInterval(rollInterval);
  }, [onRollComplete]);

  return (
    <div className="flex gap-4">
      <motion.img
        src={`/monopoly/c${diceValue1}.png`}
        alt={`Dice ${diceValue1}`}
        className="w-16 h-16"
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.img
        src={`/monopoly/c${diceValue2}.png`}
        alt={`Dice ${diceValue2}`}
        className="w-16 h-16"
        animate={{
          rotate: -360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  );
}
