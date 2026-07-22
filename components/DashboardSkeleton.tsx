export default function DashboardSkeleton() {
  return (
    <main className="max-w-2xl mx-auto p-4 sm:p-6 w-full animate-pulse space-y-6">
      {/* Top Profile Card Skeleton */}
      <div className="p-6 border rounded-2xl bg-white shadow-sm flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-40 bg-gray-200 rounded-md"></div>
          <div className="h-4 w-56 bg-gray-100 rounded-md"></div>
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Main Action / QR Card Skeleton */}
      <div className="p-8 border rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center gap-4">
        <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
        <div className="w-48 h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200"></div>
        <div className="h-3 w-40 bg-gray-100 rounded-md"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-xl bg-white space-y-2">
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
          <div className="h-8 w-16 bg-gray-300 rounded"></div>
        </div>
        <div className="p-4 border rounded-xl bg-white space-y-2">
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
          <div className="h-8 w-16 bg-gray-300 rounded"></div>
        </div>
      </div>
    </main>
  );
}
