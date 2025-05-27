"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, ZoomIn, ZoomOut, Scissors, Copy, Trash2, Volume2 } from "lucide-react";

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

export default function Waveform({
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
  const [zoom, setZoom] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState<{ start: number; end: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);
  const componentRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

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

  // Generate waveform data
  const generateWaveformData = () => {
    const samples = 200;
    const data = [];
    for (let i = 0; i < samples; i++) {
      const t = i / samples;
      const envelope = Math.sin(t * Math.PI) * 0.8;
      const wave = Math.sin(t * 50) * Math.cos(t * 30) * Math.sin(t * 100);
      const noise = (Math.random() - 0.5) * 0.1;
      data.push((wave + noise) * envelope);
    }
    return data;
  };

  const [waveformData] = useState(generateWaveformData());

  // Handle selection
  const handleWaveformMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = waveformRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    setIsSelecting(true);
    setSelectionStart(x);
    setSelectedRegion(null);
  };

  const handleWaveformMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting) return;
    
    const rect = waveformRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const start = Math.min(selectionStart, x);
    const end = Math.max(selectionStart, x);
    
    if (end - start > 5) {
      setSelectedRegion({ start, end });
    }
  };

  const handleWaveformMouseUp = () => {
    setIsSelecting(false);
  };

  const barWidth = 2;
  const barGap = 1;
  const totalWidth = waveformData.length * (barWidth + barGap) * zoom;

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
      <div className="h-10 bg-gradient-to-r from-[#1E202A] to-[#152020] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4C6957]" />
          <span className="text-sm font-medium text-[#CCCCCC]">Waveform</span>
          <span className="text-xs text-[#CCCCCC]/60">Audio_Sample_01.wav</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-[#694C4C]/20 rounded transition-colors">
            <X size={16} color="#CCCCCC" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-8 bg-[#000000]/50 border-b border-[#29292981] px-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Zoom Controls */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setZoom(Math.min(4, zoom * 1.2))}
            className="p-1 hover:bg-[#4C4F69]/20 rounded transition-colors"
          >
            <ZoomIn size={12} color="#CCCCCC" />
          </motion.button>
          <span className="text-[10px] text-[#CCCCCC]/60 px-1">{Math.round(zoom * 100)}%</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setZoom(Math.max(0.5, zoom / 1.2))}
            className="p-1 hover:bg-[#4C4F69]/20 rounded transition-colors"
          >
            <ZoomOut size={12} color="#CCCCCC" />
          </motion.button>
          
          <div className="w-[1px] h-4 bg-[#29292981] mx-1" />
          
          {/* Edit Tools */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 hover:bg-[#4C4F69]/20 rounded transition-colors"
            disabled={!selectedRegion}
          >
            <Scissors size={12} color={selectedRegion ? "#CCCCCC" : "#CCCCCC40"} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 hover:bg-[#4C4F69]/20 rounded transition-colors"
            disabled={!selectedRegion}
          >
            <Copy size={12} color={selectedRegion ? "#CCCCCC" : "#CCCCCC40"} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 hover:bg-[#4C4F69]/20 rounded transition-colors"
            disabled={!selectedRegion}
          >
            <Trash2 size={12} color={selectedRegion ? "#CCCCCC" : "#CCCCCC40"} />
          </motion.button>
        </div>
        
        {/* Info */}
        <div className="flex items-center gap-3 text-[10px] text-[#CCCCCC]/60">
          <span>44.1 kHz</span>
          <span>16 bit</span>
          <span>Stereo</span>
          <span>2:34</span>
        </div>
      </div>

      {/* Waveform Display */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#0A0A0A] to-[#000000]">
        <div 
          ref={waveformRef}
          className="absolute inset-0 overflow-x-auto overflow-y-hidden"
          onMouseDown={handleWaveformMouseDown}
          onMouseMove={handleWaveformMouseMove}
          onMouseUp={handleWaveformMouseUp}
          onMouseLeave={handleWaveformMouseUp}
          style={{ cursor: 'text' }}
        >
          {/* Timeline */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-[#000000]/50 border-b border-[#29292981] flex items-end">
            {Array.from({ length: Math.ceil(totalWidth / 100) }, (_, i) => (
              <div key={i} className="relative" style={{ width: 100 }}>
                <span className="absolute left-1 top-1 text-[8px] text-[#4C4F69]">
                  {(i * 1000 / 44.1).toFixed(1)}s
                </span>
                <div className="absolute bottom-0 left-0 w-[1px] h-2 bg-[#29292981]" />
              </div>
            ))}
          </div>

          {/* Center Line */}
          <div className="absolute top-6 bottom-6 left-0 right-0">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#29292950]" />
            
            {/* Selection Overlay */}
            {selectedRegion && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-0 bottom-0 bg-[#4C4F69]/20 border-x border-[#4C4F69]"
                style={{
                  left: selectedRegion.start,
                  width: selectedRegion.end - selectedRegion.start,
                }}
              />
            )}
            
            {/* Waveform Bars */}
            <svg
              width={totalWidth}
              height="100%"
              className="absolute top-0 left-0"
              style={{ height: 'calc(100% - 48px)', top: 24 }}
            >
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4C6957" stopOpacity="0.8" />
                  <stop offset="45%" stopColor="#4C6957" stopOpacity="1" />
                  <stop offset="50%" stopColor="#4C4F69" stopOpacity="1" />
                  <stop offset="55%" stopColor="#4C4F69" stopOpacity="1" />
                  <stop offset="100%" stopColor="#4C4F69" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              {waveformData.map((value, i) => {
                const height = Math.abs(value) * (size.height - 80);
                const y = (size.height - 80) / 2 - height / 2;
                return (
                  <rect
                    key={i}
                    x={i * (barWidth + barGap) * zoom}
                    y={y}
                    width={barWidth * zoom}
                    height={height}
                    fill="url(#waveGradient)"
                    opacity={0.9}
                  />
                );
              })}
            </svg>
          </div>

          {/* Playhead */}
          <motion.div
            className="absolute top-6 bottom-6 w-[1px] bg-[#CCCCCC] pointer-events-none"
            initial={{ left: 0 }}
            animate={{ left: '25%' }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Scrollbar */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#000000]/50">
          <motion.div
            className="h-full bg-[#292929] rounded cursor-ew-resize"
            style={{ width: `${(size.width / totalWidth) * 100}%` }}
            drag="x"
            dragMomentum={false}
            dragConstraints={{ left: 0, right: size.width - 100 }}
          />
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="h-6 bg-[#000000]/50 border-t border-[#29292981] px-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-[#CCCCCC]/60">
          <Volume2 size={10} />
          <span>-12.3 dB</span>
          <span>|</span>
          <span>Peak: -6.1 dB</span>
        </div>
        {selectedRegion && (
          <span className="text-[10px] text-[#4C4F69]">
            Selection: {((selectedRegion.end - selectedRegion.start) / 100).toFixed(2)}s
          </span>
        )}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
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
