import { useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { useStyles } from "@/app/hooks/useStyles";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function StellarToolbar() {
  const { getColor, getFont } = useStyles();

  // MacOS-style toolbar
  return (
    <div
      className="h-12 border-b flex items-center px-4 backdrop-blur-md"
      style={{
        borderColor: getColor("Brd"),
        backgroundColor: getColor("Glass"),
      }}
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5"
                style={{
                  color: getColor("Text Primary (Hd)"),
                  fontFamily: getFont("Text Primary"),
                }}
              >
                Stellar
                <ChevronDown className="h-3 w-3 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                style={{
                  backgroundColor: getColor("Glass"),
                  borderColor: getColor("Brd"),
                }}
              >
                <DropdownMenuItem>New Folder</DropdownMenuItem>
                <DropdownMenuItem>Upload Files</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              All Files
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
