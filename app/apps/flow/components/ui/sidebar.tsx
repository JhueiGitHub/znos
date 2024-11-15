// components/ui/sidebar.tsx
"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SidebarContextValue {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(
  undefined
);

export const useSidebarContext = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
};

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultExpanded?: boolean;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, defaultExpanded = true, children, ...props }, ref) => {
    const [expanded, setExpanded] = React.useState(defaultExpanded);
    const toggleExpanded = () => setExpanded((prev) => !prev);

    return (
      <SidebarContext.Provider
        value={{ expanded, setExpanded, toggleExpanded }}
      >
        <div
          ref={ref}
          className={cn(
            "flex h-full w-[264px] flex-col border-r border-white/10",
            className
          )}
          {...props}
        >
          <ScrollArea className="flex-1">{children}</ScrollArea>
        </div>
      </SidebarContext.Provider>
    );
  }
);
Sidebar.displayName = "Sidebar";

// Sidebar Header (Search Area)
interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  SidebarHeaderProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-14 border-b border-white/10 px-2 py-3", className)}
    {...props}
  >
    {children}
  </div>
));
SidebarHeader.displayName = "SidebarHeader";

// Sidebar Section
interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export const SidebarSection = React.forwardRef<
  HTMLDivElement,
  SidebarSectionProps
>(({ className, title, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-3 border-b border-white/10", className)}
    {...props}
  >
    {title && (
      <div className="pl-[18px] h-8 flex items-center">
        <span className="text-[#cccccc]/80 text-[11px] font-semibold">
          {title}
        </span>
      </div>
    )}
    {children}
  </div>
));
SidebarSection.displayName = "SidebarSection";

// Sidebar Item
interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: string;
  active?: boolean;
}

export const SidebarItem = React.forwardRef<HTMLDivElement, SidebarItemProps>(
  ({ className, icon, children, active, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "h-8 pl-[15px] flex items-center gap-[13px] rounded-md",
        active && "bg-[#292929]/50",
        className
      )}
      {...props}
    >
      {icon && <img src={icon} alt="" className="w-4 h-4" />}
      {children}
    </div>
  )
);
SidebarItem.displayName = "SidebarItem";
