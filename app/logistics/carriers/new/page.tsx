import { AppShell } from "@/components/app-shell";
import { CarrierForm } from "@/components/logistics/carrier-form";
import { PageActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { requirePermissionAccess } from "@/lib/auth";

export default async function NewCarrierPage() {
  await requirePermissionAccess("logistics_configuration.manage");
  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3"><PageActionButton href="/logistics/carriers" variant="secondary">Back to carriers</PageActionButton><StatusBadge tone="info">Configuration</StatusBadge></div>
        <SectionCard title="Carrier setup" description="Create a tenant-owned carrier identity. Provider credentials and integrations are not stored here.">
          <CarrierForm />
        </SectionCard>
      </div>
    </AppShell>
  );
}
