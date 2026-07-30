import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { fetchInventoryReceipts } from "@/lib/goods-inwards-data";

type PageProps = {
  searchParams: Promise<{
    receipt?: string;
  }>;
};

function actionMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<string, string> = {
    invalid_receipt: "The selected receipt could not be found.",
  };

  return messages[status] ?? "Goods Inwards action finished.";
}

export default async function GoodsInwardsPage({ searchParams }: PageProps) {
  const [data, query] = await Promise.all([
    fetchInventoryReceipts(),
    searchParams,
  ]);
  const message = actionMessage(query.receipt);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        {message ? (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
            <span>{message}</span>
            <StatusBadge tone="info">{query.receipt ?? "status"}</StatusBadge>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Receipts"
            value={String(data.summary.total)}
            helperText="Real tenant Goods Inwards receipts."
            badge="Live"
            tone="info"
            icon="GI"
          />
          <StatCard
            label="Draft"
            value={String(data.summary.draft)}
            helperText="Editable receiving records not posted to stock yet."
            badge="Review"
            tone={data.summary.draft > 0 ? "warning" : "neutral"}
            icon="DR"
          />
          <StatCard
            label="Posted"
            value={String(data.summary.posted)}
            helperText="Receipts that created lots and stock movements."
            badge="Stock"
            tone="success"
            icon="ST"
          />
          <StatCard
            label="Cancelled"
            value={String(data.summary.cancelled)}
            helperText="Cancelled drafts retained for receiving history."
            badge="History"
            tone="neutral"
            icon="CA"
          />
        </section>

        <SectionCard
          title="Goods Inwards"
          description="Receive supplier deliveries into stock locations. Posting creates inventory lots and stock movement ledger entries."
          action={
            data.canCreateReceipts ? (
              <PageActionButton href="/goods-inwards/new">New receipt</PageActionButton>
            ) : (
              <StatusBadge tone="info">Read only</StatusBadge>
            )
          }
        >
          {data.receipts.length === 0 ? (
            <EmptyState
              title="No receipts yet"
              description="Create a draft receipt when a supplier delivery arrives. Receipts stay draft until reviewed and posted."
              action={
                data.canCreateReceipts ? (
                  <PageActionButton href="/goods-inwards/new">
                    Create first receipt
                  </PageActionButton>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Receipt</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Received</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Lines</th>
                    <th className="px-4 py-3">Posted</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {data.receipts.map((receipt) => (
                    <tr key={receipt.id}>
                      <td className="px-4 py-3 font-semibold text-slate-950">
                        {receipt.receiptNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {receipt.supplierName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {receipt.supplierReference}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {receipt.receivedAt}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={receipt.statusTone}>
                          {receipt.statusLabel}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {receipt.lineCount}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {receipt.postedAt}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          className="text-sm font-bold text-[var(--tenant-primary)] hover:underline"
                          href={`/goods-inwards/${receipt.id}`}
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
        </SectionCard>

        <SectionCard
          title="Receiving boundaries"
          description="Goods Inwards records physical deliveries. Supplier invoices, purchasing and QA workflows remain separate until reviewed follow-up tasks connect them."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">Invoices</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Supplier Invoice Intake does not auto-create receipts yet.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">Stock ledger</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Posting creates movement rows; no stock-on-hand summary is shown yet.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">Conversion</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Unknown pack conversions are saved for review and blocked from posting.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
