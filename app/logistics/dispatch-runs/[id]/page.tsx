import Link from "next/link";
import { notFound } from "next/navigation";

import {
  archiveDispatchDeliveryAction,
  archiveDispatchLineAction,
  createManifestDraftAction,
  generateManifestAction,
  transitionDispatchRunAction,
  validateDispatchRunAction,
} from "@/app/logistics/actions";
import { AppShell } from "@/components/app-shell";
import { DispatchDeliveryForm } from "@/components/logistics/dispatch-delivery-form";
import { DispatchLineForm } from "@/components/logistics/dispatch-line-form";
import { DispatchRunForm } from "@/components/logistics/dispatch-run-form";
import { EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getDispatchActionMessage } from "@/lib/logistics-action-messages";
import { fetchDispatchRunDetail } from "@/lib/logistics-data";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dispatch?: string }>;
};

function validationTone(status: string) {
  if (status === "valid") return "success" as const;
  if (status === "blocked") return "warning" as const;
  return "neutral" as const;
}

export default async function DispatchRunDetailPage({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const detail = await fetchDispatchRunDetail(id);
  if (!detail) notFound();
  const message = getDispatchActionMessage(query.dispatch);
  const draftManifest = detail.manifests.find((manifest) => manifest.status === "draft");
  const canCreateManifest = detail.canCreateManifest && detail.run.status === "ready" && !detail.hasGeneratedManifest && !draftManifest;
  const canGenerateManifest = detail.canManageManifest && detail.run.status === "ready" && !detail.hasGeneratedManifest && Boolean(draftManifest);
  const canCancelRun = detail.run.status === "draft" || (detail.run.status === "ready" && !detail.hasGeneratedManifest);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <PageActionButton href="/logistics/dispatch-runs" variant="secondary">Back to dispatch runs</PageActionButton>
          <StatusBadge tone={detail.run.statusTone}>{detail.run.statusLabel}</StatusBadge>
          <StatusBadge tone={validationTone(detail.validation.status)}>{detail.validation.status === "not_checked" ? "Validation not checked" : `Validation ${detail.validation.status}`}</StatusBadge>
          {detail.hasGeneratedManifest ? <StatusBadge tone="success">Manifest generated</StatusBadge> : null}
        </div>

        {message ? <div className="rounded-md border border-[color:var(--tenant-primary-border)] bg-[var(--tenant-primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--tenant-primary)]">{message}</div> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">{detail.run.runNumber}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">{detail.run.name}</h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">Manual outbound planning record. Delivery and item snapshots belong to Logistics; no customer master, order, inventory, production or QA record is changed.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {detail.canManage && detail.run.status === "draft" && !detail.hasGeneratedManifest ? (
                <form action={validateDispatchRunAction}><input name="dispatch_run_id" type="hidden" value={detail.run.id} /><button className="rounded-md border border-[color:var(--tenant-primary-border)] bg-white px-3.5 py-2 text-sm font-semibold text-[var(--tenant-primary)] hover:bg-[var(--tenant-primary-soft)]">Validate run</button></form>
              ) : null}
              {canCreateManifest ? (
                <form action={createManifestDraftAction}><input name="dispatch_run_id" type="hidden" value={detail.run.id} /><button className="rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-90">Create manifest draft</button></form>
              ) : null}
              {draftManifest ? <PageActionButton href={`/logistics/manifests/${draftManifest.id}`} variant="secondary">Open manifest draft</PageActionButton> : null}
              {canGenerateManifest && draftManifest ? (
                <form action={generateManifestAction}><input name="manifest_id" type="hidden" value={draftManifest.id} /><input name="dispatch_run_id" type="hidden" value={detail.run.id} /><button className="rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-90">Generate manifest</button></form>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Dispatch date" value={detail.run.dispatchDate} helperText={`Delivery ${detail.run.deliveryDate}`} badge="Schedule" tone="info" icon="DT" />
          <StatCard label="Deliveries" value={String(detail.run.deliveryCount)} helperText="Active delivery snapshots." badge="Stops" tone="info" icon="DL" />
          <StatCard label="Cartons" value={String(detail.run.cartonCount)} helperText="Reviewed manual carton total." badge="Total" tone="neutral" icon="CT" />
          <StatCard label="Item lines" value={String(detail.validation.lineCount || detail.deliveries.reduce((sum, delivery) => sum + delivery.lines.length, 0))} helperText="Active dispatch item snapshots." badge="Lines" tone="neutral" icon="LI" />
          <StatCard label="Validation" value={detail.validation.status === "not_checked" ? "Not checked" : detail.validation.status === "valid" ? "Passed" : "Blocked"} helperText={`Last checked ${detail.validation.checkedAt}.`} badge="Server" tone={validationTone(detail.validation.status)} icon="VA" />
        </section>

        <SectionCard title="Run details" description="Draft fields lock after readiness or manifest generation." action={<StatusBadge tone={detail.canEditDraft ? "success" : "neutral"}>{detail.canEditDraft ? "Editable" : "Read only"}</StatusBadge>}>
          {detail.canEditDraft ? (
            <DispatchRunForm mode="edit" options={detail.formOptions} values={{ id: detail.run.id, name: detail.run.name === "Unnamed dispatch run" ? "" : detail.run.name, dispatchType: detail.run.dispatchType, dispatchDate: detail.run.dispatchDateValue, deliveryDate: detail.run.deliveryDateValue, defaultCarrierId: detail.run.defaultCarrierId, defaultCarrierServiceId: detail.run.defaultCarrierServiceId, notes: detail.run.notesValue }} />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[["Type", detail.run.dispatchTypeLabel], ["Carrier", detail.run.defaultCarrier], ["Service", detail.run.defaultService], ["Created", detail.run.createdAt], ["Ready at", detail.run.readyAt], ["Dispatched at", detail.run.dispatchedAt], ["Cancelled at", detail.run.cancelledAt], ["Cancellation reason", detail.run.cancellationReason], ["Notes", detail.run.notes]].map(([label, value]) => <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3" key={label}><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>)}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Validation and lifecycle" description="Only Logistics-owned required data is checked. Stock, QA, production and carrier systems are intentionally outside this validation." action={<StatusBadge tone={validationTone(detail.validation.status)}>{detail.validation.status}</StatusBadge>}>
          {detail.validation.errors.length > 0 ? <ul className="space-y-2">{detail.validation.errors.map((error) => <li className="rounded-md border border-[color:var(--tenant-warning-border)] bg-[var(--tenant-warning-bg)] px-3 py-2 text-sm text-slate-700" key={error}>{error}</li>)}</ul> : <p className="text-sm leading-6 text-slate-600">{detail.validation.status === "valid" ? "Required run, delivery and line data passed deterministic server validation." : "Run validation has not recorded blockers yet."}</p>}
          {detail.canManage ? (
            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:flex-wrap sm:items-end">
              {detail.run.status === "draft" && detail.validation.status === "valid" ? <form action={transitionDispatchRunAction}><input name="dispatch_run_id" type="hidden" value={detail.run.id} /><input name="target_status" type="hidden" value="ready" /><button className="rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-90">Mark ready</button></form> : null}
              {detail.run.status === "draft" && detail.validation.status !== "valid" ? <p className="text-sm text-slate-500">Validate the completed run before marking it ready.</p> : null}
              {detail.run.status === "ready" && detail.hasGeneratedManifest ? <form action={transitionDispatchRunAction}><input name="dispatch_run_id" type="hidden" value={detail.run.id} /><input name="target_status" type="hidden" value="dispatched" /><button className="rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-90">Mark dispatched</button></form> : null}
              {detail.run.status === "ready" && !detail.hasGeneratedManifest ? <p className="text-sm text-slate-500">Generate the manifest before marking this run dispatched.</p> : null}
              {canCancelRun ? <form action={transitionDispatchRunAction} className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"><input name="dispatch_run_id" type="hidden" value={detail.run.id} /><input name="target_status" type="hidden" value="cancelled" /><input className="min-w-64 rounded-md border border-slate-200 px-3 py-2 text-sm" name="cancellation_reason" placeholder="Cancellation reason" required /><button className="rounded-md border border-[color:var(--tenant-danger-border)] bg-white px-3.5 py-2 text-sm font-semibold text-[var(--tenant-danger)] hover:bg-[var(--tenant-danger-bg)]">Cancel run</button></form> : null}
            </div>
          ) : null}
        </SectionCard>

        <SectionCard title="Deliveries" description="Addresses and recipient details are historical dispatch snapshots entered manually; they are not CRM or order master records." action={<StatusBadge tone={detail.canAddToDraft ? "success" : "neutral"}>{detail.canAddToDraft ? "Add enabled" : "Read only"}</StatusBadge>}>
          {detail.deliveries.length === 0 ? <EmptyState title="No deliveries yet" description="Add at least one delivery and item line before validation and readiness." /> : (
            <div className="space-y-5">
              {detail.deliveries.map((delivery) => (
                <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={delivery.id}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div><div className="flex flex-wrap gap-2"><StatusBadge tone={validationTone(delivery.validationStatus)}>{delivery.validationStatus.replaceAll("_", " ")}</StatusBadge><StatusBadge tone="neutral">{`${delivery.cartonCount} cartons`}</StatusBadge>{delivery.temperatureClassValue ? <StatusBadge tone="info">{delivery.temperatureClass}</StatusBadge> : null}</div><h3 className="mt-3 text-base font-bold text-slate-950">{delivery.recipientName}</h3><p className="mt-1 text-sm text-slate-600">{[delivery.companyName, delivery.addressLine1, delivery.addressLine2, delivery.suburbCity, delivery.stateRegion, delivery.postcode, delivery.countryCode].filter(Boolean).join(", ")}</p><p className="mt-1 text-xs text-slate-500">Delivery {delivery.deliveryDate} · {delivery.carrierName} · {delivery.carrierServiceName}</p></div>
                    {detail.canEditDraft ? <div className="flex flex-wrap gap-2"><PageActionButton href={`/logistics/dispatch-runs/${detail.run.id}/deliveries/${delivery.id}/edit`} variant="secondary">Edit delivery</PageActionButton><form action={archiveDispatchDeliveryAction}><input name="dispatch_run_id" type="hidden" value={detail.run.id} /><input name="delivery_id" type="hidden" value={delivery.id} /><button className="rounded-md border border-[color:var(--tenant-danger-border)] bg-white px-3.5 py-2 text-sm font-semibold text-[var(--tenant-danger)] hover:bg-[var(--tenant-danger-bg)]">Remove</button></form></div> : null}
                  </div>
                  {delivery.validationErrors.length > 0 ? <ul className="mt-3 space-y-1 text-xs text-[var(--tenant-warning)]">{delivery.validationErrors.map((error) => <li key={error}>{error}</li>)}</ul> : null}
                  <div className="mt-4 overflow-x-auto rounded-md border border-slate-200">
                    <table className="min-w-[720px] divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500"><tr><th className="px-3 py-2">Line</th><th className="px-3 py-2">Item snapshot</th><th className="px-3 py-2">Code</th><th className="px-3 py-2">Quantity</th><th className="px-3 py-2">Reference</th>{detail.canEditDraft ? <th className="px-3 py-2">Actions</th> : null}</tr></thead><tbody className="divide-y divide-slate-100">{delivery.lines.length ? delivery.lines.map((line) => <tr key={line.id}><td className="px-3 py-2 text-slate-600">{line.lineNumber}</td><td className="px-3 py-2 font-semibold text-slate-900">{line.itemName}</td><td className="px-3 py-2 text-slate-600">{line.itemCode || "-"}</td><td className="px-3 py-2 text-slate-600">{line.quantity} {line.unit}</td><td className="px-3 py-2 text-slate-600">{line.externalLineReference || "-"}</td>{detail.canEditDraft ? <td className="px-3 py-2"><div className="flex gap-2"><Link className="font-semibold text-[var(--tenant-primary)] hover:underline" href={`/logistics/dispatch-runs/${detail.run.id}/deliveries/${delivery.id}/lines/${line.id}/edit`}>Edit</Link><form action={archiveDispatchLineAction}><input name="dispatch_run_id" type="hidden" value={detail.run.id} /><input name="line_id" type="hidden" value={line.id} /><button className="font-semibold text-[var(--tenant-danger)] hover:underline">Remove</button></form></div></td> : null}</tr>) : <tr><td className="px-3 py-5 text-center text-slate-500" colSpan={detail.canEditDraft ? 6 : 5}>No active item lines.</td></tr>}</tbody></table>
                  </div>
                  {detail.canAddToDraft ? <div className="mt-4 border-t border-slate-100 pt-4"><h4 className="text-sm font-semibold text-slate-900">Add item line</h4><div className="mt-3"><DispatchLineForm deliveryId={delivery.id} items={detail.formOptions.items} mode="create" nextLineNumber={Math.max(0, ...delivery.lines.map((line) => line.lineNumber)) + 1} runId={detail.run.id} /></div></div> : null}
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        {detail.canAddToDraft ? <SectionCard title="Add delivery" description="Capture reviewed recipient, address and carton details for this dispatch only."><DispatchDeliveryForm defaultDeliveryDate={detail.run.deliveryDateValue} mode="create" options={detail.formOptions} runId={detail.run.id} /></SectionCard> : null}

        <SectionCard title="Manifest history" description="Generated records remain immutable snapshots and do not render from mutable delivery source rows." action={<PageActionButton href="/logistics/manifests" variant="secondary">All manifests</PageActionButton>}>
          {detail.manifests.length === 0 ? <EmptyState title="No manifest records yet" description={detail.run.status === "draft" ? "Validate and mark the run ready before creating its manifest draft." : "Create a draft manifest when the ready dispatch data is prepared for generation."} /> : <div className="grid gap-3 md:grid-cols-2">{detail.manifests.map((manifest) => <Link className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-[color:var(--tenant-primary-border)] hover:bg-white" href={`/logistics/manifests/${manifest.id}`} key={manifest.id}><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{manifest.manifestNumber}</p><p className="mt-1 text-xs text-slate-500">Version {manifest.versionNumber} · {manifest.generatedAt}</p></div><StatusBadge tone={manifest.statusTone}>{manifest.statusLabel}</StatusBadge></div></Link>)}</div>}
        </SectionCard>
      </div>
    </AppShell>
  );
}
