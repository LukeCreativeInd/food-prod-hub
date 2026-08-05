import { AppShell } from "@/components/app-shell";
import {
  EmptyState,
  PageActionButton,
  SectionCard,
  StatusBadge,
} from "@/components/ui";
import { getShopifyIntegrationPageData } from "@/lib/shopify-integration-data";

import { acceptShopifyManufacturingConnectionAction } from "./actions";
import { ShopifyInstallIntentForm } from "./shopify-install-intent-form";

const futureIntegrations = [
  ["Xero", "Accounting", "Future"],
  ["Detrack", "Logistics", "Future"],
  ["Klaviyo", "Marketing", "Future"],
  ["CSV / file imports", "Tools", "Planned"],
  ["Barcode and label printing", "Operations", "Future"],
  ["Email notifications", "Notifications", "Future"],
  ["EveryBatch API", "Platform API", "Future"],
] as const;

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function connectionTone(status: string) {
  if (status === "active" || status === "healthy" || status === "accepted") {
    return "success" as const;
  }
  if (status === "revoked" || status === "error" || status === "uninstalled") {
    return "danger" as const;
  }
  if (status.includes("pending") || status === "degraded") {
    return "warning" as const;
  }
  return "neutral" as const;
}

function readinessBadge(data: Awaited<ReturnType<typeof getShopifyIntegrationPageData>>) {
  if (data.readinessStatus === "schema_missing") {
    return "Schema unavailable";
  }
  if (data.readinessStatus === "permission_denied") {
    return "Access unavailable";
  }
  if (data.readinessStatus === "query_error") {
    return "Readiness unavailable";
  }
  if (data.runtimeConfigured) {
    return "Runtime configured";
  }
  return "External setup required";
}

type PageProps = {
  searchParams: Promise<{ shopify?: string }>;
};

