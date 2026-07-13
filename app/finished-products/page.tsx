import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SampleDataTable } from "@/components/products/sample-data-table";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getFinishedProductFormulaOverviewForCurrentOrganisation } from "@/lib/formula-data";

const exampleFinishedProductFormulas = [
  {
    name: "Moroccan Chicken",
    helper: "Visual example of a per-selling-unit formula shape.",
    inputs: [
      "protein component placeholder",
      "side component placeholder",
      "sauce component placeholder",
      "tray",
      "sleeve/label",
    ],
  },
  {
    name: "Naked Chicken",
    helper: "Visual example only; quantities and inputs need staff confirmation.",
    inputs: [
      "Italian Herb Chicken Breast, 100g example only / confirm",
      "side/sauce/garnish placeholder",
      "tray",
      "film/lid",
      "sleeve/label",
    ],
  },
];

export default async function FinishedProductsPage() {
  const overview = await getFinishedProductFormulaOverviewForCurrentOrganisation();

  const rows = overview.finishedProducts.map((finishedProduct) => ({
    "Finished product name": {
      label: finishedProduct.displayName,
      href: `/finished-products/${finishedProduct.id}`,
    },
    "Formula status": finishedProduct.formulaStatus,
    Version: finishedProduct.version,
    "Output quantity/unit": finishedProduct.outputQuantity,
    "Input count": finishedProduct.inputCount,
    "Expected yield": finishedProduct.expectedYield,
    "Last updated": finishedProduct.lastUpdated,
    Action: {
      label: "View",
      href: `/finished-products/${finishedProduct.id}`,
    },
  }));

  return (
    <AppShell>
      <PageHeader
        title="Finished Products"
        description="Sellable meals/products assembled from ingredients, components and packaging."
      />

      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Finished products found"
            value={String(overview.summary.finishedProductCount)}
            helperText="Canonical internal items with item type finished_product."
            badge="Real data"
            tone="success"
            icon="FP"
          />
          <StatCard
            label="Active formulas"
            value={String(overview.summary.activeFormulaCount)}
            helperText="Active finished product formula versions visible to this user."
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
            helperText="Finished products without an active formula or visible input lines."
            badge="Placeholder"
            tone="neutral"
            icon="IR"
          />
        </section>

        <SectionCard
          title="Finished product formulas"
          description="A finished product formula defines what goes into one selling unit. Component formulas define made items used inside finished products."
          action={<StatusBadge tone="info">Read only</StatusBadge>}
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-slate-950">Selling unit formula</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Captures the ingredients, components and packaging used for one meal,
                tray, SKU or other sellable output.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-slate-950">Component inputs</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Made items such as cooked rice, sauces or prepared proteins should be
                captured once in Components, then reused here.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-slate-950">Method / route later</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Production steps, work areas, tablet tasks and actual production reports
                stay separate from this formula/BOM layer.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Finished product formula list"
          description="Read-only finished product formula visibility from internal items and formula tables. Create/edit workflows are intentionally not included yet."
        >
          {overview.finishedProducts.length === 0 ? (
            <div className="space-y-5">
              <EmptyState
                title="No finished product formulas captured yet"
                description="Finished products will appear here after staff formula data is imported or entered. Invoice intake has created raw ingredients and supplier prices, but finished product formulas require staff operational knowledge."
              />
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Example only — not saved data
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      These cards show the kind of formula structure staff will confirm.
                      They are visual examples only and are not database records.
                    </p>
                  </div>
                  <StatusBadge tone="neutral">Visual guide</StatusBadge>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {exampleFinishedProductFormulas.map((finishedProduct) => (
                    <article
                      key={finishedProduct.name}
                      className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {finishedProduct.name}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {finishedProduct.helper}
                          </p>
                        </div>
                        <StatusBadge tone="neutral">Example only</StatusBadge>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {finishedProduct.inputs.map((input) => (
                          <li
                            key={input}
                            className="flex items-start gap-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                          >
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-clean-green-600" />
                            <span>{input}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <SampleDataTable
              columns={[
                "Finished product name",
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
              emptyMessage="No finished product formula rows are visible yet."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Staff collection reminder"
          description="Finished product formula data needs staff confirmation before it becomes trusted operational data."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">Templates exist</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Finished product formula templates were prepared for staff collection.
                They should be completed before any import or write flow is built.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">One row per input</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Each ingredient, component or packaging item should be captured as its own
                line with quantity and unit.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">Include packaging</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Trays, labels, sleeves and other packaging should be included where known
                so future costing and production planning have the full BOM.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
