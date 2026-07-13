import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { requirePermissionAccess } from "@/lib/auth";

const documents = [
  {
    id: "cammaroto-si-00025954",
    document: "Cammaroto Poultry invoice",
    supplier: "Cammaroto Poultry",
    invoiceNumber: "SI-00025954",
    invoiceDate: "13/07/2026",
    total: "$548.00",
    status: "Needs review",
    uploaded: "Sample scaffold",
  },
];

const workflowSteps = [
  "Upload Document",
  "Extract / Enter Document Data",
  "Review Import",
  "Commit Approved Records",
  "Show Import Result",
];

function IntakeBadge({
  children,
  tone = "neutral",
}: {
  children: string;
  tone?: "neutral" | "info" | "warning" | "success";
}) {
  const tones = {
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
    info: "border-sky-200 bg-sky-50 text-sky-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default async function PurchaseDocumentsPage() {
  await requirePermissionAccess("purchase_documents.view");

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
                <IntakeBadge tone="info">Foundation v1</IntakeBadge>
                <IntakeBadge tone="warning">Static scaffold</IntakeBadge>
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-950">
                Reviewed intake before trusted master data
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                This workspace starts the safe supplier invoice onboarding
                flow. It separates supplier source data from internal items,
                records invoice prices as observations, and only updates current
                approved prices after review.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
              Storage upload is planned as a follow-up. This screen currently
              shows the Cammaroto sample review path only.
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
              <IntakeBadge tone="warning">Upload follow-up</IntakeBadge>
            </div>
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">
                File upload placeholder
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Future upload will validate MIME type, record file metadata,
                store a tenant-scoped storage path and capture a file
                fingerprint where practical.
              </p>
              <button
                type="button"
                disabled
                className="mt-4 inline-flex cursor-not-allowed items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-400"
              >
                Upload disabled in scaffold
              </button>
            </div>
            <Link
              href="/purchase-documents/cammaroto-si-00025954"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-clean-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-clean-green-900"
            >
              Create sample Cammaroto review
            </Link>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-950">
                Document list
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Static sample records only. No real Clean Eats invoice data is
                imported automatically.
              </p>
            </div>
            <div className="divide-y divide-slate-200">
              {documents.map((document) => (
                <article key={document.id} className="px-5 py-4">
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr_0.8fr_0.7fr_auto] lg:items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-950">
                        {document.document}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {document.supplier}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Invoice
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {document.invoiceNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Date / total
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {document.invoiceDate} · {document.total}
                      </p>
                    </div>
                    <div>
                      <IntakeBadge tone="warning">{document.status}</IntakeBadge>
                      <p className="mt-2 text-xs text-slate-500">
                        {document.uploaded}
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
          </div>
        </section>
      </div>
    </AppShell>
  );
}
