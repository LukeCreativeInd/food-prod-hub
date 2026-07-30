import type { Metadata } from "next";
import Link from "next/link";

import { createFinishedProductFormulaAction } from "@/app/finished-products/actions";
import { AppShell } from "@/components/app-shell";
import { SampleDataTable } from "@/components/products/sample-data-table";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getFinishedProductFormulaListData } from "@/lib/finished-product-formula-builder-data";

export const metadata: Metadata = {
  title: "Finished Products - EveryBatch",
};

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
    Formula: finishedProduct.status,
    Output: finishedProduct.outputQuantity,
    Lines: String(finishedProduct.lineCount),
    Cost: finishedProduct.costReadiness,
    "Sell price": finishedProduct.sellPriceReadiness,
    Margin: finishedProduct.marginReadiness,
    "Estimated cost": finishedProduct.estimatedCost,
    Updated: finishedProduct.lastUpdated,
    Action: {
      label: data.canManageFormulas ? "Manage" : "View",
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
            helperText="Finished products with at least one visible formula line."
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
            helperText="Finished products with cost-ready formulas and active current sell prices."
            badge="Readiness"
            tone={data.summary.marginReadyFormulas > 0 ? "success" : "warning"}
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
            title="Finished products"
            description="Real tenant finished products. Formulas define inputs, sell prices unlock margin previews, and production readiness remains future."
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
                title="No finished products yet"
                description="Create the first finished product and draft formula header. Finished products are sellable/output items; formulas, sell prices and margins are completed after the item exists."
                action={
                  data.canManageFormulas ? (
                    <Link
                      className="inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
                      href="#new-finished-product"
                    >
                      Add finished product
                    </Link>
                  ) : null
                }
              />
            ) : (
              <SampleDataTable
                columns={[
                  "Finished product",
                  "Formula",
                  "Output",
                  "Lines",
                  "Cost",
                  "Sell price",
                  "Margin",
                  "Estimated cost",
                  "Updated",
                  "Action",
                ]}
                rows={rows}
                badgeColumns={["Formula", "Cost", "Sell price", "Margin"]}
                emptyMessage="No finished products are visible yet."
              />
            )}
          </SectionCard>

          <SectionCard
            title="Add finished product"
            description="Create a sellable finished product internal item and its first draft formula header. Formula lines are added on the detail page."
            action={
              data.canManageFormulas ? (
                <StatusBadge tone="success">formulas.manage</StatusBadge>
              ) : (
                <StatusBadge tone="neutral">Locked</StatusBadge>
              )
            }
          >
            {data.canManageFormulas ? (
              <form
                action={createFinishedProductFormulaAction}
                className="space-y-4"
                id="new-finished-product"
              >
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Finished product name
                  </span>
                  <input
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                    name="display_name"
                    placeholder="Naked Chicken 100g"
                    required
                  />
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    This becomes a canonical internal item with item type finished_product.
                  </span>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Selling/output quantity
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
                      Selling/output unit
                    </span>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                      defaultValue="each"
                      name="output_unit"
                      required
                    />
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Keep this aligned with how the product is sold or planned.
                    </span>
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
                  Add finished product
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
          title="Next steps after product setup"
          description="Finished product data entry connects the formula builder, sell prices and margin review."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Build formula",
                body: "Add component, ingredient and packaging lines so the product can become cost-ready.",
                href: "/finished-products",
                cta: "Review products",
              },
              {
                title: "Add sell price",
                body: "Record an active current sell price for the product/channel before margin is counted as ready.",
                href: "/sell-prices",
                cta: "Open sell prices",
              },
              {
                title: "Review margin",
                body: "Meal Margins stays conservative and only previews margin when formula costs and sell prices are ready.",
                href: "/meal-margins",
                cta: "Open meal margins",
              },
            ].map((item) => (
              <div
                className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4"
                key={item.title}
              >
                <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                <Link
                  className="mt-4 inline-flex text-sm font-semibold text-[var(--tenant-primary)] hover:underline"
                  href={item.href}
                >
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
