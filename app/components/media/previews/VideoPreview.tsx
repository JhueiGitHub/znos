// components/media/previews/VideoPreview.tsx
interface VideoPreviewProps {
  url: string;
}

export function VideoPreview({ url }: VideoPreviewProps) {
  // PRESERVED: Keep the secure URL transformation from MediaCard
  const secureUrl = url.startsWith("https://")
    ? url
    : `https://${url.replace(/^https?:\/\//, "")}`;

  // EVOLVED: Use the proven video implementation from VideoGrid
  return (
    <video
      src={secureUrl}
      className="absolute inset-0 w-full h-full object-cover"
      autoPlay
      muted
      loop
      playsInline
    />
  );
}
