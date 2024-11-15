"use client";

import dynamic from "next/dynamic";
import Room from "./Room";

/**
 * disable ssr to avoid pre-rendering issues of Next.js
 *
 * we're doing this because we're using a canvas element that can't be pre-rendered by Next.js on the server
 */
const App = dynamic(() => import("./App"), { ssr: false });

export default function FlowPage() {
  return (
    <Room>
      <App />
    </Room>
  );
}
