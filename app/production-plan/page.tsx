import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SampleDataTable } from "@/components/products/sample-data-table";
import { EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { fetchProductionPlans } from "@/lib/production-plan-data";

export const metadata: Metadata = {
  title: "Production Plan - EveryBatch",
};

type SearchParams = Promise<{
  plan?: string;
}>;

function getActionMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<string, string> = {
    created: "Production plan created.",
    missing_date: "Choose a valid production plan date.",
    no_permission: "You do not have permission to change production plans.",
    error: "The production plan action could not be completed.",
  };

  return messages[status] ?? "The production plan action finished.";
}

export default async function ProductionPlanPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [data, params] = await Promise.all([
    fetchProductionPlans(),
    searchParams,
  ]);
  const actionMessage = getActionMessage(params.plan);
  const rows = data.plans.map((plan) => ({
    Date: {
      label: plan.planDate,
      href: plan.href,
    },
    Name: plan.name,
    Status: plan.status,
    Lines: String(plan.linesCount),
    Batches: String(plan.batchesCount),
    Updated: plan.updatedAt,
    Action: {
      label: "Open",
      href: plan.href,
    },
  }));

  return (
    <AppShell>
      <PageHeader
        title="Production Plan"
        description="Plan finished products and component batches before stock issue and task execution."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          {data.canCreatePlans ? (
            <PageActionButton href="/production-plan/new">
              New production plan
            </PageActionButton>
          ) : null}
          <StatusBadge tone="info">Planning only</StatusBadge>
          <StatusBadge tone="neutral">No stock reserved</StatusBadge>
        </div>

        {actionMessage ? (
          <div className="rounded-md border border-[color:var(--tenant-primary-border)] bg-[var(--tenant-primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--tenant-primary)]">
            {actionMessage}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Plans"
            value={String(data.summary.totalPlans)}
            helperText="Real production plan headers visible in this tenant."
            badge="Real data"
            tone="success"
            icon="PP"
          />
          <StatCard
            label="Draft"
            value={String(data.summary.draftPlans)}
            helperText="Plans still being prepared."
            badge="Draft"
            tone="warning"
            icon="DR"
          />
          <StatCard
            label="Planned/approved"
            value={String(data.summary.plannedOrApproved)}
            helperText="Plans ready for later production release workflows."
            badge="Plan"
            tone="info"
            icon="PA"
          />
          <StatCard
            label="Output lines"
            value={String(data.summary.totalLines)}
            helperText="Finished products and components planned for output."
            badge="Lines"
            tone="info"
            icon="OL"
          />
          <StatCard
            label="Batches"
            value={String(data.summary.totalBatches)}
            helperText="Planned batch/run headers. No execution records."
            badge="Runs"
            tone="neutral"
            icon="BT"
          />
        </section>

        <SectionCard
          title="Production plans"
          description="Real planning records only. Plans do not reserve inventory, consume stock, create output stock or create facility tasks yet."
          action={
            data.canCreatePlans ? (
              <StatusBadge tone="success">Create enabled</StatusBadge>
            ) : (
              <StatusBadge tone="info">Read only</StatusBadge>
            )
          }
        >
          {data.plans.length === 0 ? (
            <EmptyState
              title="No production plans yet"
              description="Create the first draft plan for a production date. This is planning-only and will not affect stock, QA, dispatch or reporting."
              action={
                data.canCreatePlans ? (
                  <Link
                    className="inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
                    href="/production-plan/new"
                  >
                    New production plan
                  </Link>
                ) : null
              }
            />
          ) : (
            <SampleDataTable
              columns={[
                "Date",
                "Name",
                "Status",
                "Lines",
                "Batches",
                "Updated",
                "Action",
              ]}
              rows={rows}
              badgeColumns={["Status"]}
              emptyMessage="No production plans are visible yet."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Planning boundaries"
          description="These guardrails are intentional until production execution, stock issue and QA release are designed."
        >
          <div className="grid gap-3 md:grid-cols-3">
            {[
              "No stock is reserved or consumed.",
              "Planned batches are not completed production.",
              "Input requirements, QA release and facility task execution are future workflows.",
            ].map((note) => (
              <div
                className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700"
                key={note}
              >
                {note}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
