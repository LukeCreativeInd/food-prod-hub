import { createComponentFormulaAction } from "@/app/components/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SampleDataTable } from "@/components/products/sample-data-table";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getComponentFormulaListData } from "@/lib/component-formula-builder-data";

const exampleComponents = [
  "Bolognese Sauce",
  "Italian Herb Chicken Breast",
  "Cooked Rice",
  "Moroccan Chicken component",
];

type SearchParams = Promise<{
  create?: string;
}>;

function getCreateMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<string, string> = {
    created: "Component formula created.",
    missing_name: "Enter a component formula name.",
    invalid_quantity: "Enter a positive batch yield quantity.",
    invalid_unit: "Enter a batch yield unit.",
    active_conflict: "This component already has an active formula.",
    error: "The component formula could not be saved.",
  };

  return messages[status] ?? "The component formula action finished.";
}

export default async function ComponentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [data, params] = await Promise.all([
    getComponentFormulaListData(),
    searchParams,
  ]);
  const createMessage = getCreateMessage(params.create);

  const rows = data.components.map((component) => ({
    "Formula name": {
      label: component.displayName,
      href: `/components/${component.id}`,
    },
    Status: component.status,
    Version: component.versionName,
    "Batch yield": component.outputQuantity,
    Lines: String(component.lineCount),
    "Cost readiness": component.costReadiness,
    "Estimated cost": component.estimatedCost,
    "Last updated": component.lastUpdated,
    Action: {
      label: data.canManageFormulas ? "Build" : "View",
      href: `/components/${component.id}`,
    },
  }));

  return (
    <AppShell>
      <PageHeader
        title="Components"
        description="Create and maintain batch formulas for made components before production methods and route planning are added."
      />

      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Components"
            value={String(data.summary.totalComponents)}
            helperText="Component internal items visible in this tenant."
            badge="Real data"
            tone="success"
            icon="CP"
          />
          <StatCard
            label="Active formulas"
            value={String(data.summary.activeFormulas)}
            helperText="Current formulas selected for operational review."
            badge="Active"
            tone="success"
            icon="AF"
          />
          <StatCard
            label="Draft formulas"
            value={String(data.summary.draftFormulas)}
            helperText="Manual formulas still being reviewed."
            badge="Draft"
            tone="warning"
            icon="DF"
          />
          <StatCard
            label="With lines"
            value={String(data.summary.formulasWithLines)}
            helperText="Formulas with at least one input row."
            badge="BOM"
            tone="info"
            icon="LN"
          />
          <StatCard
            label="Cost review"
            value={String(data.summary.formulasMissingCostInputs)}
            helperText="Missing approved prices, units or formula lines."
            badge="Review"
            tone="warning"
            icon="CR"
          />
        </section>

        {createMessage ? (
          <div className="rounded-md border border-[color:var(--tenant-primary-border)] bg-[var(--tenant-primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--tenant-primary)]">
            {createMessage}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionCard
            title="Component formula builder"
            description="Manual component formulas use internal items as inputs. The current version supports header editing, line management and safe cost readiness only."
            action={
              data.canManageFormulas ? (
                <StatusBadge tone="success">Manage enabled</StatusBadge>
              ) : (
                <StatusBadge tone="info">Read only</StatusBadge>
              )
            }
          >
            {data.components.length === 0 ? (
              <div className="space-y-5">
                <EmptyState
                  title="No component formulas captured yet"
                  description="Create the first component formula manually or wait for the future workbook import review flow. Formula lines must use existing internal items."
                />
                <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/70 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Example only - not saved data
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {exampleComponents.map((component) => (
                      <StatusBadge key={component} tone="neutral">
                        {component}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <SampleDataTable
                columns={[
                  "Formula name",
                  "Status",
                  "Version",
                  "Batch yield",
                  "Lines",
                  "Cost readiness",
                  "Estimated cost",
                  "Last updated",
                  "Action",
                ]}
                rows={rows}
                badgeColumns={["Status", "Cost readiness"]}
                emptyMessage="No component formula rows are visible yet."
              />
            )}
          </SectionCard>

          <SectionCard
            title="New Component Formula"
            description="Create a draft component and formula header. Input lines are added on the detail page."
            action={
              data.canManageFormulas ? (
                <StatusBadge tone="success">formulas.manage</StatusBadge>
              ) : (
                <StatusBadge tone="neutral">Locked</StatusBadge>
              )
            }
          >
            {data.canManageFormulas ? (
              <form action={createComponentFormulaAction} className="space-y-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Formula name
                  </span>
                  <input
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                    name="display_name"
                    placeholder="Bolognese Sauce"
                    required
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Batch yield
                    </span>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                      min="0.001"
                      name="output_quantity"
                      placeholder="100"
                      required
                      step="0.001"
                      type="number"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Unit
                    </span>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                      name="output_unit"
                      placeholder="kg"
                      required
                    />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Expected yield
                    </span>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                      min="0.001"
                      name="expected_yield_quantity"
                      placeholder="Optional"
                      step="0.001"
                      type="number"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Yield unit
                    </span>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                      name="expected_yield_unit"
                      placeholder="kg"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Status
                  </span>
                  <select
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                    defaultValue="draft"
                    name="status"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Notes
                  </span>
                  <textarea
                    className="mt-1 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                    name="notes"
                    placeholder="Staff review notes, storage comments or preparation context."
                  />
                </label>
                <button
                  className="inline-flex w-full items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tenant-primary)]"
                  type="submit"
                >
                  Create component formula
                </button>
              </form>
            ) : (
              <EmptyState
                title="Create/edit controls are hidden"
                description="This user can view component formulas but does not have formulas.manage. Demo users remain read-only."
              />
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Builder boundaries"
          description="This v1 builder captures the formula/BOM only. It deliberately leaves operational workflow for later reviewed tasks."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">Internal items only</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Formula lines reference tenant internal items or existing components, not
                supplier source descriptions.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">No conversion engine</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Estimated cost appears only when line units exactly match current approved
                supplier price units.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">No method layer yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Steps, production areas, tablet logging, QA checks and stock movements stay
                out of this formula builder.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
