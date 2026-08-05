import type {
  CommerceCatalogueItemRow,
  CommerceCatalogueMappingItem,
  CommerceMappingFilter,
  CommerceMappingInternalItem,
  CommerceMappingOutputRow,
  CommerceMappingReadinessSummary,
  CommerceMappingRow,
  CommerceMappingSchemaStatus,
} from "./commerce-mapping-types";

const currentStatusPriority: Record<CommerceMappingRow["status"], number> = {
  approved: 6,
  pending_review: 5,
  draft: 4,
  rejected: 3,
  superseded: 2,
  archived: 1,
};

export function mappingLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function classifyCommerceMappingQueryError(error: {
  code?: string | null;
} | null): CommerceMappingSchemaStatus {
  if (!error) {
    return "ready";
  }

  if (["42P01", "42703", "PGRST204", "PGRST205"].includes(error.code ?? "")) {
    return "schema_missing";
  }

  if (error.code === "42501") {
    return "permission_denied";
  }

  return "query_error";
}

export function commerceMappingStatusMessage(status: CommerceMappingSchemaStatus) {
  switch (status) {
    case "schema_missing":
      return "Migration 049 has not been applied to this environment yet. No mapping state has been assumed.";
    case "permission_denied":
      return "Mapping records are unavailable for this account. No source or target state has been assumed.";
    case "query_error":
      return "Mapping readiness could not be loaded. No mapping state has been assumed.";
    case "ready":
    default:
      return "Mapping data is available.";
  }
}

function currentMappingForItem(mappings: CommerceMappingRow[]) {
  return [...mappings].sort((a, b) => {
    const statusDifference =
      currentStatusPriority[b.status] - currentStatusPriority[a.status];
    if (statusDifference !== 0) {
      return statusDifference;
    }
    return b.version_number - a.version_number;
  })[0] ?? null;
}

export function buildCommerceCatalogueMappingItems(
  catalogueItems: CommerceCatalogueItemRow[],
  mappings: CommerceMappingRow[],
  outputs: CommerceMappingOutputRow[],
  internalItems: CommerceMappingInternalItem[],
) {
  const internalItemsById = new Map(internalItems.map((item) => [item.id, item]));
  const mappingsByCatalogueItem = new Map<string, CommerceMappingRow[]>();
  const outputsByMapping = new Map<string, CommerceMappingOutputRow[]>();

  for (const mapping of mappings) {
    const existing = mappingsByCatalogueItem.get(mapping.external_catalogue_item_id) ?? [];
    existing.push(mapping);
    mappingsByCatalogueItem.set(mapping.external_catalogue_item_id, existing);
  }

  for (const output of outputs) {
    const existing = outputsByMapping.get(output.mapping_id) ?? [];
    existing.push(output);
    outputsByMapping.set(output.mapping_id, existing);
  }

  return catalogueItems.map<CommerceCatalogueMappingItem>((item) => {
    const itemMappings = mappingsByCatalogueItem.get(item.id) ?? [];
    const currentMapping = currentMappingForItem(itemMappings);
    const currentOutputs = currentMapping
      ? [...(outputsByMapping.get(currentMapping.id) ?? [])].sort(
          (a, b) => a.sequence - b.sequence,
        )
      : [];
    const hasInvalidTarget = currentOutputs.some((output) => {
      const internalItem = internalItemsById.get(output.internal_item_id);
      return (
        !internalItem ||
        internalItem.status !== "active" ||
        internalItem.archivedAt !== null ||
        internalItem.baseUnit.toLowerCase() !== output.output_uom.toLowerCase()
      );
    });

    let resolvedState: CommerceCatalogueMappingItem["resolvedState"] = "unresolved";

    if (item.archived_at) {
      resolvedState = "archived";
    } else if (currentMapping?.status === "approved" && hasInvalidTarget) {
      resolvedState = "error";
    } else if (
      currentMapping?.status === "approved" &&
      currentMapping.mapping_kind === "exclusion"
    ) {
      resolvedState = "excluded";
    } else if (currentMapping?.status === "approved") {
      resolvedState = "approved";
    } else if (
      currentMapping?.status === "draft" ||
      currentMapping?.status === "pending_review"
    ) {
      resolvedState = "pending";
    }

    return {
      ...item,
      resolvedState,
      currentMapping,
      currentOutputs,
      hasInvalidTarget,
    };
  });
}

export function summariseCommerceMappingReadiness(
  items: CommerceCatalogueMappingItem[],
): CommerceMappingReadinessSummary {
  const counts = {
    activeCount: items.filter((item) => !item.archived_at).length,
    unresolvedCount: items.filter((item) => item.resolvedState === "unresolved").length,
    pendingCount: items.filter((item) => item.resolvedState === "pending").length,
    approvedCount: items.filter((item) => item.resolvedState === "approved").length,
    excludedCount: items.filter((item) => item.resolvedState === "excluded").length,
    errorCount: items.filter((item) => item.resolvedState === "error").length,
    archivedCount: items.filter((item) => item.resolvedState === "archived").length,
  };

  if (counts.activeCount === 0) {
    return { ...counts, readiness: "not_started" };
  }

  if (counts.errorCount > 0) {
    return { ...counts, readiness: "blocked" };
  }

  if (counts.approvedCount + counts.excludedCount === counts.activeCount) {
    return { ...counts, readiness: "ready" };
  }

  if (counts.pendingCount > 0 || counts.approvedCount > 0 || counts.excludedCount > 0) {
    return { ...counts, readiness: "in_progress" };
  }

  return { ...counts, readiness: "not_started" };
}

export function filterCommerceMappingItems(
  items: CommerceCatalogueMappingItem[],
  filter: CommerceMappingFilter,
  query: string,
) {
  const normalisedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    const matchesFilter = filter === "all" || item.resolvedState === filter;
    const matchesQuery =
      normalisedQuery.length === 0 ||
      item.source_product_title.toLowerCase().includes(normalisedQuery) ||
      (item.source_variant_title ?? "").toLowerCase().includes(normalisedQuery) ||
      (item.source_sku ?? "").toLowerCase().includes(normalisedQuery) ||
      item.provider_product_id.toLowerCase().includes(normalisedQuery) ||
      item.provider_variant_id.toLowerCase().includes(normalisedQuery);

    return matchesFilter && matchesQuery;
  });
}
