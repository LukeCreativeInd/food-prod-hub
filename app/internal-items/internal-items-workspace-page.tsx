import Link from "next/link";

import { createInternalItemAction } from "@/app/internal-items/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  EmptyState,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { getInternalItemPageData } from "@/lib/products-data";

type InternalItemWorkspacePageProps = {
  itemType: "ingredient" | "packaging";
  title: string;
  description: string;
  createTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  typeLabel: string;
};

function statusTone(value: string) {
  const normalisedValue = value.toLowerCase();

  if (normalisedValue.includes("inactive")) {
    return "warning" as const;
  }

  if (normalisedValue.includes("active")) {
    return "success" as const;
  }

  return "neutral" as const;
}

function messageForCreate(status?: string) {
  if (status === "missing_name") {
    return "Internal item name is required before an item can be created.";
  }

  if (status === "duplicate") {
    return "An internal item with that name and type already exists for this organisation.";
  }

  if (status === "error") {
    return "Internal item could not be created. Check the details and try again.";
  }

  return null;
}

export async function InternalItemsWorkspacePage({
  itemType,
  title,
  description,
  createTitle,
  emptyTitle,
  emptyDescription,
  typeLabel,
  searchParams,
}: InternalItemWorkspacePageProps & {
  searchParams: Promise<{ create?: string }>;
}) {
  const [{ items, canManageInternalItems }, query] = await Promise.all([
    getInternalItemPageData(itemType),
    searchParams,
  ]);
  const mappedCount = items.reduce(
    (total, item) => total + item.mappedSupplierItemCount,
    0,
  );
  const approvedPriceCount = items.reduce(
    (total, item) => total + item.approvedPriceCount,
    0,
  );
  const formulaUsageCount = items.reduce(
    (total, item) => total + item.formulaUsageCount,
    0,
  );
  const createMessage = messageForCreate(query.create);

  return (
    <AppShell>
      <PageHeader title={title} description={description} />
      <div className="space-y-6 px-5 py-6 md:px-8">
        {createMessage ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            {createMessage}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={title}
            value={String(items.length)}
            helperText={`Canonical internal ${typeLabel.toLowerCase()} records for this tenant.`}
            badge={items.length > 0 ? "Live" : "Empty"}
            tone={items.length > 0 ? "success" : "neutral"}
            icon={itemType === "ingredient" ? "IN" : "PK"}
          />
          <StatCard
            label="Mapped supplier items"
            value={String(mappedCount)}
            helperText="Confirmed supplier item mappings linked to these records."
            badge="Mappings"
            tone={mappedCount > 0 ? "info" : "neutral"}
            icon="MP"
          />
          <StatCard
            label="Approved prices"
            value={String(approvedPriceCount)}
            helperText="Current approved supplier prices linked to these records."
            badge="Prices"
            tone={approvedPriceCount > 0 ? "success" : "neutral"}
            icon="$"
          />
          <StatCard
            label="Formula usage"
            value={String(formulaUsageCount)}
            helperText="Formula output/input references visible for these records."
            badge="Formula"
            tone={formulaUsageCount > 0 ? "info" : "neutral"}
            icon="FX"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionCard
            title={`${typeLabel} directory`}
            description="Tenant-scoped internal item records from manual entry and reviewed Supplier Invoice Intake commits."
            action={
              <StatusBadge tone={canManageInternalItems ? "success" : "info"}>
                {canManageInternalItems ? "Manage enabled" : "Read only"}
              </StatusBadge>
            }
          >
            {items.length > 0 ? (
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                    <tr>
                      {[
                        "Item",
                        "Base unit",
                        "Mapped suppliers",
                        "Approved prices",
                        "Formula usage",
                        "Updated",
                        "Status",
                      ].map((column) => (
                        <th key={column} className="px-4 py-3">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <Link
                            href={`/internal-items/${item.id}`}
                            className="font-semibold text-clean-green-700 hover:text-clean-green-900"
                          >
                            {item.displayName}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.itemType}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.baseUnit ?? "Not recorded"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {item.mappedSupplierItemCount}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.approvedPriceCount}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.formulaUsageCount}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.updatedAt}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={statusTone(item.status)}>
                            {item.status}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title={emptyTitle}
                description={emptyDescription}
              />
            )}
          </SectionCard>

          <SectionCard
            title={createTitle}
            description={
              canManageInternalItems
                ? `Add a basic ${typeLabel.toLowerCase()} internal item without creating supplier mappings or prices.`
                : "Manual internal item creation is restricted for this role."
            }
            action={
              <StatusBadge tone={canManageInternalItems ? "success" : "warning"}>
                {canManageInternalItems ? "supplier_items.manage" : "Read only"}
              </StatusBadge>
            }
          >
            {canManageInternalItems ? (
              <form action={createInternalItemAction} className="space-y-4">
                <input type="hidden" name="item_type" value={itemType} />
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Internal item name
                  </span>
                  <input
                    name="display_name"
                    required
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Base unit
                  </span>
                  <input
                    name="base_unit"
                    placeholder={itemType === "ingredient" ? "kg" : "each"}
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Status
                  </span>
                  <select
                    name="status"
                    defaultValue="active"
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
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-clean-green-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-clean-green-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clean-green-700"
                >
                  Create internal item
                </button>
              </form>
            ) : (
              <EmptyState
                title="Internal item management is restricted"
                description="You can view internal item records, but creating and editing items requires supplier_items.manage."
              />
            )}
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
