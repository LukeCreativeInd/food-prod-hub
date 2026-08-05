import { AppShell } from "@/components/app-shell";
import { EmptyState, PageActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { getShopifyIntegrationPageData } from "@/lib/shopify-integration-data";

const futureIntegrations = [
  ["Xero", "Accounting", "Future"],
  ["Detrack", "Logistics", "Future"],
  ["Klaviyo", "Marketing", "Future"],
  ["CSV / file imports", "Tools", "Planned"],
  ["Barcode and label printing", "Operations", "Future"],
  ["Email notifications", "Notifications", "Future"],
  ["EveryBatch API", "Platform API", "Future"],
] as const;

export default async function IntegrationsPage() {
  const data = await getShopifyIntegrationPageData();
  const connectedCount = data.connections.length;

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <SectionCard
          title="Connected integrations"
          description="Installed or configured provider connections for this tenant."
        >
          {data.readinessStatus !== "ready" ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <p className="font-semibold">Shopify readiness is temporarily unavailable</p>
              <p className="mt-1">{data.readinessMessage}</p>
            </div>
          ) : connectedCount === 0 ? (
            <EmptyState
              title="No connected systems"
              description="No provider connection is installed or configured for this tenant."
            />
          ) : (
            <div className="space-y-3">
              {data.connections.map((connection) => (
                <article
                  key={connection.id}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-950">{connection.storefrontDisplayName}</p>
                    <p className="mt-1 text-sm text-slate-500">Shopify storefront connection</p>
                  </div>
                  <PageActionButton href="/shopify" prefetch={false} variant="secondary">Manage</PageActionButton>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Available integrations" description="Provider setup begins in its own workspace.">
          <article className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">Shopify</p>
                <StatusBadge tone={connectedCount > 0 ? "info" : "warning"}>
                  {connectedCount > 0 ? `${connectedCount} connection${connectedCount === 1 ? "" : "s"}` : "Not connected"}
                </StatusBadge>
              </div>
              <p className="mt-1 text-sm text-slate-500">Commerce orders, product mappings and reviewed delivery-date configuration.</p>
            </div>
            <PageActionButton href="/shopify" prefetch={false} variant="secondary">
              {connectedCount > 0 ? "Manage" : "Configure"}
            </PageActionButton>
          </article>
        </SectionCard>

        <SectionCard
          title="Coming soon"
          description="Future providers keep their own operational ownership."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {futureIntegrations.map(([name, owner, status]) => (
              <article key={name} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">{name}</h3>
                    <p className="mt-1 text-sm text-slate-500">Owned by {owner}</p>
                  </div>
                  <StatusBadge tone="neutral">{status}</StatusBadge>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
