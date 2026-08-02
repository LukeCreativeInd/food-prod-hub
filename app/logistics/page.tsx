import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { fetchDispatchRunList, fetchManifestList } from "@/lib/logistics-data";

export default async function LogisticsPage() {
  const [dispatchData, manifestData] = await Promise.all([
    fetchDispatchRunList(),
    fetchManifestList(),
  ]);
  const recentRuns = dispatchData.runs.slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Dispatch runs" value={String(dispatchData.summary.total)} helperText="Real tenant dispatch records." badge="Runs" tone="info" icon="DR" />
          <StatCard label="Draft" value={String(dispatchData.summary.draft)} helperText="Open for reviewed delivery setup." badge="Planning" tone="warning" icon="DF" />
          <StatCard label="Ready" value={String(dispatchData.summary.ready)} helperText="Validated and ready for dispatch." badge="Ready" tone="success" icon="RD" />
          <StatCard label="Generated manifests" value={String(manifestData.summary.generated)} helperText="Immutable manifest snapshots." badge="History" tone="success" icon="MF" />
        </section>

        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <Link className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[color:var(--tenant-primary-border)] hover:shadow-md" href="/logistics/dispatch-runs">
            <div className="flex items-center justify-between gap-3"><StatusBadge tone="info">Operational</StatusBadge><span className="text-sm font-bold text-[var(--tenant-primary)]">Open runs</span></div>
            <h2 className="mt-4 text-lg font-bold text-slate-950">Dispatch planning</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Create tenant-owned dispatch runs, review delivery snapshots and item lines, then validate the run before manifest generation.</p>
          </Link>
          <Link className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[color:var(--tenant-primary-border)] hover:shadow-md" href="/logistics/manifests">
            <div className="flex items-center justify-between gap-3"><StatusBadge tone="success">Snapshot history</StatusBadge><span className="text-sm font-bold text-[var(--tenant-primary)]">Open manifests</span></div>
            <h2 className="mt-4 text-lg font-bold text-slate-950">Manifest records</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Review draft headers and generated immutable delivery and line snapshots. Carrier file generation remains deliberately disconnected.</p>
          </Link>
          {dispatchData.formOptions.canViewConfiguration ? (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3"><StatusBadge tone="info">Tenant setup</StatusBadge><PageActionButton href="/logistics/carriers" variant="secondary">{dispatchData.formOptions.canManageConfiguration ? "Manage carriers" : "View carriers"}</PageActionButton></div>
              <h2 className="mt-4 text-lg font-bold text-slate-950">Carrier configuration</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{dispatchData.formOptions.carriers.length} active carriers and {dispatchData.formOptions.services.length} active services are available to new dispatch work.</p>
            </div>
          ) : null}
        </section>

        <SectionCard title="Recent dispatch runs" description="Latest real dispatch activity for the current organisation." action={dispatchData.canCreate ? <Link className="rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-90" href="/logistics/dispatch-runs/new">New dispatch run</Link> : <StatusBadge tone="neutral">Read only</StatusBadge>}>
          {recentRuns.length === 0 ? (
            <EmptyState title="No dispatch runs yet" description="Create the first draft run when reviewed delivery information is ready." />
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="min-w-[760px] divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500"><tr><th className="px-4 py-3">Run</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Deliveries</th><th className="px-4 py-3">Cartons</th></tr></thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {recentRuns.map((run) => (
                    <tr key={run.id}>
                      <td className="px-4 py-3"><Link className="font-bold text-[var(--tenant-primary)] hover:underline" href={`/logistics/dispatch-runs/${run.id}`}>{run.runNumber}</Link><p className="mt-1 text-xs text-slate-500">{run.name}</p></td>
                      <td className="px-4 py-3 text-slate-600">{run.dispatchDate}<p className="mt-1 text-xs text-slate-500">Delivery {run.deliveryDate}</p></td>
                      <td className="px-4 py-3"><StatusBadge tone={run.statusTone}>{run.statusLabel}</StatusBadge></td>
                      <td className="px-4 py-3 text-slate-600">{run.deliveryCount}</td>
                      <td className="px-4 py-3 text-slate-600">{run.cartonCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Deferred Logistics workspaces" description="These remain honest foundation states until their reviewed workflows exist.">
          <div className="grid gap-3 md:grid-cols-2">
            <Link className="rounded-md border border-slate-200 bg-slate-50 p-4 hover:border-slate-300" href="/logistics/carrier-exports"><p className="font-bold text-slate-900">Carrier Exports</p><p className="mt-1 text-sm leading-6 text-slate-600">No file, API, credential or provider handoff is generated in this workflow.</p></Link>
            <Link className="rounded-md border border-slate-200 bg-slate-50 p-4 hover:border-slate-300" href="/logistics/delivery-issues"><p className="font-bold text-slate-900">Delivery Issues</p><p className="mt-1 text-sm leading-6 text-slate-600">No operational issue records or Support, QA or CRM writes are introduced.</p></Link>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
