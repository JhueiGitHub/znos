"use client";

import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent";
import { MusicProvider } from "./context/MusicContext";

export default function App() {
  return (
    <MusicProvider>
      <div className="flex h-full">
        <Sidebar />
        <MainContent />
      </div>
    </MusicProvider>
  );
}
