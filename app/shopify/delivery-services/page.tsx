import { AppShell } from "@/components/app-shell";
import { DeliveryActionFeedback, DeliveryFoundationState, LifecycleBadge, deliveryFieldClass } from "@/components/shopify/delivery-config-ui";
import { ShopifyWorkspaceNav } from "@/components/shopify/shopify-workspace-nav";
import { EmptyState, SectionCard } from "@/components/ui";
import { getDeliveryConfigurationData } from "@/lib/delivery-configuration-data";

import { createDeliveryServiceAction } from "../actions";

type PageProps = { searchParams: Promise<{ delivery?: string }> };

export default async function DeliveryServicesPage({ searchParams }: PageProps) {
  const [{ delivery }, data] = await Promise.all([searchParams, getDeliveryConfigurationData()]);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <ShopifyWorkspaceNav />
        <DeliveryActionFeedback result={delivery} />
        <SectionCard title="Delivery services" description="Customer-facing delivery promises remain separate from optional Logistics carrier execution.">
          <DeliveryFoundationState status={data.status} message={data.statusMessage} />
          {data.status === "ready" && data.services.length === 0 ? (
            <EmptyState title="No delivery services" description="No services or carrier links are seeded. Create one only after its operating scope is reviewed." />
          ) : data.status === "ready" ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.services.map((service) => (
                <article key={service.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-950">{service.name}</p><p className="mt-1 text-sm text-slate-500">{service.code} · {service.service_type.replaceAll("_", " ")}</p></div><LifecycleBadge status={service.status} /></div>
                  <p className="mt-3 text-sm text-slate-600">{service.timezone} · {data.assignments.filter((assignment) => assignment.service_id === service.id && assignment.status === "active").length} active zone assignment(s)</p>
                  <p className="mt-2 text-xs text-slate-500">{service.carrier_id ? "Optional Logistics carrier linked" : "No Logistics carrier linked"}</p>
                </article>
              ))}
            </div>
          ) : null}
        </SectionCard>

        {data.status === "ready" && data.canManage ? (
          <SectionCard title="Create delivery service" description="Carrier identity is optional and remains owned by Logistics.">
            <form action={createDeliveryServiceAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Code</span><input required name="code" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Name</span><input required name="name" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Service type</span><select required name="service_type" defaultValue="standard" className={deliveryFieldClass}><option value="standard">Standard</option><option value="pickup">Pickup</option><option value="wholesale">Wholesale</option><option value="internal">Internal</option><option value="other">Other</option></select></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>IANA timezone</span><input required name="timezone" placeholder="Australia/Melbourne" className={deliveryFieldClass} /></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700"><span>Facility scope</span><select name="facility_id" defaultValue="" className={deliveryFieldClass}><option value="">No fixed facility</option>{data.facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name} ({facility.code})</option>)}</select></label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700 md:col-span-2 xl:col-span-3"><span>Description</span><textarea name="description" rows={3} className={deliveryFieldClass} /></label>
              <button type="submit" className="rounded-md bg-[var(--tenant-primary)] px-4 py-2 text-sm font-semibold text-white md:w-fit">Create service</button>
            </form>
          </SectionCard>
        ) : null}
      </div>
    </AppShell>
  );
}
