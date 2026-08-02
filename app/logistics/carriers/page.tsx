import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { LogisticsActionFeedback } from "@/components/logistics/logistics-action-feedback";
import { EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getCarrierConfigurationActionMessage } from "@/lib/logistics-action-messages";
import { fetchCarrierConfigurationList } from "@/lib/logistics-configuration-data";
import {
  logisticsCarrierProviderTypeLabels,
  logisticsCarrierProviderTypes,
} from "@/lib/logistics-types";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    provider?: string;
    status?: string;
    view?: string;
    carrier?: string;
  }>;
};

export default async function CarrierConfigurationPage({ searchParams }: PageProps) {
  const [data, query] = await Promise.all([
    fetchCarrierConfigurationList(),
    searchParams,
  ]);
  const search = query.q?.trim().toLowerCase() ?? "";
  const view = query.view === "all" || query.view === "archived" ? query.view : "current";
  const carriers = data.carriers.filter((carrier) => {
    const matchesView =
      view === "all" ||
      (view === "archived" ? carrier.archived : !carrier.archived);
    const searchable = [carrier.name, carrier.code, carrier.providerTypeLabel]
      .join(" ")
      .toLowerCase();
    return (
      matchesView &&
      (!search || searchable.includes(search)) &&
      (!query.provider || query.provider === "all" || carrier.providerType === query.provider) &&
      (!query.status || query.status === "all" || carrier.status === query.status)
    );
  });

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="success">Tenant configuration</StatusBadge>
              <StatusBadge tone={data.canManage ? "info" : "neutral"}>{data.canManage ? "Manage enabled" : "Read only"}</StatusBadge>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Maintain the carrier and service choices used by reviewed dispatch planning. Credentials, exports and provider connections remain outside this foundation.</p>
          </div>
          {data.canManage ? <PageActionButton href="/logistics/carriers/new">New carrier</PageActionButton> : null}
        </section>

        <LogisticsActionFeedback feedback={getCarrierConfigurationActionMessage(query.carrier)} />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Carriers" value={String(data.summary.total)} helperText="All tenant carrier records." badge="Total" tone="info" icon="CR" />
          <StatCard label="Active carriers" value={String(data.summary.active)} helperText="Available to new dispatch work." badge="Active" tone="success" icon="AC" />
          <StatCard label="Active services" value={String(data.summary.activeServices)} helperText="Available after carrier selection." badge="Services" tone="success" icon="SV" />
          <StatCard label="Archived" value={String(data.summary.archived)} helperText="Retained for historical references." badge="History" tone="neutral" icon="AR" />
        </section>

        <SectionCard title="Configuration filters" description="Current records exclude archived carriers by default." action={<StatusBadge tone="neutral">{`${carriers.length} shown`}</StatusBadge>}>
          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="block xl:col-span-2"><span className="text-xs font-semibold uppercase text-slate-500">Search</span><input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={query.q ?? ""} name="q" placeholder="Name, code or provider type" /></label>
            <label className="block"><span className="text-xs font-semibold uppercase text-slate-500">Provider type</span><select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" defaultValue={query.provider ?? "all"} name="provider"><option value="all">All provider types</option>{logisticsCarrierProviderTypes.map((provider) => <option key={provider} value={provider}>{logisticsCarrierProviderTypeLabels[provider]}</option>)}</select></label>
            <label className="block"><span className="text-xs font-semibold uppercase text-slate-500">Status</span><select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" defaultValue={query.status ?? "all"} name="status"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="archived">Archived</option></select></label>
            <label className="block"><span className="text-xs font-semibold uppercase text-slate-500">Records</span><select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" defaultValue={view} name="view"><option value="current">Current</option><option value="archived">Archived only</option><option value="all">All records</option></select></label>
            <div className="md:col-span-2 xl:col-span-5"><button className="rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-90">Apply filters</button></div>
          </form>
        </SectionCard>

        <SectionCard title="Carrier records" description="Archived records remain visible when requested so historical dispatch references stay understandable.">
          {carriers.length === 0 ? (
            <EmptyState title="No carrier records match" description={data.carriers.length === 0 ? "Create the first carrier when reviewed dispatch configuration is available." : "Adjust the filters to see other carrier records."} action={data.canManage && data.carriers.length === 0 ? <PageActionButton href="/logistics/carriers/new">New carrier</PageActionButton> : undefined} />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {carriers.map((carrier) => (
                <Link className="rounded-md border border-slate-200 bg-white p-4 transition hover:border-[color:var(--tenant-primary-border)] hover:shadow-sm" href={`/logistics/carriers/${carrier.id}`} key={carrier.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-slate-950">{carrier.name}</p><p className="mt-1 font-mono text-xs text-slate-500">{carrier.code}</p></div><StatusBadge tone={carrier.statusTone}>{carrier.statusLabel}</StatusBadge></div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs font-semibold uppercase text-slate-500">Provider</p><p className="mt-1 text-slate-700">{carrier.providerTypeLabel}</p></div><div><p className="text-xs font-semibold uppercase text-slate-500">Active services</p><p className="mt-1 text-slate-700">{carrier.activeServiceCount}</p></div></div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
