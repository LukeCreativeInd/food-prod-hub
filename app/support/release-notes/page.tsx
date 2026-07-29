import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata: Metadata = {
  title: "Release Notes - EveryBatch",
};

export default function SupportReleaseNotesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-green-950/10 bg-white p-6 shadow-sm">
        <StatusBadge tone="neutral">Scaffold</StatusBadge>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
          Release Notes
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          A future authenticated changelog for user-facing EveryBatch releases.
        </p>
      </section>

      <EmptyState
        title="Release notes coming soon"
        description="No release-note publishing workflow or database-backed content is included yet."
      />
    </div>
  );
}
