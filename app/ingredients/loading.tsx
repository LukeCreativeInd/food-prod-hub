export default function IngredientsLoading() {
  return (
    <main className="min-h-screen bg-[#f5f7f4] px-5 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6" aria-busy="true">
        <div className="rounded-lg border border-white bg-white/85 px-5 py-5 shadow-sm ring-1 ring-slate-200/70">
          <div className="h-4 w-28 animate-pulse rounded-md bg-slate-200" />
          <div className="mt-4 h-8 w-48 animate-pulse rounded-md bg-slate-200" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded-md bg-slate-200" />
        </div>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-24 animate-pulse rounded-md bg-slate-200" />
              <div className="mt-5 h-8 w-16 animate-pulse rounded-md bg-slate-200" />
              <div className="mt-4 h-3 w-full animate-pulse rounded-md bg-slate-200" />
            </div>
          ))}
        </section>
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="h-5 w-44 animate-pulse rounded-md bg-slate-200" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 5 }).map((__, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="h-10 animate-pulse rounded-md bg-slate-100"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
