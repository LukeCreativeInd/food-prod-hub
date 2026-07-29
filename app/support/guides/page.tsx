import type { Metadata } from "next";
import Link from "next/link";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getSupportGuideStatusLabel,
  getSupportGuideStatusTone,
  supportGuideCategories,
} from "@/lib/support-guides";

export const metadata: Metadata = {
  title: "Guides - EveryBatch",
};

export default function SupportGuidesPage() {
  const categoriesWithGuides = supportGuideCategories.filter(
    (category) => category.guides.length > 0,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-green-950/10 bg-white p-6 shadow-sm">
        <StatusBadge tone="info">Static guide library</StatusBadge>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
          Guides
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          User-facing help for the current EveryBatch foundation. Available
          guides are static and authenticated; draft and coming-soon cards show
          the planned content map without exposing internal build notes.
        </p>
      </section>

      <div className="grid gap-4">
        {categoriesWithGuides.map((category) => (
          <SectionCard
            key={category.key}
            title={category.title}
            description={category.description}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {category.guides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/support/guides/${guide.slug}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-green-200 hover:bg-green-50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-slate-950">
                      {guide.title}
                    </h2>
                    <StatusBadge tone={getSupportGuideStatusTone(guide.status)}>
                      {getSupportGuideStatusLabel(guide.status)}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {guide.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
                    <span>{guide.audience}</span>
                    <span aria-hidden="true">/</span>
                    <span>{guide.estimatedRead}</span>
                  </div>
                </Link>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
