import { AppShell } from "@/components/app-shell";
import { DispatchRunForm } from "@/components/logistics/dispatch-run-form";
import { PageActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { fetchDispatchRunCreateOptions } from "@/lib/logistics-data";

export default async function NewDispatchRunPage() {
  const options = await fetchDispatchRunCreateOptions();
  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3"><PageActionButton href="/logistics/dispatch-runs" variant="secondary">Back to dispatch runs</PageActionButton><StatusBadge tone="warning">Draft workflow</StatusBadge></div>
        <SectionCard title="Dispatch run setup" description="The server assigns the tenant-safe DR-YYYYMMDD-0001 run number atomically. No browser-generated sequence is used.">
          <DispatchRunForm mode="create" options={options} />
        </SectionCard>
        <SectionCard title="Current boundary" description="This creates a planning record only.">
          <div className="grid gap-3 md:grid-cols-3">
            {["Delivery and item snapshots are entered manually after creation.", "No order import, stock allocation, QA blocking or production linkage runs here.", "Carrier and service selection is optional until tenant carrier configuration exists."].map((note) => <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600" key={note}>{note}</div>)}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
