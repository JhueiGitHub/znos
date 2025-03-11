// app/apps/studio/components/PianoRoll.tsx
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { StepType } from "reactronica";
import { useStyles } from "@/app/hooks/useStyles";

// Full note range from C1 to B7
const NOTES = (() => {
  const notes: string[] = [];
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  for (let octave = 1; octave <= 7; octave++) {
    noteNames.forEach((note) => {
      notes.push(`${note}${octave}`);
    });
  }

  return notes.reverse(); // Reverse to display high notes at top
})();

interface PianoRollProps {
  steps: StepType[];
  trackId: string;
  onStepChange: (
    stepIndex: number,
    noteIndex: number,
    value: string | null
  ) => void;
  zoomLevel?: number;
  quantizeValue?: string;
  snapToGrid?: boolean;
}

export const PianoRoll: React.FC<PianoRollProps> = ({
  steps,
  trackId,
  onStepChange,
  zoomLevel = 1,
  quantizeValue = "8n",
  snapToGrid = true,
}) => {
  const { getColor, getFont } = useStyles();
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [hoverNote, setHoverNote] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const rollContainerRef = useRef<HTMLDivElement>(null);
  const pianoKeysRef = useRef<HTMLDivElement>(null);

  const CELL_HEIGHT = 24;
  const CELL_WIDTH = Math.max(24, 24 * zoomLevel);
  const stepCount = steps.length;

  // Handle scrolling
  useEffect(() => {
    if (!rollContainerRef.current) return;

    // Initial scroll position - center on middle C
    const midCIndex = NOTES.findIndex((note) => note === "C4");
    if (midCIndex >= 0) {
      const scrollPos = midCIndex * CELL_HEIGHT;
      rollContainerRef.current.scrollTop =
        scrollPos - rollContainerRef.current.clientHeight / 2;
    }
  }, []);

  // Synchronize piano keys scroll with grid scroll
  useEffect(() => {
    if (!rollContainerRef.current || !pianoKeysRef.current) return;

    const handleScroll = () => {
      if (rollContainerRef.current && pianoKeysRef.current) {
        pianoKeysRef.current.scrollTop = rollContainerRef.current.scrollTop;
      }
    };

    rollContainerRef.current.addEventListener("scroll", handleScroll);
    return () => {
      if (rollContainerRef.current) {
        rollContainerRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Check if a cell has a note
  const hasNote = (stepIndex: number, noteName: string): boolean => {
    const step = steps[stepIndex];
    if (!step) return false;

    if (Array.isArray(step)) {
      return step.some((n) =>
        typeof n === "string" ? n === noteName : n.name === noteName
      );
    }

    return typeof step === "string"
      ? step === noteName
      : step.name === noteName;
  };

  // Handle adding/removing notes
  const toggleNote = (stepIndex: number, noteName: string) => {
    const step = steps[stepIndex];
    const noteIndex = NOTES.indexOf(noteName);

    if (hasNote(stepIndex, noteName)) {
      // Remove the note
      onStepChange(stepIndex, noteIndex, null);
    } else {
      // Add the note
      onStepChange(stepIndex, noteIndex, noteName);
    }
  };

  // Keyboard piano handling
  const playNote = (noteName: string) => {
    // This would be implemented to preview the note sound
    console.log("Playing note:", noteName);
  };

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        color: getColor("Text Primary (Hd)"),
        fontFamily: getFont("Text Primary"),
      }}
    >
      {/* Header bar */}
      <div
        className="h-10 border-b flex items-center justify-between px-4"
        style={{ borderColor: getColor("Brd") }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Piano Roll</span>
          <span className="text-xs px-2 py-0.5 rounded bg-[#4C4F69]/10 opacity-70">
            {trackId}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-70">Zoom:</span>
            <span className="text-xs">{Math.round(zoomLevel * 100)}%</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs opacity-70">Quantize:</span>
            <span className="text-xs">{quantizeValue}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs opacity-70">Snap:</span>
            <span className="text-xs">{snapToGrid ? "On" : "Off"}</span>
          </div>
        </div>
      </div>

      {/* Main piano roll area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Piano keyboard */}
        <div
          ref={pianoKeysRef}
          className="w-[80px] flex-shrink-0 border-r overflow-hidden"
          style={{ borderColor: getColor("Brd") }}
        >
          <div className="flex flex-col h-fit">
            {NOTES.map((note) => {
              const isBlackKey = note.includes("#");
              const noteName = note.slice(0, -1); // Remove octave
              const octave = note.slice(-1);
              const isC = noteName === "C";

              return (
                <div
                  key={note}
                  className={cn(
                    "flex items-center justify-between px-2 select-none border-b flex-shrink-0",
                    isBlackKey
                      ? "bg-[#292929] text-white/70 h-6"
                      : "bg-white text-black/80 h-6",
                    hoverNote === note && "bg-[#7B6CBD]/10"
                  )}
                  style={{
                    borderColor: getColor("Brd"),
                    height: CELL_HEIGHT,
                  }}
                  onMouseEnter={() => setHoverNote(note)}
                  onMouseLeave={() => setHoverNote(null)}
                  onMouseDown={() => playNote(note)}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isBlackKey ? "text-white/70" : "text-black/80"
                    )}
                  >
                    {noteName}
                  </span>
                  {isC && (
                    <span
                      className={cn(
                        "text-xs opacity-80",
                        isBlackKey ? "text-white/50" : "text-black/50"
                      )}
                    >
                      {octave}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid and notes */}
        <div
          ref={rollContainerRef}
          className="flex-1 overflow-auto relative"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          {/* Fixed header with beat numbers */}
          <div
            className="sticky top-0 left-0 z-10 flex h-8 border-b"
            style={{
              borderColor: getColor("Brd"),
            }}
          >
            {Array.from({ length: stepCount }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-center text-xs border-r",
                  i % 4 === 0 ? "font-medium opacity-80" : "opacity-50"
                )}
                style={{
                  borderColor: getColor("Brd"),
                  width: CELL_WIDTH,
                  minWidth: CELL_WIDTH,
                }}
              >
                {Math.floor(i / 4) + 1}.{(i % 4) + 1}
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div
            className="grid h-fit"
            style={{
              gridTemplateRows: `repeat(${NOTES.length}, ${CELL_HEIGHT}px)`,
            }}
          >
            {/* Horizontal row separators */}
            <div className="absolute inset-0 pointer-events-none">
              {NOTES.map((note, i) => (
                <div
                  key={`sep-${i}`}
                  className={cn(
                    "absolute left-0 right-0 border-b",
                    note.includes("#")
                      ? "border-[#4C4F69]/10"
                      : "border-[#4C4F69]/20",
                    note.startsWith("C") && "border-[#4C4F69]/40"
                  )}
                  style={{
                    top: i * CELL_HEIGHT,
                    borderColor: getColor("Brd"),
                  }}
                />
              ))}
            </div>

            {/* Vertical beat separators */}
            <div className="absolute inset-0 pointer-events-none flex">
              {Array.from({ length: Math.ceil(stepCount / 4) }).map((_, i) => (
                <div
                  key={`vsep-${i}`}
                  className="border-r h-full"
                  style={{
                    left: i * 4 * CELL_WIDTH,
                    width: 4 * CELL_WIDTH,
                    borderColor: getColor("Brd"),
                    borderRightWidth: 2,
                  }}
                />
              ))}
            </div>

            {/* Note cells */}
            <div className="absolute inset-0">
              {NOTES.map((note, y) => (
                <div key={`row-${note}`} className="flex">
                  {Array.from({ length: stepCount }).map((_, x) => {
                    const hasNoteActive = hasNote(x, note);
                    const isBlackKey = note.includes("#");

                    return (
                      <div
                        key={`cell-${x}-${y}`}
                        className={cn(
                          "flex items-center justify-center cursor-pointer border-r",
                          hasNoteActive && "bg-[#4C4F69]/80 hover:bg-[#4C4F69]",
                          !hasNoteActive && "hover:bg-[#4C4F69]/20",
                          isBlackKey ? "bg-[#4C4F69]/5" : ""
                        )}
                        style={{
                          width: CELL_WIDTH,
                          height: CELL_HEIGHT,
                          borderColor: getColor("Brd"),
                        }}
                        onMouseDown={() => toggleNote(x, note)}
                        onMouseEnter={() => {
                          if (isDragging) {
                            toggleNote(x, note);
                          }
                        }}
                      >
                        {hasNoteActive && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PianoRoll;
