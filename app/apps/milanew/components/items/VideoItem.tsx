"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import { Position, LessonItem, VideoContent } from "../../types";
import { Play, Pause, Maximize, Volume2, VolumeX, Settings, Lock, Unlock, Trash, Copy, Edit2 } from "lucide-react";

interface VideoItemProps {
  item: LessonItem;
  isSelected: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: (e: React.MouseEvent) => void;
  onPositionChange: (position: Position) => void;
}

const VideoItem: React.FC<VideoItemProps> = ({
  item,
  isSelected,
  onDragStart,
  onDragEnd,
  onClick,
  onPositionChange,
}) => {
  const { getColor } = useStyles();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(item.locked || false);
  const [videoUrl, setVideoUrl] = useState((item.content as VideoContent).url || "");
  const [videoTitle, setVideoTitle] = useState((item.content as VideoContent).title || "");
  const [startTime, setStartTime] = useState((item.content as VideoContent).startTime || 0);

  const content = item.content as VideoContent;

  // Check if it's a YouTube video
  const isYouTubeVideo = content.url.includes("youtube.com") || content.url.includes("youtu.be");
  
  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const youtubeId = isYouTubeVideo ? getYouTubeId(content.url) : null;
  
  // Build YouTube embed URL with parameters
  const getYouTubeEmbedUrl = () => {
    if (!youtubeId) return "";
    let embedUrl = `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&origin=${window.location.origin}`;
    
    // Add start time if specified
    if (content.startTime) {
      embedUrl += `&start=${content.startTime}`;
    }
    
    // Add autoplay if needed
    if (content.autoplay) {
      embedUrl += "&autoplay=1";
    }
    
    // Additional parameters
    embedUrl += "&modestbranding=1&rel=0";
    
    return embedUrl;
  };

  // Toggle video play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  // Toggle mute/unmute
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  // Handle drag
  const handleDrag = (e: any, info: any) => {
    if (isLocked) return;
    
    onPositionChange({
      x: item.position.x + info.delta.x,
      y: item.position.y + info.delta.y,
    });
  };

  // Calculate dimensions based on item size or use default
  const dimensions = item.size || { width: 320, height: 180 };

  return (
    <motion.div
      className="absolute cursor-move"
      style={{
        top: item.position.y,
        left: item.position.x,
        width: dimensions.width,
        height: dimensions.height,
        zIndex: item.zIndex,
      }}
      drag={!isLocked}
      dragMomentum={false}
      dragElastic={0}
      onClick={onClick}
      onDragStart={onDragStart}
      onDrag={handleDrag}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Selection border */}
      {isSelected && (
        <div
          className="absolute -inset-1 border-2 rounded-md pointer-events-none"
          style={{ borderColor: getColor("latte") }}
        />
      )}
      
      {/* Video title (if available and editing) */}
      {isEditing && videoTitle && (
        <div 
          className="absolute -top-8 left-0 bg-black-thick px-2 py-1 rounded-md text-sm"
          style={{ color: getColor("latte") }}
        >
          {videoTitle}
        </div>
      )}
      
      {/* Video element or YouTube embed */}
      <div className="relative w-full h-full overflow-hidden rounded-md">
        {isYouTubeVideo ? (
          <iframe
            width="100%"
            height="100%"
            src={getYouTubeEmbedUrl()}
            title={content.title || "YouTube Video"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ 
              backgroundColor: getColor("black-thick"),
            }}
          />
        ) : (
          <video
            ref={videoRef}
            src={content.url}
            className="w-full h-full object-cover rounded-md"
            autoPlay={content.autoplay || false}
            muted={isMuted}
            loop
            playsInline
            style={{ 
              backgroundColor: getColor("black-thick"),
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}
        
        {/* Video overlay with controls - only show on hover */}
        {showControls && !isYouTubeVideo && (
          <div className="absolute inset-0 bg-black-thin bg-opacity-50 flex items-center justify-center">
            <div className="flex gap-2">
              <button
                className="p-2 rounded-full bg-black-med hover:bg-black-thick"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause size={20} color={getColor("latte")} />
                ) : (
                  <Play size={20} color={getColor("latte")} />
                )}
              </button>
              <button
                className="p-2 rounded-full bg-black-med hover:bg-black-thick"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX size={20} color={getColor("latte")} />
                ) : (
                  <Volume2 size={20} color={getColor("latte")} />
                )}
              </button>
              <button
                className="p-2 rounded-full bg-black-med hover:bg-black-thick"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                title="Fullscreen"
              >
                <Maximize size={20} color={getColor("latte")} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Action toolbar - only visible when selected */}
      {isSelected && (
        <div
          className="absolute -top-10 left-0 flex bg-black-med rounded-md p-1"
          style={{ boxShadow: `0 2px 8px ${getColor("black-thin")}` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={`p-1 rounded-md mr-1 ${isEditing ? "bg-latte-thin" : "hover:bg-black-med"}`}
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "Done Editing" : "Edit Video Settings"}
          >
            <Edit2 size={16} color={getColor("latte-med")} />
          </button>
          <button
            className="p-1 rounded-md mr-1 hover:bg-black-med"
            onClick={() => setIsLocked(!isLocked)}
            title={isLocked ? "Unlock" : "Lock"}
          >
            {isLocked ? (
              <Lock size={16} color={getColor("latte-med")} />
            ) : (
              <Unlock size={16} color={getColor("latte-med")} />
            )}
          </button>
          <button
            className="p-1 rounded-md mr-1 hover:bg-black-med"
            onClick={() => {/* Copy action */}}
            title="Duplicate"
          >
            <Copy size={16} color={getColor("latte-med")} />
          </button>
          <button
            className="p-1 rounded-md hover:bg-black-med"
            onClick={() => {/* Delete action */}}
            title="Delete"
          >
            <Trash size={16} color={getColor("latte-med")} />
          </button>
        </div>
      )}
      
      {/* Video settings panel - visible when editing */}
      {isSelected && isEditing && (
        <div
          className="absolute -bottom-[180px] left-0 w-[320px] bg-black-med rounded-md p-3"
          style={{ boxShadow: `0 2px 8px ${getColor("black-thin")}` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3">
            <label className="block text-sm mb-1" style={{ color: getColor("latte") }}>
              Video URL
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full p-2 rounded-md text-sm"
              style={{ 
                backgroundColor: getColor("black-thick"),
                color: getColor("latte"),
                border: `1px solid ${getColor("black-thin")}`,
              }}
              placeholder="Enter video URL (YouTube or direct link)"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm mb-1" style={{ color: getColor("latte") }}>
              Title
            </label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="w-full p-2 rounded-md text-sm"
              style={{ 
                backgroundColor: getColor("black-thick"),
                color: getColor("latte"),
                border: `1px solid ${getColor("black-thin")}`,
              }}
              placeholder="Video title (optional)"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm mb-1" style={{ color: getColor("latte") }}>
              Start Time (seconds)
            </label>
            <input
              type="number"
              value={startTime}
              onChange={(e) => setStartTime(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full p-2 rounded-md text-sm"
              style={{ 
                backgroundColor: getColor("black-thick"),
                color: getColor("latte"),
                border: `1px solid ${getColor("black-thin")}`,
              }}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              className="px-3 py-1 rounded-md bg-latte text-black-thick"
              onClick={() => {
                // Update video content
                // Would call store update function here
                setIsEditing(false);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VideoItem;
