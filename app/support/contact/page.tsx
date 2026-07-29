import type { Metadata } from "next";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata: Metadata = {
  title: "Contact Support - EveryBatch",
};

export default function SupportContactPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-green-950/10 bg-white p-6 shadow-sm">
        <StatusBadge tone="success">Authenticated support</StatusBadge>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
          Contact Support
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          This page gives signed-in EveryBatch users a safe contact area while
          ticket submission, routing and support inbox tooling are planned.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Current support path"
          description="Use the existing support channel while in-app ticket submission is not active."
        >
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-950">
              Contact EveryBatch support
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              For now, raise support needs through the agreed business channel.
              A persistent support-ticket workflow will be added after the
              ticket schema and support inbox are reviewed.
            </p>
          </div>
        </SectionCard>

        <SectionCard
          title="What to include"
          description="A simple checklist for faster support triage."
        >
          <ul className="space-y-3 text-sm leading-6 text-slate-600">
            <li>Workspace or domain where the issue happened.</li>
            <li>Page or module name.</li>
            <li>Short description of what you expected and what happened.</li>
            <li>Screenshot or file name if the issue relates to an upload.</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
