import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import {
  fetchRecentStockMovements,
  movementStatusTone,
} from "@/lib/goods-inwards-data";

export default async function StockMovementsPage() {
  const data = await fetchRecentStockMovements();

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Recent movements"
            value={String(data.summary.total)}
            helperText="Latest tenant stock movement ledger rows."
            badge="Live"
            tone="info"
            icon="MV"
          />
          <StatCard
            label="Posted"
            value={String(data.summary.posted)}
            helperText="Ledger rows posted by controlled workflows."
            badge="Posted"
            tone="success"
            icon="PO"
          />
          <StatCard
            label="Receipt movements"
            value={String(data.summary.recentReceipts)}
            helperText="Movements created from Goods Inwards receipts."
            badge="Goods In"
            tone="neutral"
            icon="GI"
          />
          <StatCard
            label="Hold/release"
            value={String(data.summary.heldOrReleased)}
            helperText="Future QA hold/release movement states."
            badge="QA"
            tone={data.summary.heldOrReleased > 0 ? "warning" : "neutral"}
            icon="QA"
          />
        </section>

        <SectionCard
          title="Stock Movements"
          description="Read-only view of recent stock movement ledger rows. Goods Inwards posting creates receipt movements."
          action={<StatusBadge tone="success">Live data</StatusBadge>}
        >
          {data.movements.length === 0 ? (
            <EmptyState
              title="No stock movements yet"
              description="Post a Goods Inwards receipt to create the first stock movement ledger rows."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Lot</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Movement</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {data.movements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-4 py-3 font-semibold text-slate-950">
                        {movement.internalItemName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {movement.locationName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {movement.lotNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {movement.quantity} {movement.unit}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge tone="neutral">
                            {movement.movementTypeLabel}
                          </StatusBadge>
                          <StatusBadge tone="info">
                            {movement.directionLabel}
                          </StatusBadge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={movementStatusTone(movement.status)}>
                          {movement.statusLabel}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {movement.movementAt}
                      </td>
                      <td className="px-4 py-3">
                        {movement.receiptId ? (
                          <Link
                            href={`/goods-inwards/${movement.receiptId}`}
                            className="text-sm font-bold text-[var(--tenant-primary)] hover:underline"
                          >
                            Receipt
                          </Link>
                        ) : (
                          <span className="text-slate-500">Manual/future</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Ledger boundaries"
          description="This page shows movement records only. It does not calculate stock on hand, valuation or availability summaries yet."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">Append-like history</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Corrections should use future reversal or adjustment movements.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">No stock totals yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Stock-on-hand summaries remain a future reporting task.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">Receiving source</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Goods Inwards receipt posting is the first source workflow.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
