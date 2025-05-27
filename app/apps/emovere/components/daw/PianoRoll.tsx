"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Maximize2, Minimize2, X, MoreVertical, Grid } from "lucide-react";

interface Props {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  onStartDrag: () => void;
  onEndDrag: () => void;
}

interface Note {
  id: string;
  pitch: number;
  start: number;
  duration: number;
  velocity: number;
}

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const octaves = [8, 7, 6, 5, 4, 3, 2, 1, 0];

export default function PianoRoll({
  id,
  position,
  size,
  isSelected,
  onSelect,
  onUpdate,
  onStartDrag,
  onEndDrag,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [gridSize, setGridSize] = useState(32); // 1/16 notes
  const componentRef = useRef<HTMLDivElement>(null);

  // Piano keys colors
  const isBlackKey = (noteName: string) => noteName.includes('#');
  
  // Generate initial demo notes
  useEffect(() => {
    const demoNotes: Note[] = [
      { id: '1', pitch: 60, start: 0, duration: 2, velocity: 100 },
      { id: '2', pitch: 64, start: 2, duration: 2, velocity: 80 },
      { id: '3', pitch: 67, start: 4, duration: 2, velocity: 90 },
      { id: '4', pitch: 60, start: 6, duration: 2, velocity: 70 },
    ];
    setNotes(demoNotes);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    
    if (e.button === 0) {
      setIsDragging(true);
      onStartDrag();
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  }, [position, onSelect, onStartDrag]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      onUpdate({
        position: {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        },
      });
    }
  }, [isDragging, dragStart, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    onEndDrag();
  }, [onEndDrag]);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const pianoKeyWidth = 60;
  const rowHeight = 20;
  const timelineHeight = 40;
  const velocityHeight = 100;

  return (
    <motion.div
      ref={componentRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`absolute bg-[#000000] rounded-xl overflow-hidden shadow-2xl ${
        isSelected ? 'ring-2 ring-[#4C4F69]' : ''
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="h-10 bg-gradient-to-r from-[#1E202A] to-[#281719] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#5E4C69]" />
          <span className="text-sm font-medium text-[#CCCCCC]">Piano Roll</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-[#4C4F69]/20 rounded transition-colors">
            <Grid size={16} color="#CCCCCC" />
          </button>
          <button className="p-1 hover:bg-[#4C4F69]/20 rounded transition-colors">
            <Minimize2 size={16} color="#CCCCCC" />
          </button>
          <button className="p-1 hover:bg-[#4C4F69]/20 rounded transition-colors">
            <MoreVertical size={16} color="#CCCCCC" />
          </button>
          <button className="p-1 hover:bg-[#694C4C]/20 rounded transition-colors">
            <X size={16} color="#CCCCCC" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100%-40px)]">
        {/* Piano Keys */}
        <div className="w-[60px] bg-[#0A0A0A] border-r border-[#29292981] overflow-y-auto">
          <div className="h-[40px] bg-[#1E202A] border-b border-[#29292981]" />
          {octaves.map(octave => 
            noteNames.map(note => {
              const isBlack = isBlackKey(note);
              return (
                <div
                  key={`${note}${octave}`}
                  className={`relative h-[20px] border-b border-[#29292981] ${
                    isBlack 
                      ? 'bg-[#1E202A] hover:bg-[#262331]' 
                      : 'bg-[#292929] hover:bg-[#375454]'
                  } transition-colors cursor-pointer`}
                >
                  <span className="absolute inset-0 flex items-center px-1 text-[10px] text-[#CCCCCC]/60">
                    {note}{octave}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Grid Area */}
        <div className="flex-1 relative overflow-auto bg-[#0A0A0A]">
          {/* Timeline */}
          <div className="sticky top-0 h-[40px] bg-[#1E202A] border-b border-[#29292981] z-10">
            <div className="h-full flex items-end">
              {Array.from({ length: 32 }, (_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[32px] h-full border-r border-[#29292981] relative"
                >
                  {i % 4 === 0 && (
                    <span className="absolute top-2 left-1 text-[10px] text-[#4C4F69]">
                      {i / 4 + 1}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Note Grid */}
          <div className="relative" style={{ height: octaves.length * noteNames.length * rowHeight }}>
            {/* Grid Lines */}
            {octaves.map((octave, octaveIndex) => 
              noteNames.map((note, noteIndex) => {
                const isBlack = isBlackKey(note);
                const pitchIndex = octaveIndex * 12 + noteIndex;
                return (
                  <div
                    key={`grid-${note}${octave}`}
                    className={`absolute w-full h-[20px] border-b border-[#29292981] ${
                      isBlack ? 'bg-[#0A0A0A]' : 'bg-[#151515]'
                    }`}
                    style={{ top: pitchIndex * rowHeight }}
                  >
                    {/* Vertical grid lines */}
                    {Array.from({ length: 32 }, (_, i) => (
                      <div
                        key={i}
                        className={`absolute top-0 h-full border-r ${
                          i % 4 === 0 ? 'border-[#29292981]' : 'border-[#29292950]'
                        }`}
                        style={{ left: i * gridSize }}
                      />
                    ))}
                  </div>
                );
              })
            )}

            {/* Notes */}
            {notes.map(note => {
              const pitchIndex = (8 - Math.floor(note.pitch / 12)) * 12 + (note.pitch % 12);
              const isSelectedNote = selectedNotes.includes(note.id);
              return (
                <motion.div
                  key={note.id}
                  className={`absolute h-[18px] rounded cursor-pointer ${
                    isSelectedNote 
                      ? 'bg-gradient-to-r from-[#5E4C69] to-[#694C4C] shadow-lg' 
                      : 'bg-gradient-to-r from-[#4C4F69] to-[#4C6957]'
                  } hover:brightness-110 transition-all`}
                  style={{
                    left: note.start * gridSize,
                    top: pitchIndex * rowHeight + 1,
                    width: note.duration * gridSize - 2,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNotes(prev => 
                      prev.includes(note.id) 
                        ? prev.filter(id => id !== note.id)
                        : [...prev, note.id]
                    );
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Note velocity indicator */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-white/20 rounded-b"
                    style={{ height: `${(note.velocity / 127) * 100}%` }}
                  />
                  {/* Note name */}
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-white/80">
                    {noteNames[note.pitch % 12]}{Math.floor(note.pitch / 12)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Velocity Lane */}
      <div className="absolute bottom-0 left-[60px] right-0 h-[100px] bg-[#1E202A] border-t border-[#29292981]">
        <div className="h-full relative">
          {notes.map(note => {
            const isSelectedNote = selectedNotes.includes(note.id);
            return (
              <div
                key={`vel-${note.id}`}
                className={`absolute bottom-0 ${
                  isSelectedNote ? 'bg-[#5E4C69]' : 'bg-[#4C4F69]'
                } hover:brightness-110 transition-all`}
                style={{
                  left: note.start * gridSize,
                  width: note.duration * gridSize - 2,
                  height: `${(note.velocity / 127) * 90}%`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsResizing(true);
          onStartDrag();
        }}
      >
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#4C4F69]" />
      </div>
    </motion.div>
  );
}
