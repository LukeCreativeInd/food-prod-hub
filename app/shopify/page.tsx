import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { DeliveryFoundationState } from "@/components/shopify/delivery-config-ui";
import { ShopifyWorkspaceNav } from "@/components/shopify/shopify-workspace-nav";
import { EmptyState, PageActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { resolveAppModeFromHeaders } from "@/lib/app-mode-routing";
import { getDeliveryConfigurationData } from "@/lib/delivery-configuration-data";
import { getShopifyIntegrationPageData } from "@/lib/shopify-integration-data";

export const dynamic = "force-dynamic";

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function ShopifyWorkspacePage() {
  const requestHeaders = await headers();
  const mode = resolveAppModeFromHeaders(requestHeaders);

  if (mode.mode === "central_app") {
    redirect("/select-workspace?next=%2Fshopify");
  }
  if (mode.mode === "platform_admin") {
    redirect("/platform");
  }
  if (mode.mode === "support") {
    redirect("/");
  }
  if (mode.mode !== "tenant_app" && mode.mode !== "local_dev") {
    redirect("/login");
  }

  const [shopify, delivery] = await Promise.all([
    getShopifyIntegrationPageData(),
    getDeliveryConfigurationData(),
  ]);
  const discoveredCount = shopify.connections.reduce(
    (total, connection) => total + connection.catalogueItemCount,
    0,
  );

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <ShopifyWorkspaceNav />

        <SectionCard
          title="Shopify workspace"
          description="Tenant-owned setup, product mapping and reviewed delivery-date readiness for one Shopify provider."
          action={
            <StatusBadge tone={shopify.connections.length > 0 ? "info" : "warning"}>
              {shopify.connections.length > 0 ? "Connection recorded" : "Not connected"}
            </StatusBadge>
          }
        >
          {shopify.readinessStatus !== "ready" ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <p className="font-semibold">Shopify readiness is temporarily unavailable</p>
              <p className="mt-1">{shopify.readinessMessage}</p>
            </div>
          ) : shopify.connections.length === 0 ? (
            <EmptyState
              title="No Shopify store connected"
              description="No installation or storefront connection is recorded. Viewing this workspace does not create a connection, start discovery or claim that setup is complete."
            />
          ) : (
            <div className="space-y-3">
              {shopify.connections.map((connection) => (
                <article key={connection.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{connection.storefrontDisplayName}</p>
                      <p className="mt-1 text-sm text-slate-500">{connection.shopDomain ?? "Verified domain pending"}</p>
                    </div>
                    <StatusBadge tone="neutral">{label(connection.businessStatus)}</StatusBadge>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Storefront connections", shopify.connections.length],
            ["Discovered variants", discoveredCount],
            ["Delivery zones", delivery.zones.length],
            ["Published calendars", delivery.versions.filter((version) => version.status === "published").length],
          ].map(([term, value]) => (
            <div key={term} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">{term}</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        <SectionCard
          title="Delivery and production-date readiness"
          description="Parser and calendar readiness remain separate from product mapping, backfill, reconciliation and later Production Demand."
        >
          <DeliveryFoundationState status={delivery.status} message={delivery.statusMessage} />
          {delivery.status === "ready" ? (
            shopify.connections.length === 0 ? (
              <EmptyState
                title="Connection prerequisite not met"
                description="Zones and shared calendar drafts may be prepared, but parser readiness and order interpretation require a reviewed Shopify connection."
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {shopify.connections.map((connection) => (
                  <article key={connection.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-950">{connection.storefrontDisplayName}</p>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Mapping</dt><dd className="font-semibold">{label(connection.mappingReadiness)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Delivery parser</dt><dd className="font-semibold">{label(connection.deliveryParserReadiness)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Delivery calendar</dt><dd className="font-semibold">{label(connection.deliveryCalendarReadiness)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Demand</dt><dd className="font-semibold">{label(connection.demandReadiness)}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            )
          ) : null}
        </SectionCard>

        <SectionCard
          title="Configuration workspaces"
          description="Published history is immutable. Missing or ambiguous reviewed rules remain blocked."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["Product mappings", "Review discovered variants and bundle outputs.", "/integrations/shopify/mappings"],
              ["Delivery zones", "Manage tenant operational groupings without postcode or address storage.", "/shopify/delivery-zones"],
              ["Delivery services", "Manage customer-facing services separately from Logistics carriers.", "/shopify/delivery-services"],
              ["Delivery calendars", "Create effective-dated reviewed production-date rule versions.", "/shopify/delivery-calendars"],
              ["Parser profiles", "Map exact connection-specific Zapiet metadata keys.", "/shopify/delivery-parser"],
              ["Exceptions & overrides", "Review exact-date exceptions and append-only order decisions.", "/shopify/delivery-exceptions"],
            ].map(([title, description, href]) => (
              <article key={href} className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
                <div>
                  <p className="font-semibold text-slate-950">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                </div>
                <PageActionButton href={href} variant="secondary">Open</PageActionButton>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Safety boundary" description="Zapiet remains the customer-facing calendar.">
          <p className="text-sm leading-6 text-slate-600">
            This workspace does not install Shopify, expose credentials or raw payloads, store customer addresses or postcodes, shift public holidays automatically, or create Production Demand.
          </p>
        </SectionCard>
      </div>
    </AppShell>
  );
}
