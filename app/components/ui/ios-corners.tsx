import React from "react";

const IOSCornerBackground = ({
  width,
  height,
  cornerRadius = 19,
  smoothing = 0.9,
  className = "",
  style = {},
  children,
}: {
  width: number;
  height: number;
  cornerRadius?: number;
  smoothing?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => {
  // Calculate control point distance for iOS-style smoothing
  const controlPoint = cornerRadius * (1 - smoothing);

  // Calculate coordinates for the squircle path
  const path = `
    M ${cornerRadius} 0
    h ${width - 2 * cornerRadius}
    c ${controlPoint} 0, ${cornerRadius} ${controlPoint}, ${cornerRadius} ${cornerRadius}
    v ${height - 2 * cornerRadius}
    c 0 ${controlPoint}, -${controlPoint} ${cornerRadius}, -${cornerRadius} ${cornerRadius}
    h -${width - 2 * cornerRadius}
    c -${controlPoint} 0, -${cornerRadius} -${controlPoint}, -${cornerRadius} -${cornerRadius}
    v -${height - 2 * cornerRadius}
    c 0 -${controlPoint}, ${controlPoint} -${cornerRadius}, ${cornerRadius} -${cornerRadius}
    z
  `;

  return (
    <div className={className} style={{ position: "relative", ...style }}>
      <svg
        width={width}
        height={height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      >
        <path
          d={path}
          fill="rgba(0,0,0,0.25)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default IOSCornerBackground;
