// PRESERVED: Original imports
import { OrionSidebarProps } from "./orion-flow-types";
import { useStyles } from "@os/hooks/useStyles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoPreview } from "@/app/components/media/previews/VideoPreview";

const OrionEditorSidebar = ({
  selectedComponent,
  designSystem,
  onUpdateComponent,
  onMediaSelect,
  onMacOSIconSelect,
}: OrionSidebarProps) => {
  const { getColor, getFont } = useStyles();

  // PRESERVED: Original no selection state
  if (!selectedComponent) {
    return (
      <div
        className="absolute right-0 top-0 bottom-0 w-[264px] border-l flex flex-col bg-[#010203]/80 backdrop-blur-sm"
        style={{
          borderColor: getColor("Brd"),
          backgroundColor: getColor("Glass"),
        }}
      >
        <div className="h-10 px-4 flex items-center gap-8">
          <span
            className="text-[11px] font-semibold"
            style={{
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
            }}
          >
            Design
          </span>
          <span
            className="text-[11px]"
            style={{
              color: getColor("Text Secondary (Bd)"),
              fontFamily: getFont("Text Secondary"),
            }}
          >
            No selection
          </span>
        </div>
      </div>
    );
  }

  // EVOLVED: Enhanced media content renderer with video support
  const renderMediaContent = () => {
    // EVOLVED: Add explicit video detection
    const isVideo = selectedComponent.value?.match(/\.(mp4|webm|mov)$/i);

    return (
      <div className="space-y-2">
        <label
          className="text-[11px] uppercase"
          style={{
            color: getColor("Text Secondary (Bd)"),
            fontFamily: getFont("Text Secondary"),
          }}
        >
          Media
        </label>
        <div
          className="aspect-video rounded border overflow-hidden"
          style={{ borderColor: getColor("Brd") }}
        >
          {selectedComponent.mode === "media" && selectedComponent.value ? (
            isVideo ? (
              <VideoPreview url={selectedComponent.value} />
            ) : (
              <img
                src={selectedComponent.value}
                className="w-full h-full object-cover"
                alt="Selected media"
              />
            )
          ) : (
            <img
              src="/media/system/_empty_image.png"
              className="w-full h-full object-cover"
              alt="Empty media state"
            />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={onMediaSelect}
            className="w-full h-8 px-3 bg-transparent border border-white/[0.09] rounded text-[11px] hover:bg-white/[0.02]"
            style={{
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
            }}
          >
            {selectedComponent.type === "WALLPAPER"
              ? selectedComponent.value
                ? "Change wallpaper..."
                : "Choose wallpaper..."
              : selectedComponent.value
                ? "Change icon..."
                : "Choose icon..."}
          </button>
          {selectedComponent.type === "DOCK_ICON" && (
            <button
              onClick={onMacOSIconSelect}
              className="w-full h-8 px-3 bg-transparent border border-white/[0.09] rounded text-[11px] hover:bg-white/[0.02]"
              style={{
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
            >
              Choose macOS icon...
            </button>
          )}
        </div>
      </div>
    );
  };

  // PRESERVED: Original color content renderer
  const renderColorContent = () => (
    <div className="space-y-2">
      <label
        className="text-[11px] uppercase"
        style={{
          color: getColor("Text Secondary (Bd)"),
          fontFamily: getFont("Text Secondary"),
        }}
      >
        Color Token
      </label>
      <Select
        value={selectedComponent.tokenId || ""}
        onValueChange={(value) =>
          onUpdateComponent(selectedComponent.id, { tokenId: value })
        }
      >
        <SelectTrigger
          className="w-full h-8 px-3 bg-transparent border border-white/[0.09]"
          style={{
            color: getColor("Text Primary (Hd)"),
            fontFamily: getFont("Text Primary"),
          }}
        >
          <SelectValue placeholder="Select color" />
        </SelectTrigger>
        <SelectContent>
          {designSystem?.colorTokens.map((token) => (
            <SelectItem key={token.id} value={token.name}>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: token.value }}
                />
                <span>{token.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  // PRESERVED: Main component structure
  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-[264px] border-l flex flex-col bg-[#010203]/80 backdrop-blur-sm"
      style={{
        borderColor: getColor("Brd"),
        backgroundColor: getColor("Glass"),
      }}
    >
      <div className="h-10 px-4 flex items-center gap-8">
        <span
          className="text-[11px] font-semibold"
          style={{
            color: getColor("Text Primary (Hd)"),
            fontFamily: getFont("Text Primary"),
          }}
        >
          Design
        </span>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <div className="space-y-2">
          <label
            className="text-[11px] uppercase"
            style={{
              color: getColor("Text Secondary (Bd)"),
              fontFamily: getFont("Text Secondary"),
            }}
          >
            Mode
          </label>
          <Select
            value={selectedComponent.mode}
            onValueChange={(value: "color" | "media") =>
              onUpdateComponent(selectedComponent.id, { mode: value })
            }
          >
            <SelectTrigger
              className="w-full h-8 px-3 bg-transparent border border-white/[0.09]"
              style={{
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
            >
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="color">Color Fill</SelectItem>
              <SelectItem value="media">Media</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedComponent.mode === "media" && renderMediaContent()}
        {selectedComponent.mode === "color" && renderColorContent()}
      </div>
    </div>
  );
};

export default OrionEditorSidebar;
