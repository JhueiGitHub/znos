"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StellarLayout } from "./components/StellarLayout";
import { StellarProvider } from "./components/StellarProvider";

// PRESERVED: Same pattern as Flow app
const queryClient = new QueryClient();

export default function StellarApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <StellarProvider>
        <div className="h-full w-full">
          <StellarLayout />
        </div>
      </StellarProvider>
    </QueryClientProvider>
  );
}
