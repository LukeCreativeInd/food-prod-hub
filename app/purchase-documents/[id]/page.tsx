import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { requirePermissionAccess } from "@/lib/auth";

const supplierFields = [
  ["Legal / invoice name", "Surefire Solutions Group Unit Trust"],
  ["Trading name", "Cammaroto Poultry"],
  ["Tenant display name", "Cammaroto Poultry"],
  ["ABN", "84 870 751 768"],
  ["Account number", "555"],
];

const invoiceFields = [
  ["Invoice number", "SI-00025954"],
  ["Invoice date", "2026-07-13"],
  ["Tax total", "$0.00"],
  ["Invoice total", "$548.00"],
  ["Currency", "AUD"],
];

const lines = [
  {
    code: "T/F-DCE M-VA",
    description: "THIGH FILLET NO SKIN DICEDMARINATED VAC PACK",
    quantity: "40.00",
    unit: "KG",
    unitPrice: "$13.70",
    total: "$548.00",
    classification: "Ingredient",
    supplierItem: "Create supplier item",
    internalItem: "Chicken Thigh",
    priceDecision: "Update current costing price",
    status: "Ready",
  },
  {
    code: "CTNS",
    description: "CARTONS",
    quantity: "3.00",
    unit: "CTNS",
    unitPrice: "$0.00",
    total: "$0.00",
    classification: "Informational",
    supplierItem: "Do not create",
    internalItem: "Not required",
    priceDecision: "Ignored",
    status: "Ready",
  },
];

const proposedActions = [
  "Create/confirm supplier: Cammaroto Poultry",
  "Save legal/invoice alias: Surefire Solutions Group Unit Trust",
  "Save ABN alias: 84 870 751 768",
  "Create supplier item: T/F-DCE M-VA",
  "Create/map internal ingredient: Chicken Thigh",
  "Record price observation: 40 KG at $13.70/kg",
  "Optionally update approved supplier price",
  "Save CTNS/CARTONS informational rule",
];

const validationItems = [
  ["Supplier resolved", "Ready"],
  ["Invoice number/date present", "Ready"],
  ["Totals reconcile", "Ready"],
  ["Stock line mapped to internal item", "Ready"],
  ["Price decision selected", "Ready"],
  ["Duplicate detected", "No"],
];

function ReviewBadge({
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

function FieldPreview({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export default async function PurchaseDocumentReviewPage() {
  await requirePermissionAccess("purchase_documents.view");

  return (
    <AppShell>
      <PageHeader
        title="Review Purchase Document"
        description="Review extracted invoice data before supplier, item mapping and price records are committed."
      />

      <div className="space-y-6 px-5 py-6 md:px-8">
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
                <ReviewBadge tone="warning">Needs review</ReviewBadge>
                <ReviewBadge tone="info">Static Cammaroto sample</ReviewBadge>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-950">
                Cammaroto Poultry · SI-00025954
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Invoice dated 13/07/2026, total $548.00 AUD. This review
                screen is a scaffold and does not write records yet.
              </p>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Commit is disabled until the reviewed server action/storage flow
              is implemented and manually reviewed.
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
                Cammaroto invoice sample
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Surefire Solutions Group Unit Trust trading as Cammaroto
                Poultry, customer 555, invoice SI-00025954.
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
                <ReviewBadge tone="success">Match/create ready</ReviewBadge>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {supplierFields.map(([label, value]) => (
                  <FieldPreview key={label} label={label} value={value} />
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Invoice metadata
              </h2>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {invoiceFields.map(([label, value]) => (
                  <FieldPreview key={label} label={label} value={value} />
                ))}
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
            {lines.map((line) => (
              <article key={line.code} className="px-5 py-5">
                <div className="grid gap-4 xl:grid-cols-[0.8fr_1.4fr_0.5fr_0.5fr_0.6fr_0.6fr] xl:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Code
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-950">
                      {line.code}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Source description
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {line.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Qty
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {line.quantity} {line.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Unit price
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {line.unitPrice}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Total
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {line.total}
                    </p>
                  </div>
                  <ReviewBadge tone="success">{line.status}</ReviewBadge>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <FieldPreview
                    label="Classification"
                    value={line.classification}
                  />
                  <FieldPreview
                    label="Supplier item"
                    value={line.supplierItem}
                  />
                  <FieldPreview
                    label="Internal item"
                    value={line.internalItem}
                  />
                  <FieldPreview
                    label="Price decision"
                    value={line.priceDecision}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Proposed actions / commit preview
            </h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {proposedActions.map((action) => (
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
              {validationItems.map(([label, status]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm font-semibold text-slate-700">
                    {label}
                  </span>
                  <ReviewBadge tone={status === "No" ? "info" : "success"}>
                    {status}
                  </ReviewBadge>
                </div>
              ))}
            </div>
            <button
              type="button"
              disabled
              className="mt-5 inline-flex cursor-not-allowed items-center rounded-md border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400"
            >
              Commit disabled in scaffold
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
