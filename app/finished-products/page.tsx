import { createFinishedProductFormulaAction } from "@/app/finished-products/actions";
import { AppShell } from "@/components/app-shell";
import { SampleDataTable } from "@/components/products/sample-data-table";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getFinishedProductFormulaListData } from "@/lib/finished-product-formula-builder-data";

type PageProps = {
  searchParams: Promise<{
    create?: string;
  }>;
};

function getCreateMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<string, string> = {
    created: "Finished product formula created.",
    missing_name: "Enter a finished product name.",
    invalid_quantity: "Enter a positive output quantity.",
    invalid_unit: "Enter an output unit.",
    active_conflict: "This finished product already has an active formula.",
    duplicate: "This finished product already has a formula. Open it to edit the formula.",
    error: "The finished product formula could not be saved.",
  };

  return messages[status] ?? "The finished product formula action finished.";
}

export default async function FinishedProductsPage({ searchParams }: PageProps) {
  const [data, params] = await Promise.all([
    getFinishedProductFormulaListData(),
    searchParams,
  ]);
  const createMessage = getCreateMessage(params.create);
  const rows = data.finishedProducts.map((finishedProduct) => ({
    "Finished product": {
      label: finishedProduct.displayName,
      href: `/finished-products/${finishedProduct.id}`,
    },
    Status: finishedProduct.status,
    Version: finishedProduct.versionName,
    Output: finishedProduct.outputQuantity,
    Lines: String(finishedProduct.lineCount),
    "Cost readiness": finishedProduct.costReadiness,
    "Estimated cost": finishedProduct.estimatedCost,
    "Margin readiness": finishedProduct.marginReadiness,
    Updated: finishedProduct.lastUpdated,
    Action: {
      label: data.canManageFormulas ? "Build" : "View",
      href: `/finished-products/${finishedProduct.id}`,
    },
  }));

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Finished products"
            value={String(data.summary.totalFinishedProducts)}
            helperText="Tenant finished product internal items."
            badge="Real data"
            tone="success"
            icon="FP"
          />
          <StatCard
            label="With formula lines"
            value={String(data.summary.formulasWithLines)}
            helperText="Finished products with at least one active formula line."
            badge="BOM"
            tone={data.summary.formulasWithLines > 0 ? "info" : "neutral"}
            icon="LN"
          />
          <StatCard
            label="Cost ready"
            value={String(data.summary.costReadyFormulas)}
            helperText="Finished product formulas with safe cost sources and exact units."
            badge="Costing"
            tone={data.summary.costReadyFormulas > 0 ? "success" : "warning"}
            icon="$"
          />
          <StatCard
            label="Margin ready"
            value={String(data.summary.marginReadyFormulas)}
            helperText="Blocked until sell price storage and margin rules exist."
            badge="Pending"
            tone="warning"
            icon="%"
          />
        </section>

        {createMessage ? (
          <div className="rounded-md border border-[color:var(--tenant-primary-border)] bg-[var(--tenant-primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--tenant-primary)]">
            {createMessage}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionCard
            title="Finished product formula builder"
            description="Manual finished product formulas use components, ingredients and packaging internal items as inputs."
            action={
              data.canManageFormulas ? (
                <StatusBadge tone="success">Manage enabled</StatusBadge>
              ) : (
                <StatusBadge tone="info">Read only</StatusBadge>
              )
            }
          >
            {data.finishedProducts.length === 0 ? (
              <EmptyState
                title="No finished product formulas yet"
                description="Create the first finished product formula manually. Lines can reference tenant-scoped components, ingredients and packaging items."
              />
            ) : (
              <SampleDataTable
                columns={[
                  "Finished product",
                  "Status",
                  "Version",
                  "Output",
                  "Lines",
                  "Cost readiness",
                  "Estimated cost",
                  "Margin readiness",
                  "Updated",
                  "Action",
                ]}
                rows={rows}
                badgeColumns={["Status", "Cost readiness", "Margin readiness"]}
                emptyMessage="No finished product formulas are visible yet."
              />
            )}
          </SectionCard>

          <SectionCard
            title="New Finished Product Formula"
            description="Create a finished product and draft formula header. Lines are added on the detail page."
            action={
              data.canManageFormulas ? (
                <StatusBadge tone="success">formulas.manage</StatusBadge>
              ) : (
                <StatusBadge tone="neutral">Locked</StatusBadge>
              )
            }
          >
            {data.canManageFormulas ? (
              <form action={createFinishedProductFormulaAction} className="space-y-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Finished product name
                  </span>
                  <input
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                    name="display_name"
                    placeholder="Naked Chicken"
                    required
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Output quantity
                    </span>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                      defaultValue="1"
                      min="0.001"
                      name="output_quantity"
                      required
                      step="0.001"
                      type="number"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Output unit
                    </span>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                      defaultValue="each"
                      name="output_unit"
                      required
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Status
                  </span>
                  <select
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
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
                    placeholder="Staff notes, pack format, or formula review context"
                  />
                </label>
                <button
                  className="inline-flex w-full items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
                  type="submit"
                >
                  Create finished product formula
                </button>
              </form>
            ) : (
              <EmptyState
                title="Finished product formula editing is restricted"
                description="You can view finished product formula data, but creating or editing formulas requires formulas.manage."
              />
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Margin readiness"
          description="Meal margin reporting stays conservative until pricing and margin rules exist."
        >
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-4">
            <p className="text-sm font-semibold text-amber-950">
              Margin pending sell price storage
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              Finished product formulas can become cost-ready here, but margin is
              still blocked until reliable sell price storage, pack size/tax
              handling and margin formulas are agreed.
            </p>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
