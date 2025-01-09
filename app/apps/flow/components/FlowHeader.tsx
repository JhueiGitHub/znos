import { Button } from "@/components/ui/button";
import { CreateDialog } from "./modals/CreateDialog";
import { useStyles } from "@os/hooks/useStyles";
import { ViewType } from "../types/view";

interface FlowHeaderProps {
  title: string;
  subtitle: string;
  onBack: (() => void) | null;
  currentView: ViewType;
  viewId?: string;
}

export const FlowHeader = ({
  title,
  subtitle,
  onBack,
  currentView,
  viewId,
}: FlowHeaderProps) => {
  const { getColor, getFont } = useStyles();

  return (
    <div className="flex flex-col">
      {/* Navigation */}
      <div className="pl-[33px] py-5 flex gap-[26px]">
        {onBack && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="w-[4.8px] h-[9.6px]"
              onClick={onBack}
            >
              <img
                src="/icns/system/chev/chevL.png"
                alt="Back"
                className="w-[4.8px] h-[9.6px]"
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-[4.8px] h-[9.6px]"
              onClick={onBack}
            >
              <img
                src="/icns/system/chev/chevR.png"
                alt="Forward"
                className="w-[4.8px] h-[9.6px] rotate-180"
              />
            </Button>
          </>
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
            <span
              className="text-2xl font-semibold"
              style={{
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
            >
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
          <CreateDialog currentView={currentView} viewId={viewId} />
          <Button
            variant="outline"
            className="h-8 px-[11px] border text-[11px] bg-red-500 bg-opacity-0"
            style={{
              borderColor: getColor("Brd"),
              color: getColor("Text Secondary (Bd)"),
              fontFamily: getFont("Text Secondary"),
            }}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Subtitle */}
      <div className="pl-[33px] py-5">
        <div
          className="text-[11px] font-semibold"
          style={{
            color: getColor("Text Primary (Hd)"),
            fontFamily: getFont("Text Primary"),
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};
