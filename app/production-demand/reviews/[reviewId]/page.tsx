import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getProductionDemandActionMessage } from "@/lib/production-demand-action-messages";
import { getProductionDemandReviewDetail } from "@/lib/production-demand-review-data";

import {
  acknowledgeProductionDemandBlockersAction,
  cancelProductionDemandReviewAction,
  freezeProductionDemandReviewAction,
  generateProductionDemandDeltaAction,
  markProductionDemandReviewReviewedAction,
} from "../../actions";

type PageProps = {
  params: Promise<{ reviewId: string }>;
  searchParams: Promise<{ demand?: string }>;
};

function label(value: string) {
  return value.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function tone(status: string) {
  if (status === "frozen" || status === "approved") return "success" as const;
  if (status === "stale") return "warning" as const;
  if (status === "cancelled" || status === "rejected" || status === "superseded") return "neutral" as const;
  return "info" as const;
}

export default async function ProductionDemandReviewPage({ params, searchParams }: PageProps) {
  const [{ reviewId }, query] = await Promise.all([params, searchParams]);
  const data = await getProductionDemandReviewDetail(reviewId);
  const message = getProductionDemandActionMessage(query.demand);
  const review = data.review;

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link className="text-sm font-semibold text-emerald-700 hover:text-emerald-900" href="/production-demand">Back to Production Demand</Link>
          <StatusBadge tone={tone(review.status)}>{label(review.status)}</StatusBadge>
        </div>

        {message ? <div className={`rounded-md border px-4 py-3 text-sm font-medium ${message.tone === "danger" ? "border-red-200 bg-red-50 text-red-800" : message.tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`} role="status">{message.message}</div> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase text-slate-500">Review v{review.versionNumber}</p><h2 className="mt-2 text-xl font-bold text-slate-950">{review.facilityName}</h2><p className="mt-1 text-sm text-slate-600">Production date {review.productionDate}</p></div>
            <div className="text-right text-xs text-slate-500"><p>Captured {review.createdAt}</p><p className="mt-1 font-mono">{review.captureFingerprint.slice(0, 16)}...</p></div>
          </div>
          {review.reviewNote ? <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{review.reviewNote}</p> : null}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Demand lines" value={String(review.demandLineCount)} helperText={`${review.contributionCount} owned-base contributions; ${review.externalContributionCount} externally committed.`} badge="Exact UOM" tone="info" icon="DL" />
          <StatCard label="Source orders" value={String(review.sourceOrderCount)} helperText={`${review.sourceLineCount} source lines across ${review.connectionCount} connections.`} badge="Lineage" tone="neutral" icon="SO" />
          <StatCard label="Scoped blockers" value={String(review.scopedBlockerCount)} helperText="Current scoped blockers prevent freeze." badge={review.scopedBlockerCount > 0 ? "Blocked" : "Clear"} tone={review.scopedBlockerCount > 0 ? "warning" : "success"} icon="SB" />
          <StatCard label="Unscoped blockers" value={String(review.unscopedBlockerCount)} helperText="Organisation-wide context requires exact acknowledgement." badge={review.blockersAcknowledgedAt ? "Acknowledged" : "Review"} tone={review.unscopedBlockerCount > 0 && !review.blockersAcknowledgedAt ? "warning" : "neutral"} icon="UB" />
        </section>

        <SectionCard title="Externally committed demand" description="These current scope quantities are already committed through another frozen review. They remain visible for reconciliation but are not duplicated in this review's base." action={<StatusBadge tone={data.externalCommitments.length > 0 ? "info" : "neutral"}>{`${review.externalSourceLineCount} source lines`}</StatusBadge>}>
          {data.externalCommitments.length === 0 ? <EmptyState title="No externally committed demand" description="Every current contribution in this scope was unowned when this review was captured." /> : <div className="space-y-3">{data.externalCommitments.map((evidence) => <article className="grid gap-3 rounded-md border border-sky-200 bg-sky-50/40 p-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] md:items-center" key={evidence.id}><div><p className="font-semibold text-slate-900">{evidence.internalItemName}</p><p className="mt-1 font-mono text-xs text-slate-500">Order {evidence.sourceOrderId.slice(0, 8)} / line {evidence.sourceOrderLineId.slice(0, 8)}</p></div><p className="font-semibold text-slate-800">{evidence.quantity} {evidence.outputUom}</p><Link className="text-sm font-semibold text-sky-800 hover:text-sky-950" href={`/production-demand/reviews/${evidence.ownerReviewId}`}>Owner review {evidence.ownerReviewId.slice(0, 8)}</Link></article>)}</div>}
        </SectionCard>

        <SectionCard title={review.status === "frozen" ? "Frozen base demand" : "Captured demand lines"} description="These quantities were calculated from captured active contributions. They cannot be edited from the review workflow." action={<StatusBadge tone="neutral">Immutable evidence</StatusBadge>}>
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="min-w-[760px] divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500"><tr><th className="px-4 py-3">Internal item</th><th className="px-4 py-3">Quantity</th><th className="px-4 py-3">Source orders</th><th className="px-4 py-3">Source lines</th><th className="px-4 py-3">Contributions</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{data.lines.map((line) => <tr key={line.id}><td className="px-4 py-3"><p className="font-semibold text-slate-900">{line.internalItemName}</p><p className="mt-1 font-mono text-xs text-slate-500">{line.internalItemId}</p></td><td className="px-4 py-3 font-semibold text-slate-900">{line.quantity} {line.outputUom}</td><td className="px-4 py-3 text-slate-600">{line.sourceOrderCount}</td><td className="px-4 py-3 text-slate-600">{line.sourceLineCount}</td><td className="px-4 py-3 text-slate-600">{line.contributionCount}</td></tr>)}</tbody></table>
          </div>
        </SectionCard>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard title="Captured issue context" description="Safe classifications only. No raw provider payloads or customer data are stored in review evidence." action={<StatusBadge tone={data.issues.some((issue) => issue.classification === "blocked") ? "warning" : "success"}>{`${data.issues.length} captured`}</StatusBadge>}>
            {data.issues.length === 0 ? <EmptyState title="No captured issues" description="No scoped issue or organisation-wide unscoped blocker was current at capture." /> : <div className="space-y-3">{data.issues.map((issue) => <article className="rounded-md border border-slate-200 p-3" key={issue.id}><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold text-slate-900">{label(issue.issue_category)}</p><div className="flex gap-2"><StatusBadge tone={issue.classification === "blocked" ? "warning" : "neutral"}>{label(issue.classification)}</StatusBadge><StatusBadge tone="neutral">{label(issue.scope_classification)}</StatusBadge></div></div><p className="mt-2 font-mono text-xs text-slate-500">Order {issue.source_order_id.slice(0, 8)} / line {issue.source_order_line_id.slice(0, 8)}</p></article>)}</div>}
          </SectionCard>

          <SectionCard title="Review evidence" description="Source IDs and immutable lineage are available for operational traceability without exposing customer PII." action={<StatusBadge tone="neutral">{`${data.contributions.length} contributions`}</StatusBadge>}>
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">{data.contributions.map((evidence) => <article className="rounded-md border border-slate-200 p-3" key={evidence.id}><p className="font-semibold text-slate-900">{evidence.internalItemName} · {evidence.quantity} {evidence.outputUom}</p><p className="mt-2 font-mono text-xs leading-5 text-slate-500">Order {evidence.sourceOrderId.slice(0, 8)} / line {evidence.sourceOrderLineId.slice(0, 8)}<br />Mapping {evidence.mappingId.slice(0, 8)} / output {evidence.mappingOutputId.slice(0, 8)}<br />Interpretation {evidence.interpretationId.slice(0, 8)}</p></article>)}</div>
          </SectionCard>
        </section>

        {data.canManage && review.status !== "frozen" && review.status !== "cancelled" ? (
          <SectionCard title="Review actions" description="Review and freeze are separate human decisions. Freeze is irreversible and performs a fresh evidence check.">
            <div className="grid gap-4 lg:grid-cols-2">
              {review.status === "draft" ? <form action={markProductionDemandReviewReviewedAction} className="rounded-md border border-slate-200 p-4"><input name="review_id" type="hidden" value={review.id} /><p className="text-sm text-slate-600">Confirm the captured quantities, lineage and issue context have been inspected.</p><button className="mt-3 rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800" type="submit">Mark reviewed</button></form> : null}
              {review.status === "reviewed" && review.unscopedBlockerCount > 0 && !review.blockersAcknowledgedAt ? <form action={acknowledgeProductionDemandBlockersAction} className="rounded-md border border-amber-200 bg-amber-50 p-4"><input name="review_id" type="hidden" value={review.id} /><p className="text-sm text-amber-900">Acknowledge the exact captured unscoped blocker set. This does not resolve or override any blocker.</p><button className="mt-3 rounded-md border border-amber-400 bg-white px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100" type="submit">Acknowledge blocker context</button></form> : null}
              {review.status === "reviewed" ? <form action={freezeProductionDemandReviewAction} className="rounded-md border border-red-200 bg-red-50 p-4"><input name="review_id" type="hidden" value={review.id} /><label className="block text-sm font-semibold text-red-900" htmlFor="confirmation">Type FREEZE to make this base immutable</label><input className="mt-2 w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm" id="confirmation" name="confirmation" required /><button className="mt-3 rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800" type="submit">Freeze demand</button></form> : null}
              <form action={cancelProductionDemandReviewAction} className="rounded-md border border-slate-200 p-4"><input name="review_id" type="hidden" value={review.id} /><p className="text-sm text-slate-600">Cancel this candidate without deleting its historical evidence.</p><button className="mt-3 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="submit">Cancel candidate</button></form>
            </div>
          </SectionCard>
        ) : null}

        {review.status === "frozen" ? (
          <>
            <SectionCard title="Effective frozen demand" description="Immutable frozen base plus only the latest approved cumulative delta. Historical approved versions are never summed." action={<StatusBadge tone="success">No planning allocation</StatusBadge>}>
              <div className="space-y-3">{data.effective.map((line) => <article className="grid gap-3 rounded-md border border-slate-200 p-4 sm:grid-cols-4" key={`${line.facilityId}:${line.productionDate}:${line.internalItemId}:${line.outputUom}`}><div className="sm:col-span-1"><p className="font-semibold text-slate-900">{line.internalItemName}</p><p className="mt-1 text-xs text-slate-500">{line.productionDate}</p></div><div><p className="text-xs text-slate-500">Frozen base</p><p className="mt-1 font-semibold">{line.frozenQuantity} {line.outputUom}</p></div><div><p className="text-xs text-slate-500">Approved cumulative delta</p><p className="mt-1 font-semibold">{line.approvedDeltaQuantity} {line.outputUom}</p></div><div><p className="text-xs text-slate-500">Effective</p><p className="mt-1 font-bold text-emerald-800">{line.effectiveQuantity} {line.outputUom}</p></div></article>)}</div>
            </SectionCard>
            <SectionCard title="Post-freeze deltas" description="Each candidate is a cumulative comparison against the original frozen base. A new approval supersedes the prior approved adjustment." action={data.canManage ? <form action={generateProductionDemandDeltaAction}><input name="review_id" type="hidden" value={review.id} /><button className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800" type="submit">Generate current delta</button></form> : <StatusBadge tone="neutral">Read only</StatusBadge>}>
              {data.deltas.length === 0 ? <EmptyState title="No delta comparisons" description="Generate a comparison when source evidence may have changed after freeze." /> : <div className="space-y-3">{data.deltas.map((delta) => <Link className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-4 hover:border-emerald-300 hover:bg-emerald-50/30" href={`/production-demand/reviews/${review.id}/deltas/${delta.id}`} key={delta.id}><div><p className="font-semibold text-slate-900">Cumulative delta v{delta.versionNumber}</p><p className="mt-1 text-sm text-slate-600">{delta.sourceDeltaCount} source changes / {delta.aggregateLineCount} exact-UOM aggregate lines</p></div><StatusBadge tone={tone(delta.status)}>{label(delta.status)}</StatusBadge></Link>)}</div>}
            </SectionCard>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
