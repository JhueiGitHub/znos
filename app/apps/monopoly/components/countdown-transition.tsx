import { useEffect, useState } from "react";

// /root/app/apps/monopoly/components/countdown-transition.tsx
export default function CountdownTransition() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount > 1) return prevCount - 1;
        clearInterval(interval);
        return prevCount;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
      <span className="text-8xl font-bold text-white">{count}</span>
    </div>
  );
}
