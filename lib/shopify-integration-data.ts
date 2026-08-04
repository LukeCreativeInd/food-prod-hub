import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { isShopifyRuntimeConfigured } from "./shopify/config";

export type ShopifyConnectionSummary = {
  id: string;
  storefrontDisplayName: string;
  shopDomain: string | null;
  environment: string;
  businessStatus: string;
  ownerAuthorisationStatus: string;
  manufacturerAcceptanceStatus: string;
  installationStatus: string;
  technicalHealth: string;
  facilityReadiness: string;
  mappingReadiness: string;
  bundleReadiness: string;
  deliveryParserReadiness: string;
  deliveryCalendarReadiness: string;
  discoveryStatus: string;
  backfillStatus: string;
  reconciliationStatus: string;
  demandReadiness: string;
  lastSyncAttemptedAt: string | null;
  lastSyncSucceededAt: string | null;
  safeErrorCategory: string | null;
  catalogueItemCount: number;
};

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
        .select("id,facility_name,facility_code")
        .eq("organisation_id", organisationId)
        .eq("status", "active")
        .is("archived_at", null)
        .order("facility_name"),
      supabase
        .from("commerce_sync_runs")
        .select("id,connection_id,run_type,status,created_at,completed_at,safe_error_category")
        .eq("organisation_id", organisationId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const connectorSchemaUnavailable =
    catalogueResult.error?.code === "42P01" ||
    catalogueResult.error?.code === "PGRST205";

  for (const result of [connectionsResult, facilitiesResult, syncRunsResult]) {
    if (result.error) {
      console.error("Shopify integration data query failed", {
        message: result.error.message,
      });
      throw new Error("Could not load Shopify integration readiness.");
    }
  }

  if (catalogueResult.error && !connectorSchemaUnavailable) {
    console.error("Shopify catalogue readiness query failed", {
      message: catalogueResult.error.message,
    });
    throw new Error("Could not load Shopify integration readiness.");
  }

  const catalogueCounts = new Map<string, number>();
  for (const item of catalogueResult.data ?? []) {
    catalogueCounts.set(
      item.connection_id,
      (catalogueCounts.get(item.connection_id) ?? 0) + 1,
    );
  }

  const connections: ShopifyConnectionSummary[] = (
    connectionsResult.data ?? []
  ).map((connection) => ({
    id: connection.id,
    storefrontDisplayName: connection.storefront_display_name,
    shopDomain: connection.provider_domain,
    environment: connection.environment,
    businessStatus: connection.business_status,
    ownerAuthorisationStatus: connection.owner_authorisation_status,
    manufacturerAcceptanceStatus: connection.manufacturer_acceptance_status,
    installationStatus: connection.installation_status,
    technicalHealth: connection.technical_health,
    facilityReadiness: connection.facility_readiness,
    mappingReadiness: connection.mapping_readiness,
    bundleReadiness: connection.bundle_readiness,
    deliveryParserReadiness: connection.delivery_parser_readiness,
    deliveryCalendarReadiness: connection.delivery_calendar_readiness,
    discoveryStatus: connection.discovery_status,
    backfillStatus: connection.backfill_status,
    reconciliationStatus: connection.reconciliation_status,
    demandReadiness: connection.demand_readiness,
    lastSyncAttemptedAt: connection.last_sync_attempted_at,
    lastSyncSucceededAt: connection.last_sync_succeeded_at,
    safeErrorCategory: connection.unresolved_error_category,
    catalogueItemCount: catalogueCounts.get(connection.id) ?? 0,
  }));

  return {
    organisation: {
      id: organisationId,
      name: authContext.organisation.name,
      slug: authContext.organisation.slug,
    },
    connections,
    facilities: facilitiesResult.data ?? [],
    syncRuns: syncRunsResult.data ?? [],
    canManage: permissionKeys.includes("admin.integrations.manage"),
    runtimeConfigured: isShopifyRuntimeConfigured(),
    connectorSchemaReady: !connectorSchemaUnavailable,
  };
}
