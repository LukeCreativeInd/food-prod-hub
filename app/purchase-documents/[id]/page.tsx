import Link from "next/link";

import { savePurchaseDocumentReviewAction } from "@/app/purchase-documents/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState, StatusBadge } from "@/components/ui";
import {
  getPurchaseDocumentReview,
  type PurchaseDocumentLine,
} from "@/lib/purchase-document-intake";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    sample?: string;
    saved?: string;
  }>;
};

const classificationOptions = [
  ["ingredient", "Ingredient"],
  ["packaging", "Packaging"],
  ["consumable", "Consumable"],
  ["equipment", "Equipment"],
  ["non_stock_charge", "Non-stock charge"],
  ["informational", "Informational"],
  ["unknown", "Unknown"],
];

const lineStatusOptions = [
  ["needs_review", "Needs review"],
  ["ready", "Ready"],
  ["deferred", "Deferred"],
  ["ignored", "Ignored"],
];

function formatCurrency(value: number | null, currency: string) {
  if (value === null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
  }).format(value);
}

function formatNumber(value: number | null) {
  return value === null ? "" : String(value);
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusTone(status: string) {
  if (status === "ready_to_commit" || status === "ready") {
    return "success" as const;
  }

  if (status === "failed" || status === "rejected") {
    return "danger" as const;
  }

  if (status === "uploaded" || status === "processing") {
    return "info" as const;
  }

  return "warning" as const;
}

function messageFor(sample?: string, saved?: string) {
  if (sample === "existing") {
    return "Existing Cammaroto sample review found. No duplicate was created.";
  }

  if (sample === "created") {
    return "Cammaroto sample review created. It saved only document and line review records.";
  }

  if (saved === "true") {
    return "Review progress saved.";
  }

  if (saved === "not-found") {
    return "Purchase document was not found or is not accessible.";
  }

  return null;
}

function defaultCorrectedValue(
  corrected: string | number | null,
  normalised: string | number | null,
  source: string | number | null,
) {
  return corrected ?? normalised ?? source ?? "";
}

function FieldPreview({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function TextInput({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string | number | null;
  type?: "text" | "date" | "number";
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </span>
      <input
        name={name}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
      />
    </label>
  );
}

function SelectInput({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: string[][] | readonly string[][];
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
      >
        {options.map(([value, labelText]) => (
          <option key={value} value={value}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}

function lineReviewDefaults(line: PurchaseDocumentLine) {
  return {
    itemCode: defaultCorrectedValue(
      line.corrected_item_code,
      line.normalised_item_code,
      line.source_item_code,
    ),
    description: defaultCorrectedValue(
      line.corrected_description,
      line.normalised_description,
      line.source_description,
    ),
    quantity: defaultCorrectedValue(
      line.corrected_quantity,
      line.normalised_quantity,
      line.source_quantity,
    ),
    unit: defaultCorrectedValue(
      line.corrected_unit,
      line.normalised_unit,
      line.source_unit,
    ),
    unitPrice: defaultCorrectedValue(
      line.corrected_unit_price,
      line.normalised_unit_price,
      line.source_unit_price,
    ),
    tax: defaultCorrectedValue(
      line.corrected_tax,
      line.normalised_tax,
      line.source_tax,
    ),
    lineTotal: defaultCorrectedValue(
      line.corrected_line_total,
      line.normalised_line_total,
      line.source_line_total,
    ),
  };
}

export default async function PurchaseDocumentReviewPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const review = await getPurchaseDocumentReview(id);

  if (!review) {
    return (
      <AppShell>
        <PageHeader
          title="Review Purchase Document"
          description="The requested document could not be found for your current organisation."
        />
        <div className="px-5 py-6 md:px-8">
          <EmptyState
            title="Purchase document not found"
            description="The document may not exist, may belong to another organisation, or may not be accessible with your current permissions."
            action={
              <Link
                href="/purchase-documents"
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Back to Purchase Documents
              </Link>
            }
          />
        </div>
      </AppShell>
    );
  }

  const { document, lines } = review;
  const message = messageFor(query.sample, query.saved);
  const lineTotal = lines.reduce(
    (sum, line) =>
      sum +
      (line.corrected_line_total ??
        line.normalised_line_total ??
        line.source_line_total ??
        0),
    0,
  );
  const totalsReconcile =
    document.invoice_total !== null &&
    Math.abs(lineTotal - document.invoice_total) < 0.01;
  const invoiceReady = Boolean(
    document.invoice_number && document.invoice_date && document.invoice_total,
  );
  const lineClassificationsReady =
    lines.length > 0 && lines.every((line) => line.classification !== "unknown");

  return (
    <AppShell>
      <PageHeader
        title="Review Purchase Document"
        description="Review saved invoice data before supplier, item mapping and price records are committed in a future step."
      />

      <form action={savePurchaseDocumentReviewAction}>
        <input type="hidden" name="document_id" value={document.id} />

        <div className="space-y-6 px-5 py-6 md:px-8">
          {message ? (
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
              {message}
            </div>
          ) : null}

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <Link
              href="/purchase-documents"
              className="inline-flex w-fit items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Back to Purchase Documents
            </Link>
            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone={statusTone(document.status)}>
                    {formatStatus(document.status)}
                  </StatusBadge>
                  <StatusBadge tone="info">Saved database record</StatusBadge>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-slate-950">
                  {document.supplier_trading_name_source ??
                    document.supplier_display_name ??
                    "Supplier source pending"}{" "}
                  · {document.invoice_number ?? "Invoice pending"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {document.original_filename}. Current total{" "}
                  {formatCurrency(document.invoice_total, document.currency)}{" "}
                  {document.currency}. Source fields remain preserved; review
                  edits are saved into review/corrected fields only.
                </p>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                Commit disabled until commit flow is implemented. This page
                does not create suppliers, supplier items, internal items,
                mappings, stock movements, observations or approved prices.
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Original document
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Document viewer placeholder. Future storage-backed uploads will
                render the source PDF/image here.
              </p>
              <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">
                  {document.original_filename}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Storage path: {document.storage_path ?? "not stored yet"}.
                  OCR/extraction is not connected.
                </p>
              </div>
            </aside>

            <div className="space-y-6">
              <section className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Supplier identity
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Preserve source identities separately from tenant display
                      name.
                    </p>
                  </div>
                  <StatusBadge tone="warning">Review source data</StatusBadge>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <TextInput
                    label="Legal / invoice name"
                    name="supplier_legal_name_source"
                    defaultValue={document.supplier_legal_name_source}
                  />
                  <TextInput
                    label="Trading name"
                    name="supplier_trading_name_source"
                    defaultValue={document.supplier_trading_name_source}
                  />
                  <FieldPreview
                    label="Tenant display name"
                    value={document.supplier_display_name ?? "Not linked yet"}
                  />
                  <TextInput
                    label="ABN"
                    name="supplier_abn_source"
                    defaultValue={document.supplier_abn_source}
                  />
                  <TextInput
                    label="Account number"
                    name="supplier_account_number_source"
                    defaultValue={document.supplier_account_number_source}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-950">
                  Invoice metadata
                </h2>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <TextInput
                    label="Invoice number"
                    name="invoice_number"
                    defaultValue={document.invoice_number}
                  />
                  <TextInput
                    label="Invoice date"
                    name="invoice_date"
                    type="date"
                    defaultValue={document.invoice_date}
                  />
                  <TextInput
                    label="Tax total"
                    name="tax_total"
                    type="number"
                    defaultValue={formatNumber(document.tax_total)}
                  />
                  <TextInput
                    label="Invoice total"
                    name="invoice_total"
                    type="number"
                    defaultValue={formatNumber(document.invoice_total)}
                  />
                  <TextInput
                    label="Currency"
                    name="currency"
                    defaultValue={document.currency}
                  />
                  <SelectInput
                    label="Review status"
                    name="status"
                    defaultValue={
                      document.status === "ready_to_commit"
                        ? "ready_to_commit"
                        : "needs_review"
                    }
                    options={[
                      ["needs_review", "Needs review"],
                      ["ready_to_commit", "Ready to commit"],
                    ]}
                  />
                </div>
              </section>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-950">
                Invoice line items
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Source and corrected values stay reviewable. Supplier
                descriptions are not overwritten by internal names.
              </p>
            </div>
            <div className="divide-y divide-slate-200">
              {lines.map((line) => {
                const defaults = lineReviewDefaults(line);

                return (
                  <article key={line.id} className="px-5 py-5">
                    <input type="hidden" name="line_ids" value={line.id} />
                    <div className="grid gap-4 xl:grid-cols-[0.7fr_1.2fr_0.45fr_0.45fr_0.55fr_auto] xl:items-start">
                      <FieldPreview
                        label="Source code"
                        value={line.source_item_code ?? "No code"}
                      />
                      <FieldPreview
                        label="Source description"
                        value={line.source_description ?? "No description"}
                      />
                      <FieldPreview
                        label="Source qty"
                        value={`${line.source_quantity ?? ""} ${
                          line.source_unit ?? ""
                        }`.trim()}
                      />
                      <FieldPreview
                        label="Source unit price"
                        value={formatCurrency(
                          line.source_unit_price,
                          document.currency,
                        )}
                      />
                      <FieldPreview
                        label="Source total"
                        value={formatCurrency(
                          line.source_line_total,
                          document.currency,
                        )}
                      />
                      <StatusBadge tone={statusTone(line.status)}>
                        {formatStatus(line.status)}
                      </StatusBadge>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <SelectInput
                        label="Classification"
                        name={`line_${line.id}_classification`}
                        defaultValue={line.classification}
                        options={classificationOptions}
                      />
                      <SelectInput
                        label="Line status"
                        name={`line_${line.id}_status`}
                        defaultValue={
                          lineStatusOptions.some(
                            ([value]) => value === line.status,
                          )
                            ? line.status
                            : "needs_review"
                        }
                        options={lineStatusOptions}
                      />
                      <TextInput
                        label="Corrected code"
                        name={`line_${line.id}_corrected_item_code`}
                        defaultValue={defaults.itemCode}
                      />
                      <TextInput
                        label="Corrected description"
                        name={`line_${line.id}_corrected_description`}
                        defaultValue={defaults.description}
                      />
                      <TextInput
                        label="Corrected qty"
                        name={`line_${line.id}_corrected_quantity`}
                        type="number"
                        defaultValue={defaults.quantity}
                      />
                      <TextInput
                        label="Corrected unit"
                        name={`line_${line.id}_corrected_unit`}
                        defaultValue={defaults.unit}
                      />
                      <TextInput
                        label="Corrected unit price"
                        name={`line_${line.id}_corrected_unit_price`}
                        type="number"
                        defaultValue={defaults.unitPrice}
                      />
                      <TextInput
                        label="Corrected line total"
                        name={`line_${line.id}_corrected_line_total`}
                        type="number"
                        defaultValue={defaults.lineTotal}
                      />
                      <TextInput
                        label="Corrected tax"
                        name={`line_${line.id}_corrected_tax`}
                        type="number"
                        defaultValue={defaults.tax}
                      />
                      <label className="block md:col-span-2 xl:col-span-3">
                        <span className="text-xs font-semibold uppercase text-slate-500">
                          Review notes
                        </span>
                        <textarea
                          name={`line_${line.id}_review_notes`}
                          defaultValue={line.review_notes ?? ""}
                          rows={3}
                          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
                        />
                      </label>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Commit preview placeholder
              </h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {[
                  "Supplier create/confirm is planned for 073",
                  "Supplier item creation is not active yet",
                  "Internal item mapping is not active yet",
                  "Price observations are not written yet",
                  "Approved supplier prices are not updated yet",
                  "No stock movements are created",
                ].map((action) => (
                  <div
                    key={action}
                    className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                  >
                    {action}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Validation panel
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  ["Invoice number/date/total present", invoiceReady],
                  ["Line classifications selected", lineClassificationsReady],
                  ["Totals reconcile", totalsReconcile],
                  ["Duplicate check handled in sample action", true],
                  ["Commit flow implemented", false],
                ].map(([label, passed]) => (
                  <div
                    key={String(label)}
                    className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-slate-700">
                      {label}
                    </span>
                    <StatusBadge tone={passed ? "success" : "warning"}>
                      {passed ? "Ready" : "Pending"}
                    </StatusBadge>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-clean-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-clean-green-900"
                >
                  Save review progress
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center rounded-md border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400"
                >
                  Commit disabled until commit flow is implemented
                </button>
              </div>
            </div>
          </section>
        </div>
      </form>
    </AppShell>
  );
}
