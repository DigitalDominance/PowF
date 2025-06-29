import { Skeleton } from "@/components/ui/skeleton"

export default function MarketLoading() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section Skeleton */}
      <section className="w-full min-h-[50vh] flex flex-col justify-center items-center text-center relative overflow-hidden py-16">
        <div className="container px-4 md:px-6 relative z-10">
          <Skeleton className="h-16 w-96 mx-auto mb-6" />
          <Skeleton className="h-6 w-full max-w-3xl mx-auto mb-4" />
          <Skeleton className="h-6 w-2/3 max-w-2xl mx-auto mb-12" />

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Assets Section Skeleton */}
      <section className="w-full py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-20 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Skeleton className="h-10 w-40 mx-auto" />
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <section className="w-full pt-0 md:pt-2 pb-12 md:pb-16">
        <div className="container px-4 md:px-6">
          <div className="w-full max-w-7xl mx-auto">
            {/* Tabs Skeleton */}
            <div className="mb-8">
              <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-md" />
                ))}
              </div>
            </div>

            {/* Filters Skeleton */}
            <div className="space-y-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <Skeleton className="flex-1 h-10" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-40" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-2" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </div>

            {/* Assets Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-40 w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-7 w-16 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-6 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 rounded-xl border border-accent/20">
              <Skeleton className="h-4 w-48" />
              <div className="flex items-center gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
