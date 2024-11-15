// components/media/previews/FontPreview.tsx
import { useEffect, useState, useRef } from "react";

interface FontPreviewProps {
  url: string;
  name: string;
}

export function FontPreview({ url, name }: FontPreviewProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const fontName = name.split(".")[0];
  const fontFaceRef = useRef<FontFace | null>(null);

  useEffect(() => {
    const loadFont = async () => {
      try {
        const font = new FontFace(fontName, `url(${url})`);
        fontFaceRef.current = font;

        await font.load();
        document.fonts.add(font);
        setIsLoaded(true);
      } catch (err) {
        console.error("Failed to load font:", err);
      }
    };

    loadFont();

    return () => {
      // Clean up using the FontFace reference
      if (fontFaceRef.current) {
        document.fonts.delete(fontFaceRef.current);
      }
    };
  }, [url, fontName]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#292929]/50">
        <div className="text-[#748393] animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#292929]/50">
      <div style={{ fontFamily: fontName }} className="text-center">
        <div className="text-6xl text-[#ABC4C3]">Aa</div>
        <div className="mt-2 text-xs text-[#748393]">{fontName}</div>
      </div>
    </div>
  );
}
