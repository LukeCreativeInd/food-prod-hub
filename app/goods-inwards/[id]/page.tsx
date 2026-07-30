import { notFound } from "next/navigation";

import {
  addInventoryReceiptLineAction,
  cancelInventoryReceiptAction,
  cancelInventoryReceiptLineAction,
  postInventoryReceiptAction,
} from "@/app/goods-inwards/actions";
import { AppShell } from "@/components/app-shell";
import { AlertCard, EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import {
  type InventoryReceiptLineItem,
  fetchInventoryReceiptDetail,
  movementStatusTone,
} from "@/lib/goods-inwards-data";
import {
  inventoryConversionStatusLabels,
  inventoryConversionStatuses,
  inventoryQaStatusLabels,
  inventoryQaStatuses,
} from "@/lib/inventory-movement-types";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ receipt?: string }>;
};

const inputClass =
  "mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";
const selectClass =
  "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 disabled:cursor-not-allowed disabled:bg-slate-300";
const dangerButtonClass =
  "inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100";

function actionMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<
    string,
    { tone: "success" | "warning" | "danger" | "info"; text: string }
  > = {
    created: { tone: "success", text: "Draft receipt created." },
    line_added: { tone: "success", text: "Receipt line added." },
    line_cancelled: { tone: "success", text: "Draft receipt line cancelled." },
    receipt_cancelled: { tone: "success", text: "Draft receipt cancelled." },
    posted: { tone: "success", text: "Receipt posted. Lots and stock movements were created." },
    no_lines: { tone: "warning", text: "Add at least one active line before posting." },
    conversion_required: {
      tone: "warning",
      text: "One or more lines need unit conversion review before posting.",
    },
    rejected_line: {
      tone: "warning",
      text: "Rejected lines cannot be posted in v1. Cancel the rejected line or change the QA state before posting.",
    },
    missing_item: { tone: "warning", text: "Select a receivable internal item." },
    missing_location: { tone: "warning", text: "Select a stock location." },
    invalid_quantity: { tone: "warning", text: "Enter a received quantity greater than zero." },
    invalid_unit: { tone: "warning", text: "Enter a received unit." },
    invalid_receipt: { tone: "warning", text: "The receipt could not be found." },
    receipt_not_draft: { tone: "warning", text: "Only draft receipts can be changed or posted." },
    partial_error: {
      tone: "danger",
      text: "Posting stopped after a write failed. Review created lots/movements before retrying.",
    },
    error: { tone: "danger", text: "The receipt action could not be completed." },
  };

  return messages[status] ?? { tone: "info" as const, text: "Receipt action finished." };
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function conversionTone(status: string) {
  if (status === "converted" || status === "not_required") {
    return "success" as const;
  }

  if (status === "needs_conversion") {
    return "warning" as const;
  }

  return "danger" as const;
}

function qaTone(status: string) {
  if (status === "passed") {
    return "success" as const;
  }

  if (status === "hold") {
    return "warning" as const;
  }

  if (status === "rejected") {
    return "danger" as const;
  }

  return "neutral" as const;
}

function lineStatusTone(line: InventoryReceiptLineItem) {
  if (line.status === "received") {
    return "success" as const;
  }

  if (line.status === "held") {
    return "warning" as const;
  }

  if (line.status === "rejected") {
    return "danger" as const;
  }

  return "neutral" as const;
}

export default async function GoodsInwardsReceiptDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const data = await fetchInventoryReceiptDetail(id);

  if (!data) {
    notFound();
  }

  const message = actionMessage(query.receipt);
  const isDraft = data.receipt.status === "draft";
  const activeLines = data.lines.filter((line) => line.status !== "cancelled");
  const canAddLines = isDraft && (data.canCreateReceipts || data.canManageReceipts);
  const canPost =
    isDraft && data.canPostReceipts && activeLines.length > 0;
  const hasConversionBlocker = activeLines.some((line) =>
    ["needs_conversion", "blocked"].includes(line.conversionStatus),
  );
  const hasRejectedLine = activeLines.some((line) => line.qaStatus === "rejected");

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        {message ? (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
            <span>{message.text}</span>
            <StatusBadge tone={message.tone}>{query.receipt ?? "status"}</StatusBadge>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Receipt status"
            value={data.receipt.statusLabel}
            helperText="Draft receipts are editable. Posted receipts are read-only."
            badge={data.receipt.statusLabel}
            tone={data.receipt.statusTone}
            icon="GI"
          />
          <StatCard
            label="Receipt lines"
            value={String(activeLines.length)}
            helperText="Cancelled lines are retained but not posted."
            badge="Lines"
            tone="info"
            icon="LN"
          />
          <StatCard
            label="Stock movements"
            value={String(data.movements.length)}
            helperText="Created when a receipt is posted."
            badge="Ledger"
            tone={data.movements.length > 0 ? "success" : "neutral"}
            icon="MV"
          />
          <StatCard
            label="Received"
            value={data.receipt.receivedAt}
            helperText="Physical receipt date/time."
            badge="Date"
            tone="neutral"
            icon="DT"
          />
        </section>

        <SectionCard
          title={data.receipt.receiptNumber}
          description="Receipt header and posting state."
          action={<StatusBadge tone={data.receipt.statusTone}>{data.receipt.statusLabel}</StatusBadge>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Supplier", data.receipt.supplierName],
              ["Supplier reference", data.receipt.supplierReference],
              ["Created", data.receipt.createdAt],
              ["Posted", data.receipt.postedAt],
              ["Cancelled", data.receipt.cancelledAt],
              ["Updated", data.receipt.updatedAt],
              ["Notes", data.receipt.notes],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="text-xs font-semibold uppercase text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PageActionButton href="/goods-inwards" variant="secondary">
              Back to Goods Inwards
            </PageActionButton>
            {canPost ? (
              <form action={postInventoryReceiptAction}>
                <input name="receipt_id" type="hidden" value={data.receipt.id} />
                <button
                  className={primaryButtonClass}
                  disabled={hasConversionBlocker || hasRejectedLine}
                  type="submit"
                >
                  Post receipt
                </button>
              </form>
            ) : null}
            {isDraft && data.canManageReceipts ? (
              <form action={cancelInventoryReceiptAction}>
                <input name="receipt_id" type="hidden" value={data.receipt.id} />
                <button className={dangerButtonClass} type="submit">
                  Cancel draft
                </button>
              </form>
            ) : null}
          </div>
        </SectionCard>

        {hasConversionBlocker ? (
          <AlertCard
            title="Conversion review required"
            description="At least one line has a unit conversion that EveryBatch cannot safely calculate yet. Save the line in the same unit or wait for UOM conversion rules before posting."
            meta="Posting blocked"
            tone="warning"
          />
        ) : null}
        {hasRejectedLine ? (
          <AlertCard
            title="Rejected line blocks posting"
            description="Rejected receiving lines do not silently create stock in v1. Cancel the rejected line or change the QA state before posting."
            meta="Posting blocked"
            tone="warning"
          />
        ) : null}

        <SectionCard
          title="Receipt lines"
          description="Manual receiving lines for this draft. Posted receipts are read-only."
          action={<StatusBadge tone={isDraft ? "warning" : "success"}>{isDraft ? "Editable draft" : "Read only"}</StatusBadge>}
        >
          {data.lines.length === 0 ? (
            <EmptyState
              title="No receipt lines yet"
              description="Add at least one item, quantity and location before posting this receipt."
            />
          ) : (
            <div className="space-y-3">
              {data.lines.map((line) => (
                <article
                  key={line.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-sm font-black text-slate-950">
                        {line.internalItemName}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {line.receivedQuantity} {line.receivedUnit} received ·{" "}
                        {line.inventoryQuantity} {line.inventoryUnit} inventory
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {line.locationName} · Lot {line.lotNumber} · Expiry {line.expiryDate}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone={lineStatusTone(line)}>
                        {line.statusLabel}
                      </StatusBadge>
                      <StatusBadge tone={conversionTone(line.conversionStatus)}>
                        {line.conversionStatusLabel}
                      </StatusBadge>
                      <StatusBadge tone={qaTone(line.qaStatus)}>
                        {line.qaStatusLabel}
                      </StatusBadge>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                    {[
                      ["Use-by", line.useByDate],
                      ["Manufacture", line.manufactureDate],
                      ["Notes", line.notes],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          {label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {isDraft && data.canManageReceipts && line.status === "draft" ? (
                    <form action={cancelInventoryReceiptLineAction} className="mt-4">
                      <input name="receipt_id" type="hidden" value={data.receipt.id} />
                      <input name="line_id" type="hidden" value={line.id} />
                      <button className={dangerButtonClass} type="submit">
                        Cancel line
                      </button>
                    </form>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        {canAddLines ? (
          <SectionCard
            title="Add receipt line"
            description="Select what arrived, where it was placed and whether the received unit is ready for inventory posting."
            action={<StatusBadge tone="success">inventory_receipts.create</StatusBadge>}
          >
            <form action={addInventoryReceiptLineAction} className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              <input name="receipt_id" type="hidden" value={data.receipt.id} />
              <FormField label="Internal item">
                <select className={selectClass} name="internal_item_id" required>
                  <option value="">Select item</option>
                  {data.formOptions.internalItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.displayName} ({item.itemType}
                      {item.baseUnit ? `, ${item.baseUnit}` : ""})
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Stock location">
                <select className={selectClass} name="stock_location_id" required>
                  <option value="">Select location</option>
                  {data.formOptions.locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Received quantity">
                <input
                  className={inputClass}
                  min="0.0001"
                  name="received_quantity"
                  required
                  step="0.0001"
                  type="number"
                />
              </FormField>
              <FormField label="Received unit">
                <input
                  className={inputClass}
                  name="received_unit"
                  placeholder="kg, g, l, ml, each, box"
                  required
                />
              </FormField>
              <FormField label="Inventory quantity">
                <input
                  className={inputClass}
                  min="0.0001"
                  name="inventory_quantity"
                  placeholder="Optional"
                  step="0.0001"
                  type="number"
                />
              </FormField>
              <FormField label="Inventory unit">
                <input
                  className={inputClass}
                  name="inventory_unit"
                  placeholder="Optional; leave blank to match received unit"
                />
              </FormField>
              <FormField label="Conversion status">
                <select className={selectClass} name="conversion_status" defaultValue="not_required">
                  {inventoryConversionStatuses.map((status) => (
                    <option key={status} value={status}>
                      {inventoryConversionStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="QA status">
                <select className={selectClass} name="qa_status" defaultValue="not_checked">
                  {inventoryQaStatuses.map((status) => (
                    <option key={status} value={status}>
                      {inventoryQaStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Lot number">
                <input className={inputClass} name="lot_number" placeholder="Optional" />
              </FormField>
              <FormField label="Expiry date">
                <input className={inputClass} name="expiry_date" type="date" />
              </FormField>
              <FormField label="Use-by date">
                <input className={inputClass} name="use_by_date" type="date" />
              </FormField>
              <FormField label="Manufacture date">
                <input className={inputClass} name="manufacture_date" type="date" />
              </FormField>
              <div className="lg:col-span-2 xl:col-span-4">
                <FormField label="Line notes">
                  <input
                    className={inputClass}
                    name="notes"
                    placeholder="Condition, temperature note or receiving comment"
                  />
                </FormField>
              </div>
              <div className="lg:col-span-2 xl:col-span-4">
                <button className={primaryButtonClass} type="submit">
                  Add receipt line
                </button>
              </div>
            </form>
          </SectionCard>
        ) : null}

        <SectionCard
          title="Stock movements created"
          description="Posted receipts create append-like ledger entries. No stock-on-hand summary is calculated here."
          action={<StatusBadge tone="info">Ledger</StatusBadge>}
        >
          {data.movements.length === 0 ? (
            <EmptyState
              title="No stock movements yet"
              description="Posting this receipt will create stock movement rows."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Lot</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Movement</th>
                    <th className="px-4 py-3">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {data.movements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-4 py-3 font-semibold text-slate-950">
                        {movement.internalItemName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {movement.locationName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {movement.lotNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {movement.quantity} {movement.unit}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge tone={movementStatusTone(movement.status)}>
                            {movement.statusLabel}
                          </StatusBadge>
                          <StatusBadge tone="neutral">
                            {movement.movementTypeLabel}
                          </StatusBadge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {movement.movementAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <AlertCard
          title="Supplier invoices remain separate"
          description="Supplier Invoice Intake can create supplier, item and price reference records, but it does not create receiving lines or stock movements in this task."
          meta="Future task 196/197"
          tone="info"
        />
      </div>
    </AppShell>
  );
}
