import Link from "next/link";

import { startReceivingQaCheckAction } from "@/app/qa/receiving/actions";
import { AppShell } from "@/components/app-shell";
import { AlertCard, EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { fetchReceivingQaStartData } from "@/lib/qa-receiving-data";

type PageProps = {
  searchParams: Promise<{
    receipt?: string;
    qa?: string;
  }>;
};

const selectClass =
  "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";

function actionMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<string, { text: string; tone: "warning" | "danger" | "info" }> = {
    missing_required: { text: "Choose a receipt and a published Receiving QA template.", tone: "warning" },
    invalid_source: { text: "The selected receipt or template could not be used.", tone: "warning" },
    invalid_line: { text: "The selected receipt line does not belong to that receipt.", tone: "warning" },
    no_template: { text: "A published active Receiving QA template is required.", tone: "warning" },
    error: { text: "The Receiving QA check could not be started.", tone: "danger" },
  };

  return messages[status] ?? { text: "Receiving QA action finished.", tone: "info" };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export default async function NewReceivingQaCheckPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const data = await fetchReceivingQaStartData(query.receipt);
  const message = actionMessage(query.qa);
  const hasTemplates = data.templates.length > 0;
  const hasReceipts = data.receipts.length > 0;

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        {message ? (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
            <span>{message.text}</span>
            <StatusBadge tone={message.tone}>{query.qa ?? "status"}</StatusBadge>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Templates"
            value={String(data.templates.length)}
            helperText="Active Receiving templates with a published current version."
            badge="Required"
            tone={hasTemplates ? "success" : "warning"}
            icon="TP"
          />
          <StatCard
            label="Receipts"
            value={String(data.receipts.length)}
            helperText="Draft and posted Goods Inwards receipts available for QA checks."
            badge="Source"
            tone={hasReceipts ? "info" : "neutral"}
            icon="GI"
          />
          <StatCard
            label="Inventory hold"
            value="Not live"
            helperText="Failed checks may recommend review, but formal holds wait for task 217."
            badge="Task 217"
            tone="warning"
            icon="HL"
          />
        </section>

        {!hasTemplates ? (
          <SectionCard
            title="Published Receiving QA template required"
            description="Receiving checks use immutable published template versions. No default or sample QA template is created by this workflow."
            action={<StatusBadge tone="warning">Blocked</StatusBadge>}
          >
            <EmptyState
              title="No published Receiving QA template is available"
              description="Create, review and publish a Receiving QA template before starting operational receiving checks."
              action={
                <PageActionButton href="/qa/templates" variant="secondary">
                  Open QA Templates
                </PageActionButton>
              }
            />
          </SectionCard>
        ) : !hasReceipts ? (
          <SectionCard
            title="Goods Inwards receipt required"
            description="Receiving QA starts from a real Goods Inwards receipt or receipt line."
            action={<StatusBadge tone="warning">Blocked</StatusBadge>}
          >
            <EmptyState
              title="No Goods Inwards receipts are available"
              description="Create or post a Goods Inwards receipt before starting a Receiving QA check."
              action={
                <PageActionButton href="/goods-inwards" variant="secondary">
                  Open Goods Inwards
                </PageActionButton>
              }
            />
          </SectionCard>
        ) : !data.canCreate ? (
          <SectionCard
            title="Receiving QA creation is not available"
            description="You can view Receiving QA records, but starting a new check requires qa.checks.create."
            action={<StatusBadge tone="info">Read only</StatusBadge>}
          >
            <EmptyState
              title="You do not have permission to start Receiving QA checks"
              description="Ask an admin or QA manager to review your QA permissions if you need to create checks."
              action={
                <PageActionButton href="/qa/receiving" variant="secondary">
                  Back to Receiving Checks
                </PageActionButton>
              }
            />
          </SectionCard>
        ) : (
          <SectionCard
            title="Start Receiving Check"
            description="Choose a real receipt, optional receipt line and a published template. Goods Inwards remains the source record."
            action={<StatusBadge tone="info">Review first</StatusBadge>}
          >
            <form action={startReceivingQaCheckAction} className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-3">
                <Field label="Goods Inwards receipt">
                  <select
                    className={selectClass}
                    defaultValue={query.receipt ?? ""}
                    name="receipt_id"
                    required
                  >
                    <option value="">Choose receipt</option>
                    {data.receipts.map((receipt) => (
                      <option key={receipt.id} value={receipt.id}>
                        {receipt.receiptNumber} - {receipt.supplierName} - {receipt.statusLabel}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Receipt line">
                  <select className={selectClass} defaultValue="" name="receipt_line_id">
                    <option value="">Whole receipt check</option>
                    {data.selectedReceiptLines.map((line) => (
                      <option key={line.id} value={line.id}>
                        {line.itemName} - {line.quantity} {line.unit}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Receiving template">
                  <select className={selectClass} defaultValue="" name="template_id" required>
                    <option value="">Choose template</option>
                    {data.templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} - {template.versionLabel}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {data.selectedReceipt ? (
                <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Supplier", data.selectedReceipt.supplierName],
                    ["Reference", data.selectedReceipt.supplierReference],
                    ["Received", data.selectedReceipt.receivedAt],
                    ["Source invoice", data.selectedReceipt.purchaseDocumentLabel],
                    ["Status", data.selectedReceipt.statusLabel],
                    ["Lines", String(data.selectedReceipt.lineCount)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <AlertCard
                  title="Select a receipt to show line context"
                  description="Use a receipt card below to load line-level options, or start a whole-receipt check directly from the receipt selector."
                  meta="Context"
                  tone="info"
                />
              )}

              {data.selectedReceiptLines.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {data.selectedReceiptLines.map((line) => (
                    <article
                      key={line.id}
                      className="rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-950">{line.itemName}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {line.quantity} {line.unit} into {line.locationName}
                          </p>
                        </div>
                        <StatusBadge tone="neutral">{line.lineStatus}</StatusBadge>
                      </div>
                      <dl className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                        <div>
                          <dt className="font-semibold uppercase">Lot</dt>
                          <dd>{line.lotNumber}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold uppercase">Expiry</dt>
                          <dd>{line.expiryDate}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold uppercase">QA status</dt>
                          <dd>{line.qaStatus}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {data.receipts.slice(0, 12).map((receipt) => (
                    <article
                      key={receipt.id}
                      className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-bold text-slate-950">
                              {receipt.receiptNumber}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              {receipt.supplierName}
                            </p>
                          </div>
                          <StatusBadge tone="neutral">{receipt.statusLabel}</StatusBadge>
                        </div>
                        <dl className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                          <div>
                            <dt className="font-semibold uppercase">Received</dt>
                            <dd>{receipt.receivedAt}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase">Lines</dt>
                            <dd>{receipt.lineCount}</dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="font-semibold uppercase">Source invoice</dt>
                            <dd>{receipt.purchaseDocumentLabel}</dd>
                          </div>
                        </dl>
                      </div>
                      <Link
                        className="mt-4 inline-flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                        href={`/qa/receiving/new?receipt=${receipt.id}`}
                      >
                        Use this receipt
                      </Link>
                    </article>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
                  type="submit"
                >
                  Start Receiving Check
                </button>
                <Link
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  href="/qa/receiving"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </SectionCard>
        )}

        <SectionCard
          title="Task 216 boundary"
          description="Receiving QA checks can capture review recommendations, but they do not create formal QA holds or change inventory availability."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <AlertCard
              title="Goods Inwards source"
              description="Receipts and receipt lines remain owned by Goods Inwards. QA stores references to them."
              tone="info"
            />
            <AlertCard
              title="Review only"
              description="Failed results can mark a check as needing review and can recommend hold review."
              tone="warning"
            />
            <AlertCard
              title="No availability change"
              description="Formal hold/release and stock availability control begins in task 217."
              tone="neutral"
            />
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
