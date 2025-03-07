// app/apps/milanote/components/MilanoteBreadcrumb.tsx
import React from "react";
import { useMilanoteStore } from "../store/milanoteStore";
import { useStyles } from "@/app/hooks/useStyles";
import { ChevronRight, Home, Menu } from "lucide-react";

const MilanoteBreadcrumb: React.FC = () => {
  const { getColor, getFont } = useStyles();
  const breadcrumb = useMilanoteStore((state) => state.breadcrumb);
  const setCurrentBoard = useMilanoteStore((state) => state.setCurrentBoard);
  const navigateBack = useMilanoteStore((state) => state.navigateBack);

  // Handle breadcrumb item click
  const handleItemClick = (id: string, index: number) => {
    // If clicking the last item, do nothing
    if (index === breadcrumb.length - 1) return;

    // Navigate to the clicked item
    setCurrentBoard(id);

    // Update the breadcrumb by removing items after the clicked one
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    useMilanoteStore.setState({ breadcrumb: newBreadcrumb });
  };

  return (
    <div
      className="milanote-breadcrumb border-b"
      style={{
        backgroundColor: getColor("black-thick"),
        borderColor: getColor("black-thin"),
      }}
    >
      <div className="flex items-center space-x-2">
        {/* Menu button */}
        <button
          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-black/20"
          style={{ color: getColor("smoke-med") }}
        >
          <Menu size={16} />
        </button>

        {/* Home button */}
        <button
          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-black/20"
          style={{ color: getColor("smoke-med") }}
          onClick={() => setCurrentBoard("root")}
        >
          <Home size={16} />
        </button>

        {/* Breadcrumb items */}
        <div className="flex items-center overflow-x-auto milanote-scrollbar">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && (
                <ChevronRight
                  size={16}
                  className="mx-1 flex-shrink-0"
                  style={{ color: getColor("smoke-thin") }}
                />
              )}
              <button
                className={`px-2 py-1 rounded-md text-sm whitespace-nowrap hover:bg-black/20 ${
                  index === breadcrumb.length - 1 ? "font-medium" : ""
                }`}
                style={{
                  color:
                    index === breadcrumb.length - 1
                      ? getColor("smoke")
                      : getColor("smoke-thin"),
                  fontFamily: getFont("Text Primary"),
                }}
                onClick={() => handleItemClick(item.id, index)}
              >
                {item.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right side controls */}
      <div className="ml-auto flex items-center">
        {/* Back button - only show if we have more than one level */}
        {breadcrumb.length > 1 && (
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-black/20"
            style={{ color: getColor("smoke-med") }}
            onClick={navigateBack}
          >
            <ChevronRight size={16} className="transform rotate-180" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MilanoteBreadcrumb;
