import { memo } from "react";
import { useStyles } from "@os/hooks/useStyles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrionSidebarProps } from "./orion-flow-types";

const OrionEditorSidebar = ({
  selectedComponent,
  designSystem,
  onUpdateComponent,
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
        <span
          className="text-[11px] font-semibold"
          style={{
            color: getColor("Text Primary (Hd)"),
            fontFamily: getFont("Text Primary"),
          }}
        >
          {selectedComponent.name}
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
            value={selectedComponent.mode || "color"}
            onValueChange={(value) =>
              onUpdateComponent(selectedComponent.id, {
                mode: value as "color" | "media",
              })
            }
          >
            <SelectTrigger
              className="w-full h-8 px-3 bg-transparent border"
              style={{
                borderColor: getColor("Brd"),
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
            >
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent
              style={{
                backgroundColor: getColor("Glass"),
                borderColor: getColor("Brd"),
              }}
            >
              <SelectItem value="color">Color</SelectItem>
              <SelectItem value="media">Media</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedComponent.mode === "color" && designSystem?.colorTokens && (
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
              onValueChange={(tokenId) =>
                onUpdateComponent(selectedComponent.id, { tokenId })
              }
            >
              <SelectTrigger
                className="w-full h-8 px-3 bg-transparent border"
                style={{
                  borderColor: getColor("Brd"),
                  color: getColor("Text Primary (Hd)"),
                  fontFamily: getFont("Text Primary"),
                }}
              >
                <SelectValue placeholder="Select color token" />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: getColor("Glass"),
                  borderColor: getColor("Brd"),
                }}
              >
                {designSystem.colorTokens.map((token) => (
                  <SelectItem
                    key={token.id}
                    value={token.name}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: token.value,
                        opacity: token.opacity / 100,
                      }}
                    />
                    <span
                      style={{
                        color: getColor("Text Primary (Hd)"),
                        fontFamily: getFont("Text Primary"),
                      }}
                    >
                      {token.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(OrionEditorSidebar);
