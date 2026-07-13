import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState, PageActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { getInternalItemDetailForCurrentOrganisation } from "@/lib/products-data";

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
    normalisedValue.includes("restricted") ||
    normalisedValue.includes("review")
  ) {
    return "warning" as const;
  }

  if (
    normalisedValue.includes("active") ||
    normalisedValue.includes("current") ||
    normalisedValue.includes("approved") ||
    normalisedValue.includes("confirmed")
  ) {
    return "success" as const;
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

export default async function InternalItemDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = await getInternalItemDetailForCurrentOrganisation(id);

  if (!detail) {
    notFound();
  }

  const backHref =
    detail.item.itemType === "finished_product"
      ? "/finished-products"
      : detail.item.itemType === "component"
      ? "/components"
      : detail.item.itemType === "packaging"
        ? "/packaging"
        : "/ingredients";
  const futureUsageTitle =
    detail.item.itemType === "finished_product"
      ? "Finished product formula workspace"
      : detail.item.itemType === "component"
      ? "Component formula workspace"
      : detail.item.itemType === "ingredient"
        ? "Component formulas using this ingredient"
        : "Future item usage";
  const futureUsageDescription =
    detail.item.itemType === "finished_product"
      ? "This finished product can now be reviewed in the read-only formula workspace. The formula page shows active/draft versions and per-selling-unit input lines when captured."
      : detail.item.itemType === "component"
      ? "This component can now be reviewed in the read-only formula workspace. The formula page shows active/draft versions and input lines when captured."
      : detail.item.itemType === "ingredient"
        ? "Component formulas using this ingredient are coming later. Reverse formula usage is not queried in this first read-only scaffold."
        : "Component formulas, finished product formulas, production usage, inventory references and traceability links will be added later. This page only inspects reviewed internal item, supplier and price records.";
  const formulaHref =
    detail.item.itemType === "finished_product"
      ? `/finished-products/${detail.item.id}`
      : detail.item.itemType === "component"
        ? `/components/${detail.item.id}`
        : null;

  return (
    <AppShell>
      <PageHeader
        title={detail.item.displayName}
        description="Read-only internal item detail showing supplier purchasing options and price traceability."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <PageActionButton href={backHref} variant="secondary">
            Back to list
          </PageActionButton>
          <StatusBadge tone={statusTone(detail.item.status)}>
            {detail.item.status}
          </StatusBadge>
          <StatusBadge tone="info">{detail.item.itemType}</StatusBadge>
          <StatusBadge tone="info">Read only</StatusBadge>
        </div>

        <SectionCard
          title="Internal item summary"
          description="Canonical tenant item used by future recipes, costings, production and inventory."
        >
          <DetailGrid
            rows={[
              { label: "Display name", value: detail.item.displayName },
              { label: "Item type", value: detail.item.itemType },
              { label: "Base unit", value: detail.item.baseUnit ?? "Not recorded" },
              { label: "Notes", value: detail.item.notes ?? "No notes recorded" },
              { label: "Created", value: detail.item.createdAt },
              { label: "Updated", value: detail.item.updatedAt },
            ]}
          />
        </SectionCard>

        <SectionCard
          title="Supplier purchasing options"
          description="Confirmed supplier item mappings and current approved supplier prices for this internal item."
        >
          <ReadOnlyTable
            columns={[
              "Supplier",
              "Supplier code",
              "Supplier description",
              "Unit",
              "Current price",
              "Effective date",
              "Mapping status",
            ]}
            rows={detail.supplierOptions.map((option) => ({
              Supplier: {
                label: option.supplierName,
                href: option.supplierHref,
              },
              "Supplier code": option.supplierItemCode,
              "Supplier description": option.supplierDescription,
              Unit: option.purchaseUnit,
              "Current price": option.currentApprovedPrice,
              "Effective date": option.effectiveDate,
              "Mapping status": option.mappingStatus,
            }))}
            badgeColumns={["Current price", "Mapping status"]}
            emptyMessage="No supplier purchasing options have been mapped for this internal item yet."
          />
        </SectionCard>

        <SectionCard
          title="Price history"
          description="Observed invoice prices and current approved supplier prices for this internal item."
          action={
            <StatusBadge tone={detail.canViewPurchaseDocuments ? "success" : "warning"}>
              {detail.canViewPurchaseDocuments ? "Document links enabled" : "References only"}
            </StatusBadge>
          }
        >
          <ReadOnlyTable
            columns={[
              "Supplier",
              "Supplier code",
              "Observed price",
              "Approved price",
              "Unit",
              "Date",
              "Source invoice",
              "Status",
            ]}
            rows={detail.priceHistory.map((price) => ({
              Supplier: price.supplierName,
              "Supplier code": price.supplierItemCode,
              "Observed price": price.observedPrice,
              "Approved price": price.approvedPrice,
              Unit: price.unit,
              Date: price.date,
              "Source invoice": price.sourceInvoiceHref
                ? {
                    label: price.sourceInvoice,
                    href: price.sourceInvoiceHref,
                  }
                : price.sourceInvoice,
              Status: price.status,
            }))}
            badgeColumns={["Approved price", "Status"]}
            emptyMessage="No price observations or approved prices are visible for this internal item yet."
          />
        </SectionCard>

        <SectionCard
          title="Future usage"
          description="These downstream relationships are planned, but no formula or stock logic is created here."
          action={
            formulaHref ? (
              <PageActionButton href={formulaHref} variant="secondary">
                View formula
              </PageActionButton>
            ) : null
          }
        >
          <EmptyState
            title={futureUsageTitle}
            description={futureUsageDescription}
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}
