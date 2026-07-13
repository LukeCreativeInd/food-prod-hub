import Link from "next/link";

import { createCammarotoSampleReviewAction } from "@/app/purchase-documents/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState, StatusBadge } from "@/components/ui";
import { getPurchaseDocumentsForCurrentOrganisation } from "@/lib/purchase-document-intake";

const workflowSteps = [
  "Upload Document",
  "Extract / Enter Document Data",
  "Review Import",
  "Commit Approved Records",
  "Show Import Result",
];

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCurrency(value: number | null, currency: string) {
  if (value === null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
  }).format(value);
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusTone(status: string) {
  if (status === "ready_to_commit" || status === "committed") {
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

export default async function PurchaseDocumentsPage() {
  const documents = await getPurchaseDocumentsForCurrentOrganisation();

  return (
    <AppShell>
      <PageHeader
        title="Purchase Documents"
        description="Upload and review supplier invoices before committing supplier catalogue and price records."
      />

      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone="info">Foundation v1</StatusBadge>
                <StatusBadge tone="success">Database-backed</StatusBadge>
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-950">
                Reviewed intake before trusted master data
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                This workspace starts the safe supplier invoice onboarding
                flow. It separates supplier source data from internal items,
                records invoice prices as observations later, and only updates
                current approved prices after a future commit flow.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
              Storage upload and OCR are planned follow-ups. The Cammaroto
              sample creates only a document review record and two review lines.
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-5">
          {workflowSteps.map((step, index) => (
            <article
              key={step}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-clean-green-700 text-sm font-bold text-white">
                {index + 1}
              </span>
              <p className="mt-3 text-sm font-bold text-slate-950">{step}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Upload / create review
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Accept PDF and common image files later. For v1, use the
                  sample review to validate the process safely.
                </p>
              </div>
              <StatusBadge tone="warning">Storage upload next</StatusBadge>
            </div>
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">
                File upload placeholder
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Future upload will validate MIME type, record file metadata,
                store a tenant-scoped storage path and capture a file
                fingerprint where practical. No OCR or extraction is connected
                yet.
              </p>
              <button
                type="button"
                disabled
                className="mt-4 inline-flex cursor-not-allowed items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-400"
              >
                Storage upload coming next
              </button>
            </div>
            <form action={createCammarotoSampleReviewAction}>
              <button
                type="submit"
                className="mt-4 inline-flex items-center justify-center rounded-md bg-clean-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-clean-green-900"
              >
                Create Cammaroto sample review
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-950">
                Document list
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Saved purchase document reviews for the current organisation.
                No real Clean Eats invoice data is imported automatically.
              </p>
            </div>
            {documents.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="No purchase documents yet"
                  description="Create the Cammaroto sample review to test the reviewed intake flow without creating supplier, item, stock or price master records."
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {documents.map((document) => (
                  <article key={document.id} className="px-5 py-4">
                    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr_0.8fr_0.7fr_auto] lg:items-center">
                      <div>
                        <p className="text-sm font-bold text-slate-950">
                          {document.original_filename}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {document.supplier_display_name ??
                            document.supplier_trading_name_source ??
                            document.supplier_legal_name_source ??
                            "Supplier not linked"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          Invoice
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {document.invoice_number ?? "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          Date / total
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {formatDate(document.invoice_date)} ·{" "}
                          {formatCurrency(
                            document.invoice_total,
                            document.currency,
                          )}
                        </p>
                      </div>
                      <div>
                        <StatusBadge tone={statusTone(document.status)}>
                          {formatStatus(document.status)}
                        </StatusBadge>
                        <p className="mt-2 text-xs text-slate-500">
                          Uploaded {formatDateTime(document.uploaded_at)}
                        </p>
                      </div>
                      <Link
                        href={`/purchase-documents/${document.id}`}
                        className="inline-flex w-fit items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                      >
                        Review
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
