import { notFound } from "next/navigation";

import {
  archiveCarrierAction,
  archiveCarrierServiceAction,
} from "@/app/logistics/carriers/actions";
import { AppShell } from "@/components/app-shell";
import { CarrierForm } from "@/components/logistics/carrier-form";
import { CarrierServiceForm } from "@/components/logistics/carrier-service-form";
import { LogisticsActionFeedback } from "@/components/logistics/logistics-action-feedback";
import { PageActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { getCarrierConfigurationActionMessage } from "@/lib/logistics-action-messages";
import { fetchCarrierConfigurationDetail } from "@/lib/logistics-configuration-data";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ carrier?: string }>;
};

export default async function CarrierDetailPage({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const data = await fetchCarrierConfigurationDetail(id);
  if (!data) notFound();
  const editable = data.canManage && !data.carrier.archived;

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3"><PageActionButton href="/logistics/carriers" variant="secondary">Back to carriers</PageActionButton><StatusBadge tone={data.carrier.statusTone}>{data.carrier.statusLabel}</StatusBadge></div>
        <LogisticsActionFeedback feedback={getCarrierConfigurationActionMessage(query.carrier)} />

        <SectionCard title={data.carrier.name} description={`${data.carrier.code} · ${data.carrier.providerTypeLabel}`} action={<StatusBadge tone={editable ? "success" : "neutral"}>{editable ? "Manage enabled" : "Read only"}</StatusBadge>}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div><p className="text-xs font-semibold uppercase text-slate-500">Status</p><p className="mt-1 text-sm text-slate-700">{data.carrier.statusLabel}</p></div>
            <div><p className="text-xs font-semibold uppercase text-slate-500">Provider type</p><p className="mt-1 text-sm text-slate-700">{data.carrier.providerTypeLabel}</p></div>
            <div><p className="text-xs font-semibold uppercase text-slate-500">Active services</p><p className="mt-1 text-sm text-slate-700">{data.carrier.activeServiceCount}</p></div>
            <div><p className="text-xs font-semibold uppercase text-slate-500">Created</p><p className="mt-1 text-sm text-slate-700">{data.carrier.createdAt}</p></div>
            <div><p className="text-xs font-semibold uppercase text-slate-500">Updated</p><p className="mt-1 text-sm text-slate-700">{data.carrier.updatedAt}</p></div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{data.carrier.notes}</p>
          {data.carrier.archived ? <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">This carrier is archived and retained for historical dispatch references. It cannot be edited or selected for new dispatch work.</p> : null}
        </SectionCard>

        {editable ? (
          <SectionCard title="Edit carrier" description="Inactive carriers remain in history but are removed from new dispatch selectors.">
            <CarrierForm carrier={data.carrier} />
          </SectionCard>
        ) : null}

        <SectionCard title="Carrier services" description="Only active, unarchived services appear in new dispatch choices.">
          {data.services.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">No services have been configured for this carrier.</p>
          ) : (
            <div className="space-y-4">
              {data.services.map((service) => {
                const serviceEditable = editable && !service.archived;
                return (
                  <article className="rounded-md border border-slate-200 p-4" key={service.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-slate-950">{service.name}</p><p className="mt-1 font-mono text-xs text-slate-500">{service.code}</p></div><StatusBadge tone={service.statusTone}>{service.statusLabel}</StatusBadge></div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Type:</span> {service.serviceTypeLabel}</p><p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Temperature:</span> {service.temperatureClassLabel}</p><p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Updated:</span> {service.updatedAt}</p></div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{service.notes}</p>
                    {serviceEditable ? (
                      <div className="mt-5 space-y-4 border-t border-slate-200 pt-5">
                        <CarrierServiceForm carrierId={data.carrier.id} service={service} />
                        <form action={archiveCarrierServiceAction}><input name="carrier_id" type="hidden" value={data.carrier.id} /><input name="service_id" type="hidden" value={service.id} /><button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="submit">Archive service</button></form>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>

        {editable ? (
          <SectionCard title="Add service" description="Create an operational service under this carrier."><CarrierServiceForm carrierId={data.carrier.id} /></SectionCard>
        ) : null}

        {editable ? (
          <SectionCard title="Archive carrier" description="Archiving is blocked while active services remain. No records are deleted.">
            <form action={archiveCarrierAction}><input name="carrier_id" type="hidden" value={data.carrier.id} /><button className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-700 hover:bg-red-100" type="submit">Archive carrier</button></form>
          </SectionCard>
        ) : null}
      </div>
    </AppShell>
  );
}
