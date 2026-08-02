import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { fetchCarrierExportConfigurationReadiness } from "@/lib/logistics-configuration-data";

export default async function CarrierExportsPage() {
  const readiness = await fetchCarrierExportConfigurationReadiness();
  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2"><StatusBadge tone="neutral">Not connected</StatusBadge><StatusBadge tone="info">Foundation only</StatusBadge></div>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">Carrier Exports will later track reviewed handoffs to generic carrier files and provider-specific destinations. No file, API call, credential or export history is created here.</p>
        </section>

        {readiness.canViewConfiguration ? (
          <section className="grid gap-4 md:grid-cols-2">
            <StatCard label="Active carriers" value={String(readiness.activeCarrierCount)} helperText="Available to current dispatch planning." badge="Configured" tone="success" icon="CR" />
            <StatCard label="Active services" value={String(readiness.activeServiceCount)} helperText="Available after carrier selection." badge="Configured" tone="success" icon="SV" />
          </section>
        ) : null}

        <SectionCard title="Carrier configuration readiness" description="Carrier identities and services are tenant configuration; export destinations and credentials remain future work." action={readiness.canViewConfiguration ? <Link className="rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-90" href="/logistics/carriers">{readiness.canManageConfiguration ? "Manage carriers" : "View carriers"}</Link> : <StatusBadge tone="neutral">Configuration restricted</StatusBadge>}>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4"><p className="font-semibold text-slate-900">Carrier records</p><p className="mt-2 text-sm leading-6 text-slate-600">Real carrier and service configuration can support reviewed dispatch choices without implying a connected provider.</p></div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4"><p className="font-semibold text-slate-900">Detrack</p><p className="mt-2 text-sm leading-6 text-slate-600">Planned only. No connection status, credentials or provider calls are exposed.</p></div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4"><p className="font-semibold text-slate-900">Export history</p><p className="mt-2 text-sm leading-6 text-slate-600">Not available until a reviewed carrier export workflow and schema exist.</p></div>
          </div>
        </SectionCard>

        <SectionCard title="Export records" description="Operational export records do not exist in this foundation.">
          <EmptyState title="No carrier export records exist yet" description="Generated manifests remain the historical source. This page does not create downloadable artifacts or provider handoffs." />
        </SectionCard>
      </div>
    </AppShell>
  );
}
