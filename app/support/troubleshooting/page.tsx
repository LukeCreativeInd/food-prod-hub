import type { Metadata } from "next";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata: Metadata = {
  title: "Troubleshooting - EveryBatch",
};

const troubleshootingTopics = [
  "Login and workspace access",
  "Support domain redirects",
  "Supplier invoice upload checks",
  "Formula and costing readiness",
];

export default function SupportTroubleshootingPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-green-950/10 bg-white p-6 shadow-sm">
        <StatusBadge tone="info">Scaffold</StatusBadge>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
          Troubleshooting
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          A first authenticated placeholder for practical support checks. Full
          troubleshooting articles will be written in a later content pass.
        </p>
      </section>

      <SectionCard
        title="Planned troubleshooting topics"
        description="Static placeholders only; no internal developer runbooks are exposed."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {troubleshootingTopics.map((topic) => (
            <div
              key={topic}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-950"
            >
              {topic}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
