// components/media/previews/ImagePreview.tsx
interface ImagePreviewProps {
    url: string;
    alt: string;
  }
  
  export function ImagePreview({ url, alt }: ImagePreviewProps) {
    return (
      <div className="relative w-full h-full">
        <img 
          src={url} 
          alt={alt}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-full h-full flex items-center justify-center">
            <button className="text-[#ABC4C3] bg-black/50 px-4 py-2 rounded-full text-sm hover:bg-black/70 transition-colors">
              View
            </button>
          </div>
        </div>
      </div>
    );
  }
  