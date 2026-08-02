import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { LogisticsActionFeedback } from "@/components/logistics/logistics-action-feedback";
import { EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getDispatchActionMessage } from "@/lib/logistics-action-messages";
import { fetchDispatchRunList } from "@/lib/logistics-data";
import { dispatchRunStatuses, dispatchRunStatusLabels, dispatchTypes, dispatchTypeLabels } from "@/lib/logistics-types";

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string; type?: string; date?: string; dispatch?: string }>;
};

export default async function DispatchRunsPage({ searchParams }: PageProps) {
  const [data, query] = await Promise.all([fetchDispatchRunList(), searchParams]);
  const search = query.q?.trim().toLowerCase() ?? "";
  const filteredRuns = data.runs.filter((run) => {
    const searchable = [run.runNumber, run.name, run.dispatchTypeLabel, run.defaultCarrier, run.defaultService].join(" ").toLowerCase();
    return (
      (!search || searchable.includes(search)) &&
      (!query.status || query.status === "all" || run.status === query.status) &&
      (!query.type || query.type === "all" || run.dispatchType === query.type) &&
      (!query.date || run.dispatchDateValue === query.date)
    );
  });
  const message = getDispatchActionMessage(query.dispatch);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone="success">Live records</StatusBadge>
                <StatusBadge tone="info">Tenant scoped</StatusBadge>
                <StatusBadge tone="neutral">No stock allocation</StatusBadge>
              </div>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
                Plan reviewed outbound delivery groups, capture manual delivery snapshots and move validated runs through the first dispatch lifecycle.
              </p>
            </div>
            {data.canCreate ? <PageActionButton href="/logistics/dispatch-runs/new">New dispatch run</PageActionButton> : null}
          </div>
        </section>

        <LogisticsActionFeedback feedback={message} />

        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <StatCard label="Dispatch runs" value={String(data.summary.total)} helperText="Real tenant dispatch records." badge="Total" tone="info" icon="DR" />
          <StatCard label="Draft" value={String(data.summary.draft)} helperText="Open for delivery and item entry." badge="Editable" tone="warning" icon="DF" />
          <StatCard label="Ready" value={String(data.summary.ready)} helperText="Validated and locked for dispatch." badge="Ready" tone="info" icon="RD" />
          <StatCard label="Dispatched" value={String(data.summary.dispatched)} helperText="Marked dispatched with manifest evidence." badge="Sent" tone="success" icon="DS" />
        </section>

        <SectionCard title="Dispatch filters" description="Filter real records by operational status, type or dispatch date." action={<StatusBadge tone="neutral">{`${filteredRuns.length} shown`}</StatusBadge>}>
          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="block xl:col-span-2">
              <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
              <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={query.q ?? ""} name="q" placeholder="Run number, name, carrier..." />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">Status</span>
              <select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" defaultValue={query.status ?? "all"} name="status">
                <option value="all">All statuses</option>
                {dispatchRunStatuses.map((status) => <option key={status} value={status}>{dispatchRunStatusLabels[status]}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">Dispatch type</span>
              <select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" defaultValue={query.type ?? "all"} name="type">
                <option value="all">All types</option>
                {dispatchTypes.map((type) => <option key={type} value={type}>{dispatchTypeLabels[type]}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">Dispatch date</span>
              <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={query.date ?? ""} name="date" type="date" />
            </label>
            <div className="md:col-span-2 xl:col-span-5">
              <button className="rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-90">Apply filters</button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Dispatch run records" description="Counts are derived from active deliveries. No customer, order, stock or carrier system is queried." action={<StatusBadge tone={data.canManage ? "success" : "neutral"}>{data.canManage ? "Manage enabled" : "Read only"}</StatusBadge>}>
          {filteredRuns.length === 0 ? (
            <EmptyState title="No dispatch runs match" description={data.runs.length === 0 ? "Create the first draft run when reviewed outbound delivery details are available." : "Adjust the filters to see other dispatch runs."} action={data.canCreate && data.runs.length === 0 ? <PageActionButton href="/logistics/dispatch-runs/new">New dispatch run</PageActionButton> : undefined} />
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="min-w-[1050px] divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500"><tr><th className="px-4 py-3">Run</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Deliveries</th><th className="px-4 py-3">Cartons</th><th className="px-4 py-3">Carrier</th><th className="px-4 py-3">Updated</th></tr></thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredRuns.map((run) => (
                    <tr key={run.id}>
                      <td className="px-4 py-3"><Link className="font-bold text-[var(--tenant-primary)] hover:underline" href={`/logistics/dispatch-runs/${run.id}`}>{run.runNumber}</Link><p className="mt-1 text-xs text-slate-500">{run.name}</p></td>
                      <td className="px-4 py-3 text-slate-600">{run.dispatchTypeLabel}</td>
                      <td className="px-4 py-3 text-slate-600"><p>{run.dispatchDate}</p><p className="mt-1 text-xs">Delivery {run.deliveryDate}</p></td>
                      <td className="px-4 py-3"><StatusBadge tone={run.statusTone}>{run.statusLabel}</StatusBadge></td>
                      <td className="px-4 py-3 text-slate-600">{run.deliveryCount}</td>
                      <td className="px-4 py-3 text-slate-600">{run.cartonCount}</td>
                      <td className="px-4 py-3 text-slate-600"><p>{run.defaultCarrier}</p><p className="mt-1 text-xs">{run.defaultService}</p></td>
                      <td className="px-4 py-3 text-slate-600">{run.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
