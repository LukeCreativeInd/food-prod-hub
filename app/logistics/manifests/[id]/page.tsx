import Link from "next/link";
import { notFound } from "next/navigation";

import { generateManifestAction } from "@/app/logistics/actions";
import { AppShell } from "@/components/app-shell";
import { LogisticsActionFeedback } from "@/components/logistics/logistics-action-feedback";
import { EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getManifestActionMessage } from "@/lib/logistics-action-messages";
import { fetchManifestDetail } from "@/lib/logistics-data";
import type { DispatchRunStatus } from "@/lib/logistics-types";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ manifest?: string }> };

function getManifestHandoff(status: DispatchRunStatus) {
  if (status === "ready") {
    return {
      message: "The manifest is generated. Return to the dispatch run when you are ready to mark it dispatched.",
      label: "Return to dispatch run",
      active: true,
    };
  }
  if (status === "dispatched") {
    return {
      message: "This manifest belongs to a dispatched run.",
      label: "View dispatch run",
      active: false,
    };
  }
  if (status === "cancelled") {
    return {
      message: "This manifest is linked to a cancelled dispatch run.",
      label: "View dispatch run",
      active: false,
    };
  }
  return {
    message: "This manifest is linked to a read-only dispatch run.",
    label: "View dispatch run",
    active: false,
  };
}

