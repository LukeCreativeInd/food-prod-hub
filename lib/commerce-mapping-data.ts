import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import {
  buildCommerceCatalogueMappingItems,
  classifyCommerceMappingQueryError,
  commerceMappingStatusMessage,
  filterCommerceMappingItems,
  summariseCommerceMappingReadiness,
} from "./commerce-mapping";
import type {
  CommerceCatalogueItemRow,
  CommerceMappingEventRow,
  CommerceMappingFilter,
  CommerceMappingInternalItem,
  CommerceMappingOutputRow,
  CommerceMappingRow,
  CommerceMappingSchemaStatus,
  CommerceConnectionRow,
} from "./commerce-mapping-types";

type QueryError = { code?: string | null; message?: string | null } | null;

function strongestSchemaStatus(errors: QueryError[]): CommerceMappingSchemaStatus {
  const statuses = errors.map(classifyCommerceMappingQueryError);
  if (statuses.includes("permission_denied")) {
    return "permission_denied";
  }
  if (statuses.includes("schema_missing")) {
    return "schema_missing";
  }
  if (statuses.includes("query_error")) {
    return "query_error";
  }
  return "ready";
}

function internalItemRows(
  rows: Array<{
    id: string;
    item_type: string;
    display_name: string;
    base_unit: string | null;
    status: string;
    archived_at: string | null;
  }>,
): CommerceMappingInternalItem[] {
  return rows
    .filter(
      (row): row is typeof row & {
        item_type: "finished_product" | "component";
        base_unit: string;
      } =>
        (row.item_type === "finished_product" || row.item_type === "component") &&
        Boolean(row.base_unit),
    )
    .map((row) => ({
      id: row.id,
      itemType: row.item_type,
      displayName: row.display_name,
      baseUnit: row.base_unit,
      status: row.status,
      archivedAt: row.archived_at,
    }));
}

export type CommerceMappingListParams = {
  connection?: string;
  status?: string;
  q?: string;
  catalogueItemId?: string;
};

