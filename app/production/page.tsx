import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  AlertCard,
  EmptyState,
  ModuleCard,
  PageActionButton,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { getProductionDashboardData } from "@/lib/production-dashboard-data";

const setupLinks = [
  {
    title: "Components",
    description: "Review component formula setup for batch/prepared items.",
    href: "/components",
    eyebrow: "Products",
  },
  {
    title: "Finished Products",
    description: "Review finished product formula setup for meal outputs.",
    href: "/finished-products",
    eyebrow: "Products",
  },
  {
    title: "Stock Locations",
    description: "Review production, receiving and storage location setup.",
    href: "/stock-locations",
    eyebrow: "Inventory",
  },
  {
    title: "Production Areas",
    description: "Review the future area grouping for production work.",
    href: "/production-areas",
    eyebrow: "Production",
  },
];

const productionLinks = [
  {
    title: "Production Report",
    description: "Future report workspace for demand and production needs.",
    href: "/production-report",
    eyebrow: "Production",
  },
  {
    title: "Production Plan",
    description: "Future planning workspace for scheduled production work.",
    href: "/production-plan",
    eyebrow: "Production",
  },
  {
    title: "Production Areas",
    description: "Review area groupings for kitchen, prep and packing work.",
    href: "/production-areas",
    eyebrow: "Production",
  },
  {
    title: "Production Tasks",
    description: "Future task board for quantities, checks and assignment.",
    href: "/production-tasks",
    eyebrow: "Production",
  },
  {
    title: "Facility / iPad View",
    description: "Future floor-staff task execution workspace.",
    href: "/facility-tasks",
    eyebrow: "Production",
  },
];

function formatCount(value: number | null) {
  return value === null ? "Hidden" : String(value);
}

function countTone(value: number | null) {
  if (value === null) {
    return "neutral" as const;
  }

  return value > 0 ? "success" : "warning";
}

function blockerTone(status: "ready" | "blocked" | "limited") {
  if (status === "ready") {
    return "success" as const;
  }

  if (status === "blocked") {
    return "warning" as const;
  }

  return "neutral" as const;
}

function ReadinessBlocker({
  blocker,
}: {
  blocker: {
    title: string;
    description: string;
    href?: string;
    status: "ready" | "blocked" | "limited";
  };
}) {
  return (
    <article className="rounded-md border border-slate-200/80 bg-slate-50/60 p-4 transition hover:border-green-200 hover:bg-white">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-slate-900">
          {blocker.href ? (
            <Link
              href={blocker.href}
              className="text-clean-green-700 hover:text-clean-green-900"
            >
              {blocker.title}
            </Link>
          ) : (
            blocker.title
          )}
        </h4>
        <StatusBadge tone={blockerTone(blocker.status)}>
          {blocker.status === "ready"
            ? "Ready"
            : blocker.status === "blocked"
              ? "Blocked"
              : "Limited"}
        </StatusBadge>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {blocker.description}
      </p>
    </article>
  );
}

