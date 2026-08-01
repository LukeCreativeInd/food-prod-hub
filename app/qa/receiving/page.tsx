import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import {
  fetchReceivingQaChecks,
  type ReceivingQaListFilters,
} from "@/lib/qa-receiving-data";
import { QA_CHECK_INSTANCE_STATUSES } from "@/lib/qa-schema-types";

type PageProps = {
  searchParams: Promise<ReceivingQaListFilters & { qa?: string }>;
};

const filterInputClass =
  "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";

function actionMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<string, { text: string; tone: "success" | "warning" | "danger" | "info" }> = {
    invalid_check: { text: "The selected Receiving QA check could not be found.", tone: "warning" },
  };

  return messages[status] ?? { text: "Receiving QA action finished.", tone: "info" };
}

function FilterField({
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

export default async function ReceivingChecksPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const filters: ReceivingQaListFilters = {
    status: query.status,
    outcome: query.outcome,
    needsReview: query.needsReview,
    supplierId: query.supplierId,
    receiptId: query.receiptId,
  };
  const data = await fetchReceivingQaChecks(filters);
  const message = actionMessage(query.qa);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        {message ? (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
            <span>{message.text}</span>
            <StatusBadge tone={message.tone}>{query.qa ?? "status"}</StatusBadge>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Receiving checks"
            value={String(data.summary.total)}
            helperText="Real tenant QA checks linked to Goods Inwards."
            badge="Live"
            tone="info"
            icon="QA"
          />
          <StatCard
            label="In progress"
            value={String(data.summary.inProgress)}
            helperText="Draft or in-progress checks still editable."
            badge="Work"
            tone={data.summary.inProgress > 0 ? "warning" : "neutral"}
            icon="IP"
          />
          <StatCard
            label="Needs review"
            value={String(data.summary.needsReview)}
            helperText="Completed checks waiting for QA review."
            badge="Review"
            tone={data.summary.needsReview > 0 ? "danger" : "neutral"}
            icon="RV"
          />
          <StatCard
            label="Completed history"
            value={String(data.summary.completed)}
            helperText="Completed, reviewed or approved records."
            badge="History"
            tone="success"
            icon="OK"
          />
        </section>

        <SectionCard
          title="Receiving Checks"
          description="QA owns check records, results and reviews. Goods Inwards remains the source of truth for receipts and receipt lines."
          action={
            data.canCreate ? (
              <PageActionButton href="/qa/receiving/new">Start check</PageActionButton>
            ) : (
              <StatusBadge tone="info">Read only</StatusBadge>
            )
          }
        >
          <form className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-5">
            <FilterField label="Status">
              <select className={filterInputClass} defaultValue={filters.status ?? ""} name="status">
                <option value="">All statuses</option>
                {QA_CHECK_INSTANCE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Outcome">
              <select className={filterInputClass} defaultValue={filters.outcome ?? ""} name="outcome">
                <option value="">All outcomes</option>
                {["pending", "pass", "fail", "warning", "needs_review", "not_applicable"].map(
                  (outcome) => (
                    <option key={outcome} value={outcome}>
                      {outcome.replaceAll("_", " ")}
                    </option>
                  ),
                )}
              </select>
            </FilterField>
            <FilterField label="Needs review">
              <select
                className={filterInputClass}
                defaultValue={filters.needsReview ?? ""}
                name="needsReview"
              >
                <option value="">All checks</option>
                <option value="yes">Needs review only</option>
              </select>
            </FilterField>
            <FilterField label="Supplier">
              <select
                className={filterInputClass}
                defaultValue={filters.supplierId ?? ""}
                name="supplierId"
              >
                <option value="">All suppliers</option>
                {data.supplierOptions.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </FilterField>
            <div className="flex items-end gap-2">
              <button
                className="inline-flex w-full items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
                type="submit"
              >
                Apply filters
              </button>
            </div>
          </form>

          <div className="mt-5">
            {data.checks.length === 0 ? (
              <EmptyState
                title="No Receiving Checks have been created."
                description="Start a check from a Goods Inwards receipt after a published Receiving QA template exists."
                action={
                  data.canCreate ? (
                    <PageActionButton href="/qa/receiving/new">
                      Start first receiving check
                    </PageActionButton>
                  ) : undefined
                }
              />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Check</th>
                      <th className="px-4 py-3">Receipt</th>
                      <th className="px-4 py-3">Supplier</th>
                      <th className="px-4 py-3">Context</th>
                      <th className="px-4 py-3">Template</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Outcome</th>
                      <th className="px-4 py-3">Review</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {data.checks.map((check) => (
                      <tr key={check.id}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-950">{check.reference}</div>
                          <div className="text-xs text-slate-500">{check.createdAt}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{check.receiptReference}</td>
                        <td className="px-4 py-3 text-slate-600">{check.supplierName}</td>
                        <td className="px-4 py-3 text-slate-600">{check.lineContext}</td>
                        <td className="px-4 py-3 text-slate-600">
                          <div>{check.templateName}</div>
                          <div className="text-xs text-slate-500">{check.templateVersion}</div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={check.statusTone}>{check.statusLabel}</StatusBadge>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={check.outcomeTone}>{check.outcome}</StatusBadge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <StatusBadge tone={check.requiresReview ? "warning" : "neutral"}>
                              {check.requiresReview ? "Required" : "Not required"}
                            </StatusBadge>
                            <div className="text-xs text-slate-500">{check.reviewStatus}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            className="text-sm font-bold text-[var(--tenant-primary)] hover:underline"
                            href={`/qa/receiving/${check.id}`}
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
