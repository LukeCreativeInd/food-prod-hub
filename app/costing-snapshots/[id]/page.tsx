import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { archiveCostingSnapshotAction } from "@/app/costing-snapshots/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getCostingSnapshotDetail } from "@/lib/costing-snapshot-data";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    snapshot?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Costing Snapshot - EveryBatch",
};

function actionMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<string, string> = {
    archived: "Costing snapshot archived.",
    archive_error: "Costing snapshot could not be archived.",
    invalid: "The snapshot action was missing required details.",
  };

  return messages[status] ?? null;
}

export default async function CostingSnapshotDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const detail = await getCostingSnapshotDetail(id);

  if (!detail) {
    notFound();
  }

  const message = actionMessage(query.snapshot);
  const isArchived = detail.snapshot.statusLabel === "Archived";
  const supportTicketHref = `/support/tickets/new?${new URLSearchParams({
    relatedPath: `/costing-snapshots/${detail.snapshot.id}`,
    moduleKey: "costing_snapshots",
    category: "costings",
  }).toString()}`;

  return (
    <AppShell>
      <PageHeader
        title="Costing Snapshot"
        description="Locked manual costing record for formula, input cost and margin review."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <PageActionButton href={detail.snapshot.itemHref} variant="secondary">
            Back to item
          </PageActionButton>
          <PageActionButton href="/costings" variant="secondary">
            Costings
          </PageActionButton>
          <PageActionButton href={supportTicketHref} variant="secondary">
            Get help
          </PageActionButton>
          <StatusBadge tone={detail.snapshot.statusTone}>
            {detail.snapshot.statusLabel}
          </StatusBadge>
        </div>

        {message ? (
          <div className="rounded-md border border-[color:var(--tenant-primary-border)] bg-[var(--tenant-primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--tenant-primary)]">
            {message}
          </div>
        ) : null}

        <SectionCard
          title={detail.snapshot.typeLabel}
          description="Snapshot values are frozen for review and comparison. They do not update when formula lines, supplier prices or sell prices change later."
          action={
            detail.canManage && !isArchived ? (
              <form action={archiveCostingSnapshotAction}>
                <input name="snapshot_id" type="hidden" value={detail.snapshot.id} />
                <button
                  className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  type="submit"
                >
                  Archive snapshot
                </button>
              </form>
            ) : (
              <StatusBadge tone="info">Locked record</StatusBadge>
            )
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Item", detail.snapshot.itemName],
              ["Created", detail.snapshot.createdAt],
              ["Formula", detail.snapshot.formulaVersion],
              ["Output", detail.snapshot.output],
              ["Source", detail.snapshot.source],
              ["Currency", detail.snapshot.currency],
              ["Sell price", detail.snapshot.sellPrice],
              ["Archived", detail.snapshot.archivedAt],
            ].map(([label, value]) => (
              <div
                className="rounded-md border border-slate-200 bg-slate-50/70 px-4 py-3"
                key={label}
              >
                <p className="text-xs font-semibold uppercase text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {detail.snapshot.blockedReason !== "None" ? (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              <span className="font-semibold">Blocked snapshot:</span>{" "}
              {detail.snapshot.blockedReason}
            </div>
          ) : null}
        </SectionCard>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total formula cost"
            value={detail.snapshot.totalCost}
            helperText="Locked total for the formula output."
            badge="Snapshot"
            tone={detail.snapshot.statusTone}
            icon="$"
          />
          <StatCard
            label="Cost per output"
            value={detail.snapshot.costPerUnit}
            helperText="Locked cost per output unit."
            badge="Cost"
            tone={detail.snapshot.statusTone}
            icon="CU"
          />
          <StatCard
            label="Sell price"
            value={detail.snapshot.sellPriceAmount}
            helperText={detail.snapshot.taxMode}
            badge="Price"
            tone={detail.snapshot.sellPriceAmount === "Blocked" ? "warning" : "info"}
            icon="SP"
          />
          <StatCard
            label="Gross profit"
            value={detail.snapshot.grossProfit}
            helperText="Locked margin snapshot value."
            badge="Margin"
            tone={detail.snapshot.grossProfit === "Blocked" ? "warning" : "success"}
            icon="GP"
          />
          <StatCard
            label="Gross margin"
            value={detail.snapshot.grossMargin}
            helperText={`Markup: ${detail.snapshot.markup}`}
            badge="Margin"
            tone={detail.snapshot.grossMargin === "Blocked" ? "warning" : "success"}
            icon="%"
          />
        </section>

        <SectionCard
          title="Snapshot lines"
          description="Line values are copied from the formula and costing sources at the moment the snapshot is created."
        >
          {detail.lines.length === 0 ? (
            <EmptyState
              title="No line details captured"
              description="This blocked snapshot was created before any active formula lines were available."
            />
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Input</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Unit cost</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {detail.lines.map((line) => (
                    <tr key={line.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {line.inputHref ? (
                          <Link
                            className="text-clean-green-700 hover:text-clean-green-900"
                            href={line.inputHref}
                          >
                            {line.inputName}
                          </Link>
                        ) : (
                          line.inputName
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{line.inputType}</td>
                      <td className="px-4 py-3 text-slate-600">{line.quantity}</td>
                      <td className="px-4 py-3 text-slate-600">{line.unitCost}</td>
                      <td className="px-4 py-3 text-slate-600">{line.totalCost}</td>
                      <td className="px-4 py-3 text-slate-600">{line.supplier}</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={line.statusTone}>{line.status}</StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{line.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Calculation notes"
          description="Notes explain how the snapshot was created and why blocked values remain locked for review."
        >
          <p className="text-sm leading-6 text-slate-600">
            {detail.snapshot.calculationNotes}
          </p>
        </SectionCard>
      </div>
    </AppShell>
  );
}
