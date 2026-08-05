import { AppShell } from "@/components/app-shell";
import {
  DeliveryActionFeedback,
  DeliveryFoundationState,
  LifecycleBadge,
  deliveryFieldClass,
} from "@/components/shopify/delivery-config-ui";
import { ShopifyWorkspaceNav } from "@/components/shopify/shopify-workspace-nav";
import { EmptyState, SectionCard } from "@/components/ui";
import { getDeliveryConfigurationData } from "@/lib/delivery-configuration-data";

import { createDeliveryZoneAction } from "../actions";

type PageProps = { searchParams: Promise<{ delivery?: string }> };

export default async function DeliveryZonesPage({ searchParams }: PageProps) {
  const [{ delivery }, data] = await Promise.all([
    searchParams,
    getDeliveryConfigurationData(),
  ]);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <ShopifyWorkspaceNav />
        <DeliveryActionFeedback result={delivery} />

        <SectionCard
          title="Delivery zones"
          description="Tenant-owned operational groupings. Zones are not storefronts, facilities, carriers or customer postcode records."
        >
          <DeliveryFoundationState status={data.status} message={data.statusMessage} />
          {data.status === "ready" && data.zones.length === 0 ? (
            <EmptyState title="No delivery zones" description="No real zones are seeded. Create a reviewed zone only when its operational meaning is known." />
          ) : data.status === "ready" ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.zones.map((zone) => (
                <article key={zone.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{zone.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{zone.code} · {zone.timezone}</p>
                    </div>
                    <LifecycleBadge status={zone.status} />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{zone.region_reference ?? zone.state_region ?? "Reviewed region reference not set"}</p>
                </article>
              ))}
            </div>
          ) : null}
        </SectionCard>

        {data.status === "ready" && data.canManage ? (
          <SectionCard title="Create zone" description="Use a stable operational code. Do not enter customer addresses, names or postcodes.">
            <form action={createDeliveryZoneAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Code</span><input required name="code" placeholder="vic_metro" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Name</span><input required name="name" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>IANA timezone</span><input required name="timezone" placeholder="Australia/Melbourne" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Country code</span><input name="country_code" maxLength={2} placeholder="AU" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>State / region</span><input name="state_region" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Reviewed region reference</span><input name="region_reference" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700 md:col-span-2 xl:col-span-3"><span>Description</span><textarea name="description" rows={3} className={deliveryFieldClass} /></label>
              <button type="submit" className="rounded-md bg-[var(--tenant-primary)] px-4 py-2 text-sm font-semibold text-white md:w-fit">Create zone</button>
            </form>
          </SectionCard>
        ) : null}
      </div>
    </AppShell>
  );
}
