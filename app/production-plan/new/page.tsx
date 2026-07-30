import type { Metadata } from "next";

import { createProductionPlanAction } from "@/app/production-plan/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { PageActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { requirePermissionAccess } from "@/lib/auth";

export const metadata: Metadata = {
  title: "New Production Plan - EveryBatch",
};

function todayDateInput() {
  return new Date().toISOString().slice(0, 10);
}

export default async function NewProductionPlanPage() {
  await requirePermissionAccess("production_plans.create");

  return (
    <AppShell>
      <PageHeader
        title="New Production Plan"
        description="Create a draft planning header for a production date."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <PageActionButton href="/production-plan" variant="secondary">
            Back to production plans
          </PageActionButton>
          <StatusBadge tone="info">Planning only</StatusBadge>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionCard
            title="Plan details"
            description="A production plan groups planned output lines for a day or planning window. It does not reserve stock or create tasks."
          >
            <form action={createProductionPlanAction} className="space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Plan date
                </span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                  defaultValue={todayDateInput()}
                  name="plan_date"
                  required
                  type="date"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Plan name
                </span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                  name="name"
                  placeholder="Tuesday meal prep plan"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Notes
                </span>
                <textarea
                  className="mt-1 min-h-28 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                  name="notes"
                  placeholder="Planning notes, demand assumptions or prep reminders"
                />
              </label>
              <button
                className="inline-flex w-full items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 sm:w-auto"
                type="submit"
              >
                Create draft plan
              </button>
            </form>
          </SectionCard>

          <SectionCard
            title="What happens next"
            description="After creation, add planned output lines for finished products or components."
          >
            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <p>
                Lines can reference active formulas and recent costing snapshots
                when available.
              </p>
              <p>
                Missing formulas are allowed but marked as blocked so the team can
                review setup before production relies on the line.
              </p>
              <p className="font-semibold text-slate-900">
                No inventory is reserved, consumed or posted from this planning
                step.
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
