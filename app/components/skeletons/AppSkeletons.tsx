// app/components/skeletons/AppSkeletons.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { useStyles } from "@/app/hooks/useStyles";

interface AppSkeletonProps {
  count?: number;
}

export const AppCardSkeleton = () => {
  const { getColor } = useStyles();

  return (
    <div
      className="w-[291px] h-[247px] flex-shrink-0 border rounded-[15px] p-6 bg-black/30 backdrop-blur-sm"
      style={{
        borderColor: getColor("Brd"),
      }}
    >
      {/* OS Config Preview Skeletons */}
      <div className="space-y-3 mb-6">
        {/* Wallpaper Preview */}
        <Skeleton className="w-full h-24 rounded-[9px] bg-white/5" />

        {/* Dock Icons Row */}
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-square rounded-[9px] bg-white/5"
            />
          ))}
        </div>
      </div>

      {/* Card Content Skeletons */}
      <div className="pl-px space-y-2.5">
        {/* Title Skeleton */}
        <Skeleton className="h-5 w-32 mb-2 bg-white/5" />

        {/* Stats/Info Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24 bg-white/5" />
          <Skeleton className="h-3 w-3 rounded-full bg-white/5" />
          <Skeleton className="h-3 w-32 bg-white/5" />
        </div>
      </div>
    </div>
  );
};

export const AppSkeletonGrid = ({ count = 3 }: AppSkeletonProps) => {
  return (
    <div className="flex-1 min-w-0 px-[33px] py-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(count)].map((_, i) => (
          <AppCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