export default async function ProductionPage() {
  const data = await getProductionDashboardData();

  return (
    <AppShell>
      <PageHeader
        title="Production"
        description="Prepare formulas, production areas and task workflows before planning and running production."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge
            tone={
              data.readiness.isReadyForProductionPlanning ? "success" : "warning"
            }
          >
            {data.readiness.isReadyForProductionPlanning
              ? "Planning setup ready"
              : "Planning not ready yet"}
          </StatusBadge>
          <StatusBadge tone="neutral">Read-only scaffold</StatusBadge>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Production locations"
            value={formatCount(data.counts.productionLocationCount)}
            helperText="Production-type stock locations available for future area-based planning."
            badge={
              data.counts.productionLocationCount === null
                ? "No access"
                : "Setup"
            }
            tone={countTone(data.counts.productionLocationCount)}
            icon="AR"
          />
          <StatCard
            label="Component formulas"
            value={formatCount(data.counts.componentFormulaCount)}
            helperText="Component or batch formula versions available for future planning."
            badge={
              data.counts.componentFormulaCount === null
                ? "No access"
                : "Formulas"
            }
            tone={countTone(data.counts.componentFormulaCount)}
            icon="CP"
          />
          <StatCard
            label="Finished formulas"
            value={formatCount(data.counts.finishedProductFormulaCount)}
            helperText="Finished product formula versions available for meal production planning."
            badge={
              data.counts.finishedProductFormulaCount === null
                ? "No access"
                : "Recipes"
            }
            tone={countTone(data.counts.finishedProductFormulaCount)}
            icon="FP"
          />
          <StatCard
            label="Formula lines"
            value={formatCount(data.counts.formulaLineCount)}
            helperText="Formula input lines captured so far. No rollups are calculated here."
            badge={
              data.counts.formulaLineCount === null ? "No access" : "Inputs"
            }
            tone={countTone(data.counts.formulaLineCount)}
            icon="LN"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard
            title="Production planning readiness"
            description="Readiness checks based on setup data only. No production plan, order generation or task assignment exists yet."
            action={
              <StatusBadge
                tone={
                  data.readiness.isReadyForProductionPlanning
                    ? "success"
                    : "warning"
                }
              >
                {data.readiness.isReadyForProductionPlanning
                  ? "Ready for next planning design"
                  : "Setup gaps"}
              </StatusBadge>
            }
          >
            <div className="space-y-3">
              {data.readiness.blockers.map((blocker) => (
                <ReadinessBlocker key={blocker.title} blocker={blocker} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Setup snapshot"
            description="Current tenant setup signals used to prepare later production workflows."
            action={<StatusBadge tone="info">Real tenant data</StatusBadge>}
          >
            <div className="grid gap-3">
              <AlertCard
                title="Storage locations"
                description="Storage areas exist for future issue, return and movement workflows. No stock quantities are created here."
                meta={formatCount(data.counts.storageLocationCount)}
                tone={countTone(data.counts.storageLocationCount)}
              />
              <AlertCard
                title="Receiving / dispatch locations"
                description="Receiving and dispatch location setup for future goods inwards and dispatch workflows."
                meta={formatCount(data.counts.receivingDispatchLocationCount)}
                tone={countTone(data.counts.receivingDispatchLocationCount)}
              />
              <AlertCard
                title="Active formulas"
                description="Formula versions marked active. This does not calculate production quantities."
                meta={formatCount(data.counts.activeFormulaCount)}
                tone={countTone(data.counts.activeFormulaCount)}
              />
              <AlertCard
                title="Draft formulas"
                description="Draft formula versions that may need review before planning use."
                meta={formatCount(data.counts.draftFormulaCount)}
                tone={
                  data.counts.draftFormulaCount === null
                    ? "neutral"
                    : data.counts.draftFormulaCount > 0
                      ? "warning"
                      : "success"
                }
              />
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard
            title="Production locations"
            description="Production-type stock locations that can later support area-based tasks."
            action={
              <PageActionButton href="/stock-locations" variant="secondary">
                Open stock locations
              </PageActionButton>
            }
          >
            {data.productionLocations.length > 0 ? (
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                    <tr>
                      {["Code", "Location", "Area", "Temperature", "Status"].map(
                        (column) => (
                          <th key={column} className="px-4 py-3">
                            {column}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {data.productionLocations.map((location) => (
                      <tr key={location.id}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">
                          {location.code}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/stock-locations/${location.id}`}
                            className="font-semibold text-clean-green-700 hover:text-clean-green-900"
                          >
                            {location.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {location.area}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {location.temperatureZone}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone="success">
                            {location.status}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No production locations visible"
                description="Production locations will appear after the Inventory Locations migration is applied and the current role can read inventory setup."
              />
            )}
          </SectionCard>

          <SectionCard
            title="Recent formula setup"
            description="Formula versions are shown as setup readiness only. No formula cost or production quantity rollup is calculated."
            action={
              <PageActionButton href="/components" variant="secondary">
                Open components
              </PageActionButton>
            }
          >
            {data.recentFormulaVersions.length > 0 ? (
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                    <tr>
                      {["Output", "Type", "Version", "Lines", "Status"].map(
                        (column) => (
                          <th key={column} className="px-4 py-3">
                            {column}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {data.recentFormulaVersions.map((formula) => (
                      <tr key={formula.id}>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {formula.outputItemName}
                          <p className="mt-1 text-xs text-slate-500">
                            Updated {formula.updatedAt}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formula.formulaType}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formula.versionName}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {formula.lineCount}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            tone={
                              formula.status === "Active"
                                ? "success"
                                : "warning"
                            }
                          >
                            {formula.status}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No formula versions visible"
                description="This is expected until Clean Eats component, batch and finished product formula data has been entered."
              />
            )}
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Setup quick links"
            description="Open the setup areas that production planning will depend on later."
            action={<StatusBadge tone="info">Setup</StatusBadge>}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {setupLinks.map((area) => (
                <ModuleCard key={area.href} {...area} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Production workspaces"
            description="Open existing scaffold workspaces. These do not generate production orders, tasks or reports yet."
            action={<StatusBadge tone="neutral">Scaffold</StatusBadge>}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {productionLinks.map((area) => (
                <ModuleCard key={area.href} {...area} />
              ))}
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
