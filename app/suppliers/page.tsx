import Link from "next/link";

import { createSupplierAction } from "@/app/suppliers/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  EmptyState,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { getSupplierDirectoryPageData } from "@/lib/products-data";

type PageProps = {
  searchParams: Promise<{
    create?: string;
  }>;
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
    return "Supplier display name is required before a supplier can be created.";
  }

  if (status === "duplicate") {
    return "A supplier with that display name already exists for this organisation.";
  }

  if (status === "error") {
    return "Supplier could not be created. Check the details and try again.";
  }

  return null;
}

export default async function SuppliersPage({ searchParams }: PageProps) {
  const [{ suppliers, canManageSuppliers }, query] = await Promise.all([
    getSupplierDirectoryPageData(),
    searchParams,
  ]);
  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.status === "active",
  ).length;
  const linkedItems = suppliers.reduce(
    (total, supplier) => total + supplier.supplierItemCount,
    0,
  );
  const currentPrices = suppliers.reduce(
    (total, supplier) => total + supplier.currentPriceCount,
    0,
  );
  const sourceDocuments = suppliers.reduce(
    (total, supplier) => total + supplier.documentCount,
    0,
  );
  const createMessage = messageForCreate(query.create);

  return (
    <AppShell>
      <PageHeader
        title="Suppliers"
        description="Manage supplier master records and review supplier catalogue coverage for Clean Eats."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        {createMessage ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            {createMessage}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active suppliers"
            value={String(activeSuppliers)}
            helperText="Tenant suppliers currently marked active."
            badge="Live"
            tone="success"
            icon="SU"
          />
          <StatCard
            label="Supplier items"
            value={String(linkedItems)}
            helperText="Supplier-facing catalogue items linked to suppliers."
            badge="Catalogue"
            tone="info"
            icon="IT"
          />
          <StatCard
            label="Current prices"
            value={String(currentPrices)}
            helperText="Approved current supplier prices linked to supplier items."
            badge="Approved"
            tone="success"
            icon="$"
          />
          <StatCard
            label="Source documents"
            value={String(sourceDocuments)}
            helperText="Purchase documents linked to supplier records."
            badge="Trace"
            tone="neutral"
            icon="PD"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionCard
            title="Supplier directory"
            description="Tenant-scoped supplier records from manual entry and reviewed Supplier Invoice Intake commits."
            action={
              <StatusBadge tone={canManageSuppliers ? "success" : "info"}>
                {canManageSuppliers ? "Manage enabled" : "Read only"}
              </StatusBadge>
            }
          >
            {suppliers.length > 0 ? (
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                    <tr>
                      {[
                        "Supplier",
                        "Legal name",
                        "ABN",
                        "Items",
                        "Mapped/priced",
                        "Documents",
                        "Status",
                      ].map((column) => (
                        <th key={column} className="px-4 py-3">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {suppliers.map((supplier) => (
                      <tr key={supplier.id}>
                        <td className="px-4 py-3">
                          <Link
                            href={`/suppliers/${supplier.id}`}
                            className="font-semibold text-clean-green-700 hover:text-clean-green-900"
                          >
                            {supplier.displayName}
                          </Link>
                          {supplier.supplierType ? (
                            <p className="mt-1 text-xs text-slate-500">
                              {supplier.supplierType}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {supplier.legalName ?? "Not recorded"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {supplier.abn ?? "Not recorded"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {supplier.supplierItemCount}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {supplier.currentPriceCount} current price(s)
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {supplier.documentCount}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={statusTone(supplier.status)}>
                            {supplier.status}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No suppliers yet"
                description="Create a supplier manually here, or use Tools -> Supplier Invoice Intake to create suppliers from reviewed invoice commits."
              />
            )}
          </SectionCard>

          <SectionCard
            title="Create supplier"
            description={
              canManageSuppliers
                ? "Add a basic tenant supplier record without creating supplier items or prices."
                : "Manual supplier creation is restricted for this role."
            }
            action={
              <StatusBadge tone={canManageSuppliers ? "success" : "warning"}>
                {canManageSuppliers ? "supplier_items.manage" : "Read only"}
              </StatusBadge>
            }
          >
            {canManageSuppliers ? (
              <form action={createSupplierAction} className="space-y-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Display name
                  </span>
                  <input
                    name="display_name"
                    required
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Legal name
                  </span>
                  <input
                    name="legal_name"
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      ABN
                    </span>
                    <input
                      name="abn"
                      className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Type
                    </span>
                    <input
                      name="supplier_type"
                      placeholder="Ingredient supplier"
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
                  Create supplier
                </button>
              </form>
            ) : (
              <EmptyState
                title="Supplier management is restricted"
                description="You can view supplier records, but creating and editing suppliers requires supplier_items.manage."
              />
            )}
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
