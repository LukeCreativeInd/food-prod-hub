import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { updateInventoryReceiptLineAction } from "@/app/goods-inwards/actions";
import { AppShell } from "@/components/app-shell";
import { AlertCard, PageActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { fetchInventoryReceiptDetail } from "@/lib/goods-inwards-data";
import {
  inventoryConversionStatusLabels,
  inventoryConversionStatuses,
  inventoryQaStatusLabels,
  inventoryQaStatuses,
} from "@/lib/inventory-movement-types";

type PageProps = {
  params: Promise<{ id: string; lineId: string }>;
  searchParams: Promise<{ receipt?: string }>;
};

const inputClass =
  "mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";
const selectClass =
  "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 disabled:cursor-not-allowed disabled:bg-slate-300";

function actionMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<
    string,
    { tone: "success" | "warning" | "danger" | "info"; text: string }
  > = {
    invalid_dates: {
      tone: "warning",
      text: "Manufacture date cannot be after expiry or use-by date.",
    },
    invalid_line: {
      tone: "warning",
      text: "The receipt line could not be found.",
    },
    invalid_quantity: {
      tone: "warning",
      text: "Enter a received quantity greater than zero.",
    },
    invalid_unit: { tone: "warning", text: "Enter a received unit." },
    line_not_draft: {
      tone: "warning",
      text: "Only draft receipt lines can be edited.",
    },
    missing_item: { tone: "warning", text: "Select a receivable internal item." },
    missing_location: { tone: "warning", text: "Select a stock location." },
    receipt_not_draft: {
      tone: "warning",
      text: "Only draft receipts can be changed.",
    },
    error: { tone: "danger", text: "The receipt line could not be saved." },
  };

  return messages[status] ?? null;
}

function FormField({
  label,
  helperText,
  children,
}: {
  label: string;
  helperText?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </span>
      {children}
      {helperText ? (
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {helperText}
        </span>
      ) : null}
    </label>
  );
}

export default async function EditGoodsInwardsReceiptLinePage({
  params,
  searchParams,
}: PageProps) {
  const [{ id, lineId }, query] = await Promise.all([params, searchParams]);
  const data = await fetchInventoryReceiptDetail(id);

  if (!data) {
    notFound();
  }

  if (!data.canCreateReceipts && !data.canManageReceipts) {
    redirect("/no-access");
  }

  const line = data.lines.find((item) => item.id === lineId);

  if (!line) {
    notFound();
  }

  const message = actionMessage(query.receipt);
  const canEditLine = data.receipt.status === "draft" && line.status === "draft";

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        {message ? (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
            <span>{message.text}</span>
            <StatusBadge tone={message.tone}>{query.receipt ?? "status"}</StatusBadge>
          </div>
        ) : null}

        <SectionCard
          title="Edit Goods Inwards line"
          description="Use this dedicated edit page to correct draft receiving fields before posting stock movements."
          action={<StatusBadge tone={canEditLine ? "warning" : "info"}>{canEditLine ? "Draft editable" : "Read only"}</StatusBadge>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Receipt", data.receipt.receiptNumber],
              ["Supplier", data.receipt.supplierName],
              ["Source", line.sourceLabel],
              ["Line status", line.statusLabel],
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
            <PageActionButton href={`/goods-inwards/${data.receipt.id}`} variant="secondary">
              Back to receipt
            </PageActionButton>
            {data.receipt.purchaseDocumentId ? (
              <Link
                className="inline-flex items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                href={`/purchase-documents/${data.receipt.purchaseDocumentId}`}
              >
                Source invoice: {data.receipt.purchaseDocumentLabel}
              </Link>
            ) : null}
          </div>
        </SectionCard>

        {!canEditLine ? (
          <AlertCard
            title="This line is read only"
            description="Only draft lines on draft receipts can be edited. Posted receipts remain locked because they may already have inventory lots or stock movements."
            meta="Read only"
            tone="info"
          />
        ) : (
          <SectionCard
            title="Draft line fields"
            description="The invoice/source link is preserved. These edits only correct receiving fields before posting."
            action={<StatusBadge tone="success">Save returns to receipt</StatusBadge>}
          >
            <form
              action={updateInventoryReceiptLineAction}
              className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4"
            >
              <input name="receipt_id" type="hidden" value={data.receipt.id} />
              <input name="line_id" type="hidden" value={line.id} />
              <FormField label="Internal item">
                <select
                  className={selectClass}
                  defaultValue={line.internalItemId}
                  name="internal_item_id"
                  required
                >
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
                <select
                  className={selectClass}
                  defaultValue={line.stockLocationId}
                  name="stock_location_id"
                  required
                >
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
                  defaultValue={line.receivedQuantityValue}
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
                  defaultValue={line.receivedUnit}
                  name="received_unit"
                  required
                />
              </FormField>
              <FormField
                label="Inventory quantity"
                helperText="Optional. Leave blank to mirror the received quantity."
              >
                <input
                  className={inputClass}
                  defaultValue={line.inventoryQuantityValue}
                  min="0.0001"
                  name="inventory_quantity"
                  placeholder="Optional"
                  step="0.0001"
                  type="number"
                />
              </FormField>
              <FormField
                label="Inventory unit"
                helperText="Required only when inventory quantity is entered."
              >
                <input
                  className={inputClass}
                  defaultValue={line.inventoryUnitValue}
                  name="inventory_unit"
                  placeholder="Optional; leave blank to match received unit"
                />
              </FormField>
              <FormField label="Conversion status">
                <select
                  className={selectClass}
                  defaultValue={line.conversionStatus}
                  name="conversion_status"
                >
                  {inventoryConversionStatuses.map((status) => (
                    <option key={status} value={status}>
                      {inventoryConversionStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="QA status">
                <select
                  className={selectClass}
                  defaultValue={line.qaStatus}
                  name="qa_status"
                >
                  {inventoryQaStatuses.map((status) => (
                    <option key={status} value={status}>
                      {inventoryQaStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Lot number">
                <input
                  className={inputClass}
                  defaultValue={line.lotNumberValue}
                  name="lot_number"
                  placeholder="Optional"
                />
              </FormField>
              <FormField label="Expiry date">
                <input
                  className={inputClass}
                  defaultValue={line.expiryDateValue}
                  name="expiry_date"
                  type="date"
                />
              </FormField>
              <FormField label="Use-by date">
                <input
                  className={inputClass}
                  defaultValue={line.useByDateValue}
                  name="use_by_date"
                  type="date"
                />
              </FormField>
              <FormField label="Manufacture date">
                <input
                  className={inputClass}
                  defaultValue={line.manufactureDateValue}
                  name="manufacture_date"
                  type="date"
                />
              </FormField>
              <div className="lg:col-span-2 xl:col-span-4">
                <FormField label="Line notes">
                  <input
                    className={inputClass}
                    defaultValue={line.notesValue}
                    name="notes"
                    placeholder="Condition, temperature note or receiving comment"
                  />
                </FormField>
              </div>
              <div className="flex flex-wrap gap-2 lg:col-span-2 xl:col-span-4">
                <button className={primaryButtonClass} type="submit">
                  Save line
                </button>
                <PageActionButton href={`/goods-inwards/${data.receipt.id}`} variant="secondary">
                  Cancel
                </PageActionButton>
              </div>
            </form>
          </SectionCard>
        )}

        <AlertCard
          title="Source link preserved"
          description="Editing the receiving line does not overwrite the supplier invoice line link. Supplier Invoice Intake remains the commercial source evidence."
          meta="Review-first receiving"
          tone="info"
        />
      </div>
    </AppShell>
  );
}
