import Link from "next/link";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import {
  getInventoryTraceabilityPageData,
  type InventoryTraceabilityRow,
} from "@/lib/inventory-traceability-data";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    lotStatus?: string;
    source?: string;
    supplier?: string;
    location?: string;
    view?: string;
  }>;
};

function matchesFilter(value: string | null, filter: string | undefined) {
  return !filter || filter === "all" || value === filter;
}

function searchableText(row: InventoryTraceabilityRow) {
  return [
    row.internalItemName,
    row.internalItemType,
    row.lotNumber,
    row.supplierName,
    row.locationLabel,
    row.receiptNumber,
    row.supplierReference,
    row.invoiceNumber,
    row.invoiceFilename,
    row.invoiceLineDescription,
    row.lotStatusLabel,
    row.qaStatusLabel,
    row.qaHoldStatus,
    row.qaHoldReason,
    row.receivingQaCheckStatus,
  ]
    .join(" ")
    .toLowerCase();
}

function filterRows(
  rows: InventoryTraceabilityRow[],
  query: Awaited<PageProps["searchParams"]>,
) {
  const search = query.q?.trim().toLowerCase() ?? "";

  return rows.filter((row) => {
    const matchesSearch = !search || searchableText(row).includes(search);
    const matchesLotStatus = matchesFilter(row.lotStatus, query.lotStatus);
    const matchesSource = matchesFilter(row.sourceType, query.source);
    const matchesSupplier = matchesFilter(row.supplierId, query.supplier);
    const matchesLocation = matchesFilter(row.locationId, query.location);
    const matchesView =
      !query.view ||
      query.view === "all" ||
      (query.view === "on_hand" && row.isOnHand) ||
      (query.view === "held" && row.isHeld) ||
      (query.view === "missing_invoice" && !row.invoiceLinked) ||
      (query.view === "incomplete" && !row.isTraceCompleteToReceiving);

    return (
      matchesSearch &&
      matchesLotStatus &&
      matchesSource &&
      matchesSupplier &&
      matchesLocation &&
      matchesView
    );
  });
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function TraceSection({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h4 className="text-sm font-bold text-slate-950">{title}</h4>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function TraceabilityCard({
  row,
  canViewPurchaseDocuments,
}: {
  row: InventoryTraceabilityRow;
  canViewPurchaseDocuments: boolean;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={row.sourceTypeTone}>{row.sourceTypeLabel}</StatusBadge>
            <StatusBadge tone={row.lotStatusTone}>{row.lotStatusLabel}</StatusBadge>
            <StatusBadge tone={row.qaStatusTone}>{row.qaStatusLabel}</StatusBadge>
          </div>
          <h3 className="mt-3 text-lg font-bold text-slate-950">
            {row.internalItemName}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Lot {row.lotNumber} · {row.internalItemType} · Base unit{" "}
            {row.baseUnit}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {row.receiptId ? (
            <Link
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              href={`/goods-inwards/${row.receiptId}`}
            >
              Open receipt
            </Link>
          ) : null}
          <Link
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            href="/stock-on-hand"
          >
            Stock On Hand
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <TraceSection
          title="Source evidence"
          action={<StatusBadge tone={row.invoiceLinked ? "success" : "info"}>{row.invoiceAccessLabel}</StatusBadge>}
        >
          {row.invoiceLinked && canViewPurchaseDocuments && row.invoiceDocumentId ? (
            <div className="space-y-4">
              <dl className="grid gap-3 sm:grid-cols-2">
                <Field label="Supplier" value={row.supplierName} />
                <Field label="Invoice" value={row.invoiceNumber} />
                <Field label="Invoice date" value={row.invoiceDate} />
                <Field label="Document" value={row.invoiceFilename} />
                <Field label="Line" value={row.invoiceLineLabel} />
                <Field label="Classification" value={row.invoiceLineClassification} />
              </dl>
              <p className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-600">
                {row.invoiceLineDescription}
              </p>
              <Link
                className="inline-flex text-sm font-bold text-[var(--tenant-primary)] hover:underline"
                href={`/purchase-documents/${row.invoiceDocumentId}`}
              >
                Open supplier invoice
              </Link>
            </div>
          ) : row.invoiceLinked ? (
            <p className="text-sm leading-6 text-slate-600">
              This stock lot has supplier invoice evidence, but the current role
              does not expose purchase document details here.
            </p>
          ) : (
            <dl className="grid gap-3 sm:grid-cols-2">
              <Field label="Source" value="Manual Goods Inwards receipt" />
              <Field label="Supplier" value={row.supplierName} />
              <Field label="Reference" value={row.supplierReference} />
              <Field label="Invoice evidence" value="Not linked" />
            </dl>
          )}
        </TraceSection>

        <TraceSection
          title="Receiving event"
          action={<StatusBadge tone={row.receiptStatusTone}>{row.receiptStatusLabel}</StatusBadge>}
        >
          <dl className="grid gap-3 sm:grid-cols-2">
            <Field label="Receipt" value={row.receiptNumber} />
            <Field label="Received" value={row.receivedAt} />
            <Field label="Posted" value={row.postedAt} />
            <Field label="Receipt line" value={row.receiptLineStatusLabel} />
            <Field label="Received quantity" value={row.receiptLineQuantity} />
            <Field
              label="Inventory quantity"
              value={row.receiptLineInventoryQuantity}
            />
          </dl>
          {row.receiptId ? (
            <Link
              className="mt-4 inline-flex text-sm font-bold text-[var(--tenant-primary)] hover:underline"
              href={`/goods-inwards/${row.receiptId}`}
            >
              View Goods Inwards receipt
            </Link>
          ) : null}
        </TraceSection>

        <TraceSection title="Inventory lot">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Field label="Lot id" value={row.lotId.slice(0, 8)} />
            <Field label="Location" value={row.locationLabel} />
            <Field label="Location type" value={row.locationType} />
            <Field label="Manufactured" value={row.manufactureDate} />
            <Field label="Expiry" value={row.expiryDate} />
            <Field label="Use by" value={row.useByDate} />
          </dl>
          <Link
            className="mt-4 inline-flex text-sm font-bold text-[var(--tenant-primary)] hover:underline"
            href={`/internal-items/${row.internalItemId}`}
          >
            Open internal item
          </Link>
        </TraceSection>

        <TraceSection title="Ledger movements">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Field label="Movement count" value={String(row.movementCount)} />
            <Field label="Latest movement" value={row.latestMovementAt} />
            <Field label="Movement type" value={row.latestMovementType} />
            <Field label="Direction" value={row.latestMovementDirection} />
            <Field label="Status" value={row.latestMovementStatus} />
            <Field
              label="Latest movement id"
              value={row.latestMovementId?.slice(0, 8) ?? "Not recorded"}
            />
          </dl>
          <Link
            className="mt-4 inline-flex text-sm font-bold text-[var(--tenant-primary)] hover:underline"
            href="/stock-movements"
          >
            View stock movement ledger
          </Link>
        </TraceSection>

        <TraceSection
          title="QA hold and review"
          action={
            <StatusBadge tone={row.qaHoldId ? (row.isHeld ? "warning" : "success") : "neutral"}>
              {row.qaHoldStatus}
            </StatusBadge>
          }
        >
          <dl className="grid gap-3 sm:grid-cols-2">
            <Field label="Hold reason" value={row.qaHoldReason} />
            <Field label="Reason category" value={row.qaHoldReasonCategory} />
            <Field label="Placed" value={row.qaHoldPlacedAt} />
            <Field label="Released" value={row.qaHoldResolvedAt} />
            <Field label="Receiving QA" value={row.receivingQaCheckStatus} />
            <Field label="QA decision" value={row.receivingQaReviewDecision} />
          </dl>
          {row.qaHoldEvents.length > 0 ? (
            <div className="mt-4 space-y-2">
              {row.qaHoldEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2"
                >
                  <p className="text-xs font-bold uppercase text-slate-500">
                    {event.eventLabel} · {event.eventAt}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {event.notes}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              No formal QA hold events are linked to this lot.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {row.qaHoldId ? (
              <Link
                className="inline-flex text-sm font-bold text-[var(--tenant-primary)] hover:underline"
                href={`/qa/holds/${row.qaHoldId}`}
              >
                Open QA hold
              </Link>
            ) : null}
            {row.receivingQaCheckId ? (
              <Link
                className="inline-flex text-sm font-bold text-[var(--tenant-primary)] hover:underline"
                href={`/qa/receiving/${row.receivingQaCheckId}`}
              >
                Open Receiving QA
              </Link>
            ) : null}
          </div>
        </TraceSection>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[color:var(--tenant-primary-border)] bg-[var(--tenant-primary-soft)] p-4">
          <p className="text-sm font-bold text-slate-950">Stock On Hand context</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Current ledger balance for this lot:{" "}
            <span className="font-bold text-slate-950">{row.balanceSummary}</span>.
            Stock On Hand remains calculated from posted movement rows.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-950">
            Future production usage
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Production consumption, dispatch/customer recall and finished product
            forward trace are not connected yet. This v1 map stops at inbound
            stock and ledger evidence.
          </p>
        </div>
      </div>
    </article>
  );
}

export default async function InventoryTraceabilityPage({
  searchParams,
}: PageProps) {
  const [data, query] = await Promise.all([
    getInventoryTraceabilityPageData(),
    searchParams,
  ]);
  const filteredRows = filterRows(data.rows, query);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone="success">Live inbound data</StatusBadge>
                <StatusBadge tone="neutral">Read only</StatusBadge>
                <StatusBadge tone="info">No fake rows</StatusBadge>
              </div>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
                Inventory Traceability maps inbound stock from supplier evidence
                or manual Goods Inwards receiving through receipt lines,
                inventory lots, posted stock movements and Stock On Hand
                context. Production usage, dispatch and recall chains remain
                future workflows.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                href="/goods-inwards"
              >
                Goods Inwards
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                href="/stock-movements"
              >
                Stock Movements
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard
            label="Traceable lots"
            value={String(data.summary.traceableLots)}
            helperText="Inventory lot records available for inbound trace."
            badge="Lots"
            tone="info"
            icon="LT"
          />
          <StatCard
            label="Invoice linked"
            value={String(data.summary.linkedInvoiceLines)}
            helperText="Lots connected to supplier invoice evidence."
            badge="Evidence"
            tone="success"
            icon="IN"
          />
          <StatCard
            label="Manual receiving"
            value={String(data.summary.manualReceiptLots)}
            helperText="Lots received without supplier invoice links."
            badge="Manual"
            tone="neutral"
            icon="MR"
          />
          <StatCard
            label="Movements"
            value={String(data.summary.stockMovements)}
            helperText="Posted or retained ledger rows tied to these lots."
            badge="Ledger"
            tone="info"
            icon="MV"
          />
          <StatCard
            label="On hand lots"
            value={String(data.summary.onHandLots)}
            helperText="Lots with positive non-held ledger balance."
            badge="On hand"
            tone="success"
            icon="OH"
          />
          <StatCard
            label="Held lots"
            value={String(data.summary.heldLots)}
            helperText="Lots with hold status or QA hold context."
            badge="QA"
            tone={data.summary.heldLots > 0 ? "warning" : "neutral"}
            icon="QA"
          />
        </section>

        <SectionCard
          title="Trace filters"
          description="Filter the live inbound map by lot, supplier, source type, location or readiness context."
          action={
            <StatusBadge tone="neutral">
              {`${filteredRows.length} shown`}
            </StatusBadge>
          }
        >
          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <label className="space-y-1 xl:col-span-2">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Search
              </span>
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm"
                defaultValue={query.q ?? ""}
                name="q"
                placeholder="Item, lot, supplier, invoice..."
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Lot status
              </span>
              <select
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm"
                defaultValue={query.lotStatus ?? "all"}
                name="lotStatus"
              >
                <option value="all">All statuses</option>
                {data.filters.lotStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Source
              </span>
              <select
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm"
                defaultValue={query.source ?? "all"}
                name="source"
              >
                <option value="all">All sources</option>
                <option value="invoice">Invoice linked</option>
                <option value="manual">Manual receiving</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Supplier
              </span>
              <select
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm"
                defaultValue={query.supplier ?? "all"}
                name="supplier"
              >
                <option value="all">All suppliers</option>
                {data.filters.suppliers.map((supplier) => (
                  <option key={supplier.value} value={supplier.value}>
                    {supplier.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Location
              </span>
              <select
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm"
                defaultValue={query.location ?? "all"}
                name="location"
              >
                <option value="all">All locations</option>
                {data.filters.locations.map((location) => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-slate-500">
                View
              </span>
              <select
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm"
                defaultValue={query.view ?? "all"}
                name="view"
              >
                <option value="all">All lots</option>
                <option value="on_hand">On hand</option>
                <option value="held">Held</option>
                <option value="missing_invoice">Manual/no invoice</option>
                <option value="incomplete">Incomplete inbound trace</option>
              </select>
            </label>
            <div className="flex items-end gap-2 md:col-span-2 xl:col-span-6">
              <button
                className="inline-flex rounded-md bg-[var(--tenant-primary)] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--tenant-primary-dark)]"
                type="submit"
              >
                Apply filters
              </button>
              <Link
                className="inline-flex rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                href="/inventory-traceability"
              >
                Reset
              </Link>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Inbound trace map"
          description="Each card follows one inventory lot through its current real inbound links."
          action={<StatusBadge tone="success">Real records</StatusBadge>}
        >
          {filteredRows.length === 0 ? (
            <EmptyState
              title="No traceable stock matches these filters"
              description="Post Goods Inwards receipts to create inventory lots and stock movement ledger rows, or clear the filters to review all available lots."
              action={
                <Link
                  className="inline-flex rounded-md bg-[var(--tenant-primary)] px-4 py-2 text-sm font-bold text-white"
                  href="/goods-inwards"
                >
                  Open Goods Inwards
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredRows.map((row) => (
                <TraceabilityCard
                  key={row.id}
                  row={row}
                  canViewPurchaseDocuments={data.canViewPurchaseDocuments}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
