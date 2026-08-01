import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { AlertCard, EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { fetchQaHoldList } from "@/lib/qa-holds-data";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    hold?: string;
  }>;
};

function messageFromStatus(status: string | undefined) {
  const messages: Record<string, string> = {
    hold_placed: "QA hold placed for the full inventory lot.",
    hold_released: "QA hold released. Availability now follows the released hold state.",
    open_hold_exists: "This inventory lot already has an open QA hold.",
    permission_denied: "You do not have permission to perform that hold action.",
    missing_fields: "Choose a lot and enter a reason before placing a hold.",
    missing_release_notes: "Enter release notes before releasing a hold.",
    hold_not_releasable: "Only active QA holds can be released.",
  };

  return status ? messages[status] : undefined;
}

export default async function HoldReleasePage({ searchParams }: PageProps) {
  const [data, query] = await Promise.all([fetchQaHoldList(), searchParams]);
  const search = query.q?.trim().toLowerCase() ?? "";
  const filteredHolds = data.holds.filter((hold) => {
    const searchable = [
      hold.reference,
      hold.lotNumber,
      hold.itemName,
      hold.supplierName,
      hold.locationLabel,
      hold.reason,
      hold.reasonCategory,
      hold.statusLabel,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!query.status || query.status === "all" || hold.status === query.status) &&
      (!search || searchable.includes(search))
    );
  });
  const statusMessage = messageFromStatus(query.hold);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone="success">Live QA holds</StatusBadge>
                <StatusBadge tone="info">Full lot only</StatusBadge>
                <StatusBadge tone="neutral">No stock movements</StatusBadge>
              </div>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
                Hold & Release records formal QA control over full inventory lots.
                Physical stock stays in the posted stock movement ledger; available
                stock is derived from active hold state.
              </p>
            </div>
            {data.canPlace ? (
              <PageActionButton href="/qa/holds/new">Place hold</PageActionButton>
            ) : null}
          </div>
        </section>

        {statusMessage ? (
          <AlertCard
            title={query.hold?.includes("released") || query.hold?.includes("placed") ? "Hold action complete" : "Hold action needs attention"}
            description={statusMessage}
            meta={query.hold}
            tone={query.hold?.includes("released") || query.hold?.includes("placed") ? "success" : "warning"}
          />
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="QA holds"
            value={String(data.summary.total)}
            helperText="Formal inventory-lot QA hold records."
            badge="Hold"
            tone="info"
            icon="QA"
          />
          <StatCard
            label="Active holds"
            value={String(data.summary.active)}
            helperText="Lots currently withheld from available stock."
            badge="Active"
            tone={data.summary.active > 0 ? "warning" : "neutral"}
            icon="AH"
          />
          <StatCard
            label="Released holds"
            value={String(data.summary.released)}
            helperText="Hold history retained without rewriting stock."
            badge="Released"
            tone="success"
            icon="RL"
          />
          <StatCard
            label="Receiving QA sourced"
            value={String(data.summary.sourcedFromReceivingQa)}
            helperText="Holds linked back to Receiving QA checks."
            badge="Trace"
            tone="neutral"
            icon="RQ"
          />
        </section>

        <SectionCard
          title="Hold filters"
          description="Filter formal hold records without changing inventory or QA history."
          action={<StatusBadge tone="neutral">{`${filteredHolds.length} shown`}</StatusBadge>}
        >
          <form className="grid gap-3 md:grid-cols-3">
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Search
              </span>
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm"
                defaultValue={query.q ?? ""}
                name="q"
                placeholder="Item, lot, supplier, reason..."
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Status
              </span>
              <select
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
                defaultValue={query.status ?? "all"}
                name="status"
              >
                <option value="all">All statuses</option>
                {data.filters.statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="md:col-span-3">
              <button className="inline-flex rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white transition hover:brightness-90">
                Apply filters
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="QA hold records"
          description="Formal holds are append-event-backed and controlled by QA permissions."
          action={<StatusBadge tone={data.canRelease ? "warning" : "neutral"}>{data.canRelease ? "Release enabled" : "Read only"}</StatusBadge>}
        >
          {filteredHolds.length > 0 ? (
            <div className="space-y-3">
              {filteredHolds.map((hold) => (
                <article
                  key={hold.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge tone={hold.statusTone}>{hold.statusLabel}</StatusBadge>
                        <StatusBadge tone="neutral">{hold.reasonCategory}</StatusBadge>
                        {hold.hasSourceCheck ? (
                          <StatusBadge tone="info">Receiving QA linked</StatusBadge>
                        ) : null}
                      </div>
                      <h3 className="mt-3 text-base font-bold text-slate-950">
                        {hold.itemName}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Lot {hold.lotNumber} · {hold.locationLabel} · {hold.quantityLabel}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {hold.reason}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 text-sm text-slate-500 lg:text-right">
                      <span>Placed {hold.placedAt}</span>
                      <span>By {hold.placedBy}</span>
                      <Link
                        className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        href={`/qa/holds/${hold.id}`}
                      >
                        Open hold
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No QA holds found"
              description="No formal hold records match the current filters."
              action={data.canPlace ? <PageActionButton href="/qa/holds/new">Place first hold</PageActionButton> : null}
            />
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
