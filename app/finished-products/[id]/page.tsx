import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getFinishedProductFormulaDetailForCurrentOrganisation } from "@/lib/formula-data";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type DetailRow = {
  label: string;
  value: string;
};

type TableCell =
  | string
  | {
      label: string;
      href: string;
    };

function statusTone(value: string) {
  const normalisedValue = value.toLowerCase();

  if (
    normalisedValue.includes("missing") ||
    normalisedValue.includes("draft") ||
    normalisedValue.includes("review") ||
    normalisedValue.includes("not recorded")
  ) {
    return "warning" as const;
  }

  if (normalisedValue.includes("active") || normalisedValue.includes("current")) {
    return "success" as const;
  }

  if (
    normalisedValue.includes("finished") ||
    normalisedValue.includes("component") ||
    normalisedValue.includes("ingredient") ||
    normalisedValue.includes("packaging") ||
    normalisedValue.includes("read only")
  ) {
    return "info" as const;
  }

  return "neutral" as const;
}

function DetailGrid({ rows }: { rows: DetailRow[] }) {
  return (
    <dl className="grid gap-4 md:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="rounded-md border border-slate-200 bg-slate-50/60 px-4 py-3">
          <dt className="text-xs font-semibold uppercase text-slate-500">
            {row.label}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ReadOnlyTable({
  columns,
  rows,
  badgeColumns = [],
  emptyMessage,
}: {
  columns: string[];
  rows: Record<string, TableCell>[];
  badgeColumns?: string[];
  emptyMessage: string;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={`${index}-${String(row[columns[0]] ?? "row")}`}>
                {columns.map((column, columnIndex) => {
                  const value = row[column];
                  const label = typeof value === "string" ? value : value?.label ?? "";

                  return (
                    <td
                      key={column}
                      className={
                        columnIndex === 0
                          ? "px-4 py-3 font-semibold text-slate-900"
                          : "px-4 py-3 text-slate-600"
                      }
                    >
                      {badgeColumns.includes(column) ? (
                        <StatusBadge tone={statusTone(label)}>{label}</StatusBadge>
                      ) : typeof value === "object" ? (
                        <Link
                          className="font-semibold text-clean-green-700 hover:text-clean-green-900"
                          href={value.href}
                        >
                          {value.label}
                        </Link>
                      ) : (
                        label
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function FinishedProductFormulaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = await getFinishedProductFormulaDetailForCurrentOrganisation(id);

  if (!detail) {
    notFound();
  }

  return (
    <AppShell>
      <PageHeader
        title={detail.finishedProduct.displayName}
        description="Read-only finished product formula detail showing per-selling-unit inputs and future costing/production placeholders."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <PageActionButton href="/finished-products" variant="secondary">
            Back to finished products
          </PageActionButton>
          <StatusBadge tone={statusTone(detail.selectedVersion?.status ?? "Formula missing")}>
            {detail.selectedVersion?.status ?? "Formula missing"}
          </StatusBadge>
          <StatusBadge tone="info">finished_product</StatusBadge>
          <StatusBadge tone="info">Read only</StatusBadge>
        </div>

        <SectionCard
          title="Finished product summary"
          description="The output item and selected active/draft formula version. Formula data is read-only in this first scaffold."
        >
          <DetailGrid
            rows={[
              { label: "Output item", value: detail.finishedProduct.displayName },
              { label: "Item type", value: detail.finishedProduct.itemType },
              {
                label: "Formula type",
                value: detail.selectedVersion?.formulaType ?? "Not captured",
              },
              {
                label: "Selected version",
                value: detail.selectedVersion
                  ? `${detail.selectedVersion.versionName} (${detail.selectedVersion.versionNumber})`
                  : "Not captured",
              },
              {
                label: "Output quantity",
                value: detail.selectedVersion?.outputQuantity ?? "Not captured",
              },
              {
                label: "Expected yield",
                value: detail.selectedVersion?.expectedYield ?? "Not captured",
              },
              {
                label: "Effective from",
                value: detail.selectedVersion?.effectiveFrom ?? "Not captured",
              },
              {
                label: "Notes",
                value: detail.selectedVersion?.notes ?? detail.finishedProduct.notes,
              },
            ]}
          />
        </SectionCard>

        {detail.selectedVersion ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Ingredients"
                value={String(detail.composition.ingredients)}
                helperText="Raw ingredient inputs in the visible formula."
                badge="Inputs"
                tone="info"
                icon="IN"
              />
              <StatCard
                label="Components"
                value={String(detail.composition.components)}
                helperText="Made/batch component inputs reused by this product."
                badge="Inputs"
                tone="info"
                icon="CP"
              />
              <StatCard
                label="Packaging"
                value={String(detail.composition.packaging)}
                helperText="Packaging inputs such as trays, labels or sleeves."
                badge="Inputs"
                tone="info"
                icon="PK"
              />
              <StatCard
                label="Other"
                value={String(detail.composition.other)}
                helperText="Other internal item input types visible in the formula."
                badge="Review"
                tone={detail.composition.other > 0 ? "warning" : "neutral"}
                icon="OT"
              />
            </section>

            <SectionCard
              title="Formula lines"
              description="Inputs use canonical internal items only. Supplier descriptions remain purchasing-facing source data."
              action={
                <StatusBadge tone={statusTone(detail.selectedVersion.status)}>
                  {detail.selectedVersion.status}
                </StatusBadge>
              }
            >
              <ReadOnlyTable
                columns={[
                  "Input item",
                  "Type",
                  "Quantity per selling unit",
                  "Unit",
                  "Preparation state",
                  "Supplier/current cost hint",
                  "Notes",
                ]}
                rows={detail.lines.map((line) => ({
                  "Input item": {
                    label: line.inputItemName,
                    href: line.inputItemHref,
                  },
                  Type: line.inputItemType,
                  "Quantity per selling unit": line.quantity,
                  Unit: line.unit,
                  "Preparation state": line.preparationState,
                  "Supplier/current cost hint": line.costHint,
                  Notes: line.notes,
                }))}
                badgeColumns={["Type", "Supplier/current cost hint"]}
                emptyMessage="No formula input lines are visible for this version yet."
              />
            </SectionCard>

            <SectionCard
              title="Formula versions"
              description="Version history is visible for review, but create/edit/version activation flows are intentionally future work."
            >
              <ReadOnlyTable
                columns={[
                  "Version",
                  "Status",
                  "Output",
                  "Expected yield",
                  "Effective from",
                  "Updated",
                ]}
                rows={detail.versions.map((version) => ({
                  Version: `${version.versionName} (${version.versionNumber})`,
                  Status: version.status,
                  Output: version.outputQuantity,
                  "Expected yield": version.expectedYield,
                  "Effective from": version.effectiveFrom,
                  Updated: version.updatedAt,
                }))}
                badgeColumns={["Status"]}
                emptyMessage="No formula versions are visible for this finished product yet."
              />
            </SectionCard>
          </>
        ) : (
          <SectionCard
            title="Formula not captured"
            description="This finished product internal item exists, but no active or draft formula has been captured yet."
          >
            <EmptyState
              title="Use the staff collection template"
              description="Finished product formulas need staff operational knowledge: one selling-unit output, component inputs, direct ingredient inputs and packaging lines. No write action is available from this read-only scaffold."
            />
          </SectionCard>
        )}

        <SectionCard
          title="Costing placeholder"
          description="Finished product formula cost rollups are future work and are not calculated on this page."
        >
          <EmptyState
            title="Meal margin and unit cost not calculated yet"
            description="Approved supplier price hints may appear beside raw ingredient or packaging input lines when visible, but this page does not calculate full finished product cost, margin or inventory valuation."
          />
        </SectionCard>

        <SectionCard
          title="Production method placeholder"
          description="Production instructions remain separate from the formula/BOM layer."
        >
          <EmptyState
            title="Method and route layer comes later"
            description="Assembly steps, production areas, tablet task logging, actual production quantities and waste reporting will be designed in later production-specific work."
          />
        </SectionCard>

        <SectionCard
          title="Future usage"
          description="Meal margin, production planning and inventory traceability are planned after formula data is reviewed."
        >
          <EmptyState
            title="Downstream finished product usage coming later"
            description="Future pages can connect this formula to meal margins, production plans, stock requirements, batch traceability and sales/channel data."
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}