export default async function IntegrationsPage({ searchParams }: PageProps) {
  const [{ shopify }, data] = await Promise.all([
    searchParams,
    getShopifyIntegrationPageData(),
  ]);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        {shopify ? (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              shopify === "accepted"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {shopify === "accepted"
              ? "Manufacturing intake accepted for this Shopify connection. Mapping and delivery readiness remain separate."
              : "The Shopify connection action could not be completed. Review the connection readiness and try again."}
          </div>
        ) : null}

        <SectionCard
          title="Shopify"
          description="One provider, with separate tenant-scoped storefront connections and source attribution."
          action={
            <StatusBadge tone={data.readinessStatus === "ready" && data.runtimeConfigured ? "info" : "warning"}>
              {readinessBadge(data)}
            </StatusBadge>
          }
        >
          {data.readinessStatus !== "ready" ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <p className="font-semibold">Shopify readiness is temporarily unavailable</p>
              <p className="mt-1">{data.readinessMessage}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Organisation</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">{data.organisation.name}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Connections</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">{data.connections.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Discovered variants</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {data.connections.reduce((total, connection) => total + connection.catalogueItemCount, 0)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Demand readiness</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">Blocked until mapping and date rules</p>
            </div>
              </div>

              {data.connections.length === 0 ? (
                <div className="mt-5">
                  <EmptyState
                    title="No Shopify connection"
                    description="No storefront is connected. App registration and the server environment must be reviewed before a development-store installation can be claimed."
                  />
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {data.connections.map((connection) => (
                <article key={connection.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-950">{connection.storefrontDisplayName}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {connection.shopDomain ?? "Verified domain pending"} · {label(connection.environment)}
                      </p>
                    </div>
                    <StatusBadge tone={connectionTone(connection.businessStatus)}>
                      {label(connection.businessStatus)}
                    </StatusBadge>
                  </div>

                  <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      ["Owner authority", connection.ownerAuthorisationStatus],
                      ["Manufacturer", connection.manufacturerAcceptanceStatus],
                      ["Technical health", connection.technicalHealth],
                      ["Installation", connection.installationStatus],
                      ["Facility", connection.facilityReadiness],
                      ["Discovery", connection.discoveryStatus],
                      ["Mapping", connection.mappingReadiness],
                      ["Bundle rules", connection.bundleReadiness],
                      ["Delivery parser", connection.deliveryParserReadiness],
                      ["Delivery calendar", connection.deliveryCalendarReadiness],
                      ["Backfill", connection.backfillStatus],
                      ["Reconciliation", connection.reconciliationStatus],
                    ].map(([term, value]) => (
                      <div key={term} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                        <dt className="text-xs font-semibold uppercase text-slate-500">{term}</dt>
                        <dd className="mt-1 text-sm font-semibold text-slate-800">{label(value)}</dd>
                      </div>
                    ))}
                  </dl>

                  {connection.safeErrorCategory ? (
                    <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      Safe diagnostic: {label(connection.safeErrorCategory)}
                    </p>
                  ) : null}

                  {data.canManage &&
                  connection.ownerAuthorisationStatus === "authorised" &&
                  connection.manufacturerAcceptanceStatus === "pending" ? (
                    <form action={acceptShopifyManufacturingConnectionAction} className="mt-4 flex flex-wrap items-end gap-3">
                      <input type="hidden" name="connection_id" value={connection.id} />
                      <label className="min-w-56 flex-1 space-y-1.5 text-sm font-semibold text-slate-700">
                        <span>Target facility</span>
                        <select name="facility_id" defaultValue="" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                          <option value="">Keep current / resolve later</option>
                          {data.facilities.map((facility) => (
                            <option key={facility.id} value={facility.id}>
                              {facility.name} ({facility.code})
                            </option>
                          ))}
                        </select>
                      </label>
                      <button type="submit" className="rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white">
                        Accept manufacturing intake
                      </button>
                    </form>
                  ) : null}
                </article>
                  ))}
                </div>
              )}
            </>
          )}
        </SectionCard>

        <SectionCard
          title="Product mappings"
          description="Review connection-scoped Shopify variants, bundle outputs and explicit exclusions before later Production Demand interpretation."
          action={
            data.readinessStatus === "ready" ? (
              <PageActionButton
                href="/integrations/shopify/mappings"
                variant="secondary"
              >
                Open mappings
              </PageActionButton>
            ) : undefined
          }
        >
          {data.readinessStatus !== "ready" ? (
            <EmptyState
              title="Mapping readiness unavailable"
              description="The Integrations readiness query did not complete, so no catalogue or mapping state is being assumed."
            />
          ) : data.connections.length === 0 ? (
            <EmptyState
              title="No connection to map"
              description="The mapping workspace is available, but product decisions begin only after a reviewed Shopify connection and catalogue discovery exist."
              action={
                <PageActionButton
                  href="/integrations/shopify/mappings"
                  variant="secondary"
                >
                  View empty workspace
                </PageActionButton>
              }
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {data.connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {connection.storefrontDisplayName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {connection.catalogueItemCount} discovered variant(s) · {label(connection.mappingReadiness)}
                    </p>
                  </div>
                  <PageActionButton
                    href={`/integrations/shopify/mappings?connection=${connection.id}`}
                    variant="secondary"
                  >
                    Review mappings
                  </PageActionButton>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {data.canManage && data.readinessStatus === "ready" ? (
          <SectionCard
            title="Development-store installation claim"
            description="Prepare a short-lived claim only after Migration 047 and Shopify development app configuration are reviewed."
          >
            <ShopifyInstallIntentForm
              facilities={data.facilities}
              runtimeConfigured={data.runtimeConfigured && data.connectorSchemaReady}
            />
          </SectionCard>
        ) : null}

        <SectionCard
          title="Integration catalogue"
          description="Future providers keep their own operational ownership; they are not forced into Commerce tables."
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

        <SectionCard
          title="Recent synchronization evidence"
          description="Redacted Commerce run status only. Tokens, raw webhook bodies and customer PII are never shown here."
        >
          {data.readinessStatus !== "ready" ? (
            <EmptyState
              title="Synchronization evidence unavailable"
              description="The readiness query did not complete, so no synchronization state is being assumed."
            />
          ) : data.syncRuns.length === 0 ? (
            <EmptyState title="No synchronization runs" description="No backfill, discovery or reconciliation run has been requested." />
          ) : (
            <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
              {data.syncRuns.map((run) => (
                <div key={run.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{label(run.run_type)}</p>
                    <p className="text-xs text-slate-500">{new Date(run.created_at).toLocaleString("en-AU")}</p>
                  </div>
                  <StatusBadge tone={connectionTone(run.status)}>{label(run.status)}</StatusBadge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
