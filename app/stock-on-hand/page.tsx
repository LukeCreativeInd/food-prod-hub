import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getStockOnHandPageData } from "@/lib/stock-on-hand-data";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    location?: string;
    lotStatus?: string;
    unit?: string;
    view?: string;
  }>;
};

function matchesFilter(value: string, filter: string | undefined, allValue = "all") {
  return !filter || filter === allValue || value === filter;
}

export default async function StockOnHandPage({ searchParams }: PageProps) {
  const [data, query] = await Promise.all([
    getStockOnHandPageData(),
    searchParams,
  ]);
  const search = query.q?.trim().toLowerCase() ?? "";
  const filteredRows = data.rows.filter((row) => {
    const matchesLocation = matchesFilter(row.locationId, query.location);
    const matchesLotStatus = matchesFilter(row.lotStatus, query.lotStatus);
    const matchesUnit = matchesFilter(row.unit, query.unit);
    const matchesView =
      !query.view ||
      query.view === "all" ||
      (query.view === "available" && row.availableQuantityValue > 0) ||
      (query.view === "held" && row.heldQuantityValue > 0) ||
      (query.view === "mixed" && row.isMixedUnitItem) ||
      (query.view === "unclassified" && row.isUnclassified);
    const searchable = [
      row.internalItemName,
      row.itemTypeLabel,
      row.locationLabel,
      row.lotNumber,
      row.lotStatusLabel,
      row.qaStatusLabel,
      row.unit,
    ]
      .join(" ")
      .toLowerCase();

    return (
      matchesLocation &&
      matchesLotStatus &&
      matchesUnit &&
      matchesView &&
      (!search || searchable.includes(search))
    );
  });

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone="success">Live data</StatusBadge>
                <StatusBadge tone="neutral">Read only</StatusBadge>
              </div>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
                Stock On Hand is calculated from posted stock movement ledger
                rows. Active QA holds remove a full lot from available stock
                without changing physical quantity. Supplier invoices remain
                commercial evidence, not stock source records.
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              href="/stock-movements"
            >
              View stock movements
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Items with stock"
            value={String(data.summary.distinctItems)}
            helperText="Distinct internal items with non-zero ledger balance."
            badge="Items"
            tone="info"
            icon="IT"
          />
          <StatCard
            label="Stock rows"
            value={String(data.summary.stockRows)}
            helperText="Item, location, lot and unit groupings."
            badge="Rows"
            tone="success"
            icon="SO"
          />
          <StatCard
            label="Locations"
            value={String(data.summary.locationsWithStock)}
            helperText="Stock locations represented in current balances."
            badge="Sites"
            tone="neutral"
            icon="LO"
          />
          <StatCard
            label="Held rows"
            value={String(data.summary.heldRows)}
            helperText="Rows tied to on-hold or QA hold lots."
            badge="Hold"
            tone={data.summary.heldRows > 0 ? "warning" : "neutral"}
            icon="QA"
          />
          <StatCard
            label="Mixed units"
            value={String(data.summary.mixedUnitItemCount)}
            helperText="Items with stock in more than one unit."
            badge="Review"
            tone={data.summary.mixedUnitItemCount > 0 ? "warning" : "neutral"}
            icon="U"
          />
        </section>

        <SectionCard
          title="Stock summary boundaries"
          description="This page is read-only. To correct stock, use future adjustment or reversal workflows that write new stock movement rows."
          action={<StatusBadge tone="warning">No manual edits</StatusBadge>}
        >
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">Ledger source</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Quantities are direction-adjusted from posted, non-archived
                stock movements.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">Lots classify stock</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Available and held quantities are separated using formal QA hold
                state first, with lot status retained as supporting context.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">No hidden conversion</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Mixed units are flagged and grouped separately until reviewed UOM
                conversion rules are integrated.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Stock On Hand Filters"
          description="Filter real stock balances without changing stock data."
          action={<StatusBadge tone="info">Read-only filters</StatusBadge>}
        >
          <form className="grid gap-4 lg:grid-cols-5">
            <label className="block lg:col-span-2">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Search
              </span>
              <input
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950"
                defaultValue={query.q ?? ""}
                name="q"
                placeholder="Item, location, lot or unit"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Location
              </span>
              <select
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                defaultValue={query.location ?? "all"}
                name="location"
              >
                <option value="all">All locations</option>
                {data.filters.locations.map((location) => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Lot status
              </span>
              <select
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                defaultValue={query.lotStatus ?? "all"}
                name="lotStatus"
              >
                <option value="all">All statuses</option>
                {data.filters.lotStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Unit
              </span>
              <select
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                defaultValue={query.unit ?? "all"}
                name="unit"
              >
                <option value="all">All units</option>
                {data.filters.units.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">
                View
              </span>
              <select
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                defaultValue={query.view ?? "all"}
                name="view"
              >
                <option value="all">All rows</option>
                <option value="available">Available only</option>
                <option value="held">Held only</option>
                <option value="mixed">Mixed-unit warnings</option>
                <option value="unclassified">Unclassified rows</option>
              </select>
            </label>
            <div className="flex flex-wrap gap-2 lg:col-span-5">
              <button
                className="inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
                type="submit"
              >
                Apply filters
              </button>
              <Link
                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                href="/stock-on-hand"
              >
                Clear
              </Link>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Stock On Hand"
          description="Current read-only balance rows grouped by item, location, lot and unit."
          action={<StatusBadge tone="success">Ledger calculated</StatusBadge>}
        >
          {data.rows.length === 0 ? (
            <EmptyState
              title="No stock on hand yet"
              description="Post Goods Inwards receipts to create stock movement ledger rows."
              action={
                <Link
                  className="inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
                  href="/goods-inwards"
                >
                  Open Goods Inwards
                </Link>
              }
            />
          ) : filteredRows.length === 0 ? (
            <EmptyState
              title="No stock rows match the current filters"
              description="Clear filters or search for a different item, location, lot or unit."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Lot</th>
                    <th className="px-4 py-3">Available</th>
                    <th className="px-4 py-3">Held</th>
                    <th className="px-4 py-3">Physical</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Lot / QA</th>
                    <th className="px-4 py-3">Last movement</th>
                    <th className="px-4 py-3">Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredRows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3">
                        <Link
                          className="font-semibold text-slate-950 hover:text-[var(--tenant-primary)]"
                          href={`/internal-items/${row.internalItemId}`}
                        >
                          {row.internalItemName}
                        </Link>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <StatusBadge tone="neutral">{row.itemTypeLabel}</StatusBadge>
                          {row.isMixedUnitItem ? (
                            <StatusBadge tone="warning">Mixed units</StatusBadge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="font-semibold text-slate-800">
                          {row.locationLabel}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {row.locationType}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{row.lotNumber}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          Use by {row.useByDate} · Expiry {row.expiryDate}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-950">
                        {row.availableQuantity}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-950">
                        {row.heldQuantity}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-950">
                        {row.physicalQuantity}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.unit}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <StatusBadge
                            tone={
                              row.isHeld
                                ? "warning"
                                : row.isUnclassified
                                  ? "info"
                                  : "success"
                            }
                          >
                            {row.lotStatusLabel}
                          </StatusBadge>
                          <StatusBadge tone="neutral">{row.qaStatusLabel}</StatusBadge>
                          {row.qaHoldStatus !== "No formal hold" ? (
                            <StatusBadge tone="warning">{row.qaHoldStatus}</StatusBadge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{row.lastMovementAt}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {row.movementCount} movement{row.movementCount === 1 ? "" : "s"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <Link
                            className="text-sm font-bold text-[var(--tenant-primary)] hover:underline"
                            href="/stock-movements"
                          >
                            Movements
                          </Link>
                          {row.lastReceiptId ? (
                            <Link
                              className="text-sm font-bold text-[var(--tenant-primary)] hover:underline"
                              href={`/goods-inwards/${row.lastReceiptId}`}
                            >
                              Receipt
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {data.summary.mixedUnitItemCount > 0 ? (
          <SectionCard
            title="Mixed-unit warning"
            description="Some items have stock in multiple units. Review UOM conversions before relying on a single total."
            action={<StatusBadge tone="warning">Review units</StatusBadge>}
          >
            <p className="text-sm leading-6 text-slate-600">
              EveryBatch is deliberately not converting units on this page yet.
              Pack units, supplier units and base stock units need reviewed UOM
              conversion rules before they can be safely normalised.
            </p>
          </SectionCard>
        ) : null}
      </div>
    </AppShell>
  );
}
