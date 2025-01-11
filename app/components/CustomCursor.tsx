import React, { useEffect } from "react";

const CustomCursor = () => {
  useEffect(() => {
    // Create SVG cursor
    const cursorSVG = `
      <svg height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd" transform="translate(10 7)">
          <!-- Outer path (outline) -->
          <path d="m6.148 18.473 1.863-1.003 1.615-.839-2.568-4.816h4.332l-11.379-11.408v16.015l3.816-3.221z" fill="#35374a"/>
          <!-- Inner path (fill) -->
          <path d="m6.431 17 1.765-.941-2.775-5.202h3.604l-8.025-8.043v11.188l3.03-2.442z" fill="#1e202a"/>
        </g>
      </svg>
    `;

    // Convert SVG to base64
    const encodedCursor = btoa(cursorSVG);

    // Create style element
    const style = document.createElement("style");
    style.textContent = `
      * {
        cursor: url(data:image/svg+xml;base64,${encodedCursor}) 10 7, default !important;
      }
      
      /* Optional: Different cursor for clickable elements */
      a, button, [role="button"], input[type="submit"], input[type="button"], input[type="reset"] {
        cursor: url(data:image/svg+xml;base64,${encodedCursor}) 8 8, pointer !important;
      }
    `;

    // Add style to document head
    document.head.appendChild(style);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default CustomCursor;
