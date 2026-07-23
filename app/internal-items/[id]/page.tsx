import Link from "next/link";
import { notFound } from "next/navigation";

import { updateInternalItemAction } from "@/app/internal-items/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState, PageActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { getInternalItemDetailForCurrentOrganisation } from "@/lib/products-data";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    item?: string;
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

  if (normalisedValue.includes("inactive")) {
    return "warning" as const;
  }

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

function messageForItem(status?: string) {
  if (status === "created") {
    return "Internal item created.";
  }

  if (status === "updated") {
    return "Internal item details updated.";
  }

  if (status === "duplicate") {
    return "An internal item with that name and type already exists for this organisation.";
  }

  if (status === "missing_name") {
    return "Internal item name is required.";
  }

  if (status === "not_found") {
    return "Internal item was not found for this organisation.";
  }

  if (status === "error") {
    return "Internal item could not be saved. Check the details and try again.";
  }

  return null;
}

function InternalItemEditForm({
  item,
}: {
  item: {
    id: string;
    displayName: string;
    itemType: string;
    baseUnit: string | null;
    status: string;
    notes: string | null;
  };
}) {
  return (
    <form action={updateInternalItemAction} className="space-y-4">
      <input type="hidden" name="item_id" value={item.id} />
      <label className="block">
        <span className="text-xs font-semibold uppercase text-slate-500">
          Internal item name
        </span>
        <input
          name="display_name"
          required
          defaultValue={item.displayName}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Item type
          </span>
          <select
            name="item_type"
            defaultValue={item.itemType}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
          >
            <option value="ingredient">Ingredient</option>
            <option value="packaging">Packaging</option>
            <option value="consumable">Consumable</option>
            <option value="equipment">Equipment</option>
            <option value="non_stock_charge">Non-stock charge</option>
            <option value="component">Component</option>
            <option value="finished_product">Finished product</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Base unit
          </span>
          <input
            name="base_unit"
            defaultValue={item.baseUnit ?? ""}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-semibold uppercase text-slate-500">
          Status
        </span>
        <select
          name="status"
          defaultValue={item.status === "inactive" ? "inactive" : "active"}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase text-slate-500">
          Notes
        </span>
        <textarea
          name="notes"
          rows={4}
          defaultValue={item.notes ?? ""}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md bg-clean-green-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-clean-green-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clean-green-700"
      >
        Save internal item
      </button>
    </form>
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

export default async function InternalItemDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
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
  const itemMessage = messageForItem(query.item);

  return (
    <AppShell>
      <PageHeader
        title={detail.item.displayName}
        description="Internal item detail showing basic item management, supplier purchasing options and price traceability."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        {itemMessage ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-clean-green-900">
            {itemMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <PageActionButton href={backHref} variant="secondary">
            Back to list
          </PageActionButton>
          <StatusBadge tone={statusTone(detail.item.status)}>
            {detail.item.status}
          </StatusBadge>
          <StatusBadge tone="info">{detail.item.itemType}</StatusBadge>
          <StatusBadge tone={detail.canManageInternalItems ? "success" : "info"}>
            {detail.canManageInternalItems ? "Manage enabled" : "Read only"}
          </StatusBadge>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
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
            title="Edit internal item"
            description={
              detail.canManageInternalItems
                ? "Update basic internal item fields only. Supplier mappings, prices and formula lines are managed separately."
                : "Internal item editing is restricted for this role."
            }
            action={
              <StatusBadge tone={detail.canManageInternalItems ? "success" : "warning"}>
                {detail.canManageInternalItems ? "supplier_items.manage" : "Read only"}
              </StatusBadge>
            }
          >
            {detail.canManageInternalItems ? (
              <InternalItemEditForm item={detail.item} />
            ) : (
              <EmptyState
                title="Internal item editing is restricted"
                description="You can view this internal item, but editing basic item details requires supplier_items.manage."
              />
            )}
          </SectionCard>
        </section>

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
          title="Formula usage"
          description="Lightweight references where this item is currently visible in formula records."
          action={
            formulaHref ? (
              <PageActionButton href={formulaHref} variant="secondary">
                View formula
              </PageActionButton>
            ) : null
          }
        >
          {detail.formulaUsage.length > 0 ? (
            <ReadOnlyTable
              columns={["Usage", "Status"]}
              rows={detail.formulaUsage.map((usage) => ({
                Usage: usage.href
                  ? {
                      label: usage.usageType,
                      href: usage.href,
                    }
                  : usage.usageType,
                Status: usage.status,
              }))}
              badgeColumns={["Status"]}
              emptyMessage="No formula references are visible for this internal item yet."
            />
          ) : (
            <EmptyState
              title={futureUsageTitle}
              description={futureUsageDescription}
            />
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
