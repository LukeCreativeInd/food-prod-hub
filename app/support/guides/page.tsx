import type { Metadata } from "next";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { supportGuideCategories } from "@/lib/support-guides";

export const metadata: Metadata = {
  title: "Help Guides - EveryBatch",
};

export default function SupportGuidesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-green-950/10 bg-white p-6 shadow-sm">
        <StatusBadge tone="info">Guide index scaffold</StatusBadge>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
          Help Guides
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Placeholder guide categories for the authenticated EveryBatch support
          area. Detailed articles will be added in a later static-content pass.
        </p>
      </section>

      <div className="grid gap-4">
        {supportGuideCategories.map((category) => (
          <SectionCard
            key={category.key}
            title={category.title}
            description={category.description}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {category.items.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-slate-950">
                      {item.title}
                    </h2>
                    <StatusBadge
                      tone={item.status === "Scaffold" ? "success" : "neutral"}
                    >
                      {item.status}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
