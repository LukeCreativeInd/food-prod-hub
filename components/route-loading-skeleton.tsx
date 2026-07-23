import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/ui";

type RouteLoadingSkeletonProps = {
  title: string;
  description: string;
  badge?: string;
  stats?: number;
  sections?: number;
  compactRows?: number;
};

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
      aria-hidden="true"
    />
  );
}

export function RouteLoadingSkeleton({
  title,
  description,
  badge = "Loading",
  stats = 4,
  sections = 2,
  compactRows = 4,
}: RouteLoadingSkeletonProps) {
  return (
    <AppShell>
      <PageHeader title={title} description={description} />
      <div className="space-y-6 px-5 py-6 md:px-8" aria-busy="true">
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="info">{badge}</StatusBadge>
          <StatusBadge tone="neutral">Preparing workspace</StatusBadge>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: stats }).map((_, index) => (
            <article
              key={index}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="mt-5 h-8 w-16" />
              <SkeletonBlock className="mt-4 h-3 w-full" />
              <SkeletonBlock className="mt-2 h-3 w-3/4" />
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: sections }).map((_, index) => (
            <article
              key={index}
              className="rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 px-5 py-4">
                <SkeletonBlock className="h-5 w-44" />
                <SkeletonBlock className="mt-3 h-3 w-4/5" />
              </div>
              <div className="space-y-3 p-5">
                {Array.from({ length: compactRows }).map((__, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="rounded-md border border-slate-100 bg-slate-50 p-4"
                  >
                    <SkeletonBlock className="h-4 w-2/3" />
                    <SkeletonBlock className="mt-3 h-3 w-full" />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
