import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FlowHeaderProps {
  title: string;
  subtitle: string;
  onBack: (() => void) | null;
}

export const FlowHeader = ({ title, subtitle, onBack }: FlowHeaderProps) => {
  return (
    <div className="flex flex-col">
      {/* Navigation */}
      <div className="pl-[33px] py-5 flex gap-[26px]">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="w-5 h-5"
            onClick={onBack}
          >
            <img
              src="/icns/system/chev/chevL.png"
              alt="Back"
              className="w-5 h-5"
            />
          </Button>
        )}
      </div>

      {/* Header */}
      <div className="pl-[33px] pr-[30px] py-5 flex justify-between items-center">
        <div className="flex items-center gap-[18px]">
          <div className="flex items-center gap-[17px]">
            <div className="w-10 h-10 rounded-full bg-white/[0.09] flex items-center justify-center">
              <img
                src="/icns/_avatar.png"
                alt="Avatar"
                className="w-[45px] h-[45px]"
              />
            </div>
            <span className="text-2xl font-semibold text-[#cccccc]/80">
              {title}
            </span>
            <img
              src="/icns/system/chev/chevBG.png"
              alt="Chevron"
              className="w-5 h-5"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            className="h-8 px-4 bg-[#4c4f69] text-[11px] text-black hover:bg-[#4c4f69]/90"
          >
            <Plus className="w-2 h-2 mr-1.5" />
            Project
          </Button>
          <Button
            variant="outline"
            className="h-8 px-[11px] border-[#292929]/80 text-[11px] text-[#cccccc]/70"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Subtitle */}
      <div className="pl-[33px] py-5">
        <div className="text-[11px] font-semibold text-[#cccccc]">
          {subtitle}
        </div>
      </div>
    </div>
  );
};
