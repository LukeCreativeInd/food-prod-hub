import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { isShopifyRuntimeConfigured } from "./shopify/config";
import {
  buildShopifyConnectionSummaries,
  classifyShopifyReadinessFailures,
  shopifyReadinessMessage,
  type ShopifyConnectionReadinessSummary,
} from "./shopify/integration-readiness";

export type ShopifyConnectionSummary = ShopifyConnectionReadinessSummary;

export async function getShopifyIntegrationPageData() {
  const { authContext, permissionKeys } =
    await requirePermissionAccessWithPermissions("admin.integrations.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const supabase = await createClient();
  const [connectionsResult, catalogueResult, facilitiesResult, syncRunsResult] =
    await Promise.all([
      supabase
        .from("commerce_connections")
        .select(
          "id,storefront_display_name,provider_domain,environment,business_status,owner_authorisation_status,manufacturer_acceptance_status,installation_status,technical_health,facility_readiness,mapping_readiness,bundle_readiness,delivery_parser_readiness,delivery_calendar_readiness,discovery_status,backfill_status,reconciliation_status,demand_readiness,last_sync_attempted_at,last_sync_succeeded_at,unresolved_error_category",
        )
        .eq("organisation_id", organisationId)
        .eq("provider_key", "shopify")
        .is("archived_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("commerce_external_catalogue_items")
        .select("connection_id")
        .eq("organisation_id", organisationId)
        .is("archived_at", null),
      supabase
        .from("facilities")
        .select("id,name,code")
        .eq("organisation_id", organisationId)
        .eq("status", "active")
        .is("archived_at", null)
        .order("name"),
      supabase
        .from("commerce_sync_runs")
        .select("id,connection_id,run_type,status,created_at,completed_at,safe_error_category")
        .eq("organisation_id", organisationId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const queryFailures = [
    { query: "commerce_connections", error: connectionsResult.error },
    { query: "commerce_external_catalogue_items", error: catalogueResult.error },
    { query: "facilities", error: facilitiesResult.error },
    { query: "commerce_sync_runs", error: syncRunsResult.error },
  ];
  const readinessStatus = classifyShopifyReadinessFailures(queryFailures);

  if (readinessStatus !== "ready") {
    console.error("[shopify] integration readiness unavailable", {
      category: readinessStatus,
      queries: queryFailures
        .filter((failure) => failure.error)
        .map((failure) => ({
          query: failure.query,
          code: failure.error?.code ?? "unknown",
        })),
    });
  }

  const connections: ShopifyConnectionSummary[] =
    readinessStatus === "ready"
      ? buildShopifyConnectionSummaries(
          connectionsResult.data ?? [],
          catalogueResult.data ?? [],
        )
      : [];

  return {
    organisation: {
      id: organisationId,
      name: authContext.organisation.name,
      slug: authContext.organisation.slug,
    },
    connections,
    facilities: readinessStatus === "ready" ? facilitiesResult.data ?? [] : [],
    syncRuns: readinessStatus === "ready" ? syncRunsResult.data ?? [] : [],
    canManage: permissionKeys.includes("admin.integrations.manage"),
    runtimeConfigured: isShopifyRuntimeConfigured(),
    connectorSchemaReady: readinessStatus !== "schema_missing",
    readinessStatus,
    readinessMessage: shopifyReadinessMessage(readinessStatus),
  };
}
