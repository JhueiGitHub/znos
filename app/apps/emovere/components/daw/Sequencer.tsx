import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Step {
  active: boolean;
}

interface SequencerProps {
  stepsCount?: number;
  bpm?: number;
  onStepTrigger?: (stepIdx: number) => void;
}

export const Sequencer: React.FC<SequencerProps> = ({
  stepsCount = 16,
  bpm = 120,
  onStepTrigger,
}) => {
  const [steps, setSteps] = useState<Step[]>(
    Array.from({ length: stepsCount }, () => ({ active: false }))
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const intervalMs = 60000 / bpm / 4; // 16th notes

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % stepsCount;
        if (steps[next].active && onStepTrigger) onStepTrigger(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(interval);
  }, [isPlaying, steps, stepsCount, intervalMs, onStepTrigger]);

  const toggleStep = useCallback((idx: number) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], active: !copy[idx].active };
      return copy;
    });
  }, []);

  const handlePlay = () => setIsPlaying((p) => !p);

  return (
    <motion.div
      className="sequencer-mvp"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="sequencer-controls">
        <button onClick={handlePlay}>{isPlaying ? "Stop" : "Play"}</button>
      </div>
      <div className="sequencer-grid">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`sequencer-step${step.active ? " active" : ""}${currentStep === idx ? " current" : ""}`}
            onClick={() => toggleStep(idx)}
          >
            {idx + 1}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
