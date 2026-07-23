function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
      aria-hidden="true"
    />
  );
}

export default function CostingOverviewLoading() {
  return (
    <main className="space-y-6 px-5 py-6 md:px-8" aria-busy="true">
      <div>
        <SkeletonBlock className="h-7 w-40" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-3xl" />
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="mt-5 h-8 w-16" />
            <SkeletonBlock className="mt-4 h-3 w-full" />
          </div>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <SkeletonBlock className="h-5 w-44" />
              <SkeletonBlock className="mt-3 h-3 w-4/5" />
            </div>
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }).map((__, rowIndex) => (
                <SkeletonBlock key={rowIndex} className="h-20 w-full" />
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
