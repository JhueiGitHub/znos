// /root/app/apps/monopoly/App.tsx
"use client";

import "./styles/welcome.css";
import WelcomeScreen from "./components/welcome-screen";

const App = () => {
  return (
    <div className="h-full w-full bg-black/80">
      <WelcomeScreen />
    </div>
  );
};

export default App;
