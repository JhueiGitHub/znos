// app/apps/studio/components/AudioEffectsRack.tsx
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Settings,
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { TrackEffect } from "../types/track";

interface AudioEffectsRackProps {
  effects: TrackEffect[];
  onEffectChange: (
    id: string,
    type: string,
    settings?: Record<string, any>
  ) => void;
  onEffectRemove: (id: string) => void;
}

export const AudioEffectsRack: React.FC<AudioEffectsRackProps> = ({
  effects,
  onEffectChange,
  onEffectRemove,
}) => {
  const [expandedEffects, setExpandedEffects] = useState<
    Record<string, boolean>
  >({});

  const toggleEffectExpanded = (effectId: string) => {
    setExpandedEffects((prev) => ({
      ...prev,
      [effectId]: !prev[effectId],
    }));
  };

  const renderEffectControls = (effect: TrackEffect) => {
    switch (effect.type) {
      case "freeverb":
        return (
          <div className="grid grid-cols-2 gap-3 p-3">
            <div className="space-y-1">
              <label className="text-[10px] text-[#CCCCCC]/50 uppercase">
                Room Size
              </label>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effect.settings?.roomSize ?? 0.7}
                  onChange={(e) =>
                    onEffectChange(effect.id, effect.type, {
                      ...effect.settings,
                      roomSize: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 appearance-none bg-[#4C4F69]/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7B6CBD]"
                />
                <span className="text-[10px] text-[#CCCCCC]/70 ml-2 w-8">
                  {(effect.settings?.roomSize ?? 0.7).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#CCCCCC]/50 uppercase">
                Dampening
              </label>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effect.settings?.dampening ?? 0.5}
                  onChange={(e) =>
                    onEffectChange(effect.id, effect.type, {
                      ...effect.settings,
                      dampening: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 appearance-none bg-[#4C4F69]/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7B6CBD]"
                />
                <span className="text-[10px] text-[#CCCCCC]/70 ml-2 w-8">
                  {(effect.settings?.dampening ?? 0.5).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#CCCCCC]/50 uppercase">
                Wet
              </label>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effect.settings?.wet ?? 0.3}
                  onChange={(e) =>
                    onEffectChange(effect.id, effect.type, {
                      ...effect.settings,
                      wet: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 appearance-none bg-[#4C4F69]/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7B6CBD]"
                />
                <span className="text-[10px] text-[#CCCCCC]/70 ml-2 w-8">
                  {(effect.settings?.wet ?? 0.3).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#CCCCCC]/50 uppercase">
                Dry
              </label>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effect.settings?.dry ?? 0.5}
                  onChange={(e) =>
                    onEffectChange(effect.id, effect.type, {
                      ...effect.settings,
                      dry: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 appearance-none bg-[#4C4F69]/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7B6CBD]"
                />
                <span className="text-[10px] text-[#CCCCCC]/70 ml-2 w-8">
                  {(effect.settings?.dry ?? 0.5).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        );

      case "feedbackDelay":
        return (
          <div className="grid grid-cols-2 gap-3 p-3">
            <div className="space-y-1">
              <label className="text-[10px] text-[#CCCCCC]/50 uppercase">
                Delay Time
              </label>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effect.settings?.delayTime ?? 0.25}
                  onChange={(e) =>
                    onEffectChange(effect.id, effect.type, {
                      ...effect.settings,
                      delayTime: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 appearance-none bg-[#4C4F69]/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7B6CBD]"
                />
                <span className="text-[10px] text-[#CCCCCC]/70 ml-2 w-8">
                  {((effect.settings?.delayTime ?? 0.25) * 1000).toFixed(0)}ms
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#CCCCCC]/50 uppercase">
                Feedback
              </label>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effect.settings?.feedback ?? 0.5}
                  onChange={(e) =>
                    onEffectChange(effect.id, effect.type, {
                      ...effect.settings,
                      feedback: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 appearance-none bg-[#4C4F69]/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7B6CBD]"
                />
                <span className="text-[10px] text-[#CCCCCC]/70 ml-2 w-8">
                  {(effect.settings?.feedback ?? 0.5).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#CCCCCC]/50 uppercase">
                Wet
              </label>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effect.settings?.wet ?? 0.3}
                  onChange={(e) =>
                    onEffectChange(effect.id, effect.type, {
                      ...effect.settings,
                      wet: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 appearance-none bg-[#4C4F69]/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7B6CBD]"
                />
                <span className="text-[10px] text-[#CCCCCC]/70 ml-2 w-8">
                  {(effect.settings?.wet ?? 0.3).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        );

      case "chorus":
        return (
          <div className="grid grid-cols-2 gap-3 p-3">
            <div className="space-y-1">
              <label className="text-[10px] text-[#CCCCCC]/50 uppercase">
                Frequency
              </label>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={effect.settings?.frequency ?? 1.5}
                  onChange={(e) =>
                    onEffectChange(effect.id, effect.type, {
                      ...effect.settings,
                      frequency: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 appearance-none bg-[#4C4F69]/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7B6CBD]"
                />
                <span className="text-[10px] text-[#CCCCCC]/70 ml-2 w-8">
                  {(effect.settings?.frequency ?? 1.5).toFixed(1)}Hz
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#CCCCCC]/50 uppercase">
                Depth
              </label>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effect.settings?.depth ?? 0.5}
                  onChange={(e) =>
                    onEffectChange(effect.id, effect.type, {
                      ...effect.settings,
                      depth: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 appearance-none bg-[#4C4F69]/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7B6CBD]"
                />
                <span className="text-[10px] text-[#CCCCCC]/70 ml-2 w-8">
                  {(effect.settings?.depth ?? 0.5).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#CCCCCC]/50 uppercase">
                Wet
              </label>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effect.settings?.wet ?? 0.5}
                  onChange={(e) =>
                    onEffectChange(effect.id, effect.type, {
                      ...effect.settings,
                      wet: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 appearance-none bg-[#4C4F69]/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7B6CBD]"
                />
                <span className="text-[10px] text-[#CCCCCC]/70 ml-2 w-8">
                  {(effect.settings?.wet ?? 0.5).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-3 text-xs text-[#CCCCCC]/50">
            No configurable parameters available for this effect.
          </div>
        );
    }
  };

  return (
    <div className="border-t border-[#4C4F69]/20 p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs text-[#CCCCCC]/72 font-medium">Effects</h3>
      </div>

      <div className="space-y-2">
        {effects.map((effect) => (
          <div
            key={effect.id}
            className="border border-[#4C4F69]/10 rounded overflow-hidden bg-[#010203]/50"
          >
            {/* Effect header */}
            <div
              className="flex items-center justify-between p-2 cursor-pointer hover:bg-[#4C4F69]/5"
              onClick={() => toggleEffectExpanded(effect.id)}
            >
              <div className="flex items-center gap-2">
                {expandedEffects[effect.id] ? (
                  <ChevronDown size={14} className="text-[#CCCCCC]/50" />
                ) : (
                  <ChevronRight size={14} className="text-[#CCCCCC]/50" />
                )}
                <span className="text-xs text-[#CCCCCC]/72">
                  {effect.type.charAt(0).toUpperCase() + effect.type.slice(1)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEffectRemove(effect.id);
                  }}
                  className="p-1 text-[#CCCCCC]/50 hover:text-[#CCCCCC]/90 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Effect controls */}
            {expandedEffects[effect.id] && renderEffectControls(effect)}
          </div>
        ))}
      </div>
    </div>
  );
};
