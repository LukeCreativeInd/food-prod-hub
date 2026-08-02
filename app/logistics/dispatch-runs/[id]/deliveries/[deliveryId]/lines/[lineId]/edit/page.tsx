import { notFound, redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { DispatchLineForm } from "@/components/logistics/dispatch-line-form";
import { PageActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { getDispatchActionMessage } from "@/lib/logistics-action-messages";
import { fetchDispatchRunDetail } from "@/lib/logistics-data";

type PageProps = {
  params: Promise<{ id: string; deliveryId: string; lineId: string }>;
  searchParams: Promise<{ dispatch?: string }>;
};

export default async function EditDispatchLinePage({ params, searchParams }: PageProps) {
  const [{ id, deliveryId, lineId }, query] = await Promise.all([params, searchParams]);
  const detail = await fetchDispatchRunDetail(id);
  if (!detail) notFound();
  if (!detail.canEditDraft) redirect(`/logistics/dispatch-runs/${id}?dispatch=dispatch_run_locked`);
  const delivery = detail.deliveries.find((item) => item.id === deliveryId);
  const line = delivery?.lines.find((item) => item.id === lineId);
  if (!delivery || !line) notFound();
  const message = getDispatchActionMessage(query.dispatch);
  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3"><PageActionButton href={`/logistics/dispatch-runs/${id}`} variant="secondary">Back to dispatch run</PageActionButton><StatusBadge tone="warning">Draft item line</StatusBadge></div>
        {message ? <div className="rounded-md border border-[color:var(--tenant-warning-border)] bg-[var(--tenant-warning-bg)] px-4 py-3 text-sm font-semibold text-slate-700">{message}</div> : null}
        <SectionCard title="Edit item snapshot" description={`Delivery: ${delivery.recipientName}. Snapshot changes do not edit Products or allocate Inventory.`}>
          <DispatchLineForm deliveryId={deliveryId} items={detail.formOptions.items} line={line} mode="edit" runId={id} />
        </SectionCard>
      </div>
    </AppShell>
  );
}
