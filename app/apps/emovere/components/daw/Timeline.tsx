"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Play, SkipBack, SkipForward, Repeat, Shuffle } from "lucide-react";

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

export default function Timeline({
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
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState({ numerator: 4, denominator: 4 });
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

  // Animation for playhead
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setPlayheadPosition((prev) => (prev + 1) % 100);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const pixelsPerBeat = 40;
  const beatsPerBar = timeSignature.numerator;
  const totalBars = Math.ceil(size.width / (pixelsPerBeat * beatsPerBar));

  // Calculate time from position
  const positionToTime = (x: number) => {
    const beat = x / pixelsPerBeat;
    const bar = Math.floor(beat / beatsPerBar) + 1;
    const beatInBar = Math.floor(beat % beatsPerBar) + 1;
    const subdivision = Math.floor(((beat % 1) * 4)) + 1;
    return { bar, beat: beatInBar, subdivision };
  };

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
      <div className="h-8 bg-gradient-to-r from-[#262331] to-[#152020] px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#4C6957]" />
          <span className="text-xs font-medium text-[#CCCCCC]">Timeline</span>
        </div>
        <button className="p-1 hover:bg-[#694C4C]/20 rounded transition-colors">
          <X size={12} color="#CCCCCC" />
        </button>
      </div>

      {/* Time Info Bar */}
      <div className="h-6 bg-[#000000]/50 border-b border-[#29292981] px-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[10px] text-[#CCCCCC]/80">
          <div className="flex items-center gap-1">
            <span className="text-[#4C4F69]">BPM:</span>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
              className="bg-transparent w-10 text-center focus:outline-none focus:text-[#4C4F69]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#4C4F69]">TIME:</span>
            <span className="font-mono">{timeSignature.numerator}/{timeSignature.denominator}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#4C4F69]">POS:</span>
            <span className="font-mono">
              {Math.floor(playheadPosition / 10) + 1}.
              {Math.floor((playheadPosition % 10) / 2.5) + 1}.
              {Math.floor(playheadPosition % 2.5) + 1}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPlayheadPosition(0)}
            className="p-1 hover:bg-[#4C4F69]/20 rounded transition-colors"
          >
            <SkipBack size={10} color="#CCCCCC" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1 rounded transition-colors ${
              isPlaying ? 'bg-[#4C6957] hover:bg-[#4C6957]/80' : 'hover:bg-[#4C4F69]/20'
            }`}
          >
            <Play size={10} color="#CCCCCC" fill={isPlaying ? "#CCCCCC" : "none"} />
          </button>
          <button className="p-1 hover:bg-[#4C4F69]/20 rounded transition-colors">
            <SkipForward size={10} color="#CCCCCC" />
          </button>
        </div>
      </div>

      {/* Main Timeline */}
      <div className="relative h-[calc(100%-56px)] overflow-hidden">
        {/* Playhead */}
        <motion.div
          className="absolute top-0 bottom-0 w-[2px] bg-[#4C6957] shadow-lg z-20"
          style={{ left: `${playheadPosition}%` }}
          animate={{ left: `${playheadPosition}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#4C6957]" />
        </motion.div>

        {/* Bar Numbers */}
        <div className="h-6 bg-[#000000]/30 border-b border-[#29292981] flex">
          {[...Array(totalBars)].map((_, i) => (
            <div
              key={i}
              className="relative border-r border-[#29292981]"
              style={{ width: pixelsPerBeat * beatsPerBar }}
            >
              <span className="absolute left-1 top-1 text-[10px] text-[#4C4F69] font-medium">
                {i + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Beat Grid */}
        <div className="h-full relative">
          {/* Major beat lines */}
          {[...Array(totalBars * beatsPerBar)].map((_, i) => (
            <div
              key={i}
              className={`absolute top-0 bottom-0 border-r ${
                i % beatsPerBar === 0 
                  ? 'border-[#29292981]' 
                  : 'border-[#29292950]'
              }`}
              style={{ left: i * pixelsPerBeat }}
            />
          ))}
          
          {/* Sub-beat lines */}
          {[...Array(totalBars * beatsPerBar * 4)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-r border-[#29292920]"
              style={{ left: i * (pixelsPerBeat / 4) }}
            />
          ))}

          {/* Loop Region */}
          <div className="absolute top-0 h-4 bg-[#4C6957]/20 border-b border-[#4C6957]" 
            style={{ left: '20%', width: '30%' }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4C6957] cursor-ew-resize" />
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#4C6957] cursor-ew-resize" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Repeat size={10} color="#4C6957" />
            </div>
          </div>

          {/* Markers */}
          <div className="absolute top-6 left-0 right-0 h-4 flex items-center">
            {/* Intro Marker */}
            <div className="absolute flex items-center" style={{ left: '5%' }}>
              <div className="w-0 h-0 border-t-[6px] border-t-[#5E4C69] border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent" />
              <span className="ml-1 text-[8px] text-[#5E4C69] font-medium">INTRO</span>
            </div>
            
            {/* Verse Marker */}
            <div className="absolute flex items-center" style={{ left: '25%' }}>
              <div className="w-0 h-0 border-t-[6px] border-t-[#4C4F69] border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent" />
              <span className="ml-1 text-[8px] text-[#4C4F69] font-medium">VERSE</span>
            </div>
            
            {/* Chorus Marker */}
            <div className="absolute flex items-center" style={{ left: '45%' }}>
              <div className="w-0 h-0 border-t-[6px] border-t-[#694C4C] border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent" />
              <span className="ml-1 text-[8px] text-[#694C4C] font-medium">CHORUS</span>
            </div>
          </div>

          {/* Click track visualization */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#000000]/30 flex items-center">
            {[...Array(totalBars * beatsPerBar)].map((_, i) => (
              <div
                key={i}
                className={`h-1 mx-[1px] rounded-full transition-all ${
                  Math.floor(playheadPosition / (100 / (totalBars * beatsPerBar))) === i
                    ? 'bg-[#4C6957] w-3'
                    : 'bg-[#292929] w-1'
                }`}
                style={{ marginLeft: i === 0 ? 0 : pixelsPerBeat - 4 }}
              />
            ))}
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div 
          className="absolute top-0 left-0 right-0 h-full cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = (x / rect.width) * 100;
            setPlayheadPosition(percentage);
          }}
        />
      </div>
    </motion.div>
  );
}
