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
import { getCostingsDashboardData } from "@/lib/costings-dashboard-data";

const quickLinks = [
  {
    title: "Ingredient Costs",
    description: "Review current approved supplier prices for ingredients.",
    href: "/ingredient-costs",
    eyebrow: "Costings",
  },
  {
    title: "Packaging Costs",
    description: "Review approved supplier prices for packaging items.",
    href: "/packaging-costs",
    eyebrow: "Costings",
  },
  {
    title: "Component Costs",
    description: "Review component formula readiness before rollups exist.",
    href: "/component-costs",
    eyebrow: "Costings",
  },
  {
    title: "Meal Margins",
    description: "Preview margin workspace structure without live calculations.",
    href: "/meal-margins",
    eyebrow: "Future",
  },
  {
    title: "Price History",
    description: "Review invoice observations and approved current prices.",
    href: "/price-history",
    eyebrow: "Traceability",
  },
];

function coverageTone(value: number, total: number) {
  if (total === 0) {
    return "neutral" as const;
  }

  if (value === 0) {
    return "success" as const;
  }

  return "warning" as const;
}

function RecentPriceTable({
  title,
  rows,
  type,
}: {
  title: string;
  rows: {
    id: string;
    itemName: string;
    supplierName: string;
    price: string;
    unit: string;
    observedDate?: string;
    effectiveDate?: string;
    decision?: string;
    status?: string;
  }[];
  type: "observation" | "approved";
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title={`No ${title.toLowerCase()} yet`}
        description="Use Tools -> Supplier Invoice Intake to review supplier invoices and approve current prices."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
          <tr>
            {["Item", "Supplier", "Price", "Unit", "Date", "Status"].map(
              (column) => (
                <th key={column} className="px-4 py-3">
                  {column}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3 font-semibold text-slate-900">
                {row.itemName}
              </td>
              <td className="px-4 py-3 text-slate-600">{row.supplierName}</td>
              <td className="px-4 py-3 font-semibold text-slate-900">
                {row.price}
              </td>
              <td className="px-4 py-3 text-slate-600">{row.unit}</td>
              <td className="px-4 py-3 text-slate-600">
                {type === "observation" ? row.observedDate : row.effectiveDate}
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  tone={
                    type === "approved" || row.decision === "Update Current Price"
                      ? "success"
                      : "neutral"
                  }
                >
                  {type === "observation"
                    ? row.decision ?? "Not reviewed"
                    : row.status ?? "Current"}
                </StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function CostingOverviewPage() {
  const data = await getCostingsDashboardData();

  return (
    <AppShell>
      <PageHeader
        title="Costings"
        description="Review supplier price coverage, approved costs and costing readiness for Clean Eats products."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone={data.canManagePrices ? "success" : "info"}>
            {data.canManagePrices ? "Price management available" : "Read only"}
          </StatusBadge>
          <StatusBadge tone="neutral">No costing engine yet</StatusBadge>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Approved prices"
            value={String(data.counts.approvedSupplierPriceCount)}
            helperText="Current approved supplier prices available to cost review."
            badge="Current"
            tone="success"
            icon="$"
          />
          <StatCard
            label="Price observations"
            value={String(data.counts.priceObservationCount)}
            helperText="Recent invoice-sourced price observations retained for traceability."
            badge="Invoice"
            tone="info"
            icon="OB"
          />
          <StatCard
            label="Items with prices"
            value={String(data.counts.internalItemsWithApprovedPriceCount)}
            helperText={`${data.counts.priceableInternalItemCount} priceable internal item(s) checked.`}
            badge="Coverage"
            tone="success"
            icon="IN"
          />
          <StatCard
            label="Missing prices"
            value={String(data.counts.internalItemsWithoutApprovedPriceCount)}
            helperText="Ingredients, packaging and other priceable items without a current approved price."
            badge="Review"
            tone={
              data.counts.internalItemsWithoutApprovedPriceCount > 0
                ? "warning"
                : "success"
            }
            icon="!"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <SectionCard
            title="Price coverage"
            description="Current approved supplier price coverage by internal item type."
            action={<StatusBadge tone="info">Real tenant data</StatusBadge>}
          >
            {data.coverageByItemType.length > 0 ? (
              <div className="space-y-3">
                {data.coverageByItemType.map((item) => (
                  <AlertCard
                    key={item.key}
                    title={item.label}
                    description={`${item.withApprovedPrice} of ${item.total} item(s) have a current approved supplier price.`}
                    meta={`${item.missingApprovedPrice} missing`}
                    tone={coverageTone(item.missingApprovedPrice, item.total)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No priceable internal items yet"
                description="Ingredients, packaging, consumables or equipment will appear here once they exist for the tenant."
              />
            )}
          </SectionCard>

          <SectionCard
            title="Attention needed"
            description="Price readiness gaps that should be reviewed before formulas and meal margins are trusted."
            action={<StatusBadge tone="warning">Readiness only</StatusBadge>}
          >
            <div className="space-y-3">
              <AlertCard
                title="Internal items missing approved price"
                description="Priceable internal catalogue items without a current approved supplier price."
                meta={String(data.counts.internalItemsWithoutApprovedPriceCount)}
                tone={
                  data.counts.internalItemsWithoutApprovedPriceCount > 0
                    ? "warning"
                    : "success"
                }
              />
              <AlertCard
                title="Supplier items without current price"
                description="Supplier catalogue items that do not currently have an approved current price."
                meta={String(data.counts.supplierItemsWithoutApprovedPriceCount)}
                tone={
                  data.counts.supplierItemsWithoutApprovedPriceCount > 0
                    ? "warning"
                    : "success"
                }
              />
              <AlertCard
                title="Formula inputs missing approved prices"
                description="Distinct formula input items without current approved supplier price coverage."
                meta={String(data.counts.formulaInputsWithoutApprovedPriceCount)}
                tone={
                  data.counts.formulaInputsWithoutApprovedPriceCount > 0
                    ? "warning"
                    : "neutral"
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Formula readiness"
            description="Formula data is visible for readiness only. No recipe, component or meal cost rollups are calculated here."
            action={<StatusBadge tone="neutral">Future engine</StatusBadge>}
          >
            <div className="space-y-3">
              <AlertCard
                title="Formula versions"
                description="Component and finished product formula records available for future rollups."
                meta={String(data.counts.formulaVersionCount)}
                tone={data.counts.formulaVersionCount > 0 ? "info" : "neutral"}
              />
              <AlertCard
                title="Formulas with no lines"
                description="Formula versions that cannot support costing until input lines are added."
                meta={String(data.counts.formulasWithNoLinesCount)}
                tone={
                  data.counts.formulasWithNoLinesCount > 0
                    ? "warning"
                    : "success"
                }
              />
              <div className="rounded-md border border-slate-200 bg-slate-50/70 px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">
                  Formula costing is not active yet
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Formula costing will become available once component and
                  finished product formulas are entered and a reviewed rollup
                  engine is built.
                </p>
              </div>
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard
            title="Items missing approved price"
            description="A short sample of priceable internal items that need current supplier price coverage."
            action={
              <PageActionButton href="/ingredient-costs" variant="secondary">
                Review ingredient costs
              </PageActionButton>
            }
          >
            {data.missingApprovedPriceItems.length > 0 ? (
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                    <tr>
                      {["Item", "Type", "Base unit", "Status"].map((column) => (
                        <th key={column} className="px-4 py-3">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {data.missingApprovedPriceItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <Link
                            href={`/internal-items/${item.id}`}
                            className="font-semibold text-clean-green-700 hover:text-clean-green-900"
                          >
                            {item.displayName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.itemType}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.baseUnit}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone="warning">{item.status}</StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No missing approved prices"
                description="Every current priceable internal item has an approved supplier price."
              />
            )}
          </SectionCard>

          <SectionCard
            title="Recent approved prices"
            description="Current approved supplier prices created through reviewed supplier invoice workflows."
            action={<StatusBadge tone="success">Current prices</StatusBadge>}
          >
            <RecentPriceTable
              title="Approved prices"
              rows={data.recentApprovedPrices}
              type="approved"
            />
          </SectionCard>
        </section>

        <SectionCard
          title="Recent invoice price observations"
          description="Invoice-sourced observations are retained for traceability and review. They do not automatically update costs unless committed as current prices."
          action={<PageActionButton href="/price-history" variant="secondary">Open price history</PageActionButton>}
        >
          <RecentPriceTable
            title="Price observations"
            rows={data.recentPriceObservations}
            type="observation"
          />
        </SectionCard>

        <SectionCard
          title="Costings workspaces"
          description="Open existing read-only Costings views. These routes remain separate from any future costing engine."
          action={<StatusBadge tone="info">Quick links</StatusBadge>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quickLinks.map((area) => (
              <ModuleCard key={area.href} {...area} />
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
