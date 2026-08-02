import Link from "next/link";

import { AppShell } from "@/components/app-shell";
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
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap gap-2"><StatusBadge tone="success">Immutable history</StatusBadge><StatusBadge tone="info">Snapshot backed</StatusBadge><StatusBadge tone="neutral">No carrier exports</StatusBadge></div><p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">Generated manifests preserve delivery and item values as immutable Logistics snapshots. Drafts are created and generated only after the linked dispatch run has passed validation and been marked ready.</p></section>
        {message ? <div className="rounded-md border border-[color:var(--tenant-primary-border)] bg-[var(--tenant-primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--tenant-primary)]">{message}</div> : null}
        <section className="grid gap-4 md:grid-cols-3"><StatCard label="Manifests" value={String(data.summary.total)} helperText="Draft and generated records." badge="Total" tone="info" icon="MF" /><StatCard label="Draft" value={String(data.summary.draft)} helperText="Awaiting reviewed generation." badge="Draft" tone="warning" icon="DF" /><StatCard label="Generated" value={String(data.summary.generated)} helperText="Immutable delivery and line snapshots." badge="History" tone="success" icon="GN" /></section>
        <SectionCard title="Manifest filters" description="Search real manifest and dispatch run identifiers." action={<StatusBadge tone="neutral">{`${manifests.length} shown`}</StatusBadge>}>
          <form className="grid gap-3 md:grid-cols-3 xl:grid-cols-4"><label className="block md:col-span-2"><span className="text-xs font-semibold uppercase text-slate-500">Search</span><input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={query.q ?? ""} name="q" placeholder="Manifest or dispatch run..." /></label><label className="block"><span className="text-xs font-semibold uppercase text-slate-500">Status</span><select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" defaultValue={query.status ?? "all"} name="status"><option value="all">All statuses</option>{manifestStatuses.map((status) => <option key={status} value={status}>{manifestStatusLabels[status]}</option>)}</select></label><label className="block"><span className="text-xs font-semibold uppercase text-slate-500">Generated date</span><input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={query.date ?? ""} name="date" type="date" /></label><div className="md:col-span-3 xl:col-span-4"><button className="rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-90">Apply filters</button></div></form>
        </SectionCard>
        <SectionCard title="Manifest records" description="Generated detail always reads the immutable snapshot tables." action={<StatusBadge tone={data.canManage ? "success" : "neutral"}>{data.canManage ? "Generation enabled" : "Read only"}</StatusBadge>}>
          {manifests.length === 0 ? <EmptyState title="No manifests match" description={data.manifests.length === 0 ? "Validate and mark a dispatch run ready before creating its manifest draft." : "Adjust the filters to see other manifests."} /> : <div className="overflow-x-auto rounded-md border border-slate-200"><table className="min-w-[900px] divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500"><tr><th className="px-4 py-3">Manifest</th><th className="px-4 py-3">Dispatch run</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Generated</th><th className="px-4 py-3">Deliveries</th><th className="px-4 py-3">Cartons</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{manifests.map((manifest) => <tr key={manifest.id}><td className="px-4 py-3"><Link className="font-bold text-[var(--tenant-primary)] hover:underline" href={`/logistics/manifests/${manifest.id}`}>{manifest.manifestNumber}</Link><p className="mt-1 text-xs text-slate-500">Version {manifest.versionNumber}</p></td><td className="px-4 py-3"><Link className="font-semibold text-slate-800 hover:text-[var(--tenant-primary)]" href={`/logistics/dispatch-runs/${manifest.runId}`}>{manifest.runNumber}</Link><p className="mt-1 text-xs text-slate-500">{manifest.runName}</p></td><td className="px-4 py-3"><StatusBadge tone={manifest.statusTone}>{manifest.statusLabel}</StatusBadge></td><td className="px-4 py-3 text-slate-600">{manifest.generatedAt}</td><td className="px-4 py-3 text-slate-600">{manifest.deliveryCount}</td><td className="px-4 py-3 text-slate-600">{manifest.cartonTotal}</td></tr>)}</tbody></table></div>}
        </SectionCard>
      </div>
    </AppShell>
  );
}
