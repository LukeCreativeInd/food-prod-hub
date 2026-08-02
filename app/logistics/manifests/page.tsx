import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { LogisticsActionFeedback } from "@/components/logistics/logistics-action-feedback";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getManifestActionMessage } from "@/lib/logistics-action-messages";
import { fetchManifestList } from "@/lib/logistics-data";
import { manifestStatuses, manifestStatusLabels } from "@/lib/logistics-types";

type PageProps = { searchParams: Promise<{ q?: string; status?: string; date?: string; manifest?: string }> };

export default async function ManifestsPage({ searchParams }: PageProps) {
  const [data, query] = await Promise.all([fetchManifestList(), searchParams]);
  const search = query.q?.trim().toLowerCase() ?? "";
  const manifests = data.manifests.filter((manifest) => {
    const searchable = [manifest.manifestNumber, manifest.runNumber, manifest.runName].join(" ").toLowerCase();
    return (!search || searchable.includes(search)) && (!query.status || query.status === "all" || manifest.status === query.status) && (!query.date || manifest.generatedDateValue === query.date);
  });
  const message = getManifestActionMessage(query.manifest);
  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap gap-2"><StatusBadge tone="success">Historical records</StatusBadge><StatusBadge tone="info">Snapshot backed</StatusBadge><StatusBadge tone="neutral">No carrier exports</StatusBadge></div><p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">Generated manifests preserve the reviewed delivery and item details for history. Drafts become available after the linked dispatch run is validated and ready.</p></section>
        <LogisticsActionFeedback feedback={message} />
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><StatCard label="Manifests" value={String(data.summary.total)} helperText="Draft and generated records." badge="Total" tone="info" icon="MF" /><StatCard label="Draft" value={String(data.summary.draft)} helperText="Awaiting reviewed generation." badge="Draft" tone="warning" icon="DF" /><StatCard label="Generated" value={String(data.summary.generated)} helperText="Immutable delivery and line snapshots." badge="History" tone="success" icon="GN" /></section>
        <SectionCard title="Manifest filters" description="Search real manifest and dispatch run identifiers." action={<StatusBadge tone="neutral">{`${manifests.length} shown`}</StatusBadge>}>
          <form className="grid gap-3 md:grid-cols-3 xl:grid-cols-4"><label className="block md:col-span-2"><span className="text-xs font-semibold uppercase text-slate-500">Search</span><input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={query.q ?? ""} name="q" placeholder="Manifest or dispatch run..." /></label><label className="block"><span className="text-xs font-semibold uppercase text-slate-500">Status</span><select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" defaultValue={query.status ?? "all"} name="status"><option value="all">All statuses</option>{manifestStatuses.map((status) => <option key={status} value={status}>{manifestStatusLabels[status]}</option>)}</select></label><label className="block"><span className="text-xs font-semibold uppercase text-slate-500">Generated date</span><input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={query.date ?? ""} name="date" type="date" /></label><div className="md:col-span-3 xl:col-span-4"><button className="rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-90">Apply filters</button></div></form>
        </SectionCard>
        <SectionCard title="Manifest records" description="Generated detail always reads the immutable snapshot tables." action={<StatusBadge tone={data.canManage ? "success" : "neutral"}>{data.canManage ? "Generation enabled" : "Read only"}</StatusBadge>}>
          {manifests.length === 0 ? (
            <EmptyState title="No manifests match" description={data.manifests.length === 0 ? "Validate and mark a dispatch run ready before creating its manifest draft." : "Adjust the filters to see other manifests."} />
          ) : (
            <>
              <div className="min-w-0 divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200 xl:hidden">
                {manifests.map((manifest) => (
                  <article className="min-w-0 bg-white p-4" key={manifest.id}>
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link className="break-words font-bold text-[var(--tenant-primary)] hover:underline" href={`/logistics/manifests/${manifest.id}`}>{manifest.manifestNumber}</Link>
                        <p className="mt-1 text-xs text-slate-500">Version {manifest.versionNumber}</p>
                      </div>
                      <div className="shrink-0"><StatusBadge tone={manifest.statusTone}>{manifest.statusLabel}</StatusBadge></div>
                    </div>
                    <div className="mt-4 min-w-0 border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">Dispatch run</p>
                      <Link className="mt-1 inline-block break-words font-semibold text-slate-800 hover:text-[var(--tenant-primary)]" href={`/logistics/dispatch-runs/${manifest.runId}`}>{manifest.runNumber}</Link>
                      <p className="mt-1 break-words text-xs text-slate-500">{manifest.runName}</p>
                    </div>
                    <dl className="mt-4 grid min-w-0 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                      <div className="min-w-0"><dt className="text-xs font-semibold uppercase text-slate-500">Generated</dt><dd className="mt-1 break-words text-sm text-slate-600">{manifest.generatedAt}</dd></div>
                      <div className="min-w-0"><dt className="text-xs font-semibold uppercase text-slate-500">Deliveries</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{manifest.deliveryCount}</dd></div>
                      <div className="min-w-0"><dt className="text-xs font-semibold uppercase text-slate-500">Cartons</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{manifest.cartonTotal}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
              <div className="hidden max-w-full overflow-x-auto rounded-md border border-slate-200 xl:block">
                <table className="w-full min-w-[900px] divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500"><tr><th className="px-4 py-3">Manifest</th><th className="px-4 py-3">Dispatch run</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Generated</th><th className="px-4 py-3">Deliveries</th><th className="px-4 py-3">Cartons</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 bg-white">{manifests.map((manifest) => <tr key={manifest.id}><td className="px-4 py-3"><Link className="font-bold text-[var(--tenant-primary)] hover:underline" href={`/logistics/manifests/${manifest.id}`}>{manifest.manifestNumber}</Link><p className="mt-1 text-xs text-slate-500">Version {manifest.versionNumber}</p></td><td className="px-4 py-3"><Link className="font-semibold text-slate-800 hover:text-[var(--tenant-primary)]" href={`/logistics/dispatch-runs/${manifest.runId}`}>{manifest.runNumber}</Link><p className="mt-1 text-xs text-slate-500">{manifest.runName}</p></td><td className="px-4 py-3"><StatusBadge tone={manifest.statusTone}>{manifest.statusLabel}</StatusBadge></td><td className="px-4 py-3 text-slate-600">{manifest.generatedAt}</td><td className="px-4 py-3 text-slate-600">{manifest.deliveryCount}</td><td className="px-4 py-3 text-slate-600">{manifest.cartonTotal}</td></tr>)}</tbody>
                </table>
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
