import { useCallback } from "react";
import { useStyles } from "@/app/hooks/useStyles";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function StellarSidebar() {
  const { getColor, getFont } = useStyles();

  const handleSelect = useCallback((id: string) => {
    console.log("Selected:", id);
  }, []);

  return (
    <div
      className="w-64 border-r"
      style={{
        backgroundColor: getColor("Glass"),
        borderColor: getColor("Brd"),
      }}
    >
      <ScrollArea className="h-full">
        <div className="p-4">
          <div className="space-y-4">
            {/* Favorites Section */}
            <div>
              <h2
                className="text-xs font-semibold mb-2 px-2"
                style={{
                  color: getColor("Text Secondary (Bd)"),
                  fontFamily: getFont("Text Secondary"),
                }}
              >
                FAVORITES
              </h2>
              <div className="space-y-1">
                <div
                  className={cn(
                    "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                  )}
                  style={{
                    color: getColor("Text Primary (Hd)"),
                  }}
                >
                  <span>Recent</span>
                  <div className="ml-auto">Documents</div>
                </div>
                <div className="ml-4 space-y-1">
                  <div
                    className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    style={{
                      color: getColor("Text Primary (Hd)"),
                    }}
                  >
                    All Files
                  </div>
                  <div
                    className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    style={{
                      color: getColor("Text Primary (Hd)"),
                    }}
                  >
                    Images
                  </div>
                </div>
              </div>
            </div>

            {/* Locations Section */}
            <div>
              <h2
                className="text-xs font-semibold mb-2 px-2"
                style={{
                  color: getColor("Text Secondary (Bd)"),
                  fontFamily: getFont("Text Secondary"),
                }}
              >
                LOCATIONS
              </h2>
              <div className="space-y-1">
                <div
                  className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  style={{
                    color: getColor("Text Primary (Hd)"),
                  }}
                >
                  Desktop
                </div>
                <div
                  className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  style={{
                    color: getColor("Text Primary (Hd)"),
                  }}
                >
                  Documents
                </div>
                <div
                  className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  style={{
                    color: getColor("Text Primary (Hd)"),
                  }}
                >
                  Downloads
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