export default async function ManifestDetailPage({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const detail = await fetchManifestDetail(id);
  if (!detail) notFound();
  const message = getManifestActionMessage(query.manifest);
  const generated = detail.manifest.status === "generated" || detail.manifest.status === "superseded";
  const handoff = getManifestHandoff(detail.dispatchRun.status);
  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3"><PageActionButton href="/logistics/manifests" variant="secondary">Back to manifests</PageActionButton><PageActionButton href={`/logistics/dispatch-runs/${detail.dispatchRun.id}`} variant="secondary">Back to dispatch run</PageActionButton><StatusBadge tone={detail.manifest.statusTone}>{detail.manifest.statusLabel}</StatusBadge>{generated ? <StatusBadge tone="success">Historical snapshot</StatusBadge> : <StatusBadge tone="warning">Draft manifest</StatusBadge>}</div>
        <LogisticsActionFeedback feedback={message} />
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-semibold uppercase text-slate-500">Manifest</p><h2 className="mt-1 text-xl font-bold text-slate-950">{detail.manifest.manifestNumber}</h2><p className="mt-2 text-sm leading-6 text-slate-600">Version {detail.manifest.versionNumber} for <Link className="font-semibold text-[var(--tenant-primary)] hover:underline" href={`/logistics/dispatch-runs/${detail.dispatchRun.id}`}>{detail.dispatchRun.runNumber}</Link>. Generated manifests keep the reviewed delivery and item details on record.</p></div>{detail.manifest.status === "draft" && detail.dispatchRun.status === "ready" && detail.canManage ? <form action={generateManifestAction}><input name="manifest_id" type="hidden" value={detail.manifest.id} /><input name="dispatch_run_id" type="hidden" value={detail.dispatchRun.id} /><button className="rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-90">Generate manifest</button></form> : null}</div></section>
        {generated ? <div className={`flex flex-col gap-3 rounded-md border px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${handoff.active ? "border-[color:var(--tenant-primary-border)] bg-[var(--tenant-primary-soft)]" : "border-slate-200 bg-slate-50"}`}><p className="text-sm leading-6 text-slate-700">{handoff.message}</p><PageActionButton href={`/logistics/dispatch-runs/${detail.dispatchRun.id}`} variant={handoff.active ? "primary" : "secondary"}>{handoff.label}</PageActionButton></div> : null}
        {detail.manifest.status === "draft" && detail.dispatchRun.status !== "ready" ? <div className="rounded-md border border-[color:var(--tenant-warning-border)] bg-[var(--tenant-warning-bg)] px-4 py-3 text-sm text-slate-700">Mark the linked dispatch run ready before generating this manifest.</div> : null}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"><StatCard label="Version" value={String(detail.manifest.versionNumber)} helperText="Correction versions are future work." badge="Version" tone="info" icon="VR" /><StatCard label="Deliveries" value={String(detail.manifest.deliveryCount)} helperText={generated ? "Immutable delivery snapshots." : "Created during generation."} badge="Stops" tone="neutral" icon="DL" /><StatCard label="Cartons" value={String(detail.manifest.cartonTotal)} helperText="Reviewed snapshot total." badge="Total" tone="neutral" icon="CT" /><StatCard label="Generated" value={detail.manifest.generatedAt} helperText={`By ${detail.manifest.generatedBy}.`} badge="History" tone={generated ? "success" : "warning"} icon="GN" /><StatCard label="Validation" value={detail.validation.status === "valid" ? "Passed" : detail.validation.status === "blocked" ? "Blocked" : "Pending"} helperText={detail.validation.checkedAt} badge="Server" tone={detail.validation.status === "valid" ? "success" : "warning"} icon="VA" /></section>
        <SectionCard title="Dispatch details" description="The linked run stays available while generated manifest details remain fixed for history."><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{[["Run", detail.dispatchRun.runNumber], ["Name", detail.dispatchRun.name], ["Type", detail.dispatchRun.dispatchType], ["Dispatch date", detail.dispatchRun.dispatchDate], ["Delivery date", detail.dispatchRun.deliveryDate], ["Created", detail.manifest.createdAt], ["Notes", detail.manifest.notes]].map(([label, value]) => <div className="rounded-md border border-slate-200 bg-slate-50 p-3" key={label}><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>)}</div></SectionCard>
        <SectionCard title={generated ? "Manifest deliveries" : "Manifest details pending"} description={generated ? "These reviewed address, carton and item details are read-only historical records." : "Delivery and item details are recorded when the manifest is generated."} action={<StatusBadge tone={generated ? "success" : "warning"}>{generated ? "Read only" : "Awaiting generation"}</StatusBadge>}>
          {detail.deliveries.length === 0 ? <EmptyState title={generated ? "No snapshot deliveries found" : "No snapshots yet"} description={generated ? "This generated manifest has no visible delivery snapshots and needs review." : "Generate the manifest after the linked dispatch run passes validation."} /> : <div className="space-y-4">{detail.deliveries.map((delivery) => <article className="rounded-lg border border-slate-200 bg-white p-4" key={delivery.id}><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-semibold uppercase text-slate-500">Stop {delivery.sequenceNumber}</p><h3 className="mt-1 font-bold text-slate-950">{delivery.recipientName}</h3><p className="mt-1 text-sm text-slate-600">{[delivery.companyName, delivery.address].filter(Boolean).join(" · ")}</p><p className="mt-1 text-xs text-slate-500">{delivery.deliveryDate} · {delivery.phone || "No phone"} · {delivery.email || "No email"}</p></div><div className="flex flex-wrap gap-2"><StatusBadge tone="neutral">{`${delivery.cartonCount} cartons`}</StatusBadge><StatusBadge tone="info">{`${delivery.totalWeightKg} kg`}</StatusBadge>{delivery.temperatureClass !== "Not set" ? <StatusBadge tone="neutral">{delivery.temperatureClass}</StatusBadge> : null}</div></div><div className="mt-4 overflow-x-auto rounded-md border border-slate-200"><table className="min-w-[650px] divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500"><tr><th className="px-3 py-2">Line</th><th className="px-3 py-2">Item</th><th className="px-3 py-2">Code</th><th className="px-3 py-2">Quantity</th><th className="px-3 py-2">Reference</th></tr></thead><tbody className="divide-y divide-slate-100">{delivery.lines.map((line) => <tr key={line.id}><td className="px-3 py-2 text-slate-600">{line.lineNumber}</td><td className="px-3 py-2 font-semibold text-slate-900">{line.itemName}</td><td className="px-3 py-2 text-slate-600">{line.itemCode || "-"}</td><td className="px-3 py-2 text-slate-600">{line.quantity} {line.unit}</td><td className="px-3 py-2 text-slate-600">{line.externalLineReference || "-"}</td></tr>)}</tbody></table></div></article>)}</div>}
        </SectionCard>
        <SectionCard title="Deferred integrations" description="This manifest is operational history, not evidence that external systems have run."><div className="grid gap-3 md:grid-cols-3">{["No carrier file or API handoff has been generated.", "No stock allocation, stock movement or QA hold check has occurred.", "No Shopify, CRM, order, production output or driver workflow is connected."].map((note) => <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600" key={note}>{note}</div>)}</div></SectionCard>
      </div>
    </AppShell>
  );
}
