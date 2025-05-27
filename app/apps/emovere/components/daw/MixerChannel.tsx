"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, Headphones, Mic, Activity, Zap, Filter } from "lucide-react";

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

export default function MixerChannel({
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
  const [volume, setVolume] = useState(75);
  const [pan, setPan] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSolo, setIsSolo] = useState(false);
  const [isRecordEnabled, setIsRecordEnabled] = useState(false);
  const [peakLevel, setPeakLevel] = useState({ left: 0, right: 0 });
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

  // Simulate peak meter animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isMuted) {
        setPeakLevel({
          left: Math.random() * (volume / 100) * 0.8 + 0.1,
          right: Math.random() * (volume / 100) * 0.8 + 0.1,
        });
      } else {
        setPeakLevel({ left: 0, right: 0 });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [volume, isMuted]);

  const dbScale = [-60, -48, -36, -24, -18, -12, -6, -3, 0, 3, 6];

  return (
    <motion.div
      ref={componentRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`absolute bg-gradient-to-b from-[#1E202A] via-[#0A0A0A] to-[#000000] rounded-xl overflow-hidden shadow-2xl ${
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
      <div className="h-8 bg-gradient-to-r from-[#262331] to-[#281719] px-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#5E4C69]" />
          <span className="text-[10px] font-medium text-[#CCCCCC]">CH 1</span>
        </div>
        <button className="p-0.5 hover:bg-[#694C4C]/20 rounded transition-colors">
          <X size={10} color="#CCCCCC" />
        </button>
      </div>

      {/* Input Section */}
      <div className="p-2 border-b border-[#29292981]">
        <input
          type="text"
          defaultValue="Audio 1"
          className="w-full bg-[#000000]/50 rounded px-2 py-1 text-[10px] text-[#CCCCCC] text-center focus:outline-none focus:ring-1 focus:ring-[#4C4F69]"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* EQ Section */}
      <div className="p-2 border-b border-[#29292981]">
        <div className="bg-[#000000]/50 rounded-lg p-2">
          <div className="flex justify-between items-center mb-2">
            <Filter size={10} color="#4C4F69" />
            <span className="text-[8px] text-[#CCCCCC]/60">EQ</span>
          </div>
          <div className="space-y-1">
            {['HI', 'MID', 'LOW'].map((band) => (
              <div key={band} className="flex items-center gap-1">
                <span className="text-[8px] text-[#CCCCCC]/40 w-6">{band}</span>
                <div className="flex-1 h-1 bg-[#292929] rounded-full relative">
                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-[#4C4F69] rounded-full cursor-pointer"
                    drag="x"
                    dragMomentum={false}
                    dragConstraints={{ left: -20, right: 20 }}
                    whileHover={{ scale: 1.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Effects Sends */}
      <div className="p-2 border-b border-[#29292981]">
        <div className="grid grid-cols-2 gap-1">
          {['A', 'B'].map((send) => (
            <div key={send} className="bg-[#000000]/30 rounded p-1 text-center">
              <span className="text-[8px] text-[#4C4F69]">SEND {send}</span>
              <div className="mt-1 h-1 bg-[#292929] rounded-full relative">
                <motion.div
                  className="absolute left-0 h-full bg-gradient-to-r from-[#4C6957] to-[#4C4F69] rounded-full"
                  initial={{ width: '25%' }}
                  whileHover={{ width: '35%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pan Control */}
      <div className="p-2 border-b border-[#29292981]">
        <div className="bg-[#000000]/30 rounded p-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] text-[#CCCCCC]/40">L</span>
            <span className="text-[8px] text-[#4C4F69]">PAN</span>
            <span className="text-[8px] text-[#CCCCCC]/40">R</span>
          </div>
          <div className="relative h-4 bg-[#292929] rounded-full">
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#4C4F69]/30" />
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-br from-[#5E4C69] to-[#4C4F69] rounded-full cursor-pointer shadow-lg"
              drag="x"
              dragMomentum={false}
              dragConstraints={{ left: -25, right: 25 }}
              animate={{ x: pan }}
              whileHover={{ scale: 1.2 }}
              whileDrag={{ scale: 1.1 }}
              onDrag={(_, info) => setPan(info.offset.x)}
            />
          </div>
        </div>
      </div>

      {/* VU Meter */}
      <div className="flex-1 p-2 flex gap-1">
        <div className="flex-1 bg-gradient-to-t from-[#000000] to-[#0A0A0A] rounded-lg p-1 relative">
          {/* DB Scale */}
          <div className="absolute left-0 top-2 bottom-2 w-full">
            {dbScale.map((db, i) => (
              <div
                key={db}
                className="absolute left-0 right-0 flex items-center"
                style={{ top: `${(i / (dbScale.length - 1)) * 100}%` }}
              >
                <div className="w-full h-[1px] bg-[#29292940]" />
                <span className="absolute -left-6 text-[6px] text-[#CCCCCC]/40">
                  {db}
                </span>
              </div>
            ))}
          </div>
          
          {/* Meter Bars */}
          <div className="flex gap-0.5 h-full">
            {/* Left Channel */}
            <div className="flex-1 bg-[#000000] rounded relative overflow-hidden">
              <motion.div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: `${peakLevel.left * 100}%`,
                  background: `linear-gradient(to top, 
                    #4C6957 0%, 
                    #4C6957 60%, 
                    #4C4F69 80%, 
                    #694C4C 95%, 
                    #FF0000 100%
                  )`,
                }}
                animate={{ height: `${peakLevel.left * 100}%` }}
                transition={{ duration: 0.05 }}
              />
              {/* Peak Hold */}
              <motion.div
                className="absolute left-0 right-0 h-[2px] bg-[#CCCCCC]"
                animate={{ bottom: `${peakLevel.left * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            
            {/* Right Channel */}
            <div className="flex-1 bg-[#000000] rounded relative overflow-hidden">
              <motion.div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: `${peakLevel.right * 100}%`,
                  background: `linear-gradient(to top, 
                    #4C6957 0%, 
                    #4C6957 60%, 
                    #4C4F69 80%, 
                    #694C4C 95%, 
                    #FF0000 100%
                  )`,
                }}
                animate={{ height: `${peakLevel.right * 100}%` }}
                transition={{ duration: 0.05 }}
              />
              {/* Peak Hold */}
              <motion.div
                className="absolute left-0 right-0 h-[2px] bg-[#CCCCCC]"
                animate={{ bottom: `${peakLevel.right * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fader Section */}
      <div className="p-2 border-t border-[#29292981]">
        <div className="bg-gradient-to-b from-[#0A0A0A] to-[#000000] rounded-lg p-2">
          <div className="relative h-24 bg-[#000000] rounded mx-auto w-8">
            <div className="absolute inset-x-0 top-1 bottom-1 bg-gradient-to-b from-[#292929] to-[#1E202A] rounded" />
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-10 h-4 bg-gradient-to-b from-[#5E4C69] to-[#4C4F69] rounded cursor-ns-resize shadow-lg"
              drag="y"
              dragMomentum={false}
              dragConstraints={{ top: 0, bottom: 76 }}
              animate={{ y: 76 - (volume / 100) * 76 }}
              whileDrag={{ scale: 1.1 }}
              onDrag={(_, info) => {
                const newVolume = Math.max(0, Math.min(100, (1 - (info.point.y - position.y - 280) / 76) * 100));
                setVolume(newVolume);
              }}
            >
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#000000]/50" />
            </motion.div>
          </div>
          <div className="text-center mt-1">
            <span className="text-[10px] text-[#CCCCCC]/80 font-mono">
              {volume === 0 ? '-∞' : `${Math.round((volume / 100) * 12 - 12)}dB`}
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="p-2 flex justify-around border-t border-[#29292981]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMuted(!isMuted)}
          className={`p-1.5 rounded transition-all ${
            isMuted ? 'bg-[#694C4C]' : 'bg-[#292929] hover:bg-[#292929]/80'
          }`}
        >
          <Volume2 size={12} color="#CCCCCC" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSolo(!isSolo)}
          className={`p-1.5 rounded transition-all ${
            isSolo ? 'bg-[#4C4F69]' : 'bg-[#292929] hover:bg-[#292929]/80'
          }`}
        >
          <Headphones size={12} color="#CCCCCC" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsRecordEnabled(!isRecordEnabled)}
          className={`p-1.5 rounded transition-all ${
            isRecordEnabled ? 'bg-[#694C4C] animate-pulse' : 'bg-[#292929] hover:bg-[#292929]/80'
          }`}
        >
          <Mic size={12} color="#CCCCCC" />
        </motion.button>
      </div>
    </motion.div>
  );
}
