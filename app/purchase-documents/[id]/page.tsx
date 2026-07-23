import Link from "next/link";

import { ActionSubmitButton } from "@/app/purchase-documents/action-submit-button";
import {
  commitPurchaseDocumentReviewAction,
  extractPurchaseDocumentAction,
  savePurchaseDocumentReviewAction,
} from "@/app/purchase-documents/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState, StatusBadge } from "@/components/ui";
import { userHasPermission } from "@/lib/auth";
import {
  getRepeatMatchNotes,
  getPurchaseDocumentUnknownParserDiagnostics,
  getReviewedInternalItemName,
  getReviewNotesWithoutStructuredMarkers,
  getPurchaseDocumentReview,
  type PurchaseDocumentLine,
} from "@/lib/purchase-document-intake";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    commit?: string;
    sample?: string;
    saved?: string;
    upload?: string;
    extract?: string;
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
  ["committed", "Committed"],
];

const stockLineClassifications = [
  "ingredient",
  "packaging",
  "consumable",
  "equipment",
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

function formatFileSize(value: number | null) {
  if (value === null) {
    return "Not recorded";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  const kilobytes = value / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusTone(status: string) {
  if (status === "ready_to_commit" || status === "ready" || status === "committed") {
    return "success" as const;
  }

  if (status === "failed" || status === "rejected" || status === "duplicate") {
    return "danger" as const;
  }

  if (status === "uploaded" || status === "processing") {
    return "info" as const;
  }

  return "warning" as const;
}

function messageFor(
  commit?: string,
  sample?: string,
  saved?: string,
  upload?: string,
  extract?: string,
) {
  if (extract === "success") {
    return "Extraction completed. Review and correct the extracted values before committing.";
  }

  if (extract === "already_extracted") {
    return "Extraction has already created review lines for this document. No duplicate lines were created.";
  }

  if (extract === "unsupported") {
    return "Extraction for this file type is not connected yet.";
  }

  if (extract === "missing_source") {
    return "Source file is missing. Upload a source PDF before extraction.";
  }

  if (extract === "storage_error") {
    return "Could not read the source file from private storage. Confirm view permission and storage policies.";
  }

  if (extract === "no_text") {
    return "No extractable embedded PDF text was found. OCR is not connected yet.";
  }

  if (extract === "unknown_parser" || extract === "unknown_pattern") {
    return "This invoice was uploaded and text was extracted, but no supplier parser recognises this layout yet.";
  }

  if (extract === "committed") {
    return "Committed purchase documents cannot be extracted again.";
  }

  if (extract === "failed") {
    return "Unexpected extraction failure. No supplier, item or price records were committed.";
  }

  if (upload === "created") {
    return "Purchase document uploaded. Extraction is not connected yet, so review fields can be filled after a future extraction step.";
  }

  if (upload === "duplicate") {
    return "This document appears to have already been uploaded. The existing record was opened instead of creating a duplicate.";
  }

  if (commit === "committed") {
    return "Purchase document committed. Supplier, item, mapping, price and informational-rule records were created or reused.";
  }

  if (commit === "already_committed") {
    return "Purchase document was already committed. No duplicate records were created.";
  }

  if (commit === "validation_failed") {
    return "Purchase document needs more review before commit.";
  }

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

function repeatNoteTone(note: string) {
  if (
    note.includes("Price change detected") ||
    note.includes("required") ||
    note.includes("New ")
  ) {
    return "warning" as const;
  }

  if (note.includes("not found")) {
    return "warning" as const;
  }

  if (
    note.includes("Matched") ||
    note.includes("Known") ||
    note.includes("found") ||
    note.includes("unchanged") ||
    note.includes("current")
  ) {
    return "success" as const;
  }

  return "info" as const;
}

function priceComparisonNotes(notes: string[]) {
  return notes.filter(
    (note) =>
      note.includes("Price unchanged") ||
      note.includes("Price change detected") ||
      note.includes("Price change amount") ||
      note.includes("Price decision"),
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
  const isStockLine = [
    "ingredient",
    "packaging",
    "consumable",
    "equipment",
  ].includes(line.classification);

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
    internalItemName:
      getReviewedInternalItemName(line) ??
      (isStockLine && line.line_number === 1 ? "Chicken Thigh" : ""),
    reviewNotes: getReviewNotesWithoutStructuredMarkers(line.review_notes) ?? "",
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

  const { document, lines, sourceFile } = review;
  const message = messageFor(
    query.commit,
    query.sample,
    query.saved,
    query.upload,
    query.extract,
  );
  const canCommit = await userHasPermission("purchase_documents.commit");
  const canReview = await userHasPermission("purchase_documents.review");
  const unknownParserDiagnostics =
    canReview &&
    (query.extract === "unknown_parser" || query.extract === "unknown_pattern")
      ? await getPurchaseDocumentUnknownParserDiagnostics(document.id)
      : null;
  const isCommitted = document.status === "committed";
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
  const hasLines = lines.length > 0;
  const canExtract =
    Boolean(document.storage_path) && !hasLines && !isCommitted;
  const unresolvedLines = lines.some((line) => line.status === "deferred");
  const stockLines = lines.filter((line) =>
    stockLineClassifications.includes(line.classification),
  );
  const internalItemNamesReady =
    stockLines.length === 0 ||
    stockLines.every((line) => Boolean(getReviewedInternalItemName(line)));
  const supportedCommitFlow = hasLines && lineClassificationsReady;
  const commitReady =
    supportedCommitFlow &&
    !isCommitted &&
    !["duplicate", "rejected", "failed"].includes(document.status) &&
    invoiceReady &&
    lineClassificationsReady &&
    internalItemNamesReady &&
    !unresolvedLines;
  const reviewedStockLine = stockLines[0];
  const reviewedInternalItemName =
    reviewedStockLine ? getReviewedInternalItemName(reviewedStockLine) : null;
  const previewInternalItemName =
    reviewedInternalItemName ?? "reviewer-selected internal item";
  const supplierPreview =
    document.supplier_trading_name_source ??
    document.supplier_legal_name_source ??
    document.supplier_display_name ??
    "Reviewed supplier";
  const stockLineCount = stockLines.length;
  const informationalLineCount = lines.filter(
    (line) => line.classification === "informational",
  ).length;
  const committedSummary = [
    ["Supplier", document.supplier_display_name ?? supplierPreview],
    ["Supplier aliases", "Legal, trading, invoice, ABN and account where present"],
    ["Supplier items", `${stockLineCount} stock/catalogue line(s) linked`],
    ["Internal items", `${stockLineCount} reviewed item name(s) linked`],
    ["Mappings", `${stockLineCount} confirmed mapping(s)`],
    ["Price observations", `${stockLineCount} stock/catalogue price observation(s)`],
    ["Approved supplier prices", "Updated only when price decision is update current price"],
    ["Informational rules", `${informationalLineCount} informational line rule(s)`],
    ["Stock movements", "None created"],
    ["Supplier payment/bank details", "Not updated"],
    ["Source descriptions", "Preserved"],
  ];

  return (
    <AppShell>
      <PageHeader
        title="Review Import"
        description="Review supplier invoice data before committing supplier catalogue, internal item mapping and approved price records."
      />

      <form action={savePurchaseDocumentReviewAction}>
        <input type="hidden" name="document_id" value={document.id} />

        <div className="space-y-6 px-5 py-6 md:px-8">
          {message ? (
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
              {message}
            </div>
          ) : null}

          {unknownParserDiagnostics ? (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone="warning">Parser needed</StatusBadge>
                    <StatusBadge tone="info">Source file saved</StatusBadge>
                    <StatusBadge tone="neutral">No lines created</StatusBadge>
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-amber-950">
                    Unknown invoice layout
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    The source file remains saved in private tenant storage, but no
                    supplier, item, price or stock records were created. Use these
                    diagnostics to add the next supplier parser.
                  </p>
                </div>
                <div className="rounded-md border border-amber-300 bg-white/70 px-4 py-3 text-sm font-semibold text-amber-950">
                  {unknownParserDiagnostics.reason}
                </div>
              </div>

              <details className="mt-5 rounded-md border border-amber-300 bg-white">
                <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-amber-950">
                  Parser diagnostics
                </summary>
                <div className="space-y-4 border-t border-amber-100 p-4">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <FieldPreview
                      label="Extracted text length"
                      value={String(unknownParserDiagnostics.extractedTextLength)}
                    />
                    <FieldPreview
                      label="Best candidate"
                      value={unknownParserDiagnostics.bestCandidateName}
                    />
                    <FieldPreview
                      label="Best candidate score"
                      value={String(unknownParserDiagnostics.bestCandidateScore)}
                    />
                    <FieldPreview
                      label="Matched anchors"
                      value={
                        unknownParserDiagnostics.bestCandidateMatchedAnchors.length > 0
                          ? unknownParserDiagnostics.bestCandidateMatchedAnchors.join(", ")
                          : "None"
                      }
                    />
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Parsers checked
                    </p>
                    <div className="mt-3 space-y-2">
                      {unknownParserDiagnostics.parserCandidatesChecked.map(
                        (parser) => (
                          <div
                            key={parser.parserKey}
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                          >
                            <span className="font-semibold text-slate-950">
                              {parser.parserLabel}
                            </span>{" "}
                            score {parser.score}. {parser.reason}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-950 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-300">
                      Extracted text preview
                    </p>
                    <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-100">
                      {unknownParserDiagnostics.safeTextPreview}
                    </pre>
                  </div>
                </div>
              </details>
            </section>
          ) : query.extract === "unknown_parser" || query.extract === "unknown_pattern" ? (
            <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Parser diagnostics require purchase document review permission and
              an accessible text-based PDF source file. No review lines or committed
              records were created.
            </section>
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
                  {document.storage_path ? (
                    <StatusBadge tone="success">Storage-backed</StatusBadge>
                  ) : null}
                  {isCommitted ? (
                    <StatusBadge tone="success">Committed records linked</StatusBadge>
                  ) : null}
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
                {isCommitted
                  ? "This document is committed. Re-running commit is disabled from the UI and the server action is idempotent."
                  : hasLines
                    ? "Commit will create/reuse supplier, aliases, supplier items, internal items, mappings, price observations, approved prices and informational rules for this tenant only. No stock movements or supplier payment/bank detail updates are created."
                    : "Extraction is review-first. Commit becomes available after supported parser lines are extracted and reviewed."}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Source document
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Source files are loaded through short-lived signed URLs for
                authorised users. Extraction is not connected yet.
              </p>
              <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">
                  {document.original_filename}
                </p>
                <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-1">
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      File type
                    </dt>
                    <dd className="mt-1 font-semibold text-slate-800">
                      {document.mime_type ?? "Not recorded"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      File size
                    </dt>
                    <dd className="mt-1 font-semibold text-slate-800">
                      {formatFileSize(document.file_size_bytes)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      Storage status
                    </dt>
                    <dd className="mt-1 font-semibold text-slate-800">
                      {document.storage_path
                        ? "Stored in private tenant storage"
                        : "No uploaded file stored"}
                    </dd>
                  </div>
                </dl>
                {sourceFile.error ? (
                  <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                    {sourceFile.error}
                  </div>
                ) : null}
                {sourceFile.signedUrl ? (
                  <div className="mt-4 space-y-3">
                    <a
                      href={sourceFile.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                    >
                      Open source document
                    </a>
                    <iframe
                      title="Source purchase document preview"
                      src={sourceFile.signedUrl}
                      className="h-96 w-full rounded-md border border-slate-200 bg-white"
                    />
                  </div>
                ) : null}
                {lines.length === 0 ? (
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Extraction has not created invoice lines yet. Use the
                    extraction action for supported text-based PDF invoices, or
                    wait for a future OCR/image extraction step.
                  </p>
                ) : null}
                {canExtract ? (
                  <div className="mt-4">
                    <ActionSubmitButton
                      pendingLabel="Extracting..."
                      formAction={extractPurchaseDocumentAction}
                      variant="secondary"
                    >
                      Extract invoice data
                    </ActionSubmitButton>
                  </div>
                ) : null}
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
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone="warning">Review source data</StatusBadge>
                    {document.supplier_id ? (
                      <StatusBadge tone="success">Matched supplier</StatusBadge>
                    ) : (
                      <StatusBadge tone="warning">New supplier required</StatusBadge>
                    )}
                  </div>
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
                      document.status === "committed"
                        ? "committed"
                        : document.status === "ready_to_commit"
                        ? "ready_to_commit"
                        : "needs_review"
                    }
                    options={[
                      ["needs_review", "Needs review"],
                      ["ready_to_commit", "Ready to commit"],
                      ["committed", "Committed"],
                    ]}
                  />
                </div>
              </section>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-950">
                Invoice lines
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Supplier source descriptions, corrected supplier descriptions
                and internal item names stay separate.
              </p>
            </div>
            {hasLines ? (
              <div className="divide-y divide-slate-200">
                {lines.map((line) => {
                const defaults = lineReviewDefaults(line);
                const repeatNotes = getRepeatMatchNotes(line);
                const priceNotes = priceComparisonNotes(repeatNotes);

                return (
                  <article key={line.id} className="px-5 py-5">
                    <input type="hidden" name="line_ids" value={line.id} />
                    <div className="grid gap-4 xl:grid-cols-[0.7fr_1.2fr_0.45fr_0.45fr_0.55fr_auto] xl:items-start">
                      <FieldPreview
                        label="Supplier item code"
                        value={line.source_item_code ?? "No code"}
                      />
                      <FieldPreview
                        label="Supplier source description"
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
                    {repeatNotes.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {repeatNotes.map((note) => (
                          <StatusBadge key={note} tone={repeatNoteTone(note)}>
                            {note}
                          </StatusBadge>
                        ))}
                      </div>
                    ) : null}
                    {priceNotes.length > 0 ? (
                      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase text-amber-800">
                          Price comparison
                        </p>
                        <div className="mt-2 space-y-1">
                          {priceNotes.map((note) => (
                            <p
                              key={note}
                              className="text-sm font-semibold text-amber-950"
                            >
                              {note}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : null}
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
                        label="Corrected supplier code"
                        name={`line_${line.id}_corrected_item_code`}
                        defaultValue={defaults.itemCode}
                      />
                      <TextInput
                        label="Corrected supplier description"
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
                      {[
                        "ingredient",
                        "packaging",
                        "consumable",
                        "equipment",
                      ].includes(line.classification) ? (
                        <TextInput
                          label="Internal item name"
                          name={`line_${line.id}_internal_item_name`}
                          defaultValue={defaults.internalItemName}
                        />
                      ) : (
                        <label className="block">
                          <span className="text-xs font-semibold uppercase text-slate-500">
                            Internal item name
                          </span>
                          <input
                            type="text"
                            disabled
                            value="Internal item not required"
                            className="mt-2 w-full cursor-not-allowed rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-500"
                          />
                        </label>
                      )}
                      <FieldPreview
                        label="Price decision"
                        value={
                          priceNotes.some((note) =>
                            note.includes("Price unchanged"),
                          )
                            ? "Observation only"
                            : priceNotes.some((note) =>
                                note.includes("Price change detected"),
                              )
                              ? "Review price decision"
                              : line.classification === "informational"
                                ? "Informational / ignored"
                                : "Update current price"
                        }
                      />
                      <label className="block md:col-span-2 xl:col-span-2">
                        <span className="text-xs font-semibold uppercase text-slate-500">
                          Review notes
                        </span>
                        <textarea
                          name={`line_${line.id}_review_notes`}
                          defaultValue={defaults.reviewNotes}
                          rows={3}
                          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
                        />
                      </label>
                    </div>
                  </article>
                );
                })}
              </div>
            ) : (
              <div className="p-5">
                <EmptyState
                  title="No extracted invoice lines yet"
                  description="The source document is uploaded, but extraction is not connected yet. A follow-up will create reviewed draft lines from the uploaded invoice."
                />
              </div>
            )}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                {isCommitted ? "Commit result" : "Proposed commit actions"}
              </h2>
              {isCommitted ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {committedSummary.map(([label, value]) => (
                    <FieldPreview key={label} label={label} value={value} />
                  ))}
                </div>
              ) : !hasLines ? (
                <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  Extraction is pending. No supplier, item, mapping, price or
                  stock records can be committed until reviewed invoice lines
                  exist.
                </div>
              ) : (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {[
                    `Create/reuse supplier: ${supplierPreview}`,
                    "Create/reuse aliases: legal, trading, invoice, ABN and account",
                    `Create/reuse supplier items: ${stockLineCount} stock/catalogue line(s)`,
                    `Create/reuse internal items: ${stockLineCount === 1 ? previewInternalItemName : `${stockLineCount} reviewed item names`}`,
                    `Confirm supplier item mappings: ${stockLineCount}`,
                    `Create/reuse price observations: ${stockLineCount}`,
                    "Create/update approved current prices where decision is update_current_price",
                    `Create/reuse informational ignored rules: ${informationalLineCount}`,
                    "No stock movements are created",
                    "No supplier payment/bank details are updated",
                    "Supplier source descriptions are preserved",
                  ].map((action) => (
                    <div
                      key={action}
                      className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                    >
                      {action}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Validation and guardrails
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  ["Invoice number/date/total present", invoiceReady],
                  ["Line classifications selected", lineClassificationsReady],
                  ["Internal item names present for stock/catalogue lines", internalItemNamesReady],
                  ["Price decisions selected or defaulted", hasLines],
                  ["Totals reconcile", totalsReconcile],
                  ["Unknown/deferred lines resolved", !unresolvedLines],
                  ["Generic commit flow implemented", supportedCommitFlow],
                  ["No stock movements created by commit", true],
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
                <ActionSubmitButton
                  pendingLabel="Saving..."
                  disabled={isCommitted}
                  variant="primary"
                >
                  {isCommitted ? "Review locked after commit" : "Save review progress"}
                </ActionSubmitButton>
                <ActionSubmitButton
                  pendingLabel="Committing..."
                  formAction={commitPurchaseDocumentReviewAction}
                  disabled={!canCommit || !commitReady}
                  variant="dark"
                >
                  {isCommitted
                    ? "Already committed"
                    : canCommit
                      ? "Commit reviewed records"
                      : "Commit permission required"}
                </ActionSubmitButton>
              </div>
            </div>
          </section>
        </div>
      </form>
    </AppShell>
  );
}
