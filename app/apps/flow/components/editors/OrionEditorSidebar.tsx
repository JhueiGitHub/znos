import { OrionSidebarProps } from "./orion-flow-types";
import { useStyles } from "@os/hooks/useStyles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OrionEditorSidebar = ({
  selectedComponent,
  designSystem,
  onUpdateComponent,
  onMediaSelect,
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

        {selectedComponent.mode === "color" ? (
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
        ) : (
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
            {selectedComponent.value ? (
              <div className="space-y-2">
                <div
                  className="aspect-video rounded border overflow-hidden"
                  style={{ borderColor: getColor("Brd") }}
                >
                  <img
                    src={selectedComponent.value}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={onMediaSelect}
                  className="w-full h-8 px-3 bg-transparent border border-white/[0.09] rounded text-[11px] hover:bg-white/[0.02]"
                  style={{
                    color: getColor("Text Primary (Hd)"),
                    fontFamily: getFont("Text Primary"),
                  }}
                >
                  Change media...
                </button>
              </div>
            ) : (
              <button
                onClick={onMediaSelect}
                className="w-full h-8 px-3 bg-transparent border border-white/[0.09] rounded text-[11px] hover:bg-white/[0.02]"
                style={{
                  color: getColor("Text Primary (Hd)"),
                  fontFamily: getFont("Text Primary"),
                }}
              >
                Choose media...
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrionEditorSidebar;