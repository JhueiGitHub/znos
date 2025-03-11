// app/apps/studio/components/PatternBank.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Edit, Copy } from "lucide-react";

interface Pattern {
  id: string;
  name: string;
  type: string;
  preview: string;
}

interface PatternBankProps {
  patterns: Pattern[];
  selectedPattern: string | null;
  onPatternSelect: (patternId: string) => void;
}

export const PatternBank: React.FC<PatternBankProps> = ({
  patterns,
  selectedPattern,
  onPatternSelect,
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="h-12 border-b border-[#4C4F69]/20 flex items-center justify-between px-4">
        <span className="text-sm text-[#CCCCCC]/72">Patterns</span>
        <button className="p-1 text-[#CCCCCC]/50 hover:text-[#CCCCCC]/90 transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {patterns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[#CCCCCC]/40 text-center max-w-[200px] space-y-3">
              <p className="text-sm">No patterns created yet</p>
              <button className="px-3 py-1.5 bg-[#4C4F69]/10 hover:bg-[#4C4F69]/20 text-[#CCCCCC]/70 text-xs rounded transition-colors">
                Create New Pattern
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {patterns.map((pattern) => (
              <div
                key={pattern.id}
                className={cn(
                  "border border-[#4C4F69]/10 rounded overflow-hidden cursor-pointer transition-all",
                  selectedPattern === pattern.id
                    ? "bg-[#4C4F69]/20 border-[#4C4F69]/30 shadow-inner"
                    : "bg-[#010203]/50 hover:bg-[#4C4F69]/10"
                )}
                onClick={() => onPatternSelect(pattern.id)}
              >
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-[#CCCCCC]/90 font-medium">
                      {pattern.name}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[#4C4F69]/10 text-[#CCCCCC]/50">
                      {pattern.type}
                    </span>
                  </div>

                  {/* Pattern preview */}
                  <div className="h-16 mb-3 bg-[#4C4F69]/10 rounded overflow-hidden">
                    {/* This would be a visualization of the pattern */}
                    <div className="p-2">
                      <div className="grid grid-cols-8 grid-rows-3 gap-0.5 h-full">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "rounded-sm",
                              i % 7 === 0 || i % 11 === 0
                                ? "bg-[#7B6CBD]/50"
                                : "bg-[#4C4F69]/20"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end gap-1">
                    <button className="p-1 text-[#CCCCCC]/50 hover:text-[#CCCCCC]/90 transition-colors">
                      <Copy size={14} />
                    </button>
                    <button className="p-1 text-[#CCCCCC]/50 hover:text-[#CCCCCC]/90 transition-colors">
                      <Edit size={14} />
                    </button>
                    <button className="p-1 text-[#CCCCCC]/50 hover:text-[#CCCCCC]/90 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
