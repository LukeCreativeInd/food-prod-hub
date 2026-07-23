function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
      aria-hidden="true"
    />
  );
}

export default function StockLocationDetailLoading() {
  return (
    <main className="space-y-6 px-5 py-6 md:px-8" aria-busy="true">
      <div>
        <SkeletonBlock className="h-7 w-56" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-2xl" />
      </div>
      <div className="flex flex-wrap gap-3">
        <SkeletonBlock className="h-9 w-40" />
        <SkeletonBlock className="h-7 w-20" />
        <SkeletonBlock className="h-7 w-28" />
      </div>
      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <SkeletonBlock className="h-5 w-40" />
              <SkeletonBlock className="mt-3 h-3 w-4/5" />
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              {Array.from({ length: 6 }).map((__, rowIndex) => (
                <SkeletonBlock key={rowIndex} className="h-16 w-full" />
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
