function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl shadow-md shadow-orange-100 border border-orange-50 overflow-hidden animate-pulse">
      <div className="h-1 w-full bg-orange-100" />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 bg-orange-100 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-orange-100 rounded-full w-2/3 mb-2" />
            <div className="h-3 bg-orange-50 rounded-full w-1/3" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-100 rounded-full w-full" />
          <div className="h-3 bg-gray-100 rounded-full w-5/6" />
          <div className="h-3 bg-gray-100 rounded-full w-4/6" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-24 bg-orange-50 rounded-full" />
          <div className="h-7 w-20 bg-orange-50 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <div className="mt-6">
      <div className="h-4 w-24 bg-orange-100 rounded-full mb-3 animate-pulse" />
      <div className="flex flex-col gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
