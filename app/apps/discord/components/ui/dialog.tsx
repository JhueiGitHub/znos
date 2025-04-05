"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDiscordStyles } from "@/app/apps/discord/hooks/useDiscordStyles";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;

const DialogContainerContext = React.createContext<{
  container: HTMLElement | null;
  zIndex?: number;
}>({ container: null });

export const DialogContainerProvider = ({
  children,
  container,
  zIndex = 50,
}: {
  children: React.ReactNode;
  container: HTMLElement | null;
  zIndex?: number;
}) => (
  <DialogContainerContext.Provider value={{ container, zIndex }}>
    {children}
  </DialogContainerContext.Provider>
);

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { container, zIndex } = React.useContext(DialogContainerContext);
  const { getDiscordStyle } = useDiscordStyles();

  return (
    <DialogPrimitive.Portal container={container}>
      <DialogPrimitive.Overlay
        className="fixed inset-0 transition-opacity duration-200"
        style={{
          backgroundColor: "rgba(0,0,0,0.85)",
          zIndex: zIndex || 50,
        }}
      />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[19px]",
          className
        )}
        style={{
          backgroundColor: getDiscordStyle("modal-bg"),
          border: "0.6px solid rgba(255, 255, 255, 0.09)",
          zIndex: (zIndex || 50) + 1,
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
          style={{
            color: getDiscordStyle("modal-close"),
          }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { getDiscordStyle } = useDiscordStyles();
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left rounded-t-[19px]",
        className
      )}
      style={{
        color: getDiscordStyle("modal-text"),
      }}
      {...props}
    />
  );
};
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 rounded-b-[19px]",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
