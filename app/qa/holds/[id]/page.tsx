import Link from "next/link";
import { notFound } from "next/navigation";

import { releaseQaInventoryLotHoldAction } from "@/app/qa/holds/actions";
import { AppShell } from "@/components/app-shell";
import { AlertCard, PageActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { fetchQaHoldDetail } from "@/lib/qa-holds-data";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ hold?: string }>;
};

function messageFromStatus(status: string | undefined) {
  const messages: Record<string, string> = {
    hold_placed: "QA hold placed for the full inventory lot.",
    hold_released: "QA hold released. Stock availability now follows the released hold state.",
    missing_release_notes: "Enter release notes before releasing this QA hold.",
    hold_not_releasable: "Only active QA holds can be released.",
    permission_denied: "You do not have permission to release this QA hold.",
  };

  return status ? messages[status] : undefined;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

export default async function QaHoldDetailPage({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const data = await fetchQaHoldDetail(id);

  if (!data) {
    notFound();
  }

  const statusMessage = messageFromStatus(query.hold);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={data.hold.statusTone}>{data.hold.statusLabel}</StatusBadge>
                <StatusBadge tone="info">Full inventory lot</StatusBadge>
                {data.hold.hasSourceCheck ? (
                  <StatusBadge tone="neutral">Receiving QA linked</StatusBadge>
                ) : null}
              </div>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
                {data.hold.reference} controls availability for {data.lot.itemName} ·
                lot {data.lot.lotNumber}. The physical stock ledger remains
                unchanged.
              </p>
            </div>
            <PageActionButton href="/qa/holds" variant="secondary">
              Back to holds
            </PageActionButton>
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="space-y-6">
            <SectionCard
              title="Hold details"
              description="The hold record owns QA status history while inventory keeps physical quantities."
              action={<StatusBadge tone={data.hold.statusTone}>{data.hold.statusLabel}</StatusBadge>}
            >
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Reason category" value={data.hold.reasonCategory} />
                <Field label="Reason" value={data.hold.reason} />
                <Field label="Placed" value={data.hold.placedAt} />
                <Field label="Placed by" value={data.hold.placedBy} />
                <Field label="Review due" value={data.hold.reviewDueAt} />
                <Field label="Resolved" value={data.hold.resolvedAt} />
                <Field label="Resolution" value={data.hold.resolutionOutcome} />
                <Field label="Resolution notes" value={data.hold.resolutionNotes} />
              </dl>
            </SectionCard>

            <SectionCard
              title="Inventory lot"
              description="Availability is derived by Stock On Hand from this hold status and posted movements."
              action={<StatusBadge tone="neutral">{data.lot.quantityLabel}</StatusBadge>}
            >
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Item" value={data.lot.itemName} />
                <Field label="Lot" value={data.lot.lotNumber} />
                <Field label="Supplier" value={data.lot.supplierName} />
                <Field label="Location" value={data.lot.locationLabel} />
                <Field label="Receipt" value={data.lot.receiptLabel} />
                <Field label="Lot status" value={data.lot.lotStatus} />
                <Field label="QA status" value={data.lot.qaStatus} />
                <Field label="Expiry" value={data.lot.expiryDate} />
                <Field label="Use by" value={data.lot.useByDate} />
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  href="/stock-on-hand"
                >
                  Stock On Hand
                </Link>
                <Link
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  href="/inventory-traceability"
                >
                  Inventory Traceability
                </Link>
              </div>
            </SectionCard>

            {data.sourceCheck ? (
              <SectionCard
                title="Receiving QA source"
                description="This hold is linked to a receiving QA check or result."
                action={<StatusBadge tone={data.sourceCheck.requiresReview ? "warning" : "neutral"}>{data.sourceCheck.status}</StatusBadge>}
              >
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Check" value={data.sourceCheck.reference} />
                  <Field label="Outcome" value={data.sourceCheck.outcome} />
                  <Field
                    label="Review"
                    value={data.sourceCheck.requiresReview ? "Required" : "Not required"}
                  />
                </dl>
                <Link
                  className="mt-4 inline-flex text-sm font-bold text-[var(--tenant-primary)] hover:underline"
                  href={`/qa/receiving/${data.sourceCheck.id}`}
                >
                  Open Receiving QA check
                </Link>
              </SectionCard>
            ) : null}
          </div>

          <div className="space-y-6">
            <SectionCard
              title="Release control"
              description="Release keeps hold history intact and does not create a stock movement."
              action={<StatusBadge tone={data.canRelease ? "warning" : "neutral"}>{data.canRelease ? "Release allowed" : "No release action"}</StatusBadge>}
            >
              {data.canRelease ? (
                <form action={releaseQaInventoryLotHoldAction} className="space-y-4">
                  <input name="hold_id" type="hidden" value={data.hold.id} />
                  <label className="block">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Release reason
                    </span>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950"
                      name="release_reason"
                      placeholder="Example: QA review accepted"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Resolution notes
                    </span>
                    <textarea
                      className="mt-1 min-h-28 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950"
                      name="resolution_notes"
                      placeholder="Record the release evidence and any follow-up notes."
                      required
                    />
                  </label>
                  <button className="w-full rounded-md bg-[var(--tenant-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90">
                    Release hold
                  </button>
                </form>
              ) : (
                <p className="text-sm leading-6 text-slate-600">
                  This hold is read-only here because it is not active or the
                  current role does not have release permission.
                </p>
              )}
            </SectionCard>

            <SectionCard
              title="Hold event timeline"
              description="Events are append-only and preserve the hold decision trail."
              action={<StatusBadge tone="neutral">{`${data.events.length} events`}</StatusBadge>}
            >
              <div className="space-y-3">
                {data.events.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-950">
                          {event.eventLabel}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {event.eventAt} · {event.actor}
                        </p>
                      </div>
                      <StatusBadge tone="neutral">{event.eventType}</StatusBadge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {event.notes}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Reason: {event.reason}
                    </p>
                  </article>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
