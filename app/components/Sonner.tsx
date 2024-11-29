import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";
import { useStyles } from "@/app/hooks/useStyles";

const Toaster = () => {
  const { getColor, getFont } = useStyles();
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as any}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        style: {
          background: getColor("Glass"),
          border: `1px solid ${getColor("Brd")}`,
          color: getColor("Text Primary (Hd)"),
          fontFamily: getFont("Text Primary"),
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-transparent group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
};

export default Toaster;
