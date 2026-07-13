import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState, PageActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { getSupplierDetailForCurrentOrganisation } from "@/lib/products-data";

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
    normalisedValue.includes("approved")
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

export default async function SupplierDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = await getSupplierDetailForCurrentOrganisation(id);

  if (!detail) {
    notFound();
  }

  return (
    <AppShell>
      <PageHeader
        title={detail.supplier.displayName}
        description="Read-only supplier detail showing reviewed intake records, catalogue mappings and price traceability."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <PageActionButton href="/suppliers" variant="secondary">
            Back to suppliers
          </PageActionButton>
          <StatusBadge tone={statusTone(detail.supplier.status)}>
            {detail.supplier.status}
          </StatusBadge>
          <StatusBadge tone="info">Read only</StatusBadge>
        </div>

        <SectionCard
          title="Supplier identity"
          description="Tenant supplier master data created or reused during reviewed Purchase Document Intake commits."
        >
          <DetailGrid
            rows={[
              { label: "Display name", value: detail.supplier.displayName },
              { label: "Legal name", value: detail.supplier.legalName ?? "Not recorded" },
              { label: "ABN", value: detail.supplier.abn ?? "Not recorded" },
              { label: "Supplier type", value: detail.supplier.supplierType ?? "Not recorded" },
              { label: "Notes", value: detail.supplier.notes ?? "No notes recorded" },
              { label: "Created", value: detail.supplier.createdAt },
              { label: "Updated", value: detail.supplier.updatedAt },
            ]}
          />
        </SectionCard>

        <SectionCard
          title="Aliases"
          description="Legal, trading, invoice and account identifiers retained for future matching."
        >
          <ReadOnlyTable
            columns={["Type", "Alias", "Source document", "Status"]}
            rows={detail.aliases.map((alias) => ({
              Type: alias.aliasType,
              Alias: alias.aliasValue,
              "Source document": alias.sourceDocumentHref
                ? {
                    label: alias.sourceDocument,
                    href: alias.sourceDocumentHref,
                  }
                : alias.sourceDocument,
              Status: alias.status,
            }))}
            badgeColumns={["Status"]}
            emptyMessage="No aliases have been recorded for this supplier yet."
          />
        </SectionCard>

        <SectionCard
          title="Supplier catalogue items"
          description="Supplier-facing item records and mappings to canonical internal items."
        >
          <ReadOnlyTable
            columns={[
              "Code",
              "Supplier description",
              "Normalised description",
              "Unit",
              "Mapped internal item",
              "Current price",
              "Price date",
              "Status",
            ]}
            rows={detail.catalogueItems.map((item) => ({
              Code: item.supplierItemCode,
              "Supplier description": item.supplierDescription,
              "Normalised description": item.normalisedSupplierDescription,
              Unit: item.purchaseUnit,
              "Mapped internal item": item.internalItemHref
                ? {
                    label: item.mappedInternalItem,
                    href: item.internalItemHref,
                  }
                : item.mappedInternalItem,
              "Current price": item.currentApprovedPrice,
              "Price date": item.currentPriceDate,
              Status: item.status,
            }))}
            badgeColumns={["Current price", "Status"]}
            emptyMessage="No supplier catalogue items have been committed for this supplier yet."
          />
        </SectionCard>

        <SectionCard
          title="Source documents"
          description="Purchase document references remain read-only. Links are only shown to users with Purchase Document access."
          action={
            <StatusBadge tone={detail.canViewPurchaseDocuments ? "success" : "warning"}>
              {detail.canViewPurchaseDocuments ? "Links enabled" : "References only"}
            </StatusBadge>
          }
        >
          <ReadOnlyTable
            columns={["Invoice", "Date", "Total", "Status"]}
            rows={detail.sourceDocuments.map((document) => ({
              Invoice: document.href
                ? {
                    label: document.invoiceNumber,
                    href: document.href,
                  }
                : document.invoiceNumber,
              Date: document.invoiceDate,
              Total: document.invoiceTotal,
              Status: document.status,
            }))}
            badgeColumns={["Status"]}
            emptyMessage={
              detail.canViewPurchaseDocuments
                ? "No source purchase documents are visible for this supplier yet."
                : "Source purchase documents are restricted for this role."
            }
          />
        </SectionCard>

        <SectionCard
          title="Price traceability"
          description="Invoice observations and current approved supplier prices related to this supplier."
        >
          <ReadOnlyTable
            columns={[
              "Supplier item",
              "Internal item",
              "Observed price",
              "Approved price",
              "Unit",
              "Source invoice",
              "Status",
            ]}
            rows={detail.prices.map((price) => ({
              "Supplier item": price.supplierItem,
              "Internal item": price.internalItem,
              "Observed price": price.observedPrice,
              "Approved price": price.approvedPrice,
              Unit: price.unit,
              "Source invoice": price.sourceInvoiceHref
                ? {
                    label: price.sourceInvoice,
                    href: price.sourceInvoiceHref,
                  }
                : price.sourceInvoice,
              Status: price.status,
            }))}
            badgeColumns={["Approved price", "Status"]}
            emptyMessage="No price observations or approved prices are visible for this supplier yet."
          />
        </SectionCard>

        <SectionCard
          title="Future usage"
          description="These areas are placeholders only; no purchasing or receiving workflows are created here."
        >
          <EmptyState
            title="Future supplier operations"
            description="Purchase orders, goods receiving, supplier performance and payment details will be planned later. This page only inspects reviewed supplier, item and price records."
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}
