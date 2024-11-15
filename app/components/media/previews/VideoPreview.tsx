// components/media/previews/VideoPreview.tsx
interface VideoPreviewProps {
  url: string;
}

export function VideoPreview({ url }: VideoPreviewProps) {
  return (
    <div className="relative w-full h-full">
      <video
        src={url}
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute bottom-2 right-2 bg-black/50 rounded-full p-2">
        <svg
          className="w-4 h-4 text-[#ABC4C3]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
        </svg>
      </div>
    </div>
  );
}
