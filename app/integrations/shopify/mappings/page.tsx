import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import {
  EmptyState,
  PageActionButton,
  SectionCard,
  StatusBadge,
} from "@/components/ui";
import { mappingLabel } from "@/lib/commerce-mapping";
import { getCommerceMappingListData } from "@/lib/commerce-mapping-data";
import type { CommerceMappingResolvedState } from "@/lib/commerce-mapping-types";

type PageProps = {
  searchParams: Promise<{
    connection?: string;
    status?: string;
    q?: string;
  }>;
};

const filters = [
  "all",
  "unresolved",
  "pending",
  "approved",
  "excluded",
  "error",
  "archived",
] as const;

function stateTone(state: CommerceMappingResolvedState) {
  switch (state) {
    case "approved":
    case "excluded":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "error":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

export default async function CommerceMappingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const data = await getCommerceMappingListData(params);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/integrations" className="font-semibold text-[var(--tenant-primary)]">
            Back to Integrations
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">Shopify product mappings</span>
        </div>

        {data.schemaStatus !== "ready" ? (
          <SectionCard
            title="Mapping foundation unavailable"
            description="The workspace stays read-only and does not infer mapping state when its database contract is unavailable."
          >
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              {data.schemaMessage}
            </div>
          </SectionCard>
        ) : data.connections.length === 0 ? (
          <SectionCard
            title="Shopify product mappings"
            description="Review connection-scoped provider variants before they may contribute to later Production Demand."
          >
            <EmptyState
              title="No Shopify connection"
              description="Product mapping becomes available after a reviewed Shopify connection exists and catalogue discovery records provider product and variant identities. No connection or mapping is fabricated here."
              action={
                <PageActionButton href="/integrations" variant="secondary">
                  Review Integrations
                </PageActionButton>
              }
            />
          </SectionCard>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Active variants", data.summary.activeCount],
                ["Approved", data.summary.approvedCount],
                ["Explicitly excluded", data.summary.excludedCount],
                ["Unresolved / blocked", data.summary.unresolvedCount + data.summary.errorCount],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
                </div>
              ))}
            </div>

            <SectionCard
              title="Mapping readiness"
              description="Ready requires every active discovered variant to have an approved mapping or approved exclusion. An empty catalogue is never reported as ready."
              action={
                <StatusBadge
                  tone={
                    data.summary.readiness === "ready"
                      ? "success"
                      : data.summary.readiness === "blocked"
                        ? "danger"
                        : "warning"
                  }
                >
                  {mappingLabel(data.summary.readiness)}
                </StatusBadge>
              }
            >
              <form className="grid gap-3 md:grid-cols-[minmax(12rem,0.8fr)_minmax(14rem,1.5fr)_minmax(10rem,0.7fr)_auto]">
                <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                  <span>Connection</span>
                  <select
                    name="connection"
                    defaultValue={data.selectedConnectionId ?? ""}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
                  >
                    {data.connections.map((connection) => (
                      <option key={connection.id} value={connection.id}>
                        {connection.storefront_display_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                  <span>Search source identity</span>
                  <input
                    type="search"
                    name="q"
                    defaultValue={data.query}
                    placeholder="Product, variant, SKU or provider ID"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
                  />
                </label>
                <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                  <span>Status</span>
                  <select
                    name="status"
                    defaultValue={data.filter}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
                  >
                    {filters.map((filter) => (
                      <option key={filter} value={filter}>
                        {mappingLabel(filter)}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="self-end rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-90"
                >
                  Apply filters
                </button>
              </form>
            </SectionCard>

            <SectionCard
              title="Discovered variants"
              description="Provider variant ID is the mapping identity. Source title and SKU are review evidence only."
            >
              {data.allItems.length === 0 ? (
                <EmptyState
                  title="No catalogue discovered"
                  description="This connection has no external catalogue records. Discovery readiness and mapping readiness remain separate, and mapping is not reported as complete."
                />
              ) : data.items.length === 0 ? (
                <EmptyState
                  title="No variants match"
                  description="Adjust the search or status filter without changing any mapping decisions."
                />
              ) : (
                <div className="space-y-3">
                  {data.items.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-950">
                              {item.source_product_title}
                            </h3>
                            <StatusBadge tone={stateTone(item.resolvedState)}>
                              {mappingLabel(item.resolvedState)}
                            </StatusBadge>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {item.source_variant_title ?? "Default variant"}
                            {item.source_sku ? ` · SKU ${item.source_sku}` : " · No source SKU"}
                          </p>
                          <p className="mt-2 break-all text-xs text-slate-500">
                            Variant ID: {item.provider_variant_id}
                          </p>
                          {item.currentMapping ? (
                            <p className="mt-2 text-sm text-slate-600">
                              {mappingLabel(item.currentMapping.mapping_kind)} mapping · version {item.currentMapping.version_number} · {item.currentOutputs.length} output(s)
                            </p>
                          ) : null}
                        </div>
                        <Link
                          href={`/integrations/shopify/mappings/${item.id}`}
                          className="inline-flex shrink-0 items-center justify-center rounded-md border border-[color:var(--tenant-primary-border)] bg-white px-3.5 py-2 text-sm font-semibold text-[var(--tenant-primary)] hover:bg-[var(--tenant-primary-soft)]"
                        >
                          Review mapping
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </SectionCard>
          </>
        )}
      </div>
    </AppShell>
  );
}