export async function getCommerceMappingListData(
  params: CommerceMappingListParams = {},
) {
  const { authContext, permissionKeys } =
    await requirePermissionAccessWithPermissions("admin.integrations.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const supabase = await createClient();
  const [connectionsResult, catalogueResult, mappingsResult, outputsResult, itemsResult] =
    await Promise.all([
      supabase
        .from("commerce_connections")
        .select(
          "id,storefront_display_name,provider_domain,environment,business_status,discovery_status,mapping_readiness,bundle_readiness",
        )
        .eq("organisation_id", organisationId)
        .eq("provider_key", "shopify")
        .is("archived_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("commerce_external_catalogue_items")
        .select(
          "id,connection_id,provider_product_id,provider_variant_id,source_sku,source_product_title,source_variant_title,source_status,last_observed_at,archived_at",
        )
        .eq("organisation_id", organisationId)
        .order("source_product_title"),
      supabase
        .from("commerce_catalogue_mappings")
        .select(
          "id,connection_id,external_catalogue_item_id,provider_variant_id,mapping_kind,status,version_number,supersedes_mapping_id,safe_note,submitted_by_profile_id,submitted_at,approved_by_profile_id,approved_at,rejected_by_profile_id,rejected_at,rejection_reason_category,created_by_profile_id,updated_by_profile_id,created_at,updated_at,archived_at",
        )
        .eq("organisation_id", organisationId)
        .order("version_number", { ascending: false }),
      supabase
        .from("commerce_catalogue_mapping_outputs")
        .select(
          "id,mapping_id,internal_item_id,quantity_multiplier,output_uom,sequence,output_role,created_at",
        )
        .eq("organisation_id", organisationId)
        .order("sequence"),
      supabase
        .from("internal_items")
        .select("id,item_type,display_name,base_unit,status,archived_at")
        .eq("organisation_id", organisationId)
        .in("item_type", ["finished_product", "component"])
        .order("display_name"),
    ]);

  const connections = (connectionsResult.data ?? []) as CommerceConnectionRow[];
  const allCatalogueItems = (catalogueResult.data ?? []) as CommerceCatalogueItemRow[];
  const requestedCatalogueItem = params.catalogueItemId
    ? allCatalogueItems.find((item) => item.id === params.catalogueItemId)
    : null;
  let selectedConnectionId: string | null = connections[0]?.id ?? null;
  if (
    requestedCatalogueItem &&
    connections.some((connection) => connection.id === requestedCatalogueItem.connection_id)
  ) {
    selectedConnectionId = requestedCatalogueItem.connection_id;
  } else if (connections.some((connection) => connection.id === params.connection)) {
    selectedConnectionId = params.connection ?? null;
  }
  const schemaStatus = strongestSchemaStatus([
    connectionsResult.error,
    catalogueResult.error,
    mappingsResult.error,
    outputsResult.error,
    itemsResult.error,
  ]);

  if (schemaStatus !== "ready") {
    console.error("[commerce-mapping] list unavailable", {
      category: schemaStatus,
      queries: [
        ["commerce_connections", connectionsResult.error],
        ["commerce_external_catalogue_items", catalogueResult.error],
        ["commerce_catalogue_mappings", mappingsResult.error],
        ["commerce_catalogue_mapping_outputs", outputsResult.error],
        ["internal_items", itemsResult.error],
      ]
        .filter(([, error]) => error)
        .map(([query, error]) => ({ query, code: (error as QueryError)?.code ?? "unknown" })),
    });
  }

  const internalItems = internalItemRows(itemsResult.data ?? []);
  const catalogueItems = allCatalogueItems
    .filter((item) => !selectedConnectionId || item.connection_id === selectedConnectionId);
  const mappings = ((mappingsResult.data ?? []) as CommerceMappingRow[])
    .filter((mapping) => !selectedConnectionId || mapping.connection_id === selectedConnectionId);
  const mappingIds = new Set(mappings.map((mapping) => mapping.id));
  const outputs = ((outputsResult.data ?? []) as CommerceMappingOutputRow[])
    .filter((output) => mappingIds.has(output.mapping_id));
  const mappedItems = buildCommerceCatalogueMappingItems(
    catalogueItems,
    mappings,
    outputs,
    internalItems,
  );
  const allowedFilters: CommerceMappingFilter[] = [
    "all",
    "unresolved",
    "pending",
    "approved",
    "excluded",
    "error",
    "archived",
  ];
  const requestedFilter = allowedFilters.includes(params.status as CommerceMappingFilter)
    ? (params.status as CommerceMappingFilter)
    : "all";

  return {
    organisation: {
      id: organisationId,
      name: authContext.organisation.name,
      slug: authContext.organisation.slug,
    },
    canManage: permissionKeys.includes("admin.integrations.manage"),
    schemaStatus,
    schemaMessage: commerceMappingStatusMessage(schemaStatus),
    connections,
    selectedConnectionId,
    selectedConnection:
      connections.find((connection) => connection.id === selectedConnectionId) ?? null,
    internalItems,
    mappings,
    mappingOutputs: outputs,
    items: filterCommerceMappingItems(mappedItems, requestedFilter, params.q ?? ""),
    allItems: mappedItems,
    summary: summariseCommerceMappingReadiness(mappedItems),
    filter: requestedFilter,
    query: params.q?.trim() ?? "",
  };
}

export async function getCommerceMappingDetailData(catalogueItemId: string) {
  const listData = await getCommerceMappingListData({ catalogueItemId });

  if (listData.schemaStatus !== "ready") {
    return {
      ...listData,
      catalogueItem: null,
      mappingHistory: [],
      historyOutputs: [],
      events: [],
    };
  }

  const catalogueItem = listData.allItems.find((item) => item.id === catalogueItemId) ?? null;
  if (!catalogueItem) {
    return {
      ...listData,
      catalogueItem: null,
      mappingHistory: [],
      historyOutputs: [],
      events: [],
    };
  }

  const supabase = await createClient();
  const { data: eventRows, error: eventsError } = await supabase
      .from("commerce_catalogue_mapping_events")
      .select(
        "id,mapping_id,event_type,from_status,to_status,reason_category,safe_summary,actor_profile_id,created_at",
      )
      .eq("organisation_id", listData.organisation.id)
      .order("created_at", { ascending: false });

  if (eventsError) {
    throw new Error("Could not load mapping history.");
  }

  const mappingHistory = listData.mappings
    .filter((mapping) => mapping.external_catalogue_item_id === catalogueItemId)
    .sort((a, b) => b.version_number - a.version_number);
  const mappingIds = new Set(mappingHistory.map((mapping) => mapping.id));
  const historyOutputs = listData.mappingOutputs
    .filter((output) => mappingIds.has(output.mapping_id))
    .sort((a, b) => a.sequence - b.sequence);
  const events = ((eventRows ?? []) as CommerceMappingEventRow[])
    .filter((event) => mappingIds.has(event.mapping_id));

  return {
    ...listData,
    catalogueItem,
    mappingHistory,
    historyOutputs,
    events,
  };
}
