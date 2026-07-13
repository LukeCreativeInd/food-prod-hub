import Link from "next/link";

import { ActionSubmitButton } from "@/app/purchase-documents/action-submit-button";
import { createCammarotoSampleReviewAction } from "@/app/purchase-documents/actions";
import { UploadDocumentForm } from "@/app/purchase-documents/upload-document-form";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState, StatusBadge } from "@/components/ui";
import {
  getPurchaseDocumentsForCurrentOrganisation,
  purchaseDocumentUploadConfig,
} from "@/lib/purchase-document-intake";

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
  if (status === "uploaded") {
    return "Uploaded / Extraction pending";
  }

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
  const reviewDocuments = documents.filter(
    (document) => document.status !== "committed",
  );
  const committedDocuments = documents.filter(
    (document) => document.status === "committed",
  );

  return (
    <AppShell>
      <PageHeader
        title="Purchase Documents"
        description="Review supplier invoices and purchase documents before committing supplier catalogue, internal item mappings and approved prices."
      />

      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone="info">Supplier invoice intake</StatusBadge>
                <StatusBadge tone="success">Database-backed</StatusBadge>
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-950">
                Intake overview
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Upload and review supplier invoices before committing trusted
                supplier data, supplier items, internal item mappings and price
                history. Source supplier descriptions stay preserved; internal
                items and approved prices are updated only after review.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
              Real tenant-scoped upload is now available. Extraction remains a
              reviewed follow-up, and the current sample invoice path is still
              available for testing the commit workflow end to end.
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
                  Sample/test invoice
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Create a controlled Cammaroto Poultry test invoice so the
                  intake workflow can be tested from review through commit.
                </p>
              </div>
              <StatusBadge tone="info">Sample workflow</StatusBadge>
            </div>
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">
                Cammaroto Poultry sample invoice
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Creates or opens the sample review for invoice SI-00025954.
                Duplicate prevention runs on the server, so clicking twice will
                not create duplicate review documents.
              </p>
              <form action={createCammarotoSampleReviewAction}>
                <div className="mt-4">
                  <ActionSubmitButton pendingLabel="Creating review...">
                    Create sample review
                  </ActionSubmitButton>
                </div>
              </form>
            </div>
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">
                Upload supplier invoice
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Upload PDF or common image files into private tenant-scoped
                storage. The system validates file type and size, stores a file
                fingerprint and prevents same-tenant duplicate uploads where
                practical. Extraction is not fully automated yet.
              </p>
              <UploadDocumentForm
                acceptedTypes={purchaseDocumentUploadConfig.supportedMimeTypes}
                maxUploadLabel={purchaseDocumentUploadConfig.maxUploadLabel}
                supportedUploadLabel={
                  purchaseDocumentUploadConfig.supportedUploadLabel
                }
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-950">
                Documents requiring review
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Saved supplier invoices that are not yet committed.
              </p>
            </div>
            {reviewDocuments.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="No documents waiting for review"
                  description="Create the sample review or, later, upload a supplier invoice to start a reviewed intake workflow."
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {reviewDocuments.map((document) => (
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
                        {document.status === "committed" ? "View" : "Review"}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-950">
              Recently reviewed/committed documents
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Committed records show the supplier, invoice details and linked
              review state from the database.
            </p>
          </div>
          {committedDocuments.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="No committed purchase documents yet"
                description="Committed supplier invoice reviews will appear here after approved records are created or linked."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {committedDocuments.map((document) => (
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
                        {formatCurrency(document.invoice_total, document.currency)}
                      </p>
                    </div>
                    <div>
                      <StatusBadge tone="success">Committed</StatusBadge>
                      <p className="mt-2 text-xs text-slate-500">
                        Uploaded {formatDateTime(document.uploaded_at)}
                      </p>
                    </div>
                    <Link
                      href={`/purchase-documents/${document.id}`}
                      className="inline-flex w-fit items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                    >
                      View
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
