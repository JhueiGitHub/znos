import React from "react";
import { cn } from "@/lib/utils";

interface TimelineDisplayProps {
  currentStep: number;
  totalSteps: number;
  bpm: number;
  zoomLevel: number;
}

export const TimelineDisplay: React.FC<TimelineDisplayProps> = ({
  currentStep,
  totalSteps,
  bpm,
  zoomLevel,
}) => {
  // Calculate time for each bar
  const secondsPerBeat = 60 / bpm;
  const beatsPerBar = 4;
  const secondsPerBar = secondsPerBeat * beatsPerBar;
  const totalBars = totalSteps / beatsPerBar;

  // Calculate time position
  const currentTimeInSeconds =
    (currentStep / (totalSteps / beatsPerBar)) * secondsPerBar;
  const minutes = Math.floor(currentTimeInSeconds / 60);
  const seconds = Math.floor(currentTimeInSeconds % 60);
  const milliseconds = Math.floor((currentTimeInSeconds % 1) * 1000);

  return (
    <div className="h-9 border-b border-[#333] flex relative">
      {/* Time display */}
      <div className="w-[240px] border-r border-[#333] flex items-center justify-between px-4 relative z-10">
        <div className="flex items-center">
          <span className="text-xs font-medium text-[#BBBBBB]">TIME</span>
        </div>
        <div className="flex items-center">
          <span className="text-xs font-mono text-[#EEEEEE] font-medium">
            {minutes.toString().padStart(2, "0")}:
            {seconds.toString().padStart(2, "0")}.
            {milliseconds.toString().padStart(3, "0")}
          </span>
        </div>
      </div>

      {/* Beats and bars */}
      <div className="flex-1 flex items-end relative">
        {/* Vertical grid lines for each bar */}
        {Array.from({ length: totalBars }).map((_, barIndex) => (
          <div
            key={`bar-${barIndex}`}
            className="absolute top-0 bottom-0 w-px bg-[#444]"
            style={{
              left: `${barIndex * beatsPerBar * (100 / totalSteps)}%`,
              opacity: barIndex === 0 ? 0 : 1,
            }}
          />
        ))}

        {/* Lighter vertical grid lines for each beat */}
        {Array.from({ length: totalSteps }).map((_, stepIndex) => {
          const isBeatStart = stepIndex % beatsPerBar === 0;
          return !isBeatStart ? (
            <div
              key={`beat-${stepIndex}`}
              className="absolute top-0 bottom-0 w-px bg-[#333]"
              style={{
                left: `${stepIndex * (100 / totalSteps)}%`,
                height: "50%",
                top: "50%",
              }}
            />
          ) : null;
        })}

        {/* Bar numbers */}
        {Array.from({ length: totalBars }).map((_, barIndex) => (
          <div
            key={`bar-label-${barIndex}`}
            className="absolute bottom-0 flex items-center justify-center"
            style={{
              left: `${barIndex * beatsPerBar * (100 / totalSteps)}%`,
              width: `${beatsPerBar * (100 / totalSteps)}%`,
              height: "100%",
            }}
          >
            <div className="text-[10px] text-[#BBBBBB] font-medium absolute bottom-1 left-2">
              {barIndex + 1}
            </div>

            {/* Beat numbers within this bar */}
            <div className="w-full h-full flex">
              {Array.from({ length: beatsPerBar }).map((_, beatIndex) => (
                <div
                  key={`beat-label-${barIndex}-${beatIndex}`}
                  className="flex-1 h-full relative"
                >
                  <div className="text-[9px] text-[#999999] absolute top-1 left-1">
                    {beatIndex + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Current position marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-[#64B5F6] pointer-events-none z-10"
          style={{
            left: `calc(${(currentStep / totalSteps) * 100}% - 1px)`,
            boxShadow: "0 0 3px 0 rgba(100, 181, 246, 0.5)",
          }}
        />
      </div>

      {/* Additional control indicators on the right */}
      <div className="absolute top-0 right-0 bottom-0 flex items-center pr-4 z-10">
        <div className="flex items-center gap-2">
          <div className="text-[10px] text-[#BBBBBB] px-2 py-1 rounded bg-[#2A2A2A]">
            {zoomLevel.toFixed(1)}x
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineDisplay;
