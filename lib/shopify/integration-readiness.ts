export type ShopifyReadinessStatus =
  | "ready"
  | "schema_missing"
  | "permission_denied"
  | "query_error";

export type ShopifyReadinessQueryError = {
  code?: string | null;
};

export type ShopifyReadinessQueryFailure = {
  query: string;
  error: ShopifyReadinessQueryError | null;
};

type CommerceConnectionRow = {
  id: string;
  storefront_display_name: string;
  provider_domain: string | null;
  environment: string;
  business_status: string;
  owner_authorisation_status: string;
  manufacturer_acceptance_status: string;
  installation_status: string;
  technical_health: string;
  facility_readiness: string;
  mapping_readiness: string;
  bundle_readiness: string;
  delivery_parser_readiness: string;
  delivery_calendar_readiness: string;
  discovery_status: string;
  backfill_status: string;
  reconciliation_status: string;
  demand_readiness: string;
  last_sync_attempted_at: string | null;
  last_sync_succeeded_at: string | null;
  unresolved_error_category: string | null;
};

type CatalogueItemRow = {
  connection_id: string;
};

export type ShopifyConnectionReadinessSummary = {
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

const schemaErrorCodes = new Set(["42P01", "42703", "PGRST200", "PGRST204", "PGRST205"]);
const permissionErrorCodes = new Set(["42501", "PGRST301"]);

export function classifyShopifyReadinessFailures(
  failures: ShopifyReadinessQueryFailure[],
): ShopifyReadinessStatus {
  const errors = failures.flatMap((failure) =>
    failure.error ? [failure.error] : [],
  );

  if (errors.length === 0) {
    return "ready";
  }

  if (errors.some((error) => permissionErrorCodes.has(error.code ?? ""))) {
    return "permission_denied";
  }

  if (errors.some((error) => schemaErrorCodes.has(error.code ?? ""))) {
    return "schema_missing";
  }

  return "query_error";
}

export function shopifyReadinessMessage(status: ShopifyReadinessStatus) {
  switch (status) {
    case "schema_missing":
      return "Shopify readiness data is unavailable because the required database schema is not ready.";
    case "permission_denied":
      return "Shopify readiness data is unavailable for this account. No connection state has been assumed.";
    case "query_error":
      return "Shopify readiness could not be loaded. No connection or synchronization state has been assumed.";
    case "ready":
    default:
      return null;
  }
}

export function buildShopifyConnectionSummaries(
  connectionRows: CommerceConnectionRow[],
  catalogueRows: CatalogueItemRow[],
): ShopifyConnectionReadinessSummary[] {
  const catalogueCounts = new Map<string, number>();

  for (const item of catalogueRows) {
    catalogueCounts.set(
      item.connection_id,
      (catalogueCounts.get(item.connection_id) ?? 0) + 1,
    );
  }

  return connectionRows.map((connection) => ({
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
}
