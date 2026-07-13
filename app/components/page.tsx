import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SampleDataTable } from "@/components/products/sample-data-table";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getComponentFormulaOverviewForCurrentOrganisation } from "@/lib/formula-data";

const exampleComponents = [
  "Italian Herb Chicken Breast",
  "Cooked Rice",
  "Bolognese Sauce",
  "Mashed Potato",
];

export default async function ComponentsPage() {
  const overview = await getComponentFormulaOverviewForCurrentOrganisation();

  const rows = overview.components.map((component) => ({
    "Component name": {
      label: component.displayName,
      href: `/components/${component.id}`,
    },
    "Formula status": component.formulaStatus,
    Version: component.version,
    "Output quantity/unit": component.outputQuantity,
    "Input count": component.inputCount,
    "Expected yield": component.expectedYield,
    "Last updated": component.lastUpdated,
    Action: {
      label: "View",
      href: `/components/${component.id}`,
    },
  }));

  return (
    <AppShell>
      <PageHeader
        title="Components"
        description="Made/batch items built from internal ingredients, packaging or other components."
      />

      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Components found"
            value={String(overview.summary.componentCount)}
            helperText="Canonical internal items with item type component."
            badge="Real data"
            tone="success"
            icon="CP"
          />
          <StatCard
            label="Active formulas"
            value={String(overview.summary.activeFormulaCount)}
            helperText="Active component formula versions visible to this user."
            badge="Read only"
            tone="info"
            icon="AF"
          />
          <StatCard
            label="Draft formulas"
            value={String(overview.summary.draftFormulaCount)}
            helperText="Draft versions captured for review before activation."
            badge="Review"
            tone="warning"
            icon="DF"
          />
          <StatCard
            label="Inputs requiring review"
            value={String(overview.summary.inputsRequiringReviewCount)}
            helperText="Components without an active formula or visible input lines."
            badge="Placeholder"
            tone="neutral"
            icon="IR"
          />
        </section>

        <SectionCard
          title="Formula / BOM vs Method / Route"
          description="The first formula screen only covers what goes into a made component. Production instructions stay separate."
          action={<StatusBadge tone="info">Read only</StatusBadge>}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-slate-950">Formula / BOM</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Captures the output item, standard output quantity, expected yield and
                input item quantities. This is the future foundation for costing and
                production material requirements.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-slate-950">Method / Route</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Captures the operational process, work area, sequence and task logging.
                That route/method layer is intentionally left for a later reviewed build.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Component formulas"
          description="Read-only component formula visibility from internal items and formula tables. Create/edit workflows are intentionally not included yet."
        >
          {overview.components.length === 0 ? (
            <div className="space-y-5">
              <EmptyState
                title="No component formulas captured yet"
                description="Components will appear here after staff data import or reviewed entry creates component internal items and formula versions. Invoice intake can create raw ingredients and supplier price records, but formulas need staff operational knowledge."
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
                "Component name",
                "Formula status",
                "Version",
                "Output quantity/unit",
                "Input count",
                "Expected yield",
                "Last updated",
                "Action",
              ]}
              rows={rows}
              badgeColumns={["Formula status"]}
              emptyMessage="No component formula rows are visible yet."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Staff collection reminder"
          description="Formula data needs staff confirmation before it becomes trusted operational data."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">One row per input</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Staff templates should capture each ingredient, packaging item or
                component input as its own line with quantity and unit.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">Shared components once</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Batch items like cooked rice or sauces should be captured once, then reused
                by finished product formulas later.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">No method fields yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Process steps, production areas and tablet task logging belong to a future
                method/route layer, not this read-only formula scaffold.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
