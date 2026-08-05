import { AppShell } from "@/components/app-shell";
import { DeliveryActionFeedback, DeliveryFoundationState, LifecycleBadge, deliveryFieldClass } from "@/components/shopify/delivery-config-ui";
import { ShopifyWorkspaceNav } from "@/components/shopify/shopify-workspace-nav";
import { EmptyState, SectionCard } from "@/components/ui";
import { getDeliveryConfigurationData } from "@/lib/delivery-configuration-data";

import { createDeliveryParserDraftAction } from "../actions";

type PageProps = { searchParams: Promise<{ delivery?: string }> };

export default async function DeliveryParserPage({ searchParams }: PageProps) {
  const [{ delivery }, data] = await Promise.all([searchParams, getDeliveryConfigurationData()]);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <ShopifyWorkspaceNav />
        <DeliveryActionFeedback result={delivery} />
        <SectionCard title="Zapiet metadata parser profiles" description="Profiles belong to one Shopify connection and use exact allowlisted keys, date formats and bounded value maps.">
          <DeliveryFoundationState status={data.status} message={data.statusMessage} />
          {data.status === "ready" && data.connections.length === 0 ? (
            <EmptyState title="No Shopify connection" description="A parser profile cannot be configured until a reviewed tenant connection exists. No global Zapiet keys are assumed." />
          ) : data.status === "ready" && data.parserProfiles.length === 0 ? (
            <EmptyState title="No parser profiles" description="No metadata key, date format or value mapping is configured. Delivery parser readiness remains not started." />
          ) : data.status === "ready" ? (
            <div className="space-y-3">
              {data.parserProfiles.map((profile) => {
                const connection = data.connections.find((row) => row.id === profile.connection_id);
                return <article key={profile.id} className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-slate-950">{connection?.storefront_display_name ?? "Shopify connection"} · Version {profile.version_number}</p><p className="mt-1 text-sm text-slate-500">{profile.timezone} · {profile.effective_from} to {profile.effective_to ?? "open-ended"}</p></div><LifecycleBadge status={profile.status} /></div><p className="mt-3 text-sm text-slate-600">{data.parserFields.filter((field) => field.parser_profile_id === profile.id).length} exact field mapping(s). Raw payloads are not stored.</p></article>;
              })}
            </div>
          ) : null}
        </SectionCard>

        {data.status === "ready" && data.canManage && data.connections.length > 0 ? (
          <SectionCard title="Create parser draft" description="Publishing remains blocked until a delivery-date field is configured and reviewed.">
            <form action={createDeliveryParserDraftAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Shopify connection</span><select required name="connection_id" defaultValue="" className={deliveryFieldClass}><option value="" disabled>Select connection</option>{data.connections.map((connection) => <option key={connection.id} value={connection.id}>{connection.storefront_display_name}</option>)}</select></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>IANA timezone</span><input required name="timezone" placeholder="Australia/Melbourne" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Effective from</span><input required type="date" name="effective_from" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Effective to</span><input type="date" name="effective_to" className={deliveryFieldClass} /></label>
              <button type="submit" className="rounded-md bg-[var(--tenant-primary)] px-4 py-2 text-sm font-semibold text-white md:w-fit">Create parser draft</button>
            </form>
          </SectionCard>
        ) : null}

        <SectionCard title="Parser boundary" description="Task 235 does not implement an arbitrary rules engine.">
          <p className="text-sm leading-6 text-slate-600">Phase 1 parser sources are exact order attributes and source tags only. Line attributes remain deferred until deterministic multi-line handling is designed. Supported targets are delivery date, zone reference, service reference and region reference. Date formats are allowlisted. Customer names, contact details, addresses, postcodes, unrestricted notes and raw webhooks are excluded.</p>
        </SectionCard>
      </div>
    </AppShell>
  );
}
