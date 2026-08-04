import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionCard, StatusBadge } from "@/components/ui";
import { resolveAppModeFromHeaders } from "@/lib/app-mode-routing";
import { getShopifyIntegrationPageData } from "@/lib/shopify-integration-data";

export const dynamic = "force-dynamic";

function setupStatus(
  data: Awaited<ReturnType<typeof getShopifyIntegrationPageData>>,
) {
  if (data.readinessStatus !== "ready") {
    return "Readiness unavailable";
  }

  return data.connections.length === 0 ? "Not connected" : "Connection recorded";
}

export default async function ShopifyMerchantEntryPage() {
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

  const data = await getShopifyIntegrationPageData();

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <SectionCard
          title="Shopify setup"
          description="Read-only tenant setup status for the EveryBatch Shopify connector."
          action={
            <StatusBadge
              tone={
                data.readinessStatus === "ready" && data.connections.length > 0
                  ? "info"
                  : "warning"
              }
            >
              {setupStatus(data)}
            </StatusBadge>
          }
        >
          {data.readinessStatus !== "ready" ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <p className="font-semibold">Shopify readiness is temporarily unavailable</p>
              <p className="mt-1">{data.readinessMessage}</p>
            </div>
          ) : data.connections.length === 0 ? (
            <EmptyState
              title="No Shopify store connected"
              description="No Shopify installation or storefront connection is recorded for this workspace. App configuration and an approved installation are still required."
            />
          ) : (
            <div className="space-y-3">
              <p className="text-sm leading-6 text-slate-600">
                {data.connections.length} tenant-scoped Shopify connection record
                {data.connections.length === 1 ? " is" : "s are"} available. Detailed readiness remains in Admin Integrations.
              </p>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Setup boundary"
          description="Viewing this page does not install Shopify, create records or start synchronization."
        >
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>
              Embedded Shopify requests continue to require verified Shopify identity through the dedicated session endpoint. Ordinary tenant administrators do not need a Shopify session token to view this setup status.
            </p>
            <p>
              Access tokens, credentials, raw webhook payloads and customer information are never displayed here.
            </p>
            <Link
              className="inline-flex font-semibold text-[var(--tenant-primary)] hover:underline"
              href="/integrations"
            >
              View Admin Integrations
            </Link>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
