import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getProductionDemandPageData } from "@/lib/production-demand-data";

function label(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function issueTone(classification: "blocked" | "excluded" | "inactive_source") {
  if (classification === "blocked") {
    return "warning" as const;
  }

  return classification === "excluded" ? ("info" as const) : ("neutral" as const);
}

function runTone(status: string) {
  if (status === "succeeded") {
    return "success" as const;
  }

  if (status === "failed") {
    return "danger" as const;
  }

  if (status === "partially_succeeded") {
    return "warning" as const;
  }

  return "neutral" as const;
}

export default async function ProductionDemandPage() {
  const data = await getProductionDemandPageData();

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={data.status === "ready" ? "success" : "warning"}>
              {data.status === "ready" ? "Live projection" : "Foundation pending"}
            </StatusBadge>
            <StatusBadge tone="neutral">Not reviewed or frozen</StatusBadge>
            <StatusBadge tone={data.canManage ? "info" : "neutral"}>
              {data.canManage ? "Scoped recalculation permitted" : "Read only"}
            </StatusBadge>
          </div>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
            {data.message}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Demand rows" value={String(data.counts.demandRows)} helperText="Current facility, date, item and exact-UOM aggregates." badge="Live" tone="info" icon="DM" />
          <StatCard label="Contributions" value={String(data.counts.activeContributions)} helperText="Active source-line mapping outputs included in live demand." badge="Active" tone="success" icon="CT" />
          <StatCard label="Blocked lines" value={String(data.counts.blocked)} helperText="Current source lines awaiting valid mapping, delivery or facility evidence." badge="Review" tone={data.counts.blocked > 0 ? "warning" : "success"} icon="BL" />
          <StatCard label="Exclusions" value={String(data.counts.exclusions)} helperText="Explicit approved non-manufacturing decisions, excluded from demand." badge="Resolved" tone="neutral" icon="EX" />
        </section>

        <SectionCard title="Live Production Demand" description="Only active eligible contributions are grouped. Different facilities, production dates and UOMs remain separate." action={<StatusBadge tone="neutral">No planning allocation</StatusBadge>}>
          {data.demand.length === 0 ? (
            <EmptyState title="No live Production Demand" description="This is expected until a Commerce connection has source orders with approved mappings and reviewed delivery interpretations. No demand rows have been fabricated." />
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="min-w-[980px] divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500"><tr><th className="px-4 py-3">Production date</th><th className="px-4 py-3">Facility</th><th className="px-4 py-3">Internal item</th><th className="px-4 py-3">Quantity</th><th className="px-4 py-3">Sources</th><th className="px-4 py-3">Last recalculated</th></tr></thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {data.demand.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.productionDate}</td>
                      <td className="px-4 py-3 text-slate-600">{row.facilityName}</td>
                      <td className="px-4 py-3"><p className="font-semibold text-slate-900">{row.internalItemName}</p><p className="mt-1 font-mono text-xs text-slate-500">{row.internalItemId}</p></td>
                      <td className="px-4 py-3"><span className="font-bold text-slate-900">{row.totalQuantity}</span> <span className="text-slate-500">{row.outputUom}</span></td>
                      <td className="px-4 py-3 text-slate-600"><p>{row.connectionCount} connections / {row.sourceOrderCount} orders</p><p className="mt-1 text-xs">{row.sourceLineCount} lines / {row.contributionCount} contributions</p></td>
                      <td className="px-4 py-3 text-slate-600">{row.lastRecalculatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard title="Current source outcomes" description="Safe blocker, exclusion and inactive-source categories. Customer details and raw provider payloads are never shown." action={<StatusBadge tone={data.issues.length > 0 ? "warning" : "success"}>{`${data.issues.length} current`}</StatusBadge>}>
            {data.issues.length === 0 ? (
              <EmptyState title="No current generation issues" description="No blockers or explicit exclusions are visible in the current tenant state." />
            ) : (
              <div className="space-y-3">
                {data.issues.map((issue) => (
                  <article className="rounded-md border border-slate-200 p-4" key={issue.id}>
                    <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold text-slate-900">{label(issue.category)}</p><StatusBadge tone={issueTone(issue.classification)}>{label(issue.classification)}</StatusBadge></div>
                    <p className="mt-2 font-mono text-xs text-slate-500">Order {issue.sourceOrderReference} / line {issue.sourceLineReference}</p>
                    <p className="mt-1 text-xs text-slate-500">Observed {issue.createdAt}</p>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Recent generation runs" description="Bounded source-line and source-order recalculation evidence. No full-tenant recalculation runs on page load." action={<StatusBadge tone="neutral">Latest 10</StatusBadge>}>
            {data.runs.length === 0 ? (
              <EmptyState title="No generation runs" description="Runs will appear only after an authorised scoped recalculation is requested." />
            ) : (
              <div className="space-y-3">
                {data.runs.map((run) => (
                  <article className="rounded-md border border-slate-200 p-4" key={run.id}>
                    <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold text-slate-900">{label(run.runType)}</p><StatusBadge tone={runTone(run.status)}>{label(run.status)}</StatusBadge></div>
                    <p className="mt-2 text-sm text-slate-600">{run.sourceLinesExamined} lines examined, {run.contributionsCreated} contributions created, {run.contributionsSuperseded} superseded, {run.blockedLines} blocked.</p>
                    <p className="mt-1 text-xs text-slate-500">{run.issuesCreated} issue records created, {run.issuesRetained} unchanged issue records retained.</p>
                    <p className="mt-1 text-xs text-slate-500">{run.completedAt}</p>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
