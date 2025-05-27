"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Play, Pause, Square, Circle, SkipBack, SkipForward, 
  Repeat, Shuffle, Volume2, Metronome, Gauge 
} from "lucide-react";

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

export default function Transport({
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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [currentTime, setCurrentTime] = useState({ bar: 1, beat: 1, sub: 1 });
  const componentRef = useRef<HTMLDivElement>(null);

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
    onEndDrag();
  }, [onEndDrag]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Time counter animation
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          let { bar, beat, sub } = prev;
          sub++;
          if (sub > 4) {
            sub = 1;
            beat++;
            if (beat > 4) {
              beat = 1;
              bar++;
            }
          }
          return { bar, beat, sub };
        });
      }, 125); // 120 BPM = 2 beats per second = 8 subdivisions per second
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <motion.div
      ref={componentRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`absolute bg-gradient-to-b from-[#1E202A] to-[#000000] rounded-xl overflow-hidden shadow-2xl ${
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
      <div className="h-8 bg-gradient-to-r from-[#262331] to-[#281719] px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#694C4C]" />
          <span className="text-xs font-medium text-[#CCCCCC]">Transport</span>
        </div>
        <button className="p-1 hover:bg-[#694C4C]/20 rounded transition-colors">
          <X size={12} color="#CCCCCC" />
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4 flex items-center justify-between gap-4">
        {/* Main Controls */}
        <div className="flex items-center gap-2">
          {/* Return to Start */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentTime({ bar: 1, beat: 1, sub: 1 })}
            className="p-2 bg-[#292929] hover:bg-[#292929]/80 rounded-lg transition-colors"
          >
            <SkipBack size={16} color="#CCCCCC" />
          </motion.button>

          {/* Record */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRecording(!isRecording)}
            className={`p-3 rounded-lg transition-all ${
              isRecording 
                ? 'bg-[#694C4C] shadow-lg animate-pulse' 
                : 'bg-[#292929] hover:bg-[#292929]/80'
            }`}
          >
            <Circle size={20} color="#CCCCCC" fill={isRecording ? "#CCCCCC" : "none"} />
          </motion.button>

          {/* Play/Pause */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-3 rounded-lg transition-all ${
              isPlaying 
                ? 'bg-[#4C6957] shadow-lg' 
                : 'bg-[#292929] hover:bg-[#292929]/80'
            }`}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Pause size={20} color="#CCCCCC" fill="#CCCCCC" />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Play size={20} color="#CCCCCC" fill="#CCCCCC" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Stop */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsPlaying(false);
              setIsRecording(false);
              setCurrentTime({ bar: 1, beat: 1, sub: 1 });
            }}
            className="p-2 bg-[#292929] hover:bg-[#292929]/80 rounded-lg transition-colors"
          >
            <Square size={16} color="#CCCCCC" fill="#CCCCCC" />
          </motion.button>

          {/* Fast Forward */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-[#292929] hover:bg-[#292929]/80 rounded-lg transition-colors"
          >
            <SkipForward size={16} color="#CCCCCC" />
          </motion.button>
        </div>

        {/* Time Display */}
        <div className="flex-1 flex justify-center">
          <div className="bg-[#000000] rounded-lg px-4 py-2 border border-[#29292981]">
            <div className="font-mono text-2xl text-[#4C6957] tabular-nums">
              {String(currentTime.bar).padStart(3, '0')}.
              {String(currentTime.beat).padStart(2, '0')}.
              {String(currentTime.sub).padStart(2, '0')}
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-[8px] text-[#CCCCCC]/40">BAR</span>
              <span className="text-[8px] text-[#CCCCCC]/40">BEAT</span>
              <span className="text-[8px] text-[#CCCCCC]/40">SUB</span>
            </div>
          </div>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center gap-2">
          {/* Loop */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-lg transition-all ${
              isLooping 
                ? 'bg-[#4C4F69]' 
                : 'bg-[#292929] hover:bg-[#292929]/80'
            }`}
          >
            <Repeat size={16} color="#CCCCCC" />
          </motion.button>

          {/* Metronome */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMetronomeOn(!isMetronomeOn)}
            className={`p-2 rounded-lg transition-all ${
              isMetronomeOn 
                ? 'bg-[#5E4C69]' 
                : 'bg-[#292929] hover:bg-[#292929]/80'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="2">
              <path d="M12 2L6 22h12L12 2z" />
              <path d="M12 8v8" />
              {isMetronomeOn && (
                <motion.path
                  d="M12 16l4-8"
                  animate={{ rotate: [0, -30, 30, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{ transformOrigin: '12px 16px' }}
                />
              )}
            </svg>
          </motion.button>

          {/* Tempo */}
          <div className="bg-[#292929] rounded-lg px-3 py-1 flex items-center gap-2">
            <Gauge size={12} color="#4C4F69" />
            <input
              type="number"
              value={tempo}
              onChange={(e) => setTempo(parseInt(e.target.value) || 120)}
              className="bg-transparent w-12 text-center text-sm text-[#CCCCCC] focus:outline-none focus:text-[#4C4F69]"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-[10px] text-[#CCCCCC]/60">BPM</span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#000000]/50 border-t border-[#29292981] px-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] text-[#CCCCCC]/60">
          <span>CPU: <span className="text-[#4C6957]">12%</span></span>
          <span>RAM: <span className="text-[#4C6957]">2.1GB</span></span>
          <span>DISK: <span className="text-[#4C6957]">45MB/s</span></span>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#694C4C] rounded-full animate-pulse" />
              <span className="text-[10px] text-[#694C4C]">REC</span>
            </div>
          )}
          {isPlaying && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#4C6957] rounded-full" />
              <span className="text-[10px] text-[#4C6957]">PLAY</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
