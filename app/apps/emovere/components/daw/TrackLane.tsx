"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, Headphones, Mic, Lock, Unlock, Layers, Music, Zap } from "lucide-react";

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

interface Clip {
  id: string;
  start: number;
  duration: number;
  color: string;
  name: string;
  type: 'audio' | 'midi';
  fadeIn: number;
  fadeOut: number;
}

export default function TrackLane({
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
  const [isArmed, setIsArmed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSolo, setIsSolo] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [volume, setVolume] = useState(75);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  // Demo clips
  const [clips] = useState<Clip[]>([
    {
      id: '1',
      start: 0,
      duration: 4,
      color: 'from-[#4C6957] to-[#4C4F69]',
      name: 'Intro Melody',
      type: 'midi',
      fadeIn: 0.2,
      fadeOut: 0.1
    },
    {
      id: '2',
      start: 4,
      duration: 8,
      color: 'from-[#5E4C69] to-[#694C4C]',
      name: 'Main Theme',
      type: 'audio',
      fadeIn: 0.1,
      fadeOut: 0.3
    },
    {
      id: '3',
      start: 14,
      duration: 6,
      color: 'from-[#4C4F69] to-[#375454]',
      name: 'Bridge Section',
      type: 'midi',
      fadeIn: 0.15,
      fadeOut: 0.15
    }
  ]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    
    if (e.button === 0 && !isLocked) {
      setIsDragging(true);
      onStartDrag();
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  }, [position, onSelect, onStartDrag, isLocked]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && !isLocked) {
      onUpdate({
        position: {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        },
      });
    }
  }, [isDragging, dragStart, onUpdate, isLocked]);

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

  const pixelsPerBeat = 40;

  // Generate waveform or MIDI pattern
  const generatePattern = (type: 'audio' | 'midi', width: number) => {
    if (type === 'audio') {
      // Generate waveform
      return Array.from({ length: Math.floor(width / 2) }, (_, i) => {
        const height = Math.sin(i * 0.1) * 20 + Math.random() * 10 + 25;
        return (
          <rect
            key={i}
            x={i * 2}
            y={60 - height}
            width={1}
            height={height * 2}
            fill="url(#waveGradient)"
            opacity={0.8}
          />
        );
      });
    } else {
      // Generate MIDI notes
      return Array.from({ length: Math.floor(width / 20) }, (_, i) => {
        const y = Math.floor(Math.random() * 8) * 10 + 10;
        const height = 8;
        const noteWidth = 15 + Math.random() * 20;
        return (
          <rect
            key={i}
            x={i * 20}
            y={y}
            width={noteWidth}
            height={height}
            rx={2}
            fill="url(#noteGradient)"
            opacity={0.9}
          />
        );
      });
    }
  };

  return (
    <motion.div
      ref={componentRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`absolute bg-gradient-to-r from-[#0A0A0A] to-[#000000] rounded-xl overflow-hidden shadow-2xl ${
        isSelected ? 'ring-2 ring-[#4C4F69]' : ''
      } ${isLocked ? 'opacity-75' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : isLocked ? 'not-allowed' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Track Header */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#1E202A] to-[#151515] border-r border-[#29292981] z-10">
        {/* Track Name */}
        <div className="p-2 border-b border-[#29292981]">
          <input
            type="text"
            defaultValue="Track 1"
            className="w-full bg-[#000000]/30 rounded px-2 py-1 text-xs text-[#CCCCCC] focus:outline-none focus:ring-1 focus:ring-[#4C4F69]"
            onClick={(e) => e.stopPropagation()}
            disabled={isLocked}
          />
        </div>

        {/* Track Controls */}
        <div className="p-2 space-y-2">
          {/* Track Type */}
          <div className="flex items-center justify-center gap-1 text-[10px] text-[#CCCCCC]/60">
            <Music size={10} />
            <span>MIDI</span>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-3 gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsArmed(!isArmed)}
              className={`p-1.5 rounded transition-all ${
                isArmed ? 'bg-[#694C4C] animate-pulse' : 'bg-[#292929] hover:bg-[#292929]/80'
              }`}
              title="Record Arm"
            >
              <Mic size={10} color="#CCCCCC" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMuted(!isMuted)}
              className={`p-1.5 rounded transition-all ${
                isMuted ? 'bg-[#694C4C]' : 'bg-[#292929] hover:bg-[#292929]/80'
              }`}
              title="Mute"
            >
              <Volume2 size={10} color="#CCCCCC" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSolo(!isSolo)}
              className={`p-1.5 rounded transition-all ${
                isSolo ? 'bg-[#4C4F69]' : 'bg-[#292929] hover:bg-[#292929]/80'
              }`}
              title="Solo"
            >
              <Headphones size={10} color="#CCCCCC" />
            </motion.button>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] text-[#CCCCCC]/40">
              <span>VOL</span>
              <span>{Math.round(volume)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full h-1 bg-[#292929] rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #4C6957 0%, #4C6957 ${volume}%, #292929 ${volume}%, #292929 100%)`
              }}
            />
          </div>

          {/* Lock Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsLocked(!isLocked)}
            className="w-full p-1.5 bg-[#292929] hover:bg-[#292929]/80 rounded flex items-center justify-center gap-1 transition-all"
          >
            {isLocked ? <Lock size={10} /> : <Unlock size={10} />}
            <span className="text-[8px] text-[#CCCCCC]/60">
              {isLocked ? 'LOCKED' : 'UNLOCKED'}
            </span>
          </motion.button>
        </div>

        {/* Level Meter */}
        <div className="absolute bottom-2 left-2 right-2 h-1 bg-[#000000] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#4C6957] to-[#4C4F69]"
            animate={{ width: isMuted ? '0%' : `${volume}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Track Lane */}
      <div className="absolute left-32 right-0 top-0 bottom-0 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0">
          {Array.from({ length: Math.ceil((size.width - 128) / pixelsPerBeat) }, (_, i) => (
            <div
              key={i}
              className={`absolute top-0 bottom-0 border-r ${
                i % 4 === 0 ? 'border-[#29292950]' : 'border-[#29292920]'
              }`}
              style={{ left: i * pixelsPerBeat }}
            />
          ))}
        </div>

        {/* Automation Lane Hint */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#4C4F69]/10 to-transparent" />

        {/* Clips */}
        {clips.map((clip) => (
          <motion.div
            key={clip.id}
            className={`absolute rounded-lg overflow-hidden cursor-pointer ${
              selectedClip === clip.id ? 'ring-2 ring-[#CCCCCC]' : ''
            }`}
            style={{
              left: clip.start * pixelsPerBeat,
              width: clip.duration * pixelsPerBeat,
              top: 4,
              bottom: 4,
            }}
            onClick={() => setSelectedClip(clip.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            layout
          >
            {/* Clip Background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${clip.color}`} />
            
            {/* Fade Handles */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#CCCCCC" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#CCCCCC" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#CCCCCC" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="noteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#CCCCCC" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#CCCCCC" stopOpacity="0.7" />
                </linearGradient>
              </defs>
              
              {/* Fade In */}
              <path
                d={`M 0 ${size.height - 8} Q ${clip.fadeIn * clip.duration * pixelsPerBeat} ${size.height - 8} ${clip.fadeIn * clip.duration * pixelsPerBeat} 0 L 0 0 Z`}
                fill="rgba(0,0,0,0.3)"
              />
              
              {/* Fade Out */}
              <path
                d={`M ${clip.duration * pixelsPerBeat} ${size.height - 8} Q ${(1 - clip.fadeOut) * clip.duration * pixelsPerBeat} ${size.height - 8} ${(1 - clip.fadeOut) * clip.duration * pixelsPerBeat} 0 L ${clip.duration * pixelsPerBeat} 0 Z`}
                fill="rgba(0,0,0,0.3)"
              />
              
              {/* Content Pattern */}
              <g opacity={isMuted ? 0.3 : 1}>
                {generatePattern(clip.type, clip.duration * pixelsPerBeat)}
              </g>
            </svg>
            
            {/* Clip Info */}
            <div className="absolute top-1 left-2 right-2 flex items-center justify-between">
              <span className="text-[10px] text-white/90 font-medium truncate">
                {clip.name}
              </span>
              <div className="flex items-center gap-1">
                {clip.type === 'midi' ? (
                  <Layers size={10} color="white" opacity={0.7} />
                ) : (
                  <Zap size={10} color="white" opacity={0.7} />
                )}
              </div>
            </div>
            
            {/* Loop Indicator */}
            <div className="absolute bottom-1 right-1">
              <div className="w-3 h-3 border border-white/30 rounded-sm" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Close Button */}
      <button 
        className="absolute top-2 right-2 p-1 hover:bg-[#694C4C]/20 rounded transition-colors z-20"
        onClick={(e) => {
          e.stopPropagation();
          // Handle close
        }}
      >
        <X size={12} color="#CCCCCC" />
      </button>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-20"
        onMouseDown={(e) => {
          e.stopPropagation();
          // Handle resize
        }}
      >
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#4C4F69]" />
      </div>
    </motion.div>
  );
}
