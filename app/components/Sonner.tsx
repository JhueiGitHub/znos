import { Toaster as Sonner } from "sonner";
import { useStyles } from "@/app/hooks/useStyles";

const Toaster = () => {
  const { getColor, getFont } = useStyles();

  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        style: {
          background: getColor("Glass"),
          border: `0.6px solid [#FFFFFF]/10`,
          color: getColor("smoke-med"),
          fontFamily: getFont("Text Primary"),
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-transparent group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:text-primary-foreground",
          cancelButton: " group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
};

export default Toaster;
