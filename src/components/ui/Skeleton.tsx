/**
 * Premium skeleton loading — quiet graphite rails with a soft electric-blue
 * shimmer sweep. No generic grey blocks: every shape mirrors the real card.
 */
export function SkeletonCard() {
  return (
    <div className="w-full bg-[#0b0e14] border border-[#292d30] rounded-2xl p-5 flex flex-col gap-4 overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2 w-2/3">
          <div className="h-4 rounded skeleton-shimmer w-3/4" />
          <div className="h-3 rounded skeleton-shimmer w-1/2" />
        </div>
        <div className="w-7 h-7 rounded-full skeleton-shimmer shrink-0" />
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between">
          <div className="h-2.5 rounded skeleton-shimmer w-1/4" />
          <div className="h-2.5 rounded skeleton-shimmer w-1/5" />
        </div>
        <div className="h-1.5 rounded-full skeleton-shimmer w-full" />
      </div>
    </div>
  );
}

export function SkeletonDetails() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <div className="h-3 rounded skeleton-shimmer w-40" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-7 rounded skeleton-shimmer w-2/3" />
        <div className="h-3 rounded skeleton-shimmer w-1/3" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-[380px] bg-[#0b0e14] border border-[#292d30] rounded-2xl lg:col-span-2" />
        <div className="h-[380px] bg-[#0b0e14] border border-[#292d30] rounded-2xl" />
      </div>
    </div>
  );
}
