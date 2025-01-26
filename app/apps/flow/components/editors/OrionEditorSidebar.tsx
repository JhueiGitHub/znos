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

  const isDockIcon = selectedComponent.type === "DOCK_ICON";
  const isCursor = selectedComponent.type === "CURSOR";

  const renderMediaContent = (type: "fill" | "outline" = "fill") => {
    const value =
      type === "fill"
        ? selectedComponent.value
        : selectedComponent.outlineValue;
    const isVideo = value?.match(/\.(mp4|webm|mov)$/i);

    return (
      <div className="space-y-2">
        <label
          className="text-[11px] uppercase"
          style={{
            color: getColor("Text Secondary (Bd)"),
            fontFamily: getFont("Text Secondary"),
          }}
        >
          {type === "fill" ? "Media" : "Outline Media"}
        </label>
        <div
          className="aspect-video rounded border overflow-hidden"
          style={{ borderColor: getColor("Brd") }}
        >
          {value ? (
            isVideo ? (
              <VideoPreview url={value} />
            ) : (
              <img
                src={value}
                className="w-full h-full object-cover"
                alt={`Selected ${type} media`}
              />
            )
          ) : (
            <img
              src="/media/system/_empty_image.png"
              className="w-full h-full object-cover"
              alt={`Empty ${type} media state`}
            />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() =>
              onMediaSelect(type === "outline" ? "outline" : "fill")
            }
            className="w-full h-8 px-3 bg-transparent border border-white/[0.09] rounded text-[11px] hover:bg-white/[0.02]"
            style={{
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
            }}
          >
            {type === "fill"
              ? selectedComponent.type === "WALLPAPER"
                ? value
                  ? "Change wallpaper..."
                  : "Choose wallpaper..."
                : value
                  ? "Change icon..."
                  : "Choose icon..."
              : value
                ? "Change outline..."
                : "Choose outline..."}
          </button>
          {type === "fill" && isDockIcon && (
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

  const renderColorContent = (type: "fill" | "outline" = "fill") => (
    <div className="space-y-2">
      <label
        className="text-[11px] uppercase"
        style={{
          color: getColor("Text Secondary (Bd)"),
          fontFamily: getFont("Text Secondary"),
        }}
      >
        {type === "fill"
          ? isCursor
            ? "Inner Color"
            : "Color Token"
          : isCursor
            ? "Outer Color"
            : "Outline Color"}
      </label>
      <Select
        value={
          type === "fill"
            ? selectedComponent.tokenId || ""
            : selectedComponent.outlineTokenId || ""
        }
        onValueChange={(value) =>
          onUpdateComponent(
            selectedComponent.id,
            type === "fill" ? { tokenId: value } : { outlineTokenId: value }
          )
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

  // For cursor, we only show color options
  if (isCursor) {
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
            Cursor Design
          </span>
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Inner Color */}
          {renderColorContent("fill")}

          {/* Outer Color */}
          <div className="pt-4 border-t border-white/[0.09]">
            {renderColorContent("outline")}
          </div>
        </div>
      </div>
    );
  }

  // Return original sidebar content for other component types
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
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Fill Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-[11px] uppercase"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              Fill Mode
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

          {selectedComponent.mode === "media" && renderMediaContent("fill")}
          {selectedComponent.mode === "color" && renderColorContent("fill")}
        </div>

        {/* Outline Section (Only for dock icons) */}
        {isDockIcon && (
          <div className="space-y-4 pt-4 border-t border-white/[0.09]">
            <div className="space-y-2">
              <label
                className="text-[11px] uppercase"
                style={{
                  color: getColor("Text Secondary (Bd)"),
                  fontFamily: getFont("Text Secondary"),
                }}
              >
                Outline Mode
              </label>
              <Select
                value={selectedComponent.outlineMode || "color"}
                onValueChange={(value: "color" | "media") =>
                  onUpdateComponent(selectedComponent.id, {
                    outlineMode: value,
                  })
                }
              >
                <SelectTrigger
                  className="w-full h-8 px-3 bg-transparent border border-white/[0.09]"
                  style={{
                    color: getColor("Text Primary (Hd)"),
                    fontFamily: getFont("Text Primary"),
                  }}
                >
                  <SelectValue placeholder="Select outline mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="color">Color Fill</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(selectedComponent.outlineMode || "color") === "media" &&
              renderMediaContent("outline")}
            {(selectedComponent.outlineMode || "color") === "color" &&
              renderColorContent("outline")}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrionEditorSidebar;
