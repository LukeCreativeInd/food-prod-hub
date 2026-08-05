import { AppShell } from "@/components/app-shell";
import { DeliveryActionFeedback, DeliveryFoundationState, LifecycleBadge, deliveryFieldClass } from "@/components/shopify/delivery-config-ui";
import { ShopifyWorkspaceNav } from "@/components/shopify/shopify-workspace-nav";
import { EmptyState, SectionCard } from "@/components/ui";
import { getDeliveryConfigurationData } from "@/lib/delivery-configuration-data";

import { createDeliveryCalendarDraftAction } from "../actions";

type PageProps = { searchParams: Promise<{ delivery?: string }> };

export default async function DeliveryCalendarsPage({ searchParams }: PageProps) {
  const [{ delivery }, data] = await Promise.all([searchParams, getDeliveryConfigurationData()]);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <ShopifyWorkspaceNav />
        <DeliveryActionFeedback result={delivery} />
        <SectionCard title="Delivery calendars" description="Effective-dated versions preserve the reviewed weekly rule set used for historical interpretation.">
          <DeliveryFoundationState status={data.status} message={data.statusMessage} />
          {data.status === "ready" && data.calendars.length === 0 ? (
            <EmptyState title="No delivery calendars" description="No Clean Eats schedule or public holiday is seeded. Create a draft only from reviewed operating rules." />
          ) : data.status === "ready" ? (
            <div className="space-y-3">
              {data.calendars.map((calendar) => {
                const versions = data.versions.filter((version) => version.calendar_id === calendar.id);
                return (
                  <article key={calendar.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div><p className="font-semibold text-slate-950">{calendar.name}</p><p className="mt-1 text-sm text-slate-500">{calendar.code} · {calendar.timezone}</p></div>
                      <LifecycleBadge status={calendar.status} />
                    </div>
                    <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                      {versions.map((version) => (
                        <div key={version.id} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                          <div className="flex items-center justify-between gap-2"><span className="font-semibold">Version {version.version_number}</span><LifecycleBadge status={version.status} /></div>
                          <p className="mt-2 text-slate-500">{version.effective_from} to {version.effective_to ?? "open-ended"}</p>
                          <p className="mt-1 text-slate-500">{data.rules.filter((rule) => rule.calendar_version_id === version.id).length} weekly rule(s) · {data.exceptions.filter((exception) => exception.calendar_version_id === version.id).length} exception(s)</p>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </SectionCard>

        {data.status === "ready" && data.canManage ? (
          <SectionCard title="Create calendar draft" description="A draft is not operational until its weekly rules and exceptions are reviewed and published.">
            <form action={createDeliveryCalendarDraftAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Code</span><input required name="code" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Name</span><input required name="name" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>IANA timezone</span><input required name="timezone" placeholder="Australia/Melbourne" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Effective from</span><input required type="date" name="effective_from" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Effective to</span><input type="date" name="effective_to" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Shopify connection</span><select name="connection_id" defaultValue="" className={deliveryFieldClass}><option value="">Shared organisation calendar</option>{data.connections.map((connection) => <option key={connection.id} value={connection.id}>{connection.storefront_display_name}</option>)}</select></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Default facility</span><select name="facility_id" defaultValue="" className={deliveryFieldClass}><option value="">Resolve in each rule</option>{data.facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name} ({facility.code})</option>)}</select></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700 md:col-span-2"><span>Description</span><textarea name="description" rows={3} className={deliveryFieldClass} /></label>
              <button type="submit" className="rounded-md bg-[var(--tenant-primary)] px-4 py-2 text-sm font-semibold text-white md:w-fit">Create draft</button>
            </form>
          </SectionCard>
        ) : null}

        <SectionCard title="Resolution rules" description="The resolver never uses browser or server-local dates and never selects an ambiguous same-precedence rule.">
          <ol className="grid gap-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-3">
            {["Approved order override", "Exact-date exception", "Connection-specific zone/service rule", "Shared zone/service rule", "Organisation/facility standard", "Blocked or unresolved"].map((item, index) => <li key={item} className="rounded-md border border-slate-200 bg-slate-50 p-3"><span className="font-semibold text-slate-950">{index + 1}.</span> {item}</li>)}
          </ol>
        </SectionCard>
      </div>
    </AppShell>
  );
}
