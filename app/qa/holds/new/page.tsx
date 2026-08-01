import { AppShell } from "@/components/app-shell";
import { AlertCard, EmptyState, PageActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { placeQaInventoryLotHoldAction } from "@/app/qa/holds/actions";
import {
  fetchQaHoldStartData,
  QA_HOLD_REASON_CATEGORIES,
} from "@/lib/qa-holds-data";

type PageProps = {
  searchParams: Promise<{
    lotId?: string;
    checkId?: string;
    resultId?: string;
    reviewId?: string;
    reason?: string;
    hold?: string;
    returnTo?: string;
  }>;
};

function labelFromKey(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function NewQaHoldPage({ searchParams }: PageProps) {
  const [data, query] = await Promise.all([fetchQaHoldStartData(), searchParams]);
  const selectedLotId = query.lotId ?? "";

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone="warning">QA controlled</StatusBadge>
                <StatusBadge tone="info">Full lot only</StatusBadge>
                <StatusBadge tone="neutral">No quantity movement</StatusBadge>
              </div>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
                Place a formal QA hold against a posted inventory lot. This holds
                the entire lot for availability purposes without editing the
                stock movement ledger.
              </p>
            </div>
            <PageActionButton href="/qa/holds" variant="secondary">
              Back to holds
            </PageActionButton>
          </div>
        </section>

        {!data.canPlace ? (
          <AlertCard
            title="Hold placement unavailable"
            description="Your role can view QA holds, but cannot place new holds."
            meta="Read only"
            tone="warning"
          />
        ) : null}

        <SectionCard
          title="Place inventory lot hold"
          description="The server validates membership, permission and lot/source ownership before creating the hold and first event."
          action={<StatusBadge tone="warning">Active hold</StatusBadge>}
        >
          {data.canPlace && data.candidateLots.length > 0 ? (
            <form action={placeQaInventoryLotHoldAction} className="space-y-5">
              <input name="source_check_instance_id" type="hidden" value={query.checkId ?? ""} />
              <input name="source_check_result_id" type="hidden" value={query.resultId ?? ""} />
              <input name="source_review_id" type="hidden" value={query.reviewId ?? ""} />
              <input name="return_to" type="hidden" value={query.returnTo ?? "/qa/holds/new"} />

              <label className="block">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Inventory lot
                </span>
                <select
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                  defaultValue={selectedLotId}
                  name="inventory_lot_id"
                  required
                >
                  <option value="">Choose a posted lot</option>
                  {data.candidateLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.itemName} · {lot.lotNumber} · {lot.quantityLabel} · {lot.locationLabel}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Reason category
                  </span>
                  <select
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                    defaultValue="qa_review"
                    name="reason_category"
                    required
                  >
                    {QA_HOLD_REASON_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {labelFromKey(category)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Review due
                  </span>
                  <input
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950"
                    name="review_due_at"
                    type="datetime-local"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Hold reason
                </span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950"
                  defaultValue={query.reason ?? ""}
                  name="reason"
                  placeholder="Example: Receiving QA review recommended hold"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Notes
                </span>
                <textarea
                  className="mt-1 min-h-28 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950"
                  name="notes"
                  placeholder="Record visible condition, follow-up owner or release requirements."
                />
              </label>

              <div className="rounded-lg border border-[color:var(--tenant-warning-border)] bg-[var(--tenant-warning-bg)] p-4">
                <p className="text-sm font-bold text-[var(--tenant-warning)]">
                  Full inventory lot control
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This action creates a QA hold and hold event only. It does not
                  edit receipt history, inventory-lot status fields or stock
                  movement quantities.
                </p>
              </div>

              <button className="inline-flex rounded-md bg-[var(--tenant-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90">
                Place hold
              </button>
            </form>
          ) : (
            <EmptyState
              title="No lots available for hold placement"
              description="Only posted lots with positive stock balance and no open QA hold are available for this v1 action."
            />
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
