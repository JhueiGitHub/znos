// app/apps/flow/components/FlowSidebar.tsx
import { Button } from "@/components/ui/button";
import { ViewType } from "../types/view";

interface FlowSidebarProps {
  onViewChange: (view: ViewType) => void;
}

export const FlowSidebar = ({ onViewChange }: FlowSidebarProps) => {
  return (
    <div className="w-[264px] h-full flex flex-col border-r border-white/[0.09]">

      {/* Search */}
      <div className="h-[56px] flex items-center px-2 border-b border-white/[0.09]">
        <div className="w-full h-[32px] bg-[#292929]/50 rounded-md pl-[11px] flex items-center gap-[13px]">
          <img src="/icns/_search.png" alt="Search" className="w-3 h-3" />
          <span className="text-[11px] text-[#4c4f69]/70">
            Search for anything...
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="py-3 border-b border-white/[0.09]">
        <div className="h-8 pl-[15px] flex items-center gap-[13px]">
          <img src="/icns/_avatar.png" alt="Avatar" className="w-4 h-4" />
          <span className="text-[13px] font-semibold text-[#cccccc]/80">
            Odin
          </span>
          <img
            src="/icns/system/chev/chevS.png"
            alt="Chevron"
            className="w-[7px] h-[7px]"
          />
        </div>

        <Button
        variant="ghost"
        className="w-full h-8 pl-[15px] justify-start gap-[13px] text-[11px] text-[#cccccc]/70 hover:bg-[#292929] hover:text-white"
        onClick={() => onViewChange("streams")}
      >
        <img src="/icns/_all.png" alt="All" className="w-4 h-4" />
        All Streams
      </Button>

      <Button
        variant="ghost"
        className="w-full h-8 pl-[15px] justify-start gap-[13px] text-[11px] text-[#cccccc]/70 hover:bg-[#292929] hover:text-white"
        onClick={() => onViewChange("apps")}
      >
        <img src="/icns/_stellar.png" alt="Stellar" className="w-4 h-4" />
        Apps
      </Button>

      <Button
        variant="ghost"
        className="w-full h-8 pl-[15px] justify-start gap-[13px] text-[11px] text-[#cccccc]/70 hover:bg-[#292929] hover:text-white"
      >
        <img src="/icns/_archive.png" alt="Archive" className="w-4 h-4" />
        Archive
      </Button>

      <Button
        variant="ghost"
        className="w-full h-8 pl-[15px] justify-start gap-[13px] text-[11px] text-[#cccccc]/70 hover:bg-[#292929] hover:text-white"
        onClick={() => onViewChange("community")}
      >
        <img src="/icns/_xp.png" alt="Community" className="w-4 h-4" />
        Community
      </Button>
      </div>

      {/* Favorites */}
      <div className="py-3">
        <div className="h-8 pl-[18px] flex items-center">
          <span className="text-[11px] font-semibold text-[#cccccc]/80">
            Favourites
          </span>
        </div>
        <Button
          variant="ghost"
          className="w-full h-8 pl-[17px] justify-start gap-[13px] text-[11px] text-[#cccccc]/70 hover:bg-[#292929] hover:text-white"
        >
          <img src="/icns/_folder.png" alt="Folder" className="w-4 h-4" />
          Dopa P1
        </Button>
        <Button
          variant="ghost"
          className="w-full h-8 pl-[17px] justify-start gap-[13px] text-[11px] text-[#cccccc]/70 hover:bg-[#292929] hover:text-white"
        >
          <img src="/icns/_folder.png" alt="Folder" className="w-4 h-4" />
          FlowV2
        </Button>
      </div>
    </div>
  );
};